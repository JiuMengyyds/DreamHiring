# DreamHiring Backend

基于 JDK 21、Spring Boot 3、Spring Security、MyBatis、MySQL、Redis、RabbitMQ 和 OSS 的招聘平台后端。

当前已实现接口文档中的 64 个操作，覆盖认证与用户、职位与分类、简历与投递、企业招聘、消息、公告、平台管理和数据洞察。Controller 路由与 OpenAPI 完全匹配，核心请求/响应模型字段由自动化契约测试校验。

## 本地启动

1. 使用 `db/mysql-schema.sql` 创建 `dream_hiring` 数据库和表。
2. 按本机基础设施配置 `src/main/resources/application-dev.yml`，该文件不进入 Git。
3. 填写 MySQL、Redis、RabbitMQ 和 OSS 配置。
4. 开发环境可保留 `app.seed-demo.enabled=true`，首次启动自动创建演示账号和一个示例职位。
5. 启动 `com.dreamhiring.DreamHiringApplication`。

演示账号密码统一为 `dreamhiring`：

- 求职者：`linzhixia`
- 企业：`chenyu_hr`
- 管理员：`admin_zhou`

## 配置模式

- `app.storage.mode=oss`：上传到 OSS。
- `app.storage.mode=stub`：测试环境占位存储。
- `app.messaging.mode=rabbit`：投递状态通知通过 RabbitMQ。
- `app.messaging.mode=local`：测试环境直接写消息表。

生产 Profile、环境变量、Nginx、systemd 和可重复发布流程见 [`../deploy/README.md`](../deploy/README.md)。

## 测试

```powershell
mvn clean test
mvn package
```

测试使用 H2 MySQL 兼容模式、MyBatis XML、Spring Security 和 JWT，不会依赖本机 MySQL、Redis 或 RabbitMQ。

需要验证本机真实 Redis 与 RabbitMQ 时，先启动 RabbitMQ 并显式开启基础设施测试：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File E:\develop\tools\DreamHiring-DevEnv\Start-DreamHiringRabbitMQ.ps1
$env:RUN_INFRA_TESTS = 'true'
mvn -Dtest=InfrastructureSmokeTest test
```

填写有效的 `application-dev.yml` 后，可只读验证真实 MySQL 连接和核心表：

```powershell
$env:RUN_MYSQL_TESTS = 'true'
mvn -Dtest=MySqlSmokeTest test
```

若 `application-dev.yml` 中的数据库密码仍是 `change-me`，MySQL 冒烟测试会明确失败，不会修改或重置现有数据库账号。

## 关键实现

- `Result`、`PageVO` 和异常处理保证 HTTP 状态与响应体 `code` 一致。
- Java Time 在 JVM、Jackson、接口和 OSS 签名中统一使用 GMT+8。
- 热门职位使用 Redis ZSET Cache-Aside，Redis 不可用时自动回源 MySQL。
- 投递状态变更在事务提交后发送 RabbitMQ 消息，消费者手动 ACK、失败重试并投递死信队列。
- 站内消息使用唯一幂等键，避免 RabbitMQ 重复消费产生重复通知。
- 文件按文件头识别真实类型；OSS 只保存对象键，数据库不保存临时签名 URL。
- 所有非 GET API 通过 AOP 写入操作日志。
- 验证码、登录和注册按 IP 使用 Redis 固定窗口限流，Redis 故障时回退到内存计数。

## 接口

接口契约位于 `../docs/api/README.md` 和 `../docs/api/openapi.json`，Controller 路径和 operationId 应与 OpenAPI 保持一致。
