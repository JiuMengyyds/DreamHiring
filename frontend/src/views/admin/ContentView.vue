<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { adminApi, jobApi } from '../../api/index.js'

const categories = ref([])
const announcements = ref([])
const dialogVisible = ref(false)
const form = reactive({
  title: '',
  summary: '',
  content: '',
  channel: 'ALL',
  status: 'PUBLISHED',
})

async function load() {
  const [tree, announcementPage] = await Promise.all([
    jobApi.categories(),
    adminApi.announcements({ page: 1, size: 100 }),
  ])
  categories.value = tree
  announcements.value = announcementPage.records
}

async function createAnnouncement() {
  await adminApi.createAnnouncement({ ...form })
  dialogVisible.value = false
  ElMessage.success('公告已发布')
  load()
}

async function deleteCategory(item) {
  try {
    await adminApi.deleteCategory(item.id)
    ElMessage.success('分类已删除')
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
      eyebrow="CONTENT OPERATIONS"
      title="分类与公告"
      description="维护职位分类体系与全平台公告。"
    >
      <el-button type="primary" @click="dialogVisible = true">发布公告</el-button>
    </PageHead>

    <div class="detail-layout">
      <section class="panel">
        <div class="section-head">
          <div>
            <h2>公告管理</h2>
            <p>共 {{ announcements.length }} 条公告</p>
          </div>
        </div>
        <el-table :data="announcements" style="width: 100%">
          <el-table-column prop="title" label="标题" min-width="220" />
          <el-table-column prop="channel" label="触达范围" width="120" />
          <el-table-column prop="publishedAt" label="发布时间" width="180" />
        </el-table>
      </section>

      <aside class="panel">
        <div class="section-head">
          <div>
            <h2>职位分类</h2>
            <p>两级分类树</p>
          </div>
        </div>
        <div class="category-list">
          <div v-for="category in categories" :key="category.id" class="category-item">
            <div class="category-item__head">
              <strong>{{ category.name }}</strong>
              <span>{{ category.jobCount }} 个职位</span>
            </div>
            <div class="tag-list">
              <el-tag v-for="child in category.children" :key="child.id" size="small">{{ child.name }}</el-tag>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <el-dialog v-model="dialogVisible" title="发布系统公告" width="600px">
      <el-form label-position="top">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="摘要"><el-input v-model="form.summary" /></el-form-item>
        <el-form-item label="触达范围">
          <el-select v-model="form.channel" style="width: 100%">
            <el-option label="全平台" value="ALL" />
            <el-option label="求职者" value="SEEKER" />
            <el-option label="企业用户" value="COMPANY" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createAnnouncement">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-list {
  display: grid;
  gap: 14px;
}

.category-item {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.category-item__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.category-item__head span {
  color: var(--muted);
  font-size: 12px;
}
</style>
