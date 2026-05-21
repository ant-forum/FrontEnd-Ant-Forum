<template>
  <aside class="admin-sidebar d-flex flex-column">
    <!-- Brand Header -->
    <div class="sidebar-header p-4 mb-4">
      <h3 class="fw-bold mb-2 brand-title">Admin Suite</h3>
      <p class="text-muted text-uppercase tracking-widest fw-bold mb-0" style="font-size: 0.7rem; line-height: 1.6;">
        Technical<br>Operations
      </p>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav flex-grow-1 px-3">
      <ul class="list-unstyled">
        <li v-for="item in navItems" :key="item.label" class="mb-1">
          <router-link 
            :to="item.path" 
            class="nav-link d-flex align-items-center p-3 rounded-3"
            active-class="active"
          >
            <i :class="[item.icon, 'me-3']"></i>
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer p-4">
      <div class="user-profile d-flex align-items-center">
        <img src="https://i.pravatar.cc/150?u=alex" alt="Alex Rivera" class="rounded-circle me-3" width="36" height="36">
        <div class="user-info overflow-hidden">
          <h6 class="mb-0 fw-bold text-truncate" style="font-size: 0.9rem;">Alex Rivera</h6>
          <small class="text-muted text-truncate d-block" style="font-size: 0.75rem;">Lead Architect</small>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const navItems = ref([
  { label: 'Overview', icon: 'bi bi-grid-1x2', path: '/admin' },
  { label: 'Users', icon: 'bi bi-people', path: '/admin/users' },
  { label: 'Projects', icon: 'bi bi-folder2', path: '/admin/projects' },
  { label: 'Threads', icon: 'bi bi-chat-dots', path: '/admin/threads' },
  { label: 'Analytics', icon: 'bi bi-bar-chart', path: '/admin/analytics' },
  { label: 'Settings', icon: 'bi bi-gear', path: '/admin/settings' },
]);
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.brand-title {
  letter-spacing: -0.5px;
  color: #1a1a1a;
}

.tracking-widest {
  letter-spacing: 1px;
}

.nav-link {
  color: #666666;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f5f5f7;
  color: #000000;
}

.nav-link.active {
  background-color: #f5f5f7;
  color: #000000;
}

.nav-link i {
  font-size: 1.2rem;
  opacity: 0.8;
}

.nav-link.active i {
  opacity: 1;
}

.btn-primary {
  background-color: #8b5cf6;
  border: none;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background-color: #7c3aed;
  transform: translateY(-1px);
}

.user-profile {
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}
</style>
