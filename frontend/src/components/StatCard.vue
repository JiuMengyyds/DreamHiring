<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  foot: { type: String, default: '' },
})
</script>

<template>
  <article class="stat-card">
    <div class="stat-card__label">{{ label }}</div>
    <div class="stat-card__value">{{ value }}</div>
    <div class="stat-card__foot">{{ foot }}</div>
  </article>
</template>
