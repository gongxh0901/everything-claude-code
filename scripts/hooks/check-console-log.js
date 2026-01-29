#!/usr/bin/env node

/**
 * Stop 钩子：检查修改文件中的 console.log 语句
 *
 * 此钩子在每次响应后运行，检查修改的
 * JavaScript/TypeScript 文件是否包含 console.log 语句。
 * 它提供警告以帮助开发者记住在提交前移除调试语句。
 */

const { execSync } = require('child_process');
const fs = require('fs');

let data = '';

// 读取标准输入
process.stdin.on('data', chunk => {
  data += chunk;
});

process.stdin.on('end', () => {
  try {
    // 检查是否在 git 仓库中
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch {
      // 不在 git 仓库中，直接传递数据
      console.log(data);
      process.exit(0);
    }

    // 获取修改的文件列表
    const files = execSync('git diff --name-only HEAD', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
      .split('\n')
      .filter(f => /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));

    let hasConsole = false;

    // 检查每个文件是否包含 console.log
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console.log')) {
        console.error(`[钩子] 警告: 在 ${file} 中发现 console.log`);
        hasConsole = true;
      }
    }

    if (hasConsole) {
      console.error('[钩子] 请在提交前移除 console.log 语句');
    }
  } catch (error) {
    // 静默忽略错误（git 可能不可用等）
    console.error('[钩子] 检查 console.log 时出错:', error.message);
  }

  // 始终输出原始数据
  console.log(data);
});
