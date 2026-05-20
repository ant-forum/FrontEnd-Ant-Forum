<template>
  <div class="user-details-card card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 2rem;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6 class="fw-bold mb-0">User Details</h6>
      <a href="#" class="text-primary small text-decoration-none fw-bold">View Full Profile</a>
    </div>

    <div class="text-center mb-4">
      <div class="position-relative d-inline-block">
        <img :src="user.avatar" :alt="user.name" class="rounded-circle border border-4 border-white shadow-sm" width="100" height="100">
        <span class="status-indicator position-absolute bottom-0 end-0 border border-4 border-white rounded-circle active" style="width: 24px; height: 24px;"></span>
      </div>
      <h4 class="fw-bold mt-3 mb-1">{{ user.name }}</h4>
      <p class="text-muted small">Joined January 2024</p>
    </div>

    <div class="tech-stack-section mb-4">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Tech Stack</h6>
      <div class="d-flex flex-wrap gap-2">
        <span v-for="tech in techStack" :key="tech" class="badge bg-light text-muted border px-2 py-1 fw-medium" style="font-size: 0.7rem;">
          {{ tech }}
        </span>
      </div>
    </div>

    <div class="activity-section mb-4">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Recent Activity</h6>
      <div class="activity-timeline">
        <div v-for="activity in activities" :key="activity.id" class="activity-item d-flex gap-3 mb-3">
          <div :class="['activity-icon rounded-circle d-flex align-items-center justify-content-center', activity.bgClass]">
            <i :class="[activity.icon, 'text-white']" style="font-size: 0.75rem;"></i>
          </div>
          <div class="activity-content">
            <p class="mb-0 fw-bold" style="font-size: 0.85rem;">{{ activity.title }}</p>
            <p class="text-muted small mb-1">{{ activity.desc }}</p>
            <small class="text-muted text-uppercase fw-bold" style="font-size: 0.6rem;">{{ activity.time }}</small>
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-outline-danger w-100 rounded-pill py-3 fw-bold mt-2" style="font-size: 0.85rem;">
      Suspend Account
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({
      name: 'Marcus Wright',
      avatar: 'https://i.pravatar.cc/150?u=marcus'
    })
  }
});

const techStack = ref(['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'PostgreSQL']);

const activities = ref([
  {
    id: 1,
    title: 'Replied to thread',
    desc: '"Scaling microservices in Node..."',
    time: '2 hours ago',
    icon: 'bi bi-chat-dots',
    bgClass: 'bg-primary-soft'
  },
  {
    id: 2,
    title: 'Project Completed',
    desc: 'ANT-Ecosystem v2.1 Migration',
    time: 'Yesterday, 4:15 PM',
    icon: 'bi bi-check2',
    bgClass: 'bg-success-soft'
  },
  {
    id: 3,
    title: 'System Login',
    desc: 'IP: 192.168.1.45 (New Device)',
    time: 'May 12, 09:12 AM',
    icon: 'bi bi-box-arrow-in-right',
    bgClass: 'bg-warning-soft'
  }
]);
</script>

<style scoped>
.user-details-card {
  background: white;
}

.bg-primary-soft { background-color: #8b5cf6; }
.bg-success-soft { background-color: #10b981; }
.bg-warning-soft { background-color: #f59e0b; }

.activity-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.active { background-color: #10b981; }

.activity-timeline {
  position: relative;
}

.activity-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 14px;
  top: 28px;
  bottom: 0;
  width: 1px;
  background-color: #f1f5f9;
  z-index: 0;
}

.activity-content {
  position: relative;
  z-index: 1;
}
</style>
