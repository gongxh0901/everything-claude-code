#!/usr/bin/env node
/**
 * Stop 钩子（会话结束）- 在会话结束时持久化学习内容
 *
 * 跨平台支持 (Windows, macOS, Linux)
 *
 * 在 Claude 会话结束时运行。创建/更新会话日志文件，
 * 带有时间戳以进行连续性跟踪。
 */

const path = require('path');
const fs = require('fs');
const {
  getSessionsDir,
  getDateString,
  getTimeString,
  getSessionIdShort,
  ensureDir,
  writeFile,
  replaceInFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const today = getDateString();
  const shortId = getSessionIdShort();
  // 在文件名中包含会话 ID 以实现每个会话的唯一跟踪
  const sessionFile = path.join(sessionsDir, `${today}-${shortId}-session.tmp`);

  ensureDir(sessionsDir);

  const currentTime = getTimeString();

  // 如果今天存在会话文件，更新结束时间
  if (fs.existsSync(sessionFile)) {
    const success = replaceInFile(
      sessionFile,
      /\*\*Last Updated:\*\*.*/,
      `**Last Updated:** ${currentTime}`
    );

    if (success) {
      log(`[会话结束] 已更新会话文件: ${sessionFile}`);
    }
  } else {
    // 使用模板创建新的会话文件
    const template = `# 会话: ${today}
**日期:** ${today}
**开始时间:** ${currentTime}
**最后更新:** ${currentTime}

---

## 当前状态

[会话上下文放在这里]

### 已完成
- [ ]

### 进行中
- [ ]

### 下次会话备注
-

### 需要加载的上下文
\`\`\`
[相关文件]
\`\`\`
`;

    writeFile(sessionFile, template);
    log(`[会话结束] 已创建会话文件: ${sessionFile}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[会话结束] 错误:', err.message);
  process.exit(0);
});
