<script setup>
defineProps({
  stats: Object,
});
</script>

<template>
  <div class="card dashboard-card p-3 shadow-sm">
    <h5>Dashboard Stats</h5>

    <ul class="mb-0">
      <li>Projects: {{ stats.projects }}</li>
      <li>Posts: {{ stats.posts }}</li>
      <li>Ratings: {{ stats.ratings }}</li>
    </ul>
  </div>
</template>

<style scoped>
.dashboard-card {
  border-radius: var(--radius-lg);
}
</style>
