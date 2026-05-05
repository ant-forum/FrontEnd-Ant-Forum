<script setup>
defineProps({
  activities: Array
})
</script>

<template>
  <div class="card p-3 shadow-sm mt-3">
    <h5>Recent Activity</h5>

    <ul v-if="activities.length">
      <li v-for="(item, index) in activities" :key="index">
        {{ item }}
      </li>
    </ul>

    <p v-else>No recent activity yet.</p>
  </div>
</template>