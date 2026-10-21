<script setup>
import { computed } from 'vue'
import { clampScore } from '../utils/format.js'

const props = defineProps({
  score: { type: Number, default: 0 },
  color: { type: String, default: 'var(--brand)' },
})

const normalized = computed(() => clampScore(props.score))
</script>

<template>
  <span
    class="score-ring"
    :style="{ '--score': normalized, '--ring-color': color }"
    :aria-label="`匹配度 ${normalized}%`"
  >
    <span>{{ normalized }}%</span>
  </span>
</template>
