<template>
  <header class="admin-topbar">
    <div class="topbar-left">
      <div class="breadcrumb-line">
        <router-link to="/admin">Admin</router-link>
        <template v-if="breadcrumbs && breadcrumbs.length">
          <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
            <i class="bi bi-chevron-right"></i>
            <router-link v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</router-link>
            <span v-else>{{ crumb.label }}</span>
          </template>
        </template>
        <template v-else>
          <i class="bi bi-chevron-right"></i>
          <span>{{ currentTitle }}</span>
        </template>
      </div>
      <h1>{{ currentTitle }}</h1>
    </div>

    <div class="topbar-right">
      <label class="topbar-search">
        <i class="bi bi-search"></i>
        <input type="search" placeholder="Search admin">
      </label>

      <button class="topbar-icon" type="button" :title="isDark ? 'Light mode' : 'Dark mode'" @click="toggleDarkMode">
        <i :class="['bi', isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill']"></i>
      </button>

      <button class="topbar-icon notification-button" type="button" title="Notifications">
        <i class="bi bi-bell"></i>
        <span></span>
      </button>

      <router-link to="/admin/profile" class="topbar-profile text-decoration-none">
        <img v-if="adminAvatar" :src="adminAvatar" class="profile-avatar border border-1 border-primary-subtle" style="object-fit: cover; border-radius: 50%;" width="38" height="38">
        <span v-else class="profile-avatar">{{ adminInitials }}</span>
        <div>
          <strong>{{ adminName }}</strong>
          <small class="text-muted">{{ adminRole }}</small>
        </div>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { useDarkMode } from '../../composables/useDarkMode';
import { useAuthStore } from '../../stores/AuthStore';
import { computed } from 'vue';

defineProps({
  currentTitle: {
    type: String,
    default: 'Overview',
  },
  breadcrumbs: {
    type: Array,
    default: null,
  },
});

const { isDark, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();

const adminName = computed(() => authStore.user?.name || authStore.user?.username || 'Alex Rivera');
const adminRole = computed(() => {
  const r = authStore.user?.role || 'Super Admin';
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
});
const adminInitials = computed(() => {
  return adminName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AR';
});
const adminAvatar = computed(() => authStore.user?.avatar || authStore.user?.profile_pic || authStore.user?.avatarUrl);
</script>

<style scoped>
.admin-topbar {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.9rem 2rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 8;
}

.topbar-left {
  min-width: 0;
}

.breadcrumb-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.breadcrumb-line a {
  color: var(--color-text-muted);
  text-decoration: none;
}

.breadcrumb-line a:hover {
  color: var(--color-primary);
}

.topbar-left h1 {
  color: var(--color-text);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0.25rem 0 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  min-width: 0;
}

.topbar-search {
  width: min(360px, 32vw);
  min-width: 230px;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.85rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), background-color var(--transition-base);
}

.topbar-search:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  background: var(--color-surface);
}

.topbar-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
}

.topbar-search input:focus,
.topbar-search input:focus-visible {
  outline: none;
  box-shadow: none !important;
}

.topbar-icon {
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.topbar-icon:hover {
  background: var(--color-surface-hover);
}

.notification-button span {
  width: 8px;
  height: 8px;
  background: var(--color-danger);
  border: 2px solid var(--color-surface);
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 9px;
}

.topbar-profile {
  min-width: 164px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--color-border);
}

.profile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
}

.topbar-profile strong,
.topbar-profile small {
  display: block;
  white-space: nowrap;
}

.topbar-profile strong {
  color: var(--color-text);
  font-size: 0.86rem;
}

.topbar-profile small {
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

@media (max-width: 991.98px) {
  .admin-topbar {
    position: static;
    padding: 1rem;
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .topbar-search {
    width: 100%;
    min-width: 0;
    order: 5;
  }
}

@media (max-width: 575.98px) {
  .topbar-profile {
    min-width: 0;
    padding-left: 0;
    border-left: 0;
  }

  .topbar-profile div {
    display: none;
  }
}
</style>
