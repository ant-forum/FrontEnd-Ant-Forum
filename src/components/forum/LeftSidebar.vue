<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Disable automatic attribute inheritance
defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  activeTab: {
    type: String,
    default: 'questions'
  }
});

const emit = defineEmits(['selectTab']);

const router = useRouter();
const route = useRoute();

const isDrawerMobileOpen = ref(false);

const handleItemClick = (tabId) => {
  isDrawerMobileOpen.value = false;
  
  if (tabId === 'discussions') {
    emit('selectTab', 'home');
    if (route.path !== '/forum') {
      router.push('/forum');
    } else if (Object.keys(route.query).length > 0) {
      router.push('/forum'); // Clear query parameters to restore full discussion list
    }
  } else if (tabId === 'profile') {
    router.push('/profile');
  } else if (tabId === 'settings') {
    router.push('/settings/privacy');
  } else if (tabId === 'projects') {
    router.push('/showcase');
  } else if (tabId === 'saves') {
    emit('selectTab', 'saves');
    if (route.path !== '/forum') {
      router.push({ path: '/forum', query: { tab: 'saves' } });
    }
  } else {
    emit('selectTab', tabId);
  }
};
</script>

<template>
  <!-- Mobile Toggle Button -->
  <button class="sidebar-mobile-toggle-btn d-lg-none" @click="isDrawerMobileOpen = !isDrawerMobileOpen">
    <i class="bi bi-grid-fill"></i>
  </button>

  <!-- Mobile Backdrop -->
  <transition name="fade">
    <div v-if="isDrawerMobileOpen" class="sidebar-mobile-backdrop" @click="isDrawerMobileOpen = false"></div>
  </transition>

  <aside class="left-sidebar-navigation" :class="{ 'mobile-open': isDrawerMobileOpen }" v-bind="$attrs">
    <!-- Dev Console Header -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Dev Console</h2>
      <span class="sidebar-subtitle">Manage your ecosystem</span>
    </div>

    <!-- Navigation List -->
    <div class="sidebar-menu">
      <button 
        class="sidebar-menu-item" 
        :class="{ active: (route.path === '/forum' && activeTab !== 'saves' && route.query.tab !== 'saves') || activeTab === 'home' || activeTab === 'questions' }" 
        @click="handleItemClick('discussions')"
      >
        <i class="bi bi-chat-left-text"></i>
        <span>Forum</span>
      </button>

      <button
        class="sidebar-menu-item"
        :class="{ active: route.path === '/profile' }"
        @click="handleItemClick('profile')"
      >
        <i class="bi bi-person-circle"></i>
        <span>Profile</span>
      </button>

      <button 
        class="sidebar-menu-item" 
        :class="{ active: route.path.startsWith('/showcase') }" 
        @click="handleItemClick('projects')"
      >
        <i class="bi bi-code-slash"></i>
        <span>My Projects</span>
      </button>

      <button 
        class="sidebar-menu-item" 
        :class="{ active: activeTab === 'saves' || route.query.tab === 'saves' }" 
        @click="handleItemClick('saves')"
      >
        <i :class="['bi', activeTab === 'saves' || route.query.tab === 'saves' ? 'bi-bookmark-fill' : 'bi-bookmark']"></i>
        <span>Saved</span>
      </button>

      <button
        class="sidebar-menu-item"
        :class="{ active: route.path.startsWith('/settings') }"
        @click="handleItemClick('settings')"
      >
        <i class="bi bi-gear"></i>
        <span>Settings</span>
      </button>
    </div>

    <!-- Submit Project Button -->
    <div class="sidebar-cta-wrap">
      <button class="btn-submit-project" @click="router.push('/showcase/create')">
        <i class="bi bi-plus"></i>
        Submit Project
      </button>
    </div>

    <!-- Bottom menu links -->
    <div class="sidebar-footer">
      <router-link to="/help" class="footer-link">
        <i class="bi bi-book"></i>
        <span>Docs</span>
      </router-link>
      <router-link to="/help" class="footer-link">
        <i class="bi bi-question-circle"></i>
        <span>Support</span>
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.left-sidebar-navigation {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: fit-content;
  user-select: none;
  min-height: 480px;
  position: sticky;
  top: 80px;
  align-self: start;
}

.sidebar-header {
  padding: 0 0 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 2px 0;
}

.sidebar-subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  display: block;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--color-text-muted);
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-menu-item i {
  font-size: 16px;
}

.sidebar-menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.sidebar-menu-item.active {
  background: var(--color-purple-light);
  color: var(--color-purple);
  font-weight: 600;
}

/* Submit Project Cta Button */
.sidebar-cta-wrap {
  padding: 20px 0 0 0;
  margin-top: 16px;
  border-top: 1px solid var(--color-border);
}

.btn-submit-project {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
}

.btn-submit-project:hover {
  background: #6d28d9;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
}

.sidebar-footer {
  margin-top: auto;
  padding: 20px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--color-border);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 13.5px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-text);
}

.footer-link i {
  font-size: 15px;
}

/* Off-canvas sidebar drawer for mobile devices */
.sidebar-mobile-toggle-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 18px var(--color-primary-light);
  z-index: 9997;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9996;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .left-sidebar-navigation {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    background: var(--color-surface);
    z-index: 9998;
    padding: 32px 24px;
    border-right: 1px solid var(--color-border);
    border-left: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-radius: 0px !important;
    box-shadow: 15px 0 35px var(--color-shadow) !important;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .left-sidebar-navigation.mobile-open {
    transform: translateX(0);
  }
}
</style>
