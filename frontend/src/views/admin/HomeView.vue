<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import StatCard from '../../components/StatCard.vue'
import { adminApi } from '../../api/index.js'

const router = useRouter()
const jobs = ref([])
const pending = ref(0)

async function load() {
  const data = await adminApi.jobs({ page: 1, size: 100 })
  jobs.value = data.records
  pending.value = jobs.value.filter((item) => item.auditStatus === 'PENDING').length
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
      <StatCard label="平台注册用户" value="12,846" foot="本周新增 286 人" />
      <StatCard label="已认证企业" value="1,204" foot="认证通过率 97.3%" />
      <StatCard label="在架职位" value="3,862" foot="较上周增长 8.6%" />
      <StatCard label="今日投递" value="1,526" foot="较昨日增长 12.4%" />
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h2>待审核职位</h2>
          <p>当前有 {{ pending }} 个职位等待审核</p>
        </div>
        <el-button link type="primary" @click="router.push('/admin/audits')">进入审核中心</el-button>
      </div>
      <el-table :data="jobs.filter((item) => item.auditStatus === 'PENDING')" style="width: 100%">
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
