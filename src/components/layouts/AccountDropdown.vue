<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import defaultProfilePic from "@/assets/profile.jpg";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "logout"]);
const dropdownRef = ref(null);

const avatar = computed(
  () => props.user?.profile_pic || defaultProfilePic,
);
const displayName = computed(
  () => props.user?.fullname || props.user?.name || props.user?.username || "ANT Developer",
);
const role = computed(() => {
  const value = props.user?.role || "Member";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
});

const handleAvatarError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === "true") return;
  event.currentTarget.dataset.fallbackApplied = "true";
  event.currentTarget.src = defaultProfilePic;
};

const handleOutsideClick = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target) &&
    !event.target.closest(".btn-account-toggle")
  ) {
    emit("close");
  }
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <aside ref="dropdownRef" class="account-dropdown" aria-label="Account menu">
    <router-link to="/profile" class="account-card" @click="emit('close')">
      <img
        :src="avatar"
        width="46"
        height="46"
        alt="User avatar"
        class="avatar-img"
        @error="handleAvatarError"
      />
      <span class="account-identity">
        <strong>{{ displayName }}</strong>
        <small>{{ props.user?.email || 'developer@antforum.com' }}</small>
      </span>
      <span class="role-badge">{{ role }}</span>
    </router-link>

    <div class="account-menu-divider"></div>

    <router-link
      to="/settings/security"
      class="account-menu-item"
      @click="emit('close')"
    >
      <span class="account-menu-icon">
        <i class="bi bi-gear-fill"></i>
      </span>
      <span class="account-menu-copy">
        <strong>Settings</strong>
        <small>Manage security and account preferences</small>
      </span>
      <i class="bi bi-chevron-right account-menu-chevron"></i>
    </router-link>

    <router-link to="/help" class="account-menu-item" @click="emit('close')">
      <span class="account-menu-icon">
        <i class="bi bi-question-circle-fill"></i>
      </span>
      <span class="account-menu-copy">
        <strong>Help & support</strong>
        <small>Guides and community support</small>
      </span>
      <i class="bi bi-chevron-right account-menu-chevron"></i>
    </router-link>

    <router-link to="/help" class="account-menu-item" @click="emit('close')">
      <span class="account-menu-icon">
        <i class="bi bi-exclamation-square-fill"></i>
      </span>
      <span class="account-menu-copy">
        <strong>Report a problem</strong>
        <small>Tell us when something is not working</small>
      </span>
      <i class="bi bi-chevron-right account-menu-chevron"></i>
    </router-link>

    <button type="button" class="account-menu-item" @click="emit('logout')">
      <span class="account-menu-icon">
        <i class="bi bi-box-arrow-right"></i>
      </span>
      <span class="account-menu-copy">
        <strong>Log out</strong>
        <small>Sign out of your ANT Forum account</small>
      </span>
    </button>

    <footer class="account-menu-footer">
      <router-link to="/help" @click="emit('close')">Privacy</router-link>
      <span>·</span>
      <router-link to="/help" @click="emit('close')">Terms</router-link>
      <span>·</span>
      <router-link to="/help" @click="emit('close')"
        >Community guidelines</router-link
      >
    </footer>
  </aside>
</template>

<style scoped>
.account-dropdown {
  position: absolute;
  top: calc(100% + 16px);
  right: 0;
  width: min(340px, calc(100vw - 32px));
  padding: 16px;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.1);
  z-index: 1050;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px;
  color: var(--color-text);
  text-decoration: none;
  background: transparent;
  border: none;
  border-radius: 18px;
  transition: all var(--transition-base);
  margin-bottom: 12px;
}

.account-card:hover {
  background: var(--color-surface-hover);
}

.avatar-img {
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 50%;
}

.account-identity {
  flex: 1;
  min-width: 0;
}

.account-identity strong {
  display: block;
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-identity small {
  display: block;
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(40, 183, 215, 0.15);
  color: #28b7d7;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.account-menu-divider {
  height: 1px;
  margin: 12px 0;
  background: var(--color-border);
}

.account-menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  color: var(--color-text);
  text-decoration: none;
  background: transparent;
  border: 0;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.account-menu-item:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.account-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  transition: color 0.2s ease;
}

.account-menu-item:hover .account-menu-icon {
  color: var(--color-text);
}

.account-menu-copy {
  flex: 1;
  text-align: left;
}

.account-menu-copy strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
}

.account-menu-copy small {
  display: block;
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.account-menu-chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.account-menu-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 14px 4px;
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.account-menu-footer a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.account-menu-footer a:hover {
  color: var(--color-text);
}

@media (max-width: 480px) {
  .account-dropdown {
    position: fixed;
    top: 70px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>

<style>
[data-theme="dark"] .account-dropdown {
  background: rgba(2, 16, 36, 1) !important;
  border-color: rgba(125, 160, 202, 0.2) !important;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}
</style>
