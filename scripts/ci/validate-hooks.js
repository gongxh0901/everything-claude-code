#!/usr/bin/env node
/**
 * 验证 hooks.json 的结构
 */

const fs = require('fs');
const path = require('path');

const HOOKS_FILE = path.join(__dirname, '../../hooks/hooks.json');
const VALID_EVENTS = ['PreToolUse', 'PostToolUse', 'PreCompact', 'SessionStart', 'SessionEnd', 'Stop', 'Notification', 'SubagentStop'];

function validateHooks() {
  if (!fs.existsSync(HOOKS_FILE)) {
    console.log('未找到 hooks.json，跳过验证');
    process.exit(0);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(HOOKS_FILE, 'utf-8'));
  } catch (e) {
    console.error(`错误: hooks.json 中的 JSON 无效: ${e.message}`);
    process.exit(1);
  }

  // 支持对象格式 { hooks: {...} } 和数组格式
  const hooks = data.hooks || data;
  let hasErrors = false;
  let totalMatchers = 0;

  if (typeof hooks === 'object' && !Array.isArray(hooks)) {
    // 对象格式: { EventType: [matchers] }
    for (const [eventType, matchers] of Object.entries(hooks)) {
      if (!VALID_EVENTS.includes(eventType)) {
        console.error(`错误: 无效的事件类型: ${eventType}`);
        hasErrors = true;
        continue;
      }

      if (!Array.isArray(matchers)) {
        console.error(`错误: ${eventType} 必须是数组`);
        hasErrors = true;
        continue;
      }

      for (let i = 0; i < matchers.length; i++) {
        const matcher = matchers[i];
        if (typeof matcher !== 'object' || matcher === null) {
          console.error(`错误: ${eventType}[${i}] 不是对象`);
          hasErrors = true;
          continue;
        }
        if (!matcher.matcher) {
          console.error(`错误: ${eventType}[${i}] 缺少 'matcher' 字段`);
          hasErrors = true;
        }
        if (!matcher.hooks || !Array.isArray(matcher.hooks)) {
          console.error(`错误: ${eventType}[${i}] 缺少 'hooks' 数组`);
          hasErrors = true;
        } else {
          // 验证每个钩子条目
          for (let j = 0; j < matcher.hooks.length; j++) {
            const hook = matcher.hooks[j];
            if (!hook.type || typeof hook.type !== 'string') {
              console.error(`错误: ${eventType}[${i}].hooks[${j}] 缺少或无效的 'type' 字段`);
              hasErrors = true;
            }
            if (!hook.command || (typeof hook.command !== 'string' && !Array.isArray(hook.command))) {
              console.error(`错误: ${eventType}[${i}].hooks[${j}] 缺少或无效的 'command' 字段`);
              hasErrors = true;
            }
          }
        }
        totalMatchers++;
      }
    }
  } else if (Array.isArray(hooks)) {
    // 数组格式（旧版）
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i];
      if (!hook.matcher) {
        console.error(`错误: 钩子 ${i} 缺少 'matcher' 字段`);
        hasErrors = true;
      }
      if (!hook.hooks || !Array.isArray(hook.hooks)) {
        console.error(`错误: 钩子 ${i} 缺少 'hooks' 数组`);
        hasErrors = true;
      } else {
        // 验证每个钩子条目
        for (let j = 0; j < hook.hooks.length; j++) {
          const h = hook.hooks[j];
          if (!h.type || typeof h.type !== 'string') {
            console.error(`错误: 钩子 ${i}.hooks[${j}] 缺少或无效的 'type' 字段`);
            hasErrors = true;
          }
          if (!h.command || (typeof h.command !== 'string' && !Array.isArray(h.command))) {
            console.error(`错误: 钩子 ${i}.hooks[${j}] 缺少或无效的 'command' 字段`);
            hasErrors = true;
          }
        }
      }
      totalMatchers++;
    }
  } else {
    console.error('错误: hooks.json 必须是对象或数组');
    process.exit(1);
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`已验证 ${totalMatchers} 个钩子匹配器`);
}

validateHooks();
