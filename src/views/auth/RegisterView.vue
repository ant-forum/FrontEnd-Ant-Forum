<template>
  <AuthLayout>
    <RegisterForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "@/components/layouts/AuthLayout.vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";
import RightPanel from "@/components/auth/RightPanel.vue";
</script>
