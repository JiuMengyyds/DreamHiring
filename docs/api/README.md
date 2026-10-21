# DreamHiring 招聘平台 API 文档

版本：`V1.0.0`

协议：RESTful + JSON

服务地址：`http://localhost:8080`

机器可读契约：[openapi.json](./openapi.json)

本文件用于前后端评审和联调。`openapi.json` 是接口字段的机器可读基线，可直接导入 Apifox、Postman 或 Swagger UI；本文件补充业务规则、权限、状态机和调用示例。

## 1. 快速开始

### 1.1 导入方式

1. 在 Apifox 或 Postman 中选择导入 OpenAPI 文件。
2. 选择 `docs/api/openapi.json`。
3. 将环境变量 `baseUrl` 设置为 `http://localhost:8080`。
4. 登录后将返回的 `accessToken` 填入 Bearer Token 认证配置。

### 1.2 鉴权

除标记为公开的接口外，请求必须携带：

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

- JWT 默认有效期 2 小时。
- 前端在路由切换前调用 `GET /api/auth/me` 恢复身份。
- 前端角色守卫只用于交互控制，后端必须使用 Spring Security 和 `@PreAuthorize` 再次校验。
- 账号被禁用后，后端应拒绝该账号已签发 JWT 的后续访问。

前端 Axios 拦截器必须排除 `/api/auth/login`、`/api/auth/register` 和 `/api/auth/captcha`。登录接口的 `401` 表示账号或密码错误，应交给登录表单展示，不能清空 token、刷新页面或跳转登录页。

## 2. 通用约定

### 2.1 统一响应 `Result<T>`

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `code` | integer | V1.0 成功固定为 `200`；失败使用对应 HTTP 状态码 |
| `msg` | string | 面向展示的结果说明 |
| `data` | object / array / null | 业务数据 |

### 2.2 分页结构 `PageVO<T>`

```json
{
  "records": [],
  "total": 0,
  "page": 1,
  "size": 10
}
```

- `page` 从 1 开始。
- `size` 默认 10，最大 100。
- 列表接口一律通过 `data.records` 获取记录。

### 2.3 类型约定

- 主键统一为 `int64` 数字，不使用字符串 ID。
- 日期时间统一使用 `yyyy-MM-dd HH:mm:ss`，例如 `2026-10-20 12:30:00`。
- 时区固定为 GMT+8（Asia/Shanghai），接口入参、响应、日志、消息、领域事件和数据库读写全链路保持一致。
- 仅日期字段使用 `yyyy-MM-dd`，不得与日期时间字段混用格式。
- 金额统一使用月薪 `K`，例如 `25` 表示 `25K/月`。
- 技能标签、福利标签等列表字段统一使用 JSON 字符串数组。
- 密码字段只允许写入，任何响应都不得返回密码或密码摘要。

## 3. 角色与权限

| 角色 | 枚举值 | 核心权限 |
|---|---|---|
| 求职者 | `SEEKER` | 职位检索、简历管理、投递、进度查询、消息、市场洞察 |
| 企业用户 | `COMPANY` | 企业资料、职位发布与上下架、候选人处理、企业看板、消息 |
| 平台管理员 | `ADMIN` | 用户与企业治理、职位审核、分类公告、全局数据看板 |
| 匿名用户 | `PUBLIC` | 公开职位、分类、公告和市场统计 |

职位检索、热门职位和职位详情允许匿名访问；求职者携带 JWT 时，响应会额外返回 `matchScore` 和匹配解释。角色越权统一返回 `403`。

## 4. 接口清单

### 4.1 认证与账户

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| AUTH-01 | POST | `/api/auth/captcha` | 获取图形验证码 | PUBLIC | `authCaptcha` |
| AUTH-02 | POST | `/api/auth/register` | 注册求职者或企业账号 | PUBLIC | `authRegister` |
| AUTH-03 | POST | `/api/auth/login` | 账号登录 | PUBLIC | `authLogin` |
| AUTH-04 | POST | `/api/auth/logout` | 退出登录 | 全部登录角色 | `authLogout` |
| AUTH-05 | GET | `/api/auth/me` | 获取当前登录身份 | 全部登录角色 | `authMe` |
| USER-01 | GET | `/api/users/me` | 获取当前用户资料 | 全部登录角色 | `userGetMe` |
| USER-02 | PUT | `/api/users/me` | 更新当前用户资料 | 全部登录角色 | `userUpdateMe` |
| USER-03 | PUT | `/api/users/me/password` | 修改密码 | 全部登录角色 | `userChangePassword` |

### 4.2 文件与公开内容

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| FILE-01 | POST | `/api/files` | 上传简历附件、作品集、Logo 或头像到 OSS | 全部登录角色 | `fileUpload` |
| JOB-01 | GET | `/api/jobs` | 职位多条件检索 | PUBLIC / SEEKER | `jobSearch` |
| JOB-02 | GET | `/api/jobs/hot` | 获取热门职位 | PUBLIC / SEEKER | `jobHot` |
| JOB-03 | GET | `/api/jobs/{jobId}` | 获取职位详情 | PUBLIC / SEEKER | `jobDetail` |
| CATEGORY-01 | GET | `/api/job-categories/tree` | 获取两级职位分类树 | PUBLIC | `categoryTree` |
| ANNOUNCEMENT-01 | GET | `/api/announcements` | 获取已发布公告 | PUBLIC | `announcementList` |
| ANNOUNCEMENT-02 | GET | `/api/announcements/{announcementId}` | 获取公告详情 | PUBLIC | `announcementDetail` |

### 4.3 简历

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| RESUME-01 | GET | `/api/resumes` | 获取我的简历列表 | SEEKER | `resumeList` |
| RESUME-02 | POST | `/api/resumes` | 创建在线简历 | SEEKER | `resumeCreate` |
| RESUME-03 | GET | `/api/resumes/{resumeId}` | 获取简历详情 | SEEKER | `resumeDetail` |
| RESUME-04 | PUT | `/api/resumes/{resumeId}` | 更新在线简历 | SEEKER | `resumeUpdate` |
| RESUME-05 | DELETE | `/api/resumes/{resumeId}` | 删除在线简历 | SEEKER | `resumeDelete` |
| RESUME-06 | PUT | `/api/resumes/{resumeId}/default` | 设为默认简历 | SEEKER | `resumeSetDefault` |
| RESUME-07 | POST | `/api/resumes/{resumeId}/attachment` | 上传简历附件 | SEEKER | `resumeAttachment` |

### 4.4 投递

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| APP-01 | POST | `/api/applications` | 投递职位 | SEEKER | `applicationCreate` |
| APP-02 | GET | `/api/applications/my` | 获取我的投递 | SEEKER | `applicationMine` |
| APP-03 | GET | `/api/applications/{applicationId}` | 获取我的投递详情 | SEEKER | `applicationMyDetail` |
| APP-04 | GET | `/api/company/applications` | 企业候选人列表 | COMPANY | `companyApplicationList` |
| APP-05 | GET | `/api/company/applications/{applicationId}` | 企业查看候选人详情 | COMPANY | `companyApplicationDetail` |
| APP-06 | PUT | `/api/company/applications/{applicationId}/status` | 更新候选人状态 | COMPANY | `companyApplicationUpdateStatus` |
| APP-07 | PUT | `/api/company/applications/{applicationId}/remark` | 更新企业备注 | COMPANY | `companyApplicationUpdateRemark` |

### 4.5 企业

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| COMPANY-01 | GET | `/api/company/profile` | 获取企业资料 | COMPANY | `companyProfileGet` |
| COMPANY-02 | PUT | `/api/company/profile` | 更新企业资料 | COMPANY | `companyProfileUpdate` |
| COMPANY-JOB-01 | GET | `/api/company/jobs` | 企业职位列表 | COMPANY | `companyJobList` |
| COMPANY-JOB-02 | POST | `/api/company/jobs` | 发布职位并提交审核 | COMPANY | `companyJobCreate` |
| COMPANY-JOB-03 | GET | `/api/company/jobs/{jobId}` | 企业职位详情 | COMPANY | `companyJobDetail` |
| COMPANY-JOB-04 | PUT | `/api/company/jobs/{jobId}` | 更新职位 | COMPANY | `companyJobUpdate` |
| COMPANY-JOB-05 | DELETE | `/api/company/jobs/{jobId}` | 删除职位 | COMPANY | `companyJobDelete` |
| COMPANY-JOB-06 | PUT | `/api/company/jobs/{jobId}/status` | 更新职位上下架状态 | COMPANY | `companyJobUpdateStatus` |
| COMPANY-DASH-01 | GET | `/api/company/dashboard` | 企业招聘看板 | COMPANY | `companyDashboard` |

### 4.6 消息

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| MESSAGE-01 | GET | `/api/messages` | 获取站内消息 | 全部登录角色 | `messageList` |
| MESSAGE-02 | GET | `/api/messages/unread-count` | 获取未读消息数 | 全部登录角色 | `messageUnreadCount` |
| MESSAGE-03 | GET | `/api/messages/{messageId}` | 获取消息详情 | 全部登录角色 | `messageDetail` |
| MESSAGE-04 | PUT | `/api/messages/{messageId}/read` | 标记单条消息已读 | 全部登录角色 | `messageMarkRead` |
| MESSAGE-05 | PUT | `/api/messages/read-all` | 全部标为已读 | 全部登录角色 | `messageMarkAllRead` |
| MESSAGE-06 | DELETE | `/api/messages/{messageId}` | 删除消息 | 全部登录角色 | `messageDelete` |

### 4.7 平台管理

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| ADMIN-USER-01 | GET | `/api/admin/users` | 查询平台用户 | ADMIN | `adminUserList` |
| ADMIN-USER-02 | GET | `/api/admin/users/{userId}` | 用户详情 | ADMIN | `adminUserDetail` |
| ADMIN-USER-03 | PUT | `/api/admin/users/{userId}/status` | 启用或禁用用户 | ADMIN | `adminUserUpdateStatus` |
| ADMIN-USER-04 | DELETE | `/api/admin/users/{userId}` | 仅删除无业务关联的空账号 | ADMIN | `adminUserDelete` |
| ADMIN-COMPANY-01 | GET | `/api/admin/companies` | 查询企业 | ADMIN | `adminCompanyList` |
| ADMIN-COMPANY-02 | GET | `/api/admin/companies/{companyId}` | 企业详情 | ADMIN | `adminCompanyDetail` |
| ADMIN-COMPANY-03 | PUT | `/api/admin/companies/{companyId}/audit` | 审核企业资质 | ADMIN | `adminCompanyAudit` |
| ADMIN-JOB-01 | GET | `/api/admin/jobs` | 查询全平台职位 | ADMIN | `adminJobList` |
| ADMIN-JOB-02 | GET | `/api/admin/jobs/{jobId}` | 管理员职位详情 | ADMIN | `adminJobDetail` |
| ADMIN-JOB-03 | PUT | `/api/admin/jobs/{jobId}/audit` | 审核职位 | ADMIN | `adminJobAudit` |
| ADMIN-CATEGORY-01 | POST | `/api/admin/job-categories` | 创建职位分类 | ADMIN | `adminCategoryCreate` |
| ADMIN-CATEGORY-02 | PUT | `/api/admin/job-categories/{categoryId}` | 更新职位分类 | ADMIN | `adminCategoryUpdate` |
| ADMIN-CATEGORY-03 | DELETE | `/api/admin/job-categories/{categoryId}` | 删除未被引用的叶子分类 | ADMIN | `adminCategoryDelete` |
| ADMIN-ANNOUNCEMENT-01 | GET | `/api/admin/announcements` | 查询全部公告 | ADMIN | `adminAnnouncementList` |
| ADMIN-ANNOUNCEMENT-02 | POST | `/api/admin/announcements` | 创建公告 | ADMIN | `adminAnnouncementCreate` |
| ADMIN-ANNOUNCEMENT-03 | PUT | `/api/admin/announcements/{announcementId}` | 更新公告 | ADMIN | `adminAnnouncementUpdate` |
| ADMIN-ANNOUNCEMENT-04 | DELETE | `/api/admin/announcements/{announcementId}` | 删除公告 | ADMIN | `adminAnnouncementDelete` |

### 4.8 数据洞察

| 编号 | Method | Path | 说明 | 权限 | operationId |
|---|---|---|---|---|---|
| STAT-01 | GET | `/api/stats/dashboard` | 大屏聚合数据 | PUBLIC | `statsDashboard` |
| STAT-02 | GET | `/api/stats/trend` | 招聘趋势 | PUBLIC | `statsTrend` |
| STAT-03 | GET | `/api/stats/hot-skills` | 热门技能 | PUBLIC | `statsHotSkills` |

## 5. 枚举与状态机

### 5.1 用户与审核

| 枚举 | 值 |
|---|---|
| 用户角色 | `SEEKER`, `COMPANY`, `ADMIN` |
| 用户状态 | `ACTIVE`, `DISABLED` |
| 审核状态 | `PENDING`, `APPROVED`, `REJECTED` |
| 公告状态 | `DRAFT`, `PUBLISHED`, `OFFLINE` |
| 公告触达范围 | `ALL`, `SEEKER`, `COMPANY` |

### 5.2 职位状态

```text
DRAFT ──提交审核──> PENDING ──通过──> APPROVED/PUBLISHED ──下线──> OFFLINE
                         └──驳回──> REJECTED/需修改
```

- `status` 表示招聘状态：`DRAFT`、`PUBLISHED`、`OFFLINE`。
- `auditStatus` 表示审核状态：`PENDING`、`APPROVED`、`REJECTED`。
- 未审核通过的职位不能设为 `PUBLISHED`。
- 企业更新职位关键字段后，职位重新进入 `PENDING`。

### 5.3 投递状态

| 值 | 展示文案 | 允许流转 |
|---|---|---|
| `PENDING_VIEW` | 待查看 | `VIEWED`、`INTERVIEW`、`REJECTED` |
| `VIEWED` | 已查看 | `INTERVIEW`、`REJECTED` |
| `INTERVIEW` | 邀面试 | `REJECTED` |
| `REJECTED` | 不合适 | 终态 |

例外规则：

- 同一 `resumeId + jobId` 只允许存在一条有效投递，重复投递返回 `409`。
- 投递创建时保存 `matchScore` 快照，后续简历修改不回溯已有投递。
- `INTERVIEW` 或 `REJECTED` 成功后写站内消息事件；消费者按 `relatedId + type` 幂等写 `message` 表。

### 5.4 消息类型

| 值 | 场景 |
|---|---|
| `APPLICATION` | 投递状态变更、面试邀请 |
| `ANNOUNCEMENT` | 平台公告 |
| `SYSTEM` | 账号、职位审核、系统通知 |

## 6. 核心业务规则

### 6.1 职位匹配度

匹配度范围为 `0-100`：

```text
matchedWeight = Σ(职位技能标签权重 × 简历是否覆盖)
matchScore = round(matchedWeight / totalJobWeight × 100)
```

- 职位技能标签为主权重。
- 重复技能标签先去重。
- 简历或职位任一技能列表为空时返回 `0`。
- 匹配解释至少返回 `matchedSkills`、`missingSkills`、`matchedCount`、`totalCount`。
- 企业端和求职者端读取同一份投递快照，避免双方看到不同分值。

### 6.2 文件上传

- 允许格式：`pdf`、`png`、`jpg`、`jpeg`、`webp`。
- 单文件上限：10MB。
- 所有文件统一存储到 OSS 对象存储，本地磁盘不承担文件持久化职责。
- 后端接收文件后生成唯一 `objectKey`，原始文件名仅用于展示。
- 数据库只保存 `objectKey`，不保存可能过期的临时签名 URL。
- 简历附件使用私有读权限，读取时返回短期签名 URL，并在响应中给出 `urlExpiresAt`。
- 企业 Logo 和头像可使用公开 Bucket 路径或 CDN 地址，`urlExpiresAt` 返回 `null`。
- 建议对象键格式：`resume/{userId}/{yyyy}/{MM}/{uuid}.pdf`、`company/{companyId}/logo/{uuid}.webp`、`avatar/{userId}/{uuid}.webp`。
- 禁止直接信任客户端 `Content-Type`，必须读取文件头校验。
- OSS Endpoint、Bucket、访问密钥等通过环境变量或外部配置注入，禁止写入仓库。
- 替换附件、删除简历或清理账号时，应同步删除不再被业务数据引用的 OSS 对象。

### 6.3 热门职位

- Redis Key：`job:hot:list`，ZSET，TTL 10 分钟。
- 热度依据：职位浏览量。
- 采用 Cache-Aside，缓存失败时回源 MySQL 并尝试回填。
- 热门列表只包含审核通过且已上架职位。

### 6.4 安全要求

- 密码使用 BCrypt 加密。
- 验证码保存在 Redis，TTL 120 秒且只允许使用一次。
- 所有写接口必须记录操作人、资源 ID、动作和结果。
- OSS 私有对象禁止匿名读取，临时签名 URL 需设置较短有效期；公开资源与私有资源使用不同访问策略。
- 文件、简历、投递、企业资料和管理接口均需做资源归属校验。

### 6.5 删除与数据保留

#### 用户删除

- `DELETE /api/admin/users/{userId}` 仅用于删除没有任何业务关联的空账号。
- 用户存在简历、投递、企业绑定、消息或其他业务数据时，统一返回 `409`。
- 不得级联删除简历、投递、消息或企业数据。
- 日常账号治理应使用 `PUT /api/admin/users/{userId}/status` 禁用账号，而不是删除。
- 账号禁用后，现有 JWT 必须失效或拒绝继续访问受保护资源。
- V1.0 不开放“注销有业务数据账号”的复杂归档与匿名化流程，避免破坏企业侧招聘历史。

#### 分类删除

- 仅允许删除没有子分类、且未被任何职位引用的叶子分类。
- 存在子分类时返回 `409`，错误语义为 `CATEGORY_HAS_CHILDREN`。
- 被职位引用时返回 `409`，错误语义为 `CATEGORY_IN_USE`。
- 不得级联删除子分类，不得自动迁移职位，也不得自动删除关联职位。

## 7. 错误响应

| HTTP / code | 场景 | 示例 msg |
|---|---|---|
| `400` | 参数格式错误、验证码缺失/过期/错误 | `验证码无效或已过期` |
| `401` | 未登录、JWT 过期/无效或账号密码错误 | `请检查登录信息或重新登录` |
| `403` | 角色或资源归属无权限 | `无权执行该操作` |
| `404` | 资源不存在或已删除 | `资源不存在或已删除` |
| `409` | 重复投递、状态非法流转 | `当前状态不允许执行该操作` |
| `413` | 上传文件过大 | `文件大小不能超过 10MB` |
| `422` | 薪资区间、技能标签等业务校验失败 | `业务规则校验失败` |
| `429` | 登录、验证码等请求过于频繁 | `操作过于频繁，请稍后再试` |
| `500` | 未捕获服务端异常 | `系统繁忙，请稍后重试` |

错误响应不返回堆栈、SQL、文件路径或框架内部信息。

## 8. 典型调用示例

### 8.1 登录

请求：

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "linzhixia",
  "password": "DreamHiring2026",
  "captchaId": "3f8d9e70-c0b2-4a53-a8e1-34fd3fe906fc",
  "captchaCode": "7K3P"
}
```

响应：

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 7200,
    "user": {
      "id": 10001,
      "username": "linzhixia",
      "nickname": "林知夏",
      "role": "SEEKER",
      "status": "ACTIVE"
    }
  }
}
```

### 8.2 职位检索

```http
GET /api/jobs?city=杭州&salaryMin=20&education=BACHELOR&experience=THREE_TO_FIVE&page=1&size=10
Authorization: Bearer <token>
```

求职者登录后，职位列表中每项包含 `matchScore`；匿名访问时为 `null`。

### 8.3 投递职位

```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "jobId": 20001,
  "resumeId": 30001
}
```

成功响应的 `data.status` 为 `PENDING_VIEW`，`data.matchScore` 为投递时快照。

### 8.4 处理候选人

```http
PUT /api/company/applications/40001/status
Authorization: Bearer <company-token>
Content-Type: application/json
```

```json
{
  "status": "INTERVIEW",
  "remark": "作品集与岗位方向匹配，安排第一轮面试"
}
```

### 8.5 数据大屏

`GET /api/stats/dashboard` 的 `data` 同时返回：

- `overview`：样本数、平均薪资、供需比、平均匹配度。
- `salaryDistribution`
- `cityDistribution`
- `educationDistribution`
- `experienceDistribution`
- `industryDistribution`
- `trend`
- `hotSkills`
- `metadata`：数据源、统计日期和更新时间。

## 9. 契约维护与验证

接口变更时按以下顺序修改：

1. 修改 `docs/api/generate-openapi.mjs`。
2. 重新生成规范：

```powershell
node .\docs\api\generate-openapi.mjs
```

3. 更新本文件中的接口清单和业务规则。
4. 运行契约测试：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\docs\api\tests\run-tests.ps1
```

契约测试会检查 OpenAPI 版本、64 个操作、全部 `$ref`、角色声明、核心状态枚举、统一响应结构、GMT+8 日期时间格式、OSS 对象字段，以及 Markdown 与 OpenAPI 的 operationId 是否一致。
