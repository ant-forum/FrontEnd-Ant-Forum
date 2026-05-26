<template>
  <div class="left-panel">
    <h1>Reset Password</h1>
    <p class="subtitle">
      Enter your email address and we'll send you a link to reset<br />
      your password. Your access remains uninterrupted and secure.
    </p>

    <form class="form-stack" @submit.prevent="handleReset">
      <!-- Email -->
      <div>
        <label class="input-label">EMAIL ADDRESS</label>
        <input
          v-model="form.email"
          type="email"
          class="form-control-custom"
          :class="{ error: errors.email }"
          placeholder="name@company.com"
          autocomplete="email"
          @focus="clearError('email')"
        />
        <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-signin mt-2" :disabled="loading">
        <template v-if="loading">
          <div class="spinner"></div>
          <span>Sending link…</span>
        </template>
        <template v-else>
          <span>Reset Password</span>
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

    <!-- Back to Login -->
    <div class="back-link text-center mt-4">
      Remember your password?
      <router-link to="/login">Back to Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({ email: "" });
const errors = reactive({ email: "" });

function clearError(field) {
  errors[field] = "";
}

function validate() {
  let ok = true;
  if (!form.email.trim()) {
    errors.email = "Email address is required.";
    ok = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Please enter a valid email address.";
    ok = false;
  }
  return ok;
}

async function handleReset() {
  if (!validate()) return;
  loading.value = true;
  try {
    await authStore.forgotPassword(form.email);
    router.push("/verify");
  } catch (error) {
    // The global interceptor in src/api/api.js shows the error toast.
    console.error("Password reset failed:", error);
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

.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted) !important;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
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

.error-msg {
  font-size: 0.78rem;
  color: var(--color-danger);
  margin-top: 4px;
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
  box-shadow: 0 4px 14px var(--color-primary-light), var(--focus-ring);
}
.btn-signin:active {
  transform: translateY(0);
}
.btn-signin:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.back-link {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.back-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: color var(--transition-base);
}
.back-link a:hover,
.back-link a:focus-visible {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid var(--color-primary-light);
  border-top-color: var(--color-text-on-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
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
