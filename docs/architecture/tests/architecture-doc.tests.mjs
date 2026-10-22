import assert from "node:assert/strict";
import { test } from "node:test";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const architectureDir = path.dirname(testDir);
const docsDir = path.dirname(architectureDir);
const projectRoot = path.resolve(architectureDir, "..", "..");
const guidePath = path.join(architectureDir, "backend-engineering-guidelines.md");
const apiReadmePath = path.join(docsDir, "api", "README.md");
const developmentGuidePath = path.join(projectRoot, "DevelopmentGuide.md");
const javaSourceRoot = path.join(projectRoot, "backend", "src", "main", "java");

const [guide, apiReadme, developmentGuide] = await Promise.all([
  readOptionalFile(guidePath),
  readFile(apiReadmePath, "utf8"),
  readOptionalFile(developmentGuidePath),
]);
const privateDocsAvailable = guide !== null && developmentGuide !== null;

function testWithPrivateDocs(name, fn) {
  test(name, {
    skip: privateDocsAvailable ? false : "私有工程文档未包含在公开仓库中",
  }, fn);
}

testWithPrivateDocs("后端工程规范包含借鉴与禁止照搬边界", () => {
  for (const section of [
    "## 2. 可借鉴与禁止照搬",
    "### 2.1 可以借鉴",
    "### 2.2 禁止照搬",
    "Controller → Service → Mapper 分层",
    "Entity、DTO、VO 分离",
    "MyBatis XML 动态 SQL",
    "AOP 自动填充审计字段",
  ]) {
    assert.ok(guide.includes(section), `缺少规范内容：${section}`);
  }

  for (const forbidden of [
    "不复制 Spring Boot 2.7",
    "不复制 `code=1/0`",
    "不使用字段注入",
    "不在 Mapper 上声明业务事务",
    "不建立会排除测试目录",
  ]) {
    assert.ok(guide.includes(forbidden), `缺少禁止照搬规则：${forbidden}`);
  }
});

testWithPrivateDocs("工程结构与关键技术决策符合 DreamHiring 基线", () => {
  for (const expected of [
    "JDK 21、Spring Boot 3",
    "V1.0 采用单 Maven 模块",
    "`jakarta.*`",
    "`@RequiredArgsConstructor`",
    "`@RestControllerAdvice`",
    "Spring Security 过滤器链 + JWT",
    "`SecurityContextHolder`",
    "`PageVO<T>`",
    "`ResultCode`",
    "禁止直接书写 `200`、`400`、`401`",
    "`yyyy-MM-dd HH:mm:ss`",
    "`ObjectStorageService`",
    "Publisher confirm",
  ]) {
    assert.ok(guide.includes(expected), `缺少关键技术约束：${expected}`);
  }
});

test("接口文档不依赖未发布的私有工程规范", () => {
  assert.doesNotMatch(apiReadme, /backend-engineering-guidelines\.md/);
});

testWithPrivateDocs("DevelopmentGuide 为每个后端 Java 类记录完整实现说明", async () => {
  const javaFiles = await collectFiles(javaSourceRoot, ".java");
  const normalizedGuide = developmentGuide.replaceAll("\\", "/");

  assert.ok(javaFiles.length >= 100, `后端 Java 类数量异常：${javaFiles.length}`);
  for (const javaFile of javaFiles) {
    const className = path.basename(javaFile, ".java");
    const relativePath = path.relative(projectRoot, javaFile).replaceAll("\\", "/");
    const heading = `##### \`${className}\``;
    const headingIndex = normalizedGuide.indexOf(heading);
    assert.ok(
      headingIndex >= 0,
      `DevelopmentGuide 缺少类实现说明：${relativePath}`,
    );

    const nextHeadingIndex = normalizedGuide.indexOf("\n##### ", headingIndex + heading.length);
    const section = normalizedGuide.slice(
      headingIndex,
      nextHeadingIndex === -1 ? undefined : nextHeadingIndex,
    );
    for (const requiredSection of ["###### 功能目标", "###### 涉及文件", "###### 实现思路"]) {
      assert.ok(
        section.includes(requiredSection),
        `${className} 缺少文档章节：${requiredSection}`,
      );
    }
    assert.ok(
      section.includes(relativePath),
      `${className} 的详细条目未引用源文件：${relativePath}`,
    );
  }
});

testWithPrivateDocs("DevelopmentGuide 记录前端真实后端联调模块", () => {
  for (const expected of [
    "### 前端真实后端联调基础模块",
    "`VITE_USE_MOCK=false`",
    "`GET /api/auth/me`",
    "`dreamhiring:auth-expired`",
    "登录、注册、验证码接口的 401",
    "默认简历 ID",
    "企业认证通过/驳回",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少前端联调模块说明：${expected}`);
  }
});

testWithPrivateDocs("DevelopmentGuide 记录招聘业务全链路闭环", () => {
  for (const expected of [
    "### 招聘业务全链路闭环",
    "登录/注册模式切换",
    "首份简历创建",
    "OSS 附件上传",
    "企业认证通过后才允许职位发布",
    "一级和二级分类",
    "`APPLICATION` 消息",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少业务闭环说明：${expected}`);
  }
});

testWithPrivateDocs("DevelopmentGuide 记录公告 RabbitMQ 通知链路", () => {
  for (const expected of [
    "### 公告 RabbitMQ 站内消息链路",
    "`AnnouncementPublishedEvent`",
    "dreamhiring.announcement.queue",
    "`afterCommit`",
    "`ANNOUNCEMENT:{公告ID}:{用户ID}`",
    "SEEKER 公告只有求职者收到",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少公告通知说明：${expected}`);
  }
});

testWithPrivateDocs("DevelopmentGuide 记录认证接口限流模块", () => {
  for (const expected of [
    "### 认证接口限流",
    "`RateLimitService`",
    "验证码 30 次、登录 10 次、注册 5 次",
    "`Retry-After`",
    "Redis 异常时回退",
    "第 11 次为 429",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少认证限流说明：${expected}`);
  }
});

testWithPrivateDocs("工程规范与开发指南记录天池离线分析约定", () => {
  for (const expected of [
    "## 13. 离线数据分析线",
    "tianchi.aliyun.com/dataset/163746",
    "不引入英文招聘数据集",
    "项目负责人已接受许可证暂不确认的风险",
    "`sampleCount` 表示清洗后的分析样本数",
  ]) {
    assert.ok(guide.includes(expected), `缺少离线分析规范：${expected}`);
  }

  for (const expected of [
    "### 阿里云天池招聘数据分析线",
    "`load_tianchi_163746`",
    "`parse_salary`",
    "`normalize_experience`",
    "`overview/sample_count`",
    "清洗后四维有效样本：21,458",
    "不声明可以再分发",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少天池分析实现说明：${expected}`);
  }
});

testWithPrivateDocs("工程规范与开发指南记录生产部署基线", () => {
  for (const expected of [
    "## 14. 生产配置与部署",
    "`application-prod.yml`",
    "`127.0.0.1:8080`",
    "`app.cors.allowed-origins`",
    "`deploy/Build-Release.ps1`",
    "HTTP 到 HTTPS 跳转",
  ]) {
    assert.ok(guide.includes(expected), `缺少生产部署规范：${expected}`);
  }

  for (const expected of [
    "### 生产配置与 Nginx 部署",
    "`CorsProperties`",
    "`DREAMHIRING_JWT_SECRET`",
    "`deploy/nginx/dreamhiring.conf`",
    "`deploy/Build-Release.ps1`",
    "nginx -t",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少生产部署实现说明：${expected}`);
  }

  const deploymentTests = path.join(projectRoot, "deploy", "tests", "deployment.tests.mjs");
  const productionConfig = path.join(
    projectRoot,
    "backend",
    "src",
    "main",
    "resources",
    "application-prod.yml",
  );
  return Promise.all([access(deploymentTests), access(productionConfig)]);
});

testWithPrivateDocs("工程规范与开发指南记录死信归档与重投", () => {
  for (const expected of [
    "## 15. 死信归档与重投",
    "`dead_letter_message`",
    "`PENDING -> REPLAYING -> REPLAYED`",
    "Publisher Confirm",
    "`local` 消息模式不支持真实重投",
  ]) {
    assert.ok(guide.includes(expected), `缺少死信处理规范：${expected}`);
  }

  for (const expected of [
    "### RabbitMQ 死信归档与重投",
    "`ArchivingMessageRecoverer`",
    "`DeadLetterService`",
    "`RabbitDeadLetterReplayGateway`",
    "`adminDeadLetterList`",
    "`adminDeadLetterReplay`",
    "重投成功不会删除 RabbitMQ DLQ 中的原消息",
  ]) {
    assert.ok(developmentGuide.includes(expected), `缺少死信处理实现说明：${expected}`);
  }
});

async function readOptionalFile(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function collectFiles(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath, suffix));
    } else if (entry.name.endsWith(suffix)) {
      files.push(entryPath);
    }
  }
  return files;
}
