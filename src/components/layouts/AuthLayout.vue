<template>
  <Navbar />
  <div class="auth-container">
    <div :class="customCard ? 'auth-custom-wrap' : 'auth-card'">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Navbar from "../layouts/header.vue";
defineProps({
  customCard: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.auth-container {
  font-family: "Sora", sans-serif;
  background: transparent;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: "";
  position: absolute;
  top: -10%;
  right: -10%;
  width: 40%;
  height: 40%;
  background: radial-gradient(
    circle,
    var(--color-primary-light) 0%,
    transparent 70%
  );
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: visible;
  width: 100%;
  max-width: 1120px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 580px;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(8px);
}

[data-theme="dark"] .auth-card {
  background: var(--color-glass-bg);
  border-color: var(--color-glass-border);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--color-glass-border);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-custom-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .auth-card {
    grid-template-columns: 1fr;
    border-radius: var(--radius-lg);
  }
}
</style>
