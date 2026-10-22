<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { companyApi, jobApi } from '../../api/index.js'
import { JOB_STATUS, AUDIT_STATUS } from '../../utils/constants.js'
import { formatSalary } from '../../utils/format.js'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const categories = ref([])
const submitting = ref(false)
const editingJobId = ref(null)
const filterKeyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const form = reactive({
  title: '',
  categoryId: null,
  city: '杭州',
  district: '',
  salaryMin: 20,
  salaryMax: 30,
  education: 'BACHELOR',
  experience: 'THREE_TO_FIVE',
  skillTagsText: 'Figma，B端产品，设计系统',
  description: '负责企业协同产品的体验设计与体验优化，参与完整产品设计链路。',
  dutiesText: '负责核心产品体验设计\n参与需求分析与方案评审',
  requirementsText: '三年以上产品设计经验\n熟悉 B 端产品设计',
  perksText: '弹性工作\n年度体检',
})

async function load() {
  loading.value = true
  try {
    const data = await companyApi.jobs({
      keyword: filterKeyword.value || undefined,
      page: page.value,
      size: size.value,
    })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    title: '',
    categoryId: categories.value[0]?.id ?? null,
    city: '杭州',
    district: '',
    salaryMin: 20,
    salaryMax: 30,
    education: 'BACHELOR',
    experience: 'THREE_TO_FIVE',
    skillTagsText: 'Figma，B端产品，设计系统',
    description: '负责企业协同产品的体验设计与体验优化，参与完整产品设计链路。',
    dutiesText: '负责核心产品体验设计\n参与需求分析与方案评审',
    requirementsText: '三年以上产品设计经验\n熟悉 B 端产品设计',
    perksText: '弹性工作\n年度体检',
  })
}

function openCreate() {
  editingJobId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editingJobId.value = row.id
  Object.assign(form, {
    title: row.title,
    categoryId: row.categoryId,
    city: row.city,
    district: row.district || '',
    salaryMin: row.salaryMin,
    salaryMax: row.salaryMax,
    education: row.education,
    experience: row.experience,
    skillTagsText: (row.skillTags || []).join('，'),
    description: row.description || '',
    dutiesText: (row.duties || []).join('\n'),
    requirementsText: (row.requirements || []).join('\n'),
    perksText: (row.perks || []).join('\n'),
  })
  dialogVisible.value = true
}

function searchJobs() {
  page.value = 1
  load()
}

async function toggleStatus(row) {
  try {
    const next = row.status === 'PUBLISHED' ? 'OFFLINE' : 'PUBLISHED'
    await companyApi.updateJobStatus(row.id, { status: next })
    ElMessage.success(next === 'PUBLISHED' ? '职位已上架' : '职位已下线')
    load()
  } catch (error) {
    ElMessage.warning(error.message || '职位状态更新失败')
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确认删除职位「${row.title}」？`, '删除职位', { type: 'warning' })
  await companyApi.deleteJob(row.id)
  ElMessage.success('职位已删除')
  load()
}

async function submitJob() {
  if (!form.title.trim() || !form.categoryId) {
    ElMessage.warning('请填写职位名称并选择分类')
    return
  }
  if (form.salaryMin > form.salaryMax) {
    ElMessage.warning('最低薪资不能高于最高薪资')
    return
  }
  submitting.value = true
  const payload = {
    ...form,
    salaryMin: Number(form.salaryMin),
    salaryMax: Number(form.salaryMax),
    skillTags: form.skillTagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean),
    duties: form.dutiesText.split('\n').map((item) => item.trim()).filter(Boolean),
    requirements: form.requirementsText.split('\n').map((item) => item.trim()).filter(Boolean),
    perks: form.perksText.split('\n').map((item) => item.trim()).filter(Boolean),
  }
  delete payload.skillTagsText
  delete payload.dutiesText
  delete payload.requirementsText
  delete payload.perksText
  try {
    if (editingJobId.value) {
      await companyApi.updateJob(editingJobId.value, payload)
    } else {
      await companyApi.createJob(payload)
    }
    dialogVisible.value = false
    ElMessage.success(editingJobId.value ? '职位已更新并重新提交审核' : '职位已提交审核')
    load()
  } catch (error) {
    ElMessage.error(error.message || '职位提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const [tree] = await Promise.all([jobApi.categories(), load()])
  categories.value = tree.flatMap((item) => item.children || [])
  resetForm()
})
</script>

<template>
  <div>
    <PageHead
      eyebrow="JOB MANAGEMENT"
      title="职位管理"
      description="统一管理职位发布、上下架和审核状态。"
    >
      <el-button type="primary" @click="openCreate">发布新职位</el-button>
    </PageHead>

    <div class="table-panel" v-loading="loading">
      <div class="table-panel__head">
        <h2>全部职位</h2>
        <span class="table-panel__spacer" />
        <el-input
          v-model="filterKeyword"
          placeholder="筛选职位名称"
          style="width: 220px"
          clearable
          @keyup.enter="searchJobs"
          @clear="searchJobs"
        />
        <el-button @click="searchJobs">筛选</el-button>
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
        <el-table-column prop="auditReason" label="审核说明" min-width="160" show-overflow-tooltip />
        <el-table-column prop="applicantCount" label="投递数" width="90" />
        <el-table-column prop="updatedAt" label="最近更新" width="180" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button
              size="small"
              :disabled="row.status !== 'PUBLISHED' && row.auditStatus !== 'APPROVED'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'PUBLISHED' ? '下线' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-panel__pager">
        <el-pagination
          v-model:current-page="page"
          :page-size="size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="load"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingJobId ? '编辑职位' : '发布新职位'" width="640px">
      <el-form label-position="top">
        <el-form-item label="职位名称"><el-input v-model="form.title" /></el-form-item>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <el-form-item label="职位分类">
            <el-select v-model="form.categoryId" style="width: 100%">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="工作城市"><el-input v-model="form.city" /></el-form-item>
          <el-form-item label="工作区域"><el-input v-model="form.district" /></el-form-item>
          <el-form-item label="学历要求">
            <el-select v-model="form.education" style="width: 100%">
              <el-option label="本科" value="BACHELOR" />
              <el-option label="大专" value="COLLEGE" />
              <el-option label="硕士" value="MASTER" />
            </el-select>
          </el-form-item>
          <el-form-item label="经验要求">
            <el-select v-model="form.experience" style="width: 100%">
              <el-option label="应届" value="FRESH" />
              <el-option label="1-3 年" value="ONE_TO_THREE" />
              <el-option label="3-5 年" value="THREE_TO_FIVE" />
              <el-option label="5-10 年" value="FIVE_TO_TEN" />
              <el-option label="10 年以上" value="TEN_PLUS" />
              <el-option label="不限" value="UNLIMITED" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低月薪 K"><el-input-number v-model="form.salaryMin" :min="1" /></el-form-item>
          <el-form-item label="最高月薪 K"><el-input-number v-model="form.salaryMax" :min="1" /></el-form-item>
        </div>
        <el-form-item label="核心技能标签"><el-input v-model="form.skillTagsText" /></el-form-item>
        <el-form-item label="职位描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="工作职责（每行一条）"><el-input v-model="form.dutiesText" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="任职要求（每行一条）"><el-input v-model="form.requirementsText" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="职位福利（每行一条）"><el-input v-model="form.perksText" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitJob">
          {{ editingJobId ? '保存并重新审核' : '提交审核' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.table-panel__pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
