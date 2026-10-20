(() => {
  "use strict";

  const icon = (name, className = "") =>
    `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const roles = {
    seeker: {
      key: "seeker",
      label: "求职者",
      shortLabel: "求职者视角",
      icon: "users",
      name: "林知夏",
      meta: "产品设计师 · 杭州",
      avatar: "林",
      home: "seeker/home",
    },
    company: {
      key: "company",
      label: "企业 HR",
      shortLabel: "企业视角",
      icon: "company",
      name: "陈屿",
      meta: "星云科技 · HRBP",
      avatar: "陈",
      home: "company/home",
    },
    admin: {
      key: "admin",
      label: "平台管理员",
      shortLabel: "管理视角",
      icon: "shield",
      name: "周宁",
      meta: "平台运营管理员",
      avatar: "周",
      home: "admin/home",
    },
  };

  const navs = {
    seeker: [
      { group: "求职工作台", label: "首页", icon: "home", route: "seeker/home" },
      { group: "求职工作台", label: "职位广场", icon: "search", route: "seeker/jobs" },
      { group: "求职工作台", label: "我的投递", icon: "send", route: "seeker/applications", badge: "apps" },
      { group: "个人中心", label: "在线简历", icon: "file", route: "seeker/resume" },
      { group: "个人中心", label: "消息中心", icon: "message", route: "seeker/messages", badge: "messages" },
      { group: "洞察", label: "行业招聘洞察", icon: "chart", route: "dashboard" },
    ],
    company: [
      { group: "招聘工作台", label: "招聘概览", icon: "grid", route: "company/home" },
      { group: "招聘工作台", label: "职位管理", icon: "briefcase", route: "company/jobs" },
      { group: "人才管理", label: "候选人流程", icon: "users", route: "company/candidates", badge: "candidates" },
      { group: "企业设置", label: "企业主页", icon: "company", route: "company/profile" },
      { group: "企业设置", label: "消息中心", icon: "message", route: "company/messages", badge: "messages" },
    ],
    admin: [
      { group: "平台总览", label: "管理驾驶舱", icon: "grid", route: "admin/home" },
      { group: "内容治理", label: "职位审核", icon: "shield", route: "admin/audits", badge: "audits" },
      { group: "用户与组织", label: "用户管理", icon: "users", route: "admin/users" },
      { group: "用户与组织", label: "企业管理", icon: "company", route: "admin/companies" },
      { group: "内容治理", label: "分类与公告", icon: "message", route: "admin/content" },
      { group: "洞察", label: "全局数据看板", icon: "chart", route: "dashboard" },
    ],
  };

  const pageMeta = {
    "seeker/home": ["求职工作台", "首页"],
    "seeker/jobs": ["职位广场", "职位检索"],
    "seeker/applications": ["求职工作台", "我的投递"],
    "seeker/resume": ["个人中心", "在线简历"],
    "seeker/messages": ["个人中心", "消息中心"],
    "company/home": ["招聘工作台", "招聘概览"],
    "company/jobs": ["招聘工作台", "职位管理"],
    "company/candidates": ["人才管理", "候选人流程"],
    "company/profile": ["企业设置", "企业主页"],
    "company/messages": ["企业设置", "消息中心"],
    "admin/home": ["平台总览", "管理驾驶舱"],
    "admin/audits": ["内容治理", "职位审核"],
    "admin/users": ["用户与组织", "用户管理"],
    "admin/companies": ["用户与组织", "企业管理"],
    "admin/content": ["内容治理", "分类与公告"],
  };

  const jobs = [
    {
      id: 1,
      title: "高级产品设计师",
      company: "星云科技",
      logo: "星",
      logoClass: "",
      city: "杭州",
      district: "滨江区",
      salaryMin: 25,
      salaryMax: 38,
      education: "本科",
      experience: "3-5年",
      industry: "企业服务",
      size: "500-999人",
      match: 92,
      skills: ["Figma", "B端产品", "设计系统", "用户研究"],
      perks: ["弹性工作", "双休", "年度体检"],
      summary: "负责企业协同产品的体验设计，参与从需求洞察到设计落地的完整链路。",
      duties: [
        "负责协同办公产品核心模块的体验设计与视觉表达。",
        "与产品、研发共同拆解复杂业务，输出可落地的交互方案。",
        "推动设计系统在业务线的落地并持续沉淀组件规范。",
      ],
      requirements: [
        "3 年以上 B 端产品设计经验，有设计系统实践优先。",
        "具备完整的产品思维与用户研究能力，能独立推进项目。",
        "熟悉 Figma，作品集能清晰呈现设计推导过程。",
      ],
      updated: "2 小时前",
      views: 328,
      hot: true,
    },
    {
      id: 2,
      title: "用户研究专家",
      company: "屿光互娱",
      logo: "屿",
      logoClass: "company-logo--coral",
      city: "上海",
      district: "徐汇区",
      salaryMin: 22,
      salaryMax: 32,
      education: "本科",
      experience: "3-5年",
      industry: "互联网娱乐",
      size: "1000-9999人",
      match: 88,
      skills: ["用户研究", "访谈", "数据分析", "Figma"],
      perks: ["内容社区", "健身房", "下午茶"],
      summary: "从用户洞察出发，为泛娱乐产品提供体验策略和决策依据。",
      duties: [
        "设计并执行定性与定量研究项目，输出可行动的用户洞察。",
        "建立用户体验指标，持续跟踪核心体验变化。",
        "与设计、产品团队协作，推动研究结论进入产品决策。",
      ],
      requirements: [
        "具备 3 年以上用户研究经验，熟悉常见研究方法。",
        "有较强的数据分析、访谈和洞察表达能力。",
        "有内容社区或泛娱乐产品经验优先。",
      ],
      updated: "今天",
      views: 216,
      hot: true,
    },
    {
      id: 3,
      title: "产品经理（AI 方向）",
      company: "墨川智能",
      logo: "墨",
      logoClass: "company-logo--mint",
      city: "深圳",
      district: "南山区",
      salaryMin: 30,
      salaryMax: 45,
      education: "硕士",
      experience: "3-5年",
      industry: "人工智能",
      size: "100-499人",
      match: 86,
      skills: ["B端产品", "AI产品", "数据分析", "用户研究"],
      perks: ["期权激励", "弹性工作", "技术分享"],
      summary: "面向企业客户设计 AI 工作流产品，连接模型能力与真实业务场景。",
      duties: [
        "负责 AI 应用产品的需求分析、产品规划与版本推进。",
        "深入客户业务场景，抽象通用工作流与能力边界。",
        "协同算法与工程团队完成产品验证、上线和迭代。",
      ],
      requirements: [
        "3 年以上 B 端产品经验，有 AI 产品落地经验优先。",
        "对生成式 AI 的能力和边界有系统理解。",
        "优秀的逻辑分析、沟通协作和项目推进能力。",
      ],
      updated: "1 天前",
      views: 412,
      hot: true,
    },
    {
      id: 4,
      title: "UX 设计师",
      company: "见山出行",
      logo: "见",
      logoClass: "company-logo--amber",
      city: "杭州",
      district: "余杭区",
      salaryMin: 18,
      salaryMax: 28,
      education: "本科",
      experience: "1-3年",
      industry: "交通出行",
      size: "500-999人",
      match: 84,
      skills: ["交互设计", "用户研究", "Figma", "设计系统"],
      perks: ["通勤补贴", "双休", "年度旅游"],
      summary: "参与智能出行服务设计，让每一次出发都更简单、更从容。",
      duties: [
        "负责出行产品核心流程的交互体验设计。",
        "围绕真实场景开展概念验证与可用性测试。",
        "与品牌、研发共同保障多端体验的一致性。",
      ],
      requirements: [
        "1 年以上互联网产品体验设计经验。",
        "熟练使用 Figma，具备良好的视觉与交互基础。",
        "关注细节，有较强的同理心和沟通能力。",
      ],
      updated: "1 天前",
      views: 197,
      hot: false,
    },
    {
      id: 5,
      title: "交互设计师",
      company: "云栖数据",
      logo: "云",
      logoClass: "company-logo--slate",
      city: "北京",
      district: "海淀区",
      salaryMin: 20,
      salaryMax: 30,
      education: "本科",
      experience: "1-3年",
      industry: "数据服务",
      size: "100-499人",
      match: 81,
      skills: ["交互设计", "B端产品", "设计系统", "数据分析"],
      perks: ["六险一金", "技术分享", "弹性工作"],
      summary: "设计数据产品中复杂信息的组织与表达，让数据真正被理解和使用。",
      duties: [
        "负责数据平台复杂操作的交互设计与体验优化。",
        "与产品经理一起定义信息架构与关键使用路径。",
        "参与数据可视化规范的建立和复用。",
      ],
      requirements: [
        "1 年以上 B 端交互设计经验。",
        "具备较强的信息架构和逻辑梳理能力。",
        "有数据产品或可视化项目经验优先。",
      ],
      updated: "2 天前",
      views: 154,
      hot: false,
    },
    {
      id: 6,
      title: "产品运营",
      company: "山野生活",
      logo: "山",
      logoClass: "company-logo--rose",
      city: "成都",
      district: "高新区",
      salaryMin: 12,
      salaryMax: 18,
      education: "大专",
      experience: "1-3年",
      industry: "生活方式",
      size: "50-99人",
      match: 76,
      skills: ["用户运营", "数据分析", "内容策划"],
      perks: ["弹性工作", "宠物友好", "月度团建"],
      summary: "和一群热爱山野的人一起，把户外生活方式带给更多年轻用户。",
      duties: [
        "负责核心用户社群的运营与活跃度提升。",
        "策划主题活动并跟踪数据表现，持续优化运营策略。",
        "收集用户反馈并协同产品团队推进体验改进。",
      ],
      requirements: [
        "1 年以上用户运营或内容运营经验。",
        "有数据意识，能够独立完成活动复盘。",
        "热爱户外生活方式，沟通表达自然。",
      ],
      updated: "3 天前",
      views: 132,
      hot: false,
    },
    {
      id: 7,
      title: "设计系统工程师",
      company: "白屿软件",
      logo: "白",
      logoClass: "",
      city: "上海",
      district: "静安区",
      salaryMin: 26,
      salaryMax: 40,
      education: "本科",
      experience: "3-5年",
      industry: "企业服务",
      size: "100-499人",
      match: 79,
      skills: ["设计系统", "TypeScript", "Vue", "Figma"],
      perks: ["开源文化", "弹性工作", "年度体检"],
      summary: "连接设计与工程，建设高质量、可演进的企业级设计系统。",
      duties: [
        "负责设计系统组件库的研发与维护。",
        "建设设计 Token 与多端适配方案。",
        "推动业务团队采用规范并持续治理历史资产。",
      ],
      requirements: [
        "3 年以上前端或设计工程经验。",
        "熟悉 Vue、TypeScript 和组件化开发。",
        "有设计系统或组件库建设经验优先。",
      ],
      updated: "3 天前",
      views: 189,
      hot: true,
    },
    {
      id: 8,
      title: "产品设计实习生",
      company: "时序实验室",
      logo: "时",
      logoClass: "company-logo--mint",
      city: "杭州",
      district: "西湖区",
      salaryMin: 5,
      salaryMax: 8,
      education: "本科",
      experience: "应届",
      industry: "人工智能",
      size: "20-49人",
      match: 73,
      skills: ["Figma", "交互设计", "用户研究"],
      perks: ["导师制", "转正机会", "弹性工作"],
      summary: "在真实产品项目中快速成长，和资深设计师一起探索 AI 原生体验。",
      duties: [
        "参与产品需求讨论与竞品体验分析。",
        "完成界面设计、交互原型和设计走查。",
        "协助整理设计资产与用户研究材料。",
      ],
      requirements: [
        "设计相关专业在读，每周可实习 4 天以上。",
        "熟悉 Figma，有完整课程或个人项目作品。",
        "对 AI 产品与交互体验有强烈好奇心。",
      ],
      updated: "今天",
      views: 261,
      hot: true,
    },
  ];

  const initialApplications = [
    { id: 1, jobId: 1, status: "邀面试", score: 92, time: "2026-10-20 09:30", update: "今天 09:30" },
    { id: 2, jobId: 4, status: "已查看", score: 84, time: "2026-10-19 16:20", update: "昨天 16:20" },
    { id: 3, jobId: 5, status: "待查看", score: 81, time: "2026-10-18 11:08", update: "2 天前" },
    { id: 4, jobId: 3, status: "不合适", score: 86, time: "2026-10-16 14:45", update: "4 天前" },
  ];

  const initialMessages = [
    {
      id: 1,
      type: "投递反馈",
      title: "星云科技邀请你参加产品设计师面试",
      preview: "你好，知夏。你的作品集与我们的产品设计岗位非常匹配，想邀请你参加第一轮面试。",
      content: [
        "你好，知夏：",
        "你的作品集与我们的高级产品设计师岗位非常匹配。我们尤其认可你在 B 端产品复杂流程和设计系统方面的经验。",
        "想邀请你参加第一轮线上面试，预计 45 分钟，主要围绕项目经历和设计方法展开。你可以从下方选择合适的时间。",
      ],
      meta: "星云科技 · 陈屿",
      time: "今天 09:30",
      unread: true,
      tone: "blue",
    },
    {
      id: 2,
      type: "智能推荐",
      title: "本周有 12 个新职位与你高度匹配",
      preview: "根据你的技能标签「设计系统、B端产品、用户研究」，系统为你筛选了新的匹配职位。",
      content: [
        "本周职位广场新增 126 个产品设计相关职位，其中有 12 个职位与你的技能和求职意向高度匹配。",
        "其中「墨川智能 · 产品经理（AI 方向）」与你的匹配度达到 86%，建议优先查看。",
      ],
      meta: "DreamHiring 智能助手",
      time: "昨天 18:10",
      unread: true,
      tone: "mint",
    },
    {
      id: 3,
      type: "系统公告",
      title: "2026 秋季招聘服务保障说明",
      preview: "平台已开启秋招专项保障，职位审核和举报处理将在工作日 2 小时内响应。",
      content: [
        "为保障秋季招聘期间求职者和企业的使用体验，平台已开启秋招专项服务保障。",
        "职位审核、企业资质核验与举报处理将在工作日 2 小时内响应。如遇异常信息，可通过职位详情页的举报入口反馈。",
      ],
      meta: "平台运营团队",
      time: "10 月 18 日",
      unread: false,
      tone: "amber",
    },
    {
      id: 4,
      type: "投递反馈",
      title: "见山出行已查看你的简历",
      preview: "你的简历已被招聘方查看，如有进一步安排，企业会通过站内信联系你。",
      content: [
        "你投递的「见山出行 · UX 设计师」职位已被招聘方查看。",
        "企业通常会在 3 个工作日内完成初步筛选。你也可以继续关注其他高匹配职位。",
      ],
      meta: "见山出行 · 招聘团队",
      time: "昨天 16:20",
      unread: false,
      tone: "blue",
    },
  ];

  const initialResume = {
    name: "林知夏",
    title: "产品设计师 / 4 年经验",
    city: "杭州",
    phone: "138 **** 6271",
    email: "zhixia.lin@example.com",
    education: "本科 · 视觉传达设计",
    experience: "4 年",
    expectedCity: "杭州 / 上海",
    expectedSalary: "25-35K",
    jobStatus: "在职，考虑机会",
    summary:
      "4 年 B 端产品体验设计经验，擅长将复杂业务抽象为清晰、可扩展的产品体验。主导过企业协同、数据分析类产品从 0 到 1 的设计工作，并推动设计系统在 3 条业务线落地。",
    skills: ["Figma", "B端产品", "设计系统", "用户研究", "交互设计", "数据分析", "原型设计"],
    attachment: "林知夏_产品设计师_2026.pdf",
  };

  const companyJobs = [
    { id: 101, title: "高级产品设计师", status: "招聘中", applicants: 24, newCount: 6, updated: "今天 10:24", city: "杭州", salary: "25-38K" },
    { id: 102, title: "产品经理（AI 方向）", status: "招聘中", applicants: 18, newCount: 3, updated: "昨天 17:40", city: "杭州", salary: "30-45K" },
    { id: 103, title: "UX 设计师", status: "招聘中", applicants: 11, newCount: 2, updated: "10 月 18 日", city: "上海", salary: "18-28K" },
    { id: 104, title: "设计实习生", status: "已下线", applicants: 32, newCount: 0, updated: "10 月 12 日", city: "杭州", salary: "5-8K" },
    { id: 105, title: "用户研究专家", status: "待审核", applicants: 0, newCount: 0, updated: "10 月 19 日", city: "杭州", salary: "22-32K" },
  ];

  const initialCandidates = [
    { id: 201, name: "林知夏", role: "高级产品设计师", companyJob: "高级产品设计师", status: "待查看", score: 92, exp: "4 年", city: "杭州", skills: ["Figma", "B端产品", "设计系统"], time: "今天 09:12" },
    { id: 202, name: "许言", role: "产品设计师", companyJob: "高级产品设计师", status: "已查看", score: 88, exp: "5 年", city: "上海", skills: ["交互设计", "设计系统", "用户研究"], time: "今天 08:45" },
    { id: 203, name: "周予安", role: "AI 产品经理", companyJob: "产品经理（AI 方向）", status: "邀面试", score: 90, exp: "4 年", city: "深圳", skills: ["AI产品", "B端产品", "数据分析"], time: "昨天 16:30" },
    { id: 204, name: "唐可", role: "体验设计师", companyJob: "UX 设计师", status: "待查看", score: 85, exp: "3 年", city: "杭州", skills: ["Figma", "交互设计", "用户研究"], time: "昨天 14:20" },
    { id: 205, name: "陈墨", role: "用户研究员", companyJob: "用户研究专家", status: "已查看", score: 82, exp: "5 年", city: "北京", skills: ["访谈", "数据分析", "可用性测试"], time: "10 月 19 日" },
    { id: 206, name: "苏野", role: "产品设计师", companyJob: "高级产品设计师", status: "不合适", score: 68, exp: "2 年", city: "成都", skills: ["Figma", "视觉设计", "原型设计"], time: "10 月 18 日" },
    { id: 207, name: "顾南", role: "交互设计师", companyJob: "UX 设计师", status: "待查看", score: 80, exp: "3 年", city: "上海", skills: ["交互设计", "设计系统", "原型设计"], time: "10 月 18 日" },
  ];

  const initialAudits = [
    { id: 301, title: "高级前端工程师", company: "云迹网络", type: "新发布", status: "待审核", submitted: "今天 10:42", risk: "低风险", salary: "22-35K" },
    { id: 302, title: "海外市场运营", company: "星河跨境", type: "职位更新", status: "待审核", submitted: "今天 10:16", risk: "需关注", salary: "15-25K" },
    { id: 303, title: "销售顾问（高提成）", company: "启点咨询", type: "新发布", status: "待审核", submitted: "今天 09:51", risk: "需关注", salary: "8-20K" },
    { id: 304, title: "数据分析师", company: "数澜科技", type: "新发布", status: "待审核", submitted: "昨天 18:22", risk: "低风险", salary: "18-28K" },
    { id: 305, title: "UI 设计师", company: "白屿软件", type: "职位更新", status: "已通过", submitted: "昨天 15:08", risk: "低风险", salary: "16-24K" },
    { id: 306, title: "兼职打字员", company: "独立发布", type: "新发布", status: "已驳回", submitted: "昨天 11:34", risk: "高风险", salary: "面议" },
  ];

  const users = [
    { id: 401, name: "林知夏", account: "linzhixia", role: "求职者", status: "正常", created: "2026-09-18", lastActive: "刚刚", avatar: "林", tone: "" },
    { id: 402, name: "陈屿", account: "chenyu_hr", role: "企业用户", status: "正常", created: "2026-08-06", lastActive: "2 分钟前", avatar: "陈", tone: "coral" },
    { id: 403, name: "许言", account: "xuyan_pd", role: "求职者", status: "正常", created: "2026-10-02", lastActive: "18 分钟前", avatar: "许", tone: "mint" },
    { id: 404, name: "周予安", account: "zhouyuan_ai", role: "求职者", status: "已禁用", created: "2026-07-12", lastActive: "3 天前", avatar: "周", tone: "amber" },
    { id: 405, name: "唐可", account: "tangke_ux", role: "求职者", status: "正常", created: "2026-09-29", lastActive: "1 小时前", avatar: "唐", tone: "rose" },
  ];

  const companies = [
    { id: 501, name: "星云科技", industry: "企业服务", city: "杭州", scale: "500-999人", status: "已认证", jobs: 12, owner: "陈屿", updated: "今天 10:24", logo: "星", tone: "" },
    { id: 502, name: "墨川智能", industry: "人工智能", city: "深圳", scale: "100-499人", status: "已认证", jobs: 8, owner: "宋禾", updated: "昨天 17:12", logo: "墨", tone: "mint" },
    { id: 503, name: "见山出行", industry: "交通出行", city: "杭州", scale: "500-999人", status: "待认证", jobs: 4, owner: "沈舟", updated: "昨天 14:05", logo: "见", tone: "amber" },
    { id: 504, name: "启点咨询", industry: "企业咨询", city: "成都", scale: "20-49人", status: "需复核", jobs: 6, owner: "王启", updated: "10 月 18 日", logo: "启", tone: "rose" },
  ];

  const initialAnnouncements = [
    { id: 601, title: "2026 秋季招聘服务保障说明", status: "已发布", channel: "全平台", published: "2026-10-18 10:00", author: "周宁", summary: "秋招期间职位审核、企业资质核验与举报处理将在工作日 2 小时内响应。" },
    { id: 602, title: "平台职位信息发布规范更新", status: "已发布", channel: "企业用户", published: "2026-10-16 15:30", author: "周宁", summary: "新增薪资范围、工作地点和试用期信息填写要求，进一步提升职位透明度。" },
    { id: 603, title: "国庆假期客服值班安排", status: "已下线", channel: "全平台", published: "2026-09-28 09:00", author: "李澈", summary: "国庆假期期间在线客服服务时间调整为每日 09:00-18:00。" },
  ];

  const categories = [
    { name: "产品 / 设计", count: 1286, children: ["产品经理", "UI 设计师", "交互设计师", "用户研究"] },
    { name: "技术 / 研发", count: 3428, children: ["前端开发", "后端开发", "算法工程师", "测试"] },
    { name: "数据 / 分析", count: 894, children: ["数据分析师", "数据产品", "数据开发"] },
    { name: "运营 / 市场", count: 1562, children: ["产品运营", "内容运营", "市场推广"] },
  ];

  const companyMessages = [
    {
      id: 701,
      type: "候选人动态",
      title: "林知夏已接受面试邀请",
      preview: "候选人已确认参加 10 月 22 日 14:00 的第一轮面试，请提前安排面试官。",
      content: [
        "你好，陈屿：",
        "候选人林知夏已接受「高级产品设计师」岗位的面试邀请。",
        "面试时间：2026 年 10 月 22 日 14:00；形式：线上会议。请提前确认面试官并发送会议链接。",
      ],
      meta: "候选人 · 林知夏",
      time: "今天 10:02",
      unread: true,
      tone: "mint",
    },
    {
      id: 702,
      type: "职位审核",
      title: "「用户研究专家」正在审核中",
      preview: "平台预计将在 2 小时内完成审核，审核通过后职位会自动上架。",
      content: [
        "你发布的「用户研究专家」职位已提交平台审核。",
        "当前状态：审核中。预计 2 小时内完成，审核通过后将自动上架并进入职位广场。",
      ],
      meta: "平台运营团队",
      time: "昨天 17:40",
      unread: false,
      tone: "amber",
    },
  ];

  const state = {
    route: "seeker/home",
    role: "seeker",
    sidebarOpen: false,
    applications: initialApplications.map((item) => ({ ...item })),
    messages: initialMessages.map((item) => ({ ...item })),
    companyMessages: companyMessages.map((item) => ({ ...item })),
    resume: { ...initialResume, skills: [...initialResume.skills] },
    savedJobs: [],
    filters: {
      keyword: "",
      city: "不限",
      salary: "不限",
      education: "不限",
      experience: "不限",
    },
    applicationTab: "全部",
    activeMessageId: 1,
    activeCompanyMessageId: 701,
    candidateFilter: "全部",
    companyJobs: companyJobs.map((item) => ({ ...item })),
    candidates: initialCandidates.map((item) => ({ ...item })),
    auditTab: "待审核",
    audits: initialAudits.map((item) => ({ ...item })),
    userTab: "全部",
    companyTab: "全部",
    announcements: initialAnnouncements.map((item) => ({ ...item })),
    modal: null,
    loginTab: "login",
    loginRole: "seeker",
  };

  function getRoleFromRoute(route) {
    const first = route.split("/")[0];
    return roles[first] ? first : state.role;
  }

  function parseRoute() {
    const raw = window.location.hash.replace(/^#\/?/, "");
    return raw || state.route;
  }

  function navigate(route) {
    const next = route.replace(/^#?\/?/, "");
    if (window.location.hash === `#/${next}`) {
      state.route = next;
      renderApp();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = `#/${next}`;
  }

  function currentBaseRoute() {
    const parts = state.route.split("/");
    if (parts[0] === "seeker" && parts[1] === "jobs" && parts[2]) {
      return "seeker/jobs";
    }
    return parts.slice(0, 2).join("/");
  }

  function avatar(name, size = "md", tone = "") {
    return `<span class="avatar avatar--${size} ${tone ? `avatar--${tone}` : ""}" aria-hidden="true">${escapeHtml(name)}</span>`;
  }

  function companyLogo(job, large = false) {
    return `<span class="company-logo ${job.logoClass || ""} ${large ? "company-logo--large" : ""}" aria-hidden="true">${escapeHtml(job.logo || job.company?.slice(0, 1) || "企")}</span>`;
  }

  function statusBadge(status) {
    const toneMap = {
      待查看: "amber",
      已查看: "blue",
      邀面试: "mint",
      不合适: "rose",
      招聘中: "mint",
      已下线: "default",
      待审核: "amber",
      已通过: "mint",
      已驳回: "rose",
      已认证: "mint",
      待认证: "amber",
      需复核: "rose",
      正常: "mint",
      已禁用: "rose",
      已发布: "mint",
      待面试: "blue",
    };
    const tone = toneMap[status] || "default";
    const cls = tone === "default" ? "" : `badge--${tone}`;
    return `<span class="badge ${cls}"><span class="dot"></span>${escapeHtml(status)}</span>`;
  }

  function scoreRing(score, color = "var(--brand)") {
    return `<div class="score-ring" style="--score:${Number(score)};--ring-color:${color}"><span class="score-ring__value">${score}<small>%</small></span></div>`;
  }

  function unreadCount(messages) {
    return messages.filter((item) => item.unread).length;
  }

  function navBadge(type) {
    if (type === "messages") return unreadCount(state.messages);
    if (type === "apps") return state.applications.filter((item) => item.status !== "不合适").length;
    if (type === "candidates") return state.candidates.filter((item) => item.status === "待查看").length;
    if (type === "audits") return state.audits.filter((item) => item.status === "待审核").length;
    return 0;
  }

  function renderSidebar(roleKey) {
    const nav = navs[roleKey];
    const role = roles[roleKey];
    const activeBase = currentBaseRoute();
    const groups = [...new Set(nav.map((item) => item.group))];
    let html = `
      <aside class="sidebar" aria-label="主导航">
        <a class="brand" href="#/${role.home}" data-route="${role.home}" aria-label="DreamHiring 首页">
          <span class="brand-mark">${icon("spark")}</span>
          <span>
            <span class="brand-name">DreamHiring</span>
            <span class="brand-sub">DREAM · HIRING</span>
          </span>
        </a>
        <div class="role-card">
          <span class="role-card__icon">${icon(role.icon)}</span>
          <span>
            <span class="role-card__label">当前演示身份</span>
            <span class="role-card__name">${role.label}</span>
          </span>
          <button class="role-card__switch" type="button" data-action="next-role" aria-label="切换演示角色" title="切换角色">
            ${icon("chevron")}
          </button>
        </div>
    `;

    groups.forEach((group) => {
      html += `<div class="sidebar-label">${group}</div><nav class="nav-list">`;
      nav
        .filter((item) => item.group === group)
        .forEach((item) => {
          const count = item.badge ? navBadge(item.badge) : 0;
          const isActive = item.route === "dashboard" ? false : item.route === activeBase;
          html += `
            <a class="nav-item ${isActive ? "is-active" : ""}" href="#/${item.route}" data-route="${item.route}" ${isActive ? 'aria-current="page"' : ""}>
              ${icon(item.icon)}
              <span>${item.label}</span>
              ${count ? `<span class="nav-item__badge">${count}</span>` : ""}
            </a>
          `;
        });
      html += `</nav>`;
      if (group !== groups[groups.length - 1]) html += `<div class="nav-divider"></div>`;
    });

    html += `
        <div class="sidebar-foot">
          <div class="help-card">
            <div class="help-card__title">${icon("spark")} 原型演示提示</div>
            <p class="help-card__copy">所有数据均为模拟数据，可通过右上角切换三种角色体验完整业务链路。</p>
            <span class="help-card__link" data-route="dashboard" role="link" tabindex="0">查看招聘洞察 ${icon("arrow")}</span>
          </div>
          <div class="sidebar-user">
            ${avatar(role.avatar, "sm", roleKey === "company" ? "coral" : roleKey === "admin" ? "slate" : "")}
            <div class="sidebar-user__copy">
              <div class="sidebar-user__name">${role.name}</div>
              <div class="sidebar-user__role">${role.meta}</div>
            </div>
            <button class="role-card__switch" type="button" data-action="logout" aria-label="退出登录" title="退出登录">${icon("logout")}</button>
          </div>
        </div>
      </aside>
    `;
    return html;
  }

  function renderTopbar(roleKey) {
    const role = roles[roleKey];
    const meta = pageMeta[currentBaseRoute()] || ["DreamHiring", "页面"];
    const messageCount = unreadCount(roleKey === "company" ? state.companyMessages : state.messages);
    const messageRoute = roleKey === "company" ? "company/messages" : roleKey === "admin" ? "admin/content" : "seeker/messages";
    return `
      <header class="topbar">
        <button class="mobile-menu" type="button" data-action="toggle-sidebar" aria-label="打开导航">${icon("menu")}</button>
        <div class="topbar-context">
          <span class="topbar-context__root">${meta[0]}</span>
          ${icon("chevron-right")}
          <span class="topbar-context__current">${meta[1]}</span>
        </div>
        <form class="topbar-search" data-form="global-search" role="search">
          ${icon("search", "icon--sm")}
          <input type="search" name="keyword" aria-label="全局搜索" placeholder="${roleKey === "company" ? "搜索职位或候选人" : roleKey === "admin" ? "搜索用户、企业或职位" : "搜索职位、公司或技能"}">
          <span class="topbar-search__key">Enter</span>
        </form>
        <div class="role-switch">
          <button class="role-switch__button" type="button" data-action="toggle-role-menu" aria-haspopup="menu" aria-expanded="false">
            <span class="prototype-chip">DEMO</span>
            <span>${role.shortLabel}</span>
            ${icon("chevron", "icon--sm")}
          </button>
          <div class="role-menu" role="menu" aria-label="切换演示角色">
            <div class="role-menu__label">选择要体验的角色</div>
            ${Object.values(roles)
              .map(
                (item) => `
                  <button class="role-option ${item.key === roleKey ? "is-active" : ""}" type="button" data-action="switch-role" data-role="${item.key}" role="menuitem">
                    <span class="role-option__icon">${icon(item.icon)}</span>
                    <span>
                      <span class="role-option__name">${item.label}</span>
                      <span class="role-option__desc">${item.meta}</span>
                    </span>
                    <span class="role-option__check">${icon("check")}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <button class="topbar-icon" type="button" data-route="${messageRoute}" aria-label="消息中心">
          ${icon("bell", "icon--sm")}
          ${messageCount ? '<span class="topbar-icon__dot"></span>' : ""}
        </button>
        <div class="topbar-user">
          ${avatar(role.avatar, "md", roleKey === "company" ? "coral" : roleKey === "admin" ? "slate" : "")}
          <div class="topbar-user__copy">
            <div class="topbar-user__name">${role.name}</div>
            <div class="topbar-user__role">${role.label}</div>
          </div>
        </div>
      </header>
    `;
  }

  function renderShell(content, roleKey) {
    document.body.className = state.sidebarOpen ? "sidebar-open" : "";
    document.getElementById("app").innerHTML = `
      <div class="app-shell">
        ${renderSidebar(roleKey)}
        <div class="workspace">
          ${renderTopbar(roleKey)}
          <main class="view" id="main-content">${content}</main>
        </div>
      </div>
    `;
  }

  function renderPageHeading(eyebrow, title, description, actions = "") {
    return `
      <div class="page-heading">
        <div>
          <div class="page-heading__eyebrow">${eyebrow}</div>
          <h1>${title}</h1>
          ${description ? `<p>${description}</p>` : ""}
        </div>
        ${actions ? `<div class="page-heading__actions">${actions}</div>` : ""}
      </div>
    `;
  }

  function metricCard({ label, value, suffix = "", iconName, tone = "", foot, toneClass = "" }) {
    return `
      <div class="metric-card">
        <div class="metric-card__top">
          <span class="metric-card__label">${label}</span>
          <span class="metric-card__icon ${toneClass}">${icon(iconName, "icon--sm")}</span>
        </div>
        <div class="metric-card__value">${value}${suffix ? `<small>${suffix}</small>` : ""}</div>
        <div class="metric-card__foot ${tone}">${foot || ""}</div>
      </div>
    `;
  }

  function jobCard(job, variant = "list") {
    const isApplied = state.applications.some((item) => item.jobId === job.id);
    const isSaved = state.savedJobs.includes(job.id);
    return `
      <article class="job-card" data-job-id="${job.id}">
        ${companyLogo(job)}
        <div class="job-card__main">
          <div class="job-card__title-row">
            <button class="job-card__title" type="button" data-route="seeker/jobs/${job.id}" style="border:0;background:transparent;padding:0;text-align:left;cursor:pointer">${job.title}</button>
            <span class="job-card__salary">${job.salaryMin}-${job.salaryMax}K</span>
            ${isApplied ? '<span class="badge badge--mint">已投递</span>' : ""}
          </div>
          <div class="job-card__company">${job.company} <span style="font-weight:400;color:var(--muted)">· ${job.industry} · ${job.size}</span></div>
          <div class="job-card__meta">
            <span>${icon("pin")}${job.city} · ${job.district}</span>
            <span>${icon("graduation")}${job.education}</span>
            <span>${icon("briefcase")}${job.experience}</span>
          </div>
          <div class="job-card__tags">
            ${job.skills.slice(0, 4).map((skill) => `<span class="mini-tag ${state.resume.skills.includes(skill) ? "mini-tag--match" : ""}">${skill}</span>`).join("")}
            ${job.perks.slice(0, 2).map((perk) => `<span class="mini-tag">${perk}</span>`).join("")}
          </div>
        </div>
        <div class="job-card__side">
          <div class="match-pill">${icon("magic", "icon--sm")}匹配 <strong>${job.match}%</strong></div>
          <div class="job-card__side-bottom">
            <span class="job-card__age">${job.updated}</span>
            <button class="icon-btn ${isSaved ? "is-saved" : ""}" type="button" data-action="save-job" data-id="${job.id}" aria-label="${isSaved ? "取消收藏" : "收藏职位"}">
              ${icon("bookmark", "icon--sm")}
            </button>
            <button class="btn btn--sm btn--soft" type="button" data-route="seeker/jobs/${job.id}">
              ${variant === "compact" ? "查看" : "查看详情"} ${icon("arrow", "icon--sm")}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderSeekerHome() {
    const activeApps = state.applications.filter((item) => !["不合适"].includes(item.status));
    const interviewCount = state.applications.filter((item) => item.status === "邀面试").length;
    const recommendedJobs = [jobs[0], jobs[2], jobs[3], jobs[6]];
    return `
      ${renderPageHeading(
        "2026.10.20 · 周二",
        "早上好，知夏",
        "今天有 12 个新职位与你的技能高度匹配，继续向理想工作靠近。",
        `<button class="btn" type="button" data-route="seeker/resume">${icon("file", "icon--sm")} 完善简历</button>
         <button class="btn btn--primary" type="button" data-route="seeker/jobs">${icon("search", "icon--sm")} 浏览职位</button>`,
      )}
      <section class="hero">
        <div class="hero-copy">
          <span class="hero-eyebrow">${icon("spark")} 基于技能标签的智能人岗匹配</span>
          <h1>下一份理想工作，<br><em>从一次更懂你的搜索开始。</em></h1>
          <p class="hero-lead">聚合优质职位与真实招聘反馈，让匹配理由可见，让每一次投递更有把握。</p>
          <form class="hero-search" data-form="hero-search">
            <label class="hero-search__field">
              ${icon("search")}
              <input name="keyword" type="search" value="${escapeHtml(state.filters.keyword)}" placeholder="搜索职位、公司或技能" aria-label="职位关键词">
            </label>
            <label class="hero-search__field">
              ${icon("pin")}
              <select name="city" aria-label="工作城市">
                ${["不限", "杭州", "上海", "北京", "深圳", "成都"].map((city) => `<option ${state.filters.city === city ? "selected" : ""}>${city}</option>`).join("")}
              </select>
            </label>
            <label class="hero-search__field">
              ${icon("coin")}
              <select name="salary" aria-label="薪资范围">
                ${["不限", "10K以上", "15K以上", "20K以上", "30K以上"].map((salary) => `<option ${state.filters.salary === salary ? "selected" : ""}>${salary}</option>`).join("")}
              </select>
            </label>
            <button class="btn btn--primary" type="submit">${icon("search", "icon--sm")} 找工作</button>
          </form>
          <div class="hero-tags">
            <span>热门搜索</span>
            ${["产品设计师", "AI产品经理", "用户研究", "设计系统"].map((tag) => `<button type="button" data-action="quick-search" data-value="${tag}">${tag}</button>`).join("")}
          </div>
        </div>
        <div class="hero-visual" aria-label="智能匹配示例">
          <div class="match-float">
            <div class="match-float__top">
              ${companyLogo(jobs[0])}
              <div>
                <div class="match-float__company">${jobs[0].company}</div>
                <div class="match-float__title">${jobs[0].title}</div>
              </div>
              <div class="match-float__score">${icon("spark", "icon--sm")}<strong>${jobs[0].match}%</strong></div>
            </div>
            <div class="match-float__skills">
              ${jobs[0].skills.map((skill, index) => `<span class="mini-tag ${index < 4 ? "mini-tag--match" : ""}">${skill}</span>`).join("")}
            </div>
            <div class="match-float__foot">
              <span class="match-float__salary">${jobs[0].salaryMin}-${jobs[0].salaryMax}K</span>
              <span class="match-float__avatars">
                ${avatar("周", "sm", "mint")}${avatar("许", "sm", "amber")}${avatar("唐", "sm", "rose")}
              </span>
            </div>
          </div>
          <div class="floating-note">
            <span class="floating-note__icon">${icon("check", "icon--sm")}</span>
            <span>已为你过滤 38 个低匹配职位</span>
          </div>
        </div>
      </section>
      <div class="metric-grid">
        ${metricCard({ label: "简历完整度", value: "86", suffix: "%", iconName: "file", foot: '<span class="up">较上周 +8%</span><span>· 再补充项目经历</span>' })}
        ${metricCard({ label: "高匹配新职位", value: "12", suffix: "个", iconName: "spark", toneClass: "metric-card__icon--mint", foot: '<span class="up">↑ 4</span><span>较昨日新增</span>' })}
        ${metricCard({ label: "进行中的投递", value: String(activeApps.length), suffix: "个", iconName: "send", toneClass: "metric-card__icon--amber", foot: `<span>${interviewCount} 个进入面试阶段</span>` })}
        ${metricCard({ label: "未读消息", value: String(unreadCount(state.messages)), suffix: "条", iconName: "message", toneClass: "metric-card__icon--coral", foot: '<span>其中 1 条面试邀请</span>' })}
      </div>
      <div class="home-grid">
        <section>
          <div class="section-head">
            <div>
              <h2>为你精选</h2>
              <p>综合技能、经验和求职意向，为你优先推荐</p>
            </div>
            <button class="text-link" type="button" data-route="seeker/jobs">查看全部职位 ${icon("arrow")}</button>
          </div>
          <div class="job-stack">
            ${recommendedJobs.map((job) => jobCard(job, "compact")).join("")}
          </div>
        </section>
        <aside class="side-stack">
          <div class="side-card">
            <div class="side-card__head">
              <h3>投递进展</h3>
              <span>近 7 天</span>
            </div>
            <div class="progress-list">
              <div class="progress-item is-live">
                <span class="progress-item__dot">${icon("calendar")}</span>
                <div>
                  <div class="progress-item__title">星云科技 · 邀你面试</div>
                  <div class="progress-item__desc">请确认面试时间，建议提前准备作品集讲解</div>
                </div>
                <span class="progress-item__time">09:30</span>
              </div>
              <div class="progress-item is-done">
                <span class="progress-item__dot">${icon("eye")}</span>
                <div>
                  <div class="progress-item__title">见山出行 · 已查看简历</div>
                  <div class="progress-item__desc">招聘方正在评估你的项目经历</div>
                </div>
                <span class="progress-item__time">昨天</span>
              </div>
              <div class="progress-item">
                <span class="progress-item__dot">${icon("send")}</span>
                <div>
                  <div class="progress-item__title">云栖数据 · 等待查看</div>
                  <div class="progress-item__desc">投递已送达，预计 3 个工作日内反馈</div>
                </div>
                <span class="progress-item__time">2 天前</span>
              </div>
            </div>
            <button class="btn btn--soft btn--sm btn--block" type="button" data-route="seeker/applications" style="margin-top:13px">查看全部投递</button>
          </div>
          <div class="side-card">
            <div class="side-card__head">
              <h3>简历竞争力</h3>
              <span>已超过 78% 同类用户</span>
            </div>
            <div class="completion">
              ${scoreRing(86, "var(--mint)")}
              <div>
                <h4>再完善 2 项，竞争力更高</h4>
                <p>补充量化项目成果、上传最新作品集附件，更容易获得面试机会。</p>
                <button class="text-link" type="button" data-action="open-modal" data-modal="resume">去完善 ${icon("arrow")}</button>
              </div>
            </div>
          </div>
          <div class="side-card">
            <div class="side-card__head">
              <h3>正在热招</h3>
              <button class="text-link" type="button" data-route="seeker/jobs">更多</button>
            </div>
            <div class="mini-company-list">
              ${[jobs[2], jobs[1], jobs[6]].map((job) => `
                <button class="mini-company" type="button" data-route="seeker/jobs/${job.id}" style="border:0;background:transparent;padding:0;width:100%;text-align:left;cursor:pointer">
                  ${companyLogo(job)}
                  <span>
                    <span class="mini-company__name">${job.company}</span>
                    <span class="mini-company__meta">${job.industry} · ${job.city}</span>
                  </span>
                  <span class="mini-company__count">${job.views} 热度</span>
                </button>
              `).join("")}
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  function filterJobs() {
    const keyword = state.filters.keyword.trim().toLowerCase();
    const minSalary = Number.parseInt(state.filters.salary, 10) || 0;
    return jobs.filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.industry} ${job.skills.join(" ")}`.toLowerCase();
      if (keyword && !searchable.includes(keyword)) return false;
      if (state.filters.city !== "不限" && job.city !== state.filters.city) return false;
      if (minSalary && job.salaryMax < minSalary) return false;
      if (state.filters.education !== "不限" && job.education !== state.filters.education) return false;
      if (state.filters.experience !== "不限" && job.experience !== state.filters.experience) return false;
      return true;
    });
  }

  function activeFilterChips() {
    return Object.entries(state.filters)
      .filter(([key, value]) => value && value !== "不限" && !(key === "keyword" && !value))
      .map(([key, value]) => `
        <span class="filter-chip">
          ${key === "keyword" ? "关键词" : key === "city" ? "城市" : key === "salary" ? "薪资" : key === "education" ? "学历" : "经验"}：${escapeHtml(value)}
          <button type="button" data-action="remove-filter" data-filter="${key}" aria-label="移除筛选" style="border:0;background:transparent;padding:0;color:inherit;cursor:pointer">${icon("x")}</button>
        </span>
      `)
      .join("");
  }

  function renderJobs() {
    const result = filterJobs();
    return `
      ${renderPageHeading(
        "JOB DISCOVERY",
        "找到真正适合你的下一站",
        "多条件组合筛选，结合简历技能标签展示可解释的匹配度。",
        `<button class="btn" type="button" data-action="open-modal" data-modal="resume">${icon("file", "icon--sm")} 查看匹配简历</button>`,
      )}
      <form class="filter-panel" data-form="job-filter">
        <div class="filter-grid">
          <label class="field">
            ${icon("search")}
            <input type="search" name="keyword" value="${escapeHtml(state.filters.keyword)}" placeholder="职位、公司或技能关键词">
          </label>
          <label class="field">
            ${icon("pin")}
            <select name="city" aria-label="城市">
              ${["不限", "杭州", "上海", "北京", "深圳", "成都"].map((value) => `<option ${state.filters.city === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            ${icon("coin")}
            <select name="salary" aria-label="薪资">
              ${["不限", "10K以上", "15K以上", "20K以上", "30K以上"].map((value) => `<option ${state.filters.salary === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            ${icon("graduation")}
            <select name="education" aria-label="学历">
              ${["不限", "大专", "本科", "硕士"].map((value) => `<option ${state.filters.education === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            ${icon("briefcase")}
            <select name="experience" aria-label="经验">
              ${["不限", "应届", "1-3年", "3-5年", "5-10年"].map((value) => `<option ${state.filters.experience === value ? "selected" : ""}>${value}</option>`).join("")}
            </select>
          </label>
          <button class="btn btn--primary" type="submit">${icon("filter", "icon--sm")} 筛选</button>
        </div>
      </form>
      <div class="filter-summary">
        <div class="filter-summary__result">为你找到 <strong>${result.length}</strong> 个职位 <span>· 按匹配度综合排序</span></div>
        <div class="filter-chips">${activeFilterChips() || '<span class="badge badge--blue">智能匹配已开启</span>'}</div>
      </div>
      ${
        result.length
          ? `<div class="job-list">${result.map((job) => jobCard(job)).join("")}</div>`
          : `<div class="empty-state"><span class="empty-state__icon">${icon("search", "icon--lg")}</span><h3>没有找到符合条件的职位</h3><p>试试减少筛选条件，或者换一个关键词。平台会根据你的简历持续推荐合适职位。</p><button class="btn btn--primary" type="button" data-action="reset-filters">清除全部筛选</button></div>`
      }
    `;
  }

  function renderJobDetail(jobId) {
    const job = jobs.find((item) => item.id === Number(jobId));
    if (!job) {
      return `<div class="empty-state"><span class="empty-state__icon">${icon("briefcase", "icon--lg")}</span><h3>职位不存在或已下线</h3><p>返回职位广场继续浏览其他机会。</p><button class="btn btn--primary" data-route="seeker/jobs">返回职位广场</button></div>`;
    }
    const matchedSkills = job.skills.filter((skill) => state.resume.skills.includes(skill));
    const applied = state.applications.find((item) => item.jobId === job.id);
    const similar = jobs.filter((item) => item.id !== job.id).slice(0, 2);
    return `
      <button class="detail-back" type="button" data-route="seeker/jobs">${icon("arrow")} 返回职位列表</button>
      <div class="detail-layout">
        <div class="detail-main">
          <section class="detail-hero">
            <div class="detail-hero__top">
              ${companyLogo(job)}
              <div>
                <div class="detail-hero__company">${job.company} · ${job.industry} · ${job.size}</div>
                <h1>${job.title}</h1>
              </div>
              <div class="detail-hero__salary">${job.salaryMin}-${job.salaryMax}K</div>
            </div>
            <div class="detail-hero__meta">
              <span>${icon("pin")}${job.city} · ${job.district}</span>
              <span>${icon("graduation")}${job.education}</span>
              <span>${icon("briefcase")}${job.experience}</span>
              <span>${icon("eye")}${job.views} 人浏览</span>
              <span>${icon("clock")}${job.updated}更新</span>
            </div>
          </section>
          <section class="content-card">
            <h2>职位介绍</h2>
            <p>${job.summary}</p>
            <h3>你将负责</h3>
            <ul class="bullet-list">${job.duties.map((item) => `<li>${item}</li>`).join("")}</ul>
            <h3>我们希望你具备</h3>
            <ul class="bullet-list">${job.requirements.map((item) => `<li>${item}</li>`).join("")}</ul>
            <h3>技能标签</h3>
            <div class="skill-cloud">
              ${job.skills.map((skill) => `<span class="skill-tag ${matchedSkills.includes(skill) ? "is-match" : ""}">${matchedSkills.includes(skill) ? icon("check") : ""}${skill}</span>`).join("")}
            </div>
          </section>
          <section class="content-card">
            <h2>工作地点与福利</h2>
            <div style="display:flex;gap:20px;flex-wrap:wrap">
              <div style="flex:1;min-width:230px">
                <h3 style="margin-top:0">工作地点</h3>
                <p>${job.city}市 ${job.district} · 地铁步行 8 分钟</p>
                <div style="height:98px;margin-top:10px;border-radius:10px;background:linear-gradient(135deg,#eef3ff,#f8faff);position:relative;overflow:hidden">
                  <div style="position:absolute;inset:18px 22px;border:1px solid #dfe6f7;border-radius:8px;transform:rotate(-4deg)"></div>
                  <div style="position:absolute;left:44%;top:42%;width:9px;height:9px;border:3px solid #fff;border-radius:50%;background:var(--brand);box-shadow:0 0 0 4px rgba(49,85,217,.14)"></div>
                  <span class="badge badge--blue" style="position:absolute;bottom:9px;left:10px">${icon("pin")}${job.district}</span>
                </div>
              </div>
              <div style="flex:1;min-width:230px">
                <h3 style="margin-top:0">福利待遇</h3>
                <p>${job.perks.join(" · ")}</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
                  ${["五险一金", ...job.perks].map((perk) => `<span class="skill-tag">${icon("check")} ${perk}</span>`).join("")}
                </div>
              </div>
            </div>
          </section>
          <section class="content-card">
            <h2>相似职位推荐</h2>
            <div class="job-stack">
              ${similar.map((item) => jobCard(item, "compact")).join("")}
            </div>
          </section>
        </div>
        <aside class="detail-side">
          <div class="match-card">
            <div class="match-card__head">
              ${scoreRing(job.match, "var(--mint)")}
              <div>
                <h3>人岗匹配度 ${job.match}%</h3>
                <p>基于 ${job.skills.length} 个职位技能标签计算</p>
              </div>
            </div>
            <div class="match-card__explain">你的简历覆盖 ${matchedSkills.length}/${job.skills.length} 个核心技能，其中「${matchedSkills.slice(0, 2).join("、")}」与岗位要求高度一致。</div>
            <div class="match-card__tags">
              ${job.skills.map((skill) => `<span class="mini-tag ${matchedSkills.includes(skill) ? "mini-tag--match" : ""}">${skill}</span>`).join("")}
            </div>
            <div class="match-card__foot">${icon("check", "icon--sm")} 匹配度将在投递时生成快照</div>
          </div>
          <div class="company-mini">
            <div class="company-mini__top">
              ${companyLogo(job)}
              <div>
                <h3>${job.company}</h3>
                <p>${job.industry} · ${job.size}</p>
              </div>
            </div>
            <div class="company-mini__stats">
              <div><span>企业认证</span><strong>已认证</strong></div>
              <div><span>在招职位</span><strong>12 个</strong></div>
              <div><span>招聘响应</span><strong>2 小时内</strong></div>
              <div><span>员工规模</span><strong>${job.size}</strong></div>
            </div>
          </div>
          <div class="sticky-action">
            ${
              applied
                ? `<button class="btn btn--soft btn--block" type="button" data-route="seeker/applications">${icon("check", "icon--sm")} 已投递 · 查看进度</button>
                   <div class="sticky-action__note">当前状态：${applied.status} · 投递于 ${applied.time.slice(0, 10)}</div>`
                : `<button class="btn btn--primary btn--lg btn--block" type="button" data-action="apply-job" data-id="${job.id}">${icon("send", "icon--sm")} 立即投递</button>
                   <div class="sticky-action__note">默认使用「${state.resume.name} · 产品设计师」简历</div>`
            }
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px">
              <button class="btn btn--sm ${state.savedJobs.includes(job.id) ? "btn--soft" : ""}" type="button" data-action="save-job" data-id="${job.id}">${icon("bookmark", "icon--sm")} ${state.savedJobs.includes(job.id) ? "已收藏" : "收藏"}</button>
              <button class="btn btn--sm" type="button" data-action="copy-job-link">${icon("link", "icon--sm")} 分享</button>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderApplications() {
    const tabs = ["全部", "待查看", "已查看", "邀面试", "不合适"];
    const filtered =
      state.applicationTab === "全部"
        ? state.applications
        : state.applications.filter((item) => item.status === state.applicationTab);
    const interviewCount = state.applications.filter((item) => item.status === "邀面试").length;
    const viewedCount = state.applications.filter((item) => item.status === "已查看").length;
    return `
      ${renderPageHeading(
        "APPLICATION TRACKER",
        "我的投递",
        "跟踪每一次投递的进展，面试邀请和状态变更会同步到站内消息。",
        `<button class="btn" type="button" data-route="seeker/messages">${icon("message", "icon--sm")} 查看反馈</button>
         <button class="btn btn--primary" type="button" data-route="seeker/jobs">${icon("search", "icon--sm")} 继续找工作</button>`,
      )}
      <div class="application-summary">
        <div class="summary-tile">
          <span class="summary-tile__icon">${icon("send")}</span>
          <div><div class="summary-tile__label">累计投递</div><div class="summary-tile__value">${state.applications.length} <small style="font-size:9px;color:var(--muted)">个职位</small></div></div>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__icon summary-tile__icon--mint">${icon("eye")}</span>
          <div><div class="summary-tile__label">企业已查看</div><div class="summary-tile__value">${viewedCount} <small style="font-size:9px;color:var(--muted)">个</small></div></div>
        </div>
        <div class="summary-tile">
          <span class="summary-tile__icon summary-tile__icon--amber">${icon("calendar")}</span>
          <div><div class="summary-tile__label">面试邀约</div><div class="summary-tile__value">${interviewCount} <small style="font-size:9px;color:var(--muted)">个</small></div></div>
        </div>
      </div>
      <div class="status-tabs">
        ${tabs
          .map((tab) => {
            const count = tab === "全部" ? state.applications.length : state.applications.filter((item) => item.status === tab).length;
            return `<button class="status-tab ${state.applicationTab === tab ? "is-active" : ""}" type="button" data-action="set-application-tab" data-value="${tab}">${tab}<span class="tab__count">${count}</span></button>`;
          })
          .join("")}
      </div>
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-toolbar__title">${state.applicationTab === "全部" ? "全部投递记录" : state.applicationTab}</span>
          <span class="table-toolbar__spacer"></span>
          <span style="display:flex;align-items:center;gap:5px;color:var(--muted);font-size:9px">${icon("clock", "icon--sm")} 状态以企业反馈为准</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>职位 / 企业</th><th>匹配度</th><th>投递时间</th><th>当前状态</th><th>最近更新</th><th>操作</th></tr></thead>
            <tbody>
              ${
                filtered.length
                  ? filtered
                      .map((application) => {
                        const job = jobs.find((item) => item.id === application.jobId);
                        return `
                          <tr>
                            <td>
                              <div class="table-main">
                                ${companyLogo(job)}
                                <div>
                                  <div class="table-main__title">${job.title}</div>
                                  <div class="table-main__sub">${job.company} · ${job.city}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="match-cell"><strong>${application.score}%</strong><span class="match-bar"><span style="width:${application.score}%"></span></span></div>
                            </td>
                            <td>${application.time.slice(0, 10)}</td>
                            <td>${statusBadge(application.status)}</td>
                            <td>${application.update}</td>
                            <td><button class="table-link" type="button" data-route="seeker/jobs/${job.id}">查看职位</button></td>
                          </tr>
                        `;
                      })
                      .join("")
                  : `<tr><td colspan="6"><div class="table-empty">当前状态下暂无投递记录</div></td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
      ${
        interviewCount
          ? `<section class="content-card" style="margin-top:14px">
              <div class="section-head" style="margin-bottom:10px">
                <div><h2 style="font-size:14px">近期面试安排</h2><p>面试前建议准备 1 个完整项目案例，并提前测试设备。</p></div>
                <span class="badge badge--mint">${icon("calendar")} 1 场待确认</span>
              </div>
              <div style="display:flex;align-items:center;gap:13px;padding:13px;border:1px solid var(--line);border-radius:11px;background:var(--panel-soft)">
                ${companyLogo(jobs[0])}
                <div style="min-width:0">
                  <div style="color:var(--ink);font-size:11px;font-weight:800">星云科技 · 高级产品设计师 · 第一轮</div>
                  <div style="display:flex;flex-wrap:wrap;gap:12px;color:var(--muted);font-size:9px;margin-top:3px">
                    <span>${icon("calendar", "icon--sm")} 10 月 22 日 14:00</span><span>${icon("clock", "icon--sm")} 预计 45 分钟</span><span>${icon("link", "icon--sm")} 线上会议</span>
                  </div>
                </div>
                <button class="btn btn--primary btn--sm" type="button" data-route="seeker/messages" style="margin-left:auto">查看详情</button>
              </div>
            </section>`
          : ""
      }
    `;
  }

  function renderResume() {
    const resume = state.resume;
    return `
      ${renderPageHeading(
        "ONLINE RESUME",
        "在线简历",
        "简历中的技能标签将用于人岗匹配计算，保持信息准确可以获得更精准的推荐。",
        `<button class="btn" type="button" data-action="open-modal" data-modal="resume">${icon("download", "icon--sm")} 预览附件</button>
         <button class="btn btn--primary" type="button" data-action="open-modal" data-modal="resume">${icon("file", "icon--sm")} 编辑简历</button>`,
      )}
      <div class="resume-layout">
        <aside>
          <div class="profile-card">
            ${avatar("林", "xl", "")}
            <h2>${resume.name}</h2>
            <p class="profile-card__headline">${resume.title}</p>
            <span class="profile-card__status">${icon("check", "icon--sm")} 简历公开，企业可搜索</span>
            <div class="profile-details">
              <div class="profile-detail">${icon("pin")}<span>当前城市</span><strong>${resume.city}</strong></div>
              <div class="profile-detail">${icon("graduation")}<span>最高学历</span><strong>本科</strong></div>
              <div class="profile-detail">${icon("briefcase")}<span>工作经验</span><strong>${resume.experience}</strong></div>
              <div class="profile-detail">${icon("coin")}<span>期望薪资</span><strong>${resume.expectedSalary}</strong></div>
            </div>
            <button class="btn btn--soft btn--sm btn--block" type="button" data-action="open-modal" data-modal="resume" style="margin-top:14px">编辑个人信息</button>
          </div>
          <div class="tips-card">
            <h3>${icon("spark")} 简历优化建议</h3>
            <ul>
              <li>为项目补充可量化结果，例如效率提升、用户规模或业务增长。</li>
              <li>作品集中的职责描述与目标岗位技能标签保持一致。</li>
              <li>最近一份经历放在最前面，突出与产品设计相关的产出。</li>
            </ul>
          </div>
        </aside>
        <div class="resume-main">
          <section class="resume-card">
            <div class="resume-card__head">
              <h3>${icon("user")} 个人简介</h3>
              <span class="badge badge--mint">${icon("eye")} 最近更新于今天</span>
            </div>
            <p class="resume-description">${resume.summary}</p>
            <div class="resume-meta-grid">
              <div class="resume-meta"><span>求职状态</span><strong>${resume.jobStatus}</strong></div>
              <div class="resume-meta"><span>期望城市</span><strong>${resume.expectedCity}</strong></div>
              <div class="resume-meta"><span>联系电话</span><strong>${resume.phone}</strong></div>
            </div>
          </section>
          <section class="resume-card">
            <div class="resume-card__head">
              <h3>${icon("spark")} 核心技能标签</h3>
              <button class="text-link" type="button" data-action="open-modal" data-modal="resume">管理标签 ${icon("arrow")}</button>
            </div>
            <div class="skill-cloud">
              ${resume.skills.map((skill) => `<span class="skill-tag is-match">${icon("check")}${skill}</span>`).join("")}
              <button class="skill-tag" type="button" data-action="open-modal" data-modal="resume" style="cursor:pointer;color:var(--brand);border-style:dashed">${icon("plus")} 添加技能</button>
            </div>
            <p style="margin-top:10px;color:var(--muted);font-size:8.5px">提示：技能标签将参与 MatchService 权重重合度计算，新增标签前请确认具备真实项目经验。</p>
          </section>
          <section class="resume-card">
            <div class="resume-card__head">
              <h3>${icon("briefcase")} 工作经历</h3>
              <button class="text-link" type="button" data-action="open-modal" data-modal="resume">编辑 ${icon("arrow")}</button>
            </div>
            <div style="display:flex;gap:12px">
              <span class="company-logo company-logo--slate" style="width:38px;height:38px;border-radius:10px;font-size:12px">云</span>
              <div>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:7px">
                  <strong style="color:var(--ink);font-size:11px">云舟软件 · 产品设计师</strong>
                  <span class="badge">2022.06 - 至今</span>
                </div>
                <p style="margin-top:5px;color:#5d697c;font-size:10px;line-height:1.7">负责企业协同产品的体验设计，主导审批、知识库与数据看板 3 个核心模块重构。推动设计系统覆盖 3 条业务线，组件复用率提升 42%。</p>
              </div>
            </div>
            <div style="display:flex;gap:12px;margin-top:15px">
              <span class="company-logo company-logo--mint" style="width:38px;height:38px;border-radius:10px;font-size:12px">时</span>
              <div>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:7px">
                  <strong style="color:var(--ink);font-size:11px">时序实验室 · 交互设计师</strong>
                  <span class="badge">2020.07 - 2022.05</span>
                </div>
                <p style="margin-top:5px;color:#5d697c;font-size:10px;line-height:1.7">参与数据分析工具从 0 到 1 的设计工作，完成 20+ 高频分析场景的交互方案，核心任务完成效率提升 31%。</p>
              </div>
            </div>
          </section>
          <section class="resume-card">
            <div class="resume-card__head">
              <h3>${icon("file")} 简历附件</h3>
              <span class="badge badge--blue">PDF</span>
            </div>
            <div class="attachment-card">
              <span class="attachment-card__icon">${icon("file")}</span>
              <div>
                <div class="attachment-card__name">${resume.attachment}</div>
                <div class="attachment-card__meta">1.8 MB · 更新于 2026-10-20</div>
              </div>
              <div class="attachment-card__actions">
                <button class="icon-btn" type="button" data-action="show-toast" data-message="简历预览已打开（原型演示）" aria-label="预览附件">${icon("eye", "icon--sm")}</button>
                <button class="icon-btn" type="button" data-action="show-toast" data-message="简历下载已开始（原型演示）" aria-label="下载附件">${icon("download", "icon--sm")}</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function renderMessages(roleKey = "seeker") {
    const isCompany = roleKey === "company";
    const source = isCompany ? state.companyMessages : state.messages;
    const activeId = isCompany ? state.activeCompanyMessageId : state.activeMessageId;
    const active = source.find((item) => item.id === activeId) || source[0];
    const unread = unreadCount(source);
    const title = isCompany ? "企业消息" : "消息中心";
    const description = isCompany
      ? "候选人动态、职位审核结果和平台通知会集中展示在这里。"
      : "面试邀约、投递反馈与平台公告会集中展示在这里。";
    return `
      ${renderPageHeading(
        "MESSAGE CENTER",
        title,
        description,
        `<span class="badge badge--blue">${unread} 条未读</span>
         <button class="btn" type="button" data-action="mark-all-read" data-role="${roleKey}">${icon("check", "icon--sm")} 全部标为已读</button>`,
      )}
      <div class="message-layout">
        <section class="message-list">
          <div class="message-list__head">
            <h2>全部消息</h2>
            <span class="badge">${source.length} 条</span>
          </div>
          ${source
            .map(
              (message) => `
                <button class="message-item ${message.id === active.id ? "is-active" : ""} ${message.unread ? "is-unread" : ""}" type="button" data-action="select-message" data-role="${roleKey}" data-id="${message.id}">
                  <span class="message-item__icon ${message.tone === "mint" ? "message-item__icon--mint" : message.tone === "amber" ? "message-item__icon--amber" : ""}">
                    ${icon(message.type === "投递反馈" || message.type === "候选人动态" ? "calendar" : message.type === "智能推荐" ? "spark" : "message", "icon--sm")}
                  </span>
                  <span class="message-item__body">
                    <span class="message-item__top">
                      <span class="message-item__title">${message.title}</span>
                      <span class="message-item__time">${message.time}</span>
                      ${message.unread ? '<span class="unread-dot"></span>' : ""}
                    </span>
                    <span class="message-item__preview">${message.preview}</span>
                  </span>
                </button>
              `,
            )
            .join("")}
        </section>
        <section class="message-detail">
          <div class="message-detail__head">
            <h2>${active.title}</h2>
            <div class="message-detail__meta">
              <span class="badge badge--blue">${active.type}</span>
              <span>${active.meta}</span>
              <span>·</span>
              <span>${active.time}</span>
            </div>
          </div>
          <div class="message-detail__content">
            ${active.content.map((paragraph) => `<p>${paragraph}</p>`).join("")}
            ${
              active.type === "投递反馈" && !isCompany
                ? `<div class="message-callout"><strong>面试时间：</strong>10 月 22 日（周四）14:00<br><strong>面试形式：</strong>线上视频会议 · 预计 45 分钟<br><strong>面试官：</strong>产品设计负责人 + HRBP</div>
                   <p>如果时间不合适，可以在 10 月 21 日 18:00 前通过站内信回复可调整的时间段。</p>`
                : ""
            }
            ${
              active.type === "候选人动态" && isCompany
                ? `<div class="message-callout"><strong>候选人：</strong>林知夏 · 高级产品设计师<br><strong>面试时间：</strong>10 月 22 日 14:00<br><strong>当前阶段：</strong>第一轮业务面试</div>`
                : ""
            }
          </div>
          <div class="message-detail__foot">
            ${
              isCompany
                ? `<button class="btn btn--primary btn--sm" type="button" data-route="company/candidates">查看候选人</button>
                   <button class="btn btn--sm" type="button" data-action="show-toast" data-message="已打开面试日程（原型演示）">安排面试</button>`
                : `<button class="btn btn--primary btn--sm" type="button" data-route="seeker/applications">查看投递进度</button>
                   <button class="btn btn--sm" type="button" data-action="show-toast" data-message="已为你打开可预约的面试时间（原型演示）">确认面试时间</button>`
            }
            <button class="btn btn--ghost btn--sm" type="button" data-action="show-toast" data-message="该消息已加入收藏（原型演示）">${icon("bookmark", "icon--sm")} 收藏</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderCompanyHome() {
    const activeJobs = state.companyJobs.filter((item) => item.status === "招聘中").length;
    const newCandidates = state.candidates.filter((item) => item.status === "待查看").length;
    const interviews = state.candidates.filter((item) => item.status === "邀面试").length;
    const avgScore = Math.round(
      state.candidates.reduce((total, item) => total + item.score, 0) / Math.max(state.candidates.length, 1),
    );
    return `
      ${renderPageHeading(
        "RECRUITING OVERVIEW",
        "招聘工作台",
        "掌握职位曝光、候选人进展和团队协作重点，及时推进每一个高匹配人才。",
        `<button class="btn" type="button" data-route="company/profile">${icon("company", "icon--sm")} 企业主页</button>
         <button class="btn btn--primary" type="button" data-action="open-modal" data-modal="job">${icon("plus", "icon--sm")} 发布职位</button>`,
      )}
      <section class="company-hero">
        <div class="company-hero__content">
          <span class="company-hero__badge">${icon("check", "icon--sm")} 企业已认证 · 招聘中</span>
          <h1>陈屿，今天有 ${newCandidates} 位新候选人<br>等待你的关注。</h1>
          <p>星云科技当前有 ${activeJobs} 个职位正在招聘。其中「高级产品设计师」近 7 天投递量增长 24%，建议优先处理待查看候选人。</p>
          <div class="company-hero__actions">
            <button class="btn btn--accent" type="button" data-route="company/candidates">${icon("users", "icon--sm")} 处理候选人</button>
            <button class="btn" type="button" data-route="company/jobs">${icon("briefcase", "icon--sm")} 管理职位</button>
          </div>
        </div>
        <div class="funnel-card" aria-label="招聘转化漏斗">
          <div class="funnel-card__head"><span>近 30 天招聘漏斗</span><span>整体转化 6.2%</span></div>
          <div class="funnel-bars">
            ${[
              { label: "曝光", value: "8.4k", height: 94 },
              { label: "投递", value: "126", height: 64 },
              { label: "面试", value: "18", height: 39 },
              { label: "录用", value: "6", height: 23 },
            ]
              .map(
                (item) => `
                  <div class="funnel-bar">
                    <div class="funnel-bar__value">${item.value}</div>
                    <div class="funnel-bar__track"><div class="funnel-bar__fill" style="height:${item.height}%"></div></div>
                    <div class="funnel-bar__label">${item.label}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
      <div class="company-metrics">
        ${metricCard({ label: "在招职位", value: String(activeJobs), suffix: "个", iconName: "briefcase", foot: `<span class="up">↑ 1</span><span>本周新增</span>` })}
        ${metricCard({ label: "待查看候选人", value: String(newCandidates), suffix: "位", iconName: "users", toneClass: "metric-card__icon--coral", foot: '<span>平均响应 3.2 小时</span>' })}
        ${metricCard({ label: "面试进行中", value: String(interviews), suffix: "场", iconName: "calendar", toneClass: "metric-card__icon--amber", foot: '<span>最近一场 · 10 月 22 日</span>' })}
        ${metricCard({ label: "候选人平均匹配度", value: String(avgScore), suffix: "%", iconName: "spark", toneClass: "metric-card__icon--mint", foot: '<span class="up">↑ 5%</span><span>较上月</span>' })}
      </div>
      <div class="company-layout">
        <section class="panel">
          <div class="panel__head">
            <div><h2>招聘中的职位</h2><p>按近 7 天投递活跃度排序</p></div>
            <button class="text-link" type="button" data-route="company/jobs">全部职位 ${icon("arrow")}</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>职位</th><th>状态</th><th>投递</th><th>待处理</th><th>最近更新</th><th></th></tr></thead>
              <tbody>
                ${state.companyJobs
                  .slice(0, 4)
                  .map(
                    (job) => `
                      <tr>
                        <td><div class="table-main__title">${job.title}</div><div class="table-main__sub">${job.city} · ${job.salary}</div></td>
                        <td>${statusBadge(job.status)}</td>
                        <td>${job.applicants}</td>
                        <td>${job.newCount ? `<span class="badge badge--coral">${job.newCount} 位</span>` : "—"}</td>
                        <td>${job.updated}</td>
                        <td><button class="table-link" type="button" data-route="company/candidates">查看</button></td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
        <aside class="side-stack">
          <div class="panel">
            <div class="panel__head">
              <div><h2>最新候选人</h2><p>AI 匹配度优先展示</p></div>
              <button class="text-link" type="button" data-route="company/candidates">全部</button>
            </div>
            <div class="panel__body">
              <div class="mini-company-list">
                ${state.candidates
                  .slice(0, 4)
                  .map(
                    (candidate) => `
                      <button class="mini-company" type="button" data-action="view-candidate" data-id="${candidate.id}" style="border:0;background:transparent;padding:0;width:100%;text-align:left;cursor:pointer">
                        ${avatar(candidate.name.slice(0, 1), "sm", candidate.id % 2 ? "mint" : "amber")}
                        <span>
                          <span class="mini-company__name">${candidate.name} · ${candidate.role}</span>
                          <span class="mini-company__meta">${candidate.exp}经验 · ${candidate.city}</span>
                        </span>
                        <span class="mini-company__count">${candidate.score}%</span>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel__head">
              <div><h2>招聘动态</h2><p>最近 24 小时</p></div>
              <span class="icon-btn" aria-hidden="true">${icon("clock", "icon--sm")}</span>
            </div>
            <div class="panel__body">
              <div class="activity-list">
                <div class="activity-item">
                  <span class="activity-item__dot">${icon("check", "icon--sm")}</span>
                  <div class="activity-item__copy"><p>林知夏接受了高级产品设计师的面试邀请</p><span>12 分钟前</span></div>
                </div>
                <div class="activity-item">
                  <span class="activity-item__dot" style="color:var(--amber);background:var(--amber-soft)">${icon("file", "icon--sm")}</span>
                  <div class="activity-item__copy"><p>「用户研究专家」已提交平台审核</p><span>昨天 17:40</span></div>
                </div>
                <div class="activity-item">
                  <span class="activity-item__dot" style="color:var(--mint);background:var(--mint-soft)">${icon("user", "icon--sm")}</span>
                  <div class="activity-item__copy"><p>3 位新候选人投递了 UX 设计师岗位</p><span>昨天 14:20</span></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderCompanyJobs() {
    const activeCount = state.companyJobs.filter((item) => item.status === "招聘中").length;
    return `
      ${renderPageHeading(
        "JOB MANAGEMENT",
        "职位管理",
        "统一管理职位发布、上下架和审核状态，职位信息变更会实时同步到职位广场。",
        `<button class="btn" type="button" data-action="show-toast" data-message="职位数据导出已开始（原型演示）">${icon("download", "icon--sm")} 导出数据</button>
         <button class="btn btn--primary" type="button" data-action="open-modal" data-modal="job">${icon("plus", "icon--sm")} 发布新职位</button>`,
      )}
      <div class="metric-grid">
        ${metricCard({ label: "职位总数", value: String(state.companyJobs.length), suffix: "个", iconName: "briefcase", foot: '<span>覆盖 3 个招聘方向</span>' })}
        ${metricCard({ label: "正在招聘", value: String(activeCount), suffix: "个", iconName: "trend", toneClass: "metric-card__icon--mint", foot: '<span class="up">状态正常</span>' })}
        ${metricCard({ label: "累计投递", value: String(state.companyJobs.reduce((total, item) => total + item.applicants, 0)), suffix: "份", iconName: "send", toneClass: "metric-card__icon--amber", foot: '<span class="up">↑ 18%</span><span>较上月</span>' })}
        ${metricCard({ label: "待审核", value: String(state.companyJobs.filter((item) => item.status === "待审核").length), suffix: "个", iconName: "shield", toneClass: "metric-card__icon--coral", foot: '<span>预计 2 小时内完成</span>' })}
      </div>
      <div class="table-card" style="margin-top:16px">
        <div class="table-toolbar">
          <span class="table-toolbar__title">全部职位</span>
          <div class="tabs" style="margin-left:8px">
            <button class="tab is-active" type="button">全部</button>
            <button class="tab" type="button" data-action="show-toast" data-message="筛选：招聘中（原型演示）">招聘中</button>
            <button class="tab" type="button" data-action="show-toast" data-message="筛选：待审核（原型演示）">待审核</button>
            <button class="tab" type="button" data-action="show-toast" data-message="筛选：已下线（原型演示）">已下线</button>
          </div>
          <span class="table-toolbar__spacer"></span>
          <label class="field table-search">${icon("search")}<input type="search" placeholder="搜索职位名称" aria-label="搜索职位"></label>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>职位名称</th><th>状态</th><th>投递数</th><th>待处理</th><th>工作地点</th><th>最近更新</th><th>操作</th></tr></thead>
            <tbody>
              ${state.companyJobs
                .map(
                  (job) => `
                    <tr>
                      <td>
                        <div class="table-main__title">${job.title}</div>
                        <div class="table-main__sub">${job.salary} · 全职</div>
                      </td>
                      <td>${statusBadge(job.status)}</td>
                      <td>${job.applicants}</td>
                      <td>${job.newCount ? `<span class="badge badge--coral">${job.newCount} 位待查看</span>` : "—"}</td>
                      <td>${job.city}</td>
                      <td>${job.updated}</td>
                      <td>
                        <div class="table-actions">
                          <button class="btn" type="button" data-route="company/candidates">候选人</button>
                          <button class="btn" type="button" data-action="toggle-job-status" data-id="${job.id}">${job.status === "招聘中" ? "下线" : job.status === "已下线" ? "重新上架" : "查看"}</button>
                          <button class="icon-btn" type="button" data-action="show-toast" data-message="职位编辑入口已打开（原型演示）" aria-label="更多操作">${icon("more", "icon--sm")}</button>
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
      <div class="tips-card" style="margin-top:14px;display:flex;align-items:center;gap:12px">
        <span class="activity-item__dot" style="width:38px;height:38px;flex:none">${icon("spark")}</span>
        <div style="flex:1">
          <h3 style="font-size:11px">提升职位吸引力</h3>
          <p style="margin-top:2px;color:var(--muted);font-size:9px">完整填写技能标签、薪资范围和工作地点的职位，平均投递量提升 32%。</p>
        </div>
        <button class="btn btn--sm" type="button" data-action="open-modal" data-modal="job">立即优化</button>
      </div>
    `;
  }

  function candidateCard(candidate) {
    const statusActions = {
      待查看: [
        ["已查看", "标记已查看"],
        ["邀面试", "邀请面试"],
      ],
      已查看: [
        ["邀面试", "邀请面试"],
        ["不合适", "不合适"],
      ],
      邀面试: [
        ["不合适", "标记不合适"],
      ],
      不合适: [["待查看", "重新激活"]],
    };
    return `
      <article class="candidate-card">
        <div class="candidate-card__top">
          ${avatar(candidate.name.slice(0, 1), "sm", candidate.id % 3 === 0 ? "amber" : candidate.id % 2 ? "mint" : "coral")}
          <div>
            <div class="candidate-card__name">${candidate.name}</div>
            <div class="candidate-card__role">${candidate.exp} · ${candidate.city}</div>
          </div>
          <span class="candidate-card__score">${candidate.score}%</span>
        </div>
        <div class="candidate-card__skills">
          ${candidate.skills.map((skill, index) => `<span class="mini-tag ${index === 0 ? "mini-tag--match" : ""}">${skill}</span>`).join("")}
        </div>
        <div class="candidate-card__foot">
          <span class="candidate-card__time">${candidate.time}</span>
          <div class="candidate-card__actions">
            <button class="btn" type="button" data-action="view-candidate" data-id="${candidate.id}">查看</button>
            ${(statusActions[candidate.status] || [])
              .slice(0, 1)
              .map(([status, label]) => `<button class="btn btn--primary" type="button" data-action="candidate-status" data-id="${candidate.id}" data-status="${status}">${label}</button>`)
              .join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderCompanyCandidates() {
    const statuses = ["待查看", "已查看", "邀面试", "不合适"];
    const columns = state.candidateFilter === "全部" ? statuses : [state.candidateFilter];
    return `
      ${renderPageHeading(
        "TALENT PIPELINE",
        "候选人流程",
        "从简历匹配度出发，快速完成查看、邀面和反馈，所有状态变更都会同步给求职者。",
        `<button class="btn" type="button" data-action="show-toast" data-message="候选人数据导出已开始（原型演示）">${icon("download", "icon--sm")} 导出候选人</button>
         <button class="btn btn--primary" type="button" data-route="company/jobs">${icon("briefcase", "icon--sm")} 查看招聘职位</button>`,
      )}
      <div class="status-tabs">
        ${["全部", ...statuses]
          .map((status) => {
            const count = status === "全部" ? state.candidates.length : state.candidates.filter((item) => item.status === status).length;
            return `<button class="status-tab ${state.candidateFilter === status ? "is-active" : ""}" type="button" data-action="set-candidate-filter" data-value="${status}">${status}<span class="tab__count">${count}</span></button>`;
          })
          .join("")}
      </div>
      <div class="panel" style="margin-bottom:14px">
        <div class="panel__body" style="display:flex;align-items:center;gap:12px;padding:12px 15px">
          <span class="badge badge--blue">${icon("magic")} 智能排序已开启</span>
          <span style="color:var(--muted);font-size:9.5px">按匹配度与最近活跃时间综合排序，高匹配候选人优先展示。</span>
          <span class="table-toolbar__spacer"></span>
          <label class="field table-search">${icon("search")}<input type="search" placeholder="搜索候选人姓名 / 技能" aria-label="搜索候选人"></label>
        </div>
      </div>
      <div class="pipeline-board" style="grid-template-columns:repeat(${columns.length},minmax(210px,1fr))">
        ${columns
          .map((status) => {
            const items = state.candidates.filter((item) => item.status === status);
            return `
              <section class="pipeline-column">
                <div class="pipeline-column__head">
                  <span class="pipeline-column__title"><span class="dot"></span>${status}</span>
                  <span class="pipeline-column__count">${items.length} 位</span>
                </div>
                <div class="pipeline-cards">
                  ${items.length ? items.map(candidateCard).join("") : `<div class="table-empty" style="padding:25px 10px;border:1px dashed var(--line-strong);border-radius:9px;background:#fff">暂无候选人</div>`}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
      <div class="tips-card" style="margin-top:14px">
        <h3>${icon("magic")} 匹配度是如何计算的？</h3>
        <ul>
          <li>系统提取简历技能标签与职位技能标签，计算加权重合度并归一化为 0-100 分。</li>
          <li>匹配度只作为筛选参考，最终决策仍建议结合项目经历、作品集和面试表现。</li>
        </ul>
      </div>
    `;
  }

  function renderCompanyProfile() {
    return `
      ${renderPageHeading(
        "COMPANY PROFILE",
        "企业主页",
        "完善企业资料和品牌信息，提升求职者信任度与职位转化。",
        `<span class="badge badge--mint">${icon("check")} 企业已认证</span>
         <button class="btn btn--primary" type="button" data-action="save-company-profile">${icon("check", "icon--sm")} 保存修改</button>`,
      )}
      <div class="settings-layout">
        <section class="card" style="padding:20px">
          <form data-form="company-profile-form">
            <div class="form-section">
              <h3>基本信息</h3>
              <div class="form-grid">
                <label class="form-group form-group--full">
                  <span class="form-label">企业 Logo <span>*</span></span>
                  <span class="logo-upload">
                    <span class="logo-upload__box">星<span>${icon("upload")}</span></span>
                    <span>
                      <span style="display:block;color:var(--ink-2);font-size:10px;font-weight:700">上传企业 Logo</span>
                      <span class="form-hint">建议 400 × 400 PNG，文件小于 2MB</span>
                    </span>
                  </span>
                </label>
                <label class="form-group">
                  <span class="form-label">企业名称 <span>*</span></span>
                  <span class="field"><input name="companyName" value="星云科技" aria-label="企业名称"></span>
                </label>
                <label class="form-group">
                  <span class="form-label">所属行业 <span>*</span></span>
                  <span class="field"><select name="industry" aria-label="所属行业"><option>企业服务</option><option>人工智能</option><option>互联网娱乐</option></select></span>
                </label>
                <label class="form-group">
                  <span class="form-label">企业规模</span>
                  <span class="field"><select name="scale" aria-label="企业规模"><option>500-999人</option><option>100-499人</option><option>1000-9999人</option></select></span>
                </label>
                <label class="form-group">
                  <span class="form-label">所在城市</span>
                  <span class="field"><input name="city" value="杭州" aria-label="所在城市"></span>
                </label>
                <label class="form-group form-group--full">
                  <span class="form-label">企业简介 <span>*</span></span>
                  <span class="field field--textarea"><textarea name="intro" aria-label="企业简介">星云科技专注于企业协同与数字化办公，为成长型企业提供更简单、更高效的工作方式。我们相信好的产品来自对真实工作场景的深入理解。</textarea></span>
                  <span class="form-hint">建议 80-300 字，突出业务方向、团队特色与人才理念。</span>
                </label>
              </div>
            </div>
            <div class="form-section">
              <h3>招聘联系人</h3>
              <div class="form-grid">
                <label class="form-group"><span class="form-label">联系人</span><span class="field"><input value="陈屿" aria-label="联系人"></span></label>
                <label class="form-group"><span class="form-label">职位</span><span class="field"><input value="HRBP" aria-label="职位"></span></label>
                <label class="form-group"><span class="form-label">联系电话</span><span class="field"><input value="138 **** 2081" aria-label="联系电话"></span></label>
                <label class="form-group"><span class="form-label">联系邮箱</span><span class="field"><input value="hr@nebula.example" aria-label="联系邮箱"></span></label>
              </div>
            </div>
            <div class="form-section">
              <h3>求职者可见信息</h3>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 12px;border:1px solid var(--line);border-radius:9px;background:#fbfcff">
                <div><div style="color:var(--ink-2);font-size:10px;font-weight:700">在职位详情页展示企业主页入口</div><div class="form-hint">求职者可以查看企业介绍、在招职位和认证信息。</div></div>
                <span class="badge badge--mint">${icon("check")} 已开启</span>
              </div>
            </div>
          </form>
        </section>
        <aside>
          <div class="company-profile-preview">
            <span class="company-profile-preview__logo">星</span>
            <h3>星云科技</h3>
            <p>企业服务 · 500-999人 · 杭州</p>
            <div class="company-profile-preview__stats">
              <div><span>在招职位</span><strong>12 个</strong></div>
              <div><span>企业认证</span><strong>已认证</strong></div>
              <div><span>招聘响应</span><strong>2 小时内</strong></div>
              <div><span>近 30 天浏览</span><strong>6,248</strong></div>
            </div>
          </div>
          <div class="tips-card">
            <h3>${icon("spark")} 主页完善建议</h3>
            <ul>
              <li>上传清晰的企业 Logo，可提升职位卡片点击率。</li>
              <li>企业简介中说明团队规模和业务方向，减少候选人的决策成本。</li>
              <li>保持招聘联系人信息有效，避免错过高匹配人才。</li>
            </ul>
          </div>
          <div class="side-card" style="margin-top:12px">
            <div class="side-card__head"><h3>企业资质</h3><span class="badge badge--mint">认证通过</span></div>
            <div class="profile-details" style="margin-top:0;padding-top:0;border-top:0">
              <div class="profile-detail">${icon("shield")}<span>营业执照</span><strong>已核验</strong></div>
              <div class="profile-detail">${icon("company")}<span>企业主体</span><strong>已核验</strong></div>
              <div class="profile-detail">${icon("check")}<span>招聘授权</span><strong>已生效</strong></div>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderAdminHome() {
    const pendingAudits = state.audits.filter((item) => item.status === "待审核");
    return `
      ${renderPageHeading(
        "PLATFORM COMMAND CENTER",
        "管理驾驶舱",
        "聚合平台运营数据、内容治理与用户服务状态，优先处理影响招聘体验的事项。",
        `<button class="btn" type="button" data-route="dashboard">${icon("chart", "icon--sm")} 数据大屏</button>
         <button class="btn btn--primary" type="button" data-route="admin/audits">${icon("shield", "icon--sm")} 处理待审核</button>`,
      )}
      <section class="admin-hero">
        <div class="admin-hero__copy">
          <h1>平台运行平稳，今日招聘活跃度上升 8.6%</h1>
          <p>现有 ${pendingAudits.length} 个职位待审核，其中 2 个触发内容风险提示。建议优先处理高风险与高薪类职位，保障求职者体验。</p>
          <div class="admin-hero__alerts">
            <span class="admin-alert"><span class="dot"></span>${pendingAudits.length} 个职位待审核</span>
            <span class="admin-alert"><span class="dot" style="color:#f4c66b"></span>2 家企业待复核</span>
            <span class="admin-alert"><span class="dot" style="color:#61d3b8"></span>系统服务正常</span>
          </div>
        </div>
        <div class="admin-mini-chart">
          <div class="admin-mini-chart__head"><span>近 7 日职位发布量</span><span><strong>286</strong> +8.6%</span></div>
          <svg class="sparkline" viewBox="0 0 300 70" preserveAspectRatio="none" role="img" aria-label="近七日职位发布量上升趋势">
            <defs>
              <linearGradient id="adminSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6b8aff" stop-opacity=".38"/>
                <stop offset="100%" stop-color="#6b8aff" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0 55 L42 49 L84 52 L126 37 L168 41 L210 27 L252 32 L300 12 L300 70 L0 70 Z" fill="url(#adminSpark)"/>
            <path d="M0 55 L42 49 L84 52 L126 37 L168 41 L210 27 L252 32 L300 12" fill="none" stroke="#8fa6ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="300" cy="12" r="3.2" fill="#ff9e82" stroke="#152b5c" stroke-width="2"/>
          </svg>
        </div>
      </section>
      <div class="company-metrics">
        ${metricCard({ label: "平台注册用户", value: "12,846", suffix: "人", iconName: "users", foot: '<span class="up">↑ 286</span><span>本周新增</span>' })}
        ${metricCard({ label: "已认证企业", value: "1,204", suffix: "家", iconName: "company", toneClass: "metric-card__icon--mint", foot: '<span class="up">97.3%</span><span>认证通过率</span>' })}
        ${metricCard({ label: "在架职位", value: "3,862", suffix: "个", iconName: "briefcase", toneClass: "metric-card__icon--amber", foot: '<span class="up">↑ 8.6%</span><span>较上周</span>' })}
        ${metricCard({ label: "今日投递", value: "1,526", suffix: "次", iconName: "send", toneClass: "metric-card__icon--coral", foot: '<span class="up">↑ 12.4%</span><span>较昨日</span>' })}
      </div>
      <div class="admin-grid">
        <section class="panel">
          <div class="panel__head">
            <div><h2>待审核职位</h2><p>优先处理触发风险提示的职位</p></div>
            <button class="text-link" type="button" data-route="admin/audits">进入审核中心 ${icon("arrow")}</button>
          </div>
          <div>
            ${pendingAudits
              .slice(0, 4)
              .map(
                (audit) => `
                  <div class="audit-row">
                    <span class="company-logo ${audit.id % 2 ? "company-logo--slate" : "company-logo--mint"}" style="width:34px;height:34px;font-size:11px;border-radius:9px">${audit.company.slice(0, 1)}</span>
                    <div class="audit-row__main">
                      <div class="audit-row__title">${audit.title}</div>
                      <div class="audit-row__meta"><span>${audit.company}</span><span>·</span><span>${audit.submitted}</span><span class="badge ${audit.risk === "需关注" ? "badge--amber" : "badge--mint"}">${audit.risk}</span></div>
                    </div>
                    <div class="audit-row__actions">
                      <button class="btn btn--sm" type="button" data-action="view-audit" data-id="${audit.id}">查看</button>
                      <button class="btn btn--sm btn--primary" type="button" data-action="approve-audit" data-id="${audit.id}">通过</button>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
        <aside class="side-stack">
          <div class="panel">
            <div class="panel__head"><div><h2>快捷管理</h2><p>常用运营入口</p></div></div>
            <div class="panel__body">
              <div class="quick-actions">
                <button class="quick-action" type="button" data-route="admin/users">
                  <span class="quick-action__icon">${icon("users")}</span>
                  <span><span class="quick-action__title">用户管理</span><span class="quick-action__meta">12,846 位用户</span></span>
                </button>
                <button class="quick-action" type="button" data-route="admin/companies">
                  <span class="quick-action__icon" style="color:var(--mint);background:var(--mint-soft)">${icon("company")}</span>
                  <span><span class="quick-action__title">企业审核</span><span class="quick-action__meta">2 家待复核</span></span>
                </button>
                <button class="quick-action" type="button" data-route="admin/content">
                  <span class="quick-action__icon" style="color:var(--amber);background:var(--amber-soft)">${icon("message")}</span>
                  <span><span class="quick-action__title">发布公告</span><span class="quick-action__meta">全平台通知</span></span>
                </button>
                <button class="quick-action" type="button" data-route="dashboard">
                  <span class="quick-action__icon" style="color:var(--accent);background:var(--accent-soft)">${icon("chart")}</span>
                  <span><span class="quick-action__title">数据洞察</span><span class="quick-action__meta">7 类图表</span></span>
                </button>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel__head"><div><h2>内容风险提示</h2><p>自动规则识别</p></div><span class="badge badge--coral">2 项</span></div>
            <div class="panel__body">
              <div class="activity-list">
                <div class="activity-item">
                  <span class="activity-item__dot" style="color:var(--rose);background:var(--rose-soft)">${icon("shield", "icon--sm")}</span>
                  <div class="activity-item__copy"><p>「销售顾问（高提成）」薪资描述存在误导风险</p><span>今天 09:51 · 规则命中</span></div>
                </div>
                <div class="activity-item">
                  <span class="activity-item__dot" style="color:var(--amber);background:var(--amber-soft)">${icon("company", "icon--sm")}</span>
                  <div class="activity-item__copy"><p>启点咨询企业资质信息需人工复核</p><span>昨天 15:20 · 自动预警</span></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
  }

  function renderAdminAudits() {
    const tabs = ["待审核", "已通过", "已驳回"];
    const filtered = state.audits.filter((item) => item.status === state.auditTab);
    return `
      ${renderPageHeading(
        "CONTENT REVIEW",
        "职位审核",
        "审核职位信息完整性与合规性，保障平台职位真实、透明、有效。",
        `<button class="btn" type="button" data-action="show-toast" data-message="审核规则配置已打开（原型演示）">${icon("settings", "icon--sm")} 审核规则</button>
         <button class="btn btn--primary" type="button" data-action="approve-all-audits">${icon("check", "icon--sm")} 批量通过低风险职位</button>`,
      )}
      <div class="status-tabs">
        ${tabs
          .map((tab) => {
            const count = state.audits.filter((item) => item.status === tab).length;
            return `<button class="status-tab ${state.auditTab === tab ? "is-active" : ""}" type="button" data-action="set-audit-tab" data-value="${tab}">${tab}<span class="tab__count">${count}</span></button>`;
          })
          .join("")}
      </div>
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-toolbar__title">${state.auditTab}职位</span>
          <span class="badge badge--blue">${filtered.length} 条记录</span>
          <span class="table-toolbar__spacer"></span>
          <label class="field table-search">${icon("search")}<input type="search" placeholder="搜索职位 / 企业" aria-label="搜索审核记录"></label>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>职位名称</th><th>企业</th><th>审核类型</th><th>薪资范围</th><th>风险提示</th><th>提交时间</th><th>操作</th></tr></thead>
            <tbody>
              ${filtered
                .map(
                  (audit) => `
                    <tr>
                      <td><div class="table-main__title">${audit.title}</div><div class="table-main__sub">职位编号 JOB-${audit.id}</div></td>
                      <td><div style="display:flex;align-items:center;gap:7px"><span class="company-logo company-logo--slate" style="width:26px;height:26px;border-radius:7px;font-size:9px">${audit.company.slice(0, 1)}</span>${audit.company}</div></td>
                      <td>${audit.type}</td>
                      <td>${audit.salary}</td>
                      <td><span class="badge ${audit.risk === "高风险" ? "badge--rose" : audit.risk === "需关注" ? "badge--amber" : "badge--mint"}">${audit.risk}</span></td>
                      <td>${audit.submitted}</td>
                      <td>
                        <div class="table-actions">
                          <button class="btn" type="button" data-action="view-audit" data-id="${audit.id}">详情</button>
                          ${
                            audit.status === "待审核"
                              ? `<button class="btn btn--danger" type="button" data-action="reject-audit" data-id="${audit.id}">驳回</button>
                                 <button class="btn btn--primary" type="button" data-action="approve-audit" data-id="${audit.id}">通过</button>`
                              : `<span class="badge ${audit.status === "已通过" ? "badge--mint" : "badge--rose"}">${audit.status}</span>`
                          }
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("")}
              ${filtered.length ? "" : `<tr><td colspan="7"><div class="table-empty">当前分类下暂无记录</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
      <div class="tips-card" style="margin-top:14px;display:flex;align-items:center;gap:10px">
        <span style="color:var(--brand)">${icon("shield", "icon--lg")}</span>
        <div style="flex:1">
          <h3 style="font-size:10.5px">审核提示</h3>
          <p style="color:var(--muted);font-size:8.8px;margin-top:2px">「高提成」「轻松月入」等模糊薪资表述需要求企业补充固定薪资与绩效说明。审批记录会写入操作日志。</p>
        </div>
      </div>
    `;
  }

  function renderAdminUsers() {
    const tabs = ["全部", "求职者", "企业用户", "已禁用"];
    const filtered =
      state.userTab === "全部"
        ? users
        : state.userTab === "已禁用"
          ? users.filter((item) => item.status === "已禁用")
          : users.filter((item) => item.role === state.userTab);
    return `
      ${renderPageHeading(
        "USER MANAGEMENT",
        "用户管理",
        "管理平台求职者与企业用户账号，维护账号状态和平台访问安全。",
        `<button class="btn" type="button" data-action="show-toast" data-message="用户数据导出已开始（原型演示）">${icon("download", "icon--sm")} 导出用户</button>`,
      )}
      <div class="metric-grid">
        ${metricCard({ label: "注册用户", value: "12,846", suffix: "人", iconName: "users", foot: '<span class="up">↑ 286</span><span>本周新增</span>' })}
        ${metricCard({ label: "求职者", value: "11,642", suffix: "人", iconName: "user", toneClass: "metric-card__icon--mint", foot: '<span>占比 90.6%</span>' })}
        ${metricCard({ label: "企业用户", value: "1,204", suffix: "人", iconName: "company", toneClass: "metric-card__icon--amber", foot: '<span class="up">↑ 12</span><span>本周新增</span>' })}
        ${metricCard({ label: "异常账号", value: "8", suffix: "个", iconName: "shield", toneClass: "metric-card__icon--coral", foot: '<span>等待人工复核</span>' })}
      </div>
      <div class="table-card" style="margin-top:15px">
        <div class="table-toolbar">
          <div class="tabs">
            ${tabs.map((tab) => `<button class="tab ${state.userTab === tab ? "is-active" : ""}" type="button" data-action="set-user-tab" data-value="${tab}">${tab}</button>`).join("")}
          </div>
          <span class="table-toolbar__spacer"></span>
          <label class="field table-search">${icon("search")}<input type="search" placeholder="搜索账号 / 姓名" aria-label="搜索用户"></label>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>用户</th><th>角色</th><th>注册时间</th><th>最近活跃</th><th>账号状态</th><th>操作</th></tr></thead>
            <tbody>
              ${filtered
                .map(
                  (user) => `
                    <tr>
                      <td>
                        <div class="table-main">
                          ${avatar(user.avatar, "sm", user.tone)}
                          <div><div class="table-main__title">${user.name}</div><div class="table-main__sub">@${user.account}</div></div>
                        </div>
                      </td>
                      <td><span class="badge ${user.role === "企业用户" ? "badge--coral" : "badge--blue"}">${user.role}</span></td>
                      <td>${user.created}</td>
                      <td>${user.lastActive}</td>
                      <td>${statusBadge(user.status)}</td>
                      <td>
                        <div class="table-actions">
                          <button class="btn" type="button" data-action="show-toast" data-message="用户详情已打开（原型演示）">详情</button>
                          <button class="btn ${user.status === "正常" ? "btn--danger" : ""}" type="button" data-action="toggle-user-status" data-id="${user.id}">${user.status === "正常" ? "禁用" : "启用"}</button>
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("")}
              ${filtered.length ? "" : `<tr><td colspan="6"><div class="table-empty">当前分类下暂无用户</div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAdminCompanies() {
    const tabs = ["全部", "已认证", "待认证", "需复核"];
    const filtered =
      state.companyTab === "全部" ? companies : companies.filter((item) => item.status === state.companyTab);
    return `
      ${renderPageHeading(
        "COMPANY MANAGEMENT",
        "企业管理",
        "核验企业主体与招聘资质，维护平台企业信息质量。",
        `<button class="btn" type="button" data-action="show-toast" data-message="企业资质导出已开始（原型演示）">${icon("download", "icon--sm")} 导出企业</button>`,
      )}
      <div class="status-tabs">
        ${tabs
          .map((tab) => {
            const count = tab === "全部" ? companies.length : companies.filter((item) => item.status === tab).length;
            return `<button class="status-tab ${state.companyTab === tab ? "is-active" : ""}" type="button" data-action="set-company-tab" data-value="${tab}">${tab}<span class="tab__count">${count}</span></button>`;
          })
          .join("")}
      </div>
      <div class="table-card">
        <div class="table-toolbar">
          <span class="table-toolbar__title">企业列表</span>
          <span class="table-toolbar__spacer"></span>
          <label class="field table-search">${icon("search")}<input type="search" placeholder="搜索企业名称" aria-label="搜索企业"></label>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>企业</th><th>行业 / 规模</th><th>所在城市</th><th>在招职位</th><th>认证状态</th><th>最近更新</th><th>操作</th></tr></thead>
            <tbody>
              ${filtered
                .map(
                  (company) => `
                    <tr>
                      <td>
                        <div class="table-main">
                          <span class="company-logo ${company.tone ? `company-logo--${company.tone}` : ""}" style="width:32px;height:32px;font-size:10px;border-radius:9px">${company.logo}</span>
                          <div><div class="table-main__title">${company.name}</div><div class="table-main__sub">负责人：${company.owner}</div></div>
                        </div>
                      </td>
                      <td>${company.industry}<br><span style="color:var(--muted);font-size:8.5px">${company.scale}</span></td>
                      <td>${company.city}</td>
                      <td>${company.jobs} 个</td>
                      <td>${statusBadge(company.status)}</td>
                      <td>${company.updated}</td>
                      <td>
                        <div class="table-actions">
                          <button class="btn" type="button" data-action="show-toast" data-message="企业资质详情已打开（原型演示）">详情</button>
                          ${company.status === "待认证" || company.status === "需复核" ? `<button class="btn btn--primary" type="button" data-action="verify-company" data-id="${company.id}">审核</button>` : ""}
                        </div>
                      </td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAdminContent() {
    return `
      ${renderPageHeading(
        "CONTENT OPERATIONS",
        "分类与公告",
        "维护职位分类体系与全平台公告，保持内容结构清晰、信息触达及时。",
        `<button class="btn" type="button" data-action="show-toast" data-message="职位分类编辑器已打开（原型演示）">${icon("grid", "icon--sm")} 编辑分类</button>
         <button class="btn btn--primary" type="button" data-action="open-modal" data-modal="announcement">${icon("plus", "icon--sm")} 发布公告</button>`,
      )}
      <div class="admin-grid">
        <section class="panel">
          <div class="panel__head"><div><h2>公告管理</h2><p>共 ${state.announcements.length} 条公告</p></div><span class="badge badge--mint">全平台送达率 98.7%</span></div>
          <div class="panel__body">
            <div class="announcement-list">
              ${state.announcements
                .map(
                  (item) => `
                    <article class="announcement-item">
                      <span class="announcement-item__icon">${icon("message")}</span>
                      <div style="min-width:0;flex:1">
                        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
                          <h3>${item.title}</h3>
                          ${statusBadge(item.status)}
                        </div>
                        <p>${item.summary}</p>
                        <div class="announcement-item__meta"><span>${item.channel}</span><span>·</span><span>${item.published}</span><span>·</span><span>${item.author}</span></div>
                      </div>
                      <div class="table-actions">
                        <button class="btn btn--sm" type="button" data-action="show-toast" data-message="公告编辑入口已打开（原型演示）">编辑</button>
                        <button class="btn btn--sm ${item.status === "已发布" ? "btn--danger" : ""}" type="button" data-action="toggle-announcement" data-id="${item.id}">${item.status === "已发布" ? "下线" : "发布"}</button>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </div>
        </section>
        <aside class="side-stack">
          <div class="panel">
            <div class="panel__head"><div><h2>职位分类</h2><p>两级分类树 · 4 个一级分类</p></div><span class="badge">共 7,170 职位</span></div>
            <div class="panel__body">
              <div style="display:grid;gap:11px">
                ${categories
                  .map(
                    (category) => `
                      <div style="padding-bottom:10px;border-bottom:1px solid #eef1f6">
                        <div style="display:flex;align-items:center;justify-content:space-between">
                          <strong style="color:var(--ink-2);font-size:10.5px">${category.name}</strong>
                          <span style="color:var(--muted);font-size:8.5px">${category.count} 个职位</span>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                          ${category.children.map((child) => `<span class="mini-tag">${child}</span>`).join("")}
                        </div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          </div>
          <div class="tips-card">
            <h3>${icon("message")} 公告发布建议</h3>
            <ul>
              <li>面向全平台的公告建议提前 24 小时发布。</li>
              <li>公告内容需包含生效时间和影响范围。</li>
              <li>重要公告可配置站内信与首页通知双通道触达。</li>
            </ul>
          </div>
        </aside>
      </div>
    `;
  }

  function renderDashboard() {
    const backRoute = roles[state.role]?.home || "seeker/home";
    return `
      <div class="insights-page">
        <header class="insights-topbar">
          <button class="insights-back" type="button" data-route="${backRoute}">${icon("arrow", "icon--sm")} 返回工作台</button>
          <div class="insights-brand">
            <span class="insights-brand__mark">${icon("spark")}</span>
            <div><h1>DreamHiring · 招聘洞察</h1><p>人才市场数据可视化中心</p></div>
          </div>
          <div class="insights-meta">
            <span><span class="dot"></span>数据服务正常</span>
            <span>中文招聘数据集 12,846 条</span>
            <span class="date-chip">${icon("calendar", "icon--sm")} 2026 Q3</span>
          </div>
        </header>
        <div class="insights-heading">
          <div>
            <h2>就业市场全景洞察</h2>
            <p>从城市、薪资、学历、经验、行业与技能六个维度观察人才需求变化</p>
          </div>
          <div class="data-source">
            <span>数据来源</span>
            <span class="data-source__pill">中文招聘数据集</span>
            <span class="data-source__pill">英文技能数据集</span>
            <span class="data-source__pill">更新于 2026-10-20 08:00</span>
          </div>
        </div>
        <section class="insights-kpis" aria-label="招聘市场关键指标">
          <article class="insight-kpi">
            <div class="insight-kpi__top"><span>有效职位样本</span><span class="insight-kpi__icon">${icon("briefcase", "icon--sm")}</span></div>
            <div class="insight-kpi__value">12,846<small>条</small></div>
            <div class="insight-kpi__trend">${icon("trend", "icon--sm")} 较上季度 +8.6%</div>
          </article>
          <article class="insight-kpi">
            <div class="insight-kpi__top"><span>平均月薪</span><span class="insight-kpi__icon insight-kpi__icon--mint">${icon("coin", "icon--sm")}</span></div>
            <div class="insight-kpi__value">18.6<small>K</small></div>
            <div class="insight-kpi__trend">${icon("trend", "icon--sm")} 较上季度 +4.2%</div>
          </article>
          <article class="insight-kpi">
            <div class="insight-kpi__top"><span>人才供需比</span><span class="insight-kpi__icon insight-kpi__icon--amber">${icon("users", "icon--sm")}</span></div>
            <div class="insight-kpi__value">1.28<small>: 1</small></div>
            <div class="insight-kpi__trend is-down">${icon("trend", "icon--sm")} 竞争环比 -0.08</div>
          </article>
          <article class="insight-kpi">
            <div class="insight-kpi__top"><span>技能匹配均值</span><span class="insight-kpi__icon insight-kpi__icon--coral">${icon("magic", "icon--sm")}</span></div>
            <div class="insight-kpi__value">82.4<small>%</small></div>
            <div class="insight-kpi__trend">${icon("spark", "icon--sm")} 高匹配岗位 3,264 个</div>
          </article>
        </section>
        <section class="insights-grid" aria-label="招聘市场图表">
          <article class="insight-card insight-card--trend">
            <div class="insight-card__head">
              <h3>招聘需求趋势</h3>
              <div class="chart-legend"><span><i class="legend-dot"></i>职位发布量</span><span><i class="legend-dot legend-dot--mint"></i>投递量</span></div>
            </div>
            <svg class="trend-chart" viewBox="0 0 650 150" role="img" aria-label="招聘职位发布量与投递量趋势图">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#5f7ff1" stop-opacity=".34"/>
                  <stop offset="100%" stop-color="#5f7ff1" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <line x1="22" y1="22" x2="636" y2="22" class="grid-line"/>
              <line x1="22" y1="57" x2="636" y2="57" class="grid-line"/>
              <line x1="22" y1="92" x2="636" y2="92" class="grid-line"/>
              <line x1="22" y1="127" x2="636" y2="127" class="grid-line"/>
              <path d="M22 110 C65 102 83 96 116 98 C151 100 171 82 209 88 C246 94 270 68 306 72 C340 76 366 57 402 62 C437 66 461 43 496 48 C532 52 559 30 590 35 C611 38 623 24 636 23 L636 127 L22 127 Z" fill="url(#trendFill)"/>
              <path d="M22 110 C65 102 83 96 116 98 C151 100 171 82 209 88 C246 94 270 68 306 72 C340 76 366 57 402 62 C437 66 461 43 496 48 C532 52 559 30 590 35 C611 38 623 24 636 23" fill="none" stroke="#7c96ff" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M22 118 C65 114 89 117 122 110 C158 102 183 106 217 96 C251 87 281 98 315 85 C347 73 374 82 409 74 C443 66 469 77 504 61 C538 46 566 64 599 54 C614 49 625 45 636 42" fill="none" stroke="#4ec6a8" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="3 4"/>
              <circle cx="636" cy="23" r="3.5" fill="#8ea3ff" stroke="#0b172a" stroke-width="2"/>
              <circle cx="636" cy="42" r="3" fill="#4ec6a8" stroke="#0b172a" stroke-width="2"/>
              <text x="22" y="143" class="axis-text">10月</text><text x="116" y="143" class="axis-text">11月</text><text x="209" y="143" class="axis-text">12月</text>
              <text x="306" y="143" class="axis-text">1月</text><text x="402" y="143" class="axis-text">2月</text><text x="496" y="143" class="axis-text">3月</text>
              <text x="590" y="143" class="axis-text">4月</text>
            </svg>
          </article>
          <article class="insight-card insight-card--education">
            <div class="insight-card__head"><h3>学历要求分布</h3><span>有效样本 12,846</span></div>
            <div class="donut-wrap">
              <div class="donut" style="--a:42;--b:29;--c:18;--d:11">
                <div class="donut__center"><strong>42%</strong><span>本科占比</span></div>
              </div>
              <div class="donut-legend">
                <div class="donut-legend__item"><span class="legend-swatch"></span><span>本科</span><strong>42%</strong></div>
                <div class="donut-legend__item"><span class="legend-swatch legend-swatch--mint"></span><span>大专</span><strong>29%</strong></div>
                <div class="donut-legend__item"><span class="legend-swatch legend-swatch--amber"></span><span>硕士及以上</span><strong>18%</strong></div>
                <div class="donut-legend__item"><span class="legend-swatch legend-swatch--coral"></span><span>学历不限</span><strong>11%</strong></div>
              </div>
            </div>
          </article>
          <article class="insight-card insight-card--salary">
            <div class="insight-card__head"><h3>薪资区间分布</h3><span>月薪 · 千元</span></div>
            <div class="salary-bars">
              ${[
                ["8-12K", 18],
                ["12-18K", 32],
                ["18-25K", 24],
                ["25-35K", 17],
                ["35-50K", 7],
                ["50K+", 2],
              ]
                .map(([label, value]) => `<div class="salary-bar"><span class="salary-bar__label">${label}</span><span class="salary-bar__track"><span class="salary-bar__fill" style="width:${value * 2.5}%"></span></span><span class="salary-bar__value">${value}%</span></div>`)
                .join("")}
            </div>
          </article>
          <article class="insight-card insight-card--city">
            <div class="insight-card__head"><h3>热门招聘城市</h3><span>职位占比</span></div>
            <div class="city-bars">
              ${[
                ["上海", 24, 76],
                ["北京", 21, 68],
                ["深圳", 18, 59],
                ["杭州", 15, 49],
                ["广州", 12, 39],
                ["成都", 7, 23],
              ]
                .map(([city, value, width]) => `<div class="city-bar"><span class="city-bar__name">${city}</span><span class="city-bar__track"><span class="city-bar__fill" style="width:${width}%"></span></span><span class="city-bar__value">${value}%</span></div>`)
                .join("")}
            </div>
          </article>
          <article class="insight-card insight-card--experience">
            <div class="insight-card__head"><h3>经验要求分布</h3><span>岗位占比</span></div>
            <div class="experience-columns">
              ${[
                ["应届", 18, 42],
                ["1-3年", 35, 58],
                ["3-5年", 31, 52],
                ["5-10年", 12, 29],
                ["10年+", 4, 13],
              ]
                .map(([label, value, height]) => `<div class="exp-column"><span class="exp-column__value">${value}%</span><span class="exp-column__bar" style="height:${height}px"></span><span class="exp-column__label">${label}</span></div>`)
                .join("")}
            </div>
          </article>
          <article class="insight-card insight-card--industry">
            <div class="insight-card__head"><h3>行业人才需求</h3><span>矩形面积代表职位规模</span></div>
            <div class="industry-grid">
              <div class="industry-block industry-block--lg"><strong>互联网 / 软件</strong><span>34.2% · 4,393 个职位</span></div>
              <div class="industry-block industry-block--mint"><strong>企业服务</strong><span>18.6%</span></div>
              <div class="industry-block industry-block--amber"><strong>人工智能</strong><span>16.4%</span></div>
              <div class="industry-block industry-block--coral"><strong>金融科技</strong><span>12.8%</span></div>
              <div class="industry-block industry-block--slate"><strong>先进制造</strong><span>9.7%</span></div>
              <div class="industry-block"><strong>其他行业</strong><span>8.3%</span></div>
            </div>
          </article>
          <article class="insight-card insight-card--skills">
            <div class="insight-card__head"><h3>热门技能词云</h3><span>技能词频 · 英文数据集</span></div>
            <div class="skill-cloud-chart" role="img" aria-label="热门技能词云：Java、Python、SQL、Vue、Spring Boot、MySQL、TypeScript、Redis、Docker">
              <span class="cloud-word cloud-word--lg" style="left:26%;top:30%">Python</span>
              <span class="cloud-word cloud-word--lg" style="left:52%;top:8%">Java</span>
              <span class="cloud-word cloud-word--md" style="left:75%;top:31%">SQL</span>
              <span class="cloud-word cloud-word--md" style="left:11%;top:9%">Vue</span>
              <span class="cloud-word cloud-word--md" style="left:46%;top:55%">Spring Boot</span>
              <span class="cloud-word cloud-word--sm" style="left:77%;top:62%">MySQL</span>
              <span class="cloud-word cloud-word--sm" style="left:7%;top:65%">TypeScript</span>
              <span class="cloud-word cloud-word--sm" style="left:39%;top:82%">Redis</span>
              <span class="cloud-word cloud-word--xs" style="left:61%;top:82%">Docker</span>
              <span class="cloud-word cloud-word--xs" style="left:5%;top:40%">数据分析</span>
              <span class="cloud-word cloud-word--xs" style="left:24%;top:74%">Figma</span>
              <span class="cloud-word cloud-word--xs" style="left:88%;top:16%">ECharts</span>
              <span class="cloud-word cloud-word--xs" style="left:72%;top:47%">MyBatis</span>
              <span class="cloud-word cloud-word--xs" style="left:47%;top:27%">Git</span>
              <span class="cloud-word cloud-word--xs" style="left:14%;top:24%">Linux</span>
            </div>
          </article>
        </section>
        <footer class="insights-footer">
          <div class="insights-footer__note">${icon("shield", "icon--sm")} 数据已完成去重、缺失值处理、薪资单位统一与城市归一化</div>
          <div>中文数据集用于薪资 / 城市 / 学历 / 经验维度 · 英文数据集仅用于技能词频等语言无关维度</div>
        </footer>
      </div>
    `;
  }

  function renderLogin() {
    return `
      <div class="login-page">
        <section class="login-story">
          <a class="brand" href="#/seeker/home" data-route="seeker/home">
            <span class="brand-mark">${icon("spark")}</span>
            <span><span class="brand-name">DreamHiring</span><span class="brand-sub">DREAM · HIRING</span></span>
          </a>
          <div class="login-story__body">
            <span class="login-story__eyebrow">${icon("spark", "icon--sm")} 招聘，不止于匹配</span>
            <h1>让每一次选择，<br>都更接近<em>理想工作</em>。</h1>
            <p>连接优秀人才与认真招聘的企业。清晰透明的进度、可解释的人岗匹配，以及真实的数据洞察，帮助双方做出更好的决定。</p>
            <div class="login-proof">
              <span class="login-proof__avatars">${avatar("林", "sm", "")}${avatar("陈", "sm", "coral")}${avatar("周", "sm", "mint")}</span>
              <p><strong>12,846 位求职者与 1,204 家企业</strong>正在使用 DreamHiring</p>
            </div>
          </div>
          <div class="login-story__foot"><span>© 2026 DreamHiring</span><span>隐私政策</span><span>用户协议</span><span>帮助中心</span></div>
        </section>
        <section class="login-panel">
          <div class="login-box">
            <h2>${state.loginTab === "login" ? "欢迎回来" : "创建你的账号"}</h2>
            <p>${state.loginTab === "login" ? "登录后继续发现适合你的机会。" : "选择身份，开启更高效的招聘体验。"}</p>
            <div class="login-tabs">
              <button class="login-tab ${state.loginTab === "login" ? "is-active" : ""}" type="button" data-action="set-login-tab" data-value="login">登录</button>
              <button class="login-tab ${state.loginTab === "register" ? "is-active" : ""}" type="button" data-action="set-login-tab" data-value="register">注册</button>
            </div>
            <form data-form="login-form">
              <div class="role-picker" aria-label="选择登录身份">
                ${Object.values(roles)
                  .map(
                    (role) => `<button class="role-pick ${state.loginRole === role.key ? "is-active" : ""}" type="button" data-action="set-login-role" data-value="${role.key}">${icon(role.icon)}<span>${role.label}</span></button>`,
                  )
                  .join("")}
              </div>
              <div class="login-field">
                <label for="login-account">账号</label>
                <div class="login-input">${icon("users", "icon--sm")}<input id="login-account" name="account" autocomplete="username" value="${state.loginRole === "company" ? "chenyu_hr" : state.loginRole === "admin" ? "admin_zhou" : "linzhixia"}"></div>
              </div>
              <div class="login-field">
                <label for="login-password">密码</label>
                <div class="login-input">${icon("shield", "icon--sm")}<input id="login-password" name="password" type="password" autocomplete="current-password" value="dreamhiring"></div>
              </div>
              ${state.loginTab === "login" ? `<div class="login-field"><label for="login-captcha">图形验证码</label><div class="login-input">${icon("grid", "icon--sm")}<input id="login-captcha" name="captcha" placeholder="请输入右侧验证码"><span class="captcha" title="演示验证码">7K3P</span></div></div>` : ""}
              <div class="login-row">
                <label class="login-check"><input type="checkbox" checked> ${state.loginTab === "login" ? "记住登录状态" : "我已阅读并同意用户协议"}</label>
                ${state.loginTab === "login" ? '<span style="color:var(--brand);font-weight:700">忘记密码？</span>' : ""}
              </div>
              <button class="btn btn--primary btn--lg btn--block" type="submit">${state.loginTab === "login" ? "进入 DreamHiring" : "创建账号并进入"} ${icon("arrow", "icon--sm")}</button>
              <div class="login-role-note"><strong>演示模式：</strong>点击上方身份可直接切换三种角色。原型不校验真实账号与验证码，所有业务数据均在本地模拟。</div>
            </form>
          </div>
        </section>
      </div>
    `;
  }

  function renderModal() {
    const modalRoot = document.getElementById("modal-root");
    if (!state.modal) {
      modalRoot.innerHTML = "";
      document.body.classList.remove("modal-open");
      return;
    }
    document.body.classList.add("modal-open");
    const { type, id } = state.modal;
    let content = "";

    if (type === "resume") {
      content = `
        <div class="modal__head">
          <div><h2>编辑在线简历</h2><p>技能标签会参与人岗匹配度计算，请按真实经历填写。</p></div>
          <button class="modal__close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button>
        </div>
        <form data-form="resume-form">
          <div class="modal__body">
            <div class="form-grid">
              <label class="form-group"><span class="form-label">姓名</span><span class="field"><input name="name" value="${escapeHtml(state.resume.name)}" aria-label="姓名"></span></label>
              <label class="form-group"><span class="form-label">求职方向</span><span class="field"><input name="title" value="${escapeHtml(state.resume.title)}" aria-label="求职方向"></span></label>
              <label class="form-group"><span class="form-label">当前城市</span><span class="field"><input name="city" value="${escapeHtml(state.resume.city)}" aria-label="当前城市"></span></label>
              <label class="form-group"><span class="form-label">期望薪资</span><span class="field"><input name="expectedSalary" value="${escapeHtml(state.resume.expectedSalary)}" aria-label="期望薪资"></span></label>
              <label class="form-group form-group--full"><span class="form-label">技能标签（使用逗号分隔）</span><span class="field"><input name="skills" value="${escapeHtml(state.resume.skills.join("，"))}" aria-label="技能标签"></span></label>
              <label class="form-group form-group--full"><span class="form-label">个人简介</span><span class="field field--textarea"><textarea name="summary" aria-label="个人简介">${escapeHtml(state.resume.summary)}</textarea></span></label>
            </div>
          </div>
          <div class="modal__foot">
            <button class="btn" type="button" data-action="close-modal">取消</button>
            <button class="btn btn--primary" type="submit">${icon("check", "icon--sm")} 保存简历</button>
          </div>
        </form>
      `;
    }

    if (type === "job") {
      content = `
        <div class="modal__head">
          <div><h2>发布新职位</h2><p>完善职位信息并提交审核，通过后将自动上架至职位广场。</p></div>
          <button class="modal__close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button>
        </div>
        <form data-form="job-form">
          <div class="modal__body">
            <div class="form-grid">
              <label class="form-group"><span class="form-label">职位名称 <span>*</span></span><span class="field"><input name="title" placeholder="例如：高级产品设计师" required aria-label="职位名称"></span></label>
              <label class="form-group"><span class="form-label">工作城市 <span>*</span></span><span class="field"><select name="city" aria-label="工作城市"><option>杭州</option><option>上海</option><option>北京</option><option>深圳</option><option>成都</option></select></span></label>
              <label class="form-group"><span class="form-label">最低月薪（K）</span><span class="field"><input name="salaryMin" type="number" min="1" value="20" aria-label="最低月薪"></span></label>
              <label class="form-group"><span class="form-label">最高月薪（K）</span><span class="field"><input name="salaryMax" type="number" min="1" value="30" aria-label="最高月薪"></span></label>
              <label class="form-group"><span class="form-label">学历要求</span><span class="field"><select name="education" aria-label="学历要求"><option>本科</option><option>大专</option><option>硕士</option><option>不限</option></select></span></label>
              <label class="form-group"><span class="form-label">经验要求</span><span class="field"><select name="experience" aria-label="经验要求"><option>1-3年</option><option>3-5年</option><option>5-10年</option><option>应届</option></select></span></label>
              <label class="form-group form-group--full"><span class="form-label">核心技能标签</span><span class="field"><input name="skills" value="Figma，B端产品，设计系统" aria-label="核心技能标签"></span><span class="form-hint">使用逗号分隔，MatchService 将以这些标签计算候选人匹配度。</span></label>
              <label class="form-group form-group--full"><span class="form-label">职位描述</span><span class="field field--textarea"><textarea name="description" placeholder="描述岗位职责、任职要求和团队情况" aria-label="职位描述">负责企业协同产品的体验设计，参与从需求洞察到设计落地的完整链路。</textarea></span></label>
            </div>
          </div>
          <div class="modal__foot">
            <button class="btn" type="button" data-action="close-modal">保存草稿</button>
            <button class="btn btn--primary" type="submit">${icon("send", "icon--sm")} 提交审核</button>
          </div>
        </form>
      `;
    }

    if (type === "announcement") {
      content = `
        <div class="modal__head">
          <div><h2>发布系统公告</h2><p>公告发布后会进入站内消息中心，可选择全平台或指定角色触达。</p></div>
          <button class="modal__close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button>
        </div>
        <form data-form="announcement-form">
          <div class="modal__body">
            <div class="form-grid">
              <label class="form-group form-group--full"><span class="form-label">公告标题 <span>*</span></span><span class="field"><input name="title" placeholder="请输入公告标题" required aria-label="公告标题"></span></label>
              <label class="form-group"><span class="form-label">触达范围</span><span class="field"><select name="channel" aria-label="触达范围"><option>全平台</option><option>企业用户</option><option>求职者</option></select></span></label>
              <label class="form-group"><span class="form-label">发布状态</span><span class="field"><select name="status" aria-label="发布状态"><option>已发布</option><option>草稿</option></select></span></label>
              <label class="form-group form-group--full"><span class="form-label">公告内容 <span>*</span></span><span class="field field--textarea"><textarea name="summary" placeholder="请输入公告正文和影响范围" required aria-label="公告内容"></textarea></span></label>
            </div>
          </div>
          <div class="modal__foot">
            <button class="btn" type="button" data-action="close-modal">取消</button>
            <button class="btn btn--primary" type="submit">${icon("send", "icon--sm")} 发布公告</button>
          </div>
        </form>
      `;
    }

    if (type === "candidate") {
      const candidate = state.candidates.find((item) => item.id === Number(id));
      if (candidate) {
        content = `
          <div class="modal__head">
            <div><h2>候选人详情</h2><p>匹配度仅作为筛选参考，建议结合项目经历与作品集综合判断。</p></div>
            <button class="modal__close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button>
          </div>
          <div class="modal__body">
            <div class="modal-candidate">
              ${avatar(candidate.name.slice(0, 1), "lg", candidate.id % 3 === 0 ? "amber" : candidate.id % 2 ? "mint" : "coral")}
              <div><h3>${candidate.name}</h3><p>${candidate.role} · ${candidate.exp}经验 · ${candidate.city}</p><div style="margin-top:5px">${statusBadge(candidate.status)}</div></div>
              <div class="modal-candidate__score">${candidate.score}<small>% 匹配</small></div>
            </div>
            <div class="modal-section">
              <h4>应聘职位</h4>
              <p style="color:var(--ink-2);font-size:10.5px">${candidate.companyJob} · 星云科技</p>
            </div>
            <div class="modal-section">
              <h4>匹配技能</h4>
              <div class="skill-cloud">${candidate.skills.map((skill) => `<span class="skill-tag is-match">${icon("check")}${skill}</span>`).join("")}</div>
            </div>
            <div class="modal-section">
              <h4>项目经历摘要</h4>
              <p style="color:#5f6b7f;font-size:10px;line-height:1.75">从业 ${candidate.exp}，主要经历覆盖 B 端产品体验设计、设计系统建设与复杂业务流程重构。最近一个项目中推动核心任务完成效率提升 31%，具备完整的需求洞察与跨团队协作经验。</p>
            </div>
            <div class="modal-section">
              <h4>附件简历</h4>
              <div class="attachment-card">
                <span class="attachment-card__icon">${icon("file")}</span>
                <div><div class="attachment-card__name">${candidate.name}_产品设计师.pdf</div><div class="attachment-card__meta">1.6 MB · 投递时上传</div></div>
                <div class="attachment-card__actions"><button class="btn btn--sm" type="button" data-action="show-toast" data-message="候选人简历预览已打开（原型演示）">${icon("eye", "icon--sm")} 预览</button></div>
              </div>
            </div>
          </div>
          <div class="modal__foot">
            <button class="btn" type="button" data-action="close-modal">关闭</button>
            ${candidate.status !== "已查看" ? `<button class="btn" type="button" data-action="candidate-status" data-id="${candidate.id}" data-status="已查看">标记已查看</button>` : ""}
            ${candidate.status !== "邀面试" ? `<button class="btn btn--primary" type="button" data-action="candidate-status" data-id="${candidate.id}" data-status="邀面试">${icon("calendar", "icon--sm")} 邀请面试</button>` : ""}
          </div>
        `;
      }
    }

    if (type === "audit") {
      const audit = state.audits.find((item) => item.id === Number(id));
      if (audit) {
        content = `
          <div class="modal__head">
            <div><h2>职位审核详情</h2><p>请核对职位描述、薪资范围和企业资质，审核结论将同步给企业。</p></div>
            <button class="modal__close" type="button" data-action="close-modal" aria-label="关闭">${icon("x")}</button>
          </div>
          <div class="modal__body">
            <div class="modal-candidate" style="background:#f8faff">
              <span class="company-logo company-logo--slate" style="width:46px;height:46px;border-radius:12px">${audit.company.slice(0, 1)}</span>
              <div><h3 style="font-size:14px">${audit.title}</h3><p>${audit.company} · ${audit.salary} · ${audit.type}</p></div>
              <div class="modal-candidate__score" style="font-size:13px">${audit.risk}</div>
            </div>
            <div class="modal-section">
              <h4>职位描述校验</h4>
              <p style="color:#5f6b7f;font-size:10px;line-height:1.75">负责核心业务模块的设计与研发，参与需求评审、技术方案设计与上线保障。要求具备良好的沟通能力与团队协作意识，薪资范围与岗位职责基本匹配。</p>
            </div>
            <div class="modal-section">
              <h4>风险检查项</h4>
              <div style="display:grid;gap:6px">
                <div class="profile-detail">${icon("check")}<span>企业实名认证</span><strong>通过</strong></div>
                <div class="profile-detail">${icon("check")}<span>薪资范围完整性</span><strong>通过</strong></div>
                <div class="profile-detail" style="color:${audit.risk === "低风险" ? "var(--mint)" : "var(--amber)"}">${icon("shield")}<span>敏感词与夸大表述</span><strong>${audit.risk === "低风险" ? "未发现异常" : "需人工确认"}</strong></div>
              </div>
            </div>
          </div>
          <div class="modal__foot">
            <button class="btn" type="button" data-action="close-modal">取消</button>
            ${audit.status === "待审核" ? `<button class="btn btn--danger" type="button" data-action="reject-audit" data-id="${audit.id}">驳回职位</button><button class="btn btn--primary" type="button" data-action="approve-audit" data-id="${audit.id}">${icon("check", "icon--sm")} 审核通过</button>` : `<span class="badge">${audit.status}</span>`}
          </div>
        `;
      }
    }

    modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal ${type === "candidate" || type === "audit" ? "modal--wide" : ""}" role="dialog" aria-modal="true">${content}</section></div>`;
  }

  function openModal(type, id = null) {
    state.modal = { type, id };
    renderModal();
  }

  function closeModal() {
    state.modal = null;
    renderModal();
  }

  function showToast(message, type = "success") {
    const region = document.getElementById("toast-region");
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "toast--error" : ""}`;
    toast.innerHTML = `<span class="toast__icon">${icon(type === "error" ? "x" : "check", "icon--sm")}</span><span>${escapeHtml(message)}</span>`;
    region.appendChild(toast);
    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }

  function renderApp() {
    state.route = parseRoute();
    if (state.route.startsWith("seeker/") || state.route.startsWith("company/") || state.route.startsWith("admin/")) {
      state.role = getRoleFromRoute(state.route);
    }
    const app = document.getElementById("app");
    const modalRoot = document.getElementById("modal-root");

    if (state.route === "login") {
      document.body.className = "";
      document.title = "登录 · DreamHiring";
      app.innerHTML = renderLogin();
      modalRoot.innerHTML = "";
      return;
    }

    if (state.route === "dashboard") {
      document.body.className = "dashboard-mode";
      document.title = "招聘洞察 · DreamHiring";
      app.innerHTML = renderDashboard();
      renderModal();
      return;
    }

    const roleKey = getRoleFromRoute(state.route);
    const [section, page, detailId] = state.route.split("/");
    let content = "";

    if (roleKey === "seeker") {
      if (page === "home") content = renderSeekerHome();
      else if (page === "jobs" && detailId) content = renderJobDetail(detailId);
      else if (page === "jobs") content = renderJobs();
      else if (page === "applications") content = renderApplications();
      else if (page === "resume") content = renderResume();
      else if (page === "messages") content = renderMessages("seeker");
    }

    if (roleKey === "company") {
      if (page === "home") content = renderCompanyHome();
      else if (page === "jobs") content = renderCompanyJobs();
      else if (page === "candidates") content = renderCompanyCandidates();
      else if (page === "profile") content = renderCompanyProfile();
      else if (page === "messages") content = renderMessages("company");
    }

    if (roleKey === "admin") {
      if (page === "home") content = renderAdminHome();
      else if (page === "audits") content = renderAdminAudits();
      else if (page === "users") content = renderAdminUsers();
      else if (page === "companies") content = renderAdminCompanies();
      else if (page === "content") content = renderAdminContent();
    }

    if (!content) {
      content = `<div class="empty-state" style="min-height:520px">
        <span class="empty-state__icon">${icon("search", "icon--lg")}</span>
        <h3>没有找到这个页面</h3>
        <p>当前原型暂未配置该路由，返回工作台继续体验其他功能。</p>
        <button class="btn btn--primary" type="button" data-route="${roles[roleKey].home}">返回工作台</button>
      </div>`;
    }

    const meta = pageMeta[currentBaseRoute()] || ["DreamHiring", "招聘工作台"];
    document.title = `${escapeHtml(meta[1])} · DreamHiring`;
    renderShell(content, roleKey);
    renderModal();
  }

  function cycleRole() {
    const keys = Object.keys(roles);
    const currentIndex = keys.indexOf(state.role);
    const nextRole = keys[(currentIndex + 1) % keys.length];
    state.role = nextRole;
    state.sidebarOpen = false;
    navigate(roles[nextRole].home);
  }

  function handleAction(element) {
    const action = element.dataset.action;
    const id = element.dataset.id;

    if (action === "toggle-role-menu") {
      const wrapper = element.closest(".role-switch");
      const isOpen = wrapper?.classList.toggle("is-open");
      element.setAttribute("aria-expanded", String(Boolean(isOpen)));
      return;
    }

    if (action === "switch-role") {
      const nextRole = element.dataset.role;
      state.role = nextRole;
      navigate(roles[nextRole].home);
      return;
    }

    if (action === "next-role") {
      cycleRole();
      return;
    }

    if (action === "toggle-sidebar") {
      state.sidebarOpen = !state.sidebarOpen;
      document.body.classList.toggle("sidebar-open", state.sidebarOpen);
      return;
    }

    if (action === "apply-job") {
      const job = jobs.find((item) => item.id === Number(id));
      if (!job) return;
      if (state.applications.some((item) => item.jobId === job.id)) {
        showToast("你已经投递过该职位，无需重复投递", "error");
        return;
      }
      state.applications.unshift({
        id: Date.now(),
        jobId: job.id,
        status: "待查看",
        score: job.match,
        time: "2026-10-20 12:30",
        update: "刚刚",
      });
      renderApp();
      showToast("投递成功，匹配度快照已生成");
      return;
    }

    if (action === "save-job") {
      const numericId = Number(id);
      const alreadySaved = state.savedJobs.includes(numericId);
      state.savedJobs = alreadySaved
        ? state.savedJobs.filter((item) => item !== numericId)
        : [...state.savedJobs, numericId];
      renderApp();
      showToast(alreadySaved ? "已取消收藏" : "职位已收藏");
      return;
    }

    if (action === "quick-search") {
      state.filters = { keyword: element.dataset.value || "", city: "不限", salary: "不限", education: "不限", experience: "不限" };
      navigate("seeker/jobs");
      return;
    }

    if (action === "remove-filter") {
      const key = element.dataset.filter;
      state.filters[key] = key === "keyword" ? "" : "不限";
      renderApp();
      return;
    }

    if (action === "reset-filters") {
      state.filters = { keyword: "", city: "不限", salary: "不限", education: "不限", experience: "不限" };
      renderApp();
      showToast("筛选条件已清空");
      return;
    }

    if (action === "set-application-tab") {
      state.applicationTab = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "select-message") {
      const isCompany = element.dataset.role === "company";
      const messageId = Number(id);
      const source = isCompany ? state.companyMessages : state.messages;
      const message = source.find((item) => item.id === messageId);
      if (message) message.unread = false;
      if (isCompany) state.activeCompanyMessageId = messageId;
      else state.activeMessageId = messageId;
      renderApp();
      return;
    }

    if (action === "mark-all-read") {
      const source = element.dataset.role === "company" ? state.companyMessages : state.messages;
      source.forEach((message) => {
        message.unread = false;
      });
      renderApp();
      showToast("全部消息已标为已读");
      return;
    }

    if (action === "set-candidate-filter") {
      state.candidateFilter = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "candidate-status") {
      const candidate = state.candidates.find((item) => item.id === Number(id));
      if (!candidate) return;
      const status = element.dataset.status;
      candidate.status = status;
      candidate.time = "刚刚";
      if (candidate.name === "林知夏") {
        const application = state.applications.find((item) => item.jobId === 1);
        if (application) {
          application.status = status;
          application.update = "刚刚";
        }
        const message = state.messages.find((item) => item.id === 1);
        if (message && status === "邀面试") {
          message.unread = true;
          message.time = "刚刚";
        }
      }
      closeModal();
      renderApp();
      showToast(`候选人状态已更新为「${status}」`);
      return;
    }

    if (action === "view-candidate") {
      openModal("candidate", id);
      return;
    }

    if (action === "toggle-job-status") {
      const job = state.companyJobs.find((item) => item.id === Number(id));
      if (!job) return;
      if (job.status === "招聘中") {
        job.status = "已下线";
        showToast("职位已下线，将不再展示给求职者");
      } else if (job.status === "已下线") {
        job.status = "招聘中";
        showToast("职位已重新上架");
      } else {
        showToast("职位正在平台审核中");
      }
      job.updated = "刚刚";
      renderApp();
      return;
    }

    if (action === "set-audit-tab") {
      state.auditTab = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "approve-audit" || action === "reject-audit") {
      const audit = state.audits.find((item) => item.id === Number(id));
      if (!audit) return;
      audit.status = action === "approve-audit" ? "已通过" : "已驳回";
      closeModal();
      renderApp();
      showToast(action === "approve-audit" ? "职位已审核通过并上架" : "职位已驳回，企业将收到通知");
      return;
    }

    if (action === "approve-all-audits") {
      const targets = state.audits.filter((item) => item.status === "待审核" && item.risk === "低风险");
      targets.forEach((item) => {
        item.status = "已通过";
      });
      renderApp();
      showToast(`已批量通过 ${targets.length} 个低风险职位`);
      return;
    }

    if (action === "view-audit") {
      openModal("audit", id);
      return;
    }

    if (action === "set-user-tab") {
      state.userTab = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "toggle-user-status") {
      const user = users.find((item) => item.id === Number(id));
      if (!user) return;
      user.status = user.status === "正常" ? "已禁用" : "正常";
      renderApp();
      showToast(`账号已${user.status === "正常" ? "启用" : "禁用"}`);
      return;
    }

    if (action === "set-company-tab") {
      state.companyTab = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "verify-company") {
      const company = companies.find((item) => item.id === Number(id));
      if (!company) return;
      company.status = "已认证";
      company.updated = "刚刚";
      renderApp();
      showToast("企业资质已核验通过");
      return;
    }

    if (action === "toggle-announcement") {
      const announcement = state.announcements.find((item) => item.id === Number(id));
      if (!announcement) return;
      announcement.status = announcement.status === "已发布" ? "已下线" : "已发布";
      renderApp();
      showToast(`公告已${announcement.status === "已发布" ? "发布" : "下线"}`);
      return;
    }

    if (action === "open-modal") {
      openModal(element.dataset.modal);
      return;
    }

    if (action === "close-modal") {
      closeModal();
      return;
    }

    if (action === "logout") {
      state.role = "seeker";
      navigate("login");
      return;
    }

    if (action === "show-toast") {
      showToast(element.dataset.message || "操作已完成");
      return;
    }

    if (action === "copy-job-link") {
      showToast("职位链接已复制（原型演示）");
      return;
    }

    if (action === "save-company-profile") {
      showToast("企业资料已保存");
      return;
    }

    if (action === "set-login-tab") {
      state.loginTab = element.dataset.value;
      renderApp();
      return;
    }

    if (action === "set-login-role") {
      state.loginRole = element.dataset.value;
      renderApp();
    }
  }

  function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const formType = form.dataset.form;
    const data = new FormData(form);

    if (formType === "hero-search" || formType === "job-filter") {
      state.filters = {
        keyword: String(data.get("keyword") || ""),
        city: String(data.get("city") || "不限"),
        salary: String(data.get("salary") || "不限"),
        education: String(data.get("education") || "不限"),
        experience: String(data.get("experience") || "不限"),
      };
      navigate("seeker/jobs");
      return;
    }

    if (formType === "global-search") {
      const keyword = String(data.get("keyword") || "");
      if (state.role === "seeker") {
        state.filters.keyword = keyword;
        navigate("seeker/jobs");
      } else if (state.role === "company") {
        navigate("company/jobs");
        showToast(`正在搜索「${keyword || "全部"}」（原型演示）`);
      } else {
        navigate("admin/users");
        showToast(`正在搜索「${keyword || "全部"}」（原型演示）`);
      }
      return;
    }

    if (formType === "resume-form") {
      state.resume = {
        ...state.resume,
        name: String(data.get("name") || state.resume.name),
        title: String(data.get("title") || state.resume.title),
        city: String(data.get("city") || state.resume.city),
        expectedSalary: String(data.get("expectedSalary") || state.resume.expectedSalary),
        summary: String(data.get("summary") || state.resume.summary),
        skills: String(data.get("skills") || "")
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      };
      closeModal();
      renderApp();
      showToast("在线简历已更新，匹配标签已重新计算");
      return;
    }

    if (formType === "job-form") {
      const title = String(data.get("title") || "").trim();
      if (!title) {
        showToast("请填写职位名称", "error");
        return;
      }
      const min = Math.max(1, Number(data.get("salaryMin")) || 1);
      const max = Math.max(min, Number(data.get("salaryMax")) || min);
      state.companyJobs.unshift({
        id: Date.now(),
        title,
        status: "待审核",
        applicants: 0,
        newCount: 0,
        updated: "刚刚",
        city: String(data.get("city") || "杭州"),
        salary: `${min}-${max}K`,
      });
      closeModal();
      renderApp();
      showToast("职位已提交平台审核，预计 2 小时内完成");
      return;
    }

    if (formType === "announcement-form") {
      const title = String(data.get("title") || "").trim();
      if (!title) {
        showToast("请填写公告标题", "error");
        return;
      }
      state.announcements.unshift({
        id: Date.now(),
        title,
        status: String(data.get("status") || "已发布"),
        channel: String(data.get("channel") || "全平台"),
        published: "2026-10-20 12:30",
        author: "周宁",
        summary: String(data.get("summary") || ""),
      });
      closeModal();
      renderApp();
      showToast("系统公告已发布");
      return;
    }

    if (formType === "company-profile-form") {
      showToast("企业资料已保存");
      return;
    }

    if (formType === "login-form") {
      state.role = state.loginRole;
      navigate(roles[state.role].home);
      showToast(`已进入${roles[state.role].label}演示工作台`);
    }
  }

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-backdrop")) {
      closeModal();
      return;
    }

    const routeElement = event.target.closest("[data-route]");
    if (routeElement) {
      event.preventDefault();
      state.sidebarOpen = false;
      navigate(routeElement.dataset.route);
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (actionElement) {
      event.preventDefault();
      handleAction(actionElement);
      return;
    }

    if (!event.target.closest(".role-switch")) {
      document.querySelectorAll(".role-switch.is-open").forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".role-switch__button")?.setAttribute("aria-expanded", "false");
      });
    }

    if (state.sidebarOpen && !event.target.closest(".sidebar") && !event.target.closest(".mobile-menu")) {
      state.sidebarOpen = false;
      document.body.classList.remove("sidebar-open");
    }
  });

  document.addEventListener("submit", handleSubmit);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.modal) closeModal();
      else if (state.sidebarOpen) {
        state.sidebarOpen = false;
        document.body.classList.remove("sidebar-open");
      }
    }
  });

  window.addEventListener("hashchange", () => {
    state.route = parseRoute();
    state.modal = null;
    state.sidebarOpen = false;
    state.role = state.route.startsWith("seeker/") || state.route.startsWith("company/") || state.route.startsWith("admin/")
      ? getRoleFromRoute(state.route)
      : state.role;
    document.getElementById("modal-root").innerHTML = "";
    document.body.classList.remove("modal-open");
    renderApp();
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  state.route = parseRoute();
  if (!window.location.hash) {
    window.history.replaceState(null, "", "#/seeker/home");
    state.route = "seeker/home";
  }
  state.role = getRoleFromRoute(state.route);
  renderApp();
})();
