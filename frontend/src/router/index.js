import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { ROLE_HOME } from '../utils/constants.js'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { auth: true },
    children: [
      { path: 'seeker/home', name: 'seeker-home', component: () => import('../views/seeker/HomeView.vue'), meta: { title: '求职者首页', roles: ['SEEKER'] } },
      { path: 'seeker/jobs', name: 'seeker-jobs', component: () => import('../views/seeker/JobsView.vue'), meta: { title: '职位广场', roles: ['SEEKER'] } },
      { path: 'seeker/jobs/:jobId', name: 'seeker-job-detail', component: () => import('../views/seeker/JobDetailView.vue'), meta: { title: '职位详情', roles: ['SEEKER'] } },
      { path: 'seeker/applications', name: 'seeker-applications', component: () => import('../views/seeker/ApplicationsView.vue'), meta: { title: '我的投递', roles: ['SEEKER'] } },
      { path: 'seeker/resume', name: 'seeker-resume', component: () => import('../views/seeker/ResumeView.vue'), meta: { title: '在线简历', roles: ['SEEKER'] } },
      { path: 'seeker/messages', name: 'seeker-messages', component: () => import('../views/shared/MessagesView.vue'), meta: { title: '消息中心', roles: ['SEEKER'] } },
      { path: 'company/home', name: 'company-home', component: () => import('../views/company/HomeView.vue'), meta: { title: '招聘概览', roles: ['COMPANY'] } },
      { path: 'company/jobs', name: 'company-jobs', component: () => import('../views/company/JobsView.vue'), meta: { title: '职位管理', roles: ['COMPANY'] } },
      { path: 'company/candidates', name: 'company-candidates', component: () => import('../views/company/CandidatesView.vue'), meta: { title: '候选人流程', roles: ['COMPANY'] } },
      { path: 'company/profile', name: 'company-profile', component: () => import('../views/company/ProfileView.vue'), meta: { title: '企业主页', roles: ['COMPANY'] } },
      { path: 'company/messages', name: 'company-messages', component: () => import('../views/shared/MessagesView.vue'), meta: { title: '消息中心', roles: ['COMPANY'] } },
      { path: 'admin/home', name: 'admin-home', component: () => import('../views/admin/HomeView.vue'), meta: { title: '管理驾驶舱', roles: ['ADMIN'] } },
      { path: 'admin/audits', name: 'admin-audits', component: () => import('../views/admin/AuditsView.vue'), meta: { title: '职位审核', roles: ['ADMIN'] } },
      { path: 'admin/users', name: 'admin-users', component: () => import('../views/admin/UsersView.vue'), meta: { title: '用户管理', roles: ['ADMIN'] } },
      { path: 'admin/companies', name: 'admin-companies', component: () => import('../views/admin/CompaniesView.vue'), meta: { title: '企业管理', roles: ['ADMIN'] } },
      { path: 'admin/content', name: 'admin-content', component: () => import('../views/admin/ContentView.vue'), meta: { title: '分类与公告', roles: ['ADMIN'] } },
      { path: 'admin/dead-letters', name: 'admin-dead-letters', component: () => import('../views/admin/DeadLettersView.vue'), meta: { title: '死信管理', roles: ['ADMIN'] } },
    ],
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/dashboard/DashboardView.vue'),
    meta: { title: '招聘数据洞察', auth: true, fullscreen: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  document.title = `${to.meta.title || 'DreamHiring'} · DreamHiring`
  const identityValid = await auth.ensureIdentity()

  if (to.meta.public) {
    if (identityValid) return ROLE_HOME[auth.role] || '/login'
    return true
  }

  if (!identityValid) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return ROLE_HOME[auth.role] || '/login'
  }

  return true
})

export default router
