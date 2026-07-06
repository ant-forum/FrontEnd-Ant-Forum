<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDarkMode } from "../../composables/useDarkMode";
import { useAuthStore } from "../../stores/AuthStore";
import { useNotificationStore } from "../../stores/NotificationStore";
import NotificationDropdown from "../notification/NotificationDropdown.vue";
import AccountDropdown from "./AccountDropdown.vue";
import BaseModal from "../base/BaseModal.vue";
const defaultProfilePic = "/profile.jpg";

const route = useRoute();
const router = useRouter();
const { isDark, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const activeLink = ref(route.name || "Forum");
const isMobileMenuOpen = ref(false);
const isNotificationOpen = ref(false);
const isAccountMenuOpen = ref(false);
const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

const navLinks = [
  { name: "Forum", path: "/forum" },
  { name: "Showcase", path: "/showcase" },
  { name: "Blog", path: "/blog" },
];

const navTarget = (link) => {
  if (authStore.isAuthenticated) return link.path;
  return { name: "login", query: { redirect: link.path } };
};

const isNavActive = (link) =>
  authStore.isAuthenticated && route.path.startsWith(link.path);

const toggleNotificationMenu = () => {
  isAccountMenuOpen.value = false;
  isNotificationOpen.value = !isNotificationOpen.value;
};

const toggleAccountMenu = () => {
  isNotificationOpen.value = false;
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
};

const openLogoutModal = () => {
  isAccountMenuOpen.value = false;
  showLogoutModal.value = true;
};

const closeLogoutModal = () => {
  if (isLoggingOut.value) return;
  showLogoutModal.value = false;
};

const confirmLogout = async () => {
  isLoggingOut.value = true;

  try {
    await authStore.logout();
    showLogoutModal.value = false;
    await router.push("/login");
  } finally {
    isLoggingOut.value = false;
  }
};

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false;
    isNotificationOpen.value = false;
    isAccountMenuOpen.value = false;
  },
);

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchNotifications();
  }
});
</script>

<template>
  <header class="global-header sticky-top">
    <div
      class="container py-3 d-flex align-items-center justify-content-between"
    >
      <!-- Logo Section -->
      <div class="header-left d-flex align-items-center flex-1">
        <router-link
          to="/"
          class="brand-logo-link text-decoration-none d-flex align-items-center"
          aria-label="ANT Forum home"
        >
          <img src="/antforum.png" alt="ANT Forum" class="brand-logo-img" />
        </router-link>
      </div>

      <!-- Center Navigation -->
      <div class="header-center d-none d-md-block">
        <div
          class="nav-pills-modern d-flex gap-1 p-1 border rounded-pill shadow-sm"
        >
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="navTarget(link)"
            class="nav-link-modern"
            :class="{ active: isNavActive(link) }"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>

      <!-- Right Actions -->
      <div
        class="header-right d-flex align-items-center justify-content-end gap-3 flex-1"
      >
        <div class="d-flex gap-2 align-items-center">
          <button
            @click="toggleDarkMode"
            class="btn btn-icon-modern"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <i :class="isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'"></i>
          </button>

          <!-- Only show notification bell when logged in -->
          <div
            v-if="authStore.isAuthenticated"
            class="position-relative d-flex align-items-center justify-content-center"
          >
            <button
              @click="toggleNotificationMenu"
              class="btn btn-icon-modern btn-bell-toggle position-relative"
              title="Notifications"
            >
              <i class="bi bi-bell"></i>
              <!-- Unread notification count badge -->
              <span
                v-if="notificationStore.unreadCount > 0"
                class="badge-unread-count rounded-circle position-absolute d-flex align-items-center justify-content-center fw-bold"
              >
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
        <div v-if="authStore.isAuthenticated" class="position-relative">
          <button
            type="button"
            class="user-profile-pill btn-account-toggle d-flex align-items-center gap-2 ps-1 pe-2 py-1 border rounded-pill shadow-sm cursor-pointer"
            aria-haspopup="menu"
            :aria-expanded="isAccountMenuOpen"
            title="Account menu"
            @click="toggleAccountMenu"
          >
            <img
              
              :src="authStore.user?.profile_pic || defaultProfilePic"
              class="rounded-circle border border-2 border-primary-subtle object-fit-cover"
              width="32"
              height="32"
              alt="User"
            />
            <span class="small fw-bold d-none d-xl-block">{{
              authStore.user?.fullname
            }}</span>
            <!-- <i :class="['bi', isAccountMenuOpen ? 'bi-chevron-up' : 'bi-chevron-down', 'account-toggle-chevron']"></i> -->
          </button>

          <transition name="account-menu">
            <AccountDropdown
              v-if="isAccountMenuOpen"
              :user="authStore.user || {}"
              @close="isAccountMenuOpen = false"
              @logout="openLogoutModal"
            />
          </transition>
        </div>

        <!-- Guest / Unauthenticated Profile Pill -->
        <router-link
          v-else
          to="/login"
          class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 border rounded-pill shadow-sm cursor-pointer text-decoration-none guest-pill"
        >
          <div
            class="guest-avatar rounded-circle border border-2 d-flex align-items-center justify-content-center"
            style="width: 32px; height: 32px"
          >
            <i class="bi bi-person-fill"></i>
          </div>
          <span class="small fw-bold d-none d-xl-block">Log In</span>
        </router-link>

        <button
          class="btn btn-icon-modern d-md-none ms-2"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
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
            :to="navTarget(link)"
            class="mobile-nav-link"
            :class="{ active: isNavActive(link) }"
            @click="isMobileMenuOpen = false"
          >
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>

  <BaseModal
    v-if="showLogoutModal"
    title="Log out of ANT Forum?"
    kicker=""
    icon="bi bi-box-arrow-right"
    theme="danger"
    @closeModal="closeLogoutModal"
  >
    <p class="logout-modal-copy">
      Are you sure you want to log out? You will need to sign in again to access
      your account.
    </p>

    <template #footer>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="isLoggingOut"
        @click="closeLogoutModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-danger d-inline-flex align-items-center gap-2"
        :disabled="isLoggingOut"
        @click="confirmLogout"
      >
        <span
          v-if="isLoggingOut"
          class="spinner-border spinner-border-sm"
          aria-hidden="true"
        ></span>
        <span>{{ isLoggingOut ? "Logging out..." : "Logout" }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;
}

.logout-modal-copy {
  color: var(--color-text-muted);
  margin: 0;
}

.flex-1 {
  flex: 1;
}

.brand-logo-link {
  min-height: 44px;
}

.brand-logo-img {
  display: block;
  width: 100px;
  height: auto;
  max-height: 48px;
  object-fit: contain;
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

.account-toggle-chevron {
  color: var(--color-text-muted);
  font-size: 0.65rem;
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
  background: var(--color-primary, #052659);
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

  .brand-logo-img {
    width: 85px;
    max-height: 38px;
  }
}

/* Mobile Menu Panel */
.mobile-menu-overlay {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  z-index: 999;
}

.mobile-nav-link {
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: block;
}

.mobile-nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.mobile-nav-link.active {
  background: #5483B3;
  color: white !important;
  box-shadow: 0 4px 12px rgba(84, 131, 179, 0.2);
}

/* Transition */
.slide-fade-menu-enter-active,
.slide-fade-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-menu-enter-from,
.slide-fade-menu-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.account-menu-enter-active,
.account-menu-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.account-menu-enter-from,
.account-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
