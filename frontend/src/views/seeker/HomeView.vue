<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import StatCard from '../../components/StatCard.vue'
import JobCard from '../../components/JobCard.vue'
import { applicationApi, jobApi, messageApi, resumeApi } from '../../api/index.js'
import { useAuthStore } from '../../stores/auth.js'
import { calculateResumeCompletion, countActiveApplications } from '../../utils/dashboard.js'

const router = useRouter()
const auth = useAuthStore()
const hotJobs = ref([])
const loading = ref(false)
const metrics = reactive({
  resumeCompletion: 0,
  availableJobs: 0,
  activeApplications: 0,
  interviews: 0,
  unreadMessages: 0,
})

async function loadData() {
  loading.value = true
  try {
    const [hot, jobsPage, resumes, applications, unread] = await Promise.all([
      jobApi.hot(4),
      jobApi.search({ page: 1, size: 1 }),
      resumeApi.list(),
      applicationApi.mine({ page: 1, size: 100 }),
      messageApi.unreadCount(),
    ])
    hotJobs.value = hot
    metrics.availableJobs = jobsPage.total
    metrics.resumeCompletion = calculateResumeCompletion(resumes[0])
    metrics.activeApplications = countActiveApplications(applications.records)
    metrics.interviews = applications.records.filter((item) => item.status === 'INTERVIEW').length
    metrics.unreadMessages = unread.count
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <PageHead
      eyebrow="JOB SEEKER"
      :title="`早上好，${auth.user?.nickname || '知夏'}`"
      description="继续浏览高匹配职位，向理想工作靠近。"
    >
      <el-button @click="router.push('/seeker/resume')">完善简历</el-button>
      <el-button type="primary" @click="router.push('/seeker/jobs')">浏览职位</el-button>
    </PageHead>

    <section class="hero-banner" style="margin-bottom: 16px">
      <h1>下一份理想工作，从一次更懂你的搜索开始。</h1>
      <p>聚合优质职位与真实招聘反馈，让匹配理由可见，让每一次投递更有把握。</p>
      <el-button type="warning" size="large" style="margin-top: 14px" @click="router.push('/seeker/jobs')">
        找工作
      </el-button>
    </section>

    <section class="metric-grid" style="margin-bottom: 16px">
      <StatCard label="简历完整度" :value="`${metrics.resumeCompletion}%`" foot="上传附件可进一步提升完整度" />
      <StatCard label="当前在招职位" :value="`${metrics.availableJobs} 个`" foot="来自已审核上架职位" />
      <StatCard label="进行中的投递" :value="`${metrics.activeApplications} 个`" :foot="`其中 ${metrics.interviews} 个进入面试`" />
      <StatCard label="未读消息" :value="`${metrics.unreadMessages} 条`" foot="面试邀请与状态反馈" />
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h2>为你精选</h2>
          <p>综合技能、经验和求职意向，为你优先推荐</p>
        </div>
        <el-button link type="primary" @click="router.push('/seeker/jobs')">查看全部职位</el-button>
      </div>

      <el-skeleton v-if="loading" :rows="5" animated />
      <div v-else class="job-list">
        <JobCard v-for="job in hotJobs" :key="job.id" :job="job" />
      </div>
    </section>
  </div>
</template>
