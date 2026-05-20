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
  gap: 14px;
  position: sticky;
  top: 88px;
  align-self: start;
}

.sidebar-card {
  background: white;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
</style>