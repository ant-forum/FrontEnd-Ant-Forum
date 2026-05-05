<script setup>
import Navbar from "../components/layouts/header.vue"
import BaseFooter from "../components/layouts/footer.vue"
</script>

<template>
  <div class="main-layout d-flex flex-column min-vh-100">
    <Navbar />
    <main class="flex-grow-1">
      <router-view />
    </main>
    <BaseFooter />
  </div>
</template>

<style scoped>
    .main-layout {
        background-color: #f8f9fa;
    }
</style>