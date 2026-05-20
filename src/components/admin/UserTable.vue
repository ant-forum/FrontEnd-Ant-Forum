<template>
  <div class="user-table-card card border-0 shadow-sm rounded-4 overflow-hidden">
    <div class="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0">User Directory</h5>
      <div class="d-flex gap-2">
        <div class="dropdown">
          <button class="btn btn-light btn-sm rounded-pill px-3 dropdown-toggle d-flex align-items-center" type="button">
            <i class="bi bi-filter-left me-2"></i>
            All Roles
          </button>
        </div>
        <button class="btn btn-light btn-sm rounded-pill px-2">
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light">
          <tr>
            <th class="ps-4 text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">User</th>
            <th class="text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Role</th>
            <th class="text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Status</th>
            <th class="text-end pe-4 text-muted text-uppercase small fw-bold" style="letter-spacing: 0.5px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="cursor-pointer" @click="$emit('select-user', user)">
            <td class="ps-4 py-3">
              <div class="d-flex align-items-center">
                <img :src="user.avatar" :alt="user.name" class="rounded-circle me-3" width="40" height="40">
                <div>
                  <div class="fw-bold mb-0" style="font-size: 0.95rem;">{{ user.name }}</div>
                  <div class="text-muted small">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <span :class="['role-badge px-3 py-1 rounded-pill fw-bold', user.roleClass]">
                {{ user.role }}
              </span>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <span :class="['status-dot me-2', user.status]"></span>
                <span class="fw-bold text-muted small">{{ user.statusLabel }}</span>
              </div>
            </td>
            <td class="text-end pe-4">
              <button class="btn btn-icon btn-light btn-sm rounded-circle me-1">
                <i class="bi bi-pencil" style="font-size: 0.8rem;"></i>
              </button>
              <button class="btn btn-icon btn-light btn-sm rounded-circle">
                <i class="bi bi-slash-circle" style="font-size: 0.8rem;"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-white border-0 p-4 d-flex justify-content-between align-items-center">
      <small class="text-muted">Showing 3 of 12,842 users</small>
      <div class="pagination-buttons d-flex gap-2">
        <button class="btn btn-light btn-sm rounded-pill px-3 fw-bold">Prev</button>
        <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-brand">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['select-user']);

defineProps({
  users: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.user-table-card {
  background: white;
}

.table thead th {
  border-bottom: 1px solid #f1f5f9;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.table tbody td {
  border-bottom: 1px solid #f8fafc;
}

.role-badge {
  font-size: 0.7rem;
  letter-spacing: 0.3px;
}

.role-mentor { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.role-student { background-color: rgba(100, 116, 139, 0.1); color: #64748b; }
.role-admin { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.active { background-color: #10b981; }
.idle { background-color: #94a3b8; }

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
