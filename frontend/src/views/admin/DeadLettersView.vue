<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { adminApi } from '../../api/index.js'

const records = ref([])
const total = ref(0)
const loading = ref(false)
const activeStatus = ref('')
const page = ref(1)
const size = ref(10)

const statusOptions = [
  { label: '全部', value: '' },
  { label: '待处理', value: 'PENDING' },
  { label: '重投中', value: 'REPLAYING' },
  { label: '已重投', value: 'REPLAYED' },
]

const statusMeta = {
  PENDING: { label: '待处理', type: 'warning' },
  REPLAYING: { label: '重投中', type: 'primary' },
  REPLAYED: { label: '已重投', type: 'success' },
}

const hasRecords = computed(() => records.value.length > 0)

async function load() {
  loading.value = true
  try {
    const data = await adminApi.deadLetters({
      status: activeStatus.value || undefined,
      page: page.value,
      size: size.value,
    })
    records.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function replay(row) {
  try {
    await ElMessageBox.confirm(
      `确认将死信 #${row.id} 重投到 ${row.routingKey || '默认路由'}？`,
      '重投死信消息',
      { type: 'warning', confirmButtonText: '确认重投' },
    )
    await adminApi.replayDeadLetter(row.id)
    ElMessage.success('死信消息已重投')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '重投失败')
    }
  }
}

function formatJson(value) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function filterByStatus(value) {
  activeStatus.value = value
  page.value = 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="MESSAGE RELIABILITY"
      title="死信管理"
      description="查看消费者重试耗尽后的消息归档，定位失败原因并在确认幂等后重新投递。"
    >
      <el-button @click="load">刷新</el-button>
    </PageHead>

    <div class="filter-bar">
      <el-radio-group :model-value="activeStatus" @change="filterByStatus">
        <el-radio-button
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="table-panel" v-loading="loading">
      <el-table v-if="hasRecords" :data="records" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 8px 24px 20px">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="交换机">{{ row.exchangeName || '默认交换机' }}</el-descriptions-item>
                <el-descriptions-item label="消息 ID">{{ row.messageId || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="关联 ID">{{ row.correlationId || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="内容类型">{{ row.contentType || '未知' }}</el-descriptions-item>
              </el-descriptions>
              <h4 style="margin: 18px 0 8px">失败原因</h4>
              <el-alert :title="row.failureReason || '未记录失败原因'" type="error" :closable="false" />
              <h4 style="margin: 18px 0 8px">消息体</h4>
              <pre class="dead-letter-code">{{ formatJson(row.messageBody) }}</pre>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="queueName" label="来源队列" min-width="220" />
        <el-table-column prop="routingKey" label="路由键" min-width="200" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusMeta[row.status]?.type">
              {{ statusMeta[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="replayCount" label="重投次数" width="100" />
        <el-table-column prop="createdAt" label="归档时间" width="180" />
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PENDING'"
              size="small"
              type="primary"
              @click="replay(row)"
            >
              重投
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无符合条件的死信消息" />
    </div>

    <div v-if="total > size" style="display: flex; justify-content: flex-end; margin-top: 16px">
      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="load"
      />
    </div>
  </div>
</template>

<style scoped>
.dead-letter-code {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  border-radius: 8px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 12px;
  line-height: 1.7;
}
</style>
