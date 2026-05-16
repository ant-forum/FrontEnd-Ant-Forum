<template>
  <div class="thread-detail-card card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 2rem;">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h6 class="fw-bold mb-0">Thread Preview</h6>
      <span :class="['status-badge px-2 py-1 rounded-pill fw-bold text-uppercase', thread.statusClass]">
        {{ thread.status }}
      </span>
    </div>

    <div class="thread-info mb-4">
      <h5 class="fw-bold mb-3">{{ thread.title }}</h5>
      <div class="author-meta d-flex align-items-center mb-3">
        <img :src="thread.author.avatar" :alt="thread.author.name" class="rounded-circle me-2" width="40" height="40">
        <div>
          <div class="fw-bold small">{{ thread.author.name }}</div>
          <div class="text-muted" style="font-size: 0.7rem;">Posted on May 15, 2024</div>
        </div>
      </div>
      <div class="thread-content-preview p-3 bg-light rounded-3 text-muted small">
        <p class="mb-0">"Hey everyone, I've been working on a project where Docker image sizes are getting out of control. Does anyone have specific tips for Node.js multi-stage builds?"</p>
      </div>
    </div>

    <div class="moderation-stats mb-4">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Moderation Stats</h6>
      <div class="row g-2">
        <div class="col-6">
          <div class="stat-box p-3 border rounded-3 text-center">
            <div class="fw-bold fs-5">{{ thread.reports || 0 }}</div>
            <div class="text-muted small">Reports</div>
          </div>
        </div>
        <div class="col-6">
          <div class="stat-box p-3 border rounded-3 text-center">
            <div class="fw-bold fs-5">{{ thread.replies }}</div>
            <div class="text-muted small">Replies</div>
          </div>
        </div>
      </div>
    </div>

    <div class="moderation-actions">
      <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 1px;">Admin Actions</h6>
      <div class="d-grid gap-2">
        <button class="btn btn-outline-primary rounded-pill py-2 fw-bold" style="font-size: 0.85rem;">
          <i class="bi bi-pin-angle me-2"></i> Pin Thread
        </button>
        <button class="btn btn-outline-warning rounded-pill py-2 fw-bold" style="font-size: 0.85rem;">
          <i class="bi bi-lock me-2"></i> Lock Discussion
        </button>
        <button class="btn btn-outline-danger rounded-pill py-2 fw-bold" style="font-size: 0.85rem;">
          <i class="bi bi-trash me-2"></i> Delete Content
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  thread: {
    type: Object,
    default: () => ({
      title: 'How to optimize Docker images for Node.js?',
      status: 'ACTIVE',
      statusClass: 'status-active',
      author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david' },
      replies: 24,
      reports: 0
    })
  }
});
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

.thread-content-preview {
  border-left: 3px solid #8b5cf6;
}
</style>
