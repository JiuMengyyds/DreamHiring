import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const deployDir = path.dirname(testDir);
const projectRoot = path.dirname(deployDir);

const [productionConfig, frontendEnv, environmentExample, nginxConfig, systemdUnit, releaseScript] =
  await Promise.all([
    readFile(path.join(projectRoot, "backend", "src", "main", "resources", "application-prod.yml"), "utf8"),
    readFile(path.join(projectRoot, "frontend", ".env.production"), "utf8"),
    readFile(path.join(deployDir, ".env.production.example"), "utf8"),
    readFile(path.join(deployDir, "nginx", "dreamhiring.conf"), "utf8"),
    readFile(path.join(deployDir, "systemd", "dreamhiring-backend.service"), "utf8"),
    readFile(path.join(deployDir, "Build-Release.ps1"), "utf8"),
  ]);

test("生产后端配置从环境变量读取敏感信息", () => {
  for (const placeholder of [
    "${DREAMHIRING_DB_URL}",
    "${DREAMHIRING_DB_PASSWORD}",
    "${DREAMHIRING_REDIS_PASSWORD}",
    "${DREAMHIRING_RABBITMQ_PASSWORD}",
    "${DREAMHIRING_JWT_SECRET}",
    "${DREAMHIRING_OSS_ACCESS_KEY_SECRET}",
    "${DREAMHIRING_CORS_ALLOWED_ORIGINS}",
  ]) {
    assert.ok(productionConfig.includes(placeholder), `缺少环境变量：${placeholder}`);
  }

  assert.match(productionConfig, /on-profile:\s*prod/);
  assert.match(productionConfig, /seed-demo:\s*\n\s*enabled:\s*false/);
  assert.match(productionConfig, /address:\s*\$\{DREAMHIRING_SERVER_ADDRESS:127\.0\.0\.1\}/);
  assert.match(productionConfig, /shutdown:\s*graceful/);
  assert.doesNotMatch(productionConfig, /change-me|dreamhiring-test|password:\s*(guest|root|123456)/);
});

test("生产前端使用同源 API 并关闭 Mock", () => {
  assert.match(frontendEnv, /VITE_USE_MOCK=false/);
  assert.match(frontendEnv, /VITE_API_BASE_URL=\/api/);
});

test("环境变量模板覆盖基础设施且不包含真实密钥", () => {
  for (const variable of [
    "DREAMHIRING_DB_URL",
    "DREAMHIRING_REDIS_HOST",
    "DREAMHIRING_RABBITMQ_HOST",
    "DREAMHIRING_OSS_BUCKET",
    "DREAMHIRING_JWT_SECRET",
    "DREAMHIRING_CORS_ALLOWED_ORIGINS",
  ]) {
    assert.ok(environmentExample.includes(variable), `环境变量模板缺少 ${variable}`);
  }
  assert.match(environmentExample, /Never commit the completed file/);
});

test("Nginx 配置支持 SPA、API 代理、上传限制和静态缓存", () => {
  assert.match(nginxConfig, /location \/api\//);
  assert.match(nginxConfig, /proxy_pass http:\/\/127\.0\.0\.1:8080/);
  assert.match(nginxConfig, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(nginxConfig, /client_max_body_size 12m/);
  assert.match(nginxConfig, /location \/assets\//);
  assert.match(nginxConfig, /immutable/);
  assert.match(nginxConfig, /X-Forwarded-Proto \$scheme/);
  assert.match(nginxConfig, /X-Content-Type-Options/);
});

test("systemd 与发布脚本具备可恢复部署基线", () => {
  for (const expected of [
    "EnvironmentFile=/etc/dreamhiring/dreamhiring.env",
    "--spring.profiles.active=prod",
    "Restart=on-failure",
    "NoNewPrivileges=true",
    "ProtectSystem=strict",
  ]) {
    assert.ok(systemdUnit.includes(expected), `systemd 配置缺少 ${expected}`);
  }

  assert.match(releaseScript, /npm test --prefix/);
  assert.match(releaseScript, /npm run build --prefix/);
  assert.match(releaseScript, /\$mavenArguments = @\('package'/);
  assert.match(releaseScript, /mvn @mavenArguments/);
  assert.match(releaseScript, /\$mavenArguments \+= '-DskipTests'/);
  assert.match(releaseScript, /release-manifest\.json/);
  assert.match(releaseScript, /git -C \$projectRoot rev-parse/);
  assert.match(releaseScript, /upgrade-dead-letter\.sql/);
});
