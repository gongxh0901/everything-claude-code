#!/usr/bin/env node
/**
 * 验证技能目录是否包含必需结构的 SKILL.md
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../skills');

function validateSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log('未找到 skills 目录，跳过验证');
    process.exit(0);
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  let hasErrors = false;
  let validCount = 0;

  for (const dir of dirs) {
    const skillMd = path.join(SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      console.error(`错误: ${dir}/ - 缺少 SKILL.md`);
      hasErrors = true;
      continue;
    }

    const content = fs.readFileSync(skillMd, 'utf-8');
    if (content.trim().length === 0) {
      console.error(`错误: ${dir}/SKILL.md - 文件为空`);
      hasErrors = true;
      continue;
    }

    validCount++;
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`已验证 ${validCount} 个技能目录`);
}

validateSkills();
