# 为 Everything Claude Code 贡献

感谢您想要贡献。这个仓库旨在成为 Claude Code 用户的社区资源。

## 我们在寻找什么

### 代理

处理特定任务的新代理：
- 特定语言的审查器（Python、Go、Rust）
- 框架专家（Django、Rails、Laravel、Spring）
- DevOps 专家（Kubernetes、Terraform、CI/CD）
- 领域专家（ML 管道、数据工程、移动开发）

### 技能

工作流定义和领域知识：
- 语言最佳实践
- 框架模式
- 测试策略
- 架构指南
- 特定领域知识

### 命令

调用有用工作流的斜杠命令：
- 部署命令
- 测试命令
- 文档命令
- 代码生成命令

### Hooks

有用的自动化：
- 代码检查/格式化 hooks
- 安全检查
- 验证 hooks
- 通知 hooks

### 规则

始终遵循的指南：
- 安全规则
- 代码风格规则
- 测试要求
- 命名约定

### MCP 配置

新的或改进的 MCP 服务器配置：
- 数据库集成
- 云提供商 MCP
- 监控工具
- 通信工具

---

## 如何贡献

### 1. Fork 仓库

```bash
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git
cd everything-claude-code
```

### 2. 创建分支

```bash
git checkout -b add-python-reviewer
```

### 3. 添加您的贡献

将文件放在适当的目录中：
- `agents/` 用于新代理
- `skills/` 用于技能（可以是单个 .md 或目录）
- `commands/` 用于斜杠命令
- `rules/` 用于规则文件
- `hooks/` 用于 hook 配置
- `mcp-configs/` 用于 MCP 服务器配置

### 4. 遵循格式

**代理**应该有前置元数据：

```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: sonnet
---

Instructions here...
```

**技能**应该清晰且可操作：

```markdown
# Skill Name

## When to Use

...

## How It Works

...

## Examples

...
```

**命令**应该解释它们的作用：

```markdown
---
description: Brief description of command
---

# Command Name

Detailed instructions...
```

**Hooks** 应该包含描述：

```json
{
  "matcher": "...",
  "hooks": [...],
  "description": "What this hook does"
}
```

### 5. 测试您的贡献

在提交之前，确保您的配置可以与 Claude Code 配合使用。

### 6. 提交 PR

```bash
git add .
git commit -m "Add Python code reviewer agent"
git push origin add-python-reviewer
```

然后打开一个 PR，包含：
- 您添加了什么
- 为什么它有用
- 您如何测试它

---

## 指南

### 做

- 保持配置专注和模块化
- 包含清晰的描述
- 提交前测试
- 遵循现有模式
- 记录任何依赖项

### 不要

- 包含敏感数据（API 密钥、令牌、路径）
- 添加过于复杂或小众的配置
- 提交未经测试的配置
- 创建重复的功能
- 添加需要特定付费服务且没有替代方案的配置

---

## 文件命名

- 使用小写字母和连字符：`python-reviewer.md`
- 使用描述性名称：`tdd-workflow.md` 而不是 `workflow.md`
- 使代理/技能名称与文件名匹配

---

## 问题？

打开一个 issue 或在 X 上联系：[@affaanmustafa](https://x.com/affaanmustafa)

---

感谢您的贡献。让我们一起构建一个伟大的资源。
