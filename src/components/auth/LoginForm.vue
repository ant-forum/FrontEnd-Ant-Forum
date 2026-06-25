<template>
  <div class="login-badge">
    <div class="badge-content">
      <h1 class="welcome-title">Welcome back</h1>
      
      <form class="form-stack" @submit.prevent="handleSignIn" novalidate>
        <!-- Alert Banner -->
        <div v-if="displayError" class="alert-banner">
          <i class="bi bi-exclamation-triangle-fill alert-icon"></i>
          <span>{{ displayError }}</span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label class="field-label">Email address</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control-custom"
            :class="{ error: errors.email }"
            autocomplete="email"
            @focus="clearError('email')"
          />
          <div v-if="errors.email && errors.email !== 'true'" class="error-msg">
            {{ errors.email }}
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="field-label">Password</label>
          <div class="input-wrap">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="form-control-custom"
              :class="{ error: errors.password }"
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
          <div v-if="errors.password && errors.password !== 'true'" class="error-msg">
            {{ errors.password }}
          </div>
        </div>

        <!-- Remember Me & Forgot Password Row -->
        <div class="remember-forgot-row">
          <label class="remember-me-label">
            <input type="checkbox" v-model="form.remember" class="remember-checkbox" />
            <span>Remember me</span>
          </label>
          <router-link to="/forgot-password" class="plans-link">Forgot Password?</router-link>
        </div>

        <!-- Action Row -->
        <div class="action-row">
          <button
            type="submit"
            class="btn-signin"
            :disabled="loading || isLoginLocked"
            :title="isLoginLocked ? `Try again in ${remainingLoginLockoutText}` : undefined"
          >
            <template v-if="loading">
              <div class="spinner"></div>
              <span>Signing in</span>
            </template>
            <template v-else-if="isLoginLocked">
              <span>Wait {{ remainingLoginLockoutText }}</span>
            </template>
            <template v-else>
              <span>Sign In</span>
              <i class="bi bi-arrow-right"></i>
            </template>
          </button>
        </div>
      </form>



      <div class="bottom-links">
        <p>Don't have an account? <router-link to="">Contact Admin</router-link></p>
      </div>
      
      <div class="terms-text">
        <p>By signing in, you agree to the <strong>Terms of Service</strong>.</p>
        <p>This app is to receive our emails.</p>
      </div>
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
.login-badge {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 28px;
  padding: 44px 32px 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  margin: 0 auto;
  transition: all 0.3s ease;
}

[data-theme="dark"] .login-badge {
  background: rgba(2, 16, 36, 0.9);
  border: 1px solid rgba(125, 160, 202, 0.25);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.login-badge::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 22px;
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.02);
  z-index: 10;
}

[data-theme="dark"] .login-badge::before {
  background: linear-gradient(180deg, #021024 0%, #052659 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.2);
}

.login-badge::after {
  content: "";
  position: absolute;
  top: -30%;
  right: -30%;
  width: 150%;
  height: 150%;
  background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15), transparent 50%);
  pointer-events: none;
  z-index: 0;
  transform: rotate(-15deg);
}

[data-theme="dark"] .login-badge::after {
  background: radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.35), transparent 50%);
}

.badge-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text, #0f172a) !important;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

[data-theme="dark"] .welcome-title {
  color: #ffffff !important;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.8);
  margin-bottom: 0;
}

[data-theme="dark"] .field-label {
  color: rgba(255, 255, 255, 0.8);
}

.form-control-custom {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--color-text, #0f172a) !important;
  background: #ffffff !important;
  outline: none;
  transition: all 0.2s ease;
}

[data-theme="dark"] .form-control-custom {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

.form-control-custom:-webkit-autofill,
.form-control-custom:-webkit-autofill:hover,
.form-control-custom:-webkit-autofill:focus,
.form-control-custom:-webkit-autofill:active {
  -webkit-text-fill-color: var(--color-text, #0f172a) !important;
  box-shadow: inset 0 0 0 1000px #ffffff !important;
  transition: background-color 5000s ease-in-out 0s;
}

[data-theme="dark"] .form-control-custom:-webkit-autofill,
[data-theme="dark"] .form-control-custom:-webkit-autofill:hover,
[data-theme="dark"] .form-control-custom:-webkit-autofill:focus,
[data-theme="dark"] .form-control-custom:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  box-shadow: inset 0 0 0 1000px #061121 !important;
}

.form-control-custom:focus {
  border-color: rgba(99, 102, 241, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
}

[data-theme="dark"] .form-control-custom:focus {
  border-color: rgba(99, 102, 241, 0.7) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
  background: rgba(0, 0, 0, 0.5) !important;
}

.form-control-custom.error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
}

.input-wrap {
  position: relative;
}

.input-wrap .form-control-custom {
  padding-right: 2.8rem;
}

.toggle-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(15, 23, 42, 0.4);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

[data-theme="dark"] .toggle-eye {
  color: rgba(255, 255, 255, 0.4);
}

.toggle-eye:hover {
  color: rgba(15, 23, 42, 0.8);
}

[data-theme="dark"] .toggle-eye:hover {
  color: rgba(255, 255, 255, 0.8);
}

.error-msg {
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}

.action-row {
  display: flex;
  flex-direction: column;
  margin-top: 0.5rem;
}

.btn-signin {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #6366f1, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-signin:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.4);
  background: linear-gradient(90deg, #4f46e5, #2563eb);
}

.btn-signin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.plans-link {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-primary, #6366f1);
  text-decoration: none;
  transition: color 0.2s;
}

[data-theme="dark"] .plans-link {
  color: rgba(255, 255, 255, 0.7);
}

.plans-link:hover {
  color: var(--color-primary-hover, #4f46e5);
  text-decoration: underline;
}

[data-theme="dark"] .plans-link:hover {
  color: #ffffff;
}

.remember-forgot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}

.remember-me-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.7);
  cursor: pointer;
  user-select: none;
}

[data-theme="dark"] .remember-me-label {
  color: rgba(255, 255, 255, 0.7);
}

.remember-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  border-radius: 6px;
  background: #ffffff !important;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] .remember-checkbox {
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.remember-checkbox:hover {
  border-color: rgba(99, 102, 241, 0.5) !important;
  background: rgba(99, 102, 241, 0.02) !important;
}

[data-theme="dark"] .remember-checkbox:hover {
  border-color: rgba(99, 102, 241, 0.6) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.remember-checkbox:checked {
  background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
  border-color: transparent !important;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.remember-checkbox:checked::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 9px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.remember-checkbox:focus-visible {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.bottom-links {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

[data-theme="dark"] .bottom-links {
  color: rgba(255, 255, 255, 0.5);
}

.bottom-links a {
  color: var(--color-primary, #6366f1);
  font-weight: 600;
  text-decoration: none;
}

[data-theme="dark"] .bottom-links a {
  color: #fff;
}

.bottom-links a:hover {
  text-decoration: underline;
}

.terms-text {
  text-align: center;
  font-size: 0.72rem;
  color: rgba(15, 23, 42, 0.4);
  line-height: 1.5;
}

[data-theme="dark"] .terms-text {
  color: rgba(255, 255, 255, 0.3);
}

.terms-text strong {
  color: rgba(15, 23, 42, 0.6);
}

[data-theme="dark"] .terms-text strong {
  color: rgba(255, 255, 255, 0.5);
}

/* Alert banner */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

[data-theme="dark"] .alert-banner {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
