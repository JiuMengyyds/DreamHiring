<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import StatCard from '../../components/StatCard.vue'
import { companyApi } from '../../api/index.js'

const router = useRouter()
const dashboard = ref(null)
const jobs = ref([])
const candidates = ref([])

async function load() {
  const [dash, jobPage, appPage] = await Promise.all([
    companyApi.dashboard(),
    companyApi.jobs({ page: 1, size: 4 }),
    companyApi.applications({ page: 1, size: 4 }),
  ])
  dashboard.value = dash
  jobs.value = jobPage.records
  candidates.value = appPage.records
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="RECRUITING OVERVIEW"
      title="招聘工作台"
      description="掌握职位曝光、候选人进展和团队协作重点。"
    >
      <el-button @click="router.push('/company/profile')">企业主页</el-button>
      <el-button type="primary" @click="router.push('/company/jobs')">发布职位</el-button>
    </PageHead>

    <section class="hero-banner" style="margin-bottom: 16px">
      <h1 v-if="dashboard">今天有 {{ dashboard.pendingCandidateCount }} 位新候选人等待关注。</h1>
      <p v-if="dashboard">当前有 {{ dashboard.activeJobCount }} 个职位正在招聘，建议优先处理待查看候选人。</p>
      <el-button type="warning" @click="router.push('/company/candidates')">处理候选人</el-button>
    </section>

    <section class="metric-grid" style="margin-bottom: 16px" v-if="dashboard">
      <StatCard label="在招职位" :value="dashboard.activeJobCount" foot="招聘状态正常" />
      <StatCard label="待查看候选人" :value="dashboard.pendingCandidateCount" foot="平均响应 3.2 小时" />
      <StatCard label="面试进行中" :value="dashboard.interviewCount" foot="最近一场 · 10 月 22 日" />
      <StatCard label="候选人平均匹配度" :value="`${dashboard.averageMatchScore}%`" foot="较上月提升 5%" />
    </section>

    <div class="detail-layout">
      <section class="panel">
        <div class="section-head">
          <div>
            <h2>招聘中的职位</h2>
            <p>按近 7 天投递活跃度排序</p>
          </div>
          <el-button link type="primary" @click="router.push('/company/jobs')">全部职位</el-button>
        </div>
        <el-table :data="jobs" style="width: 100%">
          <el-table-column prop="title" label="职位" min-width="180" />
          <el-table-column label="投递数" width="100">
            <template #default="{ row }">{{ row.applicantCount }}</template>
          </el-table-column>
          <el-table-column label="待处理" width="100">
            <template #default="{ row }">{{ row.pendingApplicantCount }}</template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="最近更新" width="180" />
        </el-table>
      </section>

      <aside class="panel">
        <div class="section-head">
          <div>
            <h2>最新候选人</h2>
            <p>匹配度优先展示</p>
          </div>
        </div>
        <el-empty v-if="!candidates.length" description="暂无候选人" />
        <div v-else class="candidate-list">
          <div v-for="item in candidates" :key="item.id" class="candidate-row">
            <el-avatar :size="30">{{ item.resume?.name?.slice(0, 1) }}</el-avatar>
            <span>{{ item.resume?.name }} · {{ item.job?.title }}</span>
            <em>{{ item.matchScore }}%</em>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.candidate-list {
  display: grid;
  gap: 12px;
}

.candidate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.candidate-row span {
  flex: 1;
}

.candidate-row em {
  color: var(--mint);
  font-style: normal;
  font-weight: 800;
}
</style>
