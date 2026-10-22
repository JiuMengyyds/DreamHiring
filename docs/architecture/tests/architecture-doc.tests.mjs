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
  readFile(guidePath, "utf8"),
  readFile(apiReadmePath, "utf8"),
  readFile(developmentGuidePath, "utf8"),
]);

test("后端工程规范包含借鉴与禁止照搬边界", () => {
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

test("工程结构与关键技术决策符合 DreamHiring 基线", () => {
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

test("接口文档链接到后端工程规范", async () => {
  assert.match(
    apiReadme,
    /\[后端工程实施规范\]\(\.\.\/architecture\/backend-engineering-guidelines\.md\)/,
  );
  await access(guidePath);
});

test("DevelopmentGuide 为每个后端 Java 类记录完整实现说明", async () => {
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

test("DevelopmentGuide 记录前端真实后端联调模块", () => {
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

test("DevelopmentGuide 记录招聘业务全链路闭环", () => {
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
