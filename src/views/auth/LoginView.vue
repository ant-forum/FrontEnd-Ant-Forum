<template>
  <div class="login-container">
    <div class="login-card">
      <LoginForm />
      <RightPanel />
    </div>
  </div>
</template>

<script setup>
import LoginForm from './components/LoginForm.vue'
import RightPanel from './components/RightPanel.vue'
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(109,40,217,.12), 0 4px 16px rgba(0,0,0,.06);
  overflow: visible;
  width: 100%;
  max-width: 1120px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 580px;
  animation: cardIn .5s cubic-bezier(.22,1,.36,1) both;
}

@keyframes cardIn {
  from { opacity:0; transform: translateY(24px) scale(.98); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .login-card {
    grid-template-columns: 1fr;
    border-radius: 20px;
  }
}
</style>
