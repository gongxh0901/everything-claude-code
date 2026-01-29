---
name: evolve
description: 将相关的本能聚类为技能、命令或代理
command: /evolve
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve
---

# Evolve 命令

## 实现

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

分析本能并将相关的本能聚类为更高级别的结构：
- **Commands**：当本能描述用户调用的操作时
- **Skills**：当本能描述自动触发的行为时
- **Agents**：当本能描述复杂的、多步骤的流程时

## 用法

```
/evolve                    # 分析所有本能并建议演化
/evolve --domain testing   # 仅演化测试域中的本能
/evolve --dry-run          # 显示将创建的内容但不实际创建
/evolve --threshold 5      # 需要 5+ 个相关本能才能聚类
```

## 演化规则

### → Command（用户调用）
当本能描述用户会明确请求的操作时：
- 多个关于"当用户要求..."的本能
- 具有"当创建新 X 时"等触发器的本能
- 遵循可重复序列的本能

示例：
- `new-table-step1`："当添加数据库表时，创建迁移"
- `new-table-step2`："当添加数据库表时，更新架构"
- `new-table-step3`："当添加数据库表时，重新生成类型"

→ 创建：`/new-table` 命令

### → Skill（自动触发）
当本能描述应该自动发生的行为时：
- 模式匹配触发器
- 错误处理响应
- 代码风格强制

示例：
- `prefer-functional`："编写函数时，优先使用函数式风格"
- `use-immutable`："修改状态时，使用不可变模式"
- `avoid-classes`："设计模块时，避免基于类的设计"

→ 创建：`functional-patterns` 技能

### → Agent（需要深度/隔离）
当本能描述受益于隔离的复杂多步骤流程时：
- 调试工作流
- 重构序列
- 研究任务

示例：
- `debug-step1`："调试时，首先检查日志"
- `debug-step2`："调试时，隔离失败组件"
- `debug-step3`："调试时，创建最小重现"
- `debug-step4`："调试时，用测试验证修复"

→ 创建：`debugger` 代理

## 要做的事

1. 从 `~/.claude/homunculus/instincts/` 读取所有本能
2. 按以下方式分组本能：
   - 域相似性
   - 触发模式重叠
   - 动作序列关系
3. 对于每个包含 3+ 个相关本能的集群：
   - 确定演化类型（command/skill/agent）
   - 生成相应的文件
   - 保存到 `~/.claude/homunculus/evolved/{commands,skills,agents}/`
4. 将演化的结构链接回源本能

## 输出格式

```
🧬 演化分析
==================

发现 3 个准备演化的集群：

## 集群 1：数据库迁移工作流
本能：new-table-migration、update-schema、regenerate-types
类型：Command
置信度：85%（基于 12 次观察）

将创建：/new-table 命令
文件：
  - ~/.claude/homunculus/evolved/commands/new-table.md

## 集群 2：函数式代码风格
本能：prefer-functional、use-immutable、avoid-classes、pure-functions
类型：Skill
置信度：78%（基于 8 次观察）

将创建：functional-patterns 技能
文件：
  - ~/.claude/homunculus/evolved/skills/functional-patterns.md

## 集群 3：调试流程
本能：debug-check-logs、debug-isolate、debug-reproduce、debug-verify
类型：Agent
置信度：72%（基于 6 次观察）

将创建：debugger 代理
文件：
  - ~/.claude/homunculus/evolved/agents/debugger.md

---
运行 `/evolve --execute` 以创建这些文件。
```

## 标志

- `--execute`：实际创建演化的结构（默认是预览）
- `--dry-run`：预览但不创建
- `--domain <name>`：仅演化指定域中的本能
- `--threshold <n>`：形成集群所需的最少本能数（默认：3）
- `--type <command|skill|agent>`：仅创建指定类型

## 生成的文件格式

### Command
```markdown
---
name: new-table
description: 创建新的数据库表，包含迁移、架构更新和类型生成
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table 命令

[基于聚类本能生成的内容]

## 步骤
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: 强制执行函数式编程模式
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns 技能

[基于聚类本能生成的内容]
```

### Agent
```markdown
---
name: debugger
description: 系统化调试代理
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger 代理

[基于聚类本能生成的内容]
```
