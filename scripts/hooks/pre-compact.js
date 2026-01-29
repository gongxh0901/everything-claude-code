#!/usr/bin/env node
/**
 * PreCompact 钩子 - 在上下文压缩前保存状态
 *
 * 跨平台支持 (Windows, macOS, Linux)
 *
 * 在 Claude 压缩上下文之前运行，让你有机会
 * 保留可能在摘要过程中丢失的重要状态。
 */

const path = require('path');
const {
  getSessionsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);

  // 记录带时间戳的压缩事件
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] 触发上下文压缩\n`);

  // 如果存在活动的会话文件，记录压缩事件
  const sessions = findFiles(sessionsDir, '*.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[${timeStr} 发生压缩]** - 上下文已被摘要\n`);
  }

  log('[PreCompact] 压缩前状态已保存');
  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] 错误:', err.message);
  process.exit(0);
});
