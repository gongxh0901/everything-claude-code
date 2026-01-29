---
name: instinct-export
description: 导出本能以与队友或其他项目共享
command: /instinct-export
---

# 本能导出命令

将本能导出为可共享格式。适用于：
- 与队友共享
- 转移到新机器
- 贡献到项目约定

## 用法

```
/instinct-export                           # 导出所有个人本能
/instinct-export --domain testing          # 只导出 testing 本能
/instinct-export --min-confidence 0.7      # 只导出高置信度本能
/instinct-export --output team-instincts.yaml
```

## 执行步骤

1. 从 `~/.claude/homunculus/instincts/personal/` 读取本能
2. 根据标志过滤
3. 剥离敏感信息：
   - 移除会话 ID
   - 移除文件路径（只保留模式）
   - 移除超过"上周"的时间戳
4. 生成导出文件

## 输出格式

创建 YAML 文件：

```yaml
# 本能导出
# 生成时间: 2025-01-22
# 来源: personal
# 数量: 12 个本能

version: "2.0"
exported_by: "continuous-learning-v2"
export_date: "2025-01-22T10:30:00Z"

instincts:
  - id: prefer-functional-style
    trigger: "编写新函数时"
    action: "使用函数式模式而非类"
    confidence: 0.8
    domain: code-style
    observations: 8

  - id: test-first-workflow
    trigger: "添加新功能时"
    action: "先写测试，再写实现"
    confidence: 0.9
    domain: testing
    observations: 12

  - id: grep-before-edit
    trigger: "修改代码时"
    action: "用 Grep 搜索，用 Read 确认，然后 Edit"
    confidence: 0.7
    domain: workflow
    observations: 6
```

## 隐私考虑

导出包含：
- ✅ 触发器模式
- ✅ 操作
- ✅ 置信度分数
- ✅ 领域
- ✅ 观察次数

导出**不**包含：
- ❌ 实际代码片段
- ❌ 文件路径
- ❌ 会话记录
- ❌ 个人标识符

## 标志

- `--domain <name>`: 只导出指定领域
- `--min-confidence <n>`: 最小置信度阈值（默认：0.3）
- `--output <file>`: 输出文件路径（默认：instincts-export-YYYYMMDD.yaml）
- `--format <yaml|json|md>`: 输出格式（默认：yaml）
- `--include-evidence`: 包含证据文本（默认：排除）
