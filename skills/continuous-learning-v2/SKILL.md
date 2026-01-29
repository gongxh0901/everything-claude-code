---
name: continuous-learning-v2
description: 基于本能的学习系统，通过钩子观察会话，创建带置信度评分的原子本能，并将其演进为技能/命令/智能体。
version: 2.0.0
---

# 持续学习 v2 - 基于本能的架构

一个高级学习系统，通过原子级"本能"（带有置信度评分的小型学习行为）将您的 Claude Code 会话转化为可复用的知识。

## v2 新特性

| 特性 | v1 | v2 |
|------|----|----|
| 观察方式 | Stop 钩子（会话结束） | PreToolUse/PostToolUse（100% 可靠） |
| 分析位置 | 主上下文 | 后台智能体（Haiku） |
| 粒度 | 完整技能 | 原子级"本能" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接生成技能 | 本能 → 聚类 → 技能/命令/智能体 |
| 共享 | 无 | 导出/导入本能 |

## 本能模型

本能是一种小型学习行为：

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

**属性：**
- **原子级** — 一个触发器，一个动作
- **置信度加权** — 0.3 = 试探性，0.9 = 近乎确定
- **领域标签** — code-style、testing、git、debugging、workflow 等
- **证据支持** — 跟踪创建它的观察记录

## 工作原理

```
会话活动
      │
      │ 钩子捕获提示词 + 工具使用（100% 可靠）
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   （提示词、工具调用、结果）            │
└─────────────────────────────────────────┘
      │
      │ 观察者智能体读取（后台，Haiku）
      ▼
┌─────────────────────────────────────────┐
│          模式检测                       │
│   • 用户纠正 → 本能                     │
│   • 错误解决 → 本能                     │
│   • 重复工作流 → 本能                   │
└─────────────────────────────────────────┘
      │
      │ 创建/更新
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolve 聚类
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## 快速开始

### 1. 启用观察钩子

添加到您的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. 初始化目录结构

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. 运行观察者智能体（可选）

观察者可以在后台运行分析观察记录：

```bash
# 启动后台观察者
~/.claude/skills/continuous-learning-v2/agents/start-observer.sh
```

## 命令

| 命令 | 描述 |
|------|------|
| `/instinct-status` | 显示所有学习的本能及其置信度 |
| `/evolve` | 将相关本能聚类为技能/命令 |
| `/instinct-export` | 导出本能以便共享 |
| `/instinct-import <file>` | 从他人导入本能 |

## 配置

编辑 `config.json`：

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## 文件结构

```
~/.claude/homunculus/
├── identity.json           # 您的档案、技术水平
├── observations.jsonl      # 当前会话观察
├── observations.archive/   # 已处理的观察
├── instincts/
│   ├── personal/           # 自动学习的本能
│   └── inherited/          # 从他人导入的
└── evolved/
    ├── agents/             # 生成的专家智能体
    ├── skills/             # 生成的技能
    └── commands/           # 生成的命令
```

## 与 Skill Creator 集成

当您使用 [Skill Creator GitHub App](https://skill-creator.app) 时，它现在生成**两者**：
- 传统的 SKILL.md 文件（向后兼容）
- 本能集合（用于 v2 学习系统）

来自仓库分析的本能具有 `source: "repo-analysis"` 并包含源仓库 URL。

## 置信度评分

置信度随时间演进：

| 分数 | 含义 | 行为 |
|------|------|------|
| 0.3 | 试探性 | 建议但不强制 |
| 0.5 | 中等 | 相关时应用 |
| 0.7 | 强 | 自动批准应用 |
| 0.9 | 近乎确定 | 核心行为 |

**置信度提高**当：
- 模式被重复观察
- 用户没有纠正建议的行为
- 其他来源的相似本能一致

**置信度降低**当：
- 用户明确纠正该行为
- 模式长时间未被观察到
- 出现矛盾的证据

## 为什么用钩子而非技能进行观察？

> "v1 依赖技能进行观察。技能是概率性的——它们根据 Claude 的判断大约 50-80% 的时间会触发。"

钩子 **100% 的时间**确定性触发。这意味着：
- 每个工具调用都被观察
- 不会遗漏任何模式
- 学习是全面的

## 向后兼容性

v2 完全兼容 v1：
- 现有的 `~/.claude/skills/learned/` 技能仍然有效
- Stop 钩子仍然运行（但现在也馈入 v2）
- 渐进迁移路径：两者并行运行

## 隐私

- 观察**本地**保存在您的机器上
- 只有**本能**（模式）可以导出
- 不共享实际代码或对话内容
- 您控制导出的内容

## 相关

- [Skill Creator](https://skill-creator.app) - 从仓库历史生成本能
- [Homunculus](https://github.com/humanplane/homunculus) - v2 架构的灵感来源
- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 持续学习部分

---

*基于本能的学习：一次一个观察地教会 Claude 您的模式。*
