<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { adminApi } from '../../api/index.js'
import { AUDIT_STATUS } from '../../utils/constants.js'

const list = ref([])
const loading = ref(false)
const activeStatus = ref('PENDING')
const page = ref(1)
const size = ref(10)
const total = ref(0)

async function load() {
  loading.value = true
  try {
    const data = await adminApi.jobs({
      auditStatus: activeStatus.value,
      page: page.value,
      size: size.value,
    })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function audit(row, status) {
  try {
    let reason = ''
    if (status === 'REJECTED') {
      const result = await ElMessageBox.prompt('请输入职位驳回原因', '驳回职位', {
        inputValidator: (value) => Boolean(value?.trim()) || '驳回原因不能为空',
      })
      reason = result.value.trim()
    }
    await adminApi.auditJob(row.id, { auditStatus: status, reason })
    ElMessage.success(status === 'APPROVED' ? '审核通过' : '职位已驳回')
    load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '审核失败')
    }
  }
}

function changeStatus() {
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="CONTENT REVIEW"
      title="职位审核"
      description="审核职位信息完整性与合规性，保障平台职位真实、透明、有效。"
    >
      <el-button @click="load">刷新</el-button>
    </PageHead>

    <div class="filter-bar">
      <el-radio-group v-model="activeStatus" @change="changeStatus">
        <el-radio-button value="PENDING">待审核</el-radio-button>
        <el-radio-button value="APPROVED">已通过</el-radio-button>
        <el-radio-button value="REJECTED">已驳回</el-radio-button>
      </el-radio-group>
    </div>

    <div class="table-panel" v-loading="loading">
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="title" label="职位名称" min-width="200" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }"><el-tag :type="AUDIT_STATUS[row.auditStatus]?.type">{{ AUDIT_STATUS[row.auditStatus]?.label }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="applicantCount" label="投递数" width="100" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <template v-if="row.auditStatus === 'PENDING'">
              <el-button size="small" type="danger" @click="audit(row, 'REJECTED')">驳回</el-button>
              <el-button size="small" type="primary" @click="audit(row, 'APPROVED')">通过</el-button>
            </template>
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
  </div>
</template>

<style scoped>
.table-panel__pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
