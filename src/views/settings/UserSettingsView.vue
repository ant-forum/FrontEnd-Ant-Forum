<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseModal from "../../components/base/BaseModal.vue";
import Footer from "../../components/layouts/footer.vue";
import Navbar from "../../components/layouts/header.vue";
import { useToast } from "../../composables/useToast";
import { useAuthStore } from "../../stores/AuthStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const role = computed(() =>
  String(authStore.user?.role || "student").toLowerCase(),
);
const roleLabel = computed(
  () => role.value.charAt(0).toUpperCase() + role.value.slice(1),
);
const isPasswordModalOpen = ref(false);
const isPasswordSubmitting = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordErrors = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  form: "",
});
const canSubmitPassword = computed(
  () =>
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length >= 8 &&
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword,
);

const resetPasswordForm = () => {
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  Object.keys(passwordErrors).forEach((key) => {
    passwordErrors[key] = "";
  });
  showCurrentPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
};

const openPasswordModal = () => {
  resetPasswordForm();
  isPasswordModalOpen.value = true;
};

const closePasswordModal = () => {
  if (isPasswordSubmitting.value) return;
  isPasswordModalOpen.value = false;
  resetPasswordForm();
};

const clearPasswordError = (field) => {
  passwordErrors[field] = "";
  passwordErrors.form = "";
};

const validatePasswordForm = () => {
  Object.keys(passwordErrors).forEach((key) => {
    passwordErrors[key] = "";
  });

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = "Current password is required.";
  }
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = "New password is required.";
  } else if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = "Use at least 8 characters.";
  } else if (passwordForm.newPassword === passwordForm.currentPassword) {
    passwordErrors.newPassword =
      "Your new password must be different from your current password.";
  }
  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = "Please confirm your new password.";
  } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
    passwordErrors.confirmPassword = "The new passwords do not match.";
  }

  return !Object.values(passwordErrors).some(Boolean);
};

const submitPasswordChange = async () => {
  if (!validatePasswordForm()) return;

  isPasswordSubmitting.value = true;
  try {
    const result = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );
    if (result?.result === false) {
      throw new Error(result.message || "Unable to change password.");
    }

    isPasswordModalOpen.value = false;
    resetPasswordForm();
    toast.success(result?.message || "Password changed successfully.");
  } catch (error) {
    passwordErrors.form =
      error?.message ||
      error?.error?.message ||
      "Unable to change password. Please try again.";
  } finally {
    isPasswordSubmitting.value = false;
  }
};

const browserName = computed(() => {
  const agent = navigator.userAgent;
  if (agent.includes("Edg/")) return "Microsoft Edge";
  if (agent.includes("Chrome/")) return "Google Chrome";
  if (agent.includes("Firefox/")) return "Mozilla Firefox";
  if (agent.includes("Safari/")) return "Safari";
  return "Current browser";
});

watch(
  () => route.params.section,
  (section) => {
    if (section !== "security") {
      router.replace("/settings/security");
    }
  },
  { immediate: true },
);
</script>

<template>
  <Navbar />

  <div class="settings-page">
    <div class="settings-page-container">
      <main class="settings-main">
        <header class="settings-header">
          <div>
            <span class="settings-kicker">Personal settings</span>
            <h1>Settings & Privacy</h1>
            <p>Manage your ANT Forum password and account security.</p>
          </div>
          <span class="role-badge"
            ><i class="bi bi-person-badge"></i> {{ roleLabel }}</span
          >
        </header>

        <div class="settings-content-grid">
          <section class="settings-panel-wrap">
            <section class="settings-panel">
              <div class="panel-heading">
                <div>
                  <h2>Password & Security</h2>
                  <p>
                    Review your password and the devices currently signed into
                    your account.
                  </p>
                </div>
                <span class="security-badge"
                  ><i class="bi bi-shield-check"></i> Protected update</span
                >
              </div>

              <div class="security-card">
                <span class="security-icon"><i class="bi bi-key"></i></span>
                <div>
                  <strong>Password</strong>
                  <small
                    >Confirm your current password, then choose a new
                    password.</small
                  >
                </div>
                <button
                  type="button"
                  class="inline-action"
                  @click="openPasswordModal"
                >
                  Change password
                </button>
              </div>

              <div class="section-heading">
                <div>
                  <h3>Active sessions</h3>
                  <p>
                    Session management needs backend support before remote
                    logout can be enabled.
                  </p>
                </div>
                <button class="btn-secondary-action" type="button" disabled>
                  Log out other sessions
                </button>
              </div>

              <div class="session-card">
                <span class="security-icon current"
                  ><i class="bi bi-laptop"></i
                ></span>
                <div>
                  <strong>{{ browserName }}</strong>
                  <small>Current session · This device</small>
                </div>
                <span class="current-badge">Active now</span>
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  </div>

  <BaseModal
    v-if="isPasswordModalOpen"
    title="Change your password"
    icon="bi bi-shield-lock"
    theme="primary"
    @closeModal="closePasswordModal"
  >
    <form
      id="change-password-form"
      class="password-change-form"
      @submit.prevent="submitPasswordChange"
    >
      <div class="password-guidance">
        <i class="bi bi-info-circle"></i>
        <span>
          Enter your current password to securely update your account.
        </span>
      </div>

      <div class="password-field">
        <label for="current-password">Current password</label>
        <span class="password-input-wrap">
          <input
            id="current-password"
            v-model="passwordForm.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your current password"
            :class="{ invalid: passwordErrors.currentPassword }"
            @input="clearPasswordError('currentPassword')"
          />
          <button
            type="button"
            :aria-label="
              showCurrentPassword
                ? 'Hide current password'
                : 'Show current password'
            "
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <i
              :class="['bi', showCurrentPassword ? 'bi-eye-slash' : 'bi-eye']"
            ></i>
          </button>
        </span>
        <small v-if="passwordErrors.currentPassword" class="password-error">
          {{ passwordErrors.currentPassword }}
        </small>
      </div>

      <div class="password-field">
        <label for="new-password">New password</label>
        <span class="password-input-wrap">
          <input
            id="new-password"
            v-model="passwordForm.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="At least 8 characters"
            :class="{ invalid: passwordErrors.newPassword }"
            @input="clearPasswordError('newPassword')"
          />
          <button
            type="button"
            :aria-label="
              showNewPassword ? 'Hide new password' : 'Show new password'
            "
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="['bi', showNewPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
          </button>
        </span>
        <small v-if="passwordErrors.newPassword" class="password-error">
          {{ passwordErrors.newPassword }}
        </small>
        <small v-else class="password-hint">Minimum 8 characters.</small>
      </div>

      <div class="password-field">
        <label for="confirm-password">Confirm new password</label>
        <span class="password-input-wrap">
          <input
            id="confirm-password"
            v-model="passwordForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Repeat your new password"
            :class="{ invalid: passwordErrors.confirmPassword }"
            @input="clearPasswordError('confirmPassword')"
          />
          <button
            type="button"
            :aria-label="
              showConfirmPassword
                ? 'Hide confirmed password'
                : 'Show confirmed password'
            "
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i
              :class="['bi', showConfirmPassword ? 'bi-eye-slash' : 'bi-eye']"
            ></i>
          </button>
        </span>
        <small v-if="passwordErrors.confirmPassword" class="password-error">
          {{ passwordErrors.confirmPassword }}
        </small>
      </div>

      <div v-if="passwordErrors.form" class="password-form-error" role="alert">
        <i class="bi bi-exclamation-circle"></i>
        {{ passwordErrors.form }}
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        class="btn-secondary-action"
        :disabled="isPasswordSubmitting"
        @click="closePasswordModal"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="change-password-form"
        class="btn-primary-action"
        :disabled="!canSubmitPassword || isPasswordSubmitting"
      >
        <span
          v-if="isPasswordSubmitting"
          class="spinner-border spinner-border-sm"
          aria-hidden="true"
        ></span>
        {{ isPasswordSubmitting ? "Updating..." : "Update password" }}
      </button>
    </template>
  </BaseModal>

  <Footer />
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
}
.settings-page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 36px 24px 72px;
}
.settings-main {
  min-width: 0;
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 30px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}
.settings-kicker {
  display: block;
  margin-bottom: 8px;
  color: var(--color-blue);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.settings-header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.95rem, 3vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}
.settings-header p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 1rem;
}
.role-badge,
.security-badge,
.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
}
.role-badge,
.security-badge {
  color: var(--color-blue);
  background: var(--color-blue-light);
}
.current-badge {
  color: var(--color-success);
  background: var(--color-success-light);
}
.settings-content-grid {
  max-width: 900px;
  margin: 24px auto 0;
}
.settings-panel-wrap {
  min-width: 0;
}
.settings-panel {
  padding: 26px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
}
.panel-heading,
.section-heading,
.security-card,
.session-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.panel-heading {
  align-items: flex-start;
  margin-bottom: 22px;
}
.settings-panel h2,
.settings-panel h3 {
  color: var(--color-text);
  font-weight: 800;
}
.settings-panel h2 {
  margin: 0 0 5px;
  font-size: 1.22rem;
}
.settings-panel h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}
.panel-heading p,
.section-heading p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.security-card strong,
.session-card strong {
  color: var(--color-text);
  font-size: 0.94rem;
}
.security-card small,
.session-card small {
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
.btn-primary-action,
.btn-secondary-action,
.inline-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 13px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  transition: all var(--transition-base);
}
.btn-primary-action {
  color: #ffffff;
  background: var(--color-blue);
  border: 1px solid var(--color-blue);
}
.btn-secondary-action {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}
.btn-primary-action:disabled,
.btn-secondary-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.security-card,
.session-card {
  padding: 16px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}
.security-card > div,
.session-card > div {
  min-width: 0;
  flex: 1;
}
.security-card strong,
.security-card small,
.session-card strong,
.session-card small {
  display: block;
}
.security-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  color: var(--color-blue);
  background: var(--color-blue-light);
  border-radius: 9px;
  font-size: 1.05rem;
}
.security-icon.current {
  color: var(--color-success);
  background: var(--color-success-light);
}
.inline-action {
  color: var(--color-blue);
  background: var(--color-blue-light);
  border: 1px solid var(--color-blue-light);
}
.inline-action:hover {
  color: #ffffff;
  background: var(--color-blue);
  border-color: var(--color-blue);
}
.password-change-form {
  display: grid;
  gap: 16px;
}
.password-guidance,
.password-form-error {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  border-radius: 9px;
  font-size: 0.82rem;
  line-height: 1.5;
}
.password-guidance {
  color: var(--color-blue);
  background: var(--color-blue-light);
}
.password-form-error {
  color: var(--color-danger);
  background: var(--color-danger-light);
  border: 1px solid color-mix(in srgb, var(--color-danger) 22%, transparent);
}
.password-field {
  display: grid;
  gap: 7px;
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
}
.password-input-wrap {
  position: relative;
  display: block;
}
.password-input-wrap input {
  width: 100%;
  min-height: 44px;
  padding: 10px 44px 10px 12px;
  color: var(--color-text);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 9px;
  outline: none;
  transition: all var(--transition-base);
}
.password-input-wrap input:focus {
  border-color: var(--color-blue);
  box-shadow: var(--focus-ring);
}
.password-input-wrap input.invalid {
  border-color: var(--color-danger);
}
.password-input-wrap button {
  position: absolute;
  top: 50%;
  right: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 7px;
  transform: translateY(-50%);
}
.password-input-wrap button:hover {
  color: var(--color-blue);
  background: var(--color-blue-light);
}
.password-error,
.password-hint {
  font-size: 0.74rem;
  font-weight: 600;
}
.password-error {
  color: var(--color-danger);
}
.password-hint {
  color: var(--color-text-muted);
}
.section-heading {
  align-items: flex-end;
  margin: 24px 0 12px;
}
@media (max-width: 520px) {
  .settings-page-container {
    padding: 20px 16px 40px;
  }
  .settings-header,
  .panel-heading,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .settings-panel {
    padding: 16px;
  }
  .security-card,
  .session-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
