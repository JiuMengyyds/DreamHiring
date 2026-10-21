import assert from "node:assert/strict";
import { test } from "node:test";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const architectureDir = path.dirname(testDir);
const docsDir = path.dirname(architectureDir);
const guidePath = path.join(architectureDir, "backend-engineering-guidelines.md");
const apiReadmePath = path.join(docsDir, "api", "README.md");

const [guide, apiReadme] = await Promise.all([
  readFile(guidePath, "utf8"),
  readFile(apiReadmePath, "utf8"),
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
