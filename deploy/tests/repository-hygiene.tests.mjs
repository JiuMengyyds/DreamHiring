import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
