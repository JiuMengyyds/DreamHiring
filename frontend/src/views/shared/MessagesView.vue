<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { messageApi } from '../../api/index.js'
import { MESSAGE_TYPES } from '../../utils/constants.js'
import { formatDateTime } from '../../utils/format.js'

const list = ref([])
const active = ref(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const data = await messageApi.list({ page: 1, size: 50 })
    list.value = data.records
    active.value = list.value[0] || null
  } finally {
    loading.value = false
  }
}

function select(item) {
  active.value = item
  if (!item.isRead) {
    item.isRead = true
    messageApi.markRead(item.id)
  }
}

async function markAll() {
  await messageApi.markAllRead()
  list.value.forEach((item) => { item.isRead = true })
  ElMessage.success('全部消息已标为已读')
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="MESSAGE CENTER"
      title="消息中心"
      description="面试邀约、投递反馈与平台公告会集中展示在这里。"
    >
      <el-button @click="markAll">全部标为已读</el-button>
    </PageHead>

    <div class="detail-layout" style="grid-template-columns: 330px minmax(0, 1fr)" v-loading="loading">
      <aside class="panel" style="padding: 8px">
        <button
          v-for="item in list"
          :key="item.id"
          type="button"
          class="message-item"
          :class="{ active: active?.id === item.id }"
          @click="select(item)"
        >
          <el-badge is-dot :hidden="item.isRead">
            <strong>{{ item.title }}</strong>
          </el-badge>
          <span>{{ formatDateTime(item.createdAt) }}</span>
        </button>
        <el-empty v-if="!list.length" description="暂无消息" />
      </aside>

      <section class="panel" v-if="active">
        <div class="section-head">
          <div>
            <h2>{{ active.title }}</h2>
            <p>{{ MESSAGE_TYPES[active.type]?.label }} · {{ formatDateTime(active.createdAt) }}</p>
          </div>
          <el-tag :type="MESSAGE_TYPES[active.type]?.type">{{ MESSAGE_TYPES[active.type]?.label }}</el-tag>
        </div>
        <p>{{ active.content }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 13px;
  text-align: left;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  cursor: pointer;
}

.message-item:hover,
.message-item.active {
  background: var(--brand-soft);
}

.message-item span {
  flex: none;
  color: var(--muted);
  font-size: 11px;
}
</style>
