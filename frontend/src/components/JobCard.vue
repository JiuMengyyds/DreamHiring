<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ScoreRing from './ScoreRing.vue'
import { EDUCATION_LABELS, EXPERIENCE_LABELS } from '../utils/constants.js'
import { formatSalary } from '../utils/format.js'

const props = defineProps({
  job: { type: Object, required: true },
  showDetail: { type: Boolean, default: true },
  showApply: { type: Boolean, default: false },
})

const emit = defineEmits(['apply'])
const router = useRouter()

const salary = computed(() => formatSalary(props.job.salaryMin, props.job.salaryMax))

function openDetail() {
  if (props.showDetail) router.push(`/seeker/jobs/${props.job.id}`)
}
</script>

<template>
  <article class="job-card">
    <div class="job-card__top">
      <div class="job-card__main">
        <div class="job-card__title-row">
          <button class="job-card__title" type="button" @click="openDetail">{{ job.title }}</button>
          <span class="job-card__salary">{{ salary }}</span>
        </div>
        <div class="job-card__company">{{ job.companyName }} · {{ job.industry || '企业服务' }} · {{ job.size || '-' }}</div>
        <div class="job-card__meta">
          <span>{{ job.city }} · {{ job.district }}</span>
          <span>{{ EDUCATION_LABELS[job.education] || job.education }}</span>
          <span>{{ EXPERIENCE_LABELS[job.experience] || job.experience }}</span>
        </div>
        <div class="tag-list">
          <el-tag v-for="tag in job.skillTags" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
      </div>

      <div class="job-card__side">
        <ScoreRing :score="job.matchScore || 0" color="var(--mint)" />
        <el-button v-if="showApply" type="primary" size="small" @click="emit('apply', job)">
          立即投递
        </el-button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.job-card__title {
  padding: 0;
  text-align: left;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.job-card__side {
  display: grid;
  justify-items: end;
  gap: 8px;
}
</style>
