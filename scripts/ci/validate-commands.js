#!/usr/bin/env node
/**
 * 验证命令 markdown 文件非空且可读
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '../../commands');

function validateCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) {
    console.log('未找到 commands 目录，跳过验证');
    process.exit(0);
  }

  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(COMMANDS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 验证文件非空且为有效的 markdown
    if (content.trim().length === 0) {
      console.error(`错误: ${file} - 命令文件为空`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`已验证 ${files.length} 个命令文件`);
}

validateCommands();
