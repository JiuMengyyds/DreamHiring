<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { adminApi } from '../../api/index.js'
import { ROLE_LABELS, USER_STATUS } from '../../utils/constants.js'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)

async function load() {
  loading.value = true
  try {
    const data = await adminApi.users({ page: page.value, size: size.value })
    list.value = data.records
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row) {
  const next = row.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  await adminApi.updateUserStatus(row.id, { status: next })
  ElMessage.success(next === 'ACTIVE' ? '账号已启用' : '账号已禁用')
  load()
}

async function remove(row) {
  try {
    await adminApi.deleteUser(row.id)
    ElMessage.success('空账号已删除')
    load()
  } catch (error) {
    ElMessage.warning(error.message || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHead
      eyebrow="USER MANAGEMENT"
      title="用户管理"
      description="管理平台求职者与企业用户账号，维护账号状态和平台访问安全。"
    >
      <el-button @click="load">刷新</el-button>
    </PageHead>

    <div class="table-panel" v-loading="loading">
      <el-table :data="list" style="width: 100%">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="30">{{ row.nickname?.slice(0, 1) }}</el-avatar>
              <span>
                <strong>{{ row.nickname }}</strong>
                <small>@{{ row.username }}</small>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">{{ ROLE_LABELS[row.role] }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><el-tag :type="USER_STATUS[row.status]?.type">{{ USER_STATUS[row.status]?.label }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" :type="row.status === 'ACTIVE' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" @click="remove(row)">删除</el-button>
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
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-cell span {
  display: grid;
}

.user-cell small {
  color: var(--muted);
}

.table-panel__pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
