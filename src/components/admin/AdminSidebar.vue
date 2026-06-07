<template>
  <aside class="admin-sidebar d-flex flex-column">
    <!-- Brand Header -->
    <div class="sidebar-header p-4 mb-3 border-bottom-translucent">
      <h3 class="fw-bold mb-2 brand-title d-flex align-items-center gap-2">
        <div class="brand-icon-wrapper">
          <i class="bi bi-shield-lock-fill text-white"></i>
        </div>
        <span>Admin Suite</span>
      </h3>
      <span class="badge-operations-deck">TECHNICAL OPERATIONS</span>
    </div>

    <!-- Navigation Grouped -->
    <nav class="sidebar-nav flex-grow-1 px-3">
      <div v-for="category in navigationCategories" :key="category.title" class="nav-group mb-4">
        <div class="sidebar-heading">{{ category.title }}</div>
        <ul class="list-unstyled mb-0">
          <li v-for="item in category.items" :key="item.label" class="mb-1">
            <router-link 
              :to="item.path" 
              class="nav-link d-flex align-items-center px-3 py-2-5 rounded-3"
              :class="{ 'premium-active': isRouteActive(item.path) }"
            >
              <i :class="[item.icon, 'me-3']"></i>
              <span class="nav-text">{{ item.label }}</span>
              <span v-if="badgeFor(item.path)" class="nav-count ms-auto">{{ badgeFor(item.path) }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const route = useRoute();
const adminStore = useAdminOperationsStore();

const navigationCategories = ref([
  {
    title: 'Manage',
    items: [
      { label: 'Overview', icon: 'bi bi-grid-1x2', path: '/admin' },
      { label: 'Users', icon: 'bi bi-people', path: '/admin/users' },
      { label: 'Projects', icon: 'bi bi-folder2', path: '/admin/projects' },
      { label: 'Blogs', icon: 'bi bi-file-earmark-post', path: '/admin/blogs' },
      { label: 'Categories', icon: 'bi bi-grid-fill', path: '/admin/categories' },
      { label: 'Tags', icon: 'bi bi-tags', path: '/admin/tags' },
      { label: 'Threads', icon: 'bi bi-chat-dots', path: '/admin/threads' },
      { label: 'Reports', icon: 'bi bi-flag', path: '/admin/reports' },
    ]
  },
]);

const isRouteActive = (itemPath) => {
  if (itemPath === '/admin') {
    return route.path === '/admin';
  }
  return route.path.startsWith(itemPath);
};

const badgeFor = (itemPath) => adminStore.sidebarBadges[itemPath] || 0;
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 10;
}

.brand-title {
  letter-spacing: -0.5px;
  color: var(--color-text);
  font-size: 1.25rem;
}

.brand-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
}

.badge-operations-deck {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0.25rem 0.65rem;
  border-radius: 5px;
  display: inline-block;
  margin-top: 0.25rem;
}

.border-bottom-translucent {
  border-bottom: 1px solid var(--color-border);
}

.tracking-widest {
  letter-spacing: 1px;
}

.nav-link {
  color: var(--color-text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border-radius: 99px;
}

.py-2-5 {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.nav-link:hover,
.nav-link.premium-active,
.nav-link.router-link-active {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-link i {
  font-size: 1.1rem;
  opacity: 0.75;
  transition: all 0.2s ease;
}

.nav-link:hover i {
  opacity: 1;
}

.nav-count {
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35rem;
  color: var(--color-danger);
  background: var(--color-danger-light);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-header {
    padding: 1rem 1rem 0.5rem !important;
    margin-bottom: 0.75rem !important;
  }

  .sidebar-header p {
    display: none;
  }

  .sidebar-nav {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 0 1rem 1rem !important;
  }

  .nav-group {
    min-width: max-content;
    margin-bottom: 0 !important;
  }

  .nav-group ul {
    display: flex;
    gap: 0.35rem;
  }

  .sidebar-heading {
    display: none;
  }

  .nav-link {
    white-space: nowrap;
    border: 1px solid var(--color-border);
    background: var(--color-surface-hover);
  }

  .nav-link i {
    margin-right: 0.45rem !important;
  }

}
</style>
