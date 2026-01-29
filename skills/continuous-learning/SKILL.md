---
name: continuous-learning
description: 自动从 Claude Code 会话中提取可复用模式并将其保存为学习技能供未来使用。
---

# 持续学习技能

自动评估 Claude Code 会话结束时的内容，提取可保存为学习技能的可复用模式。

## 工作原理

此技能作为 **Stop 钩子** 在每个会话结束时运行：

1. **会话评估**：检查会话是否有足够的消息（默认：10+）
2. **模式检测**：从会话中识别可提取的模式
3. **技能提取**：将有用的模式保存到 `~/.claude/skills/learned/`

## 配置

编辑 `config.json` 自定义：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 模式类型

| 模式 | 描述 |
|------|------|
| `error_resolution` | 特定错误是如何解决的 |
| `user_corrections` | 来自用户纠正的模式 |
| `workarounds` | 框架/库怪癖的解决方案 |
| `debugging_techniques` | 有效的调试方法 |
| `project_specific` | 项目特定的约定 |

## 钩子设置

添加到您的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## 为什么使用 Stop 钩子？

- **轻量级**：在会话结束时只运行一次
- **非阻塞**：不会给每条消息增加延迟
- **完整上下文**：可以访问完整的会话记录

## 相关

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 持续学习部分
- `/learn` 命令 - 会话中手动模式提取

---

## 对比笔记（研究：2025年1月）

### vs Homunculus (github.com/humanplane/homunculus)

Homunculus v2 采用更复杂的方法：

| 特性 | 我们的方法 | Homunculus v2 |
|------|-----------|---------------|
| 观察 | Stop 钩子（会话结束） | PreToolUse/PostToolUse 钩子（100% 可靠） |
| 分析 | 主上下文 | 后台智能体（Haiku） |
| 粒度 | 完整技能 | 原子级"本能" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接生成技能 | 本能 → 聚类 → 技能/命令/智能体 |
| 共享 | 无 | 导出/导入本能 |

**来自 homunculus 的关键洞察：**
> "v1 依赖技能进行观察。技能是概率性的——它们根据 Claude 的判断大约 50-80% 的时间会触发。v2 使用钩子进行观察（100% 可靠）和本能作为学习行为的原子单位。"

### 潜在的 v2 增强

1. **基于本能的学习** - 带置信度评分的更小原子行为
2. **后台观察者** - Haiku 智能体并行分析
3. **置信度衰减** - 被反驳时本能失去置信度
4. **领域标签** - code-style、testing、git、debugging 等
5. **演进路径** - 将相关本能聚类为技能/命令

参见：`/Users/affoon/Documents/tasks/12-continuous-learning-v2.md` 获取完整规范。
