# 安装指南

## 快速安装

### 方式 1：通过插件市场安装（推荐）

这是最简单的安装方式，可以直接获得所有命令、代理、技能和钩子：

```bash
# 添加插件市场（使用 everything-zh 分支）
/plugin marketplace add gongxh0901/everything-claude-code#everything-zh

# 安装插件
/plugin install everything-claude-code-zh@everything-claude-code-zh
```

### 方式 2：手动配置到 settings.json

直接在 `~/.claude/settings.json` 中添加配置：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code-zh": {
      "source": {
        "source": "github",
        "repo": "gongxh0901/everything-claude-code",
        "ref": "everything-zh"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code-zh@everything-claude-code-zh": true
  }
}
```

保存后重启 Claude Code 即可。

### 方式 3：手动安装（完全控制）

如果你想完全控制安装的内容：

```bash
# 1. 克隆仓库（everything-zh 分支）
git clone -b everything-zh https://github.com/gongxh0901/everything-claude-code.git
cd everything-claude-code

# 2. 复制代理（Agents）
cp agents/*.md ~/.claude/agents/

# 3. 复制规则（Rules）
# 注意：插件系统不支持分发 rules，必须手动安装
cp rules/*.md ~/.claude/rules/

# 4. 复制命令（Commands）
cp commands/*.md ~/.claude/commands/

# 5. 复制技能（Skills）
cp -r skills/* ~/.claude/skills/

# 6. 配置钩子（Hooks）
# 将 hooks/hooks.json 的内容合并到 ~/.claude/settings.json 中的 hooks 字段
```

## 安装规则（Rules）

⚠️ **重要**：Claude Code 插件系统不支持通过插件分发 `rules`，你需要手动安装。

### 用户级规则（适用于所有项目）

```bash
# 克隆仓库
git clone -b everything-zh https://github.com/gongxh0901/everything-claude-code.git

# 复制规则到用户配置目录
cp -r everything-claude-code/rules/* ~/.claude/rules/
```

### 项目级规则（仅适用于当前项目）

```bash
# 在项目根目录创建 .claude/rules 目录
mkdir -p .claude/rules

# 复制规则
cp -r everything-claude-code/rules/* .claude/rules/
```

## 配置 MCP 服务器

MCP 配置文件位于 `mcp-configs/mcp-servers.json`。

**步骤：**

1. 复制你需要的 MCP 服务器配置到 `~/.claude.json` 的 `mcpServers` 部分
2. 替换 `YOUR_*_HERE` 占位符为你的实际 API 密钥
3. 建议每个项目启用少于 10 个 MCP，以保留上下文窗口

示例：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "你的实际 Token"
      },
      "description": "GitHub 操作 - PR、问题、仓库"
    }
  }
}
```

## 验证安装

安装完成后，验证插件是否正确加载：

```bash
# 验证插件配置
claude plugin validate .claude-plugin/plugin.json

# 查看已安装的插件
/plugins

# 测试一个命令
/tdd
```

## 常见问题

### Q: 如何更新插件？

```bash
# 重新安装最新版本
/plugin install everything-claude-code-zh@everything-claude-code-zh --force
```

### Q: 钩子（Hooks）没有生效？

检查你的 Claude Code CLI 版本：

```bash
claude --version
```

需要 **v2.1.0 或更高版本**。

### Q: 如何禁用某些 MCP 服务器？

在项目配置中使用 `disabledMcpServers` 数组：

```json
{
  "disabledMcpServers": ["supabase", "vercel"]
}
```

### Q: 为什么我的上下文窗口变小了？

启用太多 MCP 会占用上下文窗口。建议：
- 配置 20-30 个 MCP
- 每个项目启用少于 10 个
- 保持工具总数在 80 以下

## 获取帮助

如果遇到问题：

1. 查看 [PLUGIN_SCHEMA_NOTES.md](.claude-plugin/PLUGIN_SCHEMA_NOTES.md) 了解插件配置要求
2. 提交 Issue：https://github.com/gongxh0901/everything-claude-code/issues
3. 参考原项目文档：https://github.com/affaan-m/everything-claude-code

## 下一步

安装完成后，建议阅读：

- [指南](https://x.com/affaanmustafa/status/2012378465664745795) - 了解核心概念
- [示例配置](examples/) - 查看项目和用户级配置示例
- [技能文档](skills/) - 了解各种工作流技能

---

祝使用愉快！如果这个插件对你有帮助，请给项目一个 ⭐️
