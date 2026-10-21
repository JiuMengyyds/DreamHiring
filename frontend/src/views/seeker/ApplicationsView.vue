<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHead from '../../components/PageHead.vue'
import { applicationApi } from '../../api/index.js'
import { APPLICATION_STATUS } from '../../utils/constants.js'
import { formatDateTime, formatSalary } from '../../utils/format.js'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const activeStatus = ref('')

const statusOptions = [{ label: '全部', value: '' }, ...Object.entries(APPLICATION_STATUS).map(([value, item]) => ({ label: item.label, value }))]

async function load() {
  loading.value = true
  try {
    const data = await applicationApi.mine({ status: activeStatus.value || undefined, page: 1, size: 50 })
    list.value = data.records
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="APPLICATION TRACKER"
      title="我的投递"
      description="跟踪每一次投递的进展，面试邀请和状态变更会同步到站内消息。"
    >
      <el-button type="primary" @click="router.push('/seeker/jobs')">继续找工作</el-button>
    </PageHead>

    <div class="filter-bar">
      <el-radio-group v-model="activeStatus" @change="load">
        <el-radio-button v-for="item in statusOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="table-panel" v-loading="loading">
      <div class="table-panel__head">
        <h2>投递记录</h2>
        <span class="table-panel__spacer" />
        <span style="color: var(--muted); font-size: 12px">共 {{ list.length }} 条</span>
      </div>
      <el-table :data="list" style="width: 100%">
        <el-table-column label="职位 / 企业" min-width="240">
          <template #default="{ row }">
            <div>
              <el-button link type="primary" @click="router.push(`/seeker/jobs/${row.jobId}`)">
                {{ row.job?.title }}
              </el-button>
              <div style="color: var(--muted); font-size: 12px">{{ row.job?.companyName }} · {{ row.job?.city }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="匹配度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.matchScore" :stroke-width="8" />
          </template>
        </el-table-column>
        <el-table-column label="投递时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.deliveryTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="APPLICATION_STATUS[row.status]?.type">{{ APPLICATION_STATUS[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="薪资" width="130">
          <template #default="{ row }">{{ formatSalary(row.job?.salaryMin, row.job?.salaryMax) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
