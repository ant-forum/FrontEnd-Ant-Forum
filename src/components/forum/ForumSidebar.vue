<script setup>
import NetworkStatus from './NetworkStatus.vue';
import TrendingTags from './TrendingTags.vue';
</script>

<template>
  <aside class="forum-sidebar">
    <div class="sidebar-card">
      <NetworkStatus />
    </div>
    <div class="sidebar-card">
      <TrendingTags />
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
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}
</style>