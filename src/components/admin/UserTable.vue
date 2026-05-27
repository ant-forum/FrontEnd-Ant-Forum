<template>
  <div class="user-table-card card border-0 shadow-sm rounded-4 overflow-hidden bg-surface border">
    <div class="card-header bg-surface border-0 p-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <h5 class="fw-bold mb-0 text-adaptive">User Directory</h5>
        <div v-if="selectedIds.length > 0" class="bulk-actions d-flex align-items-center gap-2 animate-fade-in">
          <span class="badge bg-purple-light text-purple rounded-pill px-3">{{ selectedIds.length }} Selected</span>
          <button class="btn btn-sm btn-light-danger rounded-pill px-3 fw-bold" @click="$emit('bulk-delete', selectedIds)">Delete</button>
          <button class="btn btn-sm btn-light-primary rounded-pill px-3 fw-bold" @click="$emit('bulk-suspend', selectedIds)">Suspend</button>
        </div>
      </div>
      <div class="d-flex gap-2">
        <div class="input-group search-group shadow-sm rounded-pill overflow-hidden border bg-surface">
          <span class="input-group-text bg-transparent border-0 ps-3">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input 
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text" 
            class="form-control border-0 py-1 px-2 small bg-transparent text-adaptive" 
            placeholder="Search name or email..."
            style="font-size: 0.85rem; width: 200px;"
          >
        </div>
        <div class="dropdown">
          <button class="btn btn-surface-hover btn-sm rounded-pill px-3 dropdown-toggle d-flex align-items-center fw-bold text-adaptive border" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-filter-left me-2"></i>
            {{ roleFilter === 'ALL' ? 'All Roles' : roleFilter }}
          </button>
          <ul class="dropdown-menu border-0 shadow-sm rounded-3 bg-surface">
            <li><a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:roleFilter', 'ALL')">All Roles</a></li>
            <li><a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:roleFilter', 'Admin')">Admin</a></li>
            <li><a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:roleFilter', 'Mentor')">Mentor</a></li>
            <li><a class="dropdown-item small text-adaptive" href="#" @click.prevent="$emit('update:roleFilter', 'Student')">Student</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-surface-hover">
          <tr>
            <th class="ps-4 bg-transparent" style="width: 40px;">
              <div class="form-check">
                <input class="form-check-input custom-checkbox" type="checkbox" :checked="isAllSelected" @change="toggleSelectAll">
              </div>
            </th>
            <th class="text-muted text-uppercase small fw-bold cursor-pointer bg-transparent" style="letter-spacing: 0.5px;" @click="toggleSort('name')">
              User
              <i v-if="sortKey === 'name'" :class="['bi', sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down', 'ms-1']"></i>
            </th>
            <th class="text-muted text-uppercase small fw-bold cursor-pointer bg-transparent" style="letter-spacing: 0.5px;" @click="toggleSort('role')">
              Role
              <i v-if="sortKey === 'role'" :class="['bi', sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down', 'ms-1']"></i>
            </th>
            <th class="text-muted text-uppercase small fw-bold cursor-pointer bg-transparent" style="letter-spacing: 0.5px;" @click="toggleSort('status')">
              Status
              <i v-if="sortKey === 'status'" :class="['bi', sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down', 'ms-1']"></i>
            </th>
            <th class="text-muted text-uppercase small fw-bold d-none d-md-table-cell cursor-pointer bg-transparent" style="letter-spacing: 0.5px;" @click="toggleSort('lastActive')">
              Last Active
              <i v-if="sortKey === 'lastActive'" :class="['bi', sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down', 'ms-1']"></i>
            </th>
            <th class="text-end pe-4 text-muted text-uppercase small fw-bold bg-transparent" style="letter-spacing: 0.5px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.id" class="user-row cursor-pointer" :class="{ 'bg-selected': selectedIds.includes(user.id), 'opacity-50': user.status === 'suspended' }" @click="$emit('select-user', user)">
            <td class="ps-4" @click.stop>
              <div class="form-check">
                <input class="form-check-input custom-checkbox" type="checkbox" :checked="selectedIds.includes(user.id)" @change="toggleSelect(user.id)">
              </div>
            </td>
            <td class="py-3">
              <div class="d-flex align-items-center">
                <div class="position-relative">
                  <img :src="user.avatar" :alt="user.name" class="rounded-circle me-3 border border-theme" width="40" height="40">
                  <span v-if="user.isOnline" class="online-indicator"></span>
                </div>
                <div>
                  <div class="fw-bold mb-0 name-text">{{ user.name }}</div>
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
            <td class="d-none d-md-table-cell">
              <span class="text-muted small fw-medium">{{ user.lastActive || '2h ago' }}</span>
            </td>
            <td class="text-end pe-4">
              <div class="d-flex justify-content-end gap-1">
                <button class="btn btn-icon btn-surface-hover btn-sm rounded-circle border" title="Edit">
                  <i class="bi bi-pencil text-adaptive" style="font-size: 0.8rem;"></i>
                </button>
                <button class="btn btn-icon btn-light-danger btn-sm rounded-circle border" title="Suspend" @click.stop="$emit('suspend-user', user.id)">
                  <i class="bi bi-slash-circle" style="font-size: 0.8rem;"></i>
                </button>
                <div class="dropdown" @click.stop>
                  <button class="btn btn-icon btn-surface-hover btn-sm rounded-circle border" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical text-adaptive" style="font-size: 0.8rem;"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end border border-theme shadow-sm rounded-3 bg-surface">
                    <li><a class="dropdown-item small py-2 text-adaptive" href="#"><i class="bi bi-shield-check me-2"></i>Reset Password</a></li>
                    <li><a class="dropdown-item small py-2 text-adaptive" href="#"><i class="bi bi-envelope me-2"></i>Email User</a></li>
                    <li><hr class="dropdown-divider border-theme"></li>
                    <li><a class="dropdown-item small py-2 text-danger" href="#" @click.prevent="$emit('delete-user', user.id)"><i class="bi bi-trash me-2"></i>Delete</a></li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-people fs-1 opacity-25 d-block mb-2"></i>
              No users found matching your criteria
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-surface border-0 p-4 d-flex justify-content-between align-items-center border-top border-theme">
      <small class="text-muted">Showing {{ users.length }} users</small>
      <div class="pagination-buttons d-flex gap-2">
        <button class="btn btn-surface-hover btn-sm rounded-pill px-3 fw-bold border text-adaptive">Prev</button>
        <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-brand">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  searchQuery: String,
  roleFilter: String,
  selectedIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'select-user', 
  'update:searchQuery', 
  'update:roleFilter', 
  'update:selectedIds',
  'delete-user',
  'suspend-user',
  'bulk-delete',
  'bulk-suspend'
]);

const sortKey = ref('name');
const sortOrder = ref('asc');

const sortedUsers = computed(() => {
  return [...props.users].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
});

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const isAllSelected = computed(() => {
  return props.users.length > 0 && props.selectedIds.length === props.users.length;
});

const toggleSelect = (id) => {
  const newSelected = [...props.selectedIds];
  const index = newSelected.indexOf(id);
  if (index > -1) {
    newSelected.splice(index, 1);
  } else {
    newSelected.push(id);
  }
  emit('update:selectedIds', newSelected);
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    emit('update:selectedIds', []);
  } else {
    emit('update:selectedIds', props.users.map(u => u.id));
  }
};
</script>

<style scoped>
.user-table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.search-group {
  max-width: 250px;
}

.search-group input:focus {
  box-shadow: none;
  background-color: var(--color-surface);
  color: var(--color-text);
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

.user-row:hover {
  background-color: var(--color-bg) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.bg-selected {
  background-color: var(--color-bg) !important;
}

.name-text {
  font-size: 0.95rem;
  color: var(--color-text);
}

.custom-checkbox:checked {
  background-color: var(--color-purple);
  border-color: var(--color-purple);
}

.suspended { background-color: var(--color-danger); }

.role-badge {
  font-size: 0.7rem;
  letter-spacing: 0.3px;
}

.role-mentor { background-color: var(--color-purple-light); color: var(--color-purple); }
.role-student { background-color: var(--color-surface-hover); color: var(--color-text-muted); }
.role-admin { background-color: var(--color-warning-light); color: var(--color-warning); }

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.active { background-color: var(--color-success); }
.idle { background-color: var(--color-text-muted); }

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 18px;
  width: 10px;
  height: 10px;
  background-color: var(--color-success);
  border: 2px solid var(--color-surface);
  border-radius: 50%;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.btn-light-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border: none;
}

.btn-light-danger:hover {
  background-color: var(--color-danger);
  color: white;
}

.btn-light-primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border: none;
}

.btn-light-primary:hover {
  background-color: var(--color-primary);
  color: white;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.shadow-brand {
  box-shadow: 0 4px 12px var(--color-purple-light);
}

.cursor-pointer {
  cursor: pointer;
}

.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
.text-adaptive { color: var(--color-text) !important; }
.border-theme { border-color: var(--color-border) !important; }
.btn-surface-hover { background-color: var(--color-surface-hover); color: var(--color-text); }

</style>
