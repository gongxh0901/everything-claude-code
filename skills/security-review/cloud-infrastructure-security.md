| name | description |
|------|-------------|
| cloud-infrastructure-security | 部署到云平台、配置基础设施、管理 IAM 策略、设置日志/监控或实现 CI/CD 流水线时使用此技能。提供符合最佳实践的云安全检查清单。 |

# 云和基础设施安全技能

此技能确保云基础设施、CI/CD 流水线和部署配置遵循安全最佳实践并符合行业标准。

## 何时激活

- 部署应用到云平台（AWS、Vercel、Railway、Cloudflare）
- 配置 IAM 角色和权限
- 设置 CI/CD 流水线
- 实现基础设施即代码（Terraform、CloudFormation）
- 配置日志和监控
- 在云环境中管理密钥
- 设置 CDN 和边缘安全
- 实现灾难恢复和备份策略

## 云安全检查清单

### 1. IAM 和访问控制

#### 最小权限原则

```yaml
# ✅ 正确：最小权限
iam_role:
  permissions:
    - s3:GetObject  # 只有读取权限
    - s3:ListBucket
  resources:
    - arn:aws:s3:::my-bucket/*  # 仅特定存储桶

# ❌ 错误：过于宽泛的权限
iam_role:
  permissions:
    - s3:*  # 所有 S3 操作
  resources:
    - "*"  # 所有资源
```

#### 多因素认证 (MFA)

```bash
# 始终为 root/admin 账户启用 MFA
aws iam enable-mfa-device \
  --user-name admin \
  --serial-number arn:aws:iam::123456789:mfa/admin \
  --authentication-code1 123456 \
  --authentication-code2 789012
```

#### 验证步骤

- [ ] 生产环境不使用 root 账户
- [ ] 所有特权账户启用 MFA
- [ ] 服务账户使用角色，而非长期凭证
- [ ] IAM 策略遵循最小权限
- [ ] 定期进行访问审查
- [ ] 轮换或移除未使用的凭证

### 2. 密钥管理

#### 云密钥管理器

```typescript
// ✅ 正确：使用云密钥管理器
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'prod/api-key' });
const apiKey = JSON.parse(secret.SecretString).key;

// ❌ 错误：硬编码或仅在环境变量中
const apiKey = process.env.API_KEY; // 不轮换，不审计
```

#### 密钥轮换

```bash
# 为数据库凭证设置自动轮换
aws secretsmanager rotate-secret \
  --secret-id prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate \
  --rotation-rules AutomaticallyAfterDays=30
```

#### 验证步骤

- [ ] 所有密钥存储在云密钥管理器中（AWS Secrets Manager、Vercel Secrets）
- [ ] 数据库凭证启用自动轮换
- [ ] API 密钥至少每季度轮换
- [ ] 代码、日志或错误消息中无密钥
- [ ] 启用密钥访问审计日志

### 3. 网络安全

#### VPC 和防火墙配置

```terraform
# ✅ 正确：受限的安全组
resource "aws_security_group" "app" {
  name = "app-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # 仅内部 VPC
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 仅 HTTPS 出站
  }
}

# ❌ 错误：对互联网开放
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 所有端口，所有 IP！
  }
}
```

#### 验证步骤

- [ ] 数据库不公开访问
- [ ] SSH/RDP 端口仅限 VPN/堡垒机
- [ ] 安全组遵循最小权限
- [ ] 配置网络 ACL
- [ ] 启用 VPC 流日志

### 4. 日志和监控

#### CloudWatch/日志配置

```typescript
// ✅ 正确：全面的日志记录
import { CloudWatchLogsClient, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

const logSecurityEvent = async (event: SecurityEvent) => {
  await cloudwatch.putLogEvents({
    logGroupName: '/aws/security/events',
    logStreamName: 'authentication',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify({
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        result: event.result,
        // 绝不记录敏感数据
      })
    }]
  });
};
```

#### 验证步骤

- [ ] 所有服务启用 CloudWatch/日志
- [ ] 记录失败的认证尝试
- [ ] 审计管理员操作
- [ ] 配置日志保留（合规要求 90+ 天）
- [ ] 配置可疑活动告警
- [ ] 日志集中且防篡改

### 5. CI/CD 流水线安全

#### 安全流水线配置

```yaml
# ✅ 正确：安全的 GitHub Actions 工作流
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read  # 最小权限

    steps:
      - uses: actions/checkout@v4

      # 扫描密钥
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main

      # 依赖审计
      - name: Audit dependencies
        run: npm audit --audit-level=high

      # 使用 OIDC，而非长期令牌
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
```

#### 供应链安全

```json
// package.json - 使用锁文件和完整性检查
{
  "scripts": {
    "install": "npm ci",  // 使用 ci 进行可重现构建
    "audit": "npm audit --audit-level=moderate",
    "check": "npm outdated"
  }
}
```

#### 验证步骤

- [ ] 使用 OIDC 而非长期凭证
- [ ] 流水线中有密钥扫描
- [ ] 依赖漏洞扫描
- [ ] 容器镜像扫描（如适用）
- [ ] 强制分支保护规则
- [ ] 合并前需要代码审查
- [ ] 强制签名提交

### 6. Cloudflare 和 CDN 安全

#### Cloudflare 安全配置

```typescript
// ✅ 正确：带安全头的 Cloudflare Workers
export default {
  async fetch(request: Request): Promise<Response> {
    const response = await fetch(request);

    // 添加安全头
    const headers = new Headers(response.headers);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=()');

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};
```

#### WAF 规则

```bash
# 启用 Cloudflare WAF 托管规则
# - OWASP 核心规则集
# - Cloudflare 托管规则集
# - 速率限制规则
# - 机器人防护
```

#### 验证步骤

- [ ] 启用带 OWASP 规则的 WAF
- [ ] 配置速率限制
- [ ] 启用机器人防护
- [ ] 启用 DDoS 防护
- [ ] 配置安全头
- [ ] 启用 SSL/TLS 严格模式

### 7. 备份和灾难恢复

#### 自动备份

```terraform
# ✅ 正确：自动 RDS 备份
resource "aws_db_instance" "main" {
  allocated_storage     = 20
  engine               = "postgres"

  backup_retention_period = 30  # 30 天保留
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = true  # 防止意外删除
}
```

#### 验证步骤

- [ ] 配置每日自动备份
- [ ] 备份保留满足合规要求
- [ ] 启用时间点恢复
- [ ] 每季度进行备份测试
- [ ] 记录灾难恢复计划
- [ ] 定义并测试 RPO 和 RTO

## 生产云部署前检查清单

任何生产云部署之前：

- [ ] **IAM**: 不使用 root 账户，启用 MFA，最小权限策略
- [ ] **密钥**: 所有密钥在云密钥管理器中并轮换
- [ ] **网络**: 安全组受限，无公开数据库
- [ ] **日志**: 启用 CloudWatch/日志并设置保留
- [ ] **监控**: 配置异常告警
- [ ] **CI/CD**: OIDC 认证，密钥扫描，依赖审计
- [ ] **CDN/WAF**: 启用带 OWASP 规则的 Cloudflare WAF
- [ ] **加密**: 数据在静止和传输时加密
- [ ] **备份**: 自动备份并测试恢复
- [ ] **合规**: 满足 GDPR/HIPAA 要求（如适用）
- [ ] **文档**: 记录基础设施，创建运维手册
- [ ] **事件响应**: 安全事件计划就位

## 常见云安全配置错误

### S3 存储桶暴露

```bash
# ❌ 错误：公开存储桶
aws s3api put-bucket-acl --bucket my-bucket --acl public-read

# ✅ 正确：带特定访问的私有存储桶
aws s3api put-bucket-acl --bucket my-bucket --acl private
aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json
```

### RDS 公开访问

```terraform
# ❌ 错误
resource "aws_db_instance" "bad" {
  publicly_accessible = true  # 绝不要这样做！
}

# ✅ 正确
resource "aws_db_instance" "good" {
  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.db.id]
}
```

## 资源

- [AWS 安全最佳实践](https://aws.amazon.com/security/best-practices/)
- [CIS AWS 基础基准](https://www.cisecurity.org/benchmark/amazon_web_services)
- [Cloudflare 安全文档](https://developers.cloudflare.com/security/)
- [OWASP 云安全](https://owasp.org/www-project-cloud-security/)
- [Terraform 安全最佳实践](https://www.terraform.io/docs/cloud/guides/recommended-practices/)

**切记**：云配置错误是数据泄露的首要原因。一个暴露的 S3 存储桶或过于宽松的 IAM 策略可能危及整个基础设施。始终遵循最小权限原则和纵深防御。
