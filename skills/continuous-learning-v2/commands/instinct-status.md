---
name: instinct-status
description: 显示所有已学习本能及其置信度级别
command: /instinct-status
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py status
---

# 本能状态命令

显示所有已学习本能及其置信度分数，按领域分组。

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

## 执行步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取所有本能文件
2. 从 `~/.claude/homunculus/instincts/inherited/` 读取继承的本能
3. 按领域分组显示，带置信度条

## 输出格式

```
📊 本能状态
==================

## 代码风格 (4 个本能)

### prefer-functional-style
触发器: 编写新函数时
操作: 使用函数式模式而非类
置信度: ████████░░ 80%
来源: session-observation | 最后更新: 2025-01-22

### use-path-aliases
触发器: 导入模块时
操作: 使用 @/ 路径别名而非相对导入
置信度: ██████░░░░ 60%
来源: repo-analysis (github.com/acme/webapp)

## 测试 (2 个本能)

### test-first-workflow
触发器: 添加新功能时
操作: 先写测试，再写实现
置信度: █████████░ 90%
来源: session-observation

## 工作流 (3 个本能)

### grep-before-edit
触发器: 修改代码时
操作: 用 Grep 搜索，用 Read 确认，然后 Edit
置信度: ███████░░░ 70%
来源: session-observation

---
总计: 9 个本能（4 个个人，5 个继承）
观察者: 运行中（最后分析: 5 分钟前）
```

## 标志

- `--domain <name>`: 按领域过滤（code-style, testing, git 等）
- `--low-confidence`: 只显示置信度 < 0.5 的本能
- `--high-confidence`: 只显示置信度 >= 0.7 的本能
- `--source <type>`: 按来源过滤（session-observation, repo-analysis, inherited）
- `--json`: 以 JSON 输出，供程序化使用
