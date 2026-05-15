<template>
  <AuthLayout>
    <ForgotPasswordForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "../../components/layouts/AuthLayout.vue";
import ForgotPasswordForm from "./ForgotPasswordForm.vue";
import RightPanel from "./RightPanel.vue";
</script>
