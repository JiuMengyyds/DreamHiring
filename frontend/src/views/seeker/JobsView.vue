<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import JobCard from '../../components/JobCard.vue'
import { applicationApi, jobApi } from '../../api/index.js'
import { getDefaultResumeId } from '../../utils/resume.js'

const filters = reactive({
  keyword: '',
  city: '',
  salaryMin: '',
  salaryMax: '',
  education: '',
  experience: '',
})

const jobs = ref([])
const resumeId = ref(null)
const loading = ref(false)

async function search() {
  loading.value = true
  try {
    const data = await jobApi.search({ ...filters, page: 1, size: 30 })
    jobs.value = data.records
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(filters, { keyword: '', city: '', salaryMin: '', salaryMax: '', education: '', experience: '' })
  search()
}

async function apply(job) {
  if (!resumeId.value) {
    ElMessage.warning('请先创建在线简历')
    return
  }
  try {
    await applicationApi.create({ jobId: job.id, resumeId: resumeId.value })
    ElMessage.success('投递成功')
  } catch (error) {
    ElMessage.error(error.message || '投递失败')
  }
}

onMounted(async () => {
  await Promise.all([
    search(),
    getDefaultResumeId().then((id) => { resumeId.value = id }),
  ])
})
</script>

<template>
  <div>
    <PageHead
      eyebrow="JOB DISCOVERY"
      title="职位广场"
      description="多条件组合筛选，结合简历技能标签展示可解释的匹配度。"
    >
      <el-button @click="reset">重置筛选</el-button>
      <el-button type="primary" @click="search">筛选职位</el-button>
    </PageHead>

    <section class="filter-bar">
      <el-input v-model="filters.keyword" class="keyword" clearable placeholder="职位、公司或技能关键词" />
      <el-select v-model="filters.city" clearable placeholder="城市">
        <el-option v-for="city in ['杭州', '上海', '北京', '深圳', '成都']" :key="city" :label="city" :value="city" />
      </el-select>
      <el-input v-model="filters.salaryMin" placeholder="最低薪资 K" />
      <el-select v-model="filters.education" clearable placeholder="学历">
        <el-option label="大专" value="COLLEGE" />
        <el-option label="本科" value="BACHELOR" />
        <el-option label="硕士" value="MASTER" />
        <el-option label="博士" value="DOCTOR" />
      </el-select>
      <el-select v-model="filters.experience" clearable placeholder="经验">
        <el-option label="应届" value="FRESH" />
        <el-option label="1-3年" value="ONE_TO_THREE" />
        <el-option label="3-5年" value="THREE_TO_FIVE" />
        <el-option label="5-10年" value="FIVE_TO_TEN" />
      </el-select>
    </section>

    <el-skeleton v-if="loading" :rows="8" animated />
    <div v-else-if="jobs.length" class="job-list">
      <JobCard v-for="job in jobs" :key="job.id" :job="job" show-apply @apply="apply" />
    </div>
    <el-empty v-else description="没有找到符合条件的职位" />
  </div>
</template>
