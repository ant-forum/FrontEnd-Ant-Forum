<template>
  <div v-if="thread" class="thread-detail-card card border-0 shadow-sm rounded-4 p-4 sticky-top bg-surface border" style="top: 2rem;">
    <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-theme">
      <h6 class="fw-bold mb-0 text-uppercase small tracking-wider text-muted">Management Console</h6>
      <span :class="['status-badge px-3 py-1 rounded-pill fw-bold text-uppercase', thread.statusClass]">
        {{ thread.status }}
      </span>
    </div>

    <div class="thread-info mb-4">
      <div class="category-tag mb-2 d-inline-block px-2 py-1 rounded bg-surface-hover text-muted xx-small fw-bold text-uppercase border border-theme">
        {{ thread.category }}
      </div>
      <h5 class="fw-bold mb-3 lh-base text-adaptive">{{ thread.title }}</h5>
      <div class="author-meta d-flex align-items-center mb-3">
        <div class="position-relative">
          <img :src="thread.author?.avatar || 'https://i.pravatar.cc/150'" :alt="thread.author?.name" class="rounded-circle border border-2 border-theme shadow-sm bg-surface" width="44" height="44" onerror="this.src='https://i.pravatar.cc/150'">
          <span class="status-dot bg-success"></span>
        </div>
        <div class="ms-2">
          <div class="fw-bold small text-adaptive">{{ thread.author?.name || 'Anonymous' }}</div>
          <div class="text-muted" style="font-size: 0.7rem;">Posted on {{ thread.created_at ? new Date(thread.created_at).toLocaleDateString() : 'platform' }}</div>
        </div>
      </div>
      <div class="thread-content-preview p-3 rounded-4 bg-surface-hover border-start border-4 border-purple text-muted small lh-lg">
        <p class="mb-0 italic">"{{ thread.content }}"</p>
      </div>
    </div>

    <div class="view-full-link mb-4">
      <router-link :to="'/forum/' + thread.id" class="btn btn-surface border shadow-sm w-100 rounded-pill py-2 fw-bold small d-flex align-items-center justify-content-center gap-2 text-adaptive">
        <i class="bi bi-box-arrow-up-right"></i>
        View Full Discussion
      </router-link>
    </div>

    <div class="moderation-stats mb-4">
      <div class="row g-3">
        <div class="col-6">
          <div class="stat-box p-3 rounded-4 bg-surface border border-theme text-center transition-all">
            <div :class="['fw-bold fs-4', thread.reports > 0 ? 'text-danger' : 'text-adaptive']">{{ thread.reports || 0 }}</div>
            <div class="text-muted xx-small text-uppercase fw-bold">Reports</div>
          </div>
        </div>
        <div class="col-6">
          <div class="stat-box p-3 rounded-4 bg-surface border border-theme text-center transition-all">
            <div class="fw-bold fs-4 text-adaptive">{{ thread.replies }}</div>
            <div class="text-muted xx-small text-uppercase fw-bold">Replies</div>
          </div>
        </div>
      </div>
    </div>

    <div class="moderation-actions pt-3 border-top border-theme">
      <div class="d-grid gap-2">
        <button 
          class="btn rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all" 
          :class="thread.status === 'PINNED' ? 'btn-primary' : 'btn-outline-primary'"
          style="font-size: 0.85rem;"
          @click="$emit('toggle-pin', thread.id)"
        >
          <i :class="['bi', thread.status === 'PINNED' ? 'bi-pin-angle-fill' : 'bi-pin-angle']"></i> 
          {{ thread.status === 'PINNED' ? 'Unpin Topic' : 'Pin to Top' }}
        </button>
        <button 
          class="btn rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all" 
          :class="thread.status === 'LOCKED' ? 'btn-warning text-white' : 'btn-outline-warning'"
          style="font-size: 0.85rem;"
          @click="$emit('toggle-lock', thread.id)"
        >
          <i :class="['bi', thread.status === 'LOCKED' ? 'bi-unlock' : 'bi-lock']"></i> 
          {{ thread.status === 'LOCKED' ? 'Unlock Thread' : 'Lock Discussion' }}
        </button>
        <button 
          class="btn btn-outline-danger rounded-pill py-2 fw-bold d-grid align-items-center justify-content-center gap-2 transition-all" 
          style="font-size: 0.85rem;"
          @click="$emit('delete-thread', thread.id)"
        >
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-trash"></i> Delete Discussion
          </div>
        </button>
      </div>
    </div>
  </div>

  <div v-else class="thread-detail-card card border-0 shadow-sm rounded-4 p-5 text-center bg-surface border h-100 d-flex flex-column align-items-center justify-content-center sticky-top" style="top: 2rem;">
    <div class="icon-circle-large mb-4 bg-purple-light d-flex align-items-center justify-content-center rounded-circle mx-auto" style="width: 80px; height: 80px;">
      <i class="bi bi-chat-left-text fs-1 text-purple"></i>
    </div>
    <h5 class="fw-bold mb-2 text-adaptive">Select a Discussion</h5>
    <p class="text-muted small mb-0 px-3">Choose a thread from the directory to review content and perform moderation actions.</p>
  </div>
</template>

<script setup>
defineProps({
  thread: {
    type: Object,
    required: true
  }
});

defineEmits(['toggle-pin', 'toggle-lock', 'delete-thread']);
</script>

<style scoped>
.thread-detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.status-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.status-active { background-color: var(--color-success-light); color: var(--color-success); }
.status-pinned { background-color: var(--color-info-light); color: var(--color-info); }
.status-flagged { background-color: var(--color-danger-light); color: var(--color-danger); }
.status-locked { background-color: var(--color-surface-hover); color: var(--color-text-muted); }

.thread-content-preview {
  border-left: 3px solid var(--color-purple);
}

.xx-small {
  font-size: 0.65rem;
}

.tracking-wider {
  letter-spacing: 0.1em;
}

.border-purple {
  border-color: var(--color-purple) !important;
}

.italic {
  font-style: italic;
}

.transition-all {
  transition: all 0.2s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  background-color: var(--color-surface-hover) !important;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-surface);
}

.bg-light-purple-soft {
  background-color: var(--color-purple-light);
}

.text-purple {
  color: var(--color-purple);
}

.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
.text-adaptive { color: var(--color-text) !important; }
.border-theme { border-color: var(--color-border) !important; }
.btn-surface { background-color: var(--color-surface); color: var(--color-text); }
</style>
