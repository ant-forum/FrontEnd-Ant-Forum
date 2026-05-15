<template>
  <AuthLayout>
    <LoginForm />
    <RightPanel />
  </AuthLayout>
</template>

<script setup>
import AuthLayout from "../../components/layouts/AuthLayout.vue";
import LoginForm from "./LoginForm.vue";
import RightPanel from "./RightPanel.vue";
</script>
