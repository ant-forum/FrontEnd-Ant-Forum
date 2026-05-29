<template>
  <div class="left-panel">
    <h1>Welcome back</h1>
    <p class="subtitle">
      Log in to your ANT-Forum account to access<br />
      the developer community and resources.
    </p>

    <form class="form-stack" @submit.prevent="handleSignIn" novalidate>
      <!-- Alert Banner -->
      <div v-if="formError" class="alert-banner">
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
        <span>{{ formError }}</span>
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
        <div v-if="errors.email && errors.email !== 'true'" class="error-msg">{{ errors.email }}</div>
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
          >
            <!-- eye-off -->
            <svg
              v-if="showPass"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-6-10-7s1.343-2.878 3.343-4.657M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88M9.88 9.88 4 4m5.88 5.88 4.24 4.24M15 12a3 3 0 0 0-3-3m3 3 4.243 4.243M15 12l4.243-4.243M3 3l18 18"
              />
            </svg>
            <!-- eye -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7S2 12 2 12z"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div v-if="errors.password && errors.password !== 'true'" class="error-msg">
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
      <button type="submit" class="btn-signin" :disabled="loading">
        <template v-if="loading">
          <div class="spinner"></div>
          <span>Signing in…</span>
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
        Authenticated sessions are protected by enterprise-grade token encryption and automatic session cycling.
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
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "../../composables/useToast.js";
import { useAuthStore } from "../../stores/AuthStore.js";
import { useRequiredValidator } from "../../composables/useRequiredValidator.js";

const showPass = ref(false);
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({ email: "", password: "", remember: false });
const formError = ref("");

const { errors, clearError: baseClearError, validateField } = useRequiredValidator();

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
  if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    return false;
  }
  errors.password = "";
  return true;
};

const validateForm = () => {
  const emailValid = validateEmail();
  const passwordValid = validatePassword();
  return emailValid && passwordValid;
};

async function handleSignIn() {
  if (!validateForm()) return;
  loading.value = true;
  formError.value = "";
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Welcome back! Login successful");
    router.push("/");
  } catch (error) {
    console.error("Login failed:", error);
    if (error && error.error) {
      if (Array.isArray(error.error)) {
        error.error.forEach((errStr) => {
          if (errStr.includes("email")) {
            errors.email = errStr.replace(/"/g, ""); // Clean up quotes
          }
          if (errStr.includes("password")) {
            errors.password = errStr.replace(/"/g, ""); // Clean up quotes
          }
        });
      } else if (typeof error.error === "object") {
        if (error.error.email) errors.email = error.error.email;
        if (error.error.password) errors.password = error.error.password;
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
  padding: 0;
  line-height: 1;
  display: flex;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-base),
    box-shadow var(--transition-base);
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
  .btn-signin:hover {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px var(--color-primary-light);
  }
}
.btn-signin:focus-visible {
  outline: none;
  box-shadow: var(--shadow-brand), var(--focus-ring);
}
.btn-signin:active {
  transform: translateY(0);
}
.btn-signin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
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
