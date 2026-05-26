<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeLink = ref(route.name || 'Forum');

const navLinks = [
  { name: 'Forum', path: '/forum' },
  { name: 'Showcase', path: '/showcase' },
  { name: 'Blog', path: '/blog' }
];
</script>

<template>
  <header class="global-header sticky-top">
    <div class="container py-3 d-flex align-items-center justify-content-between">
      <div class="header-left d-flex align-items-center flex-1">
        <router-link to="/" class="text-decoration-none d-flex align-items-center">
          <span class="logo-text fw-black fs-3 text-gradient">ANTFORUM</span>
        </router-link>
      </div>

      <div class="header-center d-none d-md-block">
        <div class="nav-pills-modern d-flex gap-1 p-1 border rounded-pill bg-white shadow-sm">
          <router-link 
            v-for="link in navLinks" 
            :key="link.name" 
            :to="link.path" 
            class="nav-link-modern" 
            :class="{ 'active': route.path.startsWith(link.path) }"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>

      <div class="header-right d-flex align-items-center justify-content-end gap-3 flex-1">
        <div class="d-flex gap-2">
          <button class="btn btn-icon-modern"><i class="bi bi-bell"></i></button>
        </div>

        <div class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 bg-white border rounded-pill shadow-sm cursor-pointer">
          <img src="https://i.pravatar.cc/150?u=alex" class="rounded-circle border border-2 border-primary-subtle" width="32" height="32" alt="User">
          <span class="small fw-bold d-none d-xl-block">Alex Chen</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.global-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.flex-1 {
  flex: 1;
}

.logo-text {
  letter-spacing: -1px;
}

.text-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-pills-modern {
  transition: all 0.3s ease;
}

.nav-link-modern {
  padding: 6px 18px;
  border-radius: 50px;
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-link-modern:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.nav-link-modern.active {
  background: #6366f1;
  color: white !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-icon-modern {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;
  border: 1px solid #f1f5f9;
  color: #64748b;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-icon-modern:hover {
  background: #f8fafc;
  color: #6366f1;
  border-color: #e0e7ff;
}

.search-box-modern:focus-within {
  border-color: #6366f1 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.user-profile-pill {
  transition: all 0.2s ease;
}

.user-profile-pill:hover {
  border-color: #6366f1 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.x-small {
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .header-center {
    display: none !important;
  }
}
</style>
