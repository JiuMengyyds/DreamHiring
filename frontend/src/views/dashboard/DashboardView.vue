<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EChart from '../../components/EChart.vue'
import { statsApi } from '../../api/index.js'

const router = useRouter()
const stats = ref(null)
const loading = ref(false)

const options = ref({
  trend: {},
  salary: {},
  city: {},
  education: {},
  experience: {},
  industry: {},
  skills: {},
})

const axisStyle = {
  axisLabel: { color: '#7f92b3' },
  axisLine: { lineStyle: { color: 'rgba(153,177,220,0.16)' } },
  splitLine: { lineStyle: { color: 'rgba(153,177,220,0.10)' } },
}

function buildOptions(data) {
  const trend = data.trend || []
  const salary = data.salaryDistribution || []
  const city = data.cityDistribution || []
  const education = data.educationDistribution || []
  const experience = data.experienceDistribution || []
  const industry = data.industryDistribution || []
  const skills = data.hotSkills || []

  options.value = {
    trend: {
      grid: { left: 40, right: 18, top: 20, bottom: 30 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: trend.map((item) => item.month), ...axisStyle },
      yAxis: { type: 'value', ...axisStyle },
      series: [
        { name: '职位发布量', type: 'line', smooth: true, data: trend.map((item) => item.jobCount), itemStyle: { color: '#7c96ff' } },
        { name: '投递量', type: 'line', smooth: true, data: trend.map((item) => item.applicationCount), itemStyle: { color: '#4ec6a8' } },
      ],
    },
    salary: {
      grid: { left: 50, right: 20, top: 15, bottom: 25 },
      tooltip: {},
      xAxis: { type: 'value', ...axisStyle },
      yAxis: { type: 'category', data: salary.map((item) => item.name), ...axisStyle },
      series: [{ type: 'bar', data: salary.map((item) => item.value), barWidth: 10, itemStyle: { color: '#5879ef', borderRadius: [0, 5, 5, 0] } }],
    },
    city: {
      grid: { left: 45, right: 25, top: 15, bottom: 25 },
      tooltip: {},
      xAxis: { type: 'value', ...axisStyle },
      yAxis: { type: 'category', data: city.map((item) => item.name), ...axisStyle },
      series: [{ type: 'bar', data: city.map((item) => item.value), barWidth: 10, itemStyle: { color: '#4bc6a8', borderRadius: [0, 5, 5, 0] } }],
    },
    education: {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['45%', '68%'],
          data: education.map((item) => ({ name: item.name, value: item.value })),
          color: ['#5879ef', '#4bc6a8', '#f0b74f', '#ed826b'],
        },
      ],
    },
    experience: {
      grid: { left: 35, right: 20, top: 20, bottom: 25 },
      tooltip: {},
      xAxis: { type: 'category', data: experience.map((item) => item.name), ...axisStyle },
      yAxis: { type: 'value', ...axisStyle },
      series: [{ type: 'bar', data: experience.map((item) => item.value), barWidth: 18, itemStyle: { color: '#f0b74f', borderRadius: [5, 5, 0, 0] } }],
    },
    industry: {
      grid: { left: 80, right: 30, top: 15, bottom: 25 },
      tooltip: {},
      xAxis: { type: 'value', ...axisStyle },
      yAxis: { type: 'category', data: industry.map((item) => item.name), ...axisStyle },
      series: [{ type: 'bar', data: industry.map((item) => item.value), barWidth: 10, itemStyle: { color: '#ed826b', borderRadius: [0, 5, 5, 0] } }],
    },
    skills: {
      grid: { left: 65, right: 25, top: 15, bottom: 25 },
      tooltip: {},
      xAxis: { type: 'value', ...axisStyle },
      yAxis: { type: 'category', data: skills.slice(0, 10).map((item) => item.skill), ...axisStyle },
      series: [{ type: 'bar', data: skills.slice(0, 10).map((item) => item.freqCount), barWidth: 10, itemStyle: { color: '#c6a35b', borderRadius: [0, 5, 5, 0] } }],
    },
  }
}

async function load() {
  loading.value = true
  try {
    stats.value = await statsApi.dashboard()
    buildOptions(stats.value)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="dashboard-page" v-loading="loading">
    <header class="dashboard-head">
      <el-button link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回工作台
      </el-button>
      <div>
        <h1>招聘数据洞察</h1>
        <p v-if="stats">数据集 {{ stats.metadata.sourceDataset }} · 统计日期 {{ stats.metadata.statDate }}</p>
      </div>
    </header>

    <section v-if="stats" class="metric-grid" style="margin-bottom: 12px">
      <article class="chart-card">
        <h3>清洗后职位样本</h3>
        <div class="stat-card__value">{{ stats.overview.sampleCount.toLocaleString() }}</div>
      </article>
      <article class="chart-card">
        <h3>平均月薪</h3>
        <div class="stat-card__value">{{ stats.overview.averageSalary }}K</div>
      </article>
      <article class="chart-card">
        <h3>人才供需比</h3>
        <div class="stat-card__value">{{ stats.overview.supplyDemandRatio }} : 1</div>
      </article>
      <article class="chart-card">
        <h3>技能匹配均值</h3>
        <div class="stat-card__value">{{ stats.overview.averageMatchScore }}%</div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="chart-card chart-card--wide">
        <h3>招聘需求趋势</h3>
        <EChart :option="options.trend" />
      </article>
      <article class="chart-card chart-card--half">
        <h3>学历要求分布</h3>
        <EChart :option="options.education" />
      </article>
      <article class="chart-card chart-card--third">
        <h3>薪资区间分布</h3>
        <EChart :option="options.salary" />
      </article>
      <article class="chart-card chart-card--third">
        <h3>热门招聘城市</h3>
        <EChart :option="options.city" />
      </article>
      <article class="chart-card chart-card--third">
        <h3>经验要求分布</h3>
        <EChart :option="options.experience" />
      </article>
      <article class="chart-card chart-card--half">
        <h3>行业人才需求</h3>
        <EChart :option="options.industry" />
      </article>
      <article class="chart-card chart-card--wide">
        <h3>热门技能</h3>
        <EChart :option="options.skills" />
      </article>
    </section>
  </div>
</template>
