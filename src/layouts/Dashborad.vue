<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import DashboardStats from '../components/dashboards/DashboardStats.vue'
import RecentActivity from '../components/dashboards/RecentActivity.vue'

import Navbar from "../components/layouts/header.vue"
import Footer from "../components/layouts/footer.vue"

const authStore = useAuthStore()

// Fetch user on load
onMounted(() => {
  authStore.fetchProfile()
})

// Example stats (replace with API later)
const stats = computed(() => ({
  projects: 12,
  posts: 34,
  ratings: 4.8
}))

// Example activity (replace with API later)
const activities = computed(() => [
  'Created new project',
  'Posted in forum',
  'Updated profile'
])
</script>

<template>
    <Navbar/>
  <div class="container py-4">

    <!-- Stats -->
    <DashboardStats :stats="stats" />

    <!-- Activity -->
    <RecentActivity :activities="activities" />

  </div>
  <Footer/>
</template>

<style scoped>
.stat-card {
  transition: 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.action-card {
  transition: 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}
</style>