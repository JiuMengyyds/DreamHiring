<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { adminApi, jobApi } from '../../api/index.js'

const categories = ref([])
const announcements = ref([])
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const editingCategoryId = ref(null)
const announcementPage = ref(1)
const announcementPageSize = ref(10)
const announcementTotal = ref(0)
const form = reactive({
  title: '',
  summary: '',
  content: '',
  channel: 'ALL',
  status: 'PUBLISHED',
})
const categoryForm = reactive({
  name: '',
  parentId: null,
  sort: 0,
})

async function load() {
  const [tree, announcementsResult] = await Promise.all([
    jobApi.categories(),
    adminApi.announcements({ page: announcementPage.value, size: announcementPageSize.value }),
  ])
  categories.value = tree
  announcements.value = announcementsResult.records
  announcementTotal.value = announcementsResult.total
}

async function createAnnouncement() {
  await adminApi.createAnnouncement({ ...form })
  dialogVisible.value = false
  ElMessage.success('公告已发布')
  load()
}

function openCategory(category = null, parentId = null) {
  editingCategoryId.value = category?.id || null
  Object.assign(categoryForm, {
    name: category?.name || '',
    parentId: category?.parentId ?? parentId,
    sort: category?.sort ?? 0,
  })
  categoryDialogVisible.value = true
}

async function saveCategory() {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请填写分类名称')
    return
  }
  const payload = {
    name: categoryForm.name.trim(),
    parentId: categoryForm.parentId || null,
    sort: Number(categoryForm.sort) || 0,
  }
  if (editingCategoryId.value) {
    await adminApi.updateCategory(editingCategoryId.value, payload)
  } else {
    await adminApi.createCategory(payload)
  }
  categoryDialogVisible.value = false
  ElMessage.success(editingCategoryId.value ? '分类已更新' : '分类已创建')
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
        <div class="content-pager">
          <el-pagination
            v-model:current-page="announcementPage"
            :page-size="announcementPageSize"
            :total="announcementTotal"
            layout="total, prev, pager, next"
            @current-change="load"
          />
        </div>
      </section>

      <aside class="panel">
        <div class="section-head">
          <div>
            <h2>职位分类</h2>
            <p>两级分类树</p>
          </div>
          <el-button size="small" @click="openCategory()">新增一级分类</el-button>
        </div>
        <div class="category-list">
          <div v-for="category in categories" :key="category.id" class="category-item">
            <div class="category-item__head">
              <strong>{{ category.name }}</strong>
              <span>
                {{ category.jobCount }} 个职位
                <el-button link type="primary" @click="openCategory(category)">编辑</el-button>
                <el-button link type="primary" @click="openCategory(null, category.id)">添加子类</el-button>
                <el-button link type="danger" @click="deleteCategory(category)">删除</el-button>
              </span>
            </div>
            <div class="tag-list">
              <span v-for="child in category.children" :key="child.id" class="child-category">
                <el-tag size="small">{{ child.name }}</el-tag>
                <el-button link type="primary" @click="openCategory(child)">编辑</el-button>
                <el-button link type="danger" @click="deleteCategory(child)">删除</el-button>
              </span>
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

    <el-dialog v-model="categoryDialogVisible" :title="editingCategoryId ? '编辑职位分类' : '新增职位分类'" width="460px">
      <el-form label-position="top">
        <el-form-item label="分类名称"><el-input v-model="categoryForm.name" /></el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="categoryForm.parentId" clearable placeholder="留空表示一级分类" style="width: 100%">
            <el-option
              v-for="item in categories.filter((category) => category.id !== editingCategoryId)"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
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

.child-category {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-right: 10px;
}

.content-pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}
</style>
