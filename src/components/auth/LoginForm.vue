<template>
  <div class="left-panel">
    <h1>Welcome back</h1>
    <p class="subtitle">
      Log in to your ANT-Forum account to access<br />
      the developer community and resources.
    </p>

    <form class="form-stack" @submit.prevent="handleSignIn">
      <!-- Email -->
      <div>
        <input
          v-model="form.email"
          type="text"
          class="form-control-custom"
          :class="{ error: errors.email }"
          placeholder="Username or Email"
          autocomplete="username"
          @focus="clearError('email')"
        />
        <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
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
        <div v-if="errors.password" class="error-msg">
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

    <!-- Divider -->
    <div class="divider mt-4 mb-3">or continue with</div>

    <!-- Social Buttons -->
    <div class="d-flex justify-content-center gap-3">
      <!-- GitHub -->
      <button class="social-btn" title="GitHub">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      </button>
      <!-- Google -->
      <button class="social-btn" title="Google">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      </button>
      <!-- SSO -->
      <button class="social-btn" title="SSO">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <!-- Register -->
    <div class="register-link text-center mt-4">
      Have Any Problem Signing In? <a href="#">Contact Admin</a>
    </div>
  </div>
</template>d

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import api from "../../api/api";
import { useAuthStore } from "../../stores/auth";
import { useRequiredValidator } from "../../composables/useRequiredValidator";

const showPass = ref(false);
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();

const form = reactive({ email: "", password: "", remember: false });

const { errors, clearError, validateEmail, validatePassword } = useRequiredValidator();

function validate() {
  const isEmailValid = validateEmail(form.email);
  const isPasswordValid = validatePassword(form.password);
  return isEmailValid && isPasswordValid;
}

async function handleSignIn() {
  if (!validate()) return;
  loading.value = true;
  try {
    const response = await api.post("/api/auth/login", form);
    const { user, token } = response.data;
    authStore.login(user, token);
    router.push("/");
  } catch (error) {
    // The global interceptor in src/api/api.js handles showing the error toast.
    console.error("Login failed:", error);
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
  background: #fff;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: 0;
  margin-bottom: 0.5rem;
  line-height: var(--line-height-heading);
}

.subtitle {
  color: var(--text-muted);
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
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-md);
  font-family: "Sora", sans-serif;
  font-size: 0.9rem;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
}
.form-control-custom::placeholder {
  color: #9ca3af;
}
.form-control-custom:focus {
  border-color: var(--brand-light);
  box-shadow: var(--focus-ring);
}
.form-control-custom.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
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
  color: #9ca3af;
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
  color: var(--brand);
}
.toggle-eye:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.error-msg {
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}

.custom-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.custom-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--brand);
  cursor: pointer;
}
.custom-check span {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--brand-light);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-base),
    box-shadow var(--transition-base);
}
.forgot-link:hover,
.forgot-link:focus-visible {
  color: var(--brand-hover);
}

.btn-signin {
  width: 100%;
  padding: 0.8rem;
  background: var(--brand);
  color: #fff;
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
  box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
}

@media (hover: hover) {
  .btn-signin:hover {
    background: var(--brand-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-brand);
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

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #9ca3af;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.social-btn {
  width: 52px;
  height: 52px;
  border: 1.5px solid #e5e7eb;
  border-radius: var(--radius-md);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
}

@media (hover: hover) {
  .social-btn:hover {
    border-color: var(--brand-light);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    transform: translateY(-2px);
  }
}
.social-btn:focus-visible {
  outline: none;
  border-color: var(--brand-light);
  box-shadow: var(--focus-ring);
}
.social-btn:active {
  transform: translateY(0);
}

.register-link {
  font-size: 0.875rem;
  color: var(--text-muted);
}
.register-link a {
  color: var(--brand-light);
  text-decoration: none;
  font-weight: 600;
}
.register-link a:hover {
  text-decoration: underline;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
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
