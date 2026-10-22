import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

const ref = (section, name) => ({ $ref: `#/components/${section}/${name}` });
const schemaRef = (name) => ref("schemas", name);
const parameterRef = (name) => ref("parameters", name);
const responseRef = (name) => ref("responses", name);

const jsonContent = (schemaName) => ({
  "application/json": {
    schema: schemaRef(schemaName),
  },
});

const jsonBody = (schemaName, required = true) => ({
  required,
  content: jsonContent(schemaName),
});

const multipartBody = (schemaName, required = true) => ({
  required,
  content: {
    "multipart/form-data": {
      schema: schemaRef(schemaName),
    },
  },
});

const errorResponses = {
  badRequest: { status: "400", component: "BadRequest" },
  unauthorized: { status: "401", component: "Unauthorized" },
  forbidden: { status: "403", component: "Forbidden" },
  notFound: { status: "404", component: "NotFound" },
  conflict: { status: "409", component: "Conflict" },
  payloadTooLarge: { status: "413", component: "PayloadTooLarge" },
  unprocessableEntity: { status: "422", component: "UnprocessableEntity" },
  tooManyRequests: { status: "429", component: "TooManyRequests" },
  serverError: { status: "500", component: "ServerError" },
};

const PUBLIC_ERRORS = ["badRequest", "notFound", "tooManyRequests", "serverError"];
const AUTH_ERRORS = ["badRequest", "unauthorized", "forbidden", "notFound", "tooManyRequests", "serverError"];
const WRITE_ERRORS = [...AUTH_ERRORS, "conflict", "unprocessableEntity"];

function operation({
  tag,
  summary,
  operationId,
  roles,
  description,
  parameters = [],
  requestBody,
  successSchema,
  successDescription = "请求成功",
  errors = AUTH_ERRORS,
}) {
  const isPublicOnly = roles.length === 1 && roles[0] === "PUBLIC";
  const allowsOptionalAuth = roles.includes("PUBLIC") && !isPublicOnly;
  const responses = {
    200: {
      description: successDescription,
      content: jsonContent(successSchema),
    },
  };

  for (const errorName of errors) {
    const error = errorResponses[errorName];
    if (error) responses[error.status] = responseRef(error.component);
  }

  const result = {
    tags: [tag],
    summary,
    description,
    operationId,
    "x-roles": roles,
    parameters,
    responses,
  };

  if (isPublicOnly) result.security = [];
  if (allowsOptionalAuth) result.security = [{}, { bearerAuth: [] }];
  if (requestBody) result.requestBody = requestBody;
  return result;
}

const query = (name) => parameterRef(name);

const stringArray = {
  type: "array",
  items: { type: "string" },
};

const timestamp = {
  type: "string",
  pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$",
  description: "北京时间，时区固定为 GMT+8",
  example: "2026-10-20 12:30:00",
};

const idSchema = {
  type: "integer",
  format: "int64",
  minimum: 1,
};

const pageSchema = (itemSchemaName) => ({
  type: "object",
  required: ["records", "total", "page", "size"],
  properties: {
    records: {
      type: "array",
      items: schemaRef(itemSchemaName),
    },
    total: {
      type: "integer",
      format: "int64",
      minimum: 0,
    },
    page: {
      type: "integer",
      minimum: 1,
    },
    size: {
      type: "integer",
      minimum: 1,
      maximum: 100,
    },
  },
});

const resultOf = (dataSchema) => ({
  allOf: [
    schemaRef("ApiResult"),
    {
      type: "object",
      properties: {
        data: dataSchema,
      },
    },
  ],
});

const parameters = {
  Page: {
    name: "page",
    in: "query",
    required: false,
    description: "页码，从 1 开始",
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  Size: {
    name: "size",
    in: "query",
    required: false,
    description: "每页条数",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  Limit: {
    name: "limit",
    in: "query",
    required: false,
    description: "返回条数上限",
    schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
  },
  Keyword: {
    name: "keyword",
    in: "query",
    required: false,
    description: "职位、企业、技能或候选人关键词",
    schema: { type: "string", maxLength: 100 },
  },
  City: {
    name: "city",
    in: "query",
    required: false,
    description: "归一化后的城市名称",
    schema: { type: "string", example: "杭州" },
  },
  SalaryMin: {
    name: "salaryMin",
    in: "query",
    required: false,
    description: "最低月薪，单位 K",
    schema: { type: "integer", minimum: 0, maximum: 1000 },
  },
  SalaryMax: {
    name: "salaryMax",
    in: "query",
    required: false,
    description: "最高月薪，单位 K",
    schema: { type: "integer", minimum: 0, maximum: 1000 },
  },
  Education: {
    name: "education",
    in: "query",
    required: false,
    description: "学历要求",
    schema: {
      type: "string",
      enum: ["COLLEGE", "BACHELOR", "MASTER", "DOCTOR", "UNLIMITED"],
    },
  },
  Experience: {
    name: "experience",
    in: "query",
    required: false,
    description: "经验要求",
    schema: {
      type: "string",
      enum: ["FRESH", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_TO_TEN", "TEN_PLUS", "UNLIMITED"],
    },
  },
  CategoryIdQuery: {
    name: "categoryId",
    in: "query",
    required: false,
    description: "职位分类 ID",
    schema: idSchema,
  },
  Industry: {
    name: "industry",
    in: "query",
    required: false,
    description: "行业名称",
    schema: { type: "string", maxLength: 50 },
  },
  JobSort: {
    name: "sort",
    in: "query",
    required: false,
    description: "排序方式；求职者默认 MATCH_DESC，匿名默认 LATEST",
    schema: {
      type: "string",
      enum: ["MATCH_DESC", "LATEST", "SALARY_DESC", "HOT_DESC"],
      default: "LATEST",
    },
  },
  ApplicationStatus: {
    name: "status",
    in: "query",
    required: false,
    description: "投递状态",
    schema: {
      type: "string",
      enum: ["PENDING_VIEW", "VIEWED", "INTERVIEW", "REJECTED"],
    },
  },
  CompanyJobId: {
    name: "jobId",
    in: "query",
    required: false,
    description: "按企业职位筛选投递",
    schema: idSchema,
  },
  MessageType: {
    name: "type",
    in: "query",
    required: false,
    description: "消息类型",
    schema: {
      type: "string",
      enum: ["APPLICATION", "ANNOUNCEMENT", "SYSTEM"],
    },
  },
  IsRead: {
    name: "isRead",
    in: "query",
    required: false,
    description: "已读状态",
    schema: { type: "boolean" },
  },
  UserRole: {
    name: "role",
    in: "query",
    required: false,
    description: "用户角色",
    schema: {
      type: "string",
      enum: ["SEEKER", "COMPANY", "ADMIN"],
    },
  },
  UserStatus: {
    name: "status",
    in: "query",
    required: false,
    description: "账号状态",
    schema: {
      type: "string",
      enum: ["ACTIVE", "DISABLED"],
    },
  },
  CompanyAuditStatus: {
    name: "auditStatus",
    in: "query",
    required: false,
    description: "企业审核状态",
    schema: {
      type: "string",
      enum: ["PENDING", "APPROVED", "REJECTED"],
    },
  },
  CompanyJobStatus: {
    name: "status",
    in: "query",
    required: false,
    description: "职位状态",
    schema: {
      type: "string",
      enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
    },
  },
  AuditStatus: {
    name: "auditStatus",
    in: "query",
    required: false,
    description: "审核状态",
    schema: {
      type: "string",
      enum: ["PENDING", "APPROVED", "REJECTED"],
    },
  },
  AnnouncementStatus: {
    name: "status",
    in: "query",
    required: false,
    description: "公告发布状态",
    schema: {
      type: "string",
      enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
    },
  },
  DeadLetterStatus: {
    name: "status",
    in: "query",
    required: false,
    description: "死信归档状态",
    schema: {
      type: "string",
      enum: ["PENDING", "REPLAYING", "REPLAYED"],
    },
  },
  Months: {
    name: "months",
    in: "query",
    required: false,
    description: "统计月份数",
    schema: { type: "integer", minimum: 1, maximum: 36, default: 12 },
  },
  UserId: {
    name: "userId",
    in: "path",
    required: true,
    description: "用户 ID",
    schema: idSchema,
  },
  CompanyId: {
    name: "companyId",
    in: "path",
    required: true,
    description: "企业 ID",
    schema: idSchema,
  },
  JobId: {
    name: "jobId",
    in: "path",
    required: true,
    description: "职位 ID",
    schema: idSchema,
  },
  ResumeId: {
    name: "resumeId",
    in: "path",
    required: true,
    description: "简历 ID",
    schema: idSchema,
  },
  ApplicationId: {
    name: "applicationId",
    in: "path",
    required: true,
    description: "投递记录 ID",
    schema: idSchema,
  },
  MessageId: {
    name: "messageId",
    in: "path",
    required: true,
    description: "消息 ID",
    schema: idSchema,
  },
  CategoryId: {
    name: "categoryId",
    in: "path",
    required: true,
    description: "职位分类 ID",
    schema: idSchema,
  },
  AnnouncementId: {
    name: "announcementId",
    in: "path",
    required: true,
    description: "公告 ID",
    schema: idSchema,
  },
  DeadLetterId: {
    name: "deadLetterId",
    in: "path",
    required: true,
    description: "死信归档 ID",
    schema: idSchema,
  },
};

const errorSchema = () => ({
  type: "object",
  required: ["code", "msg", "data"],
  properties: {
    code: {
      type: "integer",
      example: 400,
    },
    msg: {
      type: "string",
      example: "请求参数不合法",
    },
    data: {
      nullable: true,
      example: null,
    },
  },
});

const errorResponse = (status, description, example) => ({
  description,
  content: {
    "application/json": {
      schema: schemaRef("ErrorResult"),
      example: {
        code: status,
        msg: example,
        data: null,
      },
    },
  },
});

const responses = {
  BadRequest: errorResponse(400, "请求参数或格式错误", "请求参数不合法"),
  Unauthorized: errorResponse(401, "未登录、登录状态失效或登录凭据错误", "请检查登录信息或重新登录"),
  Forbidden: errorResponse(403, "当前角色无权访问该资源", "无权执行该操作"),
  NotFound: errorResponse(404, "请求的资源不存在", "资源不存在或已删除"),
  Conflict: errorResponse(409, "重复操作或当前状态不允许变更", "当前状态不允许执行该操作"),
  PayloadTooLarge: errorResponse(413, "上传文件大小超过限制", "文件大小不能超过 10MB"),
  UnprocessableEntity: errorResponse(422, "业务校验未通过", "业务规则校验失败"),
  TooManyRequests: errorResponse(429, "请求频率超过限制", "操作过于频繁，请稍后再试"),
  ServerError: errorResponse(500, "服务端异常", "系统繁忙，请稍后重试"),
};

const schemas = {
  ApiResult: {
    type: "object",
    required: ["code", "msg", "data"],
    properties: {
      code: {
        type: "integer",
        description:
          "后端由 ResultCode 枚举统一维护。成功固定为 200；失败使用 400/401/403/404/409/413/422/429/500 等对应 HTTP 状态码。",
        example: 200,
      },
      msg: {
        type: "string",
        example: "success",
      },
      data: {
        nullable: true,
        description: "业务数据；无返回数据时为 null",
      },
    },
  },
  ErrorResult: errorSchema(),
  CaptchaData: {
    type: "object",
    required: ["captchaId", "imageBase64", "expiresIn"],
    properties: {
      captchaId: { type: "string", format: "uuid" },
      imageBase64: {
        type: "string",
        description: "data:image/png;base64 格式验证码图片",
      },
      expiresIn: { type: "integer", example: 120 },
    },
  },
  UserSummary: {
    type: "object",
    required: ["id", "username", "role", "status"],
    properties: {
      id: idSchema,
      username: { type: "string", example: "linzhixia" },
      nickname: { type: "string", example: "林知夏" },
      role: {
        type: "string",
        enum: ["SEEKER", "COMPANY", "ADMIN"],
      },
      phone: { type: "string", nullable: true, example: "13800006271" },
      email: { type: "string", format: "email", nullable: true },
      status: {
        type: "string",
        enum: ["ACTIVE", "DISABLED"],
      },
      avatarUrl: { type: "string", nullable: true },
    },
  },
  UserProfile: {
    allOf: [
      schemaRef("UserSummary"),
      {
        type: "object",
        properties: {
          createdAt: timestamp,
          updatedAt: timestamp,
          lastLoginAt: {
            ...timestamp,
            nullable: true,
          },
        },
      },
    ],
  },
  AuthData: {
    type: "object",
    required: ["accessToken", "tokenType", "expiresIn", "user"],
    properties: {
      accessToken: { type: "string" },
      tokenType: { type: "string", example: "Bearer" },
      expiresIn: { type: "integer", example: 7200 },
      user: schemaRef("UserSummary"),
    },
  },
  CaptchaResult: resultOf(schemaRef("CaptchaData")),
  AuthResult: resultOf(schemaRef("AuthData")),
  VoidResult: resultOf({
    type: "object",
    nullable: true,
    example: null,
  }),
  UserResult: resultOf(schemaRef("UserProfile")),
  FileUploadRequest: {
    type: "object",
    required: ["file", "scope"],
    properties: {
      file: { type: "string", format: "binary" },
      scope: {
        type: "string",
        enum: ["RESUME_ATTACHMENT", "COMPANY_LOGO", "AVATAR"],
        description: "RESUME_ATTACHMENT 写入私有 Bucket 路径；COMPANY_LOGO 与 AVATAR 允许公开读取",
      },
    },
  },
  FileData: {
    type: "object",
    required: ["objectKey", "url", "visibility", "originalName", "contentType", "size"],
    properties: {
      objectKey: {
        type: "string",
        description: "OSS 对象键，持久化到数据库；禁止持久化临时签名 URL",
        example: "resume/10001/2026/10/3f8d9e70-c0b2-4a53-a8e1-34fd3fe906fc.pdf",
      },
      url: {
        type: "string",
        description: "OSS 访问地址；私有对象返回短期签名 URL，公开资源返回 CDN/公开 URL",
        example:
          "https://cdn.example.com/resume/10001/2026/10/3f8d9e70-c0b2-4a53-a8e1-34fd3fe906fc.pdf?Expires=1760953800",
      },
      visibility: {
        type: "string",
        enum: ["PRIVATE", "PUBLIC"],
      },
      urlExpiresAt: {
        ...timestamp,
        nullable: true,
        description: "私有对象签名 URL 的过期时间；公开资源为 null",
      },
      originalName: { type: "string" },
      contentType: { type: "string" },
      size: { type: "integer", format: "int64" },
    },
  },
  FileResult: resultOf(schemaRef("FileData")),
  RegisterRequest: {
    type: "object",
    required: ["username", "password", "role", "captchaId", "captchaCode"],
    properties: {
      username: { type: "string", minLength: 3, maxLength: 50 },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        maxLength: 64,
      },
      nickname: { type: "string", minLength: 1, maxLength: 50 },
      phone: { type: "string", maxLength: 20 },
      email: { type: "string", format: "email", maxLength: 100 },
      role: {
        type: "string",
        enum: ["SEEKER", "COMPANY"],
      },
      captchaId: { type: "string", format: "uuid" },
      captchaCode: {
        type: "string",
        minLength: 4,
        maxLength: 6,
      },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["username", "password", "captchaId", "captchaCode"],
    properties: {
      username: { type: "string" },
      password: { type: "string", format: "password" },
      captchaId: { type: "string", format: "uuid" },
      captchaCode: { type: "string", minLength: 4, maxLength: 6 },
    },
  },
  UpdateProfileRequest: {
    type: "object",
    properties: {
      nickname: { type: "string", minLength: 1, maxLength: 50 },
      phone: { type: "string", maxLength: 20, nullable: true },
      email: { type: "string", format: "email", maxLength: 100, nullable: true },
      avatarUrl: { type: "string", nullable: true },
    },
  },
  ChangePasswordRequest: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: { type: "string", format: "password" },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 8,
        maxLength: 64,
      },
    },
  },
  CompanySummary: {
    type: "object",
    required: ["id", "name", "industry", "city"],
    properties: {
      id: idSchema,
      name: { type: "string", example: "星云科技" },
      industry: { type: "string", example: "企业服务" },
      scale: { type: "string", example: "500-999人" },
      city: { type: "string", example: "杭州" },
      logoUrl: { type: "string", nullable: true },
      auditStatus: {
        type: "string",
        enum: ["PENDING", "APPROVED", "REJECTED"],
      },
    },
  },
  MatchExplanation: {
    type: "object",
    required: ["score", "matchedSkills", "missingSkills"],
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100 },
      matchedSkills: stringArray,
      missingSkills: stringArray,
      matchedCount: { type: "integer", minimum: 0 },
      totalCount: { type: "integer", minimum: 0 },
    },
  },
  JobSummary: {
    type: "object",
    required: [
      "id",
      "companyId",
      "companyName",
      "title",
      "city",
      "salaryMin",
      "salaryMax",
      "education",
      "experience",
      "skillTags",
      "status",
      "updatedAt",
    ],
    properties: {
      id: idSchema,
      companyId: idSchema,
      companyName: { type: "string" },
      companyLogoUrl: { type: "string", nullable: true },
      title: { type: "string" },
      city: { type: "string" },
      district: { type: "string", nullable: true },
      salaryMin: { type: "integer", example: 25 },
      salaryMax: { type: "integer", example: 38 },
      education: {
        type: "string",
        enum: ["COLLEGE", "BACHELOR", "MASTER", "DOCTOR", "UNLIMITED"],
      },
      experience: {
        type: "string",
        enum: ["FRESH", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_TO_TEN", "TEN_PLUS", "UNLIMITED"],
      },
      industry: { type: "string", nullable: true },
      skillTags: stringArray,
      perks: stringArray,
      status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
      },
      viewCount: { type: "integer", minimum: 0 },
      matchScore: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        nullable: true,
        description: "匿名访问时为 null",
      },
      updatedAt: timestamp,
    },
  },
  JobDetail: {
    allOf: [
      schemaRef("JobSummary"),
      {
        type: "object",
        properties: {
          description: { type: "string" },
          duties: stringArray,
          requirements: stringArray,
          company: schemaRef("CompanySummary"),
          matchExplanation: {
            allOf: [schemaRef("MatchExplanation")],
            nullable: true,
          },
          publishedAt: timestamp,
        },
      },
    ],
  },
  JobPage: pageSchema("JobSummary"),
  JobListData: {
    type: "array",
    items: schemaRef("JobSummary"),
  },
  JobPageResult: resultOf(schemaRef("JobPage")),
  JobListResult: resultOf(schemaRef("JobListData")),
  JobResult: resultOf(schemaRef("JobDetail")),
  CategoryNode: {
    type: "object",
    required: ["id", "name", "sort"],
    properties: {
      id: idSchema,
      name: { type: "string" },
      parentId: {
        ...idSchema,
        nullable: true,
      },
      sort: { type: "integer", example: 10 },
      jobCount: { type: "integer", minimum: 0 },
      children: {
        type: "array",
        items: schemaRef("CategoryNode"),
      },
    },
  },
  CategoryListData: {
    type: "array",
    items: schemaRef("CategoryNode"),
  },
  CategoryListResult: resultOf(schemaRef("CategoryListData")),
  CategoryResult: resultOf(schemaRef("CategoryNode")),
  Announcement: {
    type: "object",
    required: ["id", "title", "content", "status", "channel"],
    properties: {
      id: idSchema,
      title: { type: "string" },
      summary: { type: "string" },
      content: { type: "string" },
      status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
      },
      channel: {
        type: "string",
        enum: ["ALL", "SEEKER", "COMPANY"],
      },
      publisherId: idSchema,
      publishedAt: {
        ...timestamp,
        nullable: true,
      },
      createdAt: timestamp,
    },
  },
  AnnouncementPage: pageSchema("Announcement"),
  AnnouncementPageResult: resultOf(schemaRef("AnnouncementPage")),
  AnnouncementResult: resultOf(schemaRef("Announcement")),
  DeadLetter: {
    type: "object",
    required: [
      "id",
      "queueName",
      "exchangeName",
      "routingKey",
      "messageBody",
      "headers",
      "status",
      "replayCount",
      "createdAt",
    ],
    properties: {
      id: idSchema,
      queueName: { type: "string", maxLength: 120 },
      exchangeName: { type: "string", maxLength: 120 },
      routingKey: { type: "string", maxLength: 150 },
      messageId: { type: "string", maxLength: 100, nullable: true },
      correlationId: { type: "string", maxLength: 100, nullable: true },
      messageBody: { type: "string" },
      contentType: { type: "string", maxLength: 100, nullable: true },
      headers: {
        type: "object",
        additionalProperties: true,
      },
      failureReason: { type: "string", maxLength: 1000, nullable: true },
      status: {
        type: "string",
        enum: ["PENDING", "REPLAYING", "REPLAYED"],
      },
      replayCount: { type: "integer", minimum: 0 },
      createdAt: timestamp,
      replayedAt: {
        ...timestamp,
        nullable: true,
      },
    },
  },
  DeadLetterPage: pageSchema("DeadLetter"),
  DeadLetterPageResult: resultOf(schemaRef("DeadLetterPage")),
  DeadLetterResult: resultOf(schemaRef("DeadLetter")),
  ResumeUpsertRequest: {
    type: "object",
    required: [
      "name",
      "education",
      "experienceYears",
      "expectCity",
      "expectSalaryMin",
      "expectSalaryMax",
      "skillTags",
      "summary",
    ],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50 },
      title: { type: "string", maxLength: 100 },
      education: {
        type: "string",
        enum: ["COLLEGE", "BACHELOR", "MASTER", "DOCTOR"],
      },
      experienceYears: { type: "integer", minimum: 0, maximum: 60 },
      currentCity: { type: "string", maxLength: 50 },
      expectCity: { type: "string", maxLength: 100 },
      expectSalaryMin: { type: "integer", minimum: 0, maximum: 1000 },
      expectSalaryMax: { type: "integer", minimum: 0, maximum: 1000 },
      skillTags: {
        ...stringArray,
        maxItems: 30,
      },
      summary: { type: "string", maxLength: 2000 },
    },
  },
  ResumeAttachmentRequest: {
    type: "object",
    required: ["file"],
    properties: {
      file: { type: "string", format: "binary" },
    },
  },
  Resume: {
    type: "object",
    required: [
      "id",
      "userId",
      "name",
      "education",
      "experienceYears",
      "expectCity",
      "expectSalaryMin",
      "expectSalaryMax",
      "skillTags",
      "isDefault",
    ],
    properties: {
      id: idSchema,
      userId: idSchema,
      name: { type: "string" },
      title: { type: "string" },
      education: {
        type: "string",
        enum: ["COLLEGE", "BACHELOR", "MASTER", "DOCTOR"],
      },
      experienceYears: { type: "integer", minimum: 0 },
      currentCity: { type: "string", nullable: true },
      expectCity: { type: "string" },
      expectSalaryMin: { type: "integer", minimum: 0 },
      expectSalaryMax: { type: "integer", minimum: 0 },
      skillTags: stringArray,
      summary: { type: "string" },
      attachmentObjectKey: {
        type: "string",
        nullable: true,
        description: "简历附件在 OSS 中的持久化对象键",
      },
      attachmentUrl: {
        type: "string",
        nullable: true,
        description: "简历附件的短期签名访问 URL，不写入数据库",
      },
      isDefault: { type: "boolean" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  },
  ResumeListData: {
    type: "array",
    items: schemaRef("Resume"),
  },
  ResumeListResult: resultOf(schemaRef("ResumeListData")),
  ResumeResult: resultOf(schemaRef("Resume")),
  ApplicationCreateRequest: {
    type: "object",
    required: ["jobId", "resumeId"],
    properties: {
      jobId: idSchema,
      resumeId: idSchema,
    },
  },
  ApplicationStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["VIEWED", "INTERVIEW", "REJECTED"],
      },
      remark: { type: "string", maxLength: 255 },
    },
  },
  ApplicationRemarkRequest: {
    type: "object",
    properties: {
      remark: { type: "string", maxLength: 255, nullable: true },
    },
  },
  Application: {
    type: "object",
    required: [
      "id",
      "resumeId",
      "jobId",
      "userId",
      "status",
      "matchScore",
      "deliveryTime",
    ],
    properties: {
      id: idSchema,
      resumeId: idSchema,
      jobId: idSchema,
      userId: idSchema,
      status: {
        type: "string",
        enum: ["PENDING_VIEW", "VIEWED", "INTERVIEW", "REJECTED"],
      },
      matchScore: { type: "integer", minimum: 0, maximum: 100 },
      companyRemark: { type: "string", nullable: true },
      deliveryTime: timestamp,
      handleTime: {
        ...timestamp,
        nullable: true,
      },
      job: schemaRef("JobSummary"),
    },
  },
  ApplicationDetail: {
    allOf: [
      schemaRef("Application"),
      {
        type: "object",
        properties: {
          resume: schemaRef("Resume"),
          candidate: schemaRef("UserSummary"),
        },
      },
    ],
  },
  ApplicationPage: pageSchema("Application"),
  ApplicationResult: resultOf(schemaRef("Application")),
  ApplicationDetailResult: resultOf(schemaRef("ApplicationDetail")),
  ApplicationPageResult: resultOf(schemaRef("ApplicationPage")),
  CompanyUpdateRequest: {
    type: "object",
    required: ["name", "industry", "scale", "city", "intro"],
    properties: {
      name: { type: "string", minLength: 2, maxLength: 100 },
      industry: { type: "string", minLength: 1, maxLength: 50 },
      scale: { type: "string", maxLength: 30 },
      city: { type: "string", maxLength: 50 },
      logoUrl: { type: "string", nullable: true },
      intro: { type: "string", minLength: 20, maxLength: 5000 },
      contactName: { type: "string", maxLength: 50 },
      contactPhone: { type: "string", maxLength: 20 },
      contactEmail: { type: "string", format: "email", maxLength: 100 },
    },
  },
  Company: {
    allOf: [
      schemaRef("CompanySummary"),
      {
        type: "object",
        properties: {
          userId: idSchema,
          intro: { type: "string" },
          contactName: { type: "string", nullable: true },
          contactPhone: { type: "string", nullable: true },
          contactEmail: { type: "string", nullable: true },
          activeJobCount: { type: "integer", minimum: 0 },
          auditReason: { type: "string", nullable: true },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
    ],
  },
  CompanyResult: resultOf(schemaRef("Company")),
  CompanyPage: pageSchema("Company"),
  CompanyPageResult: resultOf(schemaRef("CompanyPage")),
  CompanyJobUpsertRequest: {
    type: "object",
    required: [
      "title",
      "categoryId",
      "city",
      "salaryMin",
      "salaryMax",
      "education",
      "experience",
      "description",
      "skillTags",
    ],
    properties: {
      title: { type: "string", minLength: 2, maxLength: 100 },
      categoryId: idSchema,
      city: { type: "string", maxLength: 50 },
      district: { type: "string", maxLength: 50 },
      salaryMin: { type: "integer", minimum: 1, maximum: 1000 },
      salaryMax: { type: "integer", minimum: 1, maximum: 1000 },
      education: {
        type: "string",
        enum: ["COLLEGE", "BACHELOR", "MASTER", "DOCTOR", "UNLIMITED"],
      },
      experience: {
        type: "string",
        enum: ["FRESH", "ONE_TO_THREE", "THREE_TO_FIVE", "FIVE_TO_TEN", "TEN_PLUS", "UNLIMITED"],
      },
      description: { type: "string", minLength: 20, maxLength: 10000 },
      duties: stringArray,
      requirements: stringArray,
      skillTags: {
        ...stringArray,
        minItems: 1,
        maxItems: 30,
      },
      perks: stringArray,
    },
  },
  CompanyJobStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
      },
    },
  },
  CompanyJob: {
    allOf: [
      schemaRef("JobDetail"),
      {
        type: "object",
        properties: {
          auditStatus: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED"],
          },
          auditReason: { type: "string", nullable: true },
          applicantCount: { type: "integer", minimum: 0 },
          pendingApplicantCount: { type: "integer", minimum: 0 },
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      },
    ],
  },
  CompanyJobPage: pageSchema("CompanyJob"),
  CompanyJobPageResult: resultOf(schemaRef("CompanyJobPage")),
  CompanyJobResult: resultOf(schemaRef("CompanyJob")),
  AdminJobPage: {
    allOf: [schemaRef("CompanyJobPage")],
  },
  AdminJobPageResult: resultOf(schemaRef("AdminJobPage")),
  CompanyDashboard: {
    type: "object",
    required: [
      "activeJobCount",
      "pendingCandidateCount",
      "interviewCount",
      "averageMatchScore",
      "funnel",
    ],
    properties: {
      activeJobCount: { type: "integer", minimum: 0 },
      pendingCandidateCount: { type: "integer", minimum: 0 },
      interviewCount: { type: "integer", minimum: 0 },
      averageMatchScore: { type: "number", format: "float", minimum: 0, maximum: 100 },
      funnel: {
        type: "object",
        required: ["views", "applications", "interviews", "hires"],
        properties: {
          views: { type: "integer", minimum: 0 },
          applications: { type: "integer", minimum: 0 },
          interviews: { type: "integer", minimum: 0 },
          hires: { type: "integer", minimum: 0 },
        },
      },
      recentApplications: {
        type: "array",
        items: schemaRef("Application"),
      },
    },
  },
  CompanyDashboardResult: resultOf(schemaRef("CompanyDashboard")),
  Message: {
    type: "object",
    required: ["id", "receiverId", "type", "title", "content", "isRead", "createdAt"],
    properties: {
      id: idSchema,
      receiverId: idSchema,
      type: {
        type: "string",
        enum: ["APPLICATION", "ANNOUNCEMENT", "SYSTEM"],
      },
      title: { type: "string" },
      content: { type: "string" },
      relatedId: {
        ...idSchema,
        nullable: true,
      },
      isRead: { type: "boolean" },
      createdAt: timestamp,
    },
  },
  MessagePage: pageSchema("Message"),
  MessagePageResult: resultOf(schemaRef("MessagePage")),
  MessageResult: resultOf(schemaRef("Message")),
  UnreadCountData: {
    type: "object",
    required: ["count"],
    properties: {
      count: { type: "integer", minimum: 0 },
    },
  },
  UnreadCountResult: resultOf(schemaRef("UnreadCountData")),
  UserPage: pageSchema("UserProfile"),
  UserPageResult: resultOf(schemaRef("UserPage")),
  UserStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["ACTIVE", "DISABLED"],
      },
    },
  },
  AuditRequest: {
    type: "object",
    required: ["auditStatus"],
    properties: {
      auditStatus: {
        type: "string",
        enum: ["APPROVED", "REJECTED"],
      },
      reason: {
        type: "string",
        maxLength: 255,
        description: "驳回时必填",
      },
    },
  },
  CategoryUpsertRequest: {
    type: "object",
    required: ["name", "sort"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50 },
      parentId: {
        ...idSchema,
        nullable: true,
      },
      sort: { type: "integer", minimum: 0, maximum: 9999 },
    },
  },
  AnnouncementUpsertRequest: {
    type: "object",
    required: ["title", "content", "channel", "status"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 100 },
      summary: { type: "string", maxLength: 300 },
      content: { type: "string", minLength: 1, maxLength: 20000 },
      channel: {
        type: "string",
        enum: ["ALL", "SEEKER", "COMPANY"],
      },
      status: {
        type: "string",
        enum: ["DRAFT", "PUBLISHED", "OFFLINE"],
      },
    },
  },
  DistributionItem: {
    type: "object",
    required: ["name", "value"],
    properties: {
      name: { type: "string" },
      value: { type: "number" },
      percent: { type: "number", minimum: 0, maximum: 100 },
    },
  },
  TrendPoint: {
    type: "object",
    required: ["month", "jobCount", "applicationCount"],
    properties: {
      month: { type: "string", example: "2026-10" },
      jobCount: { type: "integer", minimum: 0 },
      applicationCount: { type: "integer", minimum: 0 },
    },
  },
  HotSkillItem: {
    type: "object",
    required: ["skill", "freqCount"],
    properties: {
      skill: { type: "string", example: "Python" },
      freqCount: { type: "integer", minimum: 0 },
    },
  },
  DashboardStatsData: {
    type: "object",
    required: [
      "overview",
      "salaryDistribution",
      "cityDistribution",
      "educationDistribution",
      "experienceDistribution",
      "industryDistribution",
      "trend",
      "hotSkills",
      "metadata",
    ],
    properties: {
      overview: {
        type: "object",
        required: ["sampleCount", "averageSalary", "supplyDemandRatio", "averageMatchScore"],
        properties: {
          sampleCount: {
            type: "integer",
            minimum: 0,
            description: "离线数据源完成去重和四维校验后的有效样本数，不等同于平台在线职位数。",
          },
          averageSalary: {
            type: "number",
            minimum: 0,
            description: "有效分析样本的平均月薪，单位 K；无分析结果时回退到平台职位均值。",
          },
          supplyDemandRatio: { type: "number", minimum: 0 },
          averageMatchScore: { type: "number", minimum: 0, maximum: 100 },
        },
      },
      salaryDistribution: {
        type: "array",
        items: schemaRef("DistributionItem"),
      },
      cityDistribution: {
        type: "array",
        items: schemaRef("DistributionItem"),
      },
      educationDistribution: {
        type: "array",
        items: schemaRef("DistributionItem"),
      },
      experienceDistribution: {
        type: "array",
        items: schemaRef("DistributionItem"),
      },
      industryDistribution: {
        type: "array",
        items: schemaRef("DistributionItem"),
      },
      trend: {
        type: "array",
        items: schemaRef("TrendPoint"),
      },
      hotSkills: {
        type: "array",
        items: schemaRef("HotSkillItem"),
      },
      metadata: {
        type: "object",
        required: ["sourceDataset", "statDate"],
        properties: {
          sourceDataset: {
            type: "string",
            description: "当前离线分析结果的数据集名称。",
          },
          statDate: { type: "string", format: "date" },
          updatedAt: timestamp,
        },
      },
    },
  },
  DashboardStatsResult: resultOf(schemaRef("DashboardStatsData")),
  TrendData: {
    type: "array",
    items: schemaRef("TrendPoint"),
  },
  TrendResult: resultOf(schemaRef("TrendData")),
  HotSkillsData: {
    type: "array",
    items: schemaRef("HotSkillItem"),
  },
  HotSkillsResult: resultOf(schemaRef("HotSkillsData")),
};

export function buildOpenApi() {
  return {
    openapi: "3.0.3",
    info: {
      title: "DreamHiring 招聘平台 API",
      version: "1.0.0",
      description:
        "DreamHiring V1.0 前后端接口契约。所有接口统一返回 Result<T>，分页统一返回 PageVO<T>。本规范覆盖求职者、企业和管理员三角色核心业务闭环。",
      contact: {
        name: "DreamHiring 开发组",
      },
      "x-date-time-format": "yyyy-MM-dd HH:mm:ss",
      "x-timezone": "GMT+8",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "本地开发环境",
      },
    ],
    tags: [
      { name: "认证与账户", description: "验证码、注册登录、当前用户与账号设置" },
      { name: "文件", description: "OSS 文件上传、访问地址与对象键" },
      { name: "职位与内容", description: "公开职位检索、职位详情、分类和公告" },
      { name: "简历", description: "求职者在线简历与附件" },
      { name: "投递", description: "求职者投递与企业候选人处理" },
      { name: "企业", description: "企业资料、职位管理、招聘看板" },
      { name: "消息", description: "站内消息、未读状态与已读管理" },
      { name: "平台管理", description: "用户、企业、职位审核、分类与公告管理" },
      { name: "数据洞察", description: "招聘市场多维统计" },
    ],
    security: [{ bearerAuth: [] }],
    paths: {
      "/api/auth/captcha": {
        post: operation({
          tag: "认证与账户",
          summary: "获取图形验证码",
          operationId: "authCaptcha",
          roles: ["PUBLIC"],
          description: "生成一次性图形验证码，验证码文本存入 Redis 120 秒。登录和注册时需同时提交 captchaId 与用户输入。",
          successSchema: "CaptchaResult",
          errors: ["tooManyRequests", "serverError"],
        }),
      },
      "/api/auth/register": {
        post: operation({
          tag: "认证与账户",
          summary: "注册账号",
          operationId: "authRegister",
          roles: ["PUBLIC"],
          description:
            "注册求职者或企业账号。管理员账号只能由系统初始化，不开放自助注册。验证码缺失、过期或错误时返回 400；账号冲突返回 409。",
          requestBody: jsonBody("RegisterRequest"),
          successSchema: "AuthResult",
          successDescription: "注册成功，返回 JWT 和用户信息",
          errors: ["badRequest", "conflict", "unprocessableEntity", "tooManyRequests", "serverError"],
        }),
      },
      "/api/auth/login": {
        post: operation({
          tag: "认证与账户",
          summary: "账号登录",
          operationId: "authLogin",
          roles: ["PUBLIC"],
          description:
            "使用用户名、密码和图形验证码登录。成功后返回有效期 2 小时的 JWT。验证码缺失、过期或错误时返回 400；用户名或密码错误时返回 401。前端认证接口不得因 401 清空表单或跳转登录页。",
          requestBody: jsonBody("LoginRequest"),
          successSchema: "AuthResult",
          successDescription: "登录成功",
          errors: ["badRequest", "unauthorized", "tooManyRequests", "serverError"],
        }),
      },
      "/api/auth/logout": {
        post: operation({
          tag: "认证与账户",
          summary: "退出登录",
          operationId: "authLogout",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "清理服务端安全上下文。JWT 本身无状态，客户端必须同步删除本地 token。",
          successSchema: "VoidResult",
        }),
      },
      "/api/auth/me": {
        get: operation({
          tag: "认证与账户",
          summary: "获取当前登录身份",
          operationId: "authMe",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "返回 JWT 对应的用户概要信息，用于前端启动时恢复登录态和角色守卫。",
          successSchema: "UserResult",
        }),
      },
      "/api/users/me": {
        get: operation({
          tag: "认证与账户",
          summary: "获取当前用户资料",
          operationId: "userGetMe",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "返回当前账号的完整基础资料。密码字段永远不会返回。",
          successSchema: "UserResult",
        }),
        put: operation({
          tag: "认证与账户",
          summary: "更新当前用户资料",
          operationId: "userUpdateMe",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "更新昵称、手机号、邮箱和头像地址。手机号与邮箱必须保持唯一。",
          requestBody: jsonBody("UpdateProfileRequest"),
          successSchema: "UserResult",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/users/me/password": {
        put: operation({
          tag: "认证与账户",
          summary: "修改密码",
          operationId: "userChangePassword",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "校验旧密码后使用 BCrypt 保存新密码。修改成功后建议客户端重新登录。",
          requestBody: jsonBody("ChangePasswordRequest"),
          successSchema: "VoidResult",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/files": {
        post: operation({
          tag: "文件",
          summary: "上传文件",
          operationId: "fileUpload",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description:
            "上传简历附件、作品集、企业 Logo 或头像。V1.0 统一写入 OSS 对象存储，不使用本地磁盘；服务端返回 objectKey 和可访问 URL。简历附件为私有对象并返回短期签名 URL。",
          requestBody: multipartBody("FileUploadRequest"),
          successSchema: "FileResult",
          successDescription: "上传成功",
          errors: [...AUTH_ERRORS, "payloadTooLarge", "unprocessableEntity"],
        }),
      },
      "/api/jobs": {
        get: operation({
          tag: "职位与内容",
          summary: "职位多条件检索",
          operationId: "jobSearch",
          roles: ["PUBLIC", "SEEKER"],
          description:
            "检索已审核上架职位。匿名用户不返回 matchScore；求职者携带 JWT 时，系统基于默认简历计算匹配度。",
          parameters: [
            query("Keyword"),
            query("City"),
            query("SalaryMin"),
            query("SalaryMax"),
            query("Education"),
            query("Experience"),
            query("CategoryIdQuery"),
            query("Industry"),
            query("JobSort"),
            query("Page"),
            query("Size"),
          ],
          successSchema: "JobPageResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/jobs/hot": {
        get: operation({
          tag: "职位与内容",
          summary: "获取热门职位",
          operationId: "jobHot",
          roles: ["PUBLIC", "SEEKER"],
          description: "读取 Redis 热门职位 ZSET；缓存未命中时按浏览量回源数据库并回填缓存。",
          parameters: [query("Limit")],
          successSchema: "JobListResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/jobs/{jobId}": {
        get: operation({
          tag: "职位与内容",
          summary: "获取职位详情",
          operationId: "jobDetail",
          roles: ["PUBLIC", "SEEKER"],
          description:
            "返回职位详情、企业概要、技能标签和匹配解释。匿名访问不返回 matchScore；求职者访问时附带匹配度快照预估。",
          parameters: [parameterRef("JobId")],
          successSchema: "JobResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/job-categories/tree": {
        get: operation({
          tag: "职位与内容",
          summary: "获取职位分类树",
          operationId: "categoryTree",
          roles: ["PUBLIC"],
          description: "返回两级职位分类树，children 按 sort 升序排列。",
          successSchema: "CategoryListResult",
          errors: ["notFound", "serverError"],
        }),
      },
      "/api/announcements": {
        get: operation({
          tag: "职位与内容",
          summary: "获取已发布公告",
          operationId: "announcementList",
          roles: ["PUBLIC"],
          description: "返回已发布公告列表，按发布时间倒序分页。",
          parameters: [query("Page"), query("Size")],
          successSchema: "AnnouncementPageResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/announcements/{announcementId}": {
        get: operation({
          tag: "职位与内容",
          summary: "获取公告详情",
          operationId: "announcementDetail",
          roles: ["PUBLIC"],
          description: "获取一条已发布公告的完整内容。",
          parameters: [parameterRef("AnnouncementId")],
          successSchema: "AnnouncementResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/resumes": {
        get: operation({
          tag: "简历",
          summary: "获取我的简历列表",
          operationId: "resumeList",
          roles: ["SEEKER"],
          description: "返回当前求职者的全部未删除简历，默认简历优先展示。",
          parameters: [query("Page"), query("Size")],
          successSchema: "ResumeListResult",
        }),
        post: operation({
          tag: "简历",
          summary: "创建在线简历",
          operationId: "resumeCreate",
          roles: ["SEEKER"],
          description: "创建一份在线简历。首次创建时自动设为默认简历。",
          requestBody: jsonBody("ResumeUpsertRequest"),
          successSchema: "ResumeResult",
          successDescription: "简历创建成功",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/resumes/{resumeId}": {
        get: operation({
          tag: "简历",
          summary: "获取简历详情",
          operationId: "resumeDetail",
          roles: ["SEEKER"],
          description: "仅允许求职者读取自己的简历。",
          parameters: [parameterRef("ResumeId")],
          successSchema: "ResumeResult",
        }),
        put: operation({
          tag: "简历",
          summary: "更新在线简历",
          operationId: "resumeUpdate",
          roles: ["SEEKER"],
          description: "更新简历基本信息、求职意向和技能标签。",
          parameters: [parameterRef("ResumeId")],
          requestBody: jsonBody("ResumeUpsertRequest"),
          successSchema: "ResumeResult",
          errors: WRITE_ERRORS,
        }),
        delete: operation({
          tag: "简历",
          summary: "删除在线简历",
          operationId: "resumeDelete",
          roles: ["SEEKER"],
          description: "逻辑删除简历。已被投递引用的简历仍保留历史快照。",
          parameters: [parameterRef("ResumeId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/resumes/{resumeId}/default": {
        put: operation({
          tag: "简历",
          summary: "设为默认简历",
          operationId: "resumeSetDefault",
          roles: ["SEEKER"],
          description: "将指定简历设为唯一默认简历，用于职位匹配和快捷投递。",
          parameters: [parameterRef("ResumeId")],
          successSchema: "ResumeResult",
          errors: ["unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/resumes/{resumeId}/attachment": {
        post: operation({
          tag: "简历",
          summary: "上传简历附件",
          operationId: "resumeAttachment",
          roles: ["SEEKER"],
          description: "上传 PDF 简历并关联到指定在线简历，单文件不超过 10MB。",
          parameters: [parameterRef("ResumeId")],
          requestBody: multipartBody("ResumeAttachmentRequest"),
          successSchema: "ResumeResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "payloadTooLarge", "serverError"],
        }),
      },
      "/api/applications": {
        post: operation({
          tag: "投递",
          summary: "投递职位",
          operationId: "applicationCreate",
          roles: ["SEEKER"],
          description:
            "使用指定简历投递职位。系统校验同一 resumeId + jobId 唯一性，计算并保存 matchScore 快照，初始状态为 PENDING_VIEW。",
          requestBody: jsonBody("ApplicationCreateRequest"),
          successSchema: "ApplicationResult",
          successDescription: "投递成功",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "unprocessableEntity", "serverError"],
        }),
      },
      "/api/applications/my": {
        get: operation({
          tag: "投递",
          summary: "获取我的投递",
          operationId: "applicationMine",
          roles: ["SEEKER"],
          description: "分页返回当前求职者的投递记录，可按投递状态筛选。",
          parameters: [query("ApplicationStatus"), query("Page"), query("Size")],
          successSchema: "ApplicationPageResult",
        }),
      },
      "/api/applications/{applicationId}": {
        get: operation({
          tag: "投递",
          summary: "获取我的投递详情",
          operationId: "applicationMyDetail",
          roles: ["SEEKER"],
          description: "返回当前求职者本人投递记录、职位概要和状态更新时间。",
          parameters: [parameterRef("ApplicationId")],
          successSchema: "ApplicationResult",
        }),
      },
      "/api/company/applications": {
        get: operation({
          tag: "投递",
          summary: "企业候选人列表",
          operationId: "companyApplicationList",
          roles: ["COMPANY"],
          description: "企业查看本企业职位收到的投递，可按职位、状态和候选人关键词筛选。",
          parameters: [
            query("CompanyJobId"),
            query("ApplicationStatus"),
            query("Keyword"),
            query("Page"),
            query("Size"),
          ],
          successSchema: "ApplicationPageResult",
        }),
      },
      "/api/company/applications/{applicationId}": {
        get: operation({
          tag: "投递",
          summary: "企业查看候选人详情",
          operationId: "companyApplicationDetail",
          roles: ["COMPANY"],
          description: "返回投递记录、匹配度、候选人简历快照与企业备注。仅可查看本企业职位投递。",
          parameters: [parameterRef("ApplicationId")],
          successSchema: "ApplicationDetailResult",
        }),
      },
      "/api/company/applications/{applicationId}/status": {
        put: operation({
          tag: "投递",
          summary: "更新候选人状态",
          operationId: "companyApplicationUpdateStatus",
          roles: ["COMPANY"],
          description:
            "按状态机处理候选人：PENDING_VIEW → VIEWED → INTERVIEW / REJECTED。状态变更成功后写入站内消息事件。",
          parameters: [parameterRef("ApplicationId")],
          requestBody: jsonBody("ApplicationStatusRequest"),
          successSchema: "ApplicationResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "unprocessableEntity", "serverError"],
        }),
      },
      "/api/company/applications/{applicationId}/remark": {
        put: operation({
          tag: "投递",
          summary: "更新候选人备注",
          operationId: "companyApplicationUpdateRemark",
          roles: ["COMPANY"],
          description: "更新企业侧候选人备注，不向求职者展示。",
          parameters: [parameterRef("ApplicationId")],
          requestBody: jsonBody("ApplicationRemarkRequest"),
          successSchema: "ApplicationResult",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/company/profile": {
        get: operation({
          tag: "企业",
          summary: "获取企业资料",
          operationId: "companyProfileGet",
          roles: ["COMPANY"],
          description: "返回当前企业账号绑定的企业资料与审核状态。",
          successSchema: "CompanyResult",
        }),
        put: operation({
          tag: "企业",
          summary: "更新企业资料",
          operationId: "companyProfileUpdate",
          roles: ["COMPANY"],
          description: "更新企业名称、行业、规模、城市、Logo 与简介。敏感资料变更可能重新触发审核。",
          requestBody: jsonBody("CompanyUpdateRequest"),
          successSchema: "CompanyResult",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/company/jobs": {
        get: operation({
          tag: "企业",
          summary: "企业职位列表",
          operationId: "companyJobList",
          roles: ["COMPANY"],
          description: "获取本企业职位，可按招聘状态、审核状态和关键词筛选。",
          parameters: [
            query("CompanyJobStatus"),
            query("AuditStatus"),
            query("Keyword"),
            query("Page"),
            query("Size"),
          ],
          successSchema: "CompanyJobPageResult",
        }),
        post: operation({
          tag: "企业",
          summary: "发布职位",
          operationId: "companyJobCreate",
          roles: ["COMPANY"],
          description:
            "创建职位并提交审核。创建后 auditStatus=PENDING，审核通过后 status 才能变为 PUBLISHED。",
          requestBody: jsonBody("CompanyJobUpsertRequest"),
          successSchema: "CompanyJobResult",
          successDescription: "职位创建并提交审核",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/company/jobs/{jobId}": {
        get: operation({
          tag: "企业",
          summary: "企业职位详情",
          operationId: "companyJobDetail",
          roles: ["COMPANY"],
          description: "获取本企业指定职位详情，仅允许操作本企业数据。",
          parameters: [parameterRef("JobId")],
          successSchema: "CompanyJobResult",
        }),
        put: operation({
          tag: "企业",
          summary: "更新职位",
          operationId: "companyJobUpdate",
          roles: ["COMPANY"],
          description: "更新职位内容。薪资、描述或技能标签等关键字段变更后重新进入审核。",
          parameters: [parameterRef("JobId")],
          requestBody: jsonBody("CompanyJobUpsertRequest"),
          successSchema: "CompanyJobResult",
          errors: WRITE_ERRORS,
        }),
        delete: operation({
          tag: "企业",
          summary: "删除职位",
          operationId: "companyJobDelete",
          roles: ["COMPANY"],
          description: "逻辑删除职位。已有投递记录保留。",
          parameters: [parameterRef("JobId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/company/jobs/{jobId}/status": {
        put: operation({
          tag: "企业",
          summary: "更新职位上下架状态",
          operationId: "companyJobUpdateStatus",
          roles: ["COMPANY"],
          description: "将职位设为 DRAFT、PUBLISHED 或 OFFLINE。未审核通过的职位不能设为 PUBLISHED。",
          parameters: [parameterRef("JobId")],
          requestBody: jsonBody("CompanyJobStatusRequest"),
          successSchema: "CompanyJobResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "unprocessableEntity", "serverError"],
        }),
      },
      "/api/company/dashboard": {
        get: operation({
          tag: "企业",
          summary: "企业招聘看板",
          operationId: "companyDashboard",
          roles: ["COMPANY"],
          description: "返回在招职位数、待处理候选人、面试数、平均匹配度和近 30 天招聘漏斗。",
          successSchema: "CompanyDashboardResult",
        }),
      },
      "/api/messages": {
        get: operation({
          tag: "消息",
          summary: "获取站内消息",
          operationId: "messageList",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "分页返回当前用户消息，可按消息类型与已读状态筛选。",
          parameters: [query("MessageType"), query("IsRead"), query("Page"), query("Size")],
          successSchema: "MessagePageResult",
        }),
      },
      "/api/messages/unread-count": {
        get: operation({
          tag: "消息",
          summary: "获取未读消息数",
          operationId: "messageUnreadCount",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "用于顶栏红点和轮询刷新，返回未读消息总数。",
          successSchema: "UnreadCountResult",
        }),
      },
      "/api/messages/{messageId}": {
        get: operation({
          tag: "消息",
          summary: "获取消息详情",
          operationId: "messageDetail",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "获取当前用户的一条消息详情。",
          parameters: [parameterRef("MessageId")],
          successSchema: "MessageResult",
        }),
        delete: operation({
          tag: "消息",
          summary: "删除消息",
          operationId: "messageDelete",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "逻辑删除当前用户的一条消息。",
          parameters: [parameterRef("MessageId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "serverError"],
        }),
      },
      "/api/messages/{messageId}/read": {
        put: operation({
          tag: "消息",
          summary: "标记消息已读",
          operationId: "messageMarkRead",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "将当前用户的一条消息标记为已读。",
          parameters: [parameterRef("MessageId")],
          successSchema: "MessageResult",
          errors: ["unauthorized", "forbidden", "notFound", "serverError"],
        }),
      },
      "/api/messages/read-all": {
        put: operation({
          tag: "消息",
          summary: "全部标为已读",
          operationId: "messageMarkAllRead",
          roles: ["SEEKER", "COMPANY", "ADMIN"],
          description: "将当前用户全部未读消息标记为已读。",
          successSchema: "UnreadCountResult",
        }),
      },
      "/api/admin/users": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查询用户",
          operationId: "adminUserList",
          roles: ["ADMIN"],
          description: "分页查询平台用户，可按角色、账号状态和关键词筛选。",
          parameters: [query("UserRole"), query("UserStatus"), query("Keyword"), query("Page"), query("Size")],
          successSchema: "UserPageResult",
        }),
      },
      "/api/admin/users/{userId}": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查看用户详情",
          operationId: "adminUserDetail",
          roles: ["ADMIN"],
          description: "查看用户基础资料、账号状态和关键操作摘要。",
          parameters: [parameterRef("UserId")],
          successSchema: "UserResult",
        }),
        delete: operation({
          tag: "平台管理",
          summary: "管理员删除用户",
          operationId: "adminUserDelete",
          roles: ["ADMIN"],
          description:
            "仅允许删除没有简历、投递、企业绑定、消息或其他业务关联数据的空账号。存在任一业务关联时返回 409，管理员应改用禁用账号。不得级联删除简历、投递、消息或企业数据。",
          parameters: [parameterRef("UserId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/admin/users/{userId}/status": {
        put: operation({
          tag: "平台管理",
          summary: "启用或禁用用户",
          operationId: "adminUserUpdateStatus",
          roles: ["ADMIN"],
          description: "修改用户账号状态。禁用后 JWT 校验应拒绝继续访问受保护资源。",
          parameters: [parameterRef("UserId")],
          requestBody: jsonBody("UserStatusRequest"),
          successSchema: "UserResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/admin/companies": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查询企业",
          operationId: "adminCompanyList",
          roles: ["ADMIN"],
          description: "分页查询企业，可按认证状态和关键词筛选。",
          parameters: [query("CompanyAuditStatus"), query("Keyword"), query("Page"), query("Size")],
          successSchema: "CompanyPageResult",
        }),
      },
      "/api/admin/companies/{companyId}": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查看企业详情",
          operationId: "adminCompanyDetail",
          roles: ["ADMIN"],
          description: "查看企业资料、认证材料、在招职位和最近审核记录。",
          parameters: [parameterRef("CompanyId")],
          successSchema: "CompanyResult",
        }),
      },
      "/api/admin/companies/{companyId}/audit": {
        put: operation({
          tag: "平台管理",
          summary: "审核企业资质",
          operationId: "adminCompanyAudit",
          roles: ["ADMIN"],
          description: "通过或驳回企业认证。驳回时必须填写原因。",
          parameters: [parameterRef("CompanyId")],
          requestBody: jsonBody("AuditRequest"),
          successSchema: "CompanyResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "unprocessableEntity", "serverError"],
        }),
      },
      "/api/admin/jobs": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查询职位",
          operationId: "adminJobList",
          roles: ["ADMIN"],
          description: "分页查询全平台职位，重点展示待审核与风险提示项。",
          parameters: [
            query("CompanyJobStatus"),
            query("AuditStatus"),
            query("Keyword"),
            query("Page"),
            query("Size"),
          ],
          successSchema: "AdminJobPageResult",
        }),
      },
      "/api/admin/jobs/{jobId}": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查看职位详情",
          operationId: "adminJobDetail",
          roles: ["ADMIN"],
          description: "返回职位全部字段、企业信息和审核记录。",
          parameters: [parameterRef("JobId")],
          successSchema: "CompanyJobResult",
        }),
      },
      "/api/admin/jobs/{jobId}/audit": {
        put: operation({
          tag: "平台管理",
          summary: "审核职位",
          operationId: "adminJobAudit",
          roles: ["ADMIN"],
          description:
            "通过或驳回职位。通过后职位可上架；驳回时必须提供原因，企业会收到站内消息。",
          parameters: [parameterRef("JobId")],
          requestBody: jsonBody("AuditRequest"),
          successSchema: "CompanyJobResult",
          errors: ["badRequest", "unauthorized", "forbidden", "notFound", "conflict", "unprocessableEntity", "serverError"],
        }),
      },
      "/api/admin/job-categories": {
        post: operation({
          tag: "平台管理",
          summary: "创建职位分类",
          operationId: "adminCategoryCreate",
          roles: ["ADMIN"],
          description: "创建一级或二级职位分类，层级最多两级。",
          requestBody: jsonBody("CategoryUpsertRequest"),
          successSchema: "CategoryResult",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/admin/job-categories/{categoryId}": {
        put: operation({
          tag: "平台管理",
          summary: "更新职位分类",
          operationId: "adminCategoryUpdate",
          roles: ["ADMIN"],
          description: "更新分类名称、父级和排序。",
          parameters: [parameterRef("CategoryId")],
          requestBody: jsonBody("CategoryUpsertRequest"),
          successSchema: "CategoryResult",
          errors: WRITE_ERRORS,
        }),
        delete: operation({
          tag: "平台管理",
          summary: "删除职位分类",
          operationId: "adminCategoryDelete",
          roles: ["ADMIN"],
          description:
            "仅允许删除无子分类且未被任何职位引用的叶子分类。存在子分类或职位引用时返回 409。不得级联删除子分类，也不得自动迁移或删除职位。",
          parameters: [parameterRef("CategoryId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "conflict", "serverError"],
        }),
      },
      "/api/admin/announcements": {
        get: operation({
          tag: "平台管理",
          summary: "管理员查询公告",
          operationId: "adminAnnouncementList",
          roles: ["ADMIN"],
          description: "分页查询全部公告，可按发布状态和关键词筛选。",
          parameters: [query("AnnouncementStatus"), query("Keyword"), query("Page"), query("Size")],
          successSchema: "AnnouncementPageResult",
        }),
        post: operation({
          tag: "平台管理",
          summary: "创建公告",
          operationId: "adminAnnouncementCreate",
          roles: ["ADMIN"],
          description: "创建草稿或直接发布公告。发布后向目标角色写入站内消息。",
          requestBody: jsonBody("AnnouncementUpsertRequest"),
          successSchema: "AnnouncementResult",
          successDescription: "公告创建成功",
          errors: WRITE_ERRORS,
        }),
      },
      "/api/admin/announcements/{announcementId}": {
        put: operation({
          tag: "平台管理",
          summary: "更新公告",
          operationId: "adminAnnouncementUpdate",
          roles: ["ADMIN"],
          description: "更新公告标题、正文、触达范围和发布状态。",
          parameters: [parameterRef("AnnouncementId")],
          requestBody: jsonBody("AnnouncementUpsertRequest"),
          successSchema: "AnnouncementResult",
          errors: WRITE_ERRORS,
        }),
        delete: operation({
          tag: "平台管理",
          summary: "删除公告",
          operationId: "adminAnnouncementDelete",
          roles: ["ADMIN"],
          description: "逻辑删除公告，历史站内消息保留。",
          parameters: [parameterRef("AnnouncementId")],
          successSchema: "VoidResult",
          errors: ["unauthorized", "forbidden", "notFound", "serverError"],
        }),
      },
      "/api/admin/dead-letters": {
        get: operation({
          tag: "平台管理",
          summary: "查询 RabbitMQ 死信归档",
          operationId: "adminDeadLetterList",
          roles: ["ADMIN"],
          description:
            "分页查询消费者重试耗尽后归档的死信消息，可按处理状态筛选。归档保存原始队列、交换机、路由键、消息体、请求头和失败原因，便于排查和重投。",
          parameters: [query("DeadLetterStatus"), query("Page"), query("Size")],
          successSchema: "DeadLetterPageResult",
          errors: ["badRequest", "unauthorized", "forbidden", "serverError"],
        }),
      },
      "/api/admin/dead-letters/{deadLetterId}/replay": {
        post: operation({
          tag: "平台管理",
          summary: "重投死信消息",
          operationId: "adminDeadLetterReplay",
          roles: ["ADMIN"],
          description:
            "把 PENDING 死信消息重新发送到原交换机和原路由键。重投前原子切换为 REPLAYING，发送失败会恢复 PENDING；发送成功标记 REPLAYED。该操作不删除 RabbitMQ 中的原死信，消费者必须保持幂等。",
          parameters: [parameterRef("DeadLetterId")],
          successSchema: "DeadLetterResult",
          errors: [
            "unauthorized",
            "forbidden",
            "notFound",
            "conflict",
            "unprocessableEntity",
            "serverError",
          ],
        }),
      },
      "/api/stats/dashboard": {
        get: operation({
          tag: "数据洞察",
          summary: "获取招聘数据大屏聚合结果",
          operationId: "statsDashboard",
          roles: ["PUBLIC"],
          description:
            "一次返回薪资、城市、学历、经验、行业、招聘趋势和热门技能等图表数据，并附带数据源与统计日期。样本数和平均薪资来自离线清洗后的数据源；技能词频从中文职位描述提取，不依赖英文招聘数据集。",
          successSchema: "DashboardStatsResult",
          errors: ["serverError"],
        }),
      },
      "/api/stats/trend": {
        get: operation({
          tag: "数据洞察",
          summary: "获取招聘趋势",
          operationId: "statsTrend",
          roles: ["PUBLIC"],
          description: "按月份返回职位发布量和投递量趋势，默认最近 12 个月。",
          parameters: [query("Months")],
          successSchema: "TrendResult",
          errors: PUBLIC_ERRORS,
        }),
      },
      "/api/stats/hot-skills": {
        get: operation({
          tag: "数据洞察",
          summary: "获取热门技能",
          operationId: "statsHotSkills",
          roles: ["PUBLIC"],
          description: "返回技能词频，用于热门技能词云和技能趋势分析。",
          parameters: [query("Limit")],
          successSchema: "HotSkillsResult",
          errors: PUBLIC_ERRORS,
        }),
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "登录成功后获得 JWT，格式为 Authorization: Bearer <token>。",
        },
      },
      parameters,
      responses,
      schemas,
    },
  };
}

const openApi = buildOpenApi();

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  await writeFile(path.join(currentDir, "openapi.json"), `${JSON.stringify(openApi, null, 2)}\n`, "utf8");
  console.log("Generated docs/api/openapi.json");
}
