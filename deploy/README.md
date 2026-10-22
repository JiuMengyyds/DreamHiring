# DreamHiring 生产部署

该目录提供 V1.0 的生产配置模板、Nginx 反向代理、systemd 服务和可重复发布脚本。敏感值只允许存放在服务器环境文件中，不进入 Git。

## 发布包

在 Windows 开发机激活 DreamHiring 工具环境后执行：

```powershell
. E:\develop\tools\DreamHiring-DevEnv\Activate-DreamHiringEnv.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy\Build-Release.ps1
```

脚本会依次执行前端安装、前端测试、前端生产构建、后端测试与打包，然后生成：

```text
deploy/releases/dreamhiring-yyyyMMdd-HHmmss/
├── backend.jar
├── frontend/
├── deploy/
│   ├── dreamhiring.conf
│   ├── dreamhiring-backend.service
│   ├── .env.production.example
│   └── db/
└── release-manifest.json
```

构建期间必须停止占用 `backend/target` 中 JAR 的本地后端进程，否则 Windows 无法替换旧 JAR。发布目录已加入 `.gitignore`。

## 服务器目录

推荐使用以下目录：

| 内容 | 路径 |
|---|---|
| 前端静态文件 | `/srv/dreamhiring/frontend` |
| 后端 JAR | `/opt/dreamhiring/backend.jar` |
| 后端环境变量 | `/etc/dreamhiring/dreamhiring.env` |
| 后端日志 | `/var/log/dreamhiring/backend.log` |
| Nginx 站点配置 | `/etc/nginx/conf.d/dreamhiring.conf` |
| systemd 服务 | `/etc/systemd/system/dreamhiring-backend.service` |

## 首次部署

1. 安装 JDK 21、MySQL 8、Redis、RabbitMQ 和 Nginx。
2. 创建无登录权限的 `dreamhiring` 系统用户及上述目录。
3. 首次部署执行 `deploy/db/mysql-schema.sql`；已有数据库升级执行 `deploy/db/upgrade-dead-letter.sql`。
4. 将发布包中的 `frontend/` 上传到 `/srv/dreamhiring/frontend`。
5. 将 `backend.jar` 上传到 `/opt/dreamhiring/backend.jar`。
6. 复制 `.env.production.example` 为 `/etc/dreamhiring/dreamhiring.env`，填写真实配置并执行 `chmod 600`。
7. 将 `dreamhiring.conf` 放入 `/etc/nginx/conf.d/`。
8. 将 `dreamhiring-backend.service` 放入 `/etc/systemd/system/`。
9. 执行 `systemctl daemon-reload`、`systemctl enable --now dreamhiring-backend` 和 `nginx -t`。
10. Nginx 配置验证通过后执行 `systemctl reload nginx`。

生产后端默认只监听 `127.0.0.1:8080`，外部流量统一从 Nginx 进入。前端使用同源 `/api`，生产环境不再依赖浏览器跨域。

## HTTPS

仓库只提供 HTTP 反向代理基线。正式暴露公网前必须配置 TLS：

- 使用云负载均衡或 Nginx `ssl_certificate` 终止 HTTPS。
- 将 HTTP 80 重定向到 HTTPS。
- 将实际域名加入 `DREAMHIRING_CORS_ALLOWED_ORIGINS`；同源部署时只保留正式域名即可。
- 定期续期证书并验证 `Strict-Transport-Security` 响应头。

## 验证

```bash
systemctl status dreamhiring-backend
journalctl -u dreamhiring-backend -n 100 --no-pager
nginx -t
curl -fsS http://127.0.0.1:8080/api/stats/dashboard
curl -fsS http://127.0.0.1/api/stats/dashboard
```

更新发布时先上传新 JAR 和前端静态文件，再执行 `systemctl restart dreamhiring-backend` 和 `systemctl reload nginx`。保留上一个发布目录即可快速回滚。
