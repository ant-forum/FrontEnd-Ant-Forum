<template>
  <div class="project-card card border-0 shadow-sm rounded-4 p-4 h-100">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div :class="['icon-box rounded-3 d-flex align-items-center justify-content-center', iconBgClass]">
        <i :class="[icon, 'fs-5']"></i>
      </div>
      <span :class="['status-badge px-3 py-1 rounded-pill fw-bold text-uppercase', statusClass]">
        {{ status }}
      </span>
    </div>

    <div class="project-content mb-4">
      <h5 class="fw-bold mb-2">{{ title }}</h5>
      <p class="text-muted small mb-3 text-truncate-2">{{ description }}</p>
      
      <div class="tech-stack d-flex flex-wrap gap-2">
        <span v-for="tech in techStack" :key="tech" class="tech-tag px-2 py-1 rounded border text-muted small">
          {{ tech }}
        </span>
      </div>
    </div>

    <div class="project-footer mt-auto pt-4 border-top d-flex justify-content-between align-items-center">
      <div class="member-info d-flex align-items-center">
        <img :src="member.avatar" :alt="member.name" class="rounded-circle me-2" width="32" height="32">
        <div>
          <div class="fw-bold mb-0" style="font-size: 0.8rem;">{{ member.name }}</div>
          <div class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ member.role }}</div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button v-if="status === 'PENDING REVIEW'" @click.stop="$emit('approve', id)" class="btn btn-sm btn-light-green rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Approve">
          <i class="bi bi-check-lg"></i>
        </button>
        <button v-if="status === 'PENDING REVIEW'" @click.stop="$emit('reject', id)" class="btn btn-sm btn-light-red rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" title="Reject">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="dropdown">
          <button class="btn btn-icon btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3">
            <li><a class="dropdown-item small py-2" href="#"><i class="bi bi-pencil me-2"></i>Edit</a></li>
            <li><a class="dropdown-item small py-2" href="#"><i class="bi bi-eye me-2"></i>View Details</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item small py-2 text-danger" href="#" @click.stop="$emit('delete', id)"><i class="bi bi-trash me-2"></i>Delete</a></li>
          </ul>
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

defineEmits(['approve', 'reject', 'delete']);

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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent !important;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
  border-color: #f1f5f9 !important;
}

.icon-box {
  width: 48px;
  height: 48px;
}

.status-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.status-active { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-pending { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-flagged { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

.btn-light-green {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
.btn-light-green:hover {
  background-color: #10b981;
  color: white;
}

.btn-light-red {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.btn-light-red:hover {
  background-color: #ef4444;
  color: white;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tech-tag {
  font-size: 0.65rem;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.tech-tag:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.member-info img {
  border: 1px solid #f1f5f9;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
