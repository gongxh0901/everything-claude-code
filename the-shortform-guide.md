# Everything Claude Code 快速指南

![Header: Anthropic Hackathon Winner - Tips & Tricks for Claude Code](./assets/images/shortform/00-header.png)

---

**我从 2 月的实验性推出阶段就开始热衷使用 Claude Code,并与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起赢得了 Anthropic x Forum Ventures 黑客马拉松,构建了 [zenith.chat](https://zenith.chat) - 完全使用 Claude Code。**

这是我经过 10 个月日常使用后的完整设置：skills、hooks、subagents、MCPs、plugins,以及真正有效的东西。

---

## Skills 和 Commands

Skills 的运作类似于 rules,但限制在特定的范围和工作流中。当你需要执行特定工作流时,它们是提示的简写。

在使用 Opus 4.5 进行长时间编码后,想要清理死代码和零散的 .md 文件？运行 `/refactor-clean`。需要测试？`/tdd`、`/e2e`、`/test-coverage`。Skills 还可以包含 codemaps - 一种让 Claude 快速导航代码库而不消耗上下文的方式。

![Terminal showing chained commands](./assets/images/shortform/02-chaining-commands.jpeg)
*链式命令*

Commands 是通过斜杠命令执行的 skills。它们有重叠但存储方式不同：

- **Skills**: `~/.claude/skills/` - 更广泛的工作流定义
- **Commands**: `~/.claude/commands/` - 快速可执行的提示

```bash
# Skill 结构示例
~/.claude/skills/
  pmx-guidelines.md      # 项目特定模式
  coding-standards.md    # 语言最佳实践
  tdd-workflow/          # 包含 README.md 的多文件 skill
  security-review/       # 基于检查清单的 skill
```

---

## Hooks

Hooks 是基于触发器的自动化,在特定事件时触发。与 skills 不同,它们限制在工具调用和生命周期事件中。

**Hook 类型：**

1. **PreToolUse** - 工具执行前（验证、提醒）
2. **PostToolUse** - 工具完成后（格式化、反馈循环）
3. **UserPromptSubmit** - 发送消息时
4. **Stop** - Claude 响应完成时
5. **PreCompact** - 上下文压缩前
6. **Notification** - 权限请求

**示例：长时间运行命令前的 tmux 提醒**

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

![PostToolUse hook feedback](./assets/images/shortform/03-posttooluse-hook.png)
*在 Claude Code 中运行 PostToolUse hook 时得到的反馈示例*

**专业提示：** 使用 `hookify` 插件以对话方式创建钩子,而不是手动编写 JSON。运行 `/hookify` 并描述你想要的功能。

---

## Subagents

Subagents 是你的编排器（主 Claude）可以委派任务的进程,具有有限的范围。它们可以在后台或前台运行,为主代理释放上下文。

Subagents 与 skills 配合良好 - 能够执行你技能子集的 subagent 可以被委派任务并自主使用这些技能。它们还可以使用特定的工具权限进行沙箱化。

```bash
# Subagent 结构示例
~/.claude/agents/
  planner.md           # 功能实现规划
  architect.md         # 系统设计决策
  tdd-guide.md         # 测试驱动开发
  code-reviewer.md     # 质量/安全审查
  security-reviewer.md # 漏洞分析
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

为每个 subagent 配置允许的工具、MCP 和权限以实现正确的范围。

---

## Rules 和 Memory

你的 `.rules` 文件夹包含 `.md` 文件,其中包含 Claude 应始终遵循的最佳实践。两种方法：

1. **单个 CLAUDE.md** - 所有内容在一个文件中（用户或项目级别）
2. **Rules 文件夹** - 按关注点分组的模块化 `.md` 文件

```bash
~/.claude/rules/
  security.md      # 禁止硬编码秘密,验证输入
  coding-style.md  # 不可变性,文件组织
  testing.md       # TDD 工作流,80% 覆盖率
  git-workflow.md  # 提交格式,PR 流程
  agents.md        # 何时委派给 subagents
  performance.md   # 模型选择,上下文管理
```

**规则示例：**

- 代码库中不使用表情符号
- 前端避免紫色色调
- 部署前始终测试代码
- 优先选择模块化代码而非超大文件
- 永远不提交 console.logs

---

## MCPs (Model Context Protocol)

MCPs 将 Claude 直接连接到外部服务。不是 API 的替代品 - 它是围绕它们的提示驱动包装器,允许在导航信息时具有更大的灵活性。

**示例：** Supabase MCP 让 Claude 提取特定数据,直接在上游运行 SQL 而无需复制粘贴。数据库、部署平台等也是如此。

![Supabase MCP listing tables](./assets/images/shortform/04-supabase-mcp.jpeg)
*Supabase MCP 列出 public schema 中的表的示例*

**Chrome in Claude：** 是一个内置的插件 MCP,让 Claude 自主控制你的浏览器 - 点击查看事物如何工作。

**关键：上下文窗口管理**

对 MCPs 要挑剔。我在用户配置中保留所有 MCP,但**禁用所有未使用的**。导航到 `/plugins` 并向下滚动或运行 `/mcp`。

![/plugins interface](./assets/images/shortform/05-plugins-interface.jpeg)
*使用 /plugins 导航到 MCPs 以查看当前安装的 MCPs 及其状态*

如果启用太多工具,你的 200k 上下文窗口在压缩前可能只有 70k。性能会显著下降。

**经验法则：** 在配置中有 20-30 个 MCP,但保持启用少于 10 个 / 活动工具少于 80 个。

```bash
# Check enabled MCPs
/mcp

# Disable unused ones in ~/.claude.json under projects.disabledMcpServers
```

---

## Plugins

Plugins 打包工具以便于安装,而不是繁琐的手动设置。一个插件可以是 skill + MCP 的组合,或者是钩子/工具的捆绑。

**安装插件：**

```bash
# 添加市场
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# 打开 Claude,运行 /plugins,找到新市场,从那里安装
```

![Marketplaces tab showing mgrep](./assets/images/shortform/06-marketplaces-mgrep.jpeg)
*显示新安装的 Mixedbread-Grep 市场*

**LSP Plugins** 特别有用,如果你经常在编辑器外运行 Claude Code。Language Server Protocol 为 Claude 提供实时类型检查、跳转到定义和智能补全,无需打开 IDE。

```bash
# 已启用插件示例
typescript-lsp@claude-plugins-official  # TypeScript 智能提示
pyright-lsp@claude-plugins-official     # Python 类型检查
hookify@claude-plugins-official         # 对话式创建钩子
mgrep@Mixedbread-Grep                   # 比 ripgrep 更好的搜索
```

与 MCPs 相同的警告 - 注意你的上下文窗口。

---

## 技巧和窍门

### 键盘快捷键

- `Ctrl+U` - 删除整行（比疯狂按退格键更快）
- `!` - 快速 bash 命令前缀
- `@` - 搜索文件
- `/` - 启动斜杠命令
- `Shift+Enter` - 多行输入
- `Tab` - 切换思考显示
- `Esc Esc` - 中断 Claude / 恢复代码

### 并行工作流

- **Fork** (`/fork`) - Fork 对话以并行执行非重叠任务,而不是排队发送消息
- **Git Worktrees** - 用于重叠的并行 Claude 而不会产生冲突。每个 worktree 都是独立的检出

```bash
git worktree add ../feature-branch feature-branch
# 现在在每个 worktree 中运行单独的 Claude 实例
```

### 长时间运行命令使用 tmux

流式传输和观察 Claude 运行的日志/bash 进程：

https://github.com/user-attachments/assets/shortform/07-tmux-video.mp4

```bash
tmux new -s dev
# Claude 在这里运行命令,你可以分离和重新连接
tmux attach -t dev
```

### mgrep > grep

`mgrep` 是对 ripgrep/grep 的重大改进。通过插件市场安装,然后使用 `/mgrep` 技能。支持本地搜索和网络搜索。

```bash
mgrep "function handleSubmit"  # 本地搜索
mgrep --web "Next.js 15 app router changes"  # 网络搜索
```

### 其他有用的命令

- `/rewind` - 返回到以前的状态
- `/statusline` - 使用分支、上下文 %、待办事项自定义
- `/checkpoints` - 文件级撤销点
- `/compact` - 手动触发上下文压缩

### GitHub Actions CI/CD

在 PR 上使用 GitHub Actions 设置代码审查。配置后,Claude 可以自动审查 PR。

![Claude bot approving a PR](./assets/images/shortform/08-github-pr-review.jpeg)
*Claude 批准 bug 修复 PR*

### 沙箱化

对于风险操作使用沙箱模式 - Claude 在受限环境中运行,不会影响你的实际系统。

---

## 关于编辑器

你的编辑器选择会显著影响 Claude Code 工作流。虽然 Claude Code 可以从任何终端工作,但与功能强大的编辑器配对可以解锁实时文件跟踪、快速导航和集成命令执行。

### Zed（我的偏好）

我使用 [Zed](https://zed.dev) - 用 Rust 编写,因此真正快速。立即打开,处理大型代码库而不出问题,几乎不占用系统资源。

**为什么 Zed + Claude Code 是很好的组合：**

- **速度** - 基于 Rust 的性能意味着当 Claude 快速编辑文件时没有延迟。你的编辑器跟得上
- **Agent Panel 集成** - Zed 的 Claude 集成让你在 Claude 编辑时实时跟踪文件更改。在不离开编辑器的情况下在 Claude 引用的文件之间跳转
- **CMD+Shift+R 命令面板** - 在可搜索的 UI 中快速访问所有自定义斜杠命令、调试器、构建脚本
- **最小资源使用** - 在重度操作期间不会与 Claude 竞争 RAM/CPU。运行 Opus 时很重要
- **Vim 模式** - 如果你喜欢,完整的 vim 键绑定

![Zed Editor with custom commands](./assets/images/shortform/09-zed-editor.jpeg)
*Zed 编辑器使用 CMD+Shift+R 的自定义命令下拉菜单。右下角的靶心显示了跟随模式。*

**编辑器无关的提示：**

1. **分屏** - 一侧是带有 Claude Code 的终端,另一侧是编辑器
2. **Ctrl + G** - 在 Zed 中快速打开 Claude 当前正在处理的文件
3. **自动保存** - 启用自动保存,以便 Claude 的文件读取始终是最新的
4. **Git 集成** - 在提交之前使用编辑器的 git 功能审查 Claude 的更改
5. **文件监视器** - 大多数编辑器会自动重新加载更改的文件,验证这是否已启用

### VSCode / Cursor

这也是一个可行的选择,与 Claude Code 配合良好。你可以在终端格式中使用它,使用 `\ide` 启用 LSP 功能与编辑器自动同步（现在与插件有些冗余）。或者你可以选择扩展,它与编辑器更集成并具有匹配的 UI。

![VS Code Claude Code Extension](./assets/images/shortform/10-vscode-extension.jpeg)
*VS Code 扩展为 Claude Code 提供了原生图形界面,直接集成到你的 IDE 中。*

---

## 我的设置

### Plugins

**已安装：**（我通常一次只启用其中 4-5 个）

```markdown
ralph-wiggum@claude-code-plugins       # 循环自动化
frontend-design@claude-code-plugins    # UI/UX 模式
commit-commands@claude-code-plugins    # Git 工作流
security-guidance@claude-code-plugins  # 安全检查
pr-review-toolkit@claude-code-plugins  # PR 自动化
typescript-lsp@claude-plugins-official # TS 智能提示
hookify@claude-plugins-official        # 钩子创建
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official       # 实时文档
pyright-lsp@claude-plugins-official    # Python 类型
mgrep@Mixedbread-Grep                  # 更好的搜索
```

### MCP Servers

**已配置（用户级别）：**

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": {
    "type": "http",
    "url": "https://bindings.mcp.cloudflare.com/mcp"
  },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

关键是 - 我配置了 14 个 MCP,但每个项目只启用约 5-6 个。保持上下文窗口健康。

### 关键 Hooks

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

### 自定义状态栏

显示用户、目录、带有脏指示器的 git 分支、剩余上下文 %、模型、时间和待办事项计数：

![Custom status line](./assets/images/shortform/11-statusline.jpeg)
*我 Mac 根目录中的状态栏示例*

```
affoon:~ ctx:65% Opus 4.5 19:52
▌▌ plan mode on (shift+tab to cycle)
```

### Rules 结构

```
~/.claude/rules/
  security.md      # 强制安全检查
  coding-style.md  # 不可变性,文件大小限制
  testing.md       # TDD,80% 覆盖率
  git-workflow.md  # 约定式提交
  agents.md        # Subagent 委派规则
  patterns.md      # API 响应格式
  performance.md   # 模型选择（Haiku vs Sonnet vs Opus）
  hooks.md         # Hook 文档
```

### Subagents

```
~/.claude/agents/
  planner.md           # 分解功能
  architect.md         # 系统设计
  tdd-guide.md         # 先写测试
  code-reviewer.md     # 质量审查
  security-reviewer.md # 漏洞扫描
  build-error-resolver.md
  e2e-runner.md        # Playwright 测试
  refactor-cleaner.md  # 清理死代码
  doc-updater.md       # 保持文档同步
```

---

## 关键要点

1. **不要过度复杂化** - 将配置视为微调,而不是架构
2. **上下文窗口很宝贵** - 禁用未使用的 MCP 和插件
3. **并行执行** - fork 对话,使用 git worktrees
4. **自动化重复的工作** - 用于格式化、linting、提醒的钩子
5. **限定你的 subagents** - 有限的工具 = 专注的执行

---

## 参考资料

- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [Memory System](https://code.claude.com/docs/en/memory)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [MCP Overview](https://code.claude.com/docs/en/mcp-overview)

---

**注意：** 这是详细信息的子集。查看[深度指南](./the-longform-guide.md)以了解高级模式。

---

*在纽约与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起构建 [zenith.chat](https://zenith.chat),赢得了 Anthropic x Forum Ventures 黑客马拉松*
