# DreamHiring Frontend

招聘平台前端工程，基于 Vue 3、Vite、Element Plus、ECharts、Pinia 和 Axios。

## 运行

```powershell
npm install
npm run dev
```

开发环境默认使用本地 Mock 数据，无需启动后端。

## 验证

```powershell
npm test
npm run build
```

## 目录结构

```text
src/
├── api/          # Axios 封装、接口模块、Mock 数据与处理器
├── components/   # 复用组件
├── layouts/      # 登录后主布局
├── router/       # 路由与角色守卫
├── stores/       # Pinia 状态
├── views/        # 求职者、企业、管理员、数据大屏和登录页
├── utils/        # 常量与格式化函数
└── test/         # Vitest 单测
```

## Mock 开关

- `.env.development` 中 `VITE_USE_MOCK=true` 时使用本地 Mock。
- 改为 `false` 后通过 Axios 请求真实后端，接口契约与 `docs/api/openapi.json` 一致。

演示账号：

- 求职者：`linzhixia / dreamhiring`
- 企业：`chenyu_hr / dreamhiring`
- 管理员：`admin_zhou / dreamhiring`
