<template>
  <div class="system-events p-4 rounded-4 border bg-white shadow-sm mb-4">
    <h6 class="fw-bold mb-4">System Events</h6>
    <div class="event-list">
      <div v-for="event in events" :key="event.id" class="event-item d-flex align-items-start mb-4">
        <div :class="['event-icon-wrapper rounded-circle me-3 d-flex align-items-center justify-content-center', event.bgClass]">
          <i :class="[event.icon, 'text-white']" style="font-size: 0.9rem;"></i>
        </div>
        <div class="event-content">
          <p class="mb-0 fw-bold" style="font-size: 0.9rem;">{{ event.title }}</p>
          <div class="event-meta d-flex align-items-center mt-1">
            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem;">{{ event.time }} ago</small>
            <span class="mx-2 text-muted" style="font-size: 0.65rem;">•</span>
            <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem;">{{ event.source }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const events = ref([
  {
    id: 1,
    title: 'Database Backup Completed',
    time: '2 minutes',
    source: 'SYS-AUTO',
    icon: 'bi bi-check2',
    bgClass: 'bg-success'
  },
  {
    id: 2,
    title: 'High CPU Usage Detected',
    time: '14 minutes',
    source: 'NODE-04',
    icon: 'bi bi-exclamation-triangle',
    bgClass: 'bg-warning'
  },
  {
    id: 3,
    title: 'Deployment Successful',
    time: '1 hour',
    source: 'V2.4.0-STABLE',
    icon: 'bi bi-rocket-takeoff',
    bgClass: 'bg-primary'
  },
  {
    id: 4,
    title: 'New Admin Invited',
    time: '3 hours',
    source: 'SUPER-USER',
    icon: 'bi bi-person-plus',
    bgClass: 'bg-secondary'
  }
]);
</script>

<style scoped>
.event-icon-wrapper {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.event-item:last-child {
  margin-bottom: 0 !important;
}

.bg-primary { background-color: #6d28d9 !important; }
.bg-success { background-color: #10b981 !important; }
.bg-warning { background-color: #f59e0b !important; }
.bg-secondary { background-color: #6b7280 !important; }
</style>
