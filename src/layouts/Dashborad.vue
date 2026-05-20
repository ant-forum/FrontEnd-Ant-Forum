<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import DashboardStats from "../components/dashboards/DashboardStats.vue";
import RecentActivity from "../components/dashboards/RecentActivity.vue";

import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";

const authStore = useAuthStore();

// Fetch user on load
onMounted(() => {
  authStore.fetchProfile();
});

// Example stats (replace with API later)
const stats = computed(() => ({
  projects: 12,
  posts: 34,
  ratings: 4.8,
}));

// Example activity (replace with API later)
const activities = computed(() => [
  "Created new project",
  "Posted in forum",
  "Updated profile",
]);
</script>

<template>
  <Navbar />
  <div class="container dashboard-page py-4">
    <!-- Stats -->
    <DashboardStats :stats="stats" />

    <!-- Activity -->
    <RecentActivity :activities="activities" />
  </div>
  <Footer />
</template>

<style scoped>
.stat-card {
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

@media (hover: hover) {
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.action-card {
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
  cursor: pointer;
}

@media (hover: hover) {
  .action-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.dashboard-page :deep(.card) {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
</style>
