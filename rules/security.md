# 安全指南

## 强制性安全检查

在任何提交之前：
- [ ] 没有硬编码的秘密（API 密钥、密码、令牌）
- [ ] 所有用户输入已验证
- [ ] SQL 注入预防（参数化查询）
- [ ] XSS 预防（HTML 清理）
- [ ] CSRF 保护已启用
- [ ] 身份验证/授权已验证
- [ ] 所有端点的速率限制
- [ ] 错误消息不泄露敏感数据

## 秘密管理

```typescript
// 绝不：硬编码的秘密
const apiKey = "sk-proj-xxxxx"

// 始终：环境变量
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## 安全响应协议

如果发现安全问题：
1. 立即停止
2. 使用 **security-reviewer** agent
3. 在继续之前修复关键问题
4. 轮换任何暴露的秘密
5. 检查整个代码库是否存在类似问题
