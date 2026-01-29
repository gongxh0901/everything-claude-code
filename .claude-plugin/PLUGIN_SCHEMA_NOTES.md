# 插件清单架构注释

本文档记录了 Claude Code 插件清单验证器的**未记录但强制执行的约束**。

这些规则基于实际的安装失败、验证器行为和与已知可用插件的比较。
它们的存在是为了防止无声的故障和重复的回归。

如果你编辑 `.claude-plugin/plugin.json`，请先阅读本文档。

---

## 摘要（首先阅读此部分）

Claude 插件清单验证器是**严格且固执己见的**。
它强制执行的规则在公开架构参考中没有完全记录。

最常见的失败模式是：

> 清单看起来很合理，但验证器以模糊的错误拒绝它，例如
> `agents: Invalid input`

本文档解释了原因。

---

## 必需字段

### `version`（强制）

验证器要求 `version` 字段，即使在某些示例中省略。

如果缺少，安装可能在市场安装或 CLI 验证期间失败。

示例：

```json
{
  "version": "1.1.0"
}
```

---

## 字段形状规则

以下字段**必须始终是数组**：

* `agents`
* `commands`
* `skills`
* `hooks`（如果存在）

即使只有一个条目，**也不接受字符串**。

### 无效

```json
{
  "agents": "./agents"
}
```

### 有效

```json
{
  "agents": ["./agents/planner.md"]
}
```

这在所有组件路径字段中一致适用。

---

## 路径解析规则（关键）

### 代理必须使用显式文件路径

验证器**不接受 `agents` 的目录路径**。

即使以下情况也会失败：

```json
{
  "agents": ["./agents/"]
}
```

相反，你必须显式枚举代理文件：

```json
{
  "agents": [
    "./agents/planner.md",
    "./agents/architect.md",
    "./agents/code-reviewer.md"
  ]
}
```

这是验证错误最常见的来源。

### 命令和技能

* `commands` 和 `skills` 接受目录路径**只有在包装在数组中时**
* 显式文件路径最安全，也最面向未来

---

## 验证器行为注释

* `claude plugin validate` 比某些市场预览更严格
* 验证可能在本地通过但在安装期间失败（如果路径不明确）
* 错误通常是通用的（`Invalid input`），不表示根本原因
* 跨平台安装（尤其是 Windows）对路径假设的容忍度较低

假设验证器是敌对的且按字面意思理解。

---

## The `hooks` Field: DO NOT ADD

> ⚠️ **CRITICAL:** Do NOT add a `"hooks"` field to `plugin.json`. This is enforced by a regression test.

### Why This Matters

Claude Code v2.1+ **automatically loads** `hooks/hooks.json` from any installed plugin by convention. If you also declare it in `plugin.json`, you get:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file.
The standard hooks/hooks.json is loaded automatically, so manifest.hooks should
only reference additional hook files.
```

### The Flip-Flop History

This has caused repeated fix/revert cycles in this repo:

| Commit | Action | Trigger |
|--------|--------|---------|
| `22ad036` | ADD hooks | Users reported "hooks not loading" |
| `a7bc5f2` | REMOVE hooks | Users reported "duplicate hooks error" (#52) |
| `779085e` | ADD hooks | Users reported "agents not loading" (#88) |
| `e3a1306` | REMOVE hooks | Users reported "duplicate hooks error" (#103) |

**Root cause:** Claude Code CLI changed behavior between versions:
- Pre-v2.1: Required explicit `hooks` declaration
- v2.1+: Auto-loads by convention, errors on duplicate

### Current Rule (Enforced by Test)

The test `plugin.json does NOT have explicit hooks declaration` in `tests/hooks/hooks.test.js` prevents this from being reintroduced.

**If you're adding additional hook files** (not `hooks/hooks.json`), those CAN be declared. But the standard `hooks/hooks.json` must NOT be declared.

## 已知反模式

这些看起来正确但被拒绝：

* 字符串值而不是数组
* `agents` 的目录数组
* 缺少 `version`
* 依赖推断的路径
* 假设市场行为与本地验证匹配
* **Adding `"hooks": "./hooks/hooks.json"`** - auto-loaded by convention, causes duplicate error

避免巧妙的做法。要明确。

---

## 最小已知良好示例

```json
{
  "version": "1.1.0",
  "agents": [
    "./agents/planner.md",
    "./agents/code-reviewer.md"
  ],
  "commands": ["./commands/"],
  "skills": ["./skills/"]
}
```

此结构已根据 Claude 插件验证器进行验证。

**Important:** Notice there is NO `"hooks"` field. The `hooks/hooks.json` file is loaded automatically by convention. Adding it explicitly causes a duplicate error.

---

## 对贡献者的建议

在提交涉及 `plugin.json` 的更改之前：

1. 为代理使用显式文件路径
2. 确保所有组件字段都是数组
3. 包含 `version`
4. 运行：

```bash
claude plugin validate .claude-plugin/plugin.json
```

如有疑问，选择详细而不是便利。

---

## 为什么存在此文件

该存储库被广泛分叉和用作参考实现。

在此记录验证器的怪癖：

* 防止重复问题
* 减少贡献者的挫折感
* 随着生态系统的发展保持插件稳定性

如果验证器更改，请首先更新本文档。
