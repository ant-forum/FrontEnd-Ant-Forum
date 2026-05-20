<template>
  <div class="user-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Header with Action -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">User Management</h3>
          <p class="text-muted small mb-0">Manage and monitor platform users</p>
        </div>
        <router-link to="/admin/users/create" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-brand d-flex align-items-center">
          <i class="bi bi-person-plus-fill me-2"></i>
          Create User
        </router-link>
      </div>

      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Users</p>
              <h2 class="fw-bold mb-1">{{ users.length }}</h2>
              <div class="d-flex align-items-center text-success small">
                <i class="bi bi-graph-up me-1"></i>
                <span class="fw-bold">+14% from last month</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-purple p-3">
              <i class="bi bi-people text-purple fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Active Today</p>
              <h2 class="fw-bold mb-1">{{ users.filter(u => u.isOnline).length }}</h2>
              <div class="d-flex align-items-center text-warning small">
                <i class="bi bi-lightning-charge-fill me-1"></i>
                <span class="fw-bold">High server load</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-orange p-3">
              <i class="bi bi-eye text-orange fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">New Signups</p>
              <h2 class="fw-bold mb-1">84</h2>
              <div class="d-flex align-items-center text-purple-light small">
                <div class="mini-chart me-2 d-flex align-items-end gap-1">
                  <span class="bar" style="height: 8px;"></span>
                  <span class="bar" style="height: 12px;"></span>
                  <span class="bar active" style="height: 16px;"></span>
                  <span class="bar" style="height: 10px;"></span>
                </div>
                <span class="fw-bold">Weekly trend</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-green p-3">
              <i class="bi bi-person-plus text-green fs-4"></i>
            </div>
          </div>
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
          <div v-else class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column align-items-center justify-content-center">
            <i class="bi bi-person-bounding-box fs-1 text-muted opacity-25 mb-3"></i>
            <p class="text-muted">Select a user to view details</p>
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
  font-family: var(--font-family-base);
}

.icon-box {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.text-purple { color: #8b5cf6; }

.bg-light-orange { background-color: rgba(245, 158, 11, 0.1); }
.text-orange { color: #f59e0b; }

.bg-light-green { background-color: rgba(16, 185, 129, 0.1); }
.text-green { color: #10b981; }

.mini-chart .bar {
  width: 3px;
  background-color: #cbd5e1;
  border-radius: 1px;
}

.mini-chart .bar.active {
  background-color: #8b5cf6;
}

.bg-light {
  background-color: #f8fafc !important;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}

.btn-primary {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.btn-primary:hover {
  background-color: #7c3aed;
  border-color: #7c3aed;
}
</style>
