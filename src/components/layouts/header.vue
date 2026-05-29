<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDarkMode } from '../../composables/useDarkMode';
import { useAuthStore } from '../../stores/AuthStore';
import { useNotificationStore } from '../../stores/NotificationStore';
import NotificationDropdown from '../notification/NotificationDropdown.vue';

const route = useRoute();
const { isDark, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const activeLink = ref(route.name || 'Forum');
const isMobileMenuOpen = ref(false);
const isNotificationOpen = ref(false);

const navLinks = [
  { name: 'Forum', path: '/forum' },
  { name: 'Showcase', path: '/showcase' },
  { name: 'Blog', path: '/blog' }
];

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchNotifications();
  }
});
</script>

<template>
  <header class="global-header sticky-top">
    <div class="container py-3 d-flex align-items-center justify-content-between">
      <!-- Logo Section -->
      <div class="header-left d-flex align-items-center flex-1">
        <router-link to="/" class="text-decoration-none d-flex align-items-center">
          <span class="logo-text fw-black fs-3 text-gradient">ANTFORUM</span>
        </router-link>
      </div>

      <!-- Center Navigation -->
      <div class="header-center d-none d-md-block">
        <div class="nav-pills-modern d-flex gap-1 p-1 border rounded-pill shadow-sm">
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

      <!-- Right Actions -->
      <div class="header-right d-flex align-items-center justify-content-end gap-3 flex-1">
        <div class="d-flex gap-2 align-items-center">
          <button @click="toggleDarkMode" class="btn btn-icon-modern" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <i :class="isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
          </button>
          
          <!-- Only show notification bell when logged in -->
          <div v-if="authStore.isAuthenticated" class="position-relative d-flex align-items-center justify-content-center">
            <button 
              @click="isNotificationOpen = !isNotificationOpen" 
              class="btn btn-icon-modern btn-bell-toggle position-relative" 
              title="Notifications"
            >
              <i class="bi bi-bell"></i>
              <!-- Unread notification count badge -->
              <span v-if="notificationStore.unreadCount > 0" class="badge-unread-count rounded-circle position-absolute d-flex align-items-center justify-content-center fw-bold">
                {{ notificationStore.unreadCount }}
              </span>
            </button>
            <NotificationDropdown 
              v-if="isNotificationOpen" 
              @close="isNotificationOpen = false" 
            />
          </div>
        </div>

        <!-- Authenticated Profile Pill -->
        <router-link 
          v-if="authStore.isAuthenticated" 
          to="/profile" 
          class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 border rounded-pill shadow-sm cursor-pointer text-decoration-none"
        >
          <img 
            :src="authStore.user?.profile_pic || '/charles_leclerc.png'" 
            class="rounded-circle border border-2 border-primary-subtle object-fit-cover" 
            width="32" 
            height="32" 
            alt="User"
          >
          <span class="small fw-bold d-none d-xl-block">{{ authStore.user?.username}}</span>
        </router-link>

        <!-- Guest / Unauthenticated Profile Pill -->
        <router-link 
          v-else 
          to="/login" 
          class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 border rounded-pill shadow-sm cursor-pointer text-decoration-none guest-pill"
        >
          <div class="guest-avatar rounded-circle border border-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
            <i class="bi bi-person-fill"></i>
          </div>
          <span class="small fw-bold d-none d-xl-block">Log In</span>
        </router-link>

        <button class="btn btn-icon-modern d-md-none ms-2" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <i :class="['bi', isMobileMenuOpen ? 'bi-x-lg' : 'bi-list']"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition name="slide-fade-menu">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay d-md-none">
        <div class="mobile-nav-links p-4 d-flex flex-column gap-2">
          <router-link 
            v-for="link in navLinks" 
            :key="link.name" 
            :to="link.path" 
            class="mobile-nav-link" 
            :class="{ 'active': route.path.startsWith(link.path) }"
            @click="isMobileMenuOpen = false"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.global-header {
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;
}

.flex-1 {
  flex: 1;
}

.logo-text {
  letter-spacing: -1px;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-pills-modern {
  transition: all 0.3s ease;
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
}

.nav-link-modern {
  padding: 6px 18px;
  border-radius: 50px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-link-modern:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.nav-link-modern.active {
  background: var(--color-primary);
  color: white !important;
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.btn-icon-modern {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  transition: all 0.2s;
  cursor: pointer;
}

.btn-icon-modern:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.search-box-modern:focus-within {
  border-color: var(--color-primary) !important;
  background-color: var(--color-surface) !important;
  box-shadow: var(--focus-ring);
}

.user-profile-pill {
  transition: all 0.2s ease;
  background-color: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}

.user-profile-pill:hover {
  border-color: var(--color-primary) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md) !important;
}

.guest-avatar {
  background: var(--color-surface-hover) !important;
  color: var(--color-text-muted) !important;
  border-color: var(--color-border) !important;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.user-profile-pill:hover .guest-avatar {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.x-small {
  font-size: 0.7rem;
}

.badge-unread-count {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--color-primary, #7c3aed);
  border: 2px solid var(--color-surface, #1e1e30);
  color: white;
  font-size: 9px;
  font-weight: 700;
  box-shadow: 0 0 8px var(--color-primary-light, rgba(124, 58, 237, 0.4));
  transition: all 0.3s ease;
  z-index: 10;
}

@media (max-width: 768px) {
  .header-center {
    display: none !important;
  }
}

/* Mobile Menu Panel */
.mobile-menu-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-glass-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  z-index: 999;
}

.mobile-nav-link {
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: block;
}

.mobile-nav-link:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.mobile-nav-link.active {
  background: #6366f1;
  color: white !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* Transition */
.slide-fade-menu-enter-active, .slide-fade-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-menu-enter-from, .slide-fade-menu-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
