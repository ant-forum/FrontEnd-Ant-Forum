<template>
  <div class="thread-table-card card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0">Discussions</h5>
      <div class="d-flex gap-2">
        <div class="input-group search-group shadow-sm rounded-pill overflow-hidden border">
          <span class="input-group-text bg-white border-0 ps-3">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text" 
            class="form-control border-0 py-1 px-2 small" 
            placeholder="Search threads..."
            style="font-size: 0.85rem; width: 180px;"
          >
        </div>
        <div class="dropdown">
          <button class="btn btn-light btn-sm rounded-pill px-3 dropdown-toggle d-flex align-items-center fw-bold" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-filter-left me-2"></i>
            {{ categoryFilter === 'ALL' ? 'Categories' : categoryFilter }}
          </button>
          <ul class="dropdown-menu border-0 shadow-sm rounded-3">
            <li><a class="dropdown-item small" href="#" @click.prevent="$emit('update:categoryFilter', 'ALL')">All Categories</a></li>
            <li v-for="cat in categories" :key="cat">
              <a class="dropdown-item small" href="#" @click.prevent="$emit('update:categoryFilter', cat)">{{ cat }}</a>
            </li>
          </ul>
        </div>
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
              <button class="btn btn-icon btn-light btn-sm rounded-circle me-1" @click.stop="$emit('select-thread', thread)">
                <i class="bi bi-eye" style="font-size: 0.8rem;"></i>
              </button>
              <button class="btn btn-icon btn-light-red btn-sm rounded-circle" @click.stop="$emit('delete-thread', thread.id)">
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

    <div class="card-footer bg-white border-0 p-4 d-flex justify-content-between align-items-center border-top">
      <small class="text-muted">Showing {{ threads.length }} threads</small>
      <div class="pagination-buttons d-flex gap-2">
        <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold">Prev</button>
        <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-brand">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  threads: {
    type: Array,
    required: true
  },
  searchQuery: String,
  categoryFilter: String,
  categories: Array
});

defineEmits(['select-thread', 'delete-thread', 'update:searchQuery', 'update:categoryFilter']);
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

.search-group {
  max-width: 250px;
}

.search-group input:focus {
  box-shadow: none;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-light-red {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-light-red:hover {
  background-color: #ef4444;
  color: white;
}

.cursor-pointer {
  cursor: pointer;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}
</style>
