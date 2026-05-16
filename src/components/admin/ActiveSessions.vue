<template>
  <div class="active-sessions p-4 rounded-4 border bg-white shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6 class="fw-bold mb-0">Active Sessions</h6>
      <span class="badge bg-light-primary text-primary rounded-pill px-2 py-1" style="font-size: 0.65rem;">12 LIVE</span>
    </div>

    <div class="session-list">
      <div v-for="session in sessions" :key="session.id" class="session-item d-flex align-items-center mb-4">
        <div class="position-relative me-3">
          <img :src="session.avatar" :alt="session.name" class="rounded-3" width="40" height="40">
          <span :class="['status-dot position-absolute bottom-0 end-0 border border-white border-2 rounded-circle', session.status]"></span>
        </div>
        <div class="session-info flex-grow-1">
          <p class="mb-0 fw-bold" style="font-size: 0.9rem;">{{ session.name }}</p>
          <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem;">{{ session.location }}</small>
        </div>
        <div class="status-indicator">
          <span :class="['dot rounded-circle', session.status]"></span>
        </div>
      </div>
    </div>

    <button class="btn btn-light w-100 rounded-pill py-2 mt-2 fw-bold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">
      View All Sessions
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const sessions = ref([
  {
    id: 1,
    name: 'Julianna D.',
    location: 'STOCKHOLM, SE',
    avatar: 'https://i.pravatar.cc/150?u=julianna',
    status: 'online'
  },
  {
    id: 2,
    name: 'Markus T.',
    location: 'SAN FRANCISCO, US',
    avatar: 'https://i.pravatar.cc/150?u=markus',
    status: 'online'
  },
  {
    id: 3,
    name: 'Sarah Y.',
    location: 'TOKYO, JP',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    status: 'away'
  },
  {
    id: 4,
    name: 'Alex K.',
    location: 'BERLIN, DE',
    avatar: 'https://i.pravatar.cc/150?u=alexk',
    status: 'online'
  }
]);
</script>

<style scoped>
.session-item:last-child {
  margin-bottom: 0 !important;
}

.status-dot {
  width: 12px;
  height: 12px;
  transform: translate(25%, 25%);
}

.dot {
  width: 8px;
  height: 8px;
  display: block;
}

.online { background-color: #10b981; }
.away { background-color: #f59e0b; }
.offline { background-color: #6b7280; }

.bg-light-primary {
  background-color: rgba(109, 40, 217, 0.08);
}
</style>
