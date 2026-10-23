import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, "..", "..");

function runGit(args) {
  return spawnSync("git", args, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function isIgnored(relativePath) {
  const result = runGit(["check-ignore", "--no-index", "-q", "--", relativePath]);
  assert.ok(
    result.status === 0 || result.status === 1,
    `无法检查忽略状态：${relativePath}\n${result.stderr}`,
  );
  return result.status === 0;
}

function isTracked(relativePath) {
  const result = runGit(["ls-files", "--error-unmatch", "--", relativePath]);
  assert.ok(
    result.status === 0 || result.status === 1,
    `无法检查跟踪状态：${relativePath}\n${result.stderr}`,
  );
  return result.status === 0;
}

test("私有工程文档和未使用静态资源不进入版本库", () => {
  for (const relativePath of [
    "AGENTS.md",
    "docs/architecture/backend-engineering-guidelines.md",
    "frontend/public/icons.svg",
    "frontend/src/assets/hero.png",
  ]) {
    assert.equal(isIgnored(relativePath), true, `${relativePath} 应被忽略`);
    assert.equal(isTracked(relativePath), false, `${relativePath} 不应被跟踪`);
  }
});

test("原始分析数据仅放行指定文件", () => {
  assert.equal(isIgnored("data/raw/数据分析.csv"), false, "指定数据集应可提交");
  assert.equal(isTracked("data/raw/数据分析.csv"), true, "指定数据集应进入版本库");
  assert.equal(isIgnored("data/raw/其他数据.csv"), true, "其他原始数据仍应被忽略");
});

test("已删除的面试文档不再进入版本库", () => {
  assert.equal(
    isTracked("docs/interview/DreamHiring-java-interview-review.md"),
    false,
    "面试文档删除后不应继续被跟踪",
  );
});

test("根目录 README 提供完整的项目入口", async () => {
  const readmePath = path.join(projectRoot, "README.md");
  const readme = await readFile(readmePath, "utf8");

  for (const section of [
    "## 功能概览",
    "## 技术架构",
    "## 快速开始",
    "## 测试",
    "## 接口文档",
    "## 部署",
    "## 数据与许可",
  ]) {
    assert.ok(readme.includes(section), `README 缺少章节：${section}`);
  }

  for (const relativePath of [
    "backend/README.md",
    "frontend/README.md",
    "docs/api/README.md",
    "docs/api/openapi.json",
    "deploy/README.md",
    "backend/analysis/sources/tianchi-163746.md",
  ]) {
    await access(path.join(projectRoot, relativePath));
    assert.ok(readme.includes(`](${relativePath})`), `README 缺少链接：${relativePath}`);
  }
});
