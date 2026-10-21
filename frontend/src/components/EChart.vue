<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, required: true },
})

const chartEl = ref(null)
let chart = null

function render() {
  if (!chartEl.value) return
  chart = chart || echarts.init(chartEl.value)
  chart.setOption(props.option, true)
}

function resize() {
  chart?.resize()
}

watch(() => props.option, render, { deep: true })
onMounted(() => {
  render()
  window.addEventListener('resize', resize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartEl" class="chart" />
</template>
