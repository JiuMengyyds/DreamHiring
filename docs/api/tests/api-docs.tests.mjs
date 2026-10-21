import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildOpenApi } from "../generate-openapi.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.dirname(testDir);
const openApiPath = path.join(apiDir, "openapi.json");
const readmePath = path.join(apiDir, "README.md");

const [openApiSource, readme] = await Promise.all([
  readFile(openApiPath, "utf8"),
  readFile(readmePath, "utf8"),
]);
const openApi = JSON.parse(openApiSource);

function collectOperations(spec) {
  const methods = new Set(["get", "post", "put", "patch", "delete"]);
  const operations = [];

  for (const [route, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (methods.has(method)) operations.push({ route, method, operation });
    }
  }

  return operations;
}

function collectRefs(value, refs = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, refs);
    return refs;
  }

  if (!value || typeof value !== "object") return refs;

  if (typeof value.$ref === "string") refs.push(value.$ref);
  for (const child of Object.values(value)) collectRefs(child, refs);
  return refs;
}

const operations = collectOperations(openApi);
const operationsById = new Map(
  operations.map(({ operation }) => [operation.operationId, operation]),
);

test("OpenAPI 文件与生成器输出一致且结构有效", () => {
  assert.equal(openApi.openapi, "3.0.3");
  assert.equal(openApi.info.version, "1.0.0");
  assert.match(openApi.info.title, /DreamHiring/);
  assert.equal(openApi.info["x-date-time-format"], "yyyy-MM-dd HH:mm:ss");
  assert.equal(openApi.info["x-timezone"], "GMT+8");
  assert.deepEqual(openApi, buildOpenApi(), "openapi.json 已过期，请重新运行生成器");

  assert.equal(openApi.servers[0].url, "http://localhost:8080");
  assert.ok(openApi.components.securitySchemes.bearerAuth);
  assert.ok(openApi.components.schemas.ApiResult);
  assert.ok(openApi.components.schemas.ErrorResult);
  assert.ok(!openApiSource.includes('"format": "date-time"'), "日期时间不得使用 RFC 3339 date-time");
  assert.ok(!openApiSource.includes("T12:30:00"), "日期时间示例不得使用 T 分隔符");
});

test("接口数量、operationId 与基础响应满足契约", () => {
  assert.equal(operations.length, 64, "V1.0 应维持 64 个操作");

  const operationIds = operations.map(({ operation }) => operation.operationId);
  assert.equal(new Set(operationIds).size, operationIds.length, "operationId 不能重复");
  assert.ok(operationIds.every(Boolean), "每个操作必须有 operationId");

  const validRoles = new Set(["PUBLIC", "SEEKER", "COMPANY", "ADMIN"]);
  const validStatuses = new Set(["200", "400", "401", "403", "404", "409", "413", "422", "429", "500"]);
  const errorNamesByStatus = {
    400: "BadRequest",
    401: "Unauthorized",
    403: "Forbidden",
    404: "NotFound",
    409: "Conflict",
    413: "PayloadTooLarge",
    422: "UnprocessableEntity",
    429: "TooManyRequests",
    500: "ServerError",
  };

  for (const { route, method, operation } of operations) {
    assert.ok(operation.summary, `${method.toUpperCase()} ${route} 缺少 summary`);
    assert.ok(operation.tags?.length, `${operation.operationId} 缺少 tag`);
    assert.ok(operation["x-roles"]?.length, `${operation.operationId} 缺少 x-roles`);
    assert.ok(
      operation["x-roles"].every((role) => validRoles.has(role)),
      `${operation.operationId} 包含非法角色`,
    );
    assert.ok(operation.responses?.["200"], `${operation.operationId} 缺少 200 响应`);
    assert.ok(
      Object.keys(operation.responses).every((status) => validStatuses.has(status)),
      `${operation.operationId} 包含不符合约定的响应状态`,
    );
    assert.ok(
      operation.responses["200"].content?.["application/json"]?.schema?.$ref?.startsWith("#/components/schemas/"),
      `${operation.operationId} 的成功响应必须引用统一 Schema`,
    );

    for (const [status, response] of Object.entries(operation.responses)) {
      if (status === "200") continue;
      const expectedName = errorNamesByStatus[status];
      assert.equal(
        response.$ref,
        `#/components/responses/${expectedName}`,
        `${operation.operationId} 的 ${status} 响应组件不匹配`,
      );
      assert.equal(
        openApi.components.responses[expectedName].content["application/json"].example.code,
        Number(status),
        `${expectedName} 的示例 code 应与 HTTP 状态一致`,
      );
    }
  }
});

test("公开接口与登录接口的权限声明正确", () => {
  for (const { operation } of operations) {
    const roles = operation["x-roles"];
    const publicOnly = roles.length === 1 && roles[0] === "PUBLIC";
    const optionalAuth = roles.includes("PUBLIC") && !publicOnly;

    if (publicOnly) {
      assert.deepEqual(operation.security, [], `${operation.operationId} 应允许匿名访问`);
    } else if (optionalAuth) {
      assert.deepEqual(
        operation.security,
        [{}, { bearerAuth: [] }],
        `${operation.operationId} 应支持匿名与登录两种访问方式`,
      );
    } else {
      assert.equal(operation.security, undefined, `${operation.operationId} 应继承全局 JWT 鉴权`);
    }
  }
});

test("所有本地 Schema、Parameter 与 Response 引用均可解析", () => {
  const refs = collectRefs(openApi);
  assert.ok(refs.length > 100, "规范应引用可复用组件");

  for (const refValue of refs) {
    assert.match(refValue, /^#\/components\/(schemas|parameters|responses|securitySchemes)\//);
    const [, , section, name] = refValue.split("/");
    assert.ok(openApi.components?.[section]?.[name], `无法解析引用 ${refValue}`);
  }

  assert.ok(!openApiSource.includes('"http://') || !openApiSource.includes('"$ref": "http'), "不允许远程 $ref");
});

test("核心业务路径与关键 Schema 完整", () => {
  const requiredPaths = [
    "/api/auth/login",
    "/api/jobs",
    "/api/resumes/{resumeId}",
    "/api/applications",
    "/api/company/applications/{applicationId}/status",
    "/api/company/jobs",
    "/api/admin/jobs/{jobId}/audit",
    "/api/messages",
    "/api/stats/dashboard",
  ];

  for (const requiredPath of requiredPaths) {
    assert.ok(openApi.paths[requiredPath], `缺少核心路径 ${requiredPath}`);
  }

  const requiredSchemas = [
    "LoginRequest",
    "AuthResult",
    "JobPage",
    "ResumeUpsertRequest",
    "ApplicationStatusRequest",
    "CompanyJobUpsertRequest",
    "AuditRequest",
    "MessagePage",
    "DashboardStatsData",
  ];

  for (const schemaName of requiredSchemas) {
    assert.ok(openApi.components.schemas[schemaName], `缺少核心 Schema ${schemaName}`);
  }

  assert.deepEqual(openApi.components.schemas.JobPage.required, ["records", "total", "page", "size"]);
  assert.deepEqual(openApi.components.schemas.ApiResult.required, ["code", "msg", "data"]);
  assert.deepEqual(openApi.components.schemas.ApplicationStatusRequest.properties.status.enum, [
    "VIEWED",
    "INTERVIEW",
    "REJECTED",
  ]);

  const fileData = openApi.components.schemas.FileData;
  assert.ok(fileData.required.includes("objectKey"));
  assert.ok(fileData.required.includes("visibility"));
  assert.deepEqual(fileData.properties.visibility.enum, ["PRIVATE", "PUBLIC"]);
  assert.match(fileData.properties.objectKey.description, /OSS/);
  assert.equal(fileData.properties.urlExpiresAt.pattern, "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$");

  const resume = openApi.components.schemas.Resume;
  assert.ok(resume.properties.attachmentObjectKey, "简历附件应持久化 OSS objectKey");
  assert.match(resume.properties.attachmentUrl.description, /短期签名/);
});

test("认证错误、用户删除和分类删除语义明确", () => {
  const login = operationsById.get("authLogin");
  assert.match(login.description, /验证码.*400/);
  assert.match(login.description, /用户名或密码错误.*401/);
  assert.match(login.description, /不得.*清空表单或跳转登录页/);

  const userDelete = operationsById.get("adminUserDelete");
  assert.match(userDelete.description, /空账号/);
  assert.match(userDelete.description, /409/);
  assert.match(userDelete.description, /不得级联删除/);
  assert.ok(userDelete.responses["409"], "用户存在业务关联时应返回 409");

  const categoryDelete = operationsById.get("adminCategoryDelete");
  assert.match(categoryDelete.description, /叶子分类/);
  assert.match(categoryDelete.description, /409/);
  assert.match(categoryDelete.description, /不得级联删除子分类/);
  assert.match(categoryDelete.description, /不得自动迁移或删除职位/);
  assert.ok(categoryDelete.responses["409"], "分类存在子分类或职位引用时应返回 409");
});

test("Markdown 文档覆盖全部接口与核心规则", () => {
  for (const { operation } of operations) {
    assert.ok(
      readme.includes(`\`${operation.operationId}\``),
      `README 未覆盖 ${operation.operationId}`,
    );
  }

  assert.match(readme, /统一响应 `Result<T>`/);
  assert.match(readme, /分页结构 `PageVO<T>`/);
  assert.match(readme, /同一 `resumeId \+ jobId` 只允许存在一条有效投递/);
  assert.match(readme, /JWT 默认有效期 2 小时/);
  assert.match(readme, /验证码保存在 Redis/);
  assert.match(readme, /64 个操作/);
  assert.match(readme, /yyyy-MM-dd HH:mm:ss/);
  assert.match(readme, /时区固定为 GMT\+8/);
  assert.match(readme, /OSS 对象存储/);
  assert.match(readme, /数据库只保存 `objectKey`/);
  assert.doesNotMatch(readme, /可配置本地目录/);
  assert.doesNotMatch(readme, /\/files\/\*\*/);

  const error400Line = readme.split("\n").find((line) => line.includes("| `400` |"));
  const error401Line = readme.split("\n").find((line) => line.includes("| `401` |"));
  assert.match(error400Line, /验证码/);
  assert.doesNotMatch(error401Line, /验证码/);
  assert.match(readme, /### 6\.5 删除与数据保留/);
  assert.match(readme, /仅删除无业务关联的空账号/);
});
