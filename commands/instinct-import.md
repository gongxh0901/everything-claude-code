---
name: instinct-import
description: 从团队成员、Skill Creator 或其他来源导入本能
command: /instinct-import
implementation: python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file>
---

# Instinct Import 命令

## 实现

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

从以下来源导入本能：
- 团队成员的导出
- Skill Creator（仓库分析）
- 社区集合
- 先前机器的备份

## 用法

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 要做的事

1. 获取本能文件（本地路径或 URL）
2. 解析并验证格式
3. 检查与现有本能的重复
4. 合并或添加新本能
5. 保存到 `~/.claude/homunculus/instincts/inherited/`

## 导入流程

```
📥 从以下导入本能：team-instincts.yaml
================================================

发现 12 个要导入的本能。

分析冲突...

## 新本能（8 个）
这些将被添加：
  ✓ use-zod-validation（置信度：0.7）
  ✓ prefer-named-exports（置信度：0.65）
  ✓ test-async-functions（置信度：0.8）
  ...

## 重复本能（3 个）
已有类似本能：
  ⚠️ prefer-functional-style
     本地：0.8 置信度，12 次观察
     导入：0.7 置信度
     → 保留本地（更高置信度）

  ⚠️ test-first-workflow
     本地：0.75 置信度
     导入：0.9 置信度
     → 更新为导入（更高置信度）

## 冲突本能（1 个）
这些与本地本能矛盾：
  ❌ use-classes-for-services
     与以下冲突：avoid-classes
     → 跳过（需要手动解决）

---
导入 8 个新本能，更新 1 个，跳过 3 个？
```

## 合并策略

### 对于重复
导入与现有本能匹配的本能时：
- **更高置信度获胜**：保留置信度更高的
- **合并证据**：合并观察计数
- **更新时间戳**：标记为最近验证

### 对于冲突
导入与现有本能矛盾的本能时：
- **默认跳过**：不导入冲突本能
- **标记审查**：标记两者需要注意
- **手动解决**：用户决定保留哪个

## 来源跟踪

导入的本能标记为：
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # or "repo-analysis"
```

## Skill Creator 集成

从 Skill Creator 导入时：

```
/instinct-import --from-skill-creator acme/webapp
```

这将获取从仓库分析生成的本能：
- 来源：`repo-analysis`
- 更高的初始置信度（0.7+）
- 链接到源仓库

## 标志

- `--dry-run`：预览而不导入
- `--force`：即使存在冲突也导入
- `--merge-strategy <higher|local|import>`：如何处理重复
- `--from-skill-creator <owner/repo>`：从 Skill Creator 分析导入
- `--min-confidence <n>`：仅导入超过阈值的本能

## 输出

导入后：
```
✅ 导入完成！

已添加：8 个本能
已更新：1 个本能
已跳过：3 个本能（2 个重复，1 个冲突）

新本能保存到：~/.claude/homunculus/instincts/inherited/

运行 /instinct-status 查看所有本能。
```
