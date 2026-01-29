#!/usr/bin/env node
/**
 * 验证规则 markdown 文件
 */

const fs = require('fs');
const path = require('path');

const RULES_DIR = path.join(__dirname, '../../rules');

function validateRules() {
  if (!fs.existsSync(RULES_DIR)) {
    console.log('未找到 rules 目录，跳过验证');
    process.exit(0);
  }

  const files = fs.readdirSync(RULES_DIR, { recursive: true })
    .filter(f => f.endsWith('.md'));
  let hasErrors = false;
  let validatedCount = 0;

  for (const file of files) {
    const filePath = path.join(RULES_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.trim().length === 0) {
        console.error(`错误: ${file} - 规则文件为空`);
        hasErrors = true;
        continue;
      }
      validatedCount++;
    } catch (err) {
      console.error(`错误: ${file} - ${err.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`已验证 ${validatedCount} 个规则文件`);
}

validateRules();
