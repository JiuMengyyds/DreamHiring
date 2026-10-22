<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { companyApi, fileApi } from '../../api/index.js'
import { AUDIT_STATUS } from '../../utils/constants.js'

const company = ref(null)
const loading = ref(false)
const logoUploading = ref(false)
const logoInput = ref(null)
const logoPreviewUrl = ref('')
const form = reactive({
  name: '',
  industry: '',
  scale: '',
  city: '',
  intro: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  logoObjectKey: '',
})

async function load() {
  loading.value = true
  try {
    company.value = await companyApi.profile()
    Object.assign(form, company.value)
    logoPreviewUrl.value = company.value.logoUrl || ''
  } finally {
    loading.value = false
  }
}

async function save() {
  await companyApi.updateProfile({ ...form })
  ElMessage.success('企业资料已保存')
  load()
}

function chooseLogo() {
  logoInput.value?.click()
}

async function uploadLogo(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    ElMessage.warning('Logo 仅支持 PNG、JPG 或 WebP')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('Logo 不能超过 10MB')
    return
  }
  logoUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('scope', 'COMPANY_LOGO')
    const uploaded = await fileApi.upload(formData)
    form.logoObjectKey = uploaded.objectKey
    logoPreviewUrl.value = uploaded.url
    ElMessage.success('Logo 已上传，保存资料后生效')
  } catch (error) {
    ElMessage.error(error.message || 'Logo 上传失败')
  } finally {
    logoUploading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading">
    <PageHead
      eyebrow="COMPANY PROFILE"
      title="企业主页"
      description="完善企业资料和品牌信息，提升求职者信任度。"
    >
      <el-tag v-if="company" :type="AUDIT_STATUS[company.auditStatus]?.type">{{ AUDIT_STATUS[company.auditStatus]?.label }}</el-tag>
      <el-button type="primary" @click="save">保存修改</el-button>
    </PageHead>

    <section class="panel" v-if="company">
      <el-alert
        v-if="company.auditReason"
        :title="`审核说明：${company.auditReason}`"
        :type="company.auditStatus === 'REJECTED' ? 'error' : 'info'"
        :closable="false"
        style="margin-bottom: 18px"
      />
      <div class="brand-upload">
        <el-avatar :size="76" shape="square" :src="logoPreviewUrl">
          {{ company.name?.slice(0, 1) }}
        </el-avatar>
        <div>
          <strong>企业 Logo</strong>
          <p>支持 PNG、JPG、WebP，建议使用正方形图片，最大 10MB。</p>
          <el-button :loading="logoUploading" @click="chooseLogo">上传 Logo</el-button>
          <input ref="logoInput" type="file" accept=".png,.jpg,.jpeg,.webp" hidden @change="uploadLogo" />
        </div>
      </div>
      <el-form label-position="top" style="max-width: 720px">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <el-form-item label="企业名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="所属行业"><el-input v-model="form.industry" /></el-form-item>
          <el-form-item label="企业规模"><el-input v-model="form.scale" /></el-form-item>
          <el-form-item label="所在城市"><el-input v-model="form.city" /></el-form-item>
          <el-form-item label="联系人"><el-input v-model="form.contactName" /></el-form-item>
          <el-form-item label="联系电话"><el-input v-model="form.contactPhone" /></el-form-item>
          <el-form-item label="联系邮箱"><el-input v-model="form.contactEmail" /></el-form-item>
        </div>
        <el-form-item label="企业简介">
          <el-input v-model="form.intro" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.brand-upload {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.brand-upload p {
  margin: 5px 0 10px;
  color: var(--muted);
  font-size: 12px;
}
</style>
