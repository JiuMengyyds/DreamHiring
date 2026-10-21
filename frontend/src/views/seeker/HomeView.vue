<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import StatCard from '../../components/StatCard.vue'
import JobCard from '../../components/JobCard.vue'
import { jobApi } from '../../api/index.js'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()
const hotJobs = ref([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    hotJobs.value = await jobApi.hot(4)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <PageHead
      eyebrow="2026.10.21 · 求职工作台"
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
      <StatCard label="简历完整度" value="86%" foot="再补充项目经历" />
      <StatCard label="高匹配新职位" value="12 个" foot="较昨日新增 4 个" />
      <StatCard label="进行中的投递" value="3 个" foot="其中 1 个进入面试" />
      <StatCard label="未读消息" value="2 条" foot="其中 1 条面试邀请" />
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
