<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth.js'
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants.js'
import { authApi } from '../../api/index.js'
import { isMockMode } from '../../utils/runtime.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

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

async function submit() {
  if (!captcha.id) {
    ElMessage.warning('验证码尚未加载')
    return
  }
  if (!isMockMode && !form.captchaCode.trim()) {
    ElMessage.warning('请输入图形验证码')
    return
  }
  loading.value = true
  try {
    const user = await auth.login({
      username: form.username,
      password: form.password,
      captchaId: captcha.id,
      captchaCode: form.captchaCode,
    })
    ElMessage.success('登录成功')
    router.push(route.query.redirect || ROLE_HOME[user.role])
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
    form.captchaCode = ''
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
      <h2>欢迎使用 DreamHiring</h2>
      <p class="hint">
        {{ isMockMode ? '演示账号密码均为 dreamhiring，选择身份即可快速进入。' : '请使用平台账号登录，验证码有效期为 120 秒。' }}
      </p>

      <div class="role-picker">
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

      <el-form label-position="top" @submit.prevent="submit">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="图形验证码">
          <div class="captcha-row">
            <el-input
              v-model="form.captchaCode"
              maxlength="6"
              :placeholder="isMockMode ? '演示模式可留空' : '请输入验证码'"
            />
            <button
              class="captcha-image"
              type="button"
              :disabled="captchaLoading"
              title="点击刷新验证码"
              @click="refreshCaptcha"
            >
              <img v-if="captcha.image" :src="captcha.image" alt="图形验证码" />
              <span v-else>{{ captchaLoading ? '加载中' : '获取验证码' }}</span>
            </button>
          </div>
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="submit">
          登录
        </el-button>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 10px;
  width: 100%;
}

.captcha-image {
  display: grid;
  place-items: center;
  min-height: 32px;
  padding: 0;
  overflow: hidden;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f6f8ff;
  cursor: pointer;
}

.captcha-image img {
  display: block;
  width: 100%;
  height: 38px;
  object-fit: cover;
}
</style>
