<template>
  <div class="skeleton-loader" :class="{ 'skeleton-round': round }">
    <div
      class="skeleton-item"
      :style="{ width: width, height: height, borderRadius: borderRadius }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  },
  borderRadius: {
    type: String,
    default: '4px'
  },
  round: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.skeleton-loader {
  display: inline-block;
  width: 100%;
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-round .skeleton-item {
  border-radius: 50%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
