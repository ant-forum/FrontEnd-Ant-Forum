<template>
  <div class="project-card card border-0 shadow-sm rounded-4 overflow-hidden h-100" @click="$emit('view', id)">
    <!-- Card Header with Icon and Status -->
    <div class="card-header-visual p-4 pb-0 d-flex justify-content-between align-items-start">
      <div :class="['icon-box rounded-4 d-flex align-items-center justify-content-center shadow-sm', iconBgClass]">
        <i :class="[icon, 'fs-4']"></i>
      </div>
      <div class="d-flex flex-column align-items-end gap-2">
        <span :class="['status-badge px-3 py-1 rounded-pill fw-bold text-uppercase', statusClass]">
          {{ status }}
        </span>
        <div v-if="status === 'ACTIVE'" class="health-indicator d-flex align-items-center gap-1 small text-success fw-bold">
          <span class="pulse-dot bg-success"></span>
          HEALTHY
        </div>
      </div>
    </div>

    <!-- Project Info -->
    <div class="card-body p-4">
      <div class="mb-4">
        <h5 class="fw-bold mb-2 text-color">{{ title }}</h5>
        <p class="text-muted-color small mb-3 text-truncate-2" style="line-height: 1.6;">{{ description }}</p>
        
        <div class="tech-stack d-flex flex-wrap gap-2">
          <span v-for="tech in techStack" :key="tech" class="tech-tag px-2 py-1 rounded-pill border text-muted">
            {{ tech }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="project-footer pt-3 border-top d-flex justify-content-between align-items-center mt-auto">
        <div class="member-info d-flex align-items-center">
          <div class="position-relative">
            <img :src="member.avatar" :alt="member.name" class="rounded-circle border border-2 border-white shadow-sm" width="36" height="36">
            <span class="online-indicator bg-success"></span>
          </div>
          <div class="ms-2">
            <div class="fw-bold text-color" style="font-size: 0.8rem; line-height: 1;">{{ member.name }}</div>
            <div class="text-muted text-uppercase fw-bold" style="font-size: 0.6rem; letter-spacing: 0.5px;">{{ member.role }}</div>
          </div>
        </div>

        <div class="d-flex gap-1">
          <template v-if="status === 'PENDING REVIEW'">
            <button @click.stop="$emit('approve', id)" class="btn btn-icon btn-light-success rounded-circle" title="Approve">
              <i class="bi bi-check-lg"></i>
            </button>
            <button @click.stop="$emit('reject', id)" class="btn btn-icon btn-light-danger rounded-circle" title="Reject">
              <i class="bi bi-x-lg"></i>
            </button>
          </template>
          <div class="dropdown" @click.stop>
            <button class="btn btn-icon btn-light rounded-circle" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3">
              <li><a class="dropdown-item small py-2" href="#" @click.prevent="$emit('view', id)"><i class="bi bi-pencil me-2"></i>Edit Project</a></li>
              <li><a class="dropdown-item small py-2" href="#"><i class="bi bi-link-45deg me-2"></i>Copy Repo URL</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item small py-2 text-danger" href="#" @click.prevent="$emit('delete', id)"><i class="bi bi-trash me-2"></i>Delete</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: Number,
  title: String,
  description: String,
  status: String,
  icon: String,
  iconBgClass: String,
  techStack: Array,
  member: Object
});

defineEmits(['approve', 'reject', 'delete', 'view']);

const statusClass = computed(() => {
  switch (props.status.toLowerCase()) {
    case 'active': return 'status-active';
    case 'pending review': return 'status-pending';
    case 'flagged': return 'status-flagged';
    default: return 'status-default';
  }
});
</script>

<style scoped>
.project-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
  cursor: pointer;
}

.text-color {
  color: var(--color-text) !important;
}

.text-muted-color {
  color: var(--color-muted) !important;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg) !important;
  border-color: #8b5cf6 !important;
}

.icon-box {
  width: 52px;
  height: 52px;
  transition: transform 0.3s ease;
}

.project-card:hover .icon-box {
  transform: scale(1.1) rotate(5deg);
}

.status-badge {
  font-size: 0.6rem;
  letter-spacing: 0.8px;
}

.status-active { background-color: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-pending { background-color: rgba(245, 158, 11, 0.08); color: #f59e0b; }
.status-flagged { background-color: rgba(239, 68, 68, 0.08); color: #ef4444; }

.tech-tag {
  font-size: 0.65rem;
  background-color: var(--color-surface-hover);
  color: var(--color-text-muted);
  font-weight: 600;
  transition: all 0.2s ease;
}

.tech-tag:hover {
  background-color: #8b5cf6;
  color: white;
  border-color: #8b5cf6 !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-surface);
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.btn-light-success {
  background-color: rgba(16, 185, 129, 0.08);
  color: #10b981;
}

.btn-light-success:hover {
  background-color: #10b981;
  color: white;
}

.btn-light-danger {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.btn-light-danger:hover {
  background-color: #ef4444;
  color: white;
}

.xx-small { font-size: 0.6rem; }
</style>
