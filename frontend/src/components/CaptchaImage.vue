<script setup>
defineProps({
  image: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

defineEmits(['refresh'])
</script>

<template>
  <button
    class="captcha-image"
    type="button"
    :disabled="loading"
    title="点击刷新验证码"
    @click="$emit('refresh')"
  >
    <img v-if="image" :src="image" alt="图形验证码" />
    <span v-else>{{ loading ? '加载中' : '获取验证码' }}</span>
  </button>
</template>

<style scoped>
.captcha-image {
  display: grid;
  place-items: center;
  min-height: 32px;
  padding: 0;
  overflow: hidden;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f6f8ff;
  cursor: pointer;
}

.captcha-image img {
  display: block;
  width: 100%;
  height: 38px;
  object-fit: cover;
}
</style>
