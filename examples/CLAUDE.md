# 项目 CLAUDE.md 示例

这是一个项目级别的 CLAUDE.md 文件示例。将此文件放置在项目根目录中。

## 项目概述

[简要描述您的项目 - 功能、技术栈]

## 关键规则

### 1. 代码组织

- 多个小文件优于少数大文件
- 高内聚，低耦合
- 典型 200-400 行，每个文件最多 800 行
- 按功能/领域组织，而不是按类型

### 2. 代码风格

- 代码、注释或文档中不使用表情符号
- 始终保持不可变性 - 永远不要修改对象或数组
- 生产代码中不使用 console.log
- 使用 try/catch 进行适当的错误处理
- 使用 Cursor 或类似工具进行输入验证

### 3. 测试

- TDD：先编写测试
- 最低 80% 覆盖率
- 工具函数的单元测试
- API 的集成测试
- 关键流程的 E2E 测试

### 4. 安全

- 不硬编码密钥
- 敏感数据使用环境变量
- 验证所有用户输入
- 仅使用参数化查询
- 启用 CSRF 保护

## 文件结构

```
src/
|-- app/              # Next.js 应用路由
|-- components/       # 可重用 UI 组件
|-- hooks/            # 自定义 React Hooks
|-- lib/              # 工具库
|-- types/            # TypeScript 定义
```

## 关键模式

### API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### 错误处理

```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

## 环境变量

```bash
# 必需
DATABASE_URL=
API_KEY=

# 可选
DEBUG=false
```

## 可用命令

- `/tdd` - 测试驱动开发工作流
- `/plan` - 创建实施计划
- `/code-review` - 审查代码质量
- `/build-fix` - 修复构建错误

## Git 工作流

- 约定式提交：`feat:`、`fix:`、`refactor:`、`docs:`、`test:`
- 永远不要直接提交到 main
- PR 需要审查
- 合并前所有测试必须通过
