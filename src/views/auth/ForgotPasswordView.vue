<template>
  <AuthLayout>
    <ForgotPasswordForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "../../components/layouts/AuthLayout.vue";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm.vue";
import RightPanel from "../../components/auth/RightPanel.vue";
</script>
