<template>
  <div class="user-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Users</p>
              <h2 class="fw-bold mb-1">12,842</h2>
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
              <h2 class="fw-bold mb-1">3,109</h2>
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
          <UserTable @select-user="selectedUser = $event" />
        </div>
        <div class="col-xl-4">
          <UserDetailsCard :user="selectedUser" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import UserTable from '../../components/admin/UserTable.vue';
import UserDetailsCard from '../../components/admin/UserDetailsCard.vue';

const selectedUser = ref({
  id: 2,
  name: 'Marcus Wright',
  email: 'm.wright@proton.me',
  avatar: 'https://i.pravatar.cc/150?u=marcus',
  role: 'Student',
  status: 'idle'
});
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
</style>
