---
name: instinct-status
description: 显示所有学习到的本能及其置信度级别
command: /instinct-status
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
---

# Instinct Status 命令

显示所有学习到的本能及其置信度分数，按域分组。

## 实现

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
```

## 用法

```
/instinct-status
/instinct-status --domain code-style
/instinct-status --low-confidence
```

## 要做的事

1. 从 `~/.claude/homunculus/instincts/personal/` 读取所有本能文件
2. 从 `~/.claude/homunculus/instincts/inherited/` 读取继承的本能
3. 按域分组显示它们，包含置信度条

## 输出格式

```
📊 本能状态
==================

## 代码风格（4 个本能）

### prefer-functional-style
触发：when writing new functions
操作：Use functional patterns over classes
置信度：████████░░ 80%
来源：session-observation | 最后更新：2025-01-22

### use-path-aliases
触发：when importing modules
操作：Use @/ path aliases instead of relative imports
置信度：██████░░░░ 60%
来源：repo-analysis (github.com/acme/webapp)

## 测试（2 个本能）

### test-first-workflow
触发：when adding new functionality
操作：Write test first, then implementation
置信度：█████████░ 90%
来源：session-observation

## 工作流（3 个本能）

### grep-before-edit
触发：when modifying code
操作：Search with Grep, confirm with Read, then Edit
置信度：███████░░░ 70%
来源：session-observation

---
总计：9 个本能（4 个个人，5 个继承）
观察者：运行中（上次分析：5 分钟前）
```

## 标志

- `--domain <name>`：按域过滤（code-style、testing、git 等）
- `--low-confidence`：仅显示置信度 < 0.5 的本能
- `--high-confidence`：仅显示置信度 >= 0.7 的本能
- `--source <type>`：按来源过滤（session-observation、repo-analysis、inherited）
- `--json`：以 JSON 格式输出用于编程使用
