#!/usr/bin/env node
/**
 * SessionStart 钩子 - 在新会话开始时加载之前的上下文
 *
 * 跨平台支持 (Windows, macOS, Linux)
 *
 * 在新的 Claude 会话开始时运行。检查最近的会话文件
 * 并通知 Claude 有可用的上下文可以加载。
 */

const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // 确保目录存在
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // 检查最近的会话文件（最近 7 天）
  // 匹配旧格式 (YYYY-MM-DD-session.tmp) 和新格式 (YYYY-MM-DD-shortid-session.tmp)
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[会话开始] 找到 ${recentSessions.length} 个最近的会话`);
    log(`[会话开始] 最新: ${latest.path}`);
  }

  // 检查已学习的技能
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[会话开始] ${learnedDir} 中有 ${learnedSkills.length} 个已学习的技能可用`);
  }

  // 检测并报告包管理器
  const pm = getPackageManager();
  log(`[会话开始] 包管理器: ${pm.name} (${pm.source})`);

  // 如果包管理器是通过回退检测到的，显示选择提示
  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[会话开始] 未找到包管理器偏好设置。');
    log(getSelectionPrompt());
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[会话开始] 错误:', err.message);
  process.exit(0); // 出错时不阻塞
});
