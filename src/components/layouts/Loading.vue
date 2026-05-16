<template>
  <div :class="['loading-container', { 'full-page': fullPage }]">
    <div class="spinner">
      <div class="dot1"></div>
      <div class="dot2"></div>
      <div class="dot3"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  fullPage: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
}

.loading-container.full-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.spinner {
  display: flex;
  gap: 8px;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: #9333ea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner .dot1 {
  animation-delay: -0.32s;
}

.spinner .dot2 {
  animation-delay: -0.16s;
}

.loading-text {
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  font-family: 'Inter', sans-serif;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.3;
  } 
  40% { 
    transform: scale(1.0);
    opacity: 1;
  }
}
</style>
