<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import StatCard from '../../components/StatCard.vue'
import { adminApi } from '../../api/index.js'

const router = useRouter()
const jobs = ref([])
const pending = ref(0)
const metrics = reactive({
  users: 0,
  approvedCompanies: 0,
  publishedJobs: 0,
})

async function load() {
  const [users, companies, publishedJobs, pendingJobs] = await Promise.all([
    adminApi.users({ page: 1, size: 1 }),
    adminApi.companies({ auditStatus: 'APPROVED', page: 1, size: 1 }),
    adminApi.jobs({ status: 'PUBLISHED', page: 1, size: 1 }),
    adminApi.jobs({ auditStatus: 'PENDING', page: 1, size: 5 }),
  ])
  metrics.users = users.total
  metrics.approvedCompanies = companies.total
  metrics.publishedJobs = publishedJobs.total
  jobs.value = pendingJobs.records
  pending.value = pendingJobs.total
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="PLATFORM COMMAND CENTER"
      title="管理驾驶舱"
      description="聚合平台运营数据、内容治理与用户服务状态。"
    >
      <el-button @click="router.push('/dashboard')">数据大屏</el-button>
      <el-button type="primary" @click="router.push('/admin/audits')">处理待审核</el-button>
    </PageHead>

    <section class="metric-grid" style="margin-bottom: 16px">
      <StatCard label="平台注册用户" :value="metrics.users.toLocaleString()" foot="当前有效账号总数" />
      <StatCard label="已认证企业" :value="metrics.approvedCompanies.toLocaleString()" foot="审核通过的企业" />
      <StatCard label="在架职位" :value="metrics.publishedJobs.toLocaleString()" foot="审核通过且正在招聘" />
      <StatCard label="待审核职位" :value="pending.toLocaleString()" foot="需要管理员处理" />
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h2>待审核职位</h2>
          <p>当前有 {{ pending }} 个职位等待审核</p>
        </div>
        <el-button link type="primary" @click="router.push('/admin/audits')">进入审核中心</el-button>
      </div>
      <el-table :data="jobs" style="width: 100%">
        <el-table-column prop="title" label="职位" min-width="200" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column label="薪资" width="120">
          <template #default="{ row }">{{ row.salaryMin }}-{{ row.salaryMax }}K</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="提交时间" width="180" />
      </el-table>
    </section>
  </div>
</template>
