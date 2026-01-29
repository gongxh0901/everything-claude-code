/**
 * 包管理器检测和选择
 * 自动检测首选的包管理器或让用户选择
 *
 * 支持：npm、pnpm、yarn、bun
 */

const fs = require('fs');
const path = require('path');
const { commandExists, getClaudeDir, readFile, writeFile } = require('./utils');

// 包管理器定义
const PACKAGE_MANAGERS = {
  npm: {
    name: 'npm',
    lockFile: 'package-lock.json',
    installCmd: 'npm install',
    runCmd: 'npm run',
    execCmd: 'npx',
    testCmd: 'npm test',
    buildCmd: 'npm run build',
    devCmd: 'npm run dev'
  },
  pnpm: {
    name: 'pnpm',
    lockFile: 'pnpm-lock.yaml',
    installCmd: 'pnpm install',
    runCmd: 'pnpm',
    execCmd: 'pnpm dlx',
    testCmd: 'pnpm test',
    buildCmd: 'pnpm build',
    devCmd: 'pnpm dev'
  },
  yarn: {
    name: 'yarn',
    lockFile: 'yarn.lock',
    installCmd: 'yarn',
    runCmd: 'yarn',
    execCmd: 'yarn dlx',
    testCmd: 'yarn test',
    buildCmd: 'yarn build',
    devCmd: 'yarn dev'
  },
  bun: {
    name: 'bun',
    lockFile: 'bun.lockb',
    installCmd: 'bun install',
    runCmd: 'bun run',
    execCmd: 'bunx',
    testCmd: 'bun test',
    buildCmd: 'bun run build',
    devCmd: 'bun run dev'
  }
};

// 检测优先级顺序
const DETECTION_PRIORITY = ['pnpm', 'bun', 'yarn', 'npm'];

// 配置文件路径
function getConfigPath() {
  return path.join(getClaudeDir(), 'package-manager.json');
}

/**
 * 加载保存的包管理器配置
 */
function loadConfig() {
  const configPath = getConfigPath();
  const content = readFile(configPath);

  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * 保存包管理器配置
 */
function saveConfig(config) {
  const configPath = getConfigPath();
  writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * 从项目目录中的锁文件检测包管理器
 */
function detectFromLockFile(projectDir = process.cwd()) {
  for (const pmName of DETECTION_PRIORITY) {
    const pm = PACKAGE_MANAGERS[pmName];
    const lockFilePath = path.join(projectDir, pm.lockFile);

    if (fs.existsSync(lockFilePath)) {
      return pmName;
    }
  }
  return null;
}

/**
 * 从 package.json 的 packageManager 字段检测包管理器
 */
function detectFromPackageJson(projectDir = process.cwd()) {
  const packageJsonPath = path.join(projectDir, 'package.json');
  const content = readFile(packageJsonPath);

  if (content) {
    try {
      const pkg = JSON.parse(content);
      if (pkg.packageManager) {
        // 格式："pnpm@8.6.0" 或只是 "pnpm"
        const pmName = pkg.packageManager.split('@')[0];
        if (PACKAGE_MANAGERS[pmName]) {
          return pmName;
        }
      }
    } catch {
      // 无效的 package.json
    }
  }
  return null;
}

/**
 * 获取可用的包管理器（系统中已安装的）
 */
function getAvailablePackageManagers() {
  const available = [];

  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    if (commandExists(pmName)) {
      available.push(pmName);
    }
  }

  return available;
}

/**
 * 获取当前项目使用的包管理器
 *
 * 检测优先级：
 * 1. 环境变量 CLAUDE_PACKAGE_MANAGER
 * 2. 项目特定配置（在 .claude/package-manager.json 中）
 * 3. package.json 的 packageManager 字段
 * 4. 锁文件检测
 * 5. 全局用户偏好（在 ~/.claude/package-manager.json 中）
 * 6. 第一个可用的包管理器（按优先级）
 *
 * @param {object} options - { projectDir, fallbackOrder }
 * @returns {object} - { name, config, source }
 */
function getPackageManager(options = {}) {
  const { projectDir = process.cwd(), fallbackOrder = DETECTION_PRIORITY } = options;

  // 1. 检查环境变量
  const envPm = process.env.CLAUDE_PACKAGE_MANAGER;
  if (envPm && PACKAGE_MANAGERS[envPm]) {
    return {
      name: envPm,
      config: PACKAGE_MANAGERS[envPm],
      source: 'environment'
    };
  }

  // 2. 检查项目特定配置
  const projectConfigPath = path.join(projectDir, '.claude', 'package-manager.json');
  const projectConfig = readFile(projectConfigPath);
  if (projectConfig) {
    try {
      const config = JSON.parse(projectConfig);
      if (config.packageManager && PACKAGE_MANAGERS[config.packageManager]) {
        return {
          name: config.packageManager,
          config: PACKAGE_MANAGERS[config.packageManager],
          source: 'project-config'
        };
      }
    } catch {
      // 无效的配置
    }
  }

  // 3. 检查 package.json 的 packageManager 字段
  const fromPackageJson = detectFromPackageJson(projectDir);
  if (fromPackageJson) {
    return {
      name: fromPackageJson,
      config: PACKAGE_MANAGERS[fromPackageJson],
      source: 'package.json'
    };
  }

  // 4. 检查锁文件
  const fromLockFile = detectFromLockFile(projectDir);
  if (fromLockFile) {
    return {
      name: fromLockFile,
      config: PACKAGE_MANAGERS[fromLockFile],
      source: 'lock-file'
    };
  }

  // 5. 检查全局用户偏好
  const globalConfig = loadConfig();
  if (globalConfig && globalConfig.packageManager && PACKAGE_MANAGERS[globalConfig.packageManager]) {
    return {
      name: globalConfig.packageManager,
      config: PACKAGE_MANAGERS[globalConfig.packageManager],
      source: 'global-config'
    };
  }

  // 6. 使用第一个可用的包管理器
  const available = getAvailablePackageManagers();
  for (const pmName of fallbackOrder) {
    if (available.includes(pmName)) {
      return {
        name: pmName,
        config: PACKAGE_MANAGERS[pmName],
        source: 'fallback'
      };
    }
  }

  // 默认使用 npm（Node.js 始终附带）
  return {
    name: 'npm',
    config: PACKAGE_MANAGERS.npm,
    source: 'default'
  };
}

/**
 * 设置用户首选的包管理器（全局）
 */
function setPreferredPackageManager(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`未知的包管理器: ${pmName}`);
  }

  const config = loadConfig() || {};
  config.packageManager = pmName;
  config.setAt = new Date().toISOString();
  saveConfig(config);

  return config;
}

/**
 * 设置项目首选的包管理器
 */
function setProjectPackageManager(pmName, projectDir = process.cwd()) {
  if (!PACKAGE_MANAGERS[pmName]) {
    throw new Error(`未知的包管理器: ${pmName}`);
  }

  const configDir = path.join(projectDir, '.claude');
  const configPath = path.join(configDir, 'package-manager.json');

  const config = {
    packageManager: pmName,
    setAt: new Date().toISOString()
  };

  writeFile(configPath, JSON.stringify(config, null, 2));
  return config;
}

/**
 * 获取运行脚本的命令
 * @param {string} script - 脚本名称（例如 "dev"、"build"、"test"）
 * @param {object} options - { projectDir }
 */
function getRunCommand(script, options = {}) {
  const pm = getPackageManager(options);

  switch (script) {
    case 'install':
      return pm.config.installCmd;
    case 'test':
      return pm.config.testCmd;
    case 'build':
      return pm.config.buildCmd;
    case 'dev':
      return pm.config.devCmd;
    default:
      return `${pm.config.runCmd} ${script}`;
  }
}

/**
 * 获取执行包二进制文件的命令
 * @param {string} binary - 二进制文件名称（例如 "prettier"、"eslint"）
 * @param {string} args - 要传递的参数
 */
function getExecCommand(binary, args = '', options = {}) {
  const pm = getPackageManager(options);
  return `${pm.config.execCmd} ${binary}${args ? ' ' + args : ''}`;
}

/**
 * 包管理器选择的交互式提示
 * 返回要向用户显示的消息
 */
function getSelectionPrompt() {
  const available = getAvailablePackageManagers();
  const current = getPackageManager();

  let message = '[包管理器] 可用的包管理器:\n';

  for (const pmName of available) {
    const indicator = pmName === current.name ? ' (当前)' : '';
    message += `  - ${pmName}${indicator}\n`;
  }

  message += '\n设置首选包管理器的方法:\n';
  message += '  - 全局: 设置 CLAUDE_PACKAGE_MANAGER 环境变量\n';
  message += '  - 或添加到 ~/.claude/package-manager.json: {"packageManager": "pnpm"}\n';
  message += '  - 或添加到 package.json: {"packageManager": "pnpm@8"}\n';

  return message;
}

/**
 * 生成匹配所有包管理器命令的正则表达式模式
 * @param {string} action - 动作模式（例如 "run dev"、"install"、"test"）
 */
function getCommandPattern(action) {
  const patterns = [];

  if (action === 'dev') {
    patterns.push(
      'npm run dev',
      'pnpm( run)? dev',
      'yarn dev',
      'bun run dev'
    );
  } else if (action === 'install') {
    patterns.push(
      'npm install',
      'pnpm install',
      'yarn( install)?',
      'bun install'
    );
  } else if (action === 'test') {
    patterns.push(
      'npm test',
      'pnpm test',
      'yarn test',
      'bun test'
    );
  } else if (action === 'build') {
    patterns.push(
      'npm run build',
      'pnpm( run)? build',
      'yarn build',
      'bun run build'
    );
  } else {
    // 通用运行命令
    patterns.push(
      `npm run ${action}`,
      `pnpm( run)? ${action}`,
      `yarn ${action}`,
      `bun run ${action}`
    );
  }

  return `(${patterns.join('|')})`;
}

module.exports = {
  PACKAGE_MANAGERS,
  DETECTION_PRIORITY,
  getPackageManager,
  setPreferredPackageManager,
  setProjectPackageManager,
  getAvailablePackageManagers,
  detectFromLockFile,
  detectFromPackageJson,
  getRunCommand,
  getExecCommand,
  getSelectionPrompt,
  getCommandPattern
};
