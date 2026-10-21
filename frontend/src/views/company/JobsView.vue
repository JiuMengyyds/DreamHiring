<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { companyApi } from '../../api/index.js'
import { JOB_STATUS, AUDIT_STATUS } from '../../utils/constants.js'
import { formatSalary } from '../../utils/format.js'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = reactive({
  title: '',
  city: '杭州',
  salaryMin: 20,
  salaryMax: 30,
  education: 'BACHELOR',
  experience: 'THREE_TO_FIVE',
  skillTagsText: 'Figma，B端产品，设计系统',
  description: '负责企业协同产品的体验设计。',
})

async function load() {
  loading.value = true
  try {
    const data = await companyApi.jobs({ page: 1, size: 50 })
    list.value = data.records
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row) {
  const next = row.status === 'PUBLISHED' ? 'OFFLINE' : 'PUBLISHED'
  await companyApi.updateJobStatus(row.id, { status: next })
  ElMessage.success(next === 'PUBLISHED' ? '职位已上架' : '职位已下线')
  load()
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除职位「${row.title}」？`, '删除职位', { type: 'warning' })
  await companyApi.deleteJob(row.id)
  ElMessage.success('职位已删除')
  load()
}

async function create() {
  const payload = {
    ...form,
    categoryId: 12,
    salaryMin: Number(form.salaryMin),
    salaryMax: Number(form.salaryMax),
    skillTags: form.skillTagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean),
    duties: [],
    requirements: [],
    perks: [],
  }
  delete payload.skillTagsText
  await companyApi.createJob(payload)
  dialogVisible.value = false
  ElMessage.success('职位已提交审核')
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="JOB MANAGEMENT"
      title="职位管理"
      description="统一管理职位发布、上下架和审核状态。"
    >
      <el-button type="primary" @click="dialogVisible = true">发布新职位</el-button>
    </PageHead>

    <div class="table-panel" v-loading="loading">
      <div class="table-panel__head">
        <h2>全部职位</h2>
        <span class="table-panel__spacer" />
        <el-input v-model="form.title" placeholder="筛选职位名称" style="width: 220px" clearable />
      </div>
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="title" label="职位名称" min-width="180" />
        <el-table-column label="薪资" width="120">
          <template #default="{ row }">{{ formatSalary(row.salaryMin, row.salaryMax) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }"><el-tag :type="JOB_STATUS[row.status]?.type">{{ JOB_STATUS[row.status]?.label }}</el-tag></template>
        </el-table-column>
        <el-table-column label="审核" width="120">
          <template #default="{ row }"><el-tag :type="AUDIT_STATUS[row.auditStatus]?.type">{{ AUDIT_STATUS[row.auditStatus]?.label }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="applicantCount" label="投递数" width="90" />
        <el-table-column prop="updatedAt" label="最近更新" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="toggleStatus(row)">{{ row.status === 'PUBLISHED' ? '下线' : '上架' }}</el-button>
            <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" title="发布新职位" width="640px">
      <el-form label-position="top">
        <el-form-item label="职位名称"><el-input v-model="form.title" /></el-form-item>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <el-form-item label="工作城市"><el-input v-model="form.city" /></el-form-item>
          <el-form-item label="学历要求">
            <el-select v-model="form.education" style="width: 100%">
              <el-option label="本科" value="BACHELOR" />
              <el-option label="大专" value="COLLEGE" />
              <el-option label="硕士" value="MASTER" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低月薪 K"><el-input-number v-model="form.salaryMin" :min="1" /></el-form-item>
          <el-form-item label="最高月薪 K"><el-input-number v-model="form.salaryMax" :min="1" /></el-form-item>
        </div>
        <el-form-item label="核心技能标签"><el-input v-model="form.skillTagsText" /></el-form-item>
        <el-form-item label="职位描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="create">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>
