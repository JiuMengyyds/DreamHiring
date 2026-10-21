<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHead from '../../components/PageHead.vue'
import ScoreRing from '../../components/ScoreRing.vue'
import { applicationApi, jobApi } from '../../api/index.js'
import { EDUCATION_LABELS, EXPERIENCE_LABELS } from '../../utils/constants.js'
import { formatSalary } from '../../utils/format.js'

const route = useRoute()
const router = useRouter()
const job = ref(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    job.value = await jobApi.detail(route.params.jobId)
  } finally {
    loading.value = false
  }
}

async function apply() {
  try {
    await applicationApi.create({ jobId: job.value.id, resumeId: 30001 })
    ElMessage.success('投递成功')
    router.push('/seeker/applications')
  } catch (error) {
    ElMessage.error(error.message || '投递失败')
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading">
    <template v-if="job">
      <el-button link type="primary" @click="router.push('/seeker/jobs')">
        <el-icon><ArrowLeft /></el-icon> 返回职位列表
      </el-button>

      <PageHead :title="job.title" :description="`${job.companyName} · ${job.city}`" />

      <div class="detail-layout">
        <div class="detail-stack">
          <section class="panel">
            <div class="section-head">
              <div>
                <h2>职位介绍</h2>
                <p>{{ formatSalary(job.salaryMin, job.salaryMax) }} · {{ EDUCATION_LABELS[job.education] }} · {{ EXPERIENCE_LABELS[job.experience] }}</p>
              </div>
            </div>
            <p>{{ job.description }}</p>
            <h3>你将负责</h3>
            <ul>
              <li v-for="item in job.duties" :key="item">{{ item }}</li>
            </ul>
            <h3>我们希望你具备</h3>
            <ul>
              <li v-for="item in job.requirements" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section class="panel">
            <div class="section-head">
              <div>
                <h2>技能标签</h2>
                <p>高亮标签表示你的简历已经覆盖</p>
              </div>
            </div>
            <div class="tag-list">
              <el-tag
                v-for="tag in job.skillTags"
                :key="tag"
                :type="job.matchExplanation?.matchedSkills?.includes(tag) ? 'success' : 'info'"
              >
                {{ tag }}
              </el-tag>
            </div>
          </section>
        </div>

        <aside class="panel">
          <div class="section-head">
            <h2>人岗匹配度</h2>
          </div>
          <ScoreRing :score="job.matchScore || job.matchExplanation?.score || 0" color="var(--mint)" />
          <p style="margin: 12px 0">
            你的简历覆盖 {{ job.matchExplanation?.matchedCount || 0 }}/{{ job.matchExplanation?.totalCount || 0 }} 个核心技能。
          </p>
          <el-button type="primary" size="large" style="width: 100%" @click="apply">立即投递</el-button>
          <p style="margin-top: 10px; color: var(--muted); font-size: 12px; text-align: center">
            默认使用当前默认简历，匹配度将在投递时生成快照。
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>
