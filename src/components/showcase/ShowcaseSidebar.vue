<script setup>
import TrendingTags from "../forum/TrendingTags.vue";
import TopContributors from "../forum/TopContributors.vue";
</script>

<template>
  <aside class="showcase-sidebar">
    <div class="sidebar-card">
      <TrendingTags />
    </div>
    <div class="sidebar-card">
      <TopContributors />
    </div>
  </aside>
</template>

<style scoped>
.showcase-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 80px;
  align-self: start;
}

.sidebar-card {
  background: transparent;
  border-radius: 0;
  padding: 6px 0;
  border: none;
  box-shadow: none;
  transition: all var(--transition-base);
}
</style>
