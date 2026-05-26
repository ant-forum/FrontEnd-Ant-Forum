<script setup>
import NetworkStatus from './NetworkStatus.vue';
import TrendingTags from './TrendingTags.vue';
import TopContributors from './TopContributors.vue';
</script>

<template>
  <aside class="forum-sidebar">
    <div class="sidebar-card">
      <NetworkStatus />
    </div>
    <div class="sidebar-card">
      <TrendingTags />
    </div>
    <div class="sidebar-card">
      <TopContributors />
    </div>
  </aside>
</template>

<style scoped>
.forum-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 80px;
  align-self: start;
}

.sidebar-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}
</style>