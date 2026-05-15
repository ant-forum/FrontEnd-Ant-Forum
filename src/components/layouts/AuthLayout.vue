<template>
  <Navbar />
  <div class="auth-container">
    <div class="auth-card">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Navbar from "../layouts/header.vue";
// Shared layout wrapper for all auth pages (Login, ForgotPassword, Verify)
</script>

<style scoped>
.auth-container {
  font-family: "Sora", sans-serif;
  background-color: var(--bg-grid);
  background-image:
    linear-gradient(rgba(109, 40, 217, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(109, 40, 217, 0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
}

.auth-card {
  background: var(--card-bg);
  border: 1px solid rgba(124, 58, 237, 0.12);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: visible;
  width: 100%;
  max-width: 1120px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 580px;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
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

@media (max-width: 768px) {
  .auth-card {
    grid-template-columns: 1fr;
    border-radius: var(--radius-lg);
  }
}
</style>
