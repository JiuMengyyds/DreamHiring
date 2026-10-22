# DreamHiring 后端技术复习

适用场景：Java 开发实习面试。目标是把简历中的 Redis、RabbitMQ、事务消息、幂等和死信重投讲准确，而不是只记名词。

## 1. 一分钟项目主线

DreamHiring 是一个面向求职者、企业和平台管理员的全栈招聘平台，后端提供 66 个 REST 接口。求职者可以维护简历和投递职位，企业可以发布职位、审核候选人，管理员负责企业、职位和内容治理。

与本文相关的核心链路是：

1. 企业把候选人状态更新为“邀面试”或“不合适”。
2. 投递记录先在数据库事务中更新。
3. 只有数据库事务提交成功后，系统才向 RabbitMQ 发布状态变更事件。
4. 消费者根据事件写入求职者的站内消息，写入成功后手动 ACK。
5. 同一条消息被重复投递时，数据库通过唯一幂等键避免重复通知。
6. 消费连续失败后，消息归档到 MySQL，并进入 RabbitMQ 死信队列。
7. 管理员可以查看失败消息，并使用原交换机、原路由键进行重投。

建议用下面的顺序介绍项目：

> 项目里最完整的一条异步链路是“投递状态变更通知”。企业更新状态后，业务数据在本地事务中落库，事务提交后再发布 RabbitMQ 事件；消费者写站内消息后手动 ACK。为了处理重复消费，我使用“投递 ID + 状态”作为幂等键；消费失败会重试，重试耗尽后归档到数据库并进入死信队列，管理员可以安全地重投。

## 2. Redis

### 2.1 项目里缓存什么

项目使用 Redis 解决三类问题：

| 场景 | 数据结构或命令 | Key 示例 | 作用 |
|---|---|---|---|
| 热门职位 | ZSET | `job:hot:list` | 按浏览量排序并读取浏览量最高的职位 ID |
| 图形验证码 | String + TTL | `captcha:{uuid}` | 保存验证码，默认 120 秒过期 |
| 登录、注册、验证码限流 | String + `INCR` + TTL | `rate:{rule}:{ip}` | 固定时间窗口内限制同一 IP 的请求次数 |

面试时不要只说“用了 Redis 做缓存”，而要说明缓存对象：

- 热门职位缓存的是职位 ID 和浏览量分值，不是完整的职位详情。
- 缓存命中后，系统仍然按 ID 查询数据库中的职位详情。
- 因此缓存主要减少“热门职位排序和筛选”这部分热点 SQL，而不是缓存所有展示字段。

### 2.2 为什么热门榜单使用 ZSET

Redis ZSET 的每个成员都有一个分数，Redis 可以按分数排序。本项目中：

- 成员：职位 ID，例如 `1001`。
- 分数：职位浏览量，例如 `258`。
- 查询：使用 `reverseRange(key, 0, limit - 1)` 从高到低读取浏览量最高的职位。

ZSET 适合热门榜单，因为它能直接按分数取出 Top N。普通 List 需要自己排序，String 只能保存整体 JSON，更新某个职位的浏览量不方便，Hash 也不适合按分数范围排序。

### 2.3 Cache-Aside 是怎样工作的

热门职位读取流程：

1. 先从 `job:hot:list` 读取职位 ID。
2. 如果 Redis 命中，就根据 ID 查询职位详情，并保持缓存中的排序。
3. 如果 Redis 未命中，就查询 MySQL 热门职位。
4. 将职位 ID 和浏览量写入 ZSET。
5. 设置 10 分钟过期时间。

写入流程可以概括为“删除旧榜单，写入新榜单，再设置 TTL”。职位新增、修改、删除或上下架后会主动清理榜单缓存，10 分钟 TTL 是最终兜底。

这种模式叫 Cache-Aside，也就是业务代码负责：

- 读缓存；
- 未命中时读数据库；
- 把结果写回缓存；
- 数据修改时删除或更新缓存。

### 2.4 Redis 故障时怎么办

热门职位缓存会捕获 Redis 访问异常，记录日志后返回空结果，业务层随后回源 MySQL，因此缓存故障不会直接导致热门职位接口失败。

限流服务也提供了降级路径：Redis 正常时使用 Redis 计数，Redis 抛异常时改用本地 `ConcurrentHashMap` 做单实例固定窗口计数。需要注意，本地降级只能保护单台实例，多实例部署时各实例之间不共享计数。

验证码在 Redis Bean 可用时写入 Redis；没有 Redis 时使用本地内存保存。验证码校验后会删除对应 Key，避免同一个验证码被重复使用。

### 2.5 常见追问

**为什么使用 TTL？**

避免缓存永久存在，也给缓存一致性问题提供一个最终过期时间。本项目热门榜单 TTL 为 10 分钟。

**为什么缓存 ID，不直接缓存职位对象？**

职位详情字段较多，而且详情修改频繁。缓存 ID 只复用“热门排序”结果，详情仍然从数据库读取，能够减少缓存对象过旧的问题。

**Redis 和数据库不一致怎么办？**

当前项目在职位变更时删除缓存，并依靠 TTL 兜底。更严格的方案可以使用延迟双删、消息驱动失效或版本号，但会增加复杂度。这个项目采用简单一致性与最终过期策略。

**是否存在并发刷新问题？**

存在。当前写入是“删除旧 Key 后重新写入”，不是一个原子事务。并发刷新时可能读到短暂空缓存，但会回源数据库。数据量更大时可以使用 Pipeline、Lua 脚本或后台定时刷新。

**Redis 挂了是否影响主业务？**

热门榜单可以回源 MySQL，限流可以降级为单机内存计数。但这不代表 Redis 完全无影响：多实例下限流额度会分散，频繁故障时数据库压力也会增加。

## 3. RabbitMQ 与事务消息

### 3.1 项目拓扑

项目使用 Direct Exchange，并通过 routing key 将消息路由到不同队列：

```text
投递状态事件
  -> dreamhiring.notification.exchange
  -> routing key: application.status.changed
  -> dreamhiring.notification.queue
  -> RabbitNotificationConsumer

失败消息
  -> dreamhiring.notification.dlq
```

交换机、业务队列和死信队列均为持久化声明。消费端使用手动 ACK，`prefetchCount` 为 10。

### 3.2 为什么事务提交后才发送消息

企业更新投递状态时，数据库操作位于 `@Transactional` 中。如果直接在事务中发送消息，可能出现下面情况：

1. 消息已经发送；
2. 后面的数据库操作发生异常；
3. 数据库事务回滚；
4. 求职者却收到了“状态已更新”的错误通知。

项目通过 `TransactionSynchronizationManager.registerSynchronization()` 注册事务同步，在 `afterCommit` 回调中才发布消息。数据库回滚时不会发送消息。

需要准确理解它解决的问题：

- 它能避免“数据库回滚但消息已发”的虚假通知。
- 它不能单独保证消息一定发送成功。
- 如果数据库已经提交，但进程在发送前崩溃，或者 RabbitMQ 暂时不可用，仍然可能丢消息。

**如果面试官追问“怎么保证绝对不丢”，不要回答“afterCommit 已经保证了”。**

更可靠的做法是事务性 Outbox：在同一个数据库事务中写业务表和待发送消息表，再由后台任务扫描并投递到 MQ，成功后再标记已发送。这样数据库提交和“消息待发送”记录具有原子性。

### 3.3 为什么使用手动 ACK

自动 ACK 可能在消费者收到消息时立即确认，而业务数据库还没有写入成功。如果此时消费者宕机，消息已经确认，站内通知就永久丢失。

项目在 `NotificationService.sendOnce()` 成功后才调用 `basicAck`。如果写数据库抛异常，不会 ACK，RabbitMQ 可以重新投递。

对应的顺序是：

```text
收到消息
  -> 幂等写入站内消息
  -> 写入成功
  -> 手动 ACK
```

注意：站内消息写入方法不是显式 `@Transactional` 的单条 INSERT。面试时可以说“当前场景是单条消息表写入，写入成功后再 ACK；如果扩展到多表业务，应把消费逻辑放进明确的事务边界后再提交 ACK”。

### 3.4 重试和死信队列

消费端配置最多 3 次尝试，退避从 1 秒开始，倍数为 2，最大 5 秒：

```text
第 1 次失败 -> 等待约 1 秒
第 2 次失败 -> 等待约 2 秒
第 3 次失败 -> 归档并进入死信队列
```

达到最大尝试次数后，`ArchivingMessageRecoverer` 先把消息内容、队列、交换机、路由键、消息 ID、请求头和失败原因归档到 MySQL，然后使用 `RejectAndDontRequeueRecoverer` 拒绝消息并禁止重新入队，由队列绑定的 DLX 把消息转入死信队列。

为什么需要 DLQ：

- 避免一条持续失败的消息无限重新入队，占满消费线程。
- 保留失败现场，方便定位数据库、序列化或业务代码问题。
- 让管理员在问题修复后重新投递，而不是重新构造消息。

### 3.5 常见追问

**为什么不用自动 ACK？**

自动 ACK 无法保证“业务处理成功后再确认”，消费者处理中途崩溃时可能丢消息。

**为什么消息会重复？**

消费者写库成功但 ACK 丢失、网络抖动、RabbitMQ 重投、管理员重投都可能产生重复消息。可靠消息系统通常只能做到 At-Least-Once，也就是至少消费一次，所以消费端必须幂等。

**RabbitMQ 能否保证 Exactly-Once？**

端到端严格 Exactly-Once 很难，需要生产端、broker 和消费端共同配合。项目采用“至少发送一次 + 业务幂等”，使最终业务效果等价于只处理一次。

**Publisher Confirm 在项目里做什么？**

项目开启了 correlated publisher confirm 和 mandatory return。死信重投时会显式调用 `waitForConfirmsOrDie(5000)`，确认 broker 接收消息。普通通知发布目前使用 `convertAndSend`，面试时不要把全局开启 Confirm 说成“普通发送已经完整处理了所有失败回调”。更完整的实现应对 Confirm 失败进行日志、重试或 Outbox 状态更新。

## 4. 消息幂等

### 4.1 为什么需要幂等键

站内消息表的 `dedup_key` 有唯一索引。投递状态通知的幂等键为：

```text
APPLICATION:{applicationId}:{status}
```

例如：

```text
APPLICATION:1001:INTERVIEW
APPLICATION:1001:REJECTED
```

同一投递的同一条状态消息被重复消费时，两次计算出的 Key 相同，只会插入一条通知。

### 4.2 为什么幂等键要包含状态

如果只使用投递 ID：

```text
APPLICATION:1001
```

那么“邀面试”通知写入后，“不合适”通知会被误认为重复消息并被吞掉。

将状态纳入幂等键后：

- 同一条投递、同一个状态重复消费：幂等；
- 同一条投递、不同合法状态：产生新的通知。

这是项目实际修复过的一个问题。

### 4.3 业务预检查与唯一索引为什么都要

`NotificationService.sendOnce()` 会先查询 `dedup_key` 是否存在，不存在再插入。但两个消费者线程可能同时查到“不存在”，然后同时插入。

因此数据库唯一索引是最终保障。插入时如果违反唯一约束，Spring 会抛出 `DuplicateKeyException`，代码将其视为已经处理过，保证并发情况下也只保留一条消息。

面试回答：

> 预检查用于减少正常情况下的重复写，唯一索引用于处理并发竞争。只靠 Java 里的先查后插不够，因为查询和插入之间存在时间窗口。

### 4.4 常见追问

**为什么不在 Redis 里做幂等？**

Redis 可以做短期去重，但通知记录本身已经要落 MySQL，使用数据库唯一索引更直接，也能和消息记录在同一个存储中保持一致。Redis 适合高频快速去重，不能替代持久化约束。

**唯一键冲突都表示重复消息吗？**

在当前设计里，站内消息的 `dedup_key` 专门表达“同一业务事件只通知一次”，因此唯一键冲突可以视为重复消费。如果没有专门设计幂等字段，不能把任意主键冲突都当成重复消息忽略。

## 5. 死信归档与重投

### 5.1 完整流程

```text
消费失败
  -> Spring AMQP 退避重试
  -> 3 次仍失败
  -> ArchivingMessageRecoverer 归档到 MySQL
  -> broker 将消息转入 DLQ
  -> 管理员查询失败消息
  -> 选择重投
  -> 使用原 exchange + routingKey 重新发布
```

### 5.2 重投状态机

数据库中的重投状态为：

```text
PENDING -> REPLAYING -> REPLAYED
```

管理员点击重投后，系统不会先查询状态再直接更新，而是执行带旧状态条件的更新：

```sql
UPDATE dead_letter_message
SET status = 'REPLAYING'
WHERE id = ? AND status = 'PENDING';
```

只有影响行数为 1 时，当前请求才获得重投资格。两个请求同时点击时，第二个请求的条件更新会返回 0，因此接口返回 409，避免重复发送。

发送成功后执行：

```sql
UPDATE dead_letter_message
SET status = 'REPLAYED'
WHERE id = ? AND status = 'REPLAYING';
```

发送失败则把状态从 `REPLAYING` 恢复为 `PENDING`，允许修复问题后再次重投。

### 5.3 为什么要保存原始消息信息

归档表保存：

- 来源队列；
- 原交换机和路由键；
- 消息体和 Content-Type；
- 消息 ID、关联 ID；
- 可序列化的消息头；
- 失败原因。

重投时恢复这些信息，使消息重新走原来的业务路由。`Channel`、`DeliveryTag` 等只属于某次连接的对象不会被序列化到数据库。

### 5.4 重投为什么还需要幂等

重投成功不会删除 RabbitMQ 死信队列中的原消息，同时端到端也可能出现其他重复。消费者仍然依靠业务幂等键处理重复事件，所以“重投”和“幂等”是两层保障，不能互相替代。

### 5.5 常见追问

**为什么先归档再交给 DLQ？**

数据库归档让管理员能查询消息内容和失败原因，并提供业务重投入口；DLQ 保留 broker 层面的兜底副本。即使数据库归档失败，代码仍会把消息交给 broker 的 DLQ 机制。

**条件更新和悲观锁、乐观锁有什么区别？**

这里使用带旧状态条件的 UPDATE，本质上是一次原子抢锁。只有 `PENDING` 才能被一个请求改成 `REPLAYING`。它比先 `SELECT` 再 `UPDATE` 更安全，也不需要长时间持有行锁。

**发送成功后数据库更新失败怎么办？**

消息可能已经发到 broker，但数据库仍显示 `REPLAYING`。当前实现会让后续重投受限，需要人工排查。更完善的方案是引入重投记录或 Outbox，并设计幂等重试和超时恢复机制。

## 6. 事务与消息边界

| 场景 | 结果 | 项目处理 |
|---|---|---|
| 数据库回滚 | 不应通知 | `afterCommit` 不执行发送 |
| 数据库提交，发送前进程崩溃 | 可能漏消息 | 当前方案无法完全避免，建议 Outbox |
| 消息已发送，消费者处理失败 | 消息需要重试 | 不 ACK，退避重试，耗尽后 DLQ |
| 消息写入成功，ACK 丢失 | 可能重复消费 | `dedup_key` 唯一索引去重 |
| 管理员重复点击重投 | 可能重复发送 | `PENDING -> REPLAYING` 条件更新 |

这张表是面试中最值得记住的内容。核心结论是：

> 本地事务和 RabbitMQ 不是一个事务。项目通过“事务提交后发送 + 消费者幂等 + 重试与 DLQ”降低不一致风险，但没有声称实现严格的分布式事务；要进一步提高可靠性，可以引入事务性 Outbox。

## 7. 高频面试题速答

### 7.1 Redis

**Cache-Aside 的读流程是什么？**

先读缓存，命中直接返回；未命中查数据库，将结果写回缓存。

**为什么热门榜单用 ZSET？**

ZSET 按 score 排序，可以高效获取 Top N。这里 score 是浏览量，member 是职位 ID。

**缓存挂了怎么办？**

热门列表回源 MySQL；限流降级到本地内存。缓存故障不应导致主业务直接不可用。

**缓存一致性怎么保证？**

职位变更时清理缓存，同时依靠 10 分钟 TTL 兜底。当前实现接受短暂不一致。

### 7.2 RabbitMQ

**Exchange、Queue、Routing Key 是什么关系？**

生产者把消息发给 Exchange；Exchange 根据 Routing Key 和绑定关系把消息路由到 Queue；消费者监听 Queue。

**为什么使用手动 ACK？**

等业务写入成功后再确认，避免消费者宕机时消息已经确认而业务未完成。

**消费失败怎么办？**

不 ACK，最多尝试 3 次；仍失败则归档到数据库并进入死信队列。

**为什么要死信队列？**

避免无限重试，保留失败消息，并支持问题修复后重投。

### 7.3 幂等与一致性

**什么是幂等？**

同一条消息被执行一次或多次，最终业务结果相同。

**投递通知的幂等键是什么？**

`APPLICATION:{applicationId}:{status}`。

**为什么有业务查询还要唯一索引？**

查询和插入之间存在并发窗口，唯一索引才能处理真正的并发重复写入。

**afterCommit 能保证消息不丢吗？**

不能。它只保证回滚时不发送。提交后发送失败、进程崩溃依然可能丢消息，需要 Confirm 回调、重试或 Outbox。

## 8. 简历写法

删除原先泛泛的分层描述，将技术架构亮点改成：

- 保留第一条 RBAC 与资源归属校验。
- 增加 Redis ZSET 热门职位缓存与故障回源。
- 增加 RabbitMQ 事务提交后通知、手动 ACK、重试与 DLQ。
- 增加消息幂等与死信归档重投。

适合直接使用的版本：

> **技术架构亮点：**
>
> - 基于 Spring Security + JWT 实现接口级 RBAC，并在 Service 层校验数据归属，限制求职者和企业跨用户访问数据；通过统一响应结构与全局异常处理，保证 401、403、404、409 等错误语义一致。
> - 热门职位使用 Redis ZSET + Cache-Aside 缓存，按浏览量排序并设置 10 分钟 TTL；缓存不可用时自动回源 MySQL，职位变更时主动失效缓存。
> - 投递状态在数据库事务提交后发布 RabbitMQ 事件，消费者完成站内消息写入后再手动 ACK；失败消息最多尝试 3 次，并通过持久化队列和 DLQ 兜底。
> - 使用“投递 ID + 状态”作为消息幂等键，通过预检查与数据库唯一索引防止重复通知；重试耗尽的消息归档至 MySQL，管理员可基于原交换机和路由键安全重投。

对应的疑难问题保留：

> - 针对事务回滚后误发通知的问题，使用 `afterCommit` 在数据库提交后发送消息；同时明确该方案不替代 Outbox，仍需处理提交后发送失败的风险。
> - 针对重复消费和同一投递连续状态变更的问题，使用“投递 ID + 状态”作为幂等键，既过滤重复消息，也避免后一次合法状态被错误去重。
> - 针对死信消息不可见、无法恢复的问题，将失败消息归档到 MySQL，并通过条件更新把状态从 `PENDING` 原子切换为 `REPLAYING`，防止并发重复重投。

## 9. 面试时不要说过头

以下说法容易被追问，而且不完全准确：

- 不要说“RabbitMQ 保证 Exactly-Once”，应说“至少一次投递 + 消费幂等”。
- 不要说“afterCommit 保证消息不丢”，应说“避免回滚后误发，丢消息还需 Confirm、重试或 Outbox”。
- 不要说“Redis 保证缓存和数据库强一致”，当前策略是主动失效加 TTL 最终兜底。
- 不要说“唯一索引完全替代业务检查”，业务检查用于返回友好错误，唯一索引用于并发兜底。
- 不要说“消息重投一定不会重复执行”，应说“重投可能重复，消费者通过幂等键处理”。
- 不要说“系统已经实现高性能”，项目没有正式压测数据，缓存的价值主要体现在减少热点查询。

## 10. 代码定位

- 热门职位缓存：`backend/src/main/java/com/dreamhiring/service/HotJobCacheService.java`
- 热门职位读写：`backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`
- Redis 限流：`backend/src/main/java/com/dreamhiring/service/RateLimitService.java`
- 验证码：`backend/src/main/java/com/dreamhiring/service/CaptchaService.java`
- 事务提交后发送：`backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`
- RabbitMQ 拓扑和重试：`backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConfig.java`
- 投递消息消费者：`backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConsumer.java`
- 幂等键：`backend/src/main/java/com/dreamhiring/messaging/ApplicationStatusChangedEvent.java`
- 幂等写入：`backend/src/main/java/com/dreamhiring/service/NotificationService.java`
- 死信归档：`backend/src/main/java/com/dreamhiring/messaging/ArchivingMessageRecoverer.java`
- 死信重投：`backend/src/main/java/com/dreamhiring/service/impl/DeadLetterServiceImpl.java`
- 死信重投 SQL：`backend/src/main/resources/mapper/DeadLetterMapper.xml`
- RabbitMQ 发布配置：`backend/src/main/resources/application.yml`
- 关键测试：`backend/src/test/java/com/dreamhiring/messaging/RabbitNotificationGatewayTest.java`
- 死信单测：`backend/src/test/java/com/dreamhiring/service/DeadLetterServiceImplTest.java`
- 真实基础设施测试：`backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`

## 11. 自测清单

在把相关技术写回简历前，应能不查资料回答：

- Redis ZSET 的 member 和 score 分别是什么？
- Cache-Aside 命中、未命中、Redis 故障三条路径是什么？
- 为什么消息不在事务内部直接发送？
- `afterCommit` 解决什么问题，不能解决什么问题？
- 为什么消费者要手动 ACK？
- 消费失败后重试几次，最后进入哪里？
- 幂等键为什么包含状态？
- 为什么先查幂等键后仍需要唯一索引？
- 死信重投为什么要使用带旧状态条件的 UPDATE？
- 当前方案是 Exactly-Once 还是 At-Least-Once？

如果其中任意一题无法用自己的话回答，不建议在面试前把它写成“熟练掌握”。可以先按“理解并实现过基础链路”来表述。
