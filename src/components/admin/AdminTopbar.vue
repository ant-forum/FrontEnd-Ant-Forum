<template>
  <header class="admin-topbar">
    <div class="topbar-left">
      <div class="breadcrumb-line">
        <router-link to="/admin">Admin</router-link>
        <template v-if="breadcrumbs && breadcrumbs.length">
          <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
            <i class="bi bi-chevron-right"></i>
            <router-link v-if="crumb.to" :to="crumb.to">{{
              crumb.label
            }}</router-link>
            <span v-else>{{ crumb.label }}</span>
          </template>
        </template>
        <template v-else>
          <i class="bi bi-chevron-right"></i>
          <span>{{ currentTitle }}</span>
        </template>
      </div>
    </div>

    <div class="topbar-right">
      <button
        class="topbar-icon"
        type="button"
        :title="isDark ? 'Light mode' : 'Dark mode'"
        @click="toggleDarkMode"
      >
        <i :class="['bi', isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill']"></i>
      </button>



      <div class="admin-profile-menu-wrapper">
        <button
          type="button"
          class="topbar-profile"
          aria-haspopup="menu"
          :aria-expanded="isProfileMenuOpen"
          title="Admin account menu"
          @click.stop="toggleProfileMenu"
        >
          <img
            v-if="adminAvatar"
            :src="adminAvatar"
            class="profile-avatar border border-1 border-primary-subtle"
            style="object-fit: cover; border-radius: 50%"
            width="38"
            height="38"
          />
          <span v-else class="profile-avatar">{{ adminInitials }}</span>
          <div class="topbar-profile-name">
            <strong>{{ adminName }}</strong>
          </div>
        </button>

        <div
          v-if="isProfileMenuOpen"
          class="admin-profile-dropdown shadow-lg fade-in-scale"
          role="menu"
        >
          <router-link
            to="/admin/profile"
            class="admin-profile-card"
            role="menuitem"
            @click="isProfileMenuOpen = false"
          >
            <img
              v-if="adminAvatar"
              :src="adminAvatar"
              width="54"
              height="54"
              alt="Admin avatar"
            />
            <span v-else class="profile-avatar profile-avatar-menu">{{
              adminInitials
            }}</span>
            <span class="admin-profile-card-copy">
              <strong>{{ adminName }}</strong>
              <small>{{ adminRole }} profile</small>
            </span>
            <i class="bi bi-chevron-right"></i>
          </router-link>

          <div class="admin-profile-divider"></div>

          <router-link
            v-for="item in profileMenuItems"
            :key="item.to"
            :to="item.to"
            class="admin-profile-menu-item"
            role="menuitem"
            @click="isProfileMenuOpen = false"
          >
            <span class="admin-profile-menu-icon">
              <i :class="item.icon"></i>
            </span>
            <span class="admin-profile-menu-copy">
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
            <i class="bi bi-chevron-right admin-profile-menu-chevron"></i>
          </router-link>

          <button
            type="button"
            class="admin-profile-menu-item logout text-start"
            role="menuitem"
            @click="handleLogout"
          >
            <span class="admin-profile-menu-icon">
              <i class="bi bi-box-arrow-right"></i>
            </span>
            <span class="admin-profile-menu-copy">
              <strong>Log out</strong>
              <small>Sign out of your ANT Forum account</small>
            </span>
          </button>

          <footer class="admin-profile-menu-footer">
            <router-link to="/help" @click="isProfileMenuOpen = false"
              >Privacy</router-link
            >
            <span>·</span>
            <router-link to="/help" @click="isProfileMenuOpen = false"
              >Terms</router-link
            >
            <span>·</span>
            <router-link to="/help" @click="isProfileMenuOpen = false"
              >Community guidelines</router-link
            >
          </footer>
        </div>
      </div>
    </div>
  </header>

  <!-- Logout Confirmation Modal -->
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

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useDarkMode } from "../../composables/useDarkMode";
import { useAuthStore } from "../../stores/AuthStore";
import { useRouter } from "vue-router";
import BaseModal from "../base/BaseModal.vue";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

defineProps({
  currentTitle: {
    type: String,
    default: "Overview",
  },
  breadcrumbs: {
    type: Array,
    default: null,
  },
});

const { isDark, toggleDarkMode } = useDarkMode();
const authStore = useAuthStore();
const router = useRouter();

const isProfileMenuOpen = ref(false);

const adminName = computed(
  () => authStore.user?.name || authStore.user?.username || "Alex Rivera",
);
const adminRole = computed(() => {
  const r = authStore.user?.role || "Super Admin";
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
});
const adminInitials = computed(() => {
  return (
    adminName.value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AR"
  );
});
const adminAvatar = computed(() =>
  resolveMediaUrl(
    authStore.user?.avatar ||
      authStore.user?.profile_pic ||
      authStore.user?.avatarUrl ||
      ""
  )
);
const profileMenuItems = [];

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
};

const handleLogout = () => {
  isProfileMenuOpen.value = false;
  showLogoutModal.value = true;
};

const closeLogoutModal = () => {
  showLogoutModal.value = false;
};

const confirmLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    isLoggingOut.value = false;
    showLogoutModal.value = false;
  }
};

const handleAvatarError = (e) => {
  e.target.src = '/profile.jpg';
};

// Handle clicks outside of dropdown to close it
const closeDropdown = (e) => {
  if (!e.target.closest(".admin-profile-menu-wrapper")) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
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
  flex-wrap: wrap;
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
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
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

.admin-profile-menu-wrapper {
  position: relative;
}

.topbar-profile {
  min-width: 0;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.32rem 1.15rem 0.32rem 0.38rem;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  text-align: left;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.topbar-profile:hover {
  background: var(--color-surface-hover);
  border-color: color-mix(
    in srgb,
    var(--color-primary) 28%,
    var(--color-border)
  );
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
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
.topbar-profile-name {
  display: block;
  white-space: nowrap;
}

.topbar-profile strong {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0;
}

.admin-profile-dropdown {
  position: absolute;
  top: 52px;
  right: 0;
  width: min(330px, calc(100vw - 32px));
  padding: 10px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: 120;
}

[data-theme="dark"] .admin-profile-dropdown {
  background: rgba(2, 16, 36, 1);
  border-color: rgba(125, 160, 202, 0.2);
}

.admin-profile-card,
.admin-profile-menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text);
  text-decoration: none;
  border-radius: 10px;
}

.admin-profile-card {
  padding: 8px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.admin-profile-card:hover,
.admin-profile-menu-item:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.admin-profile-card img,
.profile-avatar-menu {
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid var(--color-primary-light);
  border-radius: 50%;
}

.profile-avatar-menu {
  width: 54px;
  height: 54px;
}

.admin-profile-card-copy,
.admin-profile-menu-copy {
  min-width: 0;
  flex: 1;
  text-align: left;
}

.admin-profile-card-copy strong,
.admin-profile-card-copy small,
.admin-profile-menu-copy strong,
.admin-profile-menu-copy small {
  display: block;
}

.admin-profile-card-copy strong,
.admin-profile-menu-copy strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-profile-card-copy small,
.admin-profile-menu-copy small {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.68rem;
}

.admin-profile-divider {
  height: 1px;
  margin: 9px 4px;
  background: var(--color-border);
}

.admin-profile-menu-item {
  width: 100%;
  padding: 8px 6px;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.admin-profile-menu-item.logout:hover {
  background: var(--color-danger-light);
}

.admin-profile-menu-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  border-radius: 50%;
  font-size: 0.9rem;
}

.admin-profile-menu-item.logout .admin-profile-menu-icon {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.admin-profile-menu-chevron,
.admin-profile-card > .bi {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.admin-profile-menu-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px 6px 2px;
  color: var(--color-text-muted);
  font-size: 0.66rem;
}

.admin-profile-menu-footer a {
  color: inherit;
  text-decoration: none;
}

.admin-profile-menu-footer a:hover {
  text-decoration: underline;
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
    padding-right: 0.8rem;
  }

  .topbar-profile-name {
    display: none;
  }

  .admin-profile-dropdown {
    right: 0;
  }
}

/* Premium Notification Dropdown Styling */
.notification-dropdown-wrapper {
  position: relative;
}

.dropdown-menu-premium {
  position: absolute;
  top: 52px;
  right: 0;
  width: 340px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  z-index: 100;
  overflow: hidden;
}

[data-theme="dark"] .dropdown-menu-premium {
  background: rgba(2, 16, 36, 1);
  border-color: rgba(125, 160, 202, 0.2);
}

.dropdown-header-premium {
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-hover);
}

.dropdown-header-premium strong {
  font-size: 0.86rem;
  color: var(--color-text);
}

.dropdown-body-premium {
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
}

.notifications-scroll {
  display: flex;
  flex-direction: column;
}

.min-width-0 {
  min-width: 0;
}

.notification-item-premium {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  align-items: flex-start;
  position: relative;
  text-align: left;
}

.notification-item-premium:last-child {
  border-bottom: 0;
}

.notification-item-premium:hover {
  background-color: var(--color-surface-hover);
}

.notification-item-premium.unread {
  background-color: rgba(84, 131, 179, 0.03);
}

.avatar-sm {
  width: 32px;
  height: 32px;
  object-fit: cover;
  flex-shrink: 0;
}

.sender-name {
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--color-text);
  max-width: 170px;
}

.notification-time {
  font-size: 0.68rem;
  color: var(--color-text-muted);
}

.notification-text {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.unread-dot-indicator {
  width: 6px;
  height: 6px;
  background-color: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.dropdown-footer-premium {
  padding: 0.75rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-hover);
}

.dropdown-footer-premium a {
  font-size: 0.8rem;
  color: var(--color-primary);
}

.dropdown-footer-premium a:hover {
  color: var(--color-primary-hover);
}

/* Dropdown Animation */
.fade-in-scale {
  animation: slide-down-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top right;
}

@keyframes slide-down-scale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.logout-modal-copy {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0;
}
</style>
