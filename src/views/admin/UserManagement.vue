<template>
  <div class="user-management-layout d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="fw-bold mb-1 text-adaptive">User Directory</h2>
          <p class="text-muted small mb-0">Manage platform members and their access levels</p>
        </div>
        <router-link to="/admin/users/create" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-brand d-flex align-items-center gap-2">
          <i class="bi bi-person-plus-fill"></i>
          Create User
        </router-link>
      </div>

      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <StatCard
            label="Total Users"
            :value="users.length"
            footer-icon="bi-graph-up"
            footer-text="+14% from last month"
            footer-class="text-success"
            main-icon="bi-people"
            icon-class="text-purple"
            bg-class="bg-light-purple"
          />
        </div>
        <div class="col-md-4">
          <StatCard
            label="Active Today"
            :value="users.filter(u => u.isOnline).length"
            footer-icon="bi-lightning-charge-fill"
            footer-text="High server load"
            footer-class="text-warning"
            main-icon="bi-eye"
            icon-class="text-orange"
            bg-class="bg-light-orange"
          />
        </div>
        <div class="col-md-4">
          <StatCard
            label="New Signups"
            value="84"
            footer-class="text-purple-light"
            main-icon="bi-person-plus"
            icon-class="text-green"
            bg-class="bg-light-green"
          >
            <template #footer>
              <div class="mini-chart me-2 d-flex align-items-end gap-1">
                <span class="bar" style="height: 8px;"></span>
                <span class="bar" style="height: 12px;"></span>
                <span class="bar active" style="height: 16px;"></span>
                <span class="bar" style="height: 10px;"></span>
              </div>
              <span class="fw-bold">Weekly trend</span>
            </template>
          </StatCard>
        </div>
      </div>

      <!-- Main Directory and Details -->
      <div class="row g-4">
        <div class="col-xl-8">
          <UserTable 
            :users="filteredUsers" 
            v-model:searchQuery="searchQuery"
            v-model:roleFilter="roleFilter"
            v-model:selectedIds="selectedIds"
            @select-user="selectedUser = $event"
            @suspend-user="handleSuspend"
            @delete-user="handleDelete"
            @bulk-delete="handleBulkDelete"
          />
        </div>
        <div class="col-xl-4">
          <UserDetailsCard v-if="selectedUser" :user="selectedUser" @suspend="handleSuspend(selectedUser.id)" />
          <div v-else class="card border-0 shadow-sm rounded-4 p-5 text-center bg-surface border h-100 d-flex flex-column align-items-center justify-content-center">
            <div class="icon-circle-large mb-4 bg-purple-light d-flex align-items-center justify-content-center rounded-circle mx-auto" style="width: 80px; height: 80px;">
              <i class="bi bi-person-bounding-box fs-1 text-purple"></i>
            </div>
            <h5 class="fw-bold mb-2 text-adaptive">Select a User</h5>
            <p class="text-muted small mb-0 px-3">Choose a member from the directory to view their full profile and manage permissions.</p>
          </div>
        </div>
      </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import UserTable from '../../components/admin/UserTable.vue';
import UserDetailsCard from '../../components/admin/UserDetailsCard.vue';
import StatCard from '../../components/admin/StatCard.vue';

const searchQuery = ref('');
const roleFilter = ref('ALL');
const selectedIds = ref([]);

const users = ref([
  {
    id: 1,
    name: 'Sarah Connor',
    email: 's.connor@antforum.io',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    role: 'Mentor',
    roleClass: 'role-mentor',
    status: 'active',
    statusLabel: 'Active',
    joinedDate: 'Jan 2024',
    reputation: '2.4k',
    location: 'Los Angeles, CA',
    lastIp: '192.168.1.45',
    isOnline: true
  },
  {
    id: 2,
    name: 'Marcus Wright',
    email: 'm.wright@proton.me',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    role: 'Student',
    roleClass: 'role-student',
    status: 'idle',
    statusLabel: 'Idle',
    joinedDate: 'Mar 2024',
    reputation: '850',
    location: 'San Francisco, CA',
    lastIp: '10.0.0.12',
    isOnline: false
  },
  {
    id: 3,
    name: 'Elena Fisher',
    email: 'e.fisher@enterprise.io',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    role: 'Admin',
    roleClass: 'role-admin',
    status: 'active',
    statusLabel: 'Active',
    joinedDate: 'Dec 2023',
    reputation: '5.1k',
    location: 'London, UK',
    lastIp: '172.16.254.1',
    isOnline: true
  },
  {
    id: 4,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://i.pravatar.cc/150?u=john',
    role: 'Student',
    roleClass: 'role-student',
    status: 'active',
    statusLabel: 'Active',
    joinedDate: 'Feb 2024',
    reputation: '1.1k',
    location: 'New York, NY',
    lastIp: '192.168.1.10',
    isOnline: true
  }
]);

const selectedUser = ref(users.value[0]);

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesRole = roleFilter.value === 'ALL' || user.role === roleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const handleSuspend = (userId) => {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    user.statusLabel = user.status === 'suspended' ? 'Suspended' : 'Active';
  }
};

const handleDelete = (userId) => {
  if (confirm('Are you sure you want to delete this user?')) {
    users.value = users.value.filter(u => u.id !== userId);
    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value = users.value[0] || null;
    }
  }
};

const handleBulkDelete = (ids) => {
  if (confirm(`Are you sure you want to delete ${ids.length} users?`)) {
    users.value = users.value.filter(u => !ids.includes(u.id));
    selectedIds.value = [];
    selectedUser.value = users.value[0] || null;
  }
};
</script>

<style scoped>
.user-management-layout {
  background-color: var(--color-bg);
  font-family: var(--font-family-base);
}

.admin-main {
  background-color: var(--color-bg);
}

.icon-circle-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.text-purple { color: var(--color-purple); }

.mini-chart .bar {
  width: 3px;
  background-color: var(--color-border);
  border-radius: 1px;
}

.mini-chart .bar.active {
  background-color: var(--color-purple);
}

.shadow-brand {
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.bg-surface { background-color: var(--color-surface) !important; }
.text-adaptive { color: var(--color-text) !important; }
.bg-purple-light { background-color: var(--color-purple-light) !important; }
</style>
