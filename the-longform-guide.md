# Everything Claude Code 深度指南

![Header: The Longform Guide to Everything Claude Code](./assets/images/longform/01-header.png)

---

> **前提条件**: 本指南建立在[Everything Claude Code 快速指南](./the-shortform-guide.md)的基础上。如果你还没有设置 skills、hooks、subagents、MCPs 和 plugins,请先阅读那份指南。

![Reference to Shorthand Guide](./assets/images/longform/02-shortform-reference.png)
*快速指南 - 请先阅读*

在快速指南中,我介绍了基础设置：skills 和 commands、hooks、subagents、MCPs、plugins,以及构成有效 Claude Code 工作流骨干的配置模式。那是设置指南和基础设施。

这份深度指南深入探讨将生产性会话与浪费性会话区分开来的技术。如果你还没有阅读快速指南,请返回先设置你的配置。以下内容假定你已经配置并运行了 skills、agents、hooks 和 MCPs。

这里的主题：token 经济学、内存持久化、验证模式、并行化策略,以及构建可复用工作流的复合效应。这些是我在 10 个多月的日常使用中完善的模式,它们使第一个小时内被上下文腐烂困扰与保持数小时生产力会话之间产生了差异。

快速指南和深度指南中涵盖的所有内容都可以在 GitHub 上找到：`github.com/affaan-m/everything-claude-code`

---

## 技巧和窍门

### 一些 MCP 是可替换的,将释放你的上下文窗口

对于版本控制（GitHub）、数据库（Supabase）、部署（Vercel、Railway）等 MCP - 这些平台大多已经有了 MCP 本质上只是包装的强大 CLI。MCP 是一个不错的包装器,但需要付出代价。

要使 CLI 在不实际使用 MCP（以及随之而来的减少的上下文窗口）的情况下更像 MCP 一样运行,考虑将功能打包到 skills 和 commands 中。剥离 MCP 暴露的使事情变得容易的工具,并将它们转换为命令。

示例：不要一直加载 GitHub MCP,而是创建一个包装 `gh pr create` 及你首选选项的 `/gh-pr` 命令。不要让 Supabase MCP 消耗上下文,而是创建直接使用 Supabase CLI 的 skills。

通过懒加载,上下文窗口问题基本解决了。但 token 使用和成本没有以相同方式解决。CLI + skills 方法仍然是一种 token 优化方法。

---

## 重要内容

### 上下文和内存管理

为了跨会话共享内存,最好的方法是使用一个 skill 或 command 来总结和检查进度,然后保存到你 `.claude` 文件夹中的 `.tmp` 文件并追加到它,直到你的会话结束。第二天它可以使用它作为上下文并从你离开的地方继续,为每个会话创建一个新文件,这样你就不会将旧上下文污染到新工作中。

![Session Storage File Tree](./assets/images/longform/03-session-storage.png)
*会话存储示例 -> https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions*

Claude 创建一个总结当前状态的文件。审查它,如果需要可以要求编辑,然后重新开始。对于新对话,只需提供文件路径。当你达到上下文限制并需要继续复杂工作时特别有用。这些文件应包含：
- 哪些方法有效（有证据可验证）
- 尝试了哪些方法但没有效果
- 哪些方法尚未尝试以及还有什么要做

**策略性清除上下文：**

一旦你设置好计划并清除了上下文（现在是 Claude Code 中计划模式的默认选项）,你就可以从计划中工作。当你积累了大量不再与执行相关的探索上下文时,这很有用。对于策略性压缩,禁用自动压缩。在逻辑间隔手动压缩或创建一个为你执行此操作的 skill。

**高级：动态系统提示注入**

我学到的一个模式：不是仅仅把所有东西都放在 CLAUDE.md（用户范围）或 `.claude/rules/`（项目范围）中,这会在每个会话中加载,而是使用 CLI 标志动态注入上下文。

```bash
claude --system-prompt "$(cat memory.md)"
```

这让你可以更精确地控制何时加载什么上下文。系统提示内容的权威性高于用户消息,用户消息的权威性高于工具结果。

**实际设置：**

```bash
# 日常开发
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR 审查模式
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# 研究/探索模式
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

**高级：内存持久化钩子**

有一些大多数人不知道的钩子可以帮助记忆：

- **PreCompact Hook**: 在上下文压缩发生之前,将重要状态保存到文件
- **Stop Hook（会话结束）**: 在会话结束时,将学习内容持久化到文件
- **SessionStart Hook**: 在新会话时,自动加载先前的上下文

我已经构建了这些钩子,它们在仓库中：`github.com/affaan-m/everything-claude-code/tree/main/hooks/memory-persistence`

---

### 持续学习 / 内存

如果你不得不多次重复一个提示,并且 Claude 遇到了同样的问题或给了你之前听过的响应 - 这些模式必须附加到 skills 中。

**问题：** 浪费 tokens、浪费上下文、浪费时间。

**解决方案：** 当 Claude Code 发现一些非琐碎的东西 - 调试技术、变通方法、某些项目特定模式 - 它将该知识保存为新 skill。下次出现类似问题时,skill 会自动加载。

我已经构建了一个持续学习 skill：`github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning`

**为什么使用 Stop Hook（而不是 UserPromptSubmit）：**

关键的设计决策是使用 **Stop hook** 而不是 UserPromptSubmit。UserPromptSubmit 在每条消息上运行 - 为每个提示添加延迟。Stop 在会话结束时运行一次 - 轻量级,不会在会话期间减慢速度。

---

### Token 优化

**主要策略：Subagent 架构**

优化你使用的工具和 subagent 架构,旨在委派足以完成任务的最便宜模型。

**模型选择快速参考：**

![Model Selection Table](./assets/images/longform/04-model-selection.png)
*各种常见任务的 subagents 假设设置及选择背后的原因*

| 任务类型                 | 模型  | 原因                                        |
| ------------------------- | ------ | ------------------------------------------ |
| 探索/搜索        | Haiku  | 快速、便宜、足以查找文件 |
| 简单编辑              | Haiku  | 单文件更改、清晰指令    |
| 多文件实现 | Sonnet | 编码的最佳平衡                    |
| 复杂架构      | Opus   | 需要深度推理                      |
| PR 审查                | Sonnet | 理解上下文、捕捉细微差别        |
| 安全分析         | Opus   | 不能错过漏洞       |
| 编写文档              | Haiku  | 结构简单                        |
| 调试复杂 bug    | Opus   | 需要在脑中保持整个系统        |

对于 90% 的编码任务默认使用 Sonnet。当第一次尝试失败、任务跨越 5 个以上文件、架构决策或安全关键代码时升级到 Opus。

**定价参考：**

![Claude Model Pricing](./assets/images/longform/05-pricing-table.png)
*来源: https://platform.claude.com/docs/en/about-claude/pricing*

**特定工具优化：**

用 mgrep 替换 grep - 与传统 grep 或 ripgrep 相比,平均减少约 50% 的 token：

![mgrep Benchmark](./assets/images/longform/06-mgrep-benchmark.png)
*在我们的 50 任务基准测试中,mgrep + Claude Code 使用的 tokens 约为基于 grep 的工作流的 2 倍少,质量相似或更好。来源: https://github.com/mixedbread-ai/mgrep*

**模块化代码库的好处：**

拥有更模块化的代码库,主文件有数百行而不是数千行,有助于 token 优化成本和第一次就正确完成任务。

---

### 验证循环和评估

**基准测试工作流：**

比较有无 skill 请求同一件事并检查输出差异：

Fork 对话,在其中一个中启动一个没有 skill 的新 worktree,最后拉取差异,查看记录了什么。

**评估模式类型：**

- **基于检查点的评估**: 设置明确的检查点,根据定义的标准验证,在继续之前修复
- **持续评估**: 每 N 分钟或重大更改后运行,完整测试套件 + lint

**关键指标：**

```
pass@k: k 次尝试中至少有一次成功
        k=1: 70%  k=3: 91%  k=5: 97%

pass^k: 所有 k 次尝试都必须成功
        k=1: 70%  k=3: 34%  k=5: 17%
```

当你只需要它工作时使用 **pass@k**。当一致性至关重要时使用 **pass^k**。

---

## 并行化

在多 Claude 终端设置中 fork 对话时,确保 fork 和原始对话中的操作范围定义明确。在代码更改方面争取最小重叠。

**我首选的模式：**

主聊天用于代码更改,fork 用于关于代码库及其当前状态的问题,或外部服务的研究。

**关于任意终端数量：**

![Boris on Parallel Terminals](./assets/images/longform/07-boris-parallel.png)
*Boris（Anthropic）关于运行多个 Claude 实例*

Boris 有关于并行化的提示。他建议运行 5 个本地 Claude 实例和 5 个上游实例。我建议不要设置任意的终端数量。终端的添加应该出于真正的必要性。

你的目标应该是：**用最少可行的并行化量完成多少工作。**

**用于并行实例的 Git Worktrees：**

```bash
# 为并行工作创建 worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# 每个 worktree 都有自己的 Claude 实例
cd ../project-feature-a && claude
```

如果你要开始扩展实例,并且有多个 Claude 实例在彼此重叠的代码上工作,使用 git worktrees 并为每个都有一个非常明确的计划是必不可少的。使用 `/rename <name here>` 命名所有聊天。

![Two Terminal Setup](./assets/images/longform/08-two-terminals.png)
*起始设置：左侧终端用于编码,右侧终端用于问题 - 使用 /rename 和 /fork*

**级联方法：**

运行多个 Claude Code 实例时,使用"级联"模式组织：

- 在右侧的新标签中打开新任务
- 从左到右扫描,从最旧到最新
- 一次最多专注于 3-4 个任务

---

## 基础工作

**双实例启动模式：**

对于我自己的工作流管理,我喜欢用 2 个打开的 Claude 实例启动一个空仓库。

**实例 1：脚手架代理**
- 铺设脚手架和基础工作
- 创建项目结构
- 设置配置（CLAUDE.md、rules、agents）

**实例 2：深度研究代理**
- 连接到你所有的服务、网络搜索
- 创建详细的 PRD
- 创建架构 mermaid 图表
- 用实际文档片段编译引用

**llms.txt 模式：**

如果可用,你可以在许多文档引用上找到 `llms.txt`,方法是一旦到达他们的文档页面就在它们上执行 `/llms.txt`。这为你提供了文档的干净、LLM 优化版本。

**理念：构建可复用模式**

来自 @omarsar0："早期,我花时间构建可复用的工作流/模式。构建起来很乏味,但随着模型和代理装具的改进,这产生了疯狂的复合效应。"

**值得投资的内容：**

- Subagents
- Skills
- Commands
- 规划模式
- MCP 工具
- 上下文工程模式

---

## Agents 和 Sub-Agents 的最佳实践

**Sub-Agent 上下文问题：**

Sub-agents 的存在是为了通过返回摘要而不是转储所有内容来节省上下文。但编排器具有 sub-agent 缺乏的语义上下文。Sub-agent 只知道字面查询,而不是请求背后的目的。

**迭代检索模式：**

1. 编排器评估每个 sub-agent 返回
2. 在接受之前提出后续问题
3. Sub-agent 返回源,获取答案,返回
4. 循环直到足够（最多 3 个周期）

**关键：** 传递目标上下文,而不仅仅是查询。

**具有顺序阶段的编排器：**

```markdown
阶段 1: 研究（使用 Explore agent）→ research-summary.md
阶段 2: 计划（使用 planner agent）→ plan.md
阶段 3: 实现（使用 tdd-guide agent）→ 代码更改
阶段 4: 审查（使用 code-reviewer agent）→ review-comments.md
阶段 5: 验证（如需要使用 build-error-resolver）→ 完成或循环回
```

**关键规则：**

1. 每个 agent 获得一个清晰的输入并产生一个清晰的输出
2. 输出成为下一阶段的输入
3. 永远不要跳过阶段
4. 在 agents 之间使用 `/clear`
5. 将中间输出存储在文件中

---

## 有趣的内容 / 不关键只是有趣的提示

### 自定义状态栏

你可以使用 `/statusline` 设置它 - 然后 Claude 会说你没有状态栏但可以为你设置它并询问你想要什么。

另请参阅: https://github.com/sirmalloc/ccstatusline

### 语音转录

用你的声音与 Claude Code 交谈。对许多人来说比打字更快。

- Mac 上的 superwhisper、MacWhisper
- 即使有转录错误,Claude 也能理解意图

### 终端别名

```bash
alias c='claude'
alias gb='github'
alias co='code'
alias q='cd ~/Desktop/projects'
```

---

## 里程碑

![25k+ GitHub Stars](./assets/images/longform/09-25k-stars.png)
*不到一周内超过 25,000 GitHub stars*

---

## 资源

**Agent 编排：**

- https://github.com/ruvnet/claude-flow - 具有 54 个以上专门化 agents 的企业编排平台

**自我改进内存：**

- https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning
- rlancemartin.github.io/2025/12/01/claude_diary/ - 会话反思模式

**系统提示参考：**

- https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools - 系统提示集合（110k stars）

**官方：**

- Anthropic Academy: anthropic.skilljar.com

---

## 参考资料

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [YK: 32 Claude Code Tips](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [RLanceMartin: Session Reflection Pattern](https://rlancemartin.github.io/2025/12/01/claude_diary/)
- @PerceptualPeak: Sub-Agent Context Negotiation
- @menhguin: Agent Abstractions Tierlist
- @omarsar0: Compound Effects Philosophy

---

*两份指南中涵盖的所有内容都可以在 GitHub 上的 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 找到*
