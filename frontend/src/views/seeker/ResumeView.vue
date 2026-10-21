<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import { resumeApi } from '../../api/index.js'
import { EDUCATION_LABELS } from '../../utils/constants.js'

const resume = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const form = reactive({
  name: '',
  title: '',
  education: 'BACHELOR',
  experienceYears: 0,
  currentCity: '',
  expectCity: '',
  expectSalaryMin: 0,
  expectSalaryMax: 0,
  skillTagsText: '',
  summary: '',
})

async function load() {
  loading.value = true
  try {
    const list = await resumeApi.list({ page: 1, size: 10 })
    resume.value = list[0] || null
    fillForm()
  } finally {
    loading.value = false
  }
}

function fillForm() {
  Object.assign(form, {
    name: resume.value?.name || '',
    title: resume.value?.title || '',
    education: resume.value?.education || 'BACHELOR',
    experienceYears: resume.value?.experienceYears || 0,
    currentCity: resume.value?.currentCity || '',
    expectCity: resume.value?.expectCity || '',
    expectSalaryMin: resume.value?.expectSalaryMin || 0,
    expectSalaryMax: resume.value?.expectSalaryMax || 0,
    skillTagsText: (resume.value?.skillTags || []).join('，'),
    summary: resume.value?.summary || '',
  })
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form,
      skillTags: form.skillTagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean),
    }
    delete payload.skillTagsText
    resume.value = await resumeApi.update(resume.value.id, payload)
    dialogVisible.value = false
    ElMessage.success('简历已更新')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading">
    <PageHead
      eyebrow="ONLINE RESUME"
      title="在线简历"
      description="技能标签将用于人岗匹配计算，保持信息准确可以获得更精准的推荐。"
    >
      <el-button type="primary" @click="dialogVisible = true">编辑简历</el-button>
    </PageHead>

    <div v-if="resume" class="profile-layout">
      <aside class="profile-card">
        <el-avatar :size="76" class="profile-card__avatar">{{ resume.name.slice(0, 1) }}</el-avatar>
        <h2>{{ resume.name }}</h2>
        <p>{{ resume.title }}</p>
        <div class="info-list">
          <div class="info-item"><span>学历</span><strong>{{ EDUCATION_LABELS[resume.education] }}</strong></div>
          <div class="info-item"><span>经验</span><strong>{{ resume.experienceYears }} 年</strong></div>
          <div class="info-item"><span>当前城市</span><strong>{{ resume.currentCity }}</strong></div>
          <div class="info-item"><span>期望城市</span><strong>{{ resume.expectCity }}</strong></div>
          <div class="info-item"><span>期望薪资</span><strong>{{ resume.expectSalaryMin }}-{{ resume.expectSalaryMax }}K</strong></div>
        </div>
      </aside>

      <section class="panel">
        <div class="section-head">
          <div>
            <h2>个人简介</h2>
            <p>最近更新于 {{ resume.updatedAt }}</p>
          </div>
          <el-tag type="success">默认简历</el-tag>
        </div>
        <p>{{ resume.summary }}</p>

        <div class="section-head" style="margin-top: 24px">
          <div>
            <h2>核心技能标签</h2>
            <p>标签将参与 MatchService 权重重合度计算</p>
          </div>
        </div>
        <div class="tag-list">
          <el-tag v-for="tag in resume.skillTags" :key="tag" type="success">{{ tag }}</el-tag>
        </div>

        <div class="section-head" style="margin-top: 24px">
          <div>
            <h2>简历附件</h2>
            <p>{{ resume.attachmentObjectKey || '未上传附件' }}</p>
          </div>
        </div>
        <el-button @click="dialogVisible = true">管理附件</el-button>
      </section>
    </div>

    <el-empty v-else-if="!loading" description="还没有在线简历，请先创建" />

    <el-dialog v-model="dialogVisible" title="编辑在线简历" width="620px">
      <el-form label-position="top">
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="求职方向"><el-input v-model="form.title" /></el-form-item>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
          <el-form-item label="学历">
            <el-select v-model="form.education" style="width: 100%">
              <el-option v-for="(label, value) in EDUCATION_LABELS" :key="value" :label="label" :value="value" />
            </el-select>
          </el-form-item>
          <el-form-item label="经验年数"><el-input-number v-model="form.experienceYears" :min="0" /></el-form-item>
        </div>
        <el-form-item label="技能标签（逗号分隔）">
          <el-input v-model="form.skillTagsText" placeholder="例如：Figma，B端产品，设计系统" />
        </el-form-item>
        <el-form-item label="个人简介"><el-input v-model="form.summary" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
