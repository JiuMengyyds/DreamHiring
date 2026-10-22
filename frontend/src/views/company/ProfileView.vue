<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { companyApi } from '../../api/index.js'
import { AUDIT_STATUS } from '../../utils/constants.js'

const company = ref(null)
const loading = ref(false)
const form = reactive({
  name: '',
  industry: '',
  scale: '',
  city: '',
  intro: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
})

async function load() {
  loading.value = true
  try {
    company.value = await companyApi.profile()
    Object.assign(form, company.value)
  } finally {
    loading.value = false
  }
}

async function save() {
  await companyApi.updateProfile({ ...form })
  ElMessage.success('企业资料已保存')
  load()
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
