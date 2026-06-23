<template>
  <div class="left-panel">
    <h1>Welcome back</h1>
    <p class="subtitle">
      Log in to your ANT-Forum account to access<br />
      the developer community and resources.
    </p>

    <form class="form-stack" @submit.prevent="handleSignIn" novalidate>
      <!-- Alert Banner -->
      <div v-if="displayError" class="alert-banner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          class="alert-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{{ displayError }}</span>
      </div>

      <!-- Email -->
      <div>
        <input
          v-model="form.email"
          type="email"
          class="form-control-custom"
          :class="{ error: errors.email }"
          placeholder="Email"
          autocomplete="email"
          @focus="clearError('email')"
        />
        <div v-if="errors.email && errors.email !== 'true'" class="error-msg">
          {{ errors.email }}
        </div>
      </div>

      <!-- Password -->
      <div>
        <div class="input-wrap">
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            class="form-control-custom"
            :class="{ error: errors.password }"
            placeholder="Password"
            autocomplete="current-password"
            @focus="clearError('password')"
          />
          <button
            class="toggle-eye"
            type="button"
            @click="showPass = !showPass"
            :aria-label="showPass ? 'Hide password' : 'Show password'"
          >
            <i :class="['bi', showPass ? 'bi-eye-slash' : 'bi-eye']"></i>
          </button>
        </div>
        <div
          v-if="errors.password && errors.password !== 'true'"
          class="error-msg"
        >
          {{ errors.password }}
        </div>
      </div>

      <!-- Remember + Forgot -->
      <div class="d-flex align-items-center justify-content-between">
        <label class="custom-check">
          <input type="checkbox" v-model="form.remember" />
          <span>Remember me</span>
        </label>
        <router-link to="/forgot-password" class="forgot-link"
          >Forgot Password?</router-link
        >
      </div>

      <!-- Sign In -->
      <button
        type="submit"
        class="btn-signin"
        :disabled="loading || isLoginLocked"
        :title="
          isLoginLocked
            ? `Try again in ${remainingLoginLockoutText}`
            : undefined
        "
      >
        <template v-if="loading">
          <div class="spinner"></div>
          <span>Signing in…</span>
        </template>
        <template v-else-if="isLoginLocked">
          <span>Try again in {{ remainingLoginLockoutText }}</span>
        </template>
        <template v-else>
          <span>Sign In</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        </template>
      </button>
    </form>

    <!-- Security Portal Verification Status -->
    <div class="security-badge-card">
      <div class="badge-header">
        <i class="bi bi-shield-fill-check text-success"></i>
        <span>ANT Security Portal</span>
      </div>
      <p class="badge-text">
        Authenticated sessions are protected by enterprise-grade token
        encryption and automatic session cycling.
      </p>
      <div class="system-status-indicator">
        <span class="status-dot"></span>
        <span class="status-text">All Gateway Services Operational</span>
      </div>
    </div>

    <!-- Register -->
    <div class="register-link text-center mt-4">
      Don't have an account? <router-link to="">Contact ANT Admin</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "../../composables/useToast.js";
import { useAuthStore } from "../../stores/AuthStore.js";
import { useRequiredValidator } from "../../composables/useRequiredValidator.js";

const showPass = ref(false);
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const form = reactive({ email: "", password: "", remember: false });
const formError = ref("");
const loginLockoutExpiresAt = ref(0);
const lockoutEmail = ref("");
const lockoutRemainingMs = ref(0);
let lockoutTimerId = null;

const LOGIN_LOCKOUT_STORAGE_KEY = "ANTForumLoginLockout";
const DEFAULT_LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

const {
  errors,
  clearError: baseClearError,
  validateField,
} = useRequiredValidator();

const normalizedEmail = computed(() => form.email.trim().toLowerCase());

const isLoginLocked = computed(() => {
  if (lockoutRemainingMs.value <= 0) return false;
  return !lockoutEmail.value || lockoutEmail.value === normalizedEmail.value;
});

const remainingLoginLockoutText = computed(() => {
  const totalSeconds = Math.max(Math.ceil(lockoutRemainingMs.value / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
});

const displayError = computed(() => {
  if (isLoginLocked.value) {
    return `Too many login attempts. Please try again in ${remainingLoginLockoutText.value}.`;
  }
  return formError.value;
});

const saveLockout = () => {
  try {
    localStorage.setItem(
      LOGIN_LOCKOUT_STORAGE_KEY,
      JSON.stringify({
        email: lockoutEmail.value,
        expiresAt: loginLockoutExpiresAt.value,
      }),
    );
  } catch (error) {
    console.error("Unable to save login lockout state:", error);
  }
};

const clearLockout = () => {
  loginLockoutExpiresAt.value = 0;
  lockoutEmail.value = "";
  lockoutRemainingMs.value = 0;

  if (lockoutTimerId !== null) {
    window.clearInterval(lockoutTimerId);
    lockoutTimerId = null;
  }

  try {
    localStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear login lockout state:", error);
  }
};

const updateLockoutCountdown = () => {
  if (!loginLockoutExpiresAt.value) {
    lockoutRemainingMs.value = 0;
    return;
  }

  const remaining = loginLockoutExpiresAt.value - Date.now();
  if (remaining <= 0) {
    clearLockout();
    return;
  }

  lockoutRemainingMs.value = remaining;
};

const startLockoutTimer = () => {
  updateLockoutCountdown();
  if (!loginLockoutExpiresAt.value || lockoutTimerId !== null) return;
  lockoutTimerId = window.setInterval(updateLockoutCountdown, 1000);
};

const loadStoredLockout = () => {
  try {
    const savedLockout = JSON.parse(
      localStorage.getItem(LOGIN_LOCKOUT_STORAGE_KEY) || "null",
    );

    if (!savedLockout?.expiresAt || savedLockout.expiresAt <= Date.now()) {
      clearLockout();
      return;
    }

    loginLockoutExpiresAt.value = savedLockout.expiresAt;
    lockoutEmail.value = savedLockout.email || "";
    startLockoutTimer();
  } catch (error) {
    console.error("Unable to read login lockout state:", error);
    clearLockout();
  }
};

const getErrorMessage = (error) =>
  (
    error?.message ||
    error?.msg ||
    (typeof error === "string" ? error : "") ||
    ""
  ).toString();

const isPasswordLengthMessage = (message) => {
  const normalizedMessage = String(message || "").toLowerCase();
  return (
    normalizedMessage.includes("password") &&
    normalizedMessage.includes("length") &&
    normalizedMessage.includes("at least")
  );
};

const getLockoutDurationMs = (error) => {
  const retryAfterSeconds = Number(error?.retryAfter || error?.retry_after);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  const minuteMatch = getErrorMessage(error).match(/after\s+(\d+)\s+minutes?/i);
  if (minuteMatch) {
    return Number(minuteMatch[1]) * 60 * 1000;
  }

  return DEFAULT_LOGIN_LOCKOUT_MS;
};

const isLockoutError = (error) => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    message.includes("too many login attempts") ||
    message.includes("too many requests")
  );
};

const startLoginLockout = (error) => {
  lockoutEmail.value = normalizedEmail.value;
  loginLockoutExpiresAt.value = Date.now() + getLockoutDurationMs(error);
  formError.value = "";
  errors.email = "true";
  errors.password = "true";
  saveLockout();
  startLockoutTimer();
};

loadStoredLockout();

onBeforeUnmount(() => {
  if (lockoutTimerId !== null) {
    window.clearInterval(lockoutTimerId);
  }
});

const clearError = (field) => {
  baseClearError(field);
  formError.value = "";
};

const validateEmail = () => {
  return validateField("email", form.email, "Email is required.");
};

const validatePassword = () => {
  if (!form.password) {
    return validateField("password", form.password, "Password is required.");
  }
  errors.password = "";
  return true;
};

const validateForm = () => {
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  return emailValid && passwordValid;
};

const getPostLoginRoute = () => {
  const redirectPath =
    typeof route.query.redirect === "string" ? route.query.redirect : "";
  if (
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//") &&
    redirectPath !== "/login"
  ) {
    return redirectPath;
  }

  const userRole = String(authStore.user?.role || "").toLowerCase();
  return userRole === "admin"
    ? { name: "AdminDashboard" }
    : { name: "HomePage" };
};

async function handleSignIn() {
  if (isLoginLocked.value) return;
  if (!validateForm()) return;
  loading.value = true;
  formError.value = "";
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Welcome back! Login successful");
    router.push(getPostLoginRoute());
  } catch (error) {
    console.error("Login failed:", error);
    if (isLockoutError(error)) {
      startLoginLockout(error);
    } else if (error && error.error) {
      if (Array.isArray(error.error)) {
        let hasPasswordLengthValidation = false;
        error.error.forEach((errStr) => {
          if (isPasswordLengthMessage(errStr)) {
            hasPasswordLengthValidation = true;
            return;
          }
          if (errStr.includes("email")) {
            errors.email = errStr.replace(/"/g, ""); // Clean up quotes
          }
          if (errStr.includes("password")) {
            errors.password = errStr.replace(/"/g, ""); // Clean up quotes
          }
        });
        if (hasPasswordLengthValidation) {
          formError.value = "Invalid email or password.";
          errors.email = "true";
          errors.password = "true";
        }
      } else if (typeof error.error === "object") {
        if (error.error.email) errors.email = error.error.email;
        if (error.error.password) {
          if (isPasswordLengthMessage(error.error.password)) {
            formError.value = "Invalid email or password.";
            errors.email = "true";
            errors.password = "true";
          } else {
            errors.password = error.error.password;
          }
        }
      }
    } else if (
      error &&
      (error.message === "Email not found" ||
        error.message === "Invalid password" ||
        error.result === false)
    ) {
      // Security hardening: use a generic error banner at the top, and turn both field borders red
      formError.value = "Invalid email or password.";
      errors.email = "true";
      errors.password = "true";
    } else if (error && typeof error === "string") {
      toast.error(error);
    } else if (error && error.message) {
      toast.error(error.message);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.left-panel {
  padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--radius-xl) 0 0 var(--radius-xl);
  background: var(--color-surface) !important;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text) !important;
  letter-spacing: 0;
  margin-bottom: 0.5rem;
  line-height: var(--line-height-heading);
}

.subtitle {
  color: var(--color-text-muted) !important;
  font-size: 0.93rem;
  line-height: 1.55;
  margin-bottom: 2rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-control-custom {
  width: 100%;
  padding: 0.75rem var(--spacing-md);
  border: 1.5px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  font-family: "Sora", sans-serif;
  font-size: 0.9rem;
  color: var(--color-text) !important;
  background: var(--color-input-bg) !important;
  outline: none;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
}
.form-control-custom::placeholder {
  color: var(--color-text-muted) !important;
  opacity: 0.6;
}
.form-control-custom:-webkit-autofill,
.form-control-custom:-webkit-autofill:hover,
.form-control-custom:-webkit-autofill:focus,
.form-control-custom:-webkit-autofill:active {
  border-color: var(--color-border) !important;
  -webkit-text-fill-color: var(--color-text) !important;
  caret-color: var(--color-text);
  box-shadow: 0 0 0 1000px var(--color-input-bg) inset !important;
  transition: background-color 9999s ease-out;
}
.form-control-custom:-webkit-autofill:focus {
  border-color: var(--color-primary) !important;
  box-shadow:
    0 0 0 1000px var(--color-input-bg) inset,
    var(--focus-ring) !important;
}
.form-control-custom:focus {
  border-color: var(--color-primary) !important;
  box-shadow: var(--focus-ring) !important;
}
.form-control-custom.error {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 3px var(--color-danger-light) !important;
}

.input-wrap {
  position: relative;
}
.input-wrap .form-control-custom {
  padding-right: 2.8rem;
}

.toggle-eye {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  width: 22px;
  height: 22px;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-base),
    box-shadow var(--transition-base);
}
.toggle-eye i {
  font-size: 1.1rem;
  line-height: 1;
}
.toggle-eye:hover,
.toggle-eye:focus-visible {
  color: var(--color-primary);
}
.toggle-eye:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.error-msg {
  font-size: 0.78rem;
  color: var(--color-danger);
  margin-top: 4px;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.8rem 1rem;
  background-color: var(--color-danger-light) !important;
  border: 1px solid var(--color-danger) !important;
  border-radius: var(--radius-md);
  color: var(--color-danger) !important;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  animation: slideDown 0.3s ease-out;
}

.alert-icon {
  flex-shrink: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}
.custom-check input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-hover);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  margin: 0;
}
/* Hover State */
.custom-check input[type="checkbox"]:hover {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
}
/* Checked State */
.custom-check input[type="checkbox"]:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.35);
}
/* Center Checkmark Symbol */
.custom-check input[type="checkbox"]:checked::after {
  content: "";
  width: 5px;
  height: 9px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-0.5px, -0.5px);
}
/* Keyboard Focus Accessibility */
.custom-check input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.custom-check span {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: color var(--transition-base);
}
.custom-check:hover span {
  color: var(--color-text);
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-base),
    box-shadow var(--transition-base);
}
.forgot-link:hover,
.forgot-link:focus-visible {
  color: var(--color-primary-hover);
}

.btn-signin {
  width: 100%;
  padding: 0.8rem;
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: none;
  border-radius: var(--radius-md);
  font-family: "Sora", sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    background var(--transition-base),
    transform var(--transition-fast),
    box-shadow var(--transition-base);
  box-shadow: 0 4px 14px var(--color-primary-light);
}

@media (hover: hover) {
  .btn-signin:not(:disabled):hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--color-primary-light);
  }
}
.btn-signin:focus-visible {
  outline: none;
  box-shadow: var(--shadow-brand), var(--focus-ring);
}
.btn-signin:not(:disabled):active {
  transform: translateY(0);
}
.btn-signin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.security-badge-card {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: all var(--transition-base);
}

.security-badge-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.badge-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--color-text);
}

.badge-header i {
  font-size: 1.1rem;
}

.badge-text {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  line-height: 1.45;
  margin: 0;
}

.system-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  border-top: 1px solid var(--color-border);
  padding-top: 8px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background-color: var(--color-success);
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.8s infinite;
}

.status-text {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-success);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.register-link {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
.register-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-base);
}
.register-link a:hover {
  color: var(--color-primary-hover);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid var(--color-primary-light);
  border-top-color: var(--color-text-on-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .left-panel {
    padding: var(--spacing-2xl) var(--spacing-lg);
    border-radius: var(--radius-lg);
  }
  h1 {
    font-size: 1.6rem;
  }
}
@media (max-width: 420px) {
  .left-panel {
    padding: var(--spacing-lg) var(--spacing-md);
  }
}
</style>
