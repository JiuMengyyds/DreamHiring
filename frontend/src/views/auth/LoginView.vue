<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth.js'
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants.js'
import { resolveLoginDestination } from '../../utils/navigation.js'
import { authApi } from '../../api/index.js'
import { isMockMode } from '../../utils/runtime.js'
import CaptchaImage from '../../components/CaptchaImage.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const authMode = ref('login')

const accountByRole = {
  SEEKER: { username: 'linzhixia', password: 'dreamhiring' },
  COMPANY: { username: 'chenyu_hr', password: 'dreamhiring' },
  ADMIN: { username: 'admin_zhou', password: 'dreamhiring' },
}

const form = reactive({
  role: 'SEEKER',
  username: accountByRole.SEEKER.username,
  password: 'dreamhiring',
  captchaCode: '',
})

const registerForm = reactive({
  role: 'SEEKER',
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  captchaCode: '',
})

const loading = ref(false)
const captchaLoading = ref(false)
const captcha = reactive({
  id: '',
  image: '',
  expiresIn: 0,
})

function selectRole(role) {
  form.role = role
  form.username = accountByRole[role].username
}

function switchMode(mode) {
  authMode.value = mode
  form.captchaCode = ''
  registerForm.captchaCode = ''
  refreshCaptcha()
}

async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const data = await authApi.captcha()
    captcha.id = data.captchaId
    captcha.image = data.imageBase64
    captcha.expiresIn = data.expiresIn
  } catch (error) {
    ElMessage.error(error.message || '验证码加载失败')
  } finally {
    captchaLoading.value = false
  }
}

function requireCaptcha(code) {
  if (!captcha.id) {
    ElMessage.warning('验证码尚未加载')
    return false
  }
  if (!isMockMode && !code.trim()) {
    ElMessage.warning('请输入图形验证码')
    return false
  }
  return true
}

async function submitLogin() {
  if (!requireCaptcha(form.captchaCode)) return
  loading.value = true
  try {
    const user = await auth.login({
      username: form.username,
      password: form.password,
      captchaId: captcha.id,
      captchaCode: form.captchaCode,
    })
    ElMessage.success('登录成功')
    router.push(resolveLoginDestination(route.query.redirect, user.role))
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
    form.captchaCode = ''
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!requireCaptcha(registerForm.captchaCode)) return
  loading.value = true
  try {
    const user = await auth.register({
      username: registerForm.username,
      password: registerForm.password,
      nickname: registerForm.nickname,
      phone: registerForm.phone,
      email: registerForm.email,
      role: registerForm.role,
      captchaId: captcha.id,
      captchaCode: registerForm.captchaCode,
    })
    ElMessage.success('注册成功')
    router.push(ROLE_HOME[user.role])
  } catch (error) {
    ElMessage.error(error.message || '注册失败')
    registerForm.captchaCode = ''
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(refreshCaptcha)
</script>

<template>
  <div class="login-page">
    <section class="login-story">
      <div>
        <span class="brand-mark">D</span>
        <h1>让每一次选择，<br>都更接近理想工作。</h1>
        <p>清晰透明的进度、可解释的人岗匹配，以及真实的数据洞察，帮助求职者与企业做出更好的决定。</p>
      </div>
    </section>

    <section class="login-form">
      <h2>{{ authMode === 'login' ? '欢迎使用 DreamHiring' : '创建 DreamHiring 账号' }}</h2>
      <p class="hint">
        {{ isMockMode ? '演示账号密码均为 dreamhiring，选择身份即可快速进入。' : '验证码有效期为 120 秒，登录或注册后都会校验真实身份。' }}
      </p>

      <div class="auth-mode-switch">
        <button type="button" :class="{ active: authMode === 'login' }" @click="switchMode('login')">登录</button>
        <button type="button" :class="{ active: authMode === 'register' }" @click="switchMode('register')">注册</button>
      </div>

      <div v-if="authMode === 'login'" class="role-picker">
        <button
          v-for="(label, role) in ROLE_LABELS"
          :key="role"
          type="button"
          class="role-pick"
          :class="{ 'is-active': form.role === role }"
          @click="selectRole(role)"
        >
          {{ label }}
        </button>
      </div>
      <div v-else class="role-picker">
        <button
          v-for="role in ['SEEKER', 'COMPANY']"
          :key="role"
          type="button"
          class="role-pick"
          :class="{ 'is-active': registerForm.role === role }"
          @click="registerForm.role = role"
        >
          {{ ROLE_LABELS[role] }}
        </button>
      </div>

      <el-form v-if="authMode === 'login'" label-position="top" @submit.prevent="submitLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="图形验证码">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" maxlength="6" :placeholder="isMockMode ? '演示模式可留空' : '请输入验证码'" />
            <CaptchaImage :image="captcha.image" :loading="captchaLoading" @refresh="refreshCaptcha" />
          </div>
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="submitLogin">
          登录
        </el-button>
      </el-form>

      <el-form v-else label-position="top" @submit.prevent="submitRegister">
        <el-form-item label="账号">
          <el-input v-model="registerForm.username" placeholder="3-50 个字符" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="registerForm.password" type="password" show-password placeholder="至少 8 个字符" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="registerForm.nickname" placeholder="用于页面展示" />
        </el-form-item>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
          <el-form-item label="手机号">
            <el-input v-model="registerForm.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="registerForm.email" />
          </el-form-item>
        </div>
        <el-form-item label="图形验证码">
          <div class="captcha-row">
            <el-input v-model="registerForm.captchaCode" maxlength="6" :placeholder="isMockMode ? '演示模式可留空' : '请输入验证码'" />
            <CaptchaImage :image="captcha.image" :loading="captchaLoading" @refresh="refreshCaptcha" />
          </div>
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="submitRegister">
          注册并登录
        </el-button>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.auth-mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  margin-bottom: 16px;
  border-radius: 10px;
  background: #edf2ff;
}

.auth-mode-switch button {
  padding: 8px;
  color: var(--muted);
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.auth-mode-switch button.active {
  color: var(--ink);
  background: #fff;
  box-shadow: 0 3px 10px rgba(55, 80, 140, 0.12);
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 10px;
  width: 100%;
}

</style>
