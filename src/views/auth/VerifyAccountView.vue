<template>
  <AuthLayout>
    <VerifyAccountForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "@/components/layouts/AuthLayout.vue";
import VerifyAccountForm from "@/components/auth/VerifyAccountForm.vue";
import RightPanel from "@/components/auth/RightPanel.vue";
</script>
