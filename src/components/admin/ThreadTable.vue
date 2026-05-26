<template>
  <div class="thread-table-card card border-0 shadow-sm rounded-4 overflow-hidden bg-surface border">
    <div class="card-header bg-surface border-0 p-4 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-adaptive">Platform Discussions</h5>
      <div class="d-flex gap-3">
        <div class="input-group search-group shadow-sm rounded-pill border bg-surface d-flex align-items-center border-theme">
          <span class="input-group-text bg-transparent border-0 ps-3 py-0">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text" 
            class="form-control border-0 py-2 small bg-transparent text-adaptive" 
            placeholder="Search discussions..."
            style="font-size: 0.9rem; width: 220px; box-shadow: none;"
          >
          <button 
            v-if="searchQuery" 
            class="btn border-0 bg-transparent pe-3 text-muted" 
            type="button"
            @click="$emit('update:searchQuery', '')"
          >
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>
        <div class="dropdown">
          <button class="btn btn-surface border shadow-sm rounded-pill px-4 py-2 dropdown-toggle d-flex align-items-center fw-bold small text-adaptive" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-funnel me-2"></i>
            {{ categoryFilter === 'ALL' ? 'All Categories' : categoryFilter }}
          </button>
          <ul class="dropdown-menu border-0 shadow-sm rounded-3 bg-surface">
            <li><a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:categoryFilter', 'ALL')">All Categories</a></li>
            <li v-for="cat in categories" :key="cat">
              <a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:categoryFilter', cat)">{{ cat }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-surface-hover">
          <tr>
            <th class="ps-4 text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Thread</th>
            <th class="text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Author</th>
            <th class="text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Stats</th>
            <th class="text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Status</th>
            <th class="text-end pe-4 text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="thread in threads" :key="thread.id" :class="['cursor-pointer transition-all', thread.reports > 0 ? 'bg-light-red-soft' : '', selectedId === thread.id ? 'bg-purple-extra-light' : '']" @click="$emit('select-thread', thread)">
            <td class="ps-4 py-3">
              <div class="d-flex flex-column" style="max-width: 300px;">
                <span class="fw-bold text-truncate mb-1 text-adaptive" style="font-size: 0.95rem;" v-html="highlight(thread.title)"></span>
                <span class="text-muted small text-truncate d-flex align-items-center">
                  <i class="bi bi-tag me-1"></i>
                  <span v-html="highlight(thread.category)"></span>
                </span>
              </div>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <img :src="thread.author?.avatar || 'https://i.pravatar.cc/150'" :alt="thread.author?.name" class="rounded-circle me-2 border border-theme" width="32" height="32" onerror="this.src='https://i.pravatar.cc/150'">
                <div class="d-flex flex-column">
                  <span class="small fw-medium text-adaptive" v-html="highlight(thread.author?.name || 'Unknown')"></span>
                  <span class="xx-small text-muted">{{ thread.created_at ? new Date(thread.created_at).toLocaleDateString() : '' }}</span>
                </div>
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
              <button class="btn btn-icon btn-surface-hover btn-sm rounded-circle me-1 border" @click.stop="$emit('select-thread', thread)">
                <i class="bi bi-eye text-adaptive" style="font-size: 0.8rem;"></i>
              </button>
              <button class="btn btn-icon btn-light-danger btn-sm rounded-circle border" @click.stop="$emit('delete-thread', thread.id)">
                <i class="bi bi-trash" style="font-size: 0.8rem;"></i>
              </button>
            </td>
          </tr>
          <tr v-if="threads.length === 0">
            <td colspan="5" class="text-center py-5 text-muted">
              <i class="bi bi-chat-square-text fs-1 opacity-25 d-block mb-2"></i>
              No discussions found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-surface border-0 p-4 d-flex justify-content-between align-items-center border-top border-theme">
      <small class="text-muted">Showing {{ threads.length }} of {{ totalThreads }} threads</small>
      <div class="pagination-buttons d-flex gap-2 align-items-center">
        <button 
          class="btn btn-surface-hover btn-sm rounded-pill px-3 fw-bold border text-adaptive" 
          :disabled="currentPage === 1"
          @click="$emit('page-change', currentPage - 1)"
        >
          <i class="bi bi-chevron-left"></i> Prev
        </button>
        <span class="small fw-bold text-muted px-2">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
        <button 
          class="btn btn-surface-hover btn-sm rounded-pill px-3 fw-bold border text-adaptive" 
          :disabled="currentPage === totalPages || totalPages === 0"
          @click="$emit('page-change', currentPage + 1)"
        >
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  threads: {
    type: Array,
    required: true
  },
  totalThreads: Number,
  currentPage: Number,
  totalPages: Number,
  searchQuery: String,
  categoryFilter: String,
  categories: Array,
  selectedId: [Number, String]
});

defineEmits(['select-thread', 'delete-thread', 'update:searchQuery', 'update:categoryFilter', 'page-change']);

const highlight = (text) => {
  if (!props.searchQuery) return text;
  const regex = new RegExp(`(${props.searchQuery})`, 'gi');
  return text.toString().replace(regex, '<mark class="bg-purple-light p-0">$1</mark>');
};
</script>

<style scoped>
.thread-table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.table thead th {
  border-bottom: 1px solid var(--color-border);
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody td {
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  background-color: var(--color-surface);
}

.card-footer {
  background-color: var(--color-surface) !important;
  border-top: 1px solid var(--color-border) !important;
}

.status-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.status-active { background-color: var(--color-success-light); color: var(--color-success); }
.status-pinned { background-color: var(--color-info-light); color: var(--color-info); }
.status-flagged { background-color: var(--color-danger-light); color: var(--color-danger); }
.status-locked { background-color: var(--color-surface-hover); color: var(--color-text-muted); }

.search-group {
  max-width: 300px;
  height: 42px;
}

.search-group .input-group-text {
  display: flex;
  align-items: center;
  height: 100%;
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-muted);
}

.search-group input {
  background-color: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

.search-group input:focus {
  box-shadow: none;
  border-color: var(--color-primary);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-light-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.btn-light-danger:hover {
  background-color: var(--color-danger);
  color: white;
}

.bg-light-red-soft {
  background-color: var(--color-danger-light);
  opacity: 0.2;
}

.bg-purple-light {
  background-color: var(--color-purple-light);
  color: inherit;
}

.bg-purple-extra-light {
  background-color: var(--color-purple-light) !important;
  opacity: 0.5;
}

.xx-small {
  font-size: 0.65rem;
}

.transition-all {
  transition: all 0.2s ease;
}

.table-hover tbody tr:hover {
  background-color: var(--color-surface-hover) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.shadow-brand {
  box-shadow: 0 4px 12px var(--color-purple-light);
}

.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
.text-adaptive { color: var(--color-text) !important; }
.border-theme { border-color: var(--color-border) !important; }
.btn-surface { background-color: var(--color-surface); color: var(--color-text); }
.btn-surface-hover { background-color: var(--color-surface-hover); color: var(--color-text); }
</style>
