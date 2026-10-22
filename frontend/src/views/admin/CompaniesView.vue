<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

async function audit(row, auditStatus) {
  try {
    let reason = ''
    if (auditStatus === 'REJECTED') {
      const result = await ElMessageBox.prompt('请输入驳回原因', '驳回企业认证', {
        inputValidator: (value) => Boolean(value?.trim()) || '驳回原因不能为空',
      })
      reason = result.value.trim()
    }
    await adminApi.auditCompany(row.id, { auditStatus, reason })
    ElMessage.success(auditStatus === 'APPROVED' ? '企业认证已通过' : '企业认证已驳回')
    load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '审核失败')
    }
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
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column label="认证状态" width="130">
          <template #default="{ row }"><el-tag :type="AUDIT_STATUS[row.auditStatus]?.type">{{ AUDIT_STATUS[row.auditStatus]?.label }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <template v-if="row.auditStatus === 'PENDING'">
              <el-button size="small" type="danger" @click="audit(row, 'REJECTED')">驳回</el-button>
              <el-button size="small" type="primary" @click="audit(row, 'APPROVED')">通过</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
