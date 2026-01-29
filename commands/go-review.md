---
description: 对 Go 代码进行全面审查，包括惯用模式、并发安全、错误处理和安全性。调用 go-reviewer 代理。
---

# Go 代码审查

此命令调用 **go-reviewer** 代理进行全面的 Go 特定代码审查。

## 此命令的功能

1. **识别 Go 更改**：通过 `git diff` 查找修改的 `.go` 文件
2. **运行静态分析**：执行 `go vet`、`staticcheck` 和 `golangci-lint`
3. **安全扫描**：检查 SQL 注入、命令注入、竞态条件
4. **并发审查**：分析 goroutine 安全性、channel 使用、mutex 模式
5. **惯用 Go 检查**：验证代码是否遵循 Go 约定和最佳实践
6. **生成报告**：按严重程度对问题进行分类

## 何时使用

在以下情况下使用 `/go-review`：
- 编写或修改 Go 代码后
- 提交 Go 更改之前
- 审查包含 Go 代码的 pull request
- 加入新的 Go 代码库
- 学习惯用 Go 模式

## 审查类别

### CRITICAL（必须修复）
- SQL/命令注入漏洞
- 没有同步的竞态条件
- Goroutine 泄漏
- 硬编码的凭据
- 不安全的指针使用
- 关键路径中忽略的错误

### HIGH（应该修复）
- 缺少带上下文的错误包装
- Panic 而不是返回错误
- Context 未传播
- 导致死锁的无缓冲 channel
- 接口未满足错误
- 缺少 mutex 保护

### MEDIUM（考虑）
- 非惯用代码模式
- 导出项缺少 godoc 注释
- 低效的字符串连接
- Slice 未预分配
- 未使用表驱动测试

## 运行的自动检查

```bash
# Static analysis
go vet ./...

# Advanced checks (if installed)
staticcheck ./...
golangci-lint run

# Race detection
go build -race ./...

# Security vulnerabilities
govulncheck ./...
```

## 使用示例

```text
User: /go-review

Agent:
# Go 代码审查报告

## 已审查的文件
- internal/handler/user.go（已修改）
- internal/service/auth.go（已修改）

## 静态分析结果
✓ go vet：没有问题
✓ staticcheck：没有问题

## 发现的问题

[CRITICAL] 竞态条件
文件：internal/service/auth.go:45
问题：共享 map 访问没有同步
```go
var cache = map[string]*Session{}  // 并发访问！

func GetSession(id string) *Session {
    return cache[id]  // 竞态条件
}
```
修复：使用 sync.RWMutex 或 sync.Map
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] 缺少错误上下文
文件：internal/handler/user.go:28
问题：返回错误没有上下文
```go
return err  // 没有上下文
```
修复：用上下文包装
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## 摘要
- CRITICAL：1
- HIGH：1
- MEDIUM：0

建议：❌ 阻止合并，直到修复 CRITICAL 问题
```

## 批准标准

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 | 没有 CRITICAL 或 HIGH 问题 |
| ⚠️ 警告 | 仅有 MEDIUM 问题（谨慎合并） |
| ❌ 阻止 | 发现 CRITICAL 或 HIGH 问题 |

## 与其他命令集成

- 首先使用 `/go-test` 确保测试通过
- 如果出现构建错误，使用 `/go-build`
- 提交前使用 `/go-review`
- 对非 Go 特定的关注使用 `/code-review`

## 相关

- Agent: `agents/go-reviewer.md`
- Skills: `skills/golang-patterns/`、`skills/golang-testing/`
