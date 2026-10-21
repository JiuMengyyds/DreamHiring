<script setup>
import { onMounted, ref } from 'vue'
import PageHead from '../../components/PageHead.vue'
import { adminApi } from '../../api/index.js'
import { AUDIT_STATUS } from '../../utils/constants.js'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await adminApi.companies({ page: 1, size: 100 })
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
      eyebrow="COMPANY MANAGEMENT"
      title="企业管理"
      description="核验企业主体与招聘资质，维护平台企业信息质量。"
    >
      <el-button @click="load">刷新</el-button>
    </PageHead>

    <div class="table-panel" v-loading="loading">
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="name" label="企业名称" min-width="180" />
        <el-table-column prop="industry" label="行业" width="140" />
        <el-table-column prop="scale" label="规模" width="120" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column label="认证状态" width="130">
          <template #default="{ row }"><el-tag :type="AUDIT_STATUS[row.auditStatus]?.type">{{ AUDIT_STATUS[row.auditStatus]?.label }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
