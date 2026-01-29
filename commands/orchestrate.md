# Orchestrate 命令

用于复杂任务的顺序代理工作流。

## 用法

`/orchestrate [workflow-type] [task-description]`

## 工作流类型

### feature
完整功能实现工作流：
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
Bug 调查和修复工作流：
```
explorer -> tdd-guide -> code-reviewer
```

### refactor
安全重构工作流：
```
architect -> code-reviewer -> tdd-guide
```

### security
以安全为重点的审查：
```
security-reviewer -> code-reviewer -> architect
```

## 执行模式

对于工作流中的每个代理：

1. **调用代理**，包含来自上一个代理的上下文
2. **收集输出**作为结构化交接文档
3. **传递给下一个代理**在链中
4. **汇总结果**到最终报告

## 交接文档格式

在代理之间，创建交接文档：

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### 上下文
[已完成工作的摘要]

### 发现
[关键发现或决策]

### 已修改的文件
[触及的文件列表]

### 待解决问题
[下一个代理的未解决项目]

### 建议
[建议的下一步]
```

## 示例：功能工作流

```
/orchestrate feature "Add user authentication"
```

执行：

1. **Planner Agent**
   - 分析需求
   - 创建实现计划
   - 识别依赖项
   - 输出：`HANDOFF: planner -> tdd-guide`

2. **TDD Guide Agent**
   - 读取 planner 交接
   - 首先编写测试
   - 实现以通过测试
   - 输出：`HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer Agent**
   - 审查实现
   - 检查问题
   - 建议改进
   - 输出：`HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer Agent**
   - 安全审计
   - 漏洞检查
   - 最终批准
   - 输出：最终报告

## 最终报告格式

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: Add user authentication
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
[一段摘要]

AGENT OUTPUTS
-------------
Planner: [摘要]
TDD Guide: [摘要]
Code Reviewer: [摘要]
Security Reviewer: [摘要]

FILES CHANGED
-------------
[列出所有修改的文件]

TEST RESULTS
------------
[测试通过/失败摘要]

SECURITY STATUS
---------------
[安全发现]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 并行执行

对于独立检查，并行运行代理：

```markdown
### 并行阶段
同时运行：
- code-reviewer（质量）
- security-reviewer（安全）
- architect（设计）

### 合并结果
将输出合并到单个报告中
```

## 参数

$ARGUMENTS:
- `feature <description>` - 完整功能工作流
- `bugfix <description>` - Bug 修复工作流
- `refactor <description>` - 重构工作流
- `security <description>` - 安全审查工作流
- `custom <agents> <description>` - 自定义代理序列

## 自定义工作流示例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## 提示

1. **从 planner 开始**用于复杂功能
2. **始终包含 code-reviewer**在合并之前
3. **使用 security-reviewer**用于认证/支付/PII
4. **保持交接简洁** - 专注于下一个代理需要的内容
5. **在代理之间运行验证**如果需要
