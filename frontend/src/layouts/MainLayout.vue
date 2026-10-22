<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'
import { navByRole } from '../router/nav.js'
import { ROLE_LABELS, ROLE_HOME } from '../utils/constants.js'
import { fileApi, messageApi, userApi } from '../api/index.js'
import { isMockMode } from '../utils/runtime.js'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { user } = storeToRefs(auth)
const unreadCount = ref(0)
const avatarInput = ref(null)
const avatarUploading = ref(false)

const navItems = computed(() => navByRole[auth.role] || [])
const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))

const pageTitle = computed(() => route.meta.title || '')

function handleNav(routePath) {
  router.push(routePath)
}

function switchRole(role) {
  if (!isMockMode) return
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

function chooseAvatar() {
  avatarInput.value?.click()
}

async function uploadAvatar(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    ElMessage.warning('头像仅支持 PNG、JPG 或 WebP')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('头像不能超过 10MB')
    return
  }
  avatarUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('scope', 'AVATAR')
    const uploaded = await fileApi.upload(formData)
    const updated = await userApi.updateMe({ avatarObjectKey: uploaded.objectKey })
    auth.updateUser({ ...auth.user, ...updated })
    ElMessage.success('头像已更新')
  } catch (error) {
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    avatarUploading.value = false
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

      <div v-if="isMockMode" class="role-chip">
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
      <div v-else class="role-chip">
        <span>{{ ROLE_LABELS[auth.role] }}</span>
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
        <div v-if="isMockMode" class="help-card">
          <strong>演示模式</strong>
          <p>当前页面由本地 Mock 数据驱动，可点击切换角色体验完整链路。</p>
        </div>
        <div class="sidebar-user">
          <button type="button" class="avatar-button" :disabled="avatarUploading" @click="chooseAvatar">
            <el-avatar :size="34" :src="user?.avatarUrl">{{ user?.nickname?.slice(0, 1) }}</el-avatar>
          </button>
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
          <button type="button" class="avatar-button" :disabled="avatarUploading" @click="chooseAvatar">
            <el-avatar :size="32" :src="user?.avatarUrl">{{ user?.nickname?.slice(0, 1) }}</el-avatar>
          </button>
        </div>
      </header>

      <main class="view">
        <router-view />
      </main>
    </section>
    <input
      ref="avatarInput"
      type="file"
      accept=".png,.jpg,.jpeg,.webp"
      hidden
      @change="uploadAvatar"
    />
  </div>
</template>

<style scoped>
.avatar-button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.avatar-button:disabled {
  cursor: wait;
  opacity: 0.65;
}
</style>
