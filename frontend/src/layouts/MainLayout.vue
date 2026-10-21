<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'
import { navByRole } from '../router/nav.js'
import { ROLE_LABELS, ROLE_HOME } from '../utils/constants.js'
import { messageApi } from '../api/index.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)
const unreadCount = ref(0)

const navItems = computed(() => navByRole[auth.role] || [])
const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))

const pageTitle = computed(() => route.meta.title || '')

function handleNav(routePath) {
  router.push(routePath)
}

function switchRole(role) {
  const usernameByRole = { SEEKER: 'linzhixia', COMPANY: 'chenyu_hr', ADMIN: 'admin_zhou' }
  auth.token = `mock-token-${usernameByRole[role]}`
  auth.user = { ...auth.user, role }
  localStorage.setItem('dreamhiring_token', auth.token)
  localStorage.setItem('dreamhiring_user', JSON.stringify(auth.user))
  router.push(ROLE_HOME[role])
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

async function loadUnreadCount() {
  try {
    const data = await messageApi.unreadCount()
    unreadCount.value = data.count
  } catch {
    unreadCount.value = 0
  }
}

onMounted(loadUnreadCount)
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">D</span>
        <span class="brand-copy">
          <strong>DreamHiring</strong>
          <small>招聘平台</small>
        </span>
      </div>

      <div class="role-chip">
        <span>{{ ROLE_LABELS[auth.role] }}</span>
        <el-dropdown trigger="click" @command="switchRole">
          <button class="role-switch" type="button">切换视角</button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in roleOptions" :key="item.value" :command="item.value">
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-menu
        :default-active="route.path"
        class="side-nav"
        @select="handleNav"
      >
        <el-menu-item v-for="item in navItems" :key="item.route" :index="item.route">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
          <span v-if="item.route.includes('messages') && unreadCount" class="nav-badge">{{ unreadCount }}</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-foot">
        <div class="help-card">
          <strong>演示模式</strong>
          <p>当前页面由本地 Mock 数据驱动，可点击切换角色体验完整链路。</p>
        </div>
        <div class="sidebar-user">
          <el-avatar :size="34">{{ user?.nickname?.slice(0, 1) }}</el-avatar>
          <span class="sidebar-user-copy">
            <strong>{{ user?.nickname }}</strong>
            <small>{{ ROLE_LABELS[auth.role] }}</small>
          </span>
          <el-button link type="danger" size="small" @click="logout">退出</el-button>
        </div>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="breadcrumb">
          <span>DreamHiring</span>
          <el-icon><ArrowRight /></el-icon>
          <strong>{{ pageTitle }}</strong>
        </div>
        <div class="topbar-actions">
          <el-badge :value="unreadCount" :hidden="!unreadCount" :max="99">
            <el-button circle @click="router.push(`/${auth.role.toLowerCase()}/messages`)">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-avatar :size="32">{{ user?.nickname?.slice(0, 1) }}</el-avatar>
        </div>
      </header>

      <main class="view">
        <router-view />
      </main>
    </section>
  </div>
</template>
