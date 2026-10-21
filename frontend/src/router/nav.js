export const navByRole = {
  SEEKER: [
    { label: '首页', route: '/seeker/home', icon: 'HomeFilled' },
    { label: '职位广场', route: '/seeker/jobs', icon: 'Search' },
    { label: '我的投递', route: '/seeker/applications', icon: 'Promotion' },
    { label: '在线简历', route: '/seeker/resume', icon: 'Document' },
    { label: '消息中心', route: '/seeker/messages', icon: 'Message' },
    { label: '招聘洞察', route: '/dashboard', icon: 'DataAnalysis' },
  ],
  COMPANY: [
    { label: '招聘概览', route: '/company/home', icon: 'Odometer' },
    { label: '职位管理', route: '/company/jobs', icon: 'Suitcase' },
    { label: '候选人流程', route: '/company/candidates', icon: 'User' },
    { label: '企业主页', route: '/company/profile', icon: 'OfficeBuilding' },
    { label: '消息中心', route: '/company/messages', icon: 'Message' },
  ],
  ADMIN: [
    { label: '管理驾驶舱', route: '/admin/home', icon: 'Odometer' },
    { label: '职位审核', route: '/admin/audits', icon: 'Finished' },
    { label: '用户管理', route: '/admin/users', icon: 'UserFilled' },
    { label: '企业管理', route: '/admin/companies', icon: 'OfficeBuilding' },
    { label: '分类与公告', route: '/admin/content', icon: 'Bell' },
    { label: '数据看板', route: '/dashboard', icon: 'DataAnalysis' },
  ],
}
