<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { companyApi } from '../../api/index.js'
import { APPLICATION_STATUS } from '../../utils/constants.js'

const columns = [
  { status: 'PENDING_VIEW', title: '待查看' },
  { status: 'VIEWED', title: '已查看' },
  { status: 'INTERVIEW', title: '邀面试' },
  { status: 'REJECTED', title: '不合适' },
]

const list = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)

function group(status) {
  return list.value.filter((item) => item.status === status)
}

async function updateStatus(item, status) {
  try {
    await companyApi.updateApplicationStatus(item.id, { status })
    ElMessage.success(`候选人状态已更新为「${APPLICATION_STATUS[status].label}」`)
    load()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

async function load() {
  loading.value = true
  try {
    const data = await companyApi.applications({ page: page.value, size: size.value })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="TALENT PIPELINE"
      title="候选人流程"
      description="从匹配度出发，快速完成查看、邀面和反馈。"
    >
      <el-button @click="load">刷新</el-button>
    </PageHead>

    <div v-loading="loading" class="pipeline">
      <section v-for="column in columns" :key="column.status" class="pipeline-column">
        <div class="pipeline-column__head">
          <span>{{ column.title }}</span>
          <span>{{ group(column.status).length }} 位</span>
        </div>
        <div class="pipeline-column__body">
          <article v-for="item in group(column.status)" :key="item.id" class="candidate-card">
            <div class="candidate-card__head">
              <strong>{{ item.resume?.name || '候选人' }}</strong>
              <em>{{ item.matchScore }}%</em>
            </div>
            <div class="candidate-card__meta">{{ item.resume?.experienceYears }} 年经验 · {{ item.job?.city }}</div>
            <div class="tag-list">
              <el-tag v-for="tag in item.resume?.skillTags?.slice(0, 3)" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
            <div style="margin-top: 10px; display: flex; gap: 6px">
              <template v-if="column.status === 'PENDING_VIEW'">
                <el-button size="small" @click="updateStatus(item, 'VIEWED')">已查看</el-button>
                <el-button size="small" type="primary" @click="updateStatus(item, 'INTERVIEW')">邀面试</el-button>
              </template>
              <template v-else-if="column.status === 'VIEWED'">
                <el-button size="small" type="primary" @click="updateStatus(item, 'INTERVIEW')">邀面试</el-button>
                <el-button size="small" type="danger" @click="updateStatus(item, 'REJECTED')">不合适</el-button>
              </template>
              <template v-else-if="column.status === 'INTERVIEW'">
                <el-button size="small" type="danger" @click="updateStatus(item, 'REJECTED')">不合适</el-button>
              </template>
            </div>
          </article>
          <el-empty v-if="!group(column.status).length" description="暂无候选人" :image-size="56" />
        </div>
      </section>
    </div>
    <div class="candidate-pager">
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
.candidate-pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
