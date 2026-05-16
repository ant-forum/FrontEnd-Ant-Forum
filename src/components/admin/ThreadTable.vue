<template>
  <div class="thread-table-card card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0">Discussions</h5>
      <div class="d-flex gap-2">
        <div class="dropdown">
          <button class="btn btn-light btn-sm rounded-pill px-3 dropdown-toggle d-flex align-items-center" type="button">
            <i class="bi bi-filter-left me-2"></i>
            All Categories
          </button>
        </div>
        <button class="btn btn-light btn-sm rounded-pill px-2">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light">
          <tr>
            <th class="ps-4 text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Thread</th>
            <th class="text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Author</th>
            <th class="text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Stats</th>
            <th class="text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Status</th>
            <th class="text-end pe-4 text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="thread in threads" :key="thread.id" class="cursor-pointer" @click="$emit('select-thread', thread)">
            <td class="ps-4 py-3">
              <div class="d-flex flex-column" style="max-width: 300px;">
                <span class="fw-bold text-truncate mb-1" style="font-size: 0.95rem;">{{ thread.title }}</span>
                <span class="text-muted small text-truncate">{{ thread.category }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <img :src="thread.author.avatar" :alt="thread.author.name" class="rounded-circle me-2" width="32" height="32">
                <span class="small fw-medium">{{ thread.author.name }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex gap-3 text-muted small">
                <span class="d-flex align-items-center"><i class="bi bi-chat-left-text me-1"></i> {{ thread.replies }}</span>
                <span class="d-flex align-items-center"><i class="bi bi-eye me-1"></i> {{ thread.views }}</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge px-2 py-1 rounded-pill fw-bold text-uppercase', thread.statusClass]">
                {{ thread.status }}
              </span>
            </td>
            <td class="text-end pe-4">
              <button class="btn btn-icon btn-light btn-sm rounded-circle me-1">
                <i class="bi bi-eye" style="font-size: 0.8rem;"></i>
              </button>
              <button class="btn btn-icon btn-light btn-sm rounded-circle">
                <i class="bi bi-trash" style="font-size: 0.8rem;"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-white border-0 p-4 d-flex justify-content-between align-items-center border-top">
      <small class="text-muted">Showing 4 of 842 threads</small>
      <div class="pagination-buttons d-flex gap-2">
        <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold">Prev</button>
        <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-brand">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineEmits(['select-thread']);

const threads = ref([
  {
    id: 1,
    title: 'How to optimize Docker images for Node.js?',
    category: 'Development / DevOps',
    author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david' },
    replies: 24,
    views: '1.2k',
    status: 'ACTIVE',
    statusClass: 'status-active'
  },
  {
    id: 2,
    title: 'Best practices for Vue 3 Composition API in large scale apps',
    category: 'Frontend / Vue',
    author: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarahc' },
    replies: 45,
    views: '3.5k',
    status: 'PINNED',
    statusClass: 'status-pinned'
  },
  {
    id: 3,
    title: 'Is it worth moving from REST to GraphQL in 2024?',
    category: 'Backend / API',
    author: { name: 'Marcus Wright', avatar: 'https://i.pravatar.cc/150?u=marcus' },
    replies: 12,
    views: '840',
    status: 'FLAGGED',
    statusClass: 'status-flagged'
  },
  {
    id: 4,
    title: 'New security vulnerability found in popular npm package',
    category: 'Security / Announcements',
    author: { name: 'Elena Vance', avatar: 'https://i.pravatar.cc/150?u=elena' },
    replies: 8,
    views: '2.1k',
    status: 'LOCKED',
    statusClass: 'status-locked'
  }
]);
</script>

<style scoped>
.status-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.status-active { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-pinned { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status-flagged { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
.status-locked { background-color: rgba(100, 116, 139, 0.1); color: #64748b; }

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cursor-pointer {
  cursor: pointer;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}
</style>
