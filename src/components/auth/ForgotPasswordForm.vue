<template>
  <div class="left-panel">
    <h1>Reset Password</h1>
    <p class="subtitle">
      Enter your email address and we'll send you a link to reset<br />
      your password. Your access remains uninterrupted and secure.
    </p>

    <form class="form-stack" @submit.prevent="handleReset" novalidate>
      <!-- Email -->
      <div>
        <label class="input-label">EMAIL ADDRESS</label>
        <input
          v-model="form.email"
          type="email"
          class="form-control-custom"
          :class="{ error: errors.email, success: isEmailValid && !errors.email }"
          placeholder="name@company.com"
          autocomplete="email"
          @focus="onEmailInput"
          @input="onEmailInput"
        />
        <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
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
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/AuthStore.js";
import { useRequiredValidator } from "../../composables/useRequiredValidator.js";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const successMsg = ref("");

const form = reactive({ email: "" });

const { errors, clearError, validateField } = useRequiredValidator();

const isEmailValid = computed(() => {
  if (!form.email.trim()) return false;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(form.email.trim());
});

const onEmailInput = () => {
  clearError("email");
  successMsg.value = "";
};

const validateEmail = () => {
  if (!form.email.trim()) {
    return validateField("email", form.email, "Email address is required.");
  }
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
    return false;
  }
  errors.email = "";
  return true;
};

const validateForm = () => {
  return validateEmail();
};

async function handleReset() {
  if (!validateForm()) return;
  loading.value = true;
  successMsg.value = "";
  try {
    const res = await authStore.forgotPassword(form.email);
    
    // Save the resetToken for the subsequent OTP verify step
    if (res && res.resetToken) {
      sessionStorage.setItem("ANT_ResetToken", res.resetToken);
    }
    
    // Save recovery email for resending OTP code securely
    sessionStorage.setItem("ANT_ResetEmail", form.email);
    
    errors.email = "";
    successMsg.value = "OTP sent to your email successfully! Please check your inbox mail.";
    
    setTimeout(() => {
      router.push("/verify");
    }, 1800);
  } catch (error) {
    console.error("Password reset failed:", error);
    const errMsg = (
      error.message || 
      error.error || 
      error.response?.data?.message || 
      error.response?.data?.error || 
      ""
    ).toString().toLowerCase();
    
    // Security hardening: mask "User not found" errors to prevent email enumeration
    const isUserNotFound = 
      errMsg.includes("user not found") || 
      errMsg.includes("not found") || 
      errMsg.includes("not registered") || 
      errMsg.includes("no user") || 
      error.status === 404 || 
      error.response?.status === 404;

    if (isUserNotFound) {
      // Save recovery email for resending OTP code securely
      sessionStorage.setItem("ANT_ResetEmail", form.email);
      errors.email = "";
      successMsg.value = "OTP sent to your email successfully! Please check your inbox mail.";
      
      setTimeout(() => {
        router.push("/verify");
      }, 1800);
    } else {
      errors.email = error.message || error.error || "An error occurred. Please try again.";
      successMsg.value = "";
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
.form-control-custom.success {
  border-color: var(--color-success, #10b981) !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.error-msg {
  font-size: 0.78rem;
  color: var(--color-danger);
  margin-top: 4px;
}
.success-msg {
  font-size: 0.78rem;
  color: var(--color-success, #10b981);
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
