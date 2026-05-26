<template>
  <div class="user-details-card card border-0 shadow-sm rounded-4 p-4 sticky-top bg-surface border" style="top: 2rem;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6 class="fw-bold mb-0 text-adaptive">User Profile</h6>
      <div class="dropdown">
        <button class="btn btn-link p-0 text-muted" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end border border-theme shadow-sm rounded-3 bg-surface">
          <li><a class="dropdown-item small py-2 text-adaptive" href="#"><i class="bi bi-person-badge me-2"></i>View Public Profile</a></li>
          <li><a class="dropdown-item small py-2 text-adaptive" href="#" @click.prevent="isEditing = !isEditing"><i class="bi bi-pencil me-2"></i>{{ isEditing ? 'Cancel Editing' : 'Edit Profile' }}</a></li>
          <li><hr class="dropdown-divider border-theme"></li>
          <li><a class="dropdown-item small py-2 text-danger" href="#" @click.prevent="$emit('suspend', user.id)"><i class="bi bi-slash-circle me-2"></i>{{ user.status === 'suspended' ? 'Unsuspend' : 'Suspend' }} User</a></li>
        </ul>
      </div>
    </div>

    <div class="text-center mb-4 pb-2 border-bottom border-theme position-relative">
      <div v-if="isEditing" class="position-absolute top-0 end-0">
        <button class="btn btn-sm btn-success rounded-pill px-3 shadow-sm" @click="isEditing = false">Save</button>
      </div>
      <div class="position-relative d-inline-block avatar-container">
        <img :src="user.avatar" :alt="user.name" class="rounded-circle border border-4 border-theme shadow-sm profile-main-img bg-surface" width="110" height="110">
        <span :class="['status-indicator position-absolute bottom-0 end-0 border border-4 border-theme rounded-circle', user.status]" style="width: 28px; height: 28px;"></span>
        <div v-if="isEditing" class="avatar-overlay rounded-circle d-flex align-items-center justify-content-center">
          <i class="bi bi-camera text-white fs-4"></i>
        </div>
      </div>
      
      <div v-if="!isEditing">
        <h4 class="fw-bold mt-3 mb-1 text-adaptive">{{ user.name }}</h4>
        <p class="text-muted small mb-3">{{ user.email }}</p>
      </div>
      <div v-else class="mt-3 mb-3 px-3">
        <input type="text" class="form-control form-control-sm mb-2 text-center fw-bold bg-surface-hover text-adaptive border-theme" :value="user.name">
        <input type="email" class="form-control form-control-sm text-center bg-surface-hover text-adaptive border-theme" :value="user.email">
      </div>
      
      <div class="d-flex justify-content-center gap-2 mb-2">
        <span :class="['badge rounded-pill px-3 py-2 fw-bold', user.roleClass]" style="font-size: 0.65rem;">
          {{ user.role.toUpperCase() }}
        </span>
        <span class="badge bg-surface-hover text-adaptive border border-theme rounded-pill px-3 py-2 fw-bold" style="font-size: 0.65rem;">
          ID: #{{ user.id }}
        </span>
      </div>
    </div>

    <div class="info-grid mb-4">
      <div class="row g-3">
        <div class="col-6">
          <div class="p-3 rounded-4 bg-surface-hover text-center border border-theme">
            <p class="text-muted xx-small fw-bold text-uppercase mb-1">Joined</p>
            <p class="fw-bold small mb-0 text-adaptive">{{ user.joinedDate || 'Jan 2024' }}</p>
          </div>
        </div>
        <div class="col-6">
          <div class="p-3 rounded-4 bg-surface-hover text-center border border-theme">
            <p class="text-muted xx-small fw-bold text-uppercase mb-1">Reputation</p>
            <p class="fw-bold small mb-0 text-purple">{{ user.reputation || '1.2k' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="metadata-section mb-4">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Session Info</h6>
      <div class="d-flex flex-column gap-2">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted small">Location</span>
          <span class="fw-semibold small d-flex align-items-center">
            <i class="bi bi-geo-alt me-1 text-primary"></i> {{ user.location || 'Sweden' }}
          </span>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted small">Last IP</span>
          <span class="fw-semibold small text-muted">{{ user.lastIp || '192.168.1.1' }}</span>
        </div>
      </div>
    </div>

    <div class="activity-section mb-4">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Activity Feed</h6>
      <div class="activity-timeline">
        <div v-for="activity in activities" :key="activity.id" class="activity-item d-flex gap-3 mb-3">
          <div :class="['activity-icon rounded-circle d-flex align-items-center justify-content-center shadow-sm', activity.bgClass]">
            <i :class="[activity.icon, 'text-white']" style="font-size: 0.75rem;"></i>
          </div>
          <div class="activity-content flex-grow-1">
            <div class="d-flex justify-content-between">
              <p class="mb-0 fw-bold" style="font-size: 0.85rem;">{{ activity.title }}</p>
              <small class="text-muted xx-small fw-bold">{{ activity.time }}</small>
            </div>
            <p class="text-muted small mb-0">{{ activity.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="d-grid gap-2">
      <button class="btn btn-primary rounded-pill py-2 fw-bold shadow-brand">
        Message User
      </button>
      <button 
        :class="['btn rounded-pill py-2 fw-bold', user.status === 'suspended' ? 'btn-outline-success' : 'btn-outline-danger']" 
        style="font-size: 0.85rem;"
        @click="$emit('suspend', user.id)"
      >
        {{ user.status === 'suspended' ? 'Unsuspend Account' : 'Suspend Account' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['suspend']);

const isEditing = ref(false);

const activities = ref([
  {
    id: 1,
    title: 'Replied to thread',
    desc: '"Scaling microservices in Node..."',
    time: '2h ago',
    icon: 'bi bi-chat-dots',
    bgClass: 'bg-primary-main'
  },
  {
    id: 2,
    title: 'Project Updated',
    desc: 'Nexus Analytics v1.2',
    time: 'Yesterday',
    icon: 'bi bi-arrow-repeat',
    bgClass: 'bg-success-main'
  },
  {
    id: 3,
    title: 'Login Detected',
    desc: 'Chrome on macOS',
    time: '3 days ago',
    icon: 'bi bi-shield-check',
    bgClass: 'bg-info-main'
  }
]);
</script>

<style scoped>
.user-details-card {
  background: var(--color-surface) !important;
  color: var(--color-text) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

.bg-surface {
  background-color: var(--color-surface) !important;
}

.bg-surface-hover {
  background-color: var(--color-surface-hover) !important;
}

.text-adaptive {
  color: var(--color-text) !important;
}

.profile-main-img {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar-container:hover .profile-main-img {
  transform: scale(1.08) rotate(2deg);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.suspended { background-color: #ef4444; }

.bg-primary-main { background-color: #8b5cf6; }
.bg-success-main { background-color: #10b981; }
.bg-info-main { background-color: #3b82f6; }

.activity-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.active { background-color: #10b981; }
.idle { background-color: #94a3b8; }

.activity-timeline {
  position: relative;
}

.activity-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 16px;
  top: 32px;
  bottom: 0;
  width: 1px;
  background-color: var(--color-border-soft);
  z-index: 0;
}

.activity-content {
  position: relative;
  z-index: 1;
}

.xx-small { font-size: 0.6rem; }

.shadow-brand {
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.role-mentor { background-color: var(--color-purple-light); color: var(--color-purple); }
.role-student { background-color: var(--color-secondary-light, rgba(100, 116, 139, 0.1)); color: var(--color-secondary); }
.role-admin { background-color: var(--color-warning-light); color: var(--color-warning); }
</style>
