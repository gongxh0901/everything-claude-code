#!/usr/bin/env node
/**
 * 策略性压缩建议器
 *
 * 跨平台支持 (Windows, macOS, Linux)
 *
 * 在 PreToolUse 或定期运行，在逻辑间隔点建议手动压缩
 *
 * 为什么选择手动而不是自动压缩：
 * - 自动压缩发生在任意时间点，通常在任务中间
 * - 策略性压缩可以在逻辑阶段之间保留上下文
 * - 在探索后、执行前进行压缩
 * - 在完成一个里程碑后、开始下一个之前进行压缩
 */

const path = require('path');
const {
  getTempDir,
  readFile,
  writeFile,
  log
} = require('../lib/utils');

async function main() {
  // 跟踪工具调用计数（在临时文件中递增）
  // 使用基于父进程 PID 或环境变量中会话 ID 的会话特定计数器文件
  const sessionId = process.env.CLAUDE_SESSION_ID || process.ppid || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const threshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);

  let count = 1;

  // 读取现有计数或从 1 开始
  const existing = readFile(counterFile);
  if (existing) {
    count = parseInt(existing.trim(), 10) + 1;
  }

  // 保存更新后的计数
  writeFile(counterFile, String(count));

  // 达到阈值后建议压缩
  if (count === threshold) {
    log(`[策略压缩] 已达到 ${threshold} 次工具调用 - 如果正在切换阶段，请考虑使用 /compact`);
  }

  // 超过阈值后定期建议
  if (count > threshold && count % 25 === 0) {
    log(`[策略压缩] ${count} 次工具调用 - 如果上下文过时，这是使用 /compact 的好时机`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[策略压缩] 错误:', err.message);
  process.exit(0);
});
