<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth.js'
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants.js'

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

function selectRole(role) {
  form.role = role
  form.username = accountByRole[role].username
}

async function submit() {
  loading.value = true
  try {
    await auth.login({
      username: form.username,
      password: form.password,
      captchaId: 'mock-captcha',
      captchaCode: form.captchaCode,
    })
    ElMessage.success('登录成功')
    router.push(route.query.redirect || ROLE_HOME[form.role])
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
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
      <p class="hint">演示账号密码均为 dreamhiring，选择身份即可快速进入。</p>

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
          <el-input v-model="form.captchaCode" placeholder="演示模式可留空" />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="submit">
          登录
        </el-button>
      </el-form>
    </section>
  </div>
</template>
