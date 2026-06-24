<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "logout"]);
const dropdownRef = ref(null);

const avatar = computed(
  () => props.user?.profile_pic || "/charles_leclerc.png",
);
const displayName = computed(
  () => props.user?.username || props.user?.name || "ANT Developer",
);
const role = computed(() => {
  const value = props.user?.role || "Member";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
});

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
      <img :src="avatar" width="44" height="44" alt="User avatar" />
      <span class="account-identity">
        <strong>{{ displayName }}</strong>
        <small>{{ role }} profile</small>
      </span>
      <i class="bi bi-chevron-right account-card-chevron"></i>
    </router-link>

    <div class="account-menu-divider"></div>

    <router-link
      to="/settings/privacy"
      class="account-menu-item"
      @click="emit('close')"
    >
      <span class="account-menu-icon">
        <i class="bi bi-gear-fill"></i>
      </span>
      <span class="account-menu-copy">
        <strong>Settings & privacy</strong>
        <small>Manage privacy and account preferences</small>
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
  top: calc(100% + 12px);
  right: 0;
  width: min(330px, calc(100vw - 32px));
  padding: 10px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: 1050;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  color: var(--color-text);
  text-decoration: none;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all var(--transition-base);
}

.account-card:hover,
.account-menu-item:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.account-card:hover {
  border-color: var(--color-blue-light);
}

.account-card img {
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid var(--color-blue-light);
  border-radius: 50%;
}

.account-identity,
.account-menu-copy {
  min-width: 0;
  text-align: left;
}

.account-identity {
  flex: 1;
}

.account-identity strong,
.account-identity small,
.account-menu-copy strong,
.account-menu-copy small {
  display: block;
}

.account-identity strong,
.account-menu-copy strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-identity small,
.account-menu-copy small {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.68rem;
}

.account-card-chevron,
.account-menu-chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.account-menu-divider {
  height: 1px;
  margin: 9px 4px;
  background: var(--color-border);
}

.account-menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 6px;
  color: var(--color-text);
  text-decoration: none;
  background: transparent;
  border: 0;
  border-radius: 10px;
  transition: background var(--transition-base);
}

.account-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  color: var(--color-text);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  font-size: 0.9rem;
}

.account-menu-copy {
  flex: 1;
}

.account-menu-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 10px 6px 2px;
  color: var(--color-text-muted);
  font-size: 0.66rem;
}

.account-menu-footer a {
  color: inherit;
  text-decoration: none;
}

.account-menu-footer a:hover {
  text-decoration: underline;
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
