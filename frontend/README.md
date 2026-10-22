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
- 新建 `.env.development.local` 并设置 `VITE_USE_MOCK=false` 后，通过 Axios 请求真实后端。
- 本地真实联调建议同时设置 `VITE_API_BASE_URL=http://localhost:8080/api`，避免 Vite 开发服务器把 `/api` 当作自身路径。
- 真实模式不会显示 Mock 角色切换，三个身份需要使用各自账号登录。
- 登录页从后端加载图形验证码；验证码失败会刷新，账号密码错误的 401 只展示表单错误，不会触发全局退出跳转。

演示账号：

- 求职者：`linzhixia / dreamhiring`
- 企业：`chenyu_hr / dreamhiring`
- 管理员：`admin_zhou / dreamhiring`
