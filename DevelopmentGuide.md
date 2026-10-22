# 开发指南

本文档用于记录项目中各个功能模块的实现方式，便于后续维护、排查问题和迭代开发。

## 记录规范

每完成一个功能模块，应在本文档中新增对应章节，说明以下内容：

- 功能目标与使用场景
- 涉及的文件与核心代码位置
- 关键实现思路与数据流
- 与其他模块的依赖关系
- 已知限制与后续改进方向

## 功能模块


### 招聘平台 V1.0 页面原型 Demo

#### 功能目标

在正式开发 Vue 3 前端和后端接口之前，先用可交互的高保真原型验证 DreamHiring 的信息架构、视觉方向与三角色业务闭环，方便产品侧确认最终实现效果。

原型覆盖：

- 求职者：职位检索、职位详情与匹配度解释、一键投递、投递进度、在线简历、站内消息。
- 企业：招聘概览、职位发布与上下架、候选人流程、企业资料。
- 管理员：平台驾驶舱、职位审核、用户管理、企业管理、分类与公告。
- 数据洞察：招聘趋势、薪资分布、城市分布、学历要求、经验要求、行业需求和热门技能词云共 7 类图表。
- 登录注册：三角色身份选择、验证码展示和演示入口。

#### 涉及文件

- `demo/index.html`：页面容器、SVG 图标库与原型入口。
- `demo/styles.css`：设计系统、响应式布局、三角色页面和数据大屏样式。
- `demo/app.js`：模拟数据、Hash 路由、状态管理、表单交互与业务动作。
- `demo/tests/demo.tests.mjs`：资源完整性、路由渲染和关键交互的自动化验收。
- `demo/tests/run-tests.ps1`：原型测试命令入口。
- `demo/previews/preview-*.png`：首页、职位广场、企业候选人、管理员驾驶舱、数据大屏和登录页视觉快照。

#### 实现思路

1. 使用纯 HTML/CSS/JavaScript 构建零依赖原型，直接打开 `demo/index.html` 即可体验，不需要安装 npm 依赖或启动后端。
2. 使用 Hash 路由拆分 `seeker/*`、`company/*`、`admin/*`、`dashboard` 和 `login` 页面；页面切换时根据角色重新渲染侧栏、顶栏和内容区。
3. 使用单一内存状态对象保存投递记录、未读消息、简历技能标签、候选人状态、职位状态和审核状态。关键动作会即时更新界面，用于验证完整交互路径。
4. 求职者投递时生成匹配度快照；企业更新候选人状态时，同步更新演示中的求职者投递进度和站内消息，直观呈现跨角色联动。
5. 数据大屏使用原生 SVG、CSS 渐变和定位布局模拟图表效果；正式接入时按相同信息层级替换为 ECharts 5，并由后端聚合接口提供数据。
6. 页面适配 1440px 桌面端、平板和移动端；移动端侧栏切换为抽屉导航，复杂表格支持横向滚动。

#### 数据流与扩展边界

- 原型数据全部位于 `demo/app.js` 顶部，不请求网络，不读写生产数据。
- 页面中的职位、简历、候选人、审核和统计字段与 `招募系统V1.0基础架构方案.md` 的核心数据模型保持一致。
- 正式实现时，保留页面结构和交互状态，将内存数据替换为 Axios 请求、Pinia 状态和 Vue Router 路由；图表数据接入 `analysis_stat` / `analysis_skill_hot` 聚合接口。
- 本阶段不包含后端、数据库、登录鉴权和真实文件上传；这些能力留待后续按架构方案实施。

#### 使用方式

直接双击打开：

```text
demo/index.html
```

或通过本地静态服务器访问 `demo/`。右上角 `DEMO` 菜单可切换求职者、企业 HR 和管理员视角；左侧导航进入对应业务页面。

#### 测试

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\demo\tests\run-tests.ps1
```

测试使用本机 Edge/Chrome 的无头模式，验证：

- 原型不依赖远程资源，所有 SVG 图标均有定义。
- 职位筛选结果数量与城市条件一致。
- 一键投递后页面状态与提示正确更新。
- 企业候选人状态流转可用。
- 管理员审核通过后待审核数量减少。
- 数据大屏渲染 7 个图表卡片和 15 个技能词。
- 登录页与三角色切换入口正常渲染，且无页面脚本异常。

#### 已知限制

- 原型使用内存状态，刷新页面后交互产生的数据会恢复为初始模拟数据。
- 图表为视觉原型实现，不包含真实数据聚合、筛选下钻和 ECharts 交互能力。
- 搜索、导出、附件预览等次要入口以提示反馈模拟，未连接真实文件或接口。
- 当前采用零依赖静态页面以保证快速评审；正式工程仍需按架构方案拆分为 Vue 3 + Vite + Element Plus 项目。

### 招聘平台前端工程实现

#### 功能目标

在页面原型确认后，使用正式技术栈实现可运行、可扩展的招聘平台前端，覆盖求职者、企业和管理员三类角色的业务页面，以及登录和数据洞察大屏。

#### 技术栈

- Vue 3 + Vite
- Element Plus：表格、表单、弹窗、标签等基础组件
- Vue Router：页面路由和角色守卫
- Pinia：登录态与用户信息管理
- Axios：统一请求封装
- ECharts：数据洞察大屏图表
- Vitest：单元测试

#### 涉及文件

- `frontend/src/main.js`：应用入口，注册 Pinia、Router、Element Plus 和图标组件。
- `frontend/src/App.vue`：根组件，挂载路由出口。
- `frontend/src/router/index.js`：路由表和 `beforeEach` 角色守卫。
- `frontend/src/router/nav.js`：按角色维护侧边导航配置。
- `frontend/src/layouts/MainLayout.vue`：侧边栏、顶栏和主内容区布局。
- `frontend/src/stores/auth.js`：登录态、用户信息和本地持久化。
- `frontend/src/api/client.js`：Axios 实例、JWT 注入、统一响应处理。
- `frontend/src/api/index.js`：按模块组织的接口调用函数。
- `frontend/src/utils/constants.js`：角色、状态枚举和展示文案。
- `frontend/src/utils/format.js`：薪资、日期、匹配度等格式化函数。
- `frontend/src/components/`：页面复用组件。
- `frontend/src/views/`：各角色业务页面。
- `frontend/src/style.css`：全局设计系统和布局样式。

#### 实现思路

1. 入口使用 Vue 3 Composition API，按 `api / components / layouts / router / stores / views / utils` 分层组织。
2. 路由采用嵌套结构，主布局为公共父级，三个角色的业务页面作为子路由加载；`meta.roles` 声明页面允许访问的角色。
3. `beforeEach` 守卫负责未登录跳转登录页、已登录访问登录页跳转工作台、角色越权跳转对应角色首页。
4. 登录态由 Pinia 管理，token 和用户信息写入 `localStorage`；Axios 请求拦截器自动注入 `Authorization: Bearer <token>`。
5. 响应拦截器按 `Result<T>` 的 `code` 处理成功和错误，业务接口统一返回 `data`。
6. 求职者页面包含职位筛选、详情匹配、投递、进度、简历和消息；企业页面包含招聘看板、职位管理、候选人流程和企业资料；管理员页面包含驾驶舱、审核、用户、企业和内容治理。
7. 数据大屏使用 ECharts 的折线、柱状和饼图，聚合接口返回的数据直接映射为图表配置。
8. 复用组件将匹配度环形图、职位卡片、统计卡片和页面标题抽离，避免各页面重复实现。

#### 数据流与扩展边界

- 接口地址统一从环境变量 `VITE_API_BASE_URL` 读取。
- 页面请求通过 `src/api/index.js` 暴露的函数发起，不在业务组件中直接拼接 URL。
- 时间字段遵循接口契约使用 `yyyy-MM-dd HH:mm:ss`，前端仅做展示格式化，不做时区转换。
- 状态枚举文案集中在 `constants.js`，页面只消费枚举值和类型，不重复硬编码颜色或文案。
- 登录后服务端返回角色，路由守卫据此限制页面访问。
- 生产构建在 `dist/` 中生成，Nginx 部署时可托管静态资源并通过 `/api` 反向代理到后端。

#### 测试

```powershell
cd E:\develop\DreamHiring\frontend
npm test
npm run build
```

单元测试覆盖：

- 薪资、日期和匹配度格式化。
- 登录成功、登录失败和退出登录。
- 接口返回结构和关键业务规则。

#### 已知限制

- 当前开发环境使用本地 Mock 数据，未接入真实后端。
- 数据大屏图表打包体积较大，后续可改为按需引入 ECharts 模块。
- 附件上传、真实文件预览和管理员复杂审核材料仍以后端能力为准。

### 后端工程骨架与启动类

#### 功能目标

建立可被 IDEA 直接导入和运行的 Spring Boot 后端工程骨架，作为后续逐个实现 Controller、Service、Mapper 和基础设施类的基础。

#### 涉及文件

- `backend/pom.xml`：Spring Boot 3.5.16 父工程、JDK 21、基础依赖和测试配置。
- `backend/src/main/java/com/dreamhiring/DreamHiringApplication.java`：应用启动类。
- `backend/src/main/resources/application.yml`：应用名、端口和 JSON 日期格式基础配置。
- `backend/src/main/resources/application.yml` 和本机忽略的 `application-dev.yml`：公共配置与本地基础设施配置。
- `backend/src/test/java/com/dreamhiring/DreamHiringApplicationTests.java`：启动上下文测试。

#### 实现思路

1. 后端工程统一放在仓库根目录 `backend/` 下，作为独立 Maven 模块。
2. 启动类位于 `com.dreamhiring` 根包，使用 `@SpringBootApplication` 开启自动配置和组件扫描。
3. 当前只引入 Web、Validation、Lombok、配置处理器和测试依赖；数据库、安全、消息和文件依赖将随对应模块按需加入。
4. `application-dev.yml` 不进入版本库，本地按实际 MySQL、Redis、RabbitMQ 和 OSS 配置填写；生产配置由 `application-prod.yml` 和环境变量提供。
5. 默认端口 8080，配置文件区分基础配置和多环境配置。

#### 验证

```powershell
cd E:\develop\DreamHiring\backend
mvn test
```

`DreamHiringApplicationTests` 使用 `@SpringBootTest` 验证 Spring 上下文可以正常启动。

#### 已知限制

- 当前尚未接入数据库、Redis、RabbitMQ、Spring Security 和 OSS。
- Jackson 的 `date-format` 主要用于普通 Date 类型，后续接入 Java Time 类型时需要统一实现 `yyyy-MM-dd HH:mm:ss` 序列化。

### 后端统一响应结构 Result

#### 功能目标

定义所有后端接口共用的 `Result<T>` 响应结构，确保成功码、错误码和数据类型统一，避免 Controller 直接返回实体或 Map。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/Result.java`：统一响应实体和静态工厂方法。
- `backend/src/test/java/com/dreamhiring/common/ResultTest.java`：成功、无数据和失败场景测试。

#### 实现思路

1. `Result` 使用 `code / msg / data` 三个只读字段，通过私有构造器限制创建入口。
2. 成功场景固定 `code=200`，提供 `success()` 和 `success(data)` 两个工厂方法。
3. 失败场景提供 `failure(code, msg)`，code 直接使用 HTTP 状态码。
4. 业务数据类型使用泛型 `T`，保证 Controller 返回类型可推断。
5. `isSuccess()` 只判断 `code == 200`，后续可以用于统一校验和响应拦截。
6. 当前不直接依赖错误码枚举，后续增加全局异常处理时再扩展错误码类型。

#### 已知限制

- 暂未内置异常到 Result 的自动转换，后续由 `@RestControllerAdvice` 完成。
- 后续如需区分业务错误子码，可在保持现有结构不变的前提下增加可选字段。

### 后端统一分页结构 PageVO

#### 功能目标

统一列表接口的分页返回结构，字段与接口契约保持一致，避免不同 Controller 返回不同分页字段。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/PageVO.java`：分页响应实体和静态工厂方法。
- `backend/src/test/java/com/dreamhiring/common/PageVOTest.java`：正常分页和空分页测试。

#### 实现思路

1. `PageVO` 固定包含 `records`、`total`、`page`、`size` 四个字段。
2. `records` 使用泛型 List，`total` 使用 long，`page` 从 1 开始。
3. 提供 `of(records, total, page, size)` 静态工厂方法，降低 Controller 中的构造噪音。
4. 保留无参构造器以兼容 Jackson 反序列化和未来可能的缓存反序列化场景。
5. 不在该结构中加入额外统计字段，统计信息应使用独立 VO。

#### 已知限制

- 当前由调用方保证 page、size 合法；后续在 Controller 参数校验和 Service 层统一兜底。
- 后续接入 PageHelper 时，由 Service 将 PageHelper 结果转换为 PageVO。

### 后端统一状态码枚举 ResultCode

#### 功能目标

集中管理标准响应码和默认消息，消除 `Result` 及后续异常处理中反复出现 `200`、`400`、`401` 等魔法数字。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/ResultCode.java`：标准响应码和默认消息枚举。
- `backend/src/main/java/com/dreamhiring/common/Result.java`：改为通过 `ResultCode` 构造响应。
- `backend/src/test/java/com/dreamhiring/common/ResultTest.java`：补充默认消息、自定义消息和枚举契约测试。

#### 实现思路

1. `ResultCode` 使用枚举绑定 `code` 和 `defaultMessage`，避免数字与默认文案分散。
2. `Result.success()` 固定使用 `ResultCode.SUCCESS`。
3. `Result.failure(ResultCode)` 使用枚举默认消息。
4. `Result.failure(ResultCode, String)` 允许业务覆盖默认消息，但状态码仍来自枚举。
5. `Result.isSuccess()` 与 `ResultCode.SUCCESS` 比较，不再硬编码成功码。
6. 删除直接接收整数 code 的 `failure` 入口，从 API 层面阻止新的状态码字面量进入业务代码。

#### 已知限制

- 当前枚举只覆盖接口约定的标准 HTTP 类状态码。
- 如果后续需要机器可读的业务子码，应评估是否在接口中增加独立 `errorCode` 字段，而不是继续扩展整数 code 的含义。

### 后端业务异常 BusinessException

#### 功能目标

为可预期业务错误提供统一异常类型，使 Service 可以表达业务失败，并由后续全局异常处理器转换为 `Result<T>`。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/BusinessException.java`：业务异常类型。
- `backend/src/test/java/com/dreamhiring/common/BusinessExceptionTest.java`：默认消息、自定义消息和空状态码测试。
- `backend/pom.xml`：显式设置 Maven Compiler Plugin 使用 Java 21。

#### 实现思路

1. `BusinessException` 继承 `RuntimeException`，避免业务代码被受检异常污染。
2. 异常携带 `ResultCode`，后续全局异常处理器可以直接读取标准状态码。
3. 默认构造器使用 `ResultCode.defaultMessage`。
4. 第二个构造器允许传入具体业务消息，但仍强制要求非空 `ResultCode`。
5. 异常消息为空或空白时回退到默认消息，避免前端收到空错误提示。
6. 测试覆盖默认消息、自定义消息和 null 状态码校验。

#### Java 21 编译级别修正

本机 Maven 全局 `settings.xml` 中存在默认激活的 `jdk-11` Profile，会覆盖项目 `java.version=21`。为避免修改全局配置影响其他项目，在 `backend/pom.xml` 的 `maven-compiler-plugin` 中显式配置 `release=21`。清理并重新编译后，class 主版本为 65，确认实际使用 Java 21 编译。

#### 已知限制

- 当前还没有 `@RestControllerAdvice`，业务异常尚未自动转换为 HTTP 响应。
- 后续需要补充数据库异常、参数校验异常和权限异常的映射。

### 后端全局异常处理器 GlobalExceptionHandler

#### 功能目标

统一把业务异常和常见 Web 异常转换为 `Result<T>`，保证 HTTP 状态码与响应体 `code` 一致，并避免向前端暴露堆栈和内部异常信息。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/GlobalExceptionHandler.java`：全局异常映射与统一响应构造。
- `backend/src/test/java/com/dreamhiring/common/GlobalExceptionHandlerTest.java`：业务异常、参数校验和未知异常测试。

#### 实现思路

1. 使用 `@RestControllerAdvice` 集中处理异常。
2. `BusinessException` 按其 `ResultCode` 转换为对应 HTTP 状态和 `Result`。
3. `MethodArgumentNotValidException` 提取字段校验消息，多个字段错误用中文分号连接。
4. `ConstraintViolationException`、请求体格式错误、缺少请求参数和参数类型不匹配统一返回 `400`。
5. 上传文件过大返回 `413`，静态资源不存在返回 `404`。
6. 未捕获异常记录完整服务端日志，但只向客户端返回统一的 `500` 消息。
7. 响应通过 `ResponseEntity<Result<Void>>` 构造，确保 HTTP 状态和 `Result.code` 不产生偏差。

#### 已知限制

- 尚未加入 Spring Security，`401` 和 `403` 的过滤器级异常将在安全模块中接入。
- 后续需要增加数据库唯一键冲突、请求方法不支持等更精确的异常映射。
- 参数校验消息直接来自 DTO，需要保持面向用户且不包含内部字段名以外的技术信息。

### 后端用户角色枚举 UserRole

#### 功能目标

统一定义平台角色、角色展示名称和 Spring Security authority，为认证、JWT 授权和 `@PreAuthorize` 权限控制提供唯一角色来源。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/UserRole.java`：角色枚举、authority 和角色解析方法。
- `backend/src/test/java/com/dreamhiring/security/UserRoleTest.java`：角色契约、大小写解析和非法角色测试。

#### 实现思路

1. 角色枚举固定为 `SEEKER`、`COMPANY`、`ADMIN`，与接口文档保持一致。
2. 每个角色包含展示名称和 Spring Security authority，例如 `ROLE_SEEKER`。
3. `fromCode` 支持去除首尾空格并忽略大小写，用于 JWT 或数据库角色值解析。
4. 非法角色直接抛出 `IllegalArgumentException`，避免未知角色进入权限链。
5. 枚举不依赖 Spring Security 类，保持 common/security 模块边界清晰。

#### 已知限制

- 当前角色解析只支持三种 V1.0 角色，不支持临时访客或 HR 子账号。
- 后续接入 Spring Security 时，需要在认证对象中把 authority 注入 GrantedAuthority。

### 招聘平台后端 V1.0 总体边界

#### 功能目标

按照架构方案、接口文档和 OpenAPI 契约完成招聘平台 V1.0 后端。实现范围覆盖接口清单中的 66 个操作，并保持角色权限、资源归属、状态机、统一响应、北京时间、Redis、RabbitMQ、OSS 和离线分析线的一致性。

#### 工程与分层

- `backend/src/main/java/com/dreamhiring/controller`：11 个 Controller，只负责参数校验、权限入口、调用 Service 和返回 VO。
- `backend/src/main/java/com/dreamhiring/service`：认证、用户、职位、分类、简历、投递、企业、消息、公告、统计、文件、缓存和操作日志服务。
- `backend/src/main/java/com/dreamhiring/mapper` 与 `resources/mapper`：MyBatis 接口和 XML，显式列出查询字段。
- `backend/src/main/java/com/dreamhiring/entity`：数据库持久化实体。
- `backend/src/main/java/com/dreamhiring/dto`：带 Jakarta Validation 的请求模型。
- `backend/src/main/java/com/dreamhiring/vo`：与 OpenAPI 字段一致的响应模型。
- `backend/src/main/java/com/dreamhiring/security`：JWT 解析、Spring Security 身份、角色枚举和权限 authority。
- `backend/src/main/java/com/dreamhiring/messaging`：RabbitMQ 发布、消费、手动 ACK、重试和死信配置。
- `backend/src/main/java/com/dreamhiring/storage`：统一 OSS 存储接口、真实 OSS 实现和测试替身。
- `backend/analysis`：pandas/NumPy 招聘数据清洗和统计结果生成脚本。
- `backend/db/mysql-schema.sql`：MySQL 8 建库建表和索引脚本。

#### 接口与数据契约

1. 所有成功响应统一为 `Result<T>`，只包含 `code / msg / data`；`isSuccess()` 仅供服务端判断，通过 `@JsonIgnore` 排除在 JSON 外。
2. 分页统一为 `PageVO<T>`，字段固定为 `records / total / page / size`。
3. `LocalDateTime` 固定序列化为 `yyyy-MM-dd HH:mm:ss`，纯日期固定为 `yyyy-MM-dd`，应用默认时区设为 `Asia/Shanghai`。
4. 验证码错误返回 `400`；JWT 缺失、失效和账号密码错误返回 `401`；越权返回 `403`；不存在返回 `404`；重复投递、非法状态流转和删除受限资源返回 `409`；业务校验失败返回 `422`。
5. OpenAPI 的请求和响应模型字段由自动化反射测试逐项比对，避免 VO/DTO 字段与契约悄悄漂移。
6. 职位持久化分工、要求、福利和发布时间；企业持久化联系人、审核原因；用户资料返回创建、更新和最近登录时间；消息响应字段使用 `isRead`；公告使用 `publishedAt`。

#### 认证与权限

- 使用 Spring Security 过滤器链和 JWT，不在 Controller 中自行解析令牌。
- 密码使用 `DelegatingPasswordEncoder`，开发种子数据使用 BCrypt 哈希生成。
- JWT 每次请求都读取数据库用户状态，账号禁用后会拒绝已有 JWT 继续访问。
- 公开接口仅包括验证码、注册、登录、公开职位、分类、公告和数据洞察；企业与管理接口由方法级和路径级角色规则双重约束。
- 企业职位、候选人、企业资料均校验资源归属；求职者简历与投递只能访问本人数据。

#### 核心业务模块

- 职位检索、热门职位、详情、分类树：只公开审核通过且已上架职位；求职者访问时根据默认简历返回匹配分与匹配解释。
- 简历：支持多简历、默认简历、附件上传、附件替换时清理旧对象，以及删除简历时事务提交后清理附件。
- 投递：`resumeId + jobId` 唯一；保存匹配分快照；状态机集中定义；进入邀面试或不合适时发出站内通知事件。
- 企业：维护资料、职位、候选人状态和企业看板；职位关键内容更新后重新进入待审核；未审核职位不能上架。
- 管理端：用户、企业、职位、分类和公告治理；存在业务数据的用户只允许禁用，不允许级联删除；分类存在子分类或职位引用时返回 `409`。
- 数据洞察：薪资、城市、学历、经验、行业分布和热门技能读取分析结果表；招聘趋势按最近月份聚合职位与投递数据，不再返回空数组。

#### Redis、RabbitMQ 与 OSS

- 验证码写入 `captcha:{uuid}`，TTL 120 秒，校验后一次性消费。
- 热门职位使用 `job:hot:list` ZSET 和 10 分钟 TTL，采用 Cache-Aside；Redis 异常时自动回源 MySQL，不回滚主业务。
- 投递通知在数据库事务提交后发送到 RabbitMQ；交换机和队列持久化，Publisher Confirm/Return 已开启。
- 消费者使用手动 ACK；失败最多重试 3 次，最终拒绝并不重新入队，由队列死信配置转入 DLQ。
- 消息表使用 `dedup_key` 唯一索引，投递通知按 `APPLICATION:{applicationId}:{status}` 构造幂等键；重复消费不会重复写入，同一投递的后续合法状态仍会通知。
- OSS 接口不向业务层暴露 SDK；数据库只保存 `objectKey`，简历读取时生成短期访问 URL。上传通过文件头识别 PDF/PNG/JPEG/WebP，不信任客户端声明的 Content-Type。

#### 操作日志与离线分析

- AOP 拦截所有 POST/PUT/PATCH/DELETE Controller 方法，将操作人、资源类型、资源 ID、动作、结果和时间写入 `operation_log`。
- 操作日志使用独立事务，业务失败不会吞掉原异常，日志失败也不会改变业务响应。
- `backend/analysis/job_market_analysis.py` 使用 pandas/NumPy 完成去重、城市归一、薪资单位与区间统一、学历和经验标准化、维度占比和热门技能统计。
- 分析脚本默认只生成可审查 SQL；显式传 `--execute` 时才通过本机 mysql 客户端写入，并在同一事务内替换同数据集同日期结果。

#### 数据库

- 业务表、分析结果表和操作日志表均提供索引；高频查询覆盖城市/状态/薪资、企业、分类、用户消息和投递唯一键。
- 招聘数据与离线分析结果表分离，在线统计接口不直接执行 pandas 作业。
- 开发种子数据由 `DemoDataInitializer` 在显式开关下创建，生产环境默认关闭。

#### 测试与验证

```powershell
. E:\develop\tools\DreamHiring-DevEnv\Activate-DreamHiringEnv.ps1
cd E:\develop\DreamHiring\backend
mvn clean test
mvn package
```

- Controller 路由与 OpenAPI 的 66 个操作精确匹配。
- 请求/响应模型字段与 OpenAPI schema 反射比对。
- H2 MySQL 兼容模式覆盖核心数据库集成流程、统一响应、时间格式、权限、状态机、删除约束、缓存回源和操作日志。
- 真实 Redis、RabbitMQ 冒烟测试通过，覆盖验证码键、热门职位 ZSET、MQ 发布、手动 ACK 消费和消息落库。
- 分析脚本单元测试覆盖薪资格式、技能拆分、清洗、摘要和 SQL 生成。
- 真实 MySQL 冒烟测试代码已提供，但本机 `application-dev.yml` 的数据库密码仍为示例占位值，当前连接被 MySQL 拒绝；需配置有效凭据后执行 `RUN_MYSQL_TESTS=true` 测试。

#### 已知限制

- 真实 MySQL 连接尚未验证，原因是本地开发配置未提供有效数据库密码；不得通过重置现有数据库账号规避。
- OSS 的真实上传和签名 URL 需要有效 Endpoint、Bucket、AccessKey、Secret，当前自动化测试只验证存储抽象和文件校验。
- 招聘通知当前只做站内消息消费者；邮件和短信消费者属于后续扩展。
- 操作日志当前写入数据库，未实现后台查询页面；日志表和管理查询接口不在 V1.0 接口清单中。



#### 逐类文档维护规则

新增 Java 类时，必须在本文档增加对应路径和实现说明；删除或重命名类时同步更新条目。`docs/architecture/tests/architecture-doc.tests.mjs` 会自动读取所有 Java 文件，缺少任一类条目的文档测试将失败。



#### 逐类文档维护规则

新增 Java 类时，必须在本文档增加对应路径和实现说明；删除或重命名类时同步更新条目。`docs/architecture/tests/architecture-doc.tests.mjs` 会自动读取所有 Java 文件，缺少任一类条目的文档测试将失败。

### 后端逐类详细实现

本节按每个类的“功能目标、涉及文件、实现思路”记录具体做法。简单 Entity、DTO 和 VO 也单独成条，避免只按包或模块概括。

#### 启动、公共基础与配置

##### `DreamHiringApplication`

###### 功能目标

建立 Spring Boot 应用入口，并在任何 Bean 初始化和业务时间计算之前，把 JVM 默认时区固定为 `Asia/Shanghai`，保证本地运行、测试和部署环境得到一致的业务日期。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/DreamHiringApplication.java`：应用启动入口。
- `backend/src/test/java/com/dreamhiring/DreamHiringApplicationTests.java`：验证 Spring 上下文和测试配置可以启动。

###### 实现思路

1. 在 `main` 方法中先调用 `TimeZone.setDefault`，再执行 `SpringApplication.run`，避免 Jackson、JDBC 和日志初始化早于时区设置。
2. 使用 `@SpringBootApplication` 启用组件扫描、自动配置和配置属性绑定。
3. 启动类只承担进程入口职责，不直接创建数据库连接、消息队列或业务对象。
4. 当外部选择 `test` 或 `infra` Profile 时，继续通过 Spring 配置覆盖数据源和外部基础设施模式。

##### `BusinessException`

###### 功能目标

为可预期业务错误提供统一异常类型，使 Service 能表达“资源不存在、状态冲突、业务校验失败”等情况，同时让全局异常处理器获得稳定状态码和用户可读消息。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/BusinessException.java`：业务异常定义。
- `backend/src/main/java/com/dreamhiring/common/ResultCode.java`：异常使用的状态码来源。
- `backend/src/test/java/com/dreamhiring/common/BusinessExceptionTest.java`：默认消息、自定义消息和空状态码测试。

###### 实现思路

1. `BusinessException` 继承 `RuntimeException`，避免 Service 接口被受检异常污染。
2. 使用 `Objects.requireNonNull` 强制要求 `ResultCode`，阻止没有响应语义的异常进入全局处理器。
3. 构造器接收可选自定义消息；消息为空或纯空白时回退到 `ResultCode.defaultMessage`。
4. 异常只保存状态码和消息，不拼接 SQL、文件路径或内部堆栈，避免敏感信息通过响应外泄。
5. `GlobalExceptionHandler` 读取 `getResultCode()` 生成 HTTP 状态和统一响应。

##### `GlobalExceptionHandler`

###### 功能目标

把所有常见 Controller 异常转换为统一的 `Result<Void>`，使 HTTP 状态码与响应体 `code` 一致，并向客户端隐藏数据库、堆栈和框架内部细节。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/GlobalExceptionHandler.java`：统一异常映射。
- `backend/src/test/java/com/dreamhiring/common/GlobalExceptionHandlerTest.java`：业务异常、参数校验和未知异常测试。

###### 实现思路

1. 使用 `@RestControllerAdvice` 集中声明异常处理方法，Controller 和 Service 不各自拼装错误响应。
2. `BusinessException` 直接使用其 `ResultCode`；Bean Validation 错误读取字段错误并用中文分号合并。
3. 请求体格式错误、缺少参数和类型不匹配统一映射为 `400`，上传超限映射为 `413`，静态资源不存在映射为 `404`。
4. 未识别异常先记录完整服务端日志，再返回不含异常文本的 `500`。
5. `buildResponse` 使用同一个 `ResultCode` 同时设置 `ResponseEntity.status` 和 `Result.failure`，避免 HTTP 状态与业务 code 不一致。

##### `PageVO`

###### 功能目标

定义所有分页接口共用的返回结构，固定 `records / total / page / size` 四个字段，避免不同模块返回不同分页命名。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/PageVO.java`：分页 VO 和静态工厂。
- `backend/src/test/java/com/dreamhiring/common/PageVOTest.java`：正常分页和空分页测试。

###### 实现思路

1. 使用泛型 `T` 表示记录类型，`records` 始终为 `List<T>`，`total` 使用 `long`。
2. 保留无参构造器，兼容 Jackson 反序列化或未来缓存重放。
3. 提供 `of(records, total, page, size)`，Service 只负责提供当前页数据和总记录数。
4. 分页结构不夹带额外统计字段，未读数、总览等数据使用独立 VO。
5. 各 Service 将 PageHelper 的 `Page` 或手动分页结果转换为该对象，Controller 不处理分页细节。

##### `PageRequest`

###### 功能目标

集中定义分页请求的默认值和边界，避免各 Service 重复实现页码、页大小校验，并保证列表接口的分页行为和接口文档一致。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/PageRequest.java`：分页参数值对象和收敛规则。
- `backend/src/test/java/com/dreamhiring/common/PageRequestTest.java`：默认值、下界和上界测试。
- `backend/src/main/java/com/dreamhiring/service/impl` 下各列表 Service：统一先转换为 `PageRequest` 再调用 PageHelper。
- `docs/api/README.md`、`docs/api/generate-openapi.mjs`：分页规则和参数说明。

###### 实现思路

1. 页码最小为 1，小于 1 时自动按 1 处理。
2. 页大小默认 10，最小为 1，最大为 100；越界值自动收敛。
3. 服务层先构造 `PageRequest`，再同时使用其中的 `page`、`size` 调用 PageHelper 和组装 `PageVO`。
4. 越界参数不返回 400，响应中的分页字段始终反映服务端实际使用的值。
5. 企业职位、平台用户、企业、职位审核、公告、消息、投递和死信列表全部复用该规则。

##### `Result`

###### 功能目标

定义所有 API 共用的 `code / msg / data` 响应结构，集中成功与失败响应的创建方式，并确保内部判断方法不会被序列化到 JSON。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/Result.java`：统一响应实体和静态工厂。
- `backend/src/test/java/com/dreamhiring/common/ResultTest.java`：成功、失败、默认消息、状态码契约和 JSON 字段测试。

###### 实现思路

1. `code / msg / data` 声明为只读字段，私有构造器统一处理默认消息。
2. 成功场景使用 `success()` 和 `success(data)`，状态码只取自 `ResultCode.SUCCESS`。
3. 失败场景使用 `failure(ResultCode)` 或 `failure(ResultCode, msg)`，不允许直接传整数状态码。
4. `isSuccess()` 只用于服务端判断，并标注 `@JsonIgnore`，所以对外 JSON 固定只有三个字段。
5. Controller、全局异常处理器和 Security 过滤器都通过该结构生成响应。

##### `ResultCode`

###### 功能目标

集中定义标准 HTTP 语义状态码和默认中文消息，消除业务代码中的 `200`、`400`、`401` 等魔法数字。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/ResultCode.java`：状态码枚举。
- `backend/src/test/java/com/dreamhiring/common/ResultTest.java`：接口状态码一致性测试。

###### 实现思路

1. 使用枚举值绑定整数 `code` 和 `defaultMessage`，例如成功、参数错误、未认证、冲突和服务器错误。
2. 通过 Lombok `@Getter` 暴露只读属性，不提供运行时修改入口。
3. `Result`、`BusinessException`、安全过滤器和全局异常处理器共享同一枚举。
4. 业务子错误通过可读 `msg` 表达，不另造含义重叠的整数 code。
5. 当前枚举覆盖 V1.0 接口清单声明的标准状态码。

##### `DemoDataInitializer`

###### 功能目标

在显式启用开发种子数据时创建三个演示角色、示例企业、分类、职位和简历，使前后端联调不依赖手工录入。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/DemoDataInitializer.java`：初始化逻辑。
- `backend/src/main/resources/application.yml`：`app.seed-demo.enabled` 默认值和覆盖规则。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：提供密码编码器。

###### 实现思路

1. 通过 `@ConditionalOnProperty` 只在 `app.seed-demo.enabled=true` 时创建 Runner，生产环境默认不执行。
2. 先检查 `linzhixia` 是否存在，存在即整体跳过，保证重复启动不会重复插入。
3. 使用 `PasswordEncoder` 生成 `dreamhiring` 的密码哈希，再分别创建求职者、企业和管理员账号。
4. 企业账号同步创建已审核企业，随后插入示例分类、已发布职位和默认简历。
5. 所有插入集中在 `@Transactional` 方法中，失败时整体回滚。

##### `JacksonConfig`

###### 功能目标

统一所有 Java Time 字段的 JSON 格式和时区，解决 `spring.jackson.date-format` 不能完整控制 `LocalDateTime` 的问题。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/JacksonConfig.java`：Jackson 自定义器。
- `backend/src/main/resources/application.yml`：Jackson 基础时区配置。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：实际响应时间格式断言。

###### 实现思路

1. 注册 `Jackson2ObjectMapperBuilderCustomizer`，在 Spring 创建 ObjectMapper 时追加序列化器。
2. 为 `LocalDateTime` 配置 `yyyy-MM-dd HH:mm:ss`，为 `LocalDate` 配置 `yyyy-MM-dd`。
3. 同时配置反序列化器，保证测试和未来请求体解析使用同一格式。
4. 将 ObjectMapper 时区设置为 `Asia/Shanghai`，并与 JVM、JDBC、OSS 签名时间保持一致。
5. 契约测试读取真实 MockMvc 响应并检查时间字段不出现 ISO `T` 分隔符。

##### `OperationLogAspect`

###### 功能目标

对所有写 API 自动记录操作者、资源、动作和结果，避免每个 Service 手写重复审计代码。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/OperationLogAspect.java`：Controller 写操作切面。
- `backend/src/main/java/com/dreamhiring/service/OperationLogService.java`：日志持久化服务。
- `backend/src/main/java/com/dreamhiring/entity/OperationLog.java`：日志实体。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：真实写请求后日志落库测试。

###### 实现思路

1. 使用 `@Around` 匹配 `com.dreamhiring.controller` 下的公共方法。
2. 从 `RequestContextHolder` 获取 HTTP Method 和最佳匹配路径，只拦截 POST、PUT、PATCH、DELETE。
3. 路径变量中优先提取数字资源 ID；创建接口成功时，反射返回 record 的 `id` 访问器提取新 ID。
4. 从 SecurityContext 获取操作人 ID；公开注册和登录没有认证主体时记录 `null`。
5. 成功记录 `SUCCESS`，异常记录 `FAILED` 和异常类名，并始终重新抛出原异常。
6. 日志写入使用独立事务；日志组件自身异常只写应用日志，不改变业务响应。

##### `SecurityConfig`

###### 功能目标

建立无状态 Spring Security 权限边界，统一 JWT 认证、角色授权、CORS、密码编码和 401/403 JSON 响应。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：过滤器链与密码编码器。
- `backend/src/main/java/com/dreamhiring/security/JwtAuthenticationFilter.java`：JWT 认证过滤器。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：401、403 和角色访问测试。

###### 实现思路

1. 关闭 CSRF，设置 `SessionCreationPolicy.STATELESS`，所有身份由 JWT 恢复。
2. 公开验证码、注册、登录、职位、分类、公告和统计；企业、管理员、简历和投递分别限制对应角色。
3. 在 `UsernamePasswordAuthenticationFilter` 前加入 JWT 过滤器，解析后把 `SecurityPrincipal` 和 authority 放入上下文。
4. 认证入口写 `Result.failure(UNAUTHORIZED)`，访问拒绝写 `Result.failure(FORBIDDEN)`，HTTP 状态与 body code 一致。
5. 使用 `DelegatingPasswordEncoder` 支持带算法前缀的密码哈希。
6. CORS 从 `CorsProperties` 读取白名单，本地默认只放行 Vite 来源，生产由环境变量覆盖，并允许 Axios 所需的认证头。

##### `CorsProperties`

###### 功能目标

把前后端联调的 CORS 白名单从硬编码开发地址改为可外部化配置，使生产环境只允许正式前端域名，同时保留本地开发默认值。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/CorsProperties.java`：绑定 `app.cors.allowed-origins`。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：把配置来源传给 Spring Security CORS。
- `backend/src/main/resources/application.yml`：本地开发默认来源。
- `backend/src/main/resources/application-prod.yml`：生产环境变量。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：预检响应白名单测试。

###### 实现思路

1. `@ConfigurationProperties` 把逗号分隔的环境变量绑定为 `List<String>`。
2. 默认值只包含本地 Vite 的 `localhost` 和 `127.0.0.1` 地址。
3. `SecurityConfig` 从该属性对象读取允许来源，不再维护固定来源列表。
4. 生产环境必须通过 `DREAMHIRING_CORS_ALLOWED_ORIGINS` 提供正式域名。
5. 保留 `allowCredentials=true`，因此禁止把允许来源配置成 `*`。

##### `StorageConfig`

###### 功能目标

统一创建并管理 OSS 客户端，使 OSS SDK 实例可复用、可关闭，且测试模式不会连接真实云服务。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/StorageConfig.java`：OSS Bean 配置。
- `backend/src/main/java/com/dreamhiring/storage/StorageProperties.java`：OSS 配置属性。
- `backend/src/main/resources/application.yml`、`application-prod.yml`：外部化配置和环境变量。

###### 实现思路

1. 使用 `@EnableConfigurationProperties` 启用存储配置绑定。
2. 仅在 `app.storage.mode=oss` 时创建 `OSS` Bean。
3. Endpoint、AccessKey 和 Secret 全部来自配置，不进入源码。
4. 使用 `destroyMethod="shutdown"` 在应用关闭时释放 HTTP 连接池。
5. `stub` 模式通过条件装配改用 `StubObjectStorageService`，避免测试网络依赖。

#### 认证限流详细实现

##### `RateLimitProperties`

###### 功能目标

把认证接口限流开关、窗口时长和三类接口上限外部化，便于开发、测试和生产按环境调整。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/RateLimitProperties.java`：限流配置属性。
- `backend/src/main/resources/application.yml`：默认值和环境变量。
- `backend/src/test/resources/application-test.yml`：标准测试默认关闭限流。

###### 实现思路

1. 使用 `app.rate-limit` 前缀绑定 `enabled/windowSeconds/captchaLimit/loginLimit/registerLimit`。
2. 默认开启，窗口 60 秒，验证码 30 次、登录 10 次、注册 5 次。
3. `RATE_LIMIT_ENABLED` 可在环境层关闭限流。
4. 测试 Profile 默认关闭，专用集成测试通过高优先级属性单独开启。

##### `RateLimitConfig`

###### 功能目标

注册认证接口限流拦截器，并启用限流配置属性绑定。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/RateLimitConfig.java`：MVC 拦截器配置。
- `backend/src/main/java/com/dreamhiring/config/RateLimitInterceptor.java`：拦截逻辑。

###### 实现思路

1. 实现 `WebMvcConfigurer.addInterceptors`。
2. 只拦截 `/api/auth/captcha`、`/api/auth/login` 和 `/api/auth/register`。
3. 使用 `@EnableConfigurationProperties` 启用 `RateLimitProperties`。
4. 不把限流逻辑写入 Controller。

##### `RateLimitInterceptor`

###### 功能目标

在认证请求进入 Controller 前执行固定窗口限流，超限直接返回统一的 429 JSON。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/RateLimitInterceptor.java`：限流拦截器。
- `backend/src/main/java/com/dreamhiring/service/RateLimitService.java`：计数服务。
- `backend/src/test/java/com/dreamhiring/config/RateLimitInterceptorTest.java`：429 响应测试。

###### 实现思路

1. 只处理 POST，根据 URI 选择验证码、登录或注册上限。
2. 使用 `request.getRemoteAddr()` 作为客户端维度；生产由 Spring 的 forwarded-header 策略解析可信代理头。
3. 放行时写 `X-RateLimit-Limit` 和 `X-RateLimit-Remaining`。
4. 超限时写 HTTP 429、`Retry-After` 和统一 `Result.code=429`。
5. 中文错误消息包含剩余等待秒数。

##### `RateLimitService`

###### 功能目标

实现 Redis 固定窗口计数，并在 Redis 不可用时提供进程内降级，避免认证接口完全失去限流保护。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/RateLimitService.java`：限流计数服务。
- `backend/src/test/java/com/dreamhiring/service/RateLimitServiceTest.java`：内存降级测试。
- `backend/src/test/java/com/dreamhiring/AuthRateLimitIntegrationTest.java`：真实 MVC 429 测试。

###### 实现思路

1. Redis Key 格式为 `rate:{rule}:{clientIp}`，首次访问时 `INCR` 并设置窗口 TTL。
2. 每次返回允许状态、剩余额度和重试秒数。
3. Redis 异常时记录警告并切换到 `ConcurrentHashMap` 本地固定窗口。
4. 本地过期条目在再次访问同一 Key 时重建，不依赖通配符清理。
5. 单元测试覆盖第 N+1 次拒绝；集成测试从 MockMvc 验证第三次请求返回 429。

#### Controller 详细实现

##### `AdminController`

###### 功能目标

提供管理员对用户、企业、职位、分类和公告的完整治理入口，并保证只有 ADMIN 角色能够访问。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/AdminController.java`：管理端 HTTP 接口。
- `backend/src/main/java/com/dreamhiring/service/AdminService.java`：管理端业务契约。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：管理员权限和删除限制测试。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：路由与响应模型契约测试。

###### 实现思路

1. 在类级别使用 `/api/admin` 和 `@PreAuthorize("hasRole('ADMIN')")`，先由 Spring Security 完成角色拦截。
2. 用户、企业、职位和公告列表接收查询条件与分页参数，返回 `Result<PageVO<...>>`。
3. 审核、状态、分类和公告写接口使用 `@Valid` 校验对应 DTO，再调用 `AdminService`。
4. Controller 不直接处理级联删除、审核状态机或资源存在性，这些规则保留在 Service。
5. 所有写方法由 `OperationLogAspect` 自动记录，无需在方法内重复写日志代码。

##### `AnnouncementController`

###### 功能目标

为匿名和已登录用户提供已发布公告的分页列表与详情读取。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/AnnouncementController.java`：公开公告接口。
- `backend/src/main/java/com/dreamhiring/service/AnnouncementServiceImpl.java`：发布状态过滤与 VO 映射。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：`publishedAt` 和时间格式测试。

###### 实现思路

1. 类级路径固定为 `/api/announcements`，符合接口文档的复数资源命名。
2. 列表方法只绑定 `page` 和 `size`，发布状态和排序由 Service/Mapper 决定。
3. 详情方法接收 `announcementId`，调用 Service 后统一包装 `Result`。
4. 未发布或已删除公告由 Service 返回 404，Controller 不重复判断。

##### `ApplicationController`

###### 功能目标

同时提供求职者投递闭环和企业候选人处理入口，并隔离两类角色可执行的资源操作。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/ApplicationController.java`：投递和候选人接口。
- `backend/src/main/java/com/dreamhiring/dto/ApplicationRequests.java`：请求模型。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：投递业务实现。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：重复投递、候选人状态流转测试。

###### 实现思路

1. 使用 `/api` 类级路径，在同一 Controller 中组织 `/applications` 和 `/company/applications`。
2. 创建投递、更新状态和备注都通过 `@Valid @RequestBody` 绑定 record DTO。
3. 列表接口把筛选条件和分页参数原样交给 Service，统一返回 `PageVO`。
4. 路由层不根据 URL 自行推断当前企业或求职者，身份和资源归属由 Service 从 SecurityContext 获取。
5. 状态流转失败、重复投递和越权分别由 BusinessException 映射为 409 或 403。

##### `AuthController`

###### 功能目标

提供验证码、注册、登录、退出和当前身份接口，形成统一认证入口。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/AuthController.java`：认证 HTTP 接口。
- `backend/src/main/java/com/dreamhiring/service/AuthService.java`：认证业务契约。
- `backend/src/main/java/com/dreamhiring/service/CaptchaService.java`：验证码生成。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：受保护接口认证测试。

###### 实现思路

1. `/captcha` 直接调用 `CaptchaService.generate()`，返回验证码 ID、图片 data URL 与有效秒数。
2. 注册和登录对请求体执行 Jakarta Validation，再统一调用 `AuthService`。
3. `/me` 返回 `UserProfileView`，与 OpenAPI 的用户资料时间字段一致。
4. 登出接口返回成功响应，V1.0 的无状态 JWT 由前端删除本地令牌完成退出。
5. Controller 不处理密码比较、验证码消费和账号状态判断。

##### `CompanyController`

###### 功能目标

提供企业资料、职位生命周期和企业招聘看板的专用接口，并限制仅 COMPANY 角色访问。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/CompanyController.java`：企业端 HTTP 接口。
- `backend/src/main/java/com/dreamhiring/dto/CompanyRequests.java`：资料和职位 DTO。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：业务规则。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：企业资料、职位和看板契约测试。

###### 实现思路

1. 类级路径使用 `/api/company`，并通过 `@PreAuthorize` 限制企业角色。
2. 资料更新、职位新增/更新和状态修改使用 `@Valid` 校验请求模型。
3. 职位列表支持状态、审核状态、关键词和分页参数，并统一返回分页 VO。
4. 详情、更新、删除和上下架都只传职位 ID，当前企业身份由 Service 查询。
5. 看板方法不接收客户端统计参数，所有指标由企业所属职位和投递实时聚合。

##### `FileController`

###### 功能目标

提供统一 OSS 上传入口，支持简历附件、企业 Logo 和头像三种用途。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/FileController.java`：multipart 上传接口。
- `backend/src/main/java/com/dreamhiring/service/FileService.java`：文件安全校验与 OSS 调用。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：伪装 Content-Type 拒绝测试。

###### 实现思路

1. 使用 `@RequestParam("file") MultipartFile` 和 `scope` 接收 multipart 请求。
2. Controller 只把文件与用途传给 `FileService`，不直接调用 OSS SDK。
3. 上传结果按 `FileView` 返回对象键、访问 URL、可见性、过期时间和文件元数据。
4. 空文件、非法用途、超大文件和非 PDF/图片内容由 Service 抛出对应业务异常。

##### `JobController`

###### 功能目标

提供匿名可访问的职位检索、热门职位、职位详情和分类树，同时允许求职者携带 JWT 获取匹配信息。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/JobController.java`：公开职位接口。
- `backend/src/main/java/com/dreamhiring/dto/JobQuery.java`：职位检索条件。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：查询、缓存与匹配实现。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：职位详情字段与热门列表测试。

###### 实现思路

1. 类级路径为 `/api`，通过方法路径组合 `/jobs` 和 `/job-categories/tree`。
2. 搜索参数在 Controller 中组装成 `JobQuery` record，避免把九个参数继续传入 Service。
3. 热门接口只接收 `limit`，Service 负责归一化范围和缓存策略。
4. 详情和分类接口只绑定资源 ID 或无需参数，不暴露内部审核字段。
5. 匿名请求没有 `SecurityPrincipal` 时匹配分为 `null`，求职者请求则读取默认简历计算匹配。

##### `MessageController`

###### 功能目标

提供当前用户的消息分页、未读数、详情、已读操作和逻辑删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/MessageController.java`：消息接口。
- `backend/src/main/java/com/dreamhiring/service/impl/MessageServiceImpl.java`：消息业务实现。
- `backend/src/main/java/com/dreamhiring/vo/MessageViews.java`：消息响应。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：`isRead` 字段契约测试。

###### 实现思路

1. 类级路径为 `/api/messages`，静态路径 `/unread-count`、`/read-all` 放在变量路径之前声明。
2. 列表接口接收 `type`、`isRead` 和分页参数，并返回 `PageVO<MessageView>`。
3. 未读数和全部已读使用 `CountView`，具体值由 Service 查询或归零。
4. 详情、单条已读和删除只接收消息 ID，Service 追加当前接收人条件。
5. Controller 不暴露接收人 ID 参数，避免越权读取其他用户消息。

##### `ResumeController`

###### 功能目标

为求职者提供多简历管理、默认简历切换和附件上传能力，并阻止其他角色访问。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/ResumeController.java`：简历接口。
- `backend/src/main/java/com/dreamhiring/dto/ResumeRequests.java`：简历请求模型。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：简历业务和附件清理。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：求职者简历读取测试。

###### 实现思路

1. 类级使用 `/api/resumes` 和 `hasRole('SEEKER')`。
2. 创建/更新请求使用 `@Valid @RequestBody`，附件使用 `@RequestPart("file")`。
3. 列表直接返回当前用户的简历数组；详情和写操作只传简历 ID。
4. 当前用户 ID、默认标记和附件对象键不接受客户端赋值。
5. 删除成功后返回无数据 `Result.success()`，OSS 清理由 Service 安排在事务提交后。

##### `StatsController`

###### 功能目标

提供数据大屏所需的聚合数据、招聘趋势和热门技能公开查询接口。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/StatsController.java`：统计接口。
- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：聚合与分析结果映射。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：趋势月份数量测试。

###### 实现思路

1. 类级路径为 `/api/stats`，由 SecurityConfig 统一放行公开读取。
2. Dashboard 接口不接收参数，返回固定的 `Dashboard` VO。
3. 趋势接口接收月份数，Service 将其归一化到 1-24 并返回连续自然月。
4. 热门技能接口接收数量，Service 将其限制在 1-50。
5. Controller 不读取数据库，也不把 Map 直接返回前端。

##### `UserController`

###### 功能目标

为所有登录角色提供当前用户资料读取、资料更新和密码修改能力。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/controller/UserController.java`：当前用户接口。
- `backend/src/main/java/com/dreamhiring/dto/AuthRequests.java`：资料和密码 DTO。
- `backend/src/main/java/com/dreamhiring/service/impl/UserServiceImpl.java`：当前用户业务。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：用户资料时间字段测试。

###### 实现思路

1. 类级路径为 `/api/users/me`，所有接口要求已认证。
2. 查询和更新返回 `UserProfileView`，包含与 OpenAPI 对齐的创建、更新和最近登录时间。
3. 资料更新只接受昵称、手机、邮箱和头像，不允许修改角色、状态或密码哈希。
4. 修改密码使用独立 DTO 和路径，先校验旧密码，再执行新密码规则。
5. 当前用户 ID 始终通过 `AuthServiceImpl.requirePrincipal()` 获取。

#### DTO 详细实现

##### `AdminRequests`

###### 功能目标

定义管理端状态变更、审核、分类和公告写操作的请求模型，在进入 Service 前完成字段级校验。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/AdminRequests.java`：四个管理端 record。
- `backend/src/main/java/com/dreamhiring/controller/AdminController.java`：使用这些 DTO 的接口。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：请求字段与 OpenAPI schema 比对。

###### 实现思路

1. `UserStatusRequest` 只接收 `UserStatus`，防止任意状态字符串写入账号。
2. `AuditRequest` 接收审核状态和原因；Service 再限制只允许通过或驳回，并在驳回时要求原因。
3. `CategoryUpsertRequest` 校验非空名称、父分类和排序，Service 负责两级层级与循环校验。
4. `AnnouncementUpsertRequest` 校验标题、摘要、正文长度以及渠道/状态枚举。
5. 所有字段命名与 OpenAPI 请求字段一致，测试通过反射逐项比对。

##### `ApplicationRequests`

###### 功能目标

定义投递创建、状态更新和备注更新请求，避免不同接口共用宽松的 Map 或 Entity。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/ApplicationRequests.java`：三个投递相关 record。
- `backend/src/main/java/com/dreamhiring/controller/ApplicationController.java`：请求入口。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：请求 schema 字段检查。

###### 实现思路

1. `CreateRequest` 同时要求 `jobId` 和 `resumeId`，资源归属由 Service 再校验。
2. `StatusRequest` 使用 `ApplicationStatus` 枚举，备注限制 255 字符。
3. `RemarkRequest` 只包含备注字段，不能借备注更新接口修改状态。
4. DTO 不包含用户 ID，防止客户端伪造投递归属。
5. 校验失败由全局异常处理器统一返回 400。

##### `AuthRequests`

###### 功能目标

定义注册、登录、资料更新和密码修改请求，在认证和用户操作前校验输入格式与长度。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/AuthRequests.java`：四个认证/用户 record。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：注册和登录消费 DTO。
- `backend/src/main/java/com/dreamhiring/service/impl/UserServiceImpl.java`：资料和密码更新。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：请求字段映射测试。

###### 实现思路

1. `RegisterRequest` 校验用户名 3-50 字符、密码 8-64 字符、验证码 4-6 字符。
2. 手机号和邮箱使用 Pattern/Email 校验，昵称和邮箱同时限制最大长度。
3. `LoginRequest` 只接收账号、密码和验证码，不暴露角色选择。
4. `UpdateProfileRequest` 的可选字段允许为空，但传入值仍需满足长度和格式。
5. `ChangePasswordRequest` 要求旧密码和新密码，Service 再检查新旧密码不能相同。

##### `CompanyRequests`

###### 功能目标

定义企业资料、职位新增/更新和职位上下架请求，使企业和职位字段在进入业务层前完成约束。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/CompanyRequests.java`：企业端请求 record。
- `backend/src/main/java/com/dreamhiring/controller/CompanyController.java`：请求入口。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：业务规则消费方。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：请求模型契约测试。

###### 实现思路

1. 企业资料校验名称、行业、规模、城市、简介和联系人邮箱/长度。
2. 职位请求校验名称、分类、城市、薪资上下限、学历、经验、描述和技能列表。
3. 职责、要求和福利使用 record 内的泛型列表校验，禁止空字符串项。
4. 分类是否存在、是否为二级分类和薪资 `min <= max` 在 Service 再次校验。
5. 状态请求只允许 `JobStatus` 枚举，防止任意字符串改变职位生命周期。

##### `JobQuery`

###### 功能目标

将职位搜索的多个查询条件收敛为不可变对象，降低 Controller 和 Mapper 之间的参数噪音。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/JobQuery.java`：职位查询 record。
- `backend/src/main/java/com/dreamhiring/controller/JobController.java`：组装查询对象。
- `backend/src/main/resources/mapper/JobMapper.xml`：读取查询条件生成动态 SQL。

###### 实现思路

1. 字段包括关键词、城市、薪资上下限、学历、经验、分类、行业和排序。
2. 使用 Java record 保持条件不可变，避免查询过程中被意外修改。
3. Controller 只承担 HTTP 参数到查询对象的映射。
4. Mapper 对每个非空条件生成独立 `<if>`，公开查询始终附加发布和审核条件。
5. 排序值由 XML `<choose>` 映射为固定 SQL 排序，避免拼接客户端 SQL 片段。

##### `ResumeRequests`

###### 功能目标

定义在线简历新增和更新的完整请求模型，防止客户端直接写入用户归属、附件键和默认标记。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/dto/ResumeRequests.java`：简历请求 record。
- `backend/src/main/java/com/dreamhiring/controller/ResumeController.java`：简历保存入口。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：请求到实体映射。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：请求字段契约测试。

###### 实现思路

1. 校验姓名、学历、工作年限、期望城市、期望薪资和技能列表。
2. 城市、方向和简介设置数据库列兼容的长度上限。
3. 薪资通过 `@Min/@Max` 限制为 0-1000，Service 可继续校验上下限关系。
4. `userId`、`isDefault` 和 `attachmentObjectKey` 不进入 DTO，由服务端状态决定。
5. 新增和更新复用同一个请求模型，保证两条路径字段一致。

#### Entity 详细实现

##### `AnalysisStat`

###### 功能目标

映射通用分析结果表，使新增分析维度不需要频繁修改表结构。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/AnalysisStat.java`：分析结果实体。
- `backend/src/main/resources/mapper/StatsMapper.xml`：结果表查询。
- `backend/analysis/job_market_analysis.py`：结果表写入 SQL 生成。

###### 实现思路

1. 使用 `dimension + dimValue + metric` 表达“哪个维度、哪个值、什么指标”。
2. `statValue` 使用 `BigDecimal`，避免百分比小数精度丢失。
3. 保存来源数据集和统计日期，支持同表保留多次离线分析结果。
4. Entity 只用于 Mapper/Service，不直接作为图表接口响应。

##### `Announcement`

###### 功能目标

映射公告持久化结构，支持草稿、发布、下线和逻辑删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/Announcement.java`：公告实体。
- `backend/src/main/resources/mapper/AnnouncementMapper.xml`：公告 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/AnnouncementServiceImpl.java`：公开查询与 VO 映射。

###### 实现思路

1. 保存标题、摘要、正文、渠道、状态、发布人、发布时间和审计时间。
2. 状态与渠道使用枚举，避免非法值进入数据库。
3. 发布时写 `publishTime`，草稿或下线时允许为空。
4. 逻辑删除标记只在 Mapper 使用，对外 VO 不暴露。

##### `ApplicationRecord`

###### 功能目标

映射投递记录，保存求职者、简历、职位、匹配分和当前流程状态。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/ApplicationRecord.java`：投递实体。
- `backend/src/main/resources/mapper/ApplicationMapper.xml`：投递 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：状态机与快照逻辑。

###### 实现思路

1. 使用 `resumeId + jobId` 唯一索引表达同一简历同一职位只能投递一次。
2. `userId` 冗余保存，便于按求职者快速查询和权限过滤。
3. `matchScore` 在创建时固化，之后简历变化不会回溯历史投递。
4. `deliveryTime` 和 `handleTime` 分别记录投递与企业处理时间。
5. 状态字段使用 `ApplicationStatus`，Service 通过转换表限制下一步状态。

##### `CompanyEntity`

###### 功能目标

映射企业账号与企业资料，供企业端资料维护和管理员审核使用。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/CompanyEntity.java`：企业实体。
- `backend/src/main/resources/mapper/CompanyMapper.xml`：企业 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：企业资料更新。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：企业审核。

###### 实现思路

1. 使用 `userId` 绑定 COMPANY 账号和企业资料。
2. 保存名称、行业、规模、城市、Logo 和简介等公开资料。
3. 联系人字段只用于企业资料，不在公开职位摘要中全部展开。
4. 审核状态使用 `CompanyAuditStatus`，并保存管理员审核原因。
5. 逻辑删除字段仅供 Mapper 过滤，Entity 不返回客户端。

##### `DomainEnums`

###### 功能目标

集中维护所有业务枚举，避免同一状态在数据库、DTO、VO 和业务判断中出现不同字符串。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/DomainEnums.java`：业务枚举集合。
- `backend/src/main/java/com/dreamhiring/dto/`：请求模型引用枚举。
- `backend/src/main/java/com/dreamhiring/service/impl/`：状态机和审核逻辑引用枚举。

###### 实现思路

1. 用户角色单独由 `security.UserRole` 管理，其余业务状态集中在此文件。
2. 投递状态、职位状态、审核状态、公告状态等均使用 Java enum。
3. MyBatis 默认以枚举名与数据库字符串互转，避免手写映射遗漏。
4. Service 使用枚举比较和 `EnumSet` 状态转换，禁止解析任意字符串判断流程。
5. 新增状态时必须同步数据库、OpenAPI 和契约测试。

##### `HotSkill`

###### 功能目标

映射热门技能分析结果，支持词云和技能频次查询。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/HotSkill.java`：热门技能实体。
- `backend/src/main/resources/mapper/StatsMapper.xml`：频次查询。
- `backend/analysis/job_market_analysis.py`：技能统计写入。

###### 实现思路

1. 保存技能名、频次、来源数据集和统计日期。
2. 查询按 `freq_count DESC` 排序，数量由 Service 限制。
3. 分析结果与在线职位表隔离，在线请求不重新清洗原始 CSV。
4. 响应时映射为 `HotSkillItem`，不暴露数据集内部字段之外的内容。

##### `JobCategory`

###### 功能目标

映射两级职位分类，用于公开分类树、职位发布和管理员分类治理。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/JobCategory.java`：分类实体。
- `backend/src/main/resources/mapper/JobCategoryMapper.xml`：分类 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：分类树组装。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：分类维护。

###### 实现思路

1. 使用 `parentId` 自关联表达两级分类，顶层分类父 ID 为空。
2. `sort` 决定同层展示顺序，逻辑删除避免破坏职位历史引用。
3. Service 查询所有有效分类后在内存分组，避免递归 SQL。
4. 发布职位只允许选择没有子分类的二级节点。
5. 删除或修改层级时检查子分类和职位引用。

##### `JobEntity`

###### 功能目标

映射职位全部持久化字段，支持公开搜索、企业管理和管理员审核。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/JobEntity.java`：职位实体。
- `backend/src/main/resources/mapper/JobMapper.xml`：职位 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：公开职位业务。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：企业职位维护。

###### 实现思路

1. 保存企业与分类外键、标题、城市、区域和薪资范围。
2. 保存学历、经验、描述、职责、要求、技能和福利。
3. 使用 `status` 表示 DRAFT/PUBLISHED/OFFLINE，使用 `auditStatus` 表示审核流程。
4. 审核原因和发布时间支持企业查看驳回原因与详情展示。
5. 浏览量用于热门排序，逻辑删除保护投递历史。

##### `MessageRecord`

###### 功能目标

映射站内消息，支持个人消息、公告和系统通知的持久化与幂等消费。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/MessageRecord.java`：消息实体。
- `backend/src/main/resources/mapper/MessageMapper.xml`：消息 SQL。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：消息写入。

###### 实现思路

1. 保存接收人、消息类型、标题、正文和关联业务 ID。
2. `dedupKey` 对应数据库唯一索引，用于 RabbitMQ 重复消费去重。
3. `isRead` 使用整型映射数据库 TINYINT，对外转换为布尔值。
4. 查询、已读和删除都附加接收人条件，形成资源级隔离。
5. 逻辑删除避免消息直接物理消失。

##### `OperationLog`

###### 功能目标

映射写操作审计记录，为后续安全审计和问题追踪提供数据。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/OperationLog.java`：日志实体。
- `backend/src/main/resources/mapper/OperationLogMapper.xml`：追加写入 SQL。
- `backend/src/main/java/com/dreamhiring/config/OperationLogAspect.java`：日志数据来源。

###### 实现思路

1. 保存操作人、资源类型、资源 ID、动作、结果和时间。
2. 失败动作记录异常类名，不保存完整堆栈或敏感请求体。
3. Mapper 只提供插入方法，保持日志追加式语义。
4. 日志表使用操作人/时间和资源索引，支持后续审计查询。
5. 日志写入使用独立事务，不参与原业务回滚。

##### `ResumeEntity`

###### 功能目标

映射求职者在线简历，支持多简历、默认简历和 OSS 附件。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/ResumeEntity.java`：简历实体。
- `backend/src/main/resources/mapper/ResumeMapper.xml`：简历 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：默认简历和附件逻辑。

###### 实现思路

1. 保存用户外键、姓名、求职方向、学历和经验年限。
2. 保存当前城市、期望城市、期望薪资、技能标签和简介。
3. `attachmentObjectKey` 只保存 OSS 对象键，不保存临时 URL。
4. `isDefault` 由服务端维护，用户只能通过专用接口切换。
5. 默认简历用于职位匹配，删除默认项后自动提升剩余简历。

##### `UserAccount`

###### 功能目标

映射用户认证和基础资料字段，支持登录、状态控制和用户治理。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/UserAccount.java`：用户实体。
- `backend/src/main/resources/mapper/UserMapper.xml`：用户 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：认证和登录时间更新。

###### 实现思路

1. 保存用户名、密码哈希、昵称和角色。
2. 状态使用 `UserStatus`，JWT 每次请求重新读取状态以支持禁用账号失效。
3. 保存手机号、邮箱、头像和最近登录时间。
4. 创建/更新时间和逻辑删除字段供 Mapper 与审计逻辑使用。
5. 密码哈希只在 Service 使用，VO 和日志均不暴露。

#### Mapper 详细实现

##### `AnnouncementMapper`

###### 功能目标

为公开公告和后台公告管理提供数据库访问能力。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/AnnouncementMapper.java`：Mapper 接口。
- `backend/src/main/resources/mapper/AnnouncementMapper.xml`：公告 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/AnnouncementServiceImpl.java`：公开公告查询。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：公告管理。

###### 实现思路

1. `findPublished` 只查询 PUBLISHED 和未删除公告，并按发布时间倒序。
2. `findAll` 根据状态和关键词生成动态条件，供管理员分页。
3. 插入和更新显式列出全部业务字段，避免漏写发布状态或渠道。
4. 逻辑删除更新 `deleted` 和 `updateTime`。

##### `ApplicationMapper`

###### 功能目标

提供投递唯一性、求职者/企业查询、详情和状态更新的持久化操作。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/ApplicationMapper.java`：投递 Mapper。
- `backend/src/main/resources/mapper/ApplicationMapper.xml`：投递 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：投递状态机。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：重复投递和状态更新测试。

###### 实现思路

1. `countByResumeAndJob` 在业务层提前发现重复投递，数据库唯一索引提供最终保障。
2. 用户查询按投递时间倒序，并支持状态过滤。
3. 企业查询连接职位和简历表，同时支持职位、状态和候选人关键词过滤。
4. 更新状态同时写企业备注和处理时间；备注接口只能更新备注。
5. SQL 使用显式字段清单，避免 `SELECT *` 泄露内部字段。

##### `CompanyMapper`

###### 功能目标

提供企业资料、企业账号绑定和后台企业筛选的持久化能力。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/CompanyMapper.java`：企业 Mapper。
- `backend/src/main/resources/mapper/CompanyMapper.xml`：企业 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：企业端资料更新。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：企业审核。

###### 实现思路

1. 按企业 ID 或用户 ID 查询未删除企业，解决 COMPANY 账号归属关系。
2. 管理端列表支持企业名称关键词和审核状态。
3. 更新资料时绑定 `id + userId`，防止更新其他企业。
4. 审核更新同时写审核状态、审核原因和时间。
5. 所有插入显式设置逻辑删除为 0。

##### `JobCategoryMapper`

###### 功能目标

提供两级职位分类的读取、写入、子节点计数和逻辑删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/JobCategoryMapper.java`：分类 Mapper。
- `backend/src/main/resources/mapper/JobCategoryMapper.xml`：分类 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：分类治理。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：分类树构建。

###### 实现思路

1. `findAll` 按 `sort` 和 ID 排序，方便 Service 直接分组为两级树。
2. `countChildren` 用于阻止有子分类的节点被删除或改成二级分类。
3. 插入和更新显式写名称、父 ID 和排序。
4. 删除采用逻辑删除，保留历史职位引用。

##### `JobMapper`

###### 功能目标

承载职位公开检索、热门回源、企业职位、后台审核和职位写入的全部 SQL。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/JobMapper.java`：职位 Mapper。
- `backend/src/main/resources/mapper/JobMapper.xml`：职位动态 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：公开职位业务。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：企业职位写入。

###### 实现思路

1. 公开搜索固定附加 `deleted=0`、`PUBLISHED` 和 `APPROVED`，再组合关键词、城市、薪资、学历、经验和分类条件。
2. 排序只接受预设值，分别按薪资、浏览量或更新时间排序。
3. 热门列表按浏览量降序；缓存命中的 ID 通过 `findPublishedByIds` 批量回源并保持缓存顺序。
4. 企业查询和管理员查询共享显式字段，但使用不同权限条件。
5. 新增/更新持久化职责、要求和福利；更新敏感字段时把审核状态改回 PENDING 并清空审核原因。
6. 审核、上下架、浏览量递增、逻辑删除和分类引用计数都有独立 SQL。

##### `MessageMapper`

###### 功能目标

提供站内消息分页、未读统计、幂等键检查、写入和已读/删除操作。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/MessageMapper.java`：消息 Mapper。
- `backend/src/main/resources/mapper/MessageMapper.xml`：消息 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/MessageServiceImpl.java`：消息接口实现。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：幂等消息写入。

###### 实现思路

1. 列表按接收人过滤，并支持类型和已读状态。
2. 未读数和接收人消息数使用 COUNT 查询。
3. `countByDedupKey` 与唯一索引共同保证消费者幂等。
4. 单条已读、批量已读和逻辑删除都限制接收人。
5. 插入时显式写入幂等键和初始未读状态。

##### `OperationLogMapper`

###### 功能目标

只提供操作日志追加写入，保证审计记录不会被普通业务修改。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/OperationLogMapper.java`：日志 Mapper。
- `backend/src/main/resources/mapper/OperationLogMapper.xml`：日志插入 SQL。
- `backend/src/main/java/com/dreamhiring/service/OperationLogService.java`：独立事务写入。

###### 实现思路

1. Mapper 只有一个 `insert` 方法。
2. XML 写入操作人、资源、动作、结果、摘要和时间。
3. 不提供更新和删除 SQL，保持追加式审计语义。
4. 数据来源由 AOP 提供，Mapper 不依赖 SecurityContext。

##### `ResumeMapper`

###### 功能目标

提供简历查询、保存、默认切换和附件对象键更新。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/ResumeMapper.java`：简历 Mapper。
- `backend/src/main/resources/mapper/ResumeMapper.xml`：简历 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：简历业务。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：默认简历匹配。

###### 实现思路

1. 按用户查询时默认简历优先，其次按更新时间倒序。
2. `findDefaultByUserId` 只返回默认且未删除简历，用于职位匹配。
3. `resetDefault` 先清空该用户所有默认标记，`setDefault` 再设置目标简历。
4. 更新 SQL 绑定 `id + userId`，避免跨用户修改。
5. 删除时同时清除默认标记，附件键由单独方法更新。

##### `StatsMapper`

###### 功能目标

提供分析结果读取和在线趋势所需的数据源查询。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/StatsMapper.java`：统计 Mapper。
- `backend/src/main/resources/mapper/StatsMapper.xml`：统计 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：聚合和月份分组。

###### 实现思路

1. `findLatestStats` 只取最新统计日期的数据。
2. `findHotSkills` 按频次降序并限制数量。
3. 提供职位数、投递数、平均薪资和平均匹配分基础指标。
4. 职位/投递日期以 `LocalDateTime` 读取，在 Java 中按自然月聚合。
5. 不在 SQL 中使用 MySQL 特有日期格式函数，保证 H2 集成测试可运行。

##### `UserMapper`

###### 功能目标

提供用户认证查询、后台筛选、资料/密码/状态更新和逻辑删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/UserMapper.java`：用户 Mapper。
- `backend/src/main/resources/mapper/UserMapper.xml`：用户 SQL。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：登录更新时间。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：用户治理。

###### 实现思路

1. 用户详情和用户名查询都排除逻辑删除记录。
2. 后台列表动态组合关键词、角色和状态条件。
3. 插入时写密码哈希、角色、状态、联系方式和最近登录时间。
4. 资料、密码、状态、登录时间和删除分别使用独立 UPDATE，避免宽表误更新。
5. 登录更新只改 `last_login_time`，不伪造资料更新时间。

#### Messaging 详细实现

##### `ApplicationStatusChangedEvent`

###### 功能目标

定义投递状态变更事件的跨线程消息契约，连接投递 Service、RabbitMQ 和通知消费者。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/ApplicationStatusChangedEvent.java`：事件 record。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`：事件发布。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConsumer.java`：事件消费。

###### 实现思路

1. 只携带接收人 ID、投递 ID、职位标题和状态。
2. 使用 Java record 保证消息体不可变。
3. 不携带密码、简历正文或企业备注等敏感信息。
4. `notificationDedupKey()` 统一生成 `APPLICATION:{applicationId}:{status}`，供本地和 RabbitMQ 通知实现共用。
5. Jackson JSON 转换器按 record 组件序列化，消费者可直接反序列化。

##### `LocalNotificationGateway`

###### 功能目标

在测试或本地 `local` 模式中提供同步通知实现，避免必须启动 RabbitMQ。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/LocalNotificationGateway.java`：本地发布实现。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：消息持久化。
- `backend/src/test/resources/application-test.yml`：测试消息模式配置。

###### 实现思路

1. 通过 `@ConditionalOnProperty` 仅在 `app.messaging.mode=local` 时装配。
2. 收到事件后直接调用 `sendOnce` 写站内消息。
3. 幂等键复用事件的 `notificationDedupKey()`，与 Rabbit 消费者保持一致。
4. 状态转换为用户可读中文文案，消息只包含职位和状态。

##### `NotificationGateway`

###### 功能目标

抽象投递状态和公告发布通知能力，让业务 Service 不依赖 RabbitMQ 具体实现。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/NotificationGateway.java`：通知接口。
- `backend/src/main/java/com/dreamhiring/messaging/LocalNotificationGateway.java`：本地实现。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`：Rabbit 实现。

###### 实现思路

1. `publishApplicationStatusChanged` 发布投递状态事件。
2. `publishAnnouncementPublished` 发布公告触达事件。
3. ApplicationService 和 AdminService 通过构造器注入接口，不感知运行模式。
4. local 和 rabbit 实现由配置属性二选一。
5. 后续邮件或短信通道可以增加新实现或组合网关。

##### `RabbitNotificationConfig`

###### 功能目标

声明投递与公告通知的持久化交换机、队列、DLQ、绑定、JSON 转换器，以及手动 ACK 和重试监听容器。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConfig.java`：RabbitMQ 配置。
- `backend/src/main/resources/application.yml`：Publisher Confirm/Return 和 mandatory 配置。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：真实 RabbitMQ 冒烟测试。

###### 实现思路

1. 创建持久化 Direct Exchange、投递队列、公告队列和死信队列。
2. 投递队列使用 `application.status.changed`，公告队列使用 `announcement.published`。
3. 两个业务队列分别通过 DLX/死信路由键连接 DLQ。
4. 使用 Jackson2JsonMessageConverter 统一事件序列化。
5. 自定义监听容器设置 `MANUAL` ACK，只有消费者确认后才删除消息。
6. 配置失败最多 3 次、退避重试，最终拒绝且不重新入队，由队列配置进入 DLQ。
7. 发布端开启 confirm、returns 和 mandatory，便于发现不可路由消息。

##### `RabbitNotificationConsumer`

###### 功能目标

消费投递状态事件并幂等写入站内消息，成功后向 RabbitMQ 手动确认。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConsumer.java`：消费者。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConfig.java`：监听容器。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：幂等写入。

###### 实现思路

1. `@RabbitListener` 绑定业务队列，并接收 `Channel` 和 delivery tag。
2. 使用事件生成的 `APPLICATION:{applicationId}:{status}` 调用 `sendOnce`；同状态重复消息不会再次插入，不同状态可分别通知。
3. 数据库写入成功后调用 `basicAck`。
4. 写入异常向上抛出，容器执行重试；最终失败时不 ACK，交由死信机制处理。
5. 状态枚举统一映射为用户可读文案。

##### `RabbitNotificationGateway`

###### 功能目标

在数据库事务成功后发布 RabbitMQ 事件，避免事务回滚后产生错误通知。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`：Rabbit 发布器。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：事件调用方。
- `backend/src/test/java/com/dreamhiring/messaging/RabbitNotificationGatewayTest.java`：事务提交后发送测试。

###### 实现思路

1. 判断 `TransactionSynchronizationManager.isSynchronizationActive()`。
2. 有活动事务时注册 `afterCommit` 回调，事务提交后才执行 `convertAndSend`。
3. 无事务时立即发送，兼容非事务调用。
4. 消息发送到固定 Exchange 和路由键，事件对象由 JSON 转换器序列化。
5. 公告事件同样通过 `afterCommit` 发送到公告路由键。
6. 测试使用 mock RabbitTemplate 验证发送前没有任何 MQ 交互。

##### `AnnouncementPublishedEvent`

###### 功能目标

定义公告首次发布时跨线程传递的最小事件，连接管理员公告业务、RabbitMQ 和公告消费者。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementPublishedEvent.java`：公告事件。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`：事件发布。
- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementNotificationConsumer.java`：事件消费。

###### 实现思路

1. 事件携带公告 ID、标题、摘要和触达渠道。
2. 使用 record 保持事件不可变。
3. 不携带完整富文本正文，降低消息体大小；消息中心使用摘要。
4. 公告 ID 用于关联公告详情和构造用户级幂等键。

##### `AnnouncementNotificationConsumer`

###### 功能目标

消费公告发布事件，根据触达渠道给 ACTIVE 用户写入站内消息，并在成功后手动确认 RabbitMQ 消息。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementNotificationConsumer.java`：公告消费者。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：渠道展开与幂等写入。
- `backend/src/main/java/com/dreamhiring/mapper/UserMapper.java`：ACTIVE 用户查询。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：真实 RabbitMQ 公告测试。

###### 实现思路

1. `@RabbitListener` 绑定 `dreamhiring.announcement.queue`。
2. 调用 `NotificationService.sendAnnouncement`，按渠道查询目标角色。
3. 每个用户使用独立 dedupKey，重复消费不会重复写入。
4. 数据库写入成功后调用 `basicAck`。
5. 写入异常向上抛出，由监听容器执行重试并最终进入 DLQ。

#### Security 详细实现

##### `JwtAuthenticationFilter`

###### 功能目标

在 Spring Security 过滤器链中解析 JWT，并把有效用户恢复为认证主体。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/JwtAuthenticationFilter.java`：JWT 过滤器。
- `backend/src/main/java/com/dreamhiring/security/JwtService.java`：令牌解析。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：过滤器链注册。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：受保护接口测试。

###### 实现思路

1. 从 `Authorization` 请求头读取 `Bearer` 令牌，没有令牌时直接继续过滤链。
2. 解析 JWT 得到用户 ID，再查询数据库确认用户存在且为 ACTIVE。
3. 从数据库读取当前角色，构造 `SecurityPrincipal` 和 `ROLE_*` authority。
4. 将 `UsernamePasswordAuthenticationToken` 写入 SecurityContext。
5. 解析异常或禁用账号会清空上下文，由后续授权规则返回 401。

##### `JwtProperties`

###### 功能目标

绑定 JWT 密钥和有效期配置，支持开发、测试和生产环境外部化。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/JwtProperties.java`：JWT 配置属性。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：启用属性绑定。
- `backend/src/main/resources/application.yml`：默认配置和密钥环境变量。

###### 实现思路

1. 使用 `@ConfigurationProperties(prefix="app.jwt")`。
2. `secret` 不设置生产默认明文，要求通过 `JWT_SECRET` 注入。
3. `expirationSeconds` 默认 7200 秒。
4. JwtService 启动时检查密钥长度，配置错误会阻止应用以弱密钥运行。

##### `JwtService`

###### 功能目标

负责签发和校验 HMAC JWT，并把 claims 转换为业务身份对象。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/JwtService.java`：JWT 签发和解析。
- `backend/src/main/java/com/dreamhiring/security/JwtProperties.java`：密钥与有效期。
- `backend/src/main/java/com/dreamhiring/security/SecurityPrincipal.java`：认证主体。

###### 实现思路

1. 构造时把 UTF-8 密钥转换为 HMAC `SecretKey`，少于 32 字节直接失败。
2. `createToken` 写入用户 ID subject、用户名、角色、签发时间和过期时间。
3. `parse` 使用同一密钥验签并返回 `JwtClaims` record。
4. 角色通过 `UserRole.fromCode` 校验，未知角色不会进入认证上下文。
5. `getExpirationSeconds` 供 AuthView 告诉前端令牌有效期。

##### `SecurityPrincipal`

###### 功能目标

作为 Spring Security 中的轻量当前用户对象，供 Service 获取身份而不重复查询令牌。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/SecurityPrincipal.java`：认证主体 record。
- `backend/src/main/java/com/dreamhiring/security/JwtAuthenticationFilter.java`：构造主体。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：统一读取主体。

###### 实现思路

1. 只保存 ID、用户名、昵称和角色。
2. 不保存密码、完整 Entity 或敏感资料。
3. JWT 过滤器每次从数据库读取最新用户状态后构造。
4. Service 通过 `instanceof SecurityPrincipal` 判断是否已认证。

##### `UserRole`

###### 功能目标

集中定义平台三种角色和 Spring Security authority。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/security/UserRole.java`：角色枚举。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：使用 authority。
- `backend/src/test/java/com/dreamhiring/security/UserRoleTest.java`：角色解析测试。

###### 实现思路

1. 枚举值为 SEEKER、COMPANY、ADMIN。
2. 每个值保存展示名和 `ROLE_*` authority。
3. `fromCode` 忽略大小写和首尾空格，非法值抛出异常。
4. 数据库、JWT、路由守卫和 `@PreAuthorize` 使用同一角色代码。
5. 不支持动态角色，避免 V1.0 出现未定义权限。

#### Service 接口详细实现

##### `AdminService`

###### 功能目标

定义平台管理员对用户、企业、职位、分类和公告的业务契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/AdminService.java`：管理端接口。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/controller/AdminController.java`：调用方。

###### 实现思路

1. 用户、企业、职位和公告查询统一返回 `PageVO`。
2. 详情和状态/审核方法接收资源 ID，避免 Controller 把 Entity 传入 Service。
3. 分类和公告返回对应 VO，写操作不直接返回数据库对象。
4. 接口本身不包含鉴权代码，ADMIN 权限由类级 `@PreAuthorize` 完成。
5. 所有业务约束由实现类集中处理。

##### `AnnouncementService`

###### 功能目标

定义公开公告列表和详情读取契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/AnnouncementService.java`：公告接口。
- `backend/src/main/java/com/dreamhiring/service/impl/AnnouncementServiceImpl.java`：实现。
- `backend/src/main/resources/mapper/AnnouncementMapper.xml`：数据查询。

###### 实现思路

1. `listPublished` 固定只返回已发布公告。
2. `detail` 接收公告 ID 并返回统一 `AnnouncementView`。
3. Service 隐藏草稿、下线和逻辑删除状态。
4. 分页结果转换为 `PageVO`。

##### `ApplicationService`

###### 功能目标

定义求职者投递和企业候选人处理的业务契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/ApplicationService.java`：投递接口。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/messaging/NotificationGateway.java`：通知依赖。

###### 实现思路

1. 创建、个人列表、个人详情覆盖求职者路径。
2. 企业列表、企业详情、状态和备注覆盖企业路径。
3. 所有身份从 SecurityContext 获取，接口不接收调用者 ID。
4. 状态变更通过 `StatusRequest`，保持状态机输入约束。
5. 返回 VO 不暴露投递实体和用户密码等内部字段。

##### `AuthService`

###### 功能目标

定义验证码消费后的注册、登录和当前用户资料读取契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/AuthService.java`：认证接口。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/service/CaptchaService.java`：验证码依赖。

###### 实现思路

1. `register` 和 `login` 返回 AuthView，包含 JWT 和用户摘要。
2. `currentUser` 返回 UserProfileView，与资料接口字段一致。
3. 验证码校验在 Service 内完成，Controller 不直接消费。
4. 密码和账号状态规则不暴露给 Controller。
5. 静态 `requirePrincipal` 为其他 Service 提供统一身份读取入口。

##### `CaptchaService`

###### 功能目标

生成并一次性校验图形验证码，为登录和注册增加人机校验。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/CaptchaService.java`：验证码服务。
- `backend/src/main/java/com/dreamhiring/controller/AuthController.java`：生成入口。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：消费入口。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：Redis TTL 测试。

###### 实现思路

1. 使用 `SecureRandom` 从去除易混字符的字母表生成四位验证码。
2. 生成 UUID 作为 ID，并创建 SVG data URL 作为验证码图片。
3. Redis 可用时写入 `captcha:{uuid}`，TTL 120 秒。
4. Redis 不可用时使用 `ConcurrentHashMap` 保存带过期时间的内存数据，保证测试可运行。
5. 校验时读取并立即删除键；输入 trim 后忽略大小写比较。

##### `CompanyService`

###### 功能目标

定义企业资料、职位管理和企业招聘看板契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/CompanyService.java`：企业接口。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/dto/CompanyRequests.java`：输入模型。

###### 实现思路

1. 资料读取/更新使用 CompanyView。
2. 职位列表和单个职位统一返回 CompanyJobView，包含审核和申请统计。
3. 职位状态通过独立方法更新，输入只允许 `JobStatus`。
4. 看板返回 DashboardView，不暴露原始职位和投递列表。
5. 企业身份和资源归属由实现类校验。

##### `FileService`

###### 功能目标

封装文件安全校验、OSS 上传、URL 生成和延迟删除，供简历与头像/Logo 复用。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/FileService.java`：文件服务。
- `backend/src/main/java/com/dreamhiring/storage/ObjectStorageService.java`：存储接口。
- `backend/src/main/java/com/dreamhiring/controller/FileController.java`：上传入口。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：伪装文件测试。

###### 实现思路

1. 校验用途只允许 RESUME_ATTACHMENT、COMPANY_LOGO、AVATAR。
2. 拒绝空文件和超过 10MB 的文件。
3. 读取文件头判断 PDF、PNG、JPEG、WebP，并忽略客户端谎报的 Content-Type。
4. 调用存储接口上传，返回真实内容类型和对象键。
5. 附件读取生成短期访问 URL；替换/删除时在事务提交后清理旧对象。

##### `HotJobCacheService`

###### 功能目标

封装热门职位 Redis ZSET Cache-Aside，降低热门列表数据库压力并隔离缓存故障。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/HotJobCacheService.java`：ZSET 缓存服务。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：缓存读写调用。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：真实 Redis 测试。

###### 实现思路

1. 使用固定 Key `job:hot:list`，score 为职位浏览量。
2. 读取时按 score 倒序返回指定数量 ID。
3. 回填前删除旧 Key，再批量添加职位 ID，最后设置 10 分钟 TTL。
4. Redis 未配置、连接异常或数据格式问题时记录警告并返回空结果。
5. JobService 在缓存为空时回源 MySQL，并尝试重新写入缓存。

##### `JobService`

###### 功能目标

定义职位搜索、热门职位、详情和分类树查询契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/JobService.java`：职位接口。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/dto/JobQuery.java`：搜索条件。

###### 实现思路

1. 搜索返回分页 JobSummary，分页参数由 Service 归一化。
2. 热门接口返回有序数组，limit 限制在 1-50。
3. 详情返回 JobDetail，并检查公开状态。
4. 分类树返回根节点及其子节点，不在 Controller 组装树。
5. Service 统一处理匿名/求职者身份差异和匹配分。

##### `MessageService`

###### 功能目标

定义当前用户站内消息查询、已读和删除契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/MessageService.java`：消息接口。
- `backend/src/main/java/com/dreamhiring/service/impl/MessageServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/mapper/MessageMapper.java`：数据访问。

###### 实现思路

1. 列表返回 `PageVO<MessageView>`，可按类型和已读状态过滤。
2. 未读数和全部已读返回 long，Controller 再包装 CountView。
3. 详情、单条已读和删除只接收消息 ID。
4. 实现类在每次查询/更新时附加当前 receiverId。
5. 已读和删除使用事务保证单次操作一致性。

##### `NotificationService`

###### 功能目标

把投递事件和公告事件转换为站内消息，并提供幂等写入能力。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：消息服务。
- `backend/src/main/java/com/dreamhiring/mapper/MessageMapper.java`：消息持久化。
- `backend/src/main/java/com/dreamhiring/messaging/LocalNotificationGateway.java`：本地调用。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConsumer.java`：MQ 调用。
- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementNotificationConsumer.java`：公告 MQ 调用。

###### 实现思路

1. 普通 `send` 用于不需要去重的系统消息。
2. `sendOnce` 先检查 dedupKey，不存在时才插入。
3. 并发消费时由唯一索引兜底，`DuplicateKeyException` 视为重复消息。
4. 新消息初始未读、创建时间为当前业务时间。
5. `sendAnnouncement` 根据 ALL/SEEKER/COMPANY 查询 ACTIVE 用户并逐人调用 `sendOnce`。
6. 公告幂等键为 `ANNOUNCEMENT:{公告ID}:{用户ID}`。
7. 消息写入不接收客户端内容，所有标题和正文由服务端生成。

##### `OperationLogService`

###### 功能目标

为 AOP 提供独立事务的日志持久化入口。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/OperationLogService.java`：日志服务。
- `backend/src/main/java/com/dreamhiring/mapper/OperationLogMapper.java`：追加 SQL。
- `backend/src/main/java/com/dreamhiring/config/OperationLogAspect.java`：调用方。

###### 实现思路

1. `record` 接收操作人和资源信息。
2. 使用 `@Transactional(REQUIRES_NEW)` 建立独立事务。
3. 创建时间由服务端生成。
4. 不把 HTTP 请求体整体写入数据库，避免敏感数据泄漏。
5. 日志持久化异常由切面捕获，不反向影响业务。

##### `ResumeService`

###### 功能目标

定义求职者简历全生命周期契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/ResumeService.java`：简历接口。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/mapper/ResumeMapper.java`：简历数据访问。
- `backend/src/main/java/com/dreamhiring/service/FileService.java`：附件能力。

###### 实现思路

1. 列表返回当前用户全部默认和普通简历。
2. 创建/更新接收 ResumeUpsertRequest。
3. 默认切换和附件上传使用独立方法。
4. 删除返回 void，由 Service 维护默认简历。
5. 所有方法只操作当前 SecurityPrincipal 对应简历。

##### `StatsService`

###### 功能目标

定义招聘大屏、趋势和热门技能查询契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/StatsService.java`：统计接口。
- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/mapper/StatsMapper.java`：数据源查询。

###### 实现思路

1. `dashboard` 返回完整 Dashboard VO。
2. `trend` 接收月份数并返回连续趋势点。
3. `hotSkills` 接收数量并返回技能数组。
4. 对外不暴露分析表原始行。
5. 所有范围归一化放在实现类。

##### `UserService`

###### 功能目标

定义当前登录用户资料和密码管理契约。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/UserService.java`：用户接口。
- `backend/src/main/java/com/dreamhiring/service/impl/UserServiceImpl.java`：实现。
- `backend/src/main/java/com/dreamhiring/dto/AuthRequests.java`：请求模型。

###### 实现思路

1. `getCurrentUser` 返回完整 UserProfileView。
2. 更新方法只修改允许的资料字段。
3. 密码修改使用专门的 ChangePasswordRequest。
4. 当前用户身份从 SecurityContext 读取。
5. VO 避免泄露密码哈希和删除标记。

#### Service 实现类详细实现

##### `AdminServiceImpl`

###### 功能目标

实现管理员对用户、企业、职位、分类和公告的查询、审核与治理，并保护招聘业务历史不被误删。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：管理端实现。
- `backend/src/main/java/com/dreamhiring/mapper/UserMapper.java`、`CompanyMapper.java`、`JobMapper.java`、`ApplicationMapper.java`、`ResumeMapper.java`、`MessageMapper.java`：治理所需数据。
- `backend/src/main/java/com/dreamhiring/messaging/NotificationGateway.java`：公告发布事件。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：删除限制和权限测试。

###### 实现思路

1. 列表方法使用 PageHelper 分页，再把 Page 转成 `PageVO`。
2. 删除用户前检查简历、投递、企业账号绑定和消息；存在关联时返回 409，仅允许删除空账号。
3. 企业审核只接受 APPROVED/REJECTED，驳回必须填写原因；职位审核采用同样规则。
4. 职位审核通过时设置 PUBLISHED 并补发布时间，审核原因写入职位。
5. 分类创建/更新校验父节点存在且为一级分类，禁止自引用、三级结构和把有子节点的分类改为二级。
6. 分类删除前检查子分类和职位引用，存在任一项都返回 409。
7. 公告创建为 PUBLISHED 或从非发布状态首次进入 PUBLISHED 时发布公告事件，已发布公告再次编辑不重复通知。
8. 所有 Entity 都通过私有映射方法转换为 UserProfileView、CompanyView、CompanyJobView 或 CategoryNode，Controller 不接触 Entity。

##### `AnnouncementServiceImpl`

###### 功能目标

实现公告公开列表和详情读取，确保只有已发布公告能被普通用户看到。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/AnnouncementServiceImpl.java`：公告实现。
- `backend/src/main/resources/mapper/AnnouncementMapper.xml`：发布公告查询。
- `backend/src/main/java/com/dreamhiring/vo/AnnouncementView.java`：响应结构。

###### 实现思路

1. 使用 PageHelper 执行 `findPublished`，只选择 PUBLISHED 且未删除的记录。
2. 详情额外检查发布状态，未发布按 404 处理。
3. 静态 `toView` 把 `publishTime` 映射为 OpenAPI 字段 `publishedAt`。
4. 页面只返回 `createdAt`，不泄露更新人和删除标记。

##### `ApplicationServiceImpl`

###### 功能目标

实现求职者投递、企业候选人处理和投递状态机，保证重复投递、越权和非法流转被拦截。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：投递实现。
- `backend/src/main/java/com/dreamhiring/mapper/ApplicationMapper.java`：投递数据访问。
- `backend/src/main/java/com/dreamhiring/messaging/NotificationGateway.java`：通知发布。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：重复投递和候选人流程测试。

###### 实现思路

1. 创建投递先校验简历属于当前求职者、职位已发布且审核通过。
2. 计算技能交集并保存匹配分快照；后续简历变化不回溯历史记录。
3. 状态机使用静态 `Map<ApplicationStatus, EnumSet<ApplicationStatus>>` 定义允许的下一步。
4. 企业详情/列表通过当前企业查询对应职位，确保候选人不跨企业访问。
5. 进入 INTERVIEW 或 REJECTED 时创建事件并交给通知网关；其他状态不重复发消息。
6. 详情转换时关联简历、候选人和职位摘要，响应字段与 OpenAPI `ApplicationDetail` 一致。

##### `AuthServiceImpl`

###### 功能目标

实现验证码注册、登录、JWT 签发、当前身份查询和最近登录时间更新。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：认证实现。
- `backend/src/main/java/com/dreamhiring/service/CaptchaService.java`：验证码消费。
- `backend/src/main/java/com/dreamhiring/security/JwtService.java`：令牌签发。
- `backend/src/main/resources/mapper/UserMapper.xml`：登录时间更新。

###### 实现思路

1. 注册先拒绝 ADMIN 自助注册，再消费验证码并检查用户名唯一性。
2. 密码通过 `PasswordEncoder` 编码后写入，COMPANY 注册同时创建待审核企业资料。
3. 登录先消费验证码，再查询用户并校验密码；密码错误返回 401，禁用返回 403。
4. 登录成功后更新 `last_login_time`，但不改变资料更新时间。
5. 使用 `SecurityPrincipal` 创建 JWT，角色来自数据库而非请求体。
6. `requirePrincipal` 统一处理匿名、JWT 无效和测试身份注入。

##### `CompanyServiceImpl`

###### 功能目标

实现企业资料维护、职位发布/更新/上下架、职位查询和企业招聘看板。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：企业实现。
- `backend/src/main/java/com/dreamhiring/mapper/CompanyMapper.java`、`JobMapper.java`、`JobCategoryMapper.java`：数据访问。
- `backend/src/main/java/com/dreamhiring/service/HotJobCacheService.java`：热门缓存清理。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：企业资料和看板契约测试。

###### 实现思路

1. 从当前用户 ID 查找企业，所有请求进一步限定 `companyId`，阻止跨企业操作。
2. 职位创建校验分类存在且为叶子分类、薪资范围合法，并初始化为 DRAFT/PENDING。
3. 职位更新重新设置审核状态 PENDING、清空审核原因，并保存职责/要求/福利。
4. 只有审核通过职位允许更新为 PUBLISHED；发布时补 `publishTime`。
5. 职位写入和删除后清除热门缓存，避免旧列表继续展示。
6. 看板聚合职位数、待处理候选人、面试数、平均分和最近投递；漏斗中的 hires 在 V1.0 无招聘终态时保持 0。

##### `JobServiceImpl`

###### 功能目标

实现公开职位检索、热门职位缓存、职位详情、分类树和简历匹配度计算。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：职位实现。
- `backend/src/main/resources/mapper/JobMapper.xml`：公开查询 SQL。
- `backend/src/main/java/com/dreamhiring/service/HotJobCacheService.java`：Redis ZSET。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：热门、职位详情和分类契约测试。

###### 实现思路

1. 搜索使用 PageHelper 分页，SQL 固定过滤 PUBLISHED/APPROVED，再应用关键词、城市、薪资等条件。
2. 批量加载职位对应企业，避免每条记录重复查询企业。
3. 热门列表先读 Redis ZSET；命中时按 ID 回源并保持缓存顺序，未命中时查询 MySQL 后回填。
4. 详情再次检查发布和审核状态，递增数据库浏览量，并加载企业摘要、职责、要求和发布时间。
5. 分类树从全部有效分类按 parentId 分组，只计算公开职位数量。
6. 求职者使用默认简历计算匹配/缺失技能和分数，匿名或其他角色返回 `null`。

##### `MessageServiceImpl`

###### 功能目标

实现当前用户站内消息分页、未读统计、详情、单条/全部已读和逻辑删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/MessageServiceImpl.java`：消息实现。
- `backend/src/main/java/com/dreamhiring/mapper/MessageMapper.java`：消息查询/更新。
- `backend/src/main/java/com/dreamhiring/vo/MessageViews.java`：响应模型。

###### 实现思路

1. 使用 PageHelper 按接收人查询，类型和已读条件可选。
2. `unreadCount` 调用 COUNT SQL，不在内存中统计。
3. 详情、已读、删除先通过 `id + receiverId` 查找，找不到返回 404。
4. 单条已读和删除使用事务，全部已读直接批量更新。
5. 响应固定使用组件名 `isRead`，与 OpenAPI 字段一致。

##### `ResumeServiceImpl`

###### 功能目标

实现多简历、默认简历、附件上传替换和删除清理。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：简历实现。
- `backend/src/main/java/com/dreamhiring/mapper/ResumeMapper.java`：简历 SQL。
- `backend/src/main/java/com/dreamhiring/service/FileService.java`：附件能力。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：简历读取测试。

###### 实现思路

1. 创建前检查用户是否已有简历，首份自动设为默认。
2. 更新保留原 `createTime`、附件对象键和默认标记，只替换用户编辑字段。
3. 设置默认时先重置该用户全部默认标记，再设置目标简历。
4. 删除默认简历后查询剩余列表并提升第一条；旧附件在事务提交后删除。
5. 上传新附件后更新对象键，并在提交后异步清理旧附件，避免孤儿文件和事务未提交误删。

##### `StatsServiceImpl`

###### 功能目标

实现数据大屏聚合、连续月份趋势和热门技能返回。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：统计实现。
- `backend/src/main/java/com/dreamhiring/mapper/StatsMapper.java`：统计查询。
- `backend/src/main/java/com/dreamhiring/vo/StatsViews.java`：统计响应。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：趋势月份测试。

###### 实现思路

1. 读取最新 `analysis_stat`，按 dimension 分组为薪资、城市、学历、经验和行业五类分布，同时读取 `overview` 中的有效样本数和数据集平均月薪。
2. 热门技能从 `analysis_hot_skill` 读取并限制 1-50 条。
3. Overview 优先使用离线分析样本数和平均月薪；分析结果缺失时回退到平台职位数和职位均薪。供需比与技能匹配均值继续读取平台投递数据。
4. Trend 读取职位创建时间和投递时间，在 Java 中按 `YearMonth` 聚合最近 1-24 月。
5. 元数据返回来源数据集、统计日期和数据更新时间，不直接暴露数据库查询结果。

##### `UserServiceImpl`

###### 功能目标

实现当前用户资料更新和密码修改。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/UserServiceImpl.java`：用户实现。
- `backend/src/main/java/com/dreamhiring/mapper/UserMapper.java`：用户更新 SQL。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：用户资料字段测试。

###### 实现思路

1. 通过 `requirePrincipal` 读取用户 ID，再查询最新数据库资料。
2. 更新时只覆盖客户端传入的非空字段，并更新时间。
3. 修改密码先使用 `PasswordEncoder.matches` 校验旧密码。
4. 新旧密码相同返回 422，新密码编码后更新。
5. 所有响应统一转换为 UserProfileView，不返回密码哈希。

#### Storage、Util 与 VO 详细实现

##### `ObjectStorageService`

###### 功能目标

定义业务层统一使用的对象存储能力，隔离阿里云 OSS 和测试替身。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/storage/ObjectStorageService.java`：存储接口。
- `backend/src/main/java/com/dreamhiring/storage/OssObjectStorageService.java`：OSS 实现。
- `backend/src/main/java/com/dreamhiring/storage/StubObjectStorageService.java`：测试实现。

###### 实现思路

1. `upload` 接收用途、所有者、原始文件名、真实内容类型和字节数组。
2. `StoredObject` record 返回对象键、访问 URL、可见性和过期时间。
3. `delete` 用于清理不再引用的附件。
4. `createPrivateAccessUrl` 为简历附件生成短期签名 URL，`createPublicUrl` 为 Logo/头像生成稳定公开 URL。
5. 业务 Service 只依赖接口，不直接使用 OSS SDK 类型。

##### `OssObjectStorageService`

###### 功能目标

使用阿里云 OSS 实现真实文件上传、签名 URL 和对象删除。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/storage/OssObjectStorageService.java`：OSS 实现。
- `backend/src/main/java/com/dreamhiring/storage/StorageProperties.java`：Bucket 和凭证配置。
- `backend/src/main/java/com/dreamhiring/config/StorageConfig.java`：OSS 客户端 Bean。

###### 实现思路

1. 根据 scope 选择 `resume`、`company-logo`、`avatar` 或 `misc` 前缀。
2. 对象键包含 ownerId、年月、UUID 和清洗后的文件名，避免重名和路径注入。
3. 上传时设置内容长度和真实内容类型。
4. 简历附件标记 PRIVATE 并使用短期签名 URL；Logo/头像设置 `PublicRead` ACL 并返回 CDN/公开 URL。
5. 公开 URL 优先使用 `publicBaseUrl`，未配置时根据 Bucket 和 Endpoint 生成。
6. 删除、私有签名和公开 URL 生成都通过单例 OSS 客户端执行。

##### `StorageProperties`

###### 功能目标

把 OSS 模式、Endpoint、Bucket、密钥和签名有效期映射为强类型配置。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/storage/StorageProperties.java`：配置类。
- `backend/src/main/resources/application-prod.yml`、`deploy/.env.production.example`：允许提交的无密钥配置占位。
- `backend/src/main/java/com/dreamhiring/config/StorageConfig.java`：配置消费。

###### 实现思路

1. 使用 `@ConfigurationProperties(prefix="app.storage")`。
2. `mode` 默认 oss，测试通过 Profile 改成 stub。
3. 内部 `Oss` 静态类保存 Endpoint、Bucket、AccessKey、Secret、公开基础地址和签名秒数。
4. 默认签名有效期 900 秒，限制私有对象暴露时间。
5. 不把真实密钥写入仓库或示例值之外的位置。
6. `publicBaseUrl` 指向 CDN 或公开域名，避免公开资源依赖短期签名。

##### `StubObjectStorageService`

###### 功能目标

提供不访问网络的存储替身，使文件、简历和投递测试可在 CI 和本地独立运行。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/storage/StubObjectStorageService.java`：测试存储。
- `backend/src/test/resources/application-test.yml`：启用 stub 模式。
- `backend/src/main/java/com/dreamhiring/service/FileService.java`：调用方。

###### 实现思路

1. 通过 `@ConditionalOnProperty` 只在 `app.storage.mode=stub` 时装配。
2. 使用 scope、ownerId、UUID 和原文件名生成模拟对象键。
3. 返回 `/stub-files/...` 访问 URL 和私有对象过期时间。
4. `delete` 不写磁盘，避免测试残留。
5. 保持与真实 OSS 相同的返回契约，测试无需分支判断实现。

##### `SkillTagUtils`

###### 功能目标

统一技能、职责、要求和福利列表与数据库分隔文本之间的转换。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/util/SkillTagUtils.java`：分隔文本工具。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：职位列表转换。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：简历技能转换。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：匹配和列表集成验证。

###### 实现思路

1. `split` 支持中英文逗号、分号、竖线和换行。
2. 每项执行 trim，过滤空项并按首次出现顺序去重。
3. `join` 过滤空值、trim 和去重，再用逗号写入数据库。
4. 同一个工具同时处理技能、职责、要求和福利，避免多套分隔规则。
5. 空列表返回空字符串，读取空字符串返回空数组。

##### `AnnouncementView`

###### 功能目标

定义公告 API 响应，保证字段名和可空性与 OpenAPI 一致。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/AnnouncementView.java`：公告 VO。
- `backend/src/main/java/com/dreamhiring/service/impl/AnnouncementServiceImpl.java`：映射来源。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：字段反射和真实响应测试。

###### 实现思路

1. 使用 record 固定公告 ID、标题、摘要、正文、渠道和状态。
2. 使用 `publishedAt` 而不是数据库字段名 `publishTime`。
3. 保留 `createdAt`，但不返回更新时间和删除标记。
4. 时间字段由全局 Jackson 配置输出北京时间格式。

##### `ApplicationViews`

###### 功能目标

定义投递列表和详情响应，既服务求职者进度，也服务企业候选人处理。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/ApplicationViews.java`：投递 VO。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：映射来源。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：候选人字段和响应契约测试。

###### 实现思路

1. `ApplicationView` 保存投递 ID、简历/职位/用户 ID、状态、匹配分、备注和两个业务时间。
2. 摘要中包含 JobSummary，避免前端再请求职位基础数据。
3. `ApplicationDetailView` 在摘要字段后追加完整 ResumeView 和候选人 UserView。
4. record 只组合已有 VO，不返回 Entity 或企业私有信息。
5. 字段集合由反射测试直接与 `Application`/`ApplicationDetail` schema 比对。

##### `AuthViews`

###### 功能目标

统一登录、用户资料和验证码响应，区分“用户摘要”与“完整用户资料”。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/AuthViews.java`：认证 VO 容器。
- `backend/src/main/java/com/dreamhiring/service/impl/AuthServiceImpl.java`：登录和资料映射。
- `backend/src/main/java/com/dreamhiring/controller/AuthController.java`：返回入口。

###### 实现思路

1. `UserView` 作为登录用户摘要，包含身份和联系方式。
2. `UserProfileView` 追加创建、更新和最近登录时间，服务用户资料接口。
3. `AuthView` 组合 access token、token type、expiresIn 和摘要。
4. `CaptchaView` 返回 UUID、SVG data URL 和 120 秒有效期。
5. 两类用户 VO 分离，避免登录响应无意义地携带时间字段，同时满足用户资料 schema。

##### `CompanyViews`

###### 功能目标

定义企业资料、企业职位和企业看板响应。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/CompanyViews.java`：企业端 VO 容器。
- `backend/src/main/java/com/dreamhiring/service/impl/CompanyServiceImpl.java`：映射来源。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：复用企业职位映射。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：企业端字段测试。

###### 实现思路

1. `CompanyView` 组合企业摘要字段、联系人、活跃职位数、审核状态/原因和时间。
2. `CompanyJobView` 展开 JobSummary/JobDetail 所需字段，再追加审核、申请人统计和创建时间。
3. `DashboardView` 保存看板四个核心指标。
4. `Funnel` 保存浏览量、投递、面试和录用数量。
5. 最近投递使用 ApplicationView 数组，不返回企业不需要的完整简历。

##### `CountView`

###### 功能目标

提供统一单值计数响应，避免返回裸数字破坏 API 结构。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/CountView.java`：计数值 VO。
- `backend/src/main/java/com/dreamhiring/controller/MessageController.java`：未读数和全部已读返回。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：消息字段契约测试。

###### 实现思路

1. 使用 `long count` 支持较大消息量。
2. 未读数和全部已读接口共用同一结构。
3. 通过 `Result<CountView>` 返回，不直接返回数字。
4. 字段与 OpenAPI `UnreadCountData` 一致。

##### `FileView`

###### 功能目标

定义统一文件上传结果，明确哪些字段可持久化、哪些仅是短期访问信息。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/FileView.java`：文件响应。
- `backend/src/main/java/com/dreamhiring/service/FileService.java`：创建返回对象。
- `backend/src/main/java/com/dreamhiring/controller/FileController.java`：接口返回。

###### 实现思路

1. 返回 OSS `objectKey`、短期 `url` 和可见性。
2. 私有对象返回 `urlExpiresAt`，公开对象该字段为 `null`。
3. 返回原始文件名、真实 MIME 类型和字节大小。
4. 数据库只保存 objectKey，临时 URL 不写入业务表。
5. 上传结果由 `Result<FileView>` 包装。

##### `JobViews`

###### 功能目标

定义职位列表、详情、企业摘要、匹配解释和分类树响应。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/JobViews.java`：职位 VO 容器。
- `backend/src/main/java/com/dreamhiring/service/impl/JobServiceImpl.java`：公开职位映射。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：职位 schema 反射比对。

###### 实现思路

1. `CompanyBrief` 提供职位卡片和详情所需企业摘要。
2. `MatchExplanation` 保存匹配分、命中/缺失技能和数量。
3. `JobSummary` 保存列表字段，包括企业 Logo、技能、福利、浏览量和更新时间。
4. `JobDetail` 在摘要全部字段基础上追加描述、职责、要求、企业摘要和发布时间。
5. `CategoryNode` 保存分类和公开职位数，并通过 `children` 递归支持两级树。
6. 字段与 OpenAPI `JobSummary`、`JobDetail`、`CategoryNode` 精确对齐。

##### `MessageViews`

###### 功能目标

定义站内消息响应，尤其保持 OpenAPI 的 `isRead` 字段名。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/MessageViews.java`：消息 VO。
- `backend/src/main/java/com/dreamhiring/service/impl/MessageServiceImpl.java`：映射来源。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：`read` 泄漏检查。

###### 实现思路

1. record 组件直接命名为 `isRead`，不依赖 JavaBean 的 `getRead` 命名推导。
2. 保存消息 ID、接收人、类型、标题、正文和关联业务 ID。
3. 创建时间由全局 Jackson 配置输出。
4. 不支持对外返回逻辑删除标记。

##### `ResumeView`

###### 功能目标

定义在线简历 API 响应，供简历列表、详情和投递详情复用。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/ResumeView.java`：简历 VO。
- `backend/src/main/java/com/dreamhiring/service/impl/ResumeServiceImpl.java`：简历映射。
- `backend/src/main/java/com/dreamhiring/service/impl/ApplicationServiceImpl.java`：候选人简历映射。

###### 实现思路

1. 返回用户、姓名、方向、学历、经验、城市和期望薪资。
2. 技能以字符串数组返回，不把数据库分隔文本暴露给前端。
3. 同时返回 attachmentObjectKey 和临时 attachmentUrl。
4. `isDefault` 使用布尔值映射数据库整型标记。
5. 时间字段使用统一业务格式，不返回 deleted。

##### `StatsViews`

###### 功能目标

定义数据大屏的聚合结果、分布数据、趋势、技能和元数据。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/StatsViews.java`：统计 VO 容器。
- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：映射来源。
- `backend/src/test/java/com/dreamhiring/ApiContractIntegrationTest.java`：趋势和 schema 测试。

###### 实现思路

1. `Overview` 包含样本数、平均薪资、供需比和平均匹配分。
2. `Distribution` 表示各类图表中的名称、数值和百分比。
3. `TrendPoint` 使用年月字符串、职位数和投递数。
4. `HotSkill` 只保留技能和频次。
5. `Metadata` 返回数据集、统计日期和更新时间。
6. `Dashboard` 组合所有数组和对象，字段与 `DashboardStatsData` 一致。

### 前端真实后端联调基础模块

#### 功能目标

让正式 Vue 前端从本地 Mock 数据切换到真实 Spring Boot API，先打通验证码、登录、身份恢复、401 失效处理、三种角色入口和依赖真实业务数据的基础操作，为后续三角色完整业务闭环验收建立稳定基础。

#### 涉及文件

- `frontend/.env.development.local`：本机真实联调配置，关闭 Mock 并指向 `http://localhost:8080/api`；该文件被 `*.local` 忽略。
- `frontend/src/utils/runtime.js`：Mock 模式判断、本地会话 Key 和认证失效事件。
- `frontend/src/api/client.js`：Axios 认证头、统一错误转换和 401 清理逻辑。
- `frontend/src/api/index.js`：管理端企业详情、企业审核和管理员职位详情 API。
- `frontend/src/stores/auth.js`：登录态、`/auth/me` 身份恢复、会话重置。
- `frontend/src/router/index.js`：路由切换前校验真实登录态和角色。
- `frontend/src/main.js`：监听认证失效事件并返回登录页。
- `frontend/src/views/auth/LoginView.vue`：真实验证码加载、登录和失败刷新。
- `frontend/src/layouts/MainLayout.vue`：真实模式隐藏 Mock 角色切换。
- `frontend/src/utils/resume.js`：动态解析默认简历 ID。
- `frontend/src/views/seeker/JobsView.vue`、`JobDetailView.vue`：投递不再写死简历 ID。
- `frontend/src/views/company/JobsView.vue`：职位分类动态加载和职责/要求/福利提交。
- `frontend/src/views/company/ProfileView.vue`：企业联系人字段。
- `frontend/src/views/admin/CompaniesView.vue`：企业认证通过/驳回。
- `frontend/src/api/mock/handlers.js`：同步补齐 Mock 模式契约，保证两种模式并存。
- `frontend/src/test/api.spec.js`、`auth.spec.js`：真实模式切换涉及的前端行为测试。

#### 实现思路

1. 使用环境变量决定数据源：`VITE_USE_MOCK=true` 保留零后端原型模式，`VITE_USE_MOCK=false` 使用真实 Axios 请求；本机覆盖配置放在 `.env.development.local`，不提交环境相关地址。
2. 登录页初始化时调用验证码接口，把 `captchaId` 和 `imageBase64` 保存到组件状态并展示图片；用户点击图片可刷新，登录失败后自动获取新验证码，避免重复使用已消费验证码。
3. 登录请求只提交服务端返回的 `captchaId`，不再写死 `mock-captcha`；完成登录后根据服务端返回的 `user.role` 跳转，而不是根据页面上的角色选择推断角色。
4. Auth Store 增加 `identityChecked`，首次进入应用或刷新页面时调用 `GET /api/auth/me` 恢复最新用户资料和角色；校验成功后缓存结果，避免每次路由切换重复请求。
5. Axios 响应拦截器统一把 HTTP 错误转换为 `ApiError`。登录、注册、验证码接口的 401 只交给表单展示，不清除页面；其他接口的 401 才清理 token/user 并广播 `dreamhiring:auth-expired`。
6. 应用根入口监听认证失效事件，通过 Vue Router 返回登录页并携带原页面地址，避免直接刷新整个页面造成表单和交互状态丢失。
7. 真实模式隐藏“切换视角”和 Mock 帮助卡，只显示当前登录角色；Mock 模式继续保留角色切换，方便无后端演示。
8. 求职者投递前通过 `resumeApi.list()` 选择默认简历并取得真实 ID，移除 Mock 数据中的固定 `resumeId=30001`。
9. 企业职位发布从公开分类树动态获取二级分类，提交时补齐职责、要求和福利数组，避免依赖固定分类 ID。
10. 管理端补齐企业详情和企业审核 API，企业认证页支持通过以及带原因驳回；Mock 处理器同步实现相同路径与校验，防止 Mock 与真实后端分叉。
11. 本地开发配置中如果 OSS 密钥采用顶层 `storage.oss.*`，在 `app.storage.oss.*` 使用属性引用完成绑定适配；不读取、输出或改写真实密钥。

#### 验证

```powershell
cd E:\develop\DreamHiring\frontend
npm test
npm run build
```

- 前端单元测试：9 项通过。
- 生产构建通过。
- 真实后端验证码获取、三种角色登录、`/api/auth/me`、职位检索、默认简历读取、企业看板、管理员用户和企业列表均返回成功。
- Vite 真实模式运行于 `http://127.0.0.1:5173`，后端运行于 `http://localhost:8080`。

#### 已知限制

- 本模块最初只覆盖认证与基础读取链路；职位发布、附件上传、候选人处理、完整注册表单和简历创建已由后续“招聘业务全链路闭环”补齐。

### 招聘业务全链路闭环

#### 功能目标

在真实 MySQL、Redis、RabbitMQ 和 OSS 上打通“求职者注册 → 创建简历 → 上传附件 → 投递 → 企业处理 → 站内消息 → 企业注册/认证 → 职位发布/审核 → 公开职位可见”的完整业务链路，并保证前端和自动化测试都能重复验证。

#### 涉及文件

- `frontend/src/views/auth/LoginView.vue`：登录/注册模式切换、求职者和企业注册。
- `frontend/src/components/CaptchaImage.vue`：真实验证码图片和点击刷新。
- `frontend/src/stores/auth.js`：注册成功后持久化登录态。
- `frontend/src/views/seeker/ResumeView.vue`：首份简历创建、完整资料编辑和 OSS 附件上传。
- `frontend/src/views/company/JobsView.vue`：动态分类、职责/要求/福利提交、审核原因和上下架限制。
- `frontend/src/views/company/ProfileView.vue`：联系人维护和企业审核原因展示。
- `frontend/src/views/admin/AuditsView.vue`：职位通过和填写原因驳回。
- `frontend/src/api/mock/handlers.js`：Mock 注册、简历和企业数据同步。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：企业认证通过后才允许职位发布。
- `backend/src/main/java/com/dreamhiring/config/DemoDataInitializer.java`：开发种子数据创建一级和二级分类。
- `backend/src/test/java/com/dreamhiring/BusinessClosureIntegrationTest.java`：完整招聘闭环集成测试。
- `backend/src/test/java/com/dreamhiring/config/DemoDataInitializerTest.java`：两级种子分类测试。

#### 实现思路

1. 登录页通过“登录/注册”模式切换共用验证码组件；注册只能选择 SEEKER 或 COMPANY，成功后直接保存服务端签发的 token 和用户角色。
2. 求职者没有简历时，简历页进入创建模式，而不是继续调用不存在的简历 ID。
3. 简历表单补齐当前城市、期望城市、期望薪资和技能标签；保存时根据 `resume` 是否存在选择 POST 创建或 PUT 更新。
4. 附件选择后构造 `FormData` 调用 `/api/resumes/{id}/attachment`，成功响应中的 objectKey 和签名 URL 立即回填页面。
5. 投递页通过 `resumeApi.list()` 动态获取默认简历 ID，不再依赖 Mock 固定 ID。
6. 企业职位发布从公开分类树选择叶子分类；动态分类为空时优先使用现有根节点，避免旧库一级分类阻断演示。
7. 企业职位列表显示审核原因；只有审核通过才允许上架，PENDING/REJECTED 状态显示不可上架。
8. 管理员驳回职位时必须输入原因，原因通过职位详情返回企业端。
9. `AdminServiceImpl.auditJob` 在通过职位前校验企业认证状态，企业不是 APPROVED 时返回 409。
10. 求职者投递后企业更新为 INTERVIEW；Local/Rabbit 通知链路写入 `APPLICATION` 消息，求职者消息列表按 `relatedId` 可查询到该通知。
11. 自动化测试通过解码本地验证码 SVG 获取测试验证码，完成真实 Controller 层注册，不绕过验证码或认证过滤链。
12. 种子数据初始化器新增“产品 / 设计 → 产品经理”两级结构，并把示例职位挂到二级分类。

#### 验证

```powershell
cd E:\develop\DreamHiring\backend
mvn clean test
mvn package

cd E:\develop\DreamHiring\frontend
npm test
npm run build
```

- 后端标准测试：47 项，44 项通过，3 项条件测试跳过，无失败。
- 前端测试：11 项通过。
- 前端生产构建通过。
- 真实基础设施闭环通过：注册、简历、OSS 上传、投递、面试状态、站内消息、企业认证、职位发布和公开详情全部成功。
- OSS 私有附件签名 URL 实测返回 `200`，测试文件 68 字节。

#### 已知限制

- 真实闭环测试在本地 MySQL 留下闭环账号、简历、投递和测试职位，未做物理清理，避免破坏投递历史。
- 当前终端环境存在 `HTTPS_PROXY`，直接访问 OSS URL 会超时；绕过代理访问正常，属于本机网络环境影响。
- 浏览器端自动化尚未覆盖完整注册、附件上传和审核交互，目前由前端单测、真实 API 闭环测试和手工验收共同覆盖。

### 公告 RabbitMQ 站内消息链路

#### 功能目标

公告首次进入 PUBLISHED 状态时，根据 `ALL / SEEKER / COMPANY` 触达范围异步生成站内消息，避免公告发布与逐个用户消息写入绑定在同一个请求线程中，并保证重复消费不产生重复消息。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementPublishedEvent.java`：公告发布事件。
- `backend/src/main/java/com/dreamhiring/messaging/NotificationGateway.java`：公告发布边界。
- `backend/src/main/java/com/dreamhiring/messaging/LocalNotificationGateway.java`：本地同步实现。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationGateway.java`：事务提交后发送。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConfig.java`：公告队列、路由键和死信绑定。
- `backend/src/main/java/com/dreamhiring/messaging/AnnouncementNotificationConsumer.java`：公告消费者。
- `backend/src/main/java/com/dreamhiring/service/NotificationService.java`：公开目标查询和幂等消息写入。
- `backend/src/main/java/com/dreamhiring/mapper/UserMapper.java`、`resources/mapper/UserMapper.xml`：按角色查询 ACTIVE 用户。
- `backend/src/main/java/com/dreamhiring/service/impl/AdminServiceImpl.java`：公告首次发布时触发事件。
- `backend/src/test/java/com/dreamhiring/BusinessClosureIntegrationTest.java`：公告本地消息测试。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：真实 RabbitMQ 公告测试。
- `frontend/src/api/mock/handlers.js`：Mock 模式公告渠道消息。
- `frontend/src/test/api.spec.js`：前端公告消息契约测试。

#### 实现思路

1. 管理员创建 PUBLISHED 公告时发布 `AnnouncementPublishedEvent`；DRAFT 不发送。
2. 更新公告时先读取原状态，只有从非 PUBLISHED 进入 PUBLISHED 才发送，已发布公告编辑不重复通知。
3. Local 模式直接调用 `NotificationService.sendAnnouncement`；Rabbit 模式注册 `afterCommit`，数据库事务提交后再发送。
4. Rabbit Config 新增独立公告队列 `dreamhiring.announcement.queue`、路由键 `announcement.published` 和对应死信绑定。
5. 公告消费者使用与投递通知相同的手动 ACK、3 次重试和最终死信策略。
6. `NotificationService` 按渠道查询 ACTIVE 用户：ALL 包含三种角色，SEEKER/COMPANY 只包含对应角色。
7. 每个接收人 dedupKey 为 `ANNOUNCEMENT:{公告ID}:{用户ID}`，唯一索引保证消息只写一次。
8. 消息标题使用 `平台公告：{标题}`，正文优先使用公告摘要；摘要为空时提示前往公告中心。
9. Mock 模式发布公告时同步向目标角色用户写入 ANNOUNCEMENT 消息，保持无后端演示行为一致。

#### 验证

- 后端标准测试：48 项，44 项通过，4 项条件测试跳过，无失败。
- 前端测试：12 项通过，生产构建通过。
- 真实 RabbitMQ：投递消息和公告消息均通过手动 ACK 消费并落库。
- 真实渠道验证：SEEKER 公告只有求职者收到；COMPANY 公告只有企业收到。

#### 已知限制

- 大量用户公告会为每个用户生成一条消息，V1.0 未做批量插入优化。
- 公告修改后不会再次推送；如需“更新提醒”，应设计独立版本事件。
- 死信现在同时保留数据库归档和 RabbitMQ DLQ；管理员界面可查看与重投，重投成功不会自动删除 broker 中的原死信。

### 认证接口限流

#### 功能目标

为验证码、登录和注册接口提供按客户端 IP 的固定窗口限流，防止暴力尝试、验证码刷取和批量注册，并让接口文档中的 `429` 语义真正生效。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/config/RateLimitProperties.java`：限流配置。
- `backend/src/main/java/com/dreamhiring/config/RateLimitConfig.java`：拦截器注册。
- `backend/src/main/java/com/dreamhiring/config/RateLimitInterceptor.java`：HTTP 限流与 429 响应。
- `backend/src/main/java/com/dreamhiring/service/RateLimitService.java`：Redis/内存计数。
- `backend/src/main/resources/application.yml`：默认限额和窗口配置。
- `backend/src/test/resources/application-test.yml`：普通测试默认关闭限流。
- `backend/src/test/java/com/dreamhiring/AuthRateLimitIntegrationTest.java`：MVC 429 集成测试。
- `backend/src/test/java/com/dreamhiring/config/RateLimitInterceptorTest.java`：响应头和 429 测试。
- `backend/src/test/java/com/dreamhiring/service/RateLimitServiceTest.java`：内存降级测试。
- `docs/api/README.md`：认证接口限流规则。
- `docs/architecture/backend-engineering-guidelines.md`：工程规范补充。

#### 实现思路

1. 默认窗口 60 秒：验证码 30 次、登录 10 次、注册 5 次。
2. 拦截器只处理三个认证 POST 路径，根据 URI 选择对应限额。
3. 客户端维度使用 `request.getRemoteAddr()`；Spring 使用 forwarded-header 策略适配反向代理。
4. Redis 使用 `rate:{rule}:{ip}` Key 做 `INCR`，首次计数设置 TTL。
5. Redis 异常时回退到 `ConcurrentHashMap` 本地固定窗口，防止认证入口完全失去保护。
6. 超限返回 HTTP 429、统一 JSON 和 `Retry-After`、`X-RateLimit-Limit`、`X-RateLimit-Remaining`。
7. `RateLimitConfig` 仅在完整应用存在 `RateLimitService` 时装配，避免污染 `@WebMvcTest` 轻量测试切片。

#### 验证

- 后端全量测试：51 项，47 项通过，4 项条件测试跳过，无失败。
- 真实 Redis 验证：前 10 次登录为 400，第 11 次为 429，`Retry-After=60`、限额为 10。
- API 文档测试 7 项、架构文档测试 7 项通过。

#### 已知限制

- 当前按 IP 限流，共享 NAT 后的多个用户会共享额度。
- 本地降级计数按单实例生效，多实例部署必须使用 Redis。
- 限流为固定窗口，临界点可能出现短时双倍流量；高并发场景可升级滑动窗口或令牌桶。

### 阿里云天池招聘数据分析线

#### 功能目标

使用阿里云天池数据集 `163746` 的原始中文招聘 CSV 生成 DreamHiring 数据大屏统计结果。链路需要兼容该文件的无表头、`GB18030` 编码和列表字符串字段，完成去重、四维有效样本过滤、薪资统一、城市/学历/经验/行业归并和中文职位描述技能提取，同时彻底移除英文招聘数据集依赖。

#### 涉及文件

- `backend/analysis/adapters/tianchi_163746.py`：天池数据读取、字段解析、归一化、业务键去重和技能提取。
- `backend/analysis/adapters/__init__.py`：适配器公开入口和数据集元信息。
- `backend/analysis/job_market_analysis.py`：统一分析流程、分布统计、分析摘要和 SQL 生成。
- `backend/analysis/sources/tianchi-163746.md`：来源地址、字段口径、样本摘要、使用限制和许可证风险。
- `backend/analysis/tests/test_job_market_analysis.py`：薪资、列表字段、城市、学历、经验、技能、去重和统计测试。
- `backend/analysis/README.md`：数据准备和离线分析命令。
- `backend/src/main/java/com/dreamhiring/service/impl/StatsServiceImpl.java`：优先读取分析样本数及数据集平均月薪。
- `backend/src/test/resources/test-data.sql`：数据大屏测试样本。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：样本数、平均薪资和数据源接口断言。
- `docs/api/README.md`、`docs/architecture/backend-engineering-guidelines.md`：数据源约定、许可证风险和统计口径。
- `docs/api/generate-openapi.mjs`、`docs/api/openapi.json`：大屏统计字段说明。
- `.gitignore`：排除 `data/raw/` 原始数据。
- `frontend/src/api/mock/db.js`、`frontend/src/views/dashboard/DashboardView.vue`、`demo/app.js`：原型和 Mock 展示切换到天池中文数据来源。

#### 实现思路

1. `load_tianchi_163746` 使用 `pandas.read_csv(..., encoding="gb18030", header=None)` 读取固定 10 列，避免编码错误和首行被误作表头。
2. 先删除完全重复的原始记录，再解析第 5、8、9 列中的 Python 列表字符串。`parse_list_field` 使用 `ast.literal_eval`，并统一清除 `\xa0`、换行和多余空白。
3. `normalize_city_and_district` 将“深圳-南山区”拆成城市和区域，排除“异地招聘”和纯数字异常值。
4. `normalize_education` 将原始学历归并为中专及以下、大专、本科、硕士、博士和不限；`normalize_experience` 将原始年限归并为应届/无经验、1-3年、3-5年、5-10年、10年以上和不限。
5. `normalize_industry` 取行业列表中的第一项，并在单项包含多个行业时继续按逗号取主行业。
6. `extract_skills` 使用受控词典匹配 Python、SQL、Excel、统计分析、机器学习、数据仓库等技能，全部从中文职位描述提取，不再读取英文招聘数据集。
7. 以标题、公司、城市、区域、薪资、学历、经验、行业和描述组成业务键，删除跨发布日期重复的同一条招聘记录。
8. `analyze` 的 `tianchi-163746` 模式只保留标题、城市、薪资、学历和经验均有效的样本，确保 `sampleCount` 不会把缺失关键维度的数据计算进去。
9. `parse_salary` 支持千/月、万/月、万/年和元/天，并统一转换为月薪 K；无法识别的“面议”或空值不进入有效样本。
10. 统计结果新增 `overview/sample_count` 和 `overview/average_salary` 两个维度。`StatsServiceImpl` 优先读取这两个值，只有分析结果不存在时才回退到平台在线职位。
11. 脚本默认输出事务化 SQL，人工审查后传 `--execute` 才写入 MySQL；同数据集、同统计日期的旧结果会在事务内先删除再重建。
12. 原始 30 MB CSV 位于 `data/raw/` 且已加入 `.gitignore`，仓库只保留来源说明、适配代码、测试和小样本。

#### 本次真实数据结果

- 原始记录：31,035。
- 完全重复与业务键重复：6,449。
- 无效城市：958。
- 清洗后四维有效样本：21,458。
- 有效样本平均月薪：9.91K。
- 技能词频前四项：数据分析 16,862、Excel 2,502、统计分析 1,485、SQL 698。

#### 验证

- 天池无表头 `GB18030` 文件读取通过。
- 薪资、列表字段、城市拆分、学历/经验归并和中文描述技能提取单测通过。
- 完全重复、业务键重复、异地招聘、面议薪资和缺失经验过滤测试通过。
- 分析摘要、`overview` 指标和 SQL 生成测试通过。
- 数据大屏 Java 集成测试验证样本数、平均月薪和来源数据集。

#### 已知限制与风险

- 天池数据以数据分析相关岗位为主，结果不能代表全行业招聘市场。
- 发布日期只有 `MM-DD`，无法构建可靠的跨年招聘趋势；趋势图仍使用平台在线职位和投递数据。
- 技能词频是受控词典命中数，不是完整自然语言技能抽取。
- 数据集许可证暂不确认，项目负责人已接受风险并取消补证待办；该接受项不构成授权证明，不声明可以再分发。

### 生产配置与 Nginx 部署

#### 功能目标

为 DreamHiring V1.0 补齐生产环境配置、同源前端构建、Nginx 反向代理、systemd 托管和可重复发布包。目标是让开发环境中的本地地址、默认密钥和 Mock 数据不会进入正式部署，同时保留清晰的手工上线与回滚流程。

#### 涉及文件

- `backend/src/main/resources/application-prod.yml`：生产 Profile、基础设施连接、启动和安全参数。
- `backend/src/main/java/com/dreamhiring/config/CorsProperties.java`：CORS 白名单配置绑定。
- `backend/src/main/java/com/dreamhiring/config/SecurityConfig.java`：使用可配置来源生成 CORS 策略。
- `backend/src/main/resources/application.yml`：本地 CORS 默认来源。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：CORS 预检测试。
- `frontend/.env.production`：生产构建关闭 Mock 并使用同源 `/api`。
- `deploy/.env.production.example`：服务器环境变量模板，不包含真实密钥。
- `deploy/nginx/dreamhiring.conf`：SPA fallback、API 代理、上传限制、缓存和安全响应头。
- `deploy/systemd/dreamhiring-backend.service`：后端进程托管、重启、停机与权限隔离。
- `deploy/Build-Release.ps1`：测试、构建并生成时间戳发布目录。
- `deploy/tests/deployment.tests.mjs`：部署文件静态契约测试。
- `deploy/tests/run-tests.ps1`：部署测试入口和真实 Nginx 语法校验。
- `deploy/README.md`：首次部署、更新、HTTPS、验证和回滚说明。
- `docs/architecture/backend-engineering-guidelines.md`：生产部署统一约定。
- `backend/README.md`、`frontend/README.md`：生产部署入口说明。

#### 实现思路

1. `application-prod.yml` 激活 `prod` Profile，关闭演示数据，并强制从环境变量读取数据库、Redis、RabbitMQ、OSS、JWT 和 CORS 配置；生产 JWT 必须由 `DREAMHIRING_JWT_SECRET` 提供。
2. 生产后端默认监听 `127.0.0.1:8080`，避免绕过 Nginx 直接暴露应用端口。
3. 数据源增加连接池大小、最小空闲、连接超时；应用启用 30 秒优雅停机和 HTTP 压缩。
4. `CorsProperties` 绑定 `app.cors.allowed-origins`；本地保留 Vite 默认地址，生产由 `DREAMHIRING_CORS_ALLOWED_ORIGINS` 指定正式域名。
5. 前端 `.env.production` 固定 `VITE_USE_MOCK=false` 和 `VITE_API_BASE_URL=/api`，部署后使用同源请求。
6. Nginx 把 `/api/` 转发到 `127.0.0.1:8080`，补齐 `Host`、客户端 IP 和协议转发头，并把读取/发送超时限制在 30 秒。
7. SPA 路由使用 `try_files $uri $uri/ /index.html`，防止刷新业务页面返回 404；`assets` 使用一年 immutable 缓存，入口页面不缓存。
8. Nginx 增加 12MB 请求体限制、内容类型保护、点击劫持保护、Referrer 策略和浏览器权限策略。
9. systemd 通过环境文件启动 JAR，强制 `prod` Profile，启用失败重启、优雅停机、私有临时目录和只读系统文件保护。
10. `Build-Release.ps1` 顺序执行前端安装、前端测试、生产构建、后端测试与打包，并把产物放入时间戳目录，避免直接覆盖正在使用的发布。
11. 发布目录生成 `release-manifest.json`，记录版本、Git commit、构建时间和时区，便于追踪和回滚。
12. 仓库只提供 HTTP 反向代理基线；正式公网部署必须在外层负载均衡或 Nginx 配置 HTTPS、证书续期和 HTTP 跳转。

上线前必须执行 `nginx -t`，配置语法和 include 路径全部通过后才允许重载 Nginx。

#### 使用方式

开发机生成发布包：

```powershell
. E:\develop\tools\DreamHiring-DevEnv\Activate-DreamHiringEnv.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\Build-Release.ps1
```

部署测试：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\tests\run-tests.ps1 -RequireNginx
```

完整服务器目录、systemd、Nginx、HTTPS 和回滚步骤见 `deploy/README.md`。

#### 已知限制

- 发布包只生成制品，不包含自动上传服务器或远程重启逻辑，避免仓库持有生产服务器凭据。
- Nginx 仓库配置以 HTTP 为基线，正式域名和 TLS 证书必须由部署环境提供。
- `Build-Release.ps1` 在 Windows 构建时，如果本地后端仍占用 `backend/target` 中的 JAR，需要先停止本地实例。

### RabbitMQ 死信归档与重投

#### 功能目标

消费者经过 3 次重试仍失败时，消息原来只会进入 RabbitMQ DLQ，管理员无法知道失败消息内容，也无法从业务系统安全重投。本模块在 broker 死信流程之前增加数据库归档，并提供 ADMIN 专用查询页和重投接口。

#### 涉及文件

- `backend/db/mysql-schema.sql`、`backend/db/upgrade-dead-letter.sql`：`dead_letter_message` 表及存量数据库升级脚本。
- `backend/src/main/java/com/dreamhiring/entity/DeadLetterRecord.java`：死信归档实体。
- `backend/src/main/java/com/dreamhiring/mapper/DeadLetterMapper.java`、`backend/src/main/resources/mapper/DeadLetterMapper.xml`：列表、详情、归档和状态迁移 SQL。
- `backend/src/main/java/com/dreamhiring/service/DeadLetterService.java`：死信归档、查询和重投业务边界。
- `backend/src/main/java/com/dreamhiring/service/impl/DeadLetterServiceImpl.java`：状态机、分页和消息映射。
- `backend/src/main/java/com/dreamhiring/messaging/DeadLetterReplayGateway.java`：重投基础设施抽象。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitDeadLetterReplayGateway.java`：RabbitMQ 原始消息重发和发布确认。
- `backend/src/main/java/com/dreamhiring/messaging/UnavailableDeadLetterReplayGateway.java`：local 模式安全失败实现。
- `backend/src/main/java/com/dreamhiring/messaging/ArchivingMessageRecoverer.java`：重试耗尽后的归档与 DLQ 交接。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConfig.java`：使用归档 recoverer 替换默认拒绝策略。
- `backend/src/main/java/com/dreamhiring/controller/AdminController.java`：ADMIN 查询和重投接口。
- `backend/src/main/java/com/dreamhiring/vo/DeadLetterViews.java`：管理端死信响应。
- `frontend/src/views/admin/DeadLettersView.vue`：死信列表、详情展开、状态筛选和重投确认。
- `frontend/src/api/index.js`、`frontend/src/router/index.js`、`frontend/src/router/nav.js`：管理端 API 与入口。
- `docs/api/README.md`、`docs/api/generate-openapi.mjs`：新增 2 个接口和 OpenAPI Schema。
- `backend/src/test/java/com/dreamhiring/service/DeadLetterServiceImplTest.java`：重投状态机单测。
- `backend/src/test/java/com/dreamhiring/messaging/ArchivingMessageRecovererTest.java`：归档顺序和不可序列化请求头过滤测试。
- `backend/src/test/java/com/dreamhiring/ApiIntegrationTest.java`：管理员查询、local 模式重投 422 和状态恢复测试。
- `backend/src/test/java/com/dreamhiring/InfrastructureSmokeTest.java`：真实 RabbitMQ 重投验证。

#### 实现思路

1. 监听容器达到最大重试次数后调用 `ArchivingMessageRecoverer`。
2. recoverer 提取来源队列、交换机、路由键、消息 ID、关联 ID、消息体、内容类型、业务请求头和异常摘要。
3. `AmqpHeaders.CHANNEL`、`DELIVERY_TAG` 等不可 JSON 序列化的框架对象会被过滤，避免归档失败。
4. `DeadLetterService.archive` 以 `PENDING` 状态写入 `dead_letter_message`。
5. 数据库归档失败只记录应用日志，随后仍交给 `RejectAndDontRequeueRecoverer`，确保 RabbitMQ DLQ 保留最后兜底副本。
6. 管理端列表使用 PageHelper 分页，并按 `create_time DESC, id DESC` 排序。
7. 管理端查询接口 operationId 为 `adminDeadLetterList`，重投接口为 `adminDeadLetterReplay`，两者均只允许 ADMIN。
8. 重投前执行 `UPDATE ... WHERE status = 'PENDING'` 原子抢占；并发双击只有一个请求能切换为 `REPLAYING`。
9. RabbitMQ 重投恢复原始消息体、内容类型、持久化模式、消息 ID、关联 ID和请求头，再发送到原交换机与原路由键。
10. 发送使用 `RabbitTemplate.invoke` 并执行 `waitForConfirmsOrDie(5000)`，避免 broker 未确认时提前标记成功。
11. 发送成功后将状态更新为 `REPLAYED` 并累计次数；发送异常则恢复 `PENDING`，管理员可修复问题后再次操作。
12. 重投网络发送不在数据库事务中执行，避免长时间占用数据库连接。
13. local 消息模式没有 RabbitMQ broker，重投返回 `422`；测试确认失败后归档仍恢复为 `PENDING`。
14. 重投成功不会删除 RabbitMQ DLQ 中的原消息，业务消费者继续依赖 `dedup_key` 保证幂等。

#### 验证

- 后端全量测试：58 项，53 项通过，5 项条件测试跳过，无失败。
- 后端测试覆盖管理员列表、local 重投 422、并发状态冲突、发送失败恢复、成功重投和请求头过滤。
- OpenAPI 操作数从 64 增加至 66，API 文档测试 9 项、架构文档测试 11 项通过。
- 前端测试 13 项通过，生产构建成功；Vitest 覆盖查询、重投及重复重投 409。
- 部署与 Nginx 校验 5 项通过。
- 真实 MySQL 冒烟测试 1 项通过，确认 `dead_letter_message` 表可用。
- 真实 RabbitMQ 重投测试 1 项通过，临时队列成功接收原路由重投消息。

#### 已知限制

- 重投成功不会清空 broker DLQ，避免在跨系统确认过程中误删最后的原始副本；后续可增加受控清理任务。
- 若进程在数据库切换为 `REPLAYING` 后、状态更新前崩溃，记录可能停留在 `REPLAYING`，需要运维核查；V1.0 暂不自动重置不确定状态。
- 消息体当前按 UTF-8 JSON 文本保存，适用于现有领域事件；若未来承载二进制附件，应改为 BLOB 或 OSS 引用。

##### `DeadLetterRecord`

###### 功能目标

映射 `dead_letter_message` 表，保存可审计的失败消息快照和重投状态。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/entity/DeadLetterRecord.java`：死信实体。

###### 实现思路

1. 保存队列、交换机、路由键、消息 ID 和关联 ID。
2. 保存 UTF-8 消息体、内容类型及 JSON 请求头。
3. 保存失败原因、`PENDING/REPLAYING/REPLAYED` 状态和重投次数。
4. 保存创建、更新和重投时间，支持排序与审计。

##### `DeadLetterMapper`

###### 功能目标

提供死信归档的分页查询和具备并发保护的状态迁移。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/mapper/DeadLetterMapper.java`：Mapper 接口。
- `backend/src/main/resources/mapper/DeadLetterMapper.xml`：显式 SQL。

###### 实现思路

1. `findPage` 支持按状态筛选，由 PageHelper 负责分页。
2. `insert` 写完整归档并回填自增 ID。
3. `claimForReplay` 只更新 `PENDING` 记录。
4. `markReplayed` 只更新 `REPLAYING` 记录并累加重投次数。
5. `releaseReplay` 在发送失败时只回滚 `REPLAYING` 状态。

##### `DeadLetterService`

###### 功能目标

定义归档、管理员查询和重投的业务边界，隔离 Controller 与 RabbitMQ 实现。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/DeadLetterService.java`：业务接口和归档 DTO。

###### 实现思路

1. `archive` 接收 recoverer 提取后的死信内容。
2. `list` 接收可选状态和分页参数。
3. `replay` 接收归档 ID 并返回最新状态。
4. `DeadLetterArchive` record 明确消息基础设施与业务层之间的数据契约。

##### `DeadLetterServiceImpl`

###### 功能目标

实现归档持久化、分页映射和并发安全的重投状态机。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/service/impl/DeadLetterServiceImpl.java`：业务实现。

###### 实现思路

1. 归档时补充默认值、初始状态、重投次数和时间。
2. 查询限制每页 1-100 条，并把请求头 JSON 转回对象。
3. 重投前原子切换到 `REPLAYING`，失败时恢复 `PENDING`。
4. 通过 `DeadLetterReplayGateway` 发送，Service 不直接依赖 RabbitTemplate。
5. 成功后更新 `REPLAYED`、重投次数和重投时间。

##### `DeadLetterViews`

###### 功能目标

定义管理员可见的死信数据，不直接暴露数据库实体。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/vo/DeadLetterViews.java`：响应 VO。

###### 实现思路

1. 输出队列、交换机、路由和关联标识。
2. 输出消息体、解析后的请求头和失败原因。
3. 输出状态、重投次数、归档时间和重投时间。

##### `DeadLetterReplayGateway`

###### 功能目标

抽象死信重投基础设施，使业务层可在 RabbitMQ 与 local 模式之间切换。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/DeadLetterReplayGateway.java`：重投端口。

###### 实现思路

1. 只接收已归档的 `DeadLetterRecord`。
2. 不暴露 RabbitTemplate 或 Channel。
3. 由具体实现决定发送机制及不可用时的业务异常。

##### `RabbitDeadLetterReplayGateway`

###### 功能目标

将归档消息按原交换机、原路由键重新发布到 RabbitMQ，并等待发布确认。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/RabbitDeadLetterReplayGateway.java`：RabbitMQ 重投实现。

###### 实现思路

1. 恢复持久化、内容类型、消息 ID、关联 ID和请求头。
2. 消息体重新编码为 UTF-8 字节数组。
3. 使用 `RabbitTemplate.invoke` 在同一 Channel 内发送并等待确认。
4. 确认超时或 nack 抛出异常，由 Service 恢复 `PENDING`。
5. 仅在 `app.messaging.mode=rabbit` 时装配。

##### `UnavailableDeadLetterReplayGateway`

###### 功能目标

在 local 消息模式下明确拒绝重投，避免管理员误以为消息已经重新投递。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/UnavailableDeadLetterReplayGateway.java`：local 模式实现。

###### 实现思路

1. 在 RabbitMQ 实现缺失时提供唯一默认实现。
2. 调用 `replay` 直接抛出 `422` 业务异常。
3. Service 捕获异常后把 `REPLAYING` 恢复为 `PENDING`。

##### `ArchivingMessageRecoverer`

###### 功能目标

在 Spring AMQP 重试耗尽后，先归档失败消息，再把消息交给 broker DLQ 兜底。

###### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/ArchivingMessageRecoverer.java`：自定义 MessageRecoverer。

###### 实现思路

1. 从 MessageProperties 提取队列、交换机和路由元数据。
2. 将消息体转 UTF-8 文本并序列化业务请求头。
3. 过滤 Channel、DeliveryTag 等不可序列化的框架对象。
4. 异常摘要压缩空白并限制为 1000 字符。
5. 数据库归档失败仍继续委托 broker recoverer，不阻断死信兜底。
6. 委托 `RejectAndDontRequeueRecoverer` 后由监听容器拒绝且不重新入队。

### 登录后根路径空白页修复

#### 功能目标

修复用户从站点根地址进入登录页后，登录成功又被 `redirect=/` 带回根路径的问题。根路径只渲染主布局、没有默认子页面，因此会出现侧边栏正常但内容区空白。

#### 涉及文件

- `frontend/src/router/index.js`：新增可测试的路由工厂和登录后根路径分流。
- `frontend/src/utils/navigation.js`：安全解析 `redirect`，过滤根路径、登录路径和外部地址。
- `frontend/src/views/auth/LoginView.vue`：登录成功后使用角色首页作为无效 redirect 的兜底。
- `frontend/src/test/navigation.spec.js`：根路径、登录路径、外部地址和已登录根路由测试。

#### 根因

1. 未登录用户访问 `/` 时，路由守卫跳转 `/login?redirect=/`。
2. 登录成功后原逻辑直接执行 `router.push(route.query.redirect)`。
3. 浏览器返回 `/`，匹配到只有 `MainLayout` 的父路由，没有匹配任何子路由。
4. 页面外壳、侧边栏和用户信息正常显示，但 `<router-view>` 为空。

#### 实现思路

1. `resolveLoginDestination` 在 redirect 为空、`/`、`/login`、相对地址或外部地址时返回当前角色首页。
2. 合法的站内深链继续保留，例如 `/seeker/jobs`，不破坏登录后回到原页面的体验。
3. 路由守卫在已认证用户访问 `/` 时直接重定向到 `ROLE_HOME`，即使旧链接或手工输入根地址也不会显示空布局。
4. 路由改为 `createAppRouter(history)` 工厂，默认导出仍使用 `createWebHistory`，测试使用 `createMemoryHistory`。
5. 回归测试覆盖 SEEKER 从根路径跳转 `/seeker/home`，并验证页面标题元数据存在。

#### 验证

- 前端测试 15 项通过。
- 前端生产构建成功。
- 独立无头 Chrome 实测：已登录访问 `/` 自动跳转 `/seeker/home`，求职者首页内容正常渲染，无控制台异常或失败请求。

### 投递状态多状态通知幂等修复

#### 功能目标

同一投递可以从 `INTERVIEW` 继续流转到 `REJECTED`。通知消费者既要对 RabbitMQ 重复投递保持幂等，也不能因为两个状态属于同一投递而吞掉后一次合法通知。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/messaging/ApplicationStatusChangedEvent.java`：集中生成投递通知幂等键。
- `backend/src/main/java/com/dreamhiring/messaging/LocalNotificationGateway.java`：本地模式使用统一幂等键。
- `backend/src/main/java/com/dreamhiring/messaging/RabbitNotificationConsumer.java`：RabbitMQ 消费使用统一幂等键。
- `backend/src/test/java/com/dreamhiring/messaging/RabbitNotificationGatewayTest.java`：不同状态幂等键和手动 ACK 测试。
- `backend/src/test/java/com/dreamhiring/BusinessClosureIntegrationTest.java`：`INTERVIEW -> REJECTED` 两条通知的端到端验证。
- `docs/api/README.md`、`docs/api/generate-openapi.mjs`：同步通知幂等语义。
- `docs/architecture/backend-engineering-guidelines.md`：补充事件幂等键设计规范。

#### 实现思路

1. `ApplicationStatusChangedEvent.notificationDedupKey()` 统一生成 `APPLICATION:{applicationId}:{status}`。
2. 相同投递、相同状态的重复消息得到相同键，数据库唯一索引继续保证只写一条站内消息。
3. 相同投递的不同合法状态得到不同键，因此 `INTERVIEW` 后的 `REJECTED` 会生成新的状态通知。
4. 本地模式和 RabbitMQ 消费者共用事件方法，避免两种运行模式的幂等语义漂移。
5. 只调整消息去重粒度，不改变投递状态机、消息内容或 RabbitMQ 手动 ACK 与死信流程。

#### 验证

- 单元测试验证 `INTERVIEW` 与 `REJECTED` 的幂等键不同。
- 业务闭环测试验证先邀面试、再标记不合适后，求职者能读取到两条对应的 `APPLICATION` 消息。
- 后端全量测试、前端测试、接口契约和架构文档测试在交付前全部执行。

#### 已知限制

- 该修复只解决同一投递后续状态被错误去重的问题。
- 并发状态更新的原子性仍由“投递状态并发更新”问题单独处理，不在本模块范围内。

### 后续迭代项完善

#### 功能目标

补齐 V1.0 后续迭代中的搜索契约、统一分页、公开媒体资源、前端管理能力和真实首页指标，使页面展示与真实 API 数据一致，同时暂不调整 ECharts、Vite 和 Node 等技术基线。

#### 涉及文件

- `backend/src/main/java/com/dreamhiring/common/PageRequest.java`：统一分页值对象。
- `backend/src/main/java/com/dreamhiring/service/impl`：职位、企业、投递、消息、公告、用户和管理列表统一分页。
- `backend/src/main/resources/mapper/JobMapper.xml`：职位搜索连接企业表，支持企业关键词、行业和父分类查询。
- `backend/src/main/java/com/dreamhiring/storage`：公私媒体分 URL 策略、公开读 ACL 和对象键访问。
- `backend/src/main/java/com/dreamhiring/entity`、`mapper`：用户头像和企业 Logo 改为持久化对象键。
- `backend/db/mysql-schema.sql`、`backend/db/upgrade-media-storage.sql`：新库字段和已有库升级脚本。
- `frontend/src/views/company/ProfileView.vue`、`frontend/src/layouts/MainLayout.vue`：企业 Logo 与用户头像上传。
- `frontend/src/views/company/JobsView.vue`：职位筛选、编辑、重新审核和分页。
- `frontend/src/views/admin/ContentView.vue`：职位分类新增、编辑、删除和公告分页。
- `frontend/src/views/seeker/HomeView.vue`、`frontend/src/views/admin/HomeView.vue`：真实简历、职位、投递、消息和平台治理指标。
- `frontend/src/views/admin`、`frontend/src/views/company/CandidatesView.vue`：管理列表和候选人列表分页。
- `frontend/src/utils/dashboard.js`、`frontend/src/test/dashboard.spec.js`：首页指标计算及测试。
- `docs/api/README.md`、`docs/api/generate-openapi.mjs`、`docs/api/tests/api-docs.tests.mjs`：分页和媒体字段契约。

#### 实现思路

1. 职位搜索 SQL 连接企业表，关键词覆盖职位、城市、技能、企业名称和行业，`industry` 条件真正参与查询；选择一级分类时会包含其二级分类职位。
2. 所有列表统一使用 `PageRequest`：页码最小 1，页大小默认 10、最大 100，越界自动收敛；企业职位列表也改为 PageHelper 数据库分页。
3. 企业 Logo 和用户头像分别保存 `logoObjectKey`、`avatarObjectKey`，接口响应再动态生成 `logoUrl`、`avatarUrl`，不再把短期签名 URL 写入业务表。
4. OSS 公开资源上传后显式设置 `PublicRead` ACL，并使用 CDN/公开 Bucket 基础地址生成稳定 URL；简历附件仍使用私有对象和短期签名 URL。
5. 企业 Logo、用户头像、职位编辑、分类增删改和列表分页均已接入真实 API 与 Mock，操作后刷新对应数据。
6. 求职者首页根据真实简历、职位总数、投递和未读消息计算指标；管理员首页使用分页接口的 `total` 展示注册用户、认证企业、在架职位和待审核职位。

#### 验证

- 后端全量测试覆盖分页收敛、企业关键词与行业搜索、父分类搜索、OSS 公开 ACL、私有签名 URL 和接口契约。
- 前端测试覆盖分页收敛、搜索过滤、头像/Logo 对象键保存、职位更新、分类更新和首页指标计算。
- 前端生产构建、OpenAPI 契约、架构文档、部署配置和离线分析测试全部通过。

#### 已知限制

- 技术基线仍保持当前 ECharts、Vite 和 Node 版本，本轮不调整。
- 已有数据库需要执行 `upgrade-media-storage.sql`；旧字段中的临时签名 URL 不会迁移为对象键。
- 公开 Bucket 必须允许对象公共读，生产环境应配置 `DREAMHIRING_OSS_PUBLIC_BASE_URL` 指向 CDN 或公开域名。
- 并发状态更新、简历删除引用和 RabbitMQ 最终可靠投递属于独立高优先级问题，本轮未修改。
