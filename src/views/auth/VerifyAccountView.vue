<template>
  <AuthLayout>
    <VerifyAccountForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "../../components/layouts/AuthLayout.vue";
import VerifyAccountForm from "./VerifyAccountForm.vue";
import RightPanel from "./RightPanel.vue";
</script>
