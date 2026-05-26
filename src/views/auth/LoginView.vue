<template>
  <AuthLayout>
    <LoginForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "@/components/layouts/AuthLayout.vue";
import LoginForm from "@/components/auth/LoginForm.vue";
import RightPanel from "@/components/auth/RightPanel.vue";
</script>
