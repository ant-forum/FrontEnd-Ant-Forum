<template>
  <div class="login-badge">
    <div class="badge-content">
      <h1 class="welcome-title">Reset Password</h1>
      <p class="subtitle">
        Enter your email address and we'll send you a link to reset<br />
        your password. Your access remains uninterrupted and secure.
      </p>

      <form class="form-stack" @submit.prevent="handleReset" novalidate>
        <!-- Email -->
        <div class="form-group">
          <label class="field-label">Email address</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control-custom"
            :class="{
              error: errors.email,
              success: isEmailValid && !errors.email,
            }"
            placeholder="name@company.com"
            autocomplete="email"
            @focus="onEmailInput"
            @input="onEmailInput"
          />
          <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
          <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
        </div>

        <!-- Submit -->
        <div class="action-row">
          <button type="submit" class="btn-signin" :disabled="loading">
            <template v-if="loading">
              <div class="spinner"></div>
              <span>Sending link…</span>
            </template>
            <template v-else>
              <span>Reset Password</span>
              <i class="bi bi-arrow-right"></i>
            </template>
          </button>
        </div>
      </form>

      <!-- Back to Login -->
      <div class="bottom-links" style="margin-top: 1.5rem;">
        <p>Remember your password? <router-link to="/login">Back to Login</router-link></p>
      </div>
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
    successMsg.value =
      "OTP sent to your email successfully! Please check your inbox mail.";

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
    )
      .toString()
      .toLowerCase();

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
      successMsg.value =
        "OTP sent to your email successfully! Please check your inbox mail.";

      setTimeout(() => {
        router.push("/verify");
      }, 1800);
    } else {
      errors.email =
        error.message || error.error || "An error occurred. Please try again.";
      successMsg.value = "";
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
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

[data-theme="dark"] .welcome-title {
  color: #ffffff !important;
}

.subtitle {
  text-align: center;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
  margin-bottom: 2rem;
  line-height: 1.5;
}

[data-theme="dark"] .subtitle {
  color: rgba(255, 255, 255, 0.6);
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

.field-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.8);
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

.form-control-custom.success {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.error-msg {
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}

.success-msg {
  font-size: 0.78rem;
  color: #10b981;
  margin-top: 4px;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn-signin {
  padding: 0.75rem 1.5rem;
  width: 100%;
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
  transform: none;
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

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
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
  h1 {
    font-size: 1.6rem;
  }
}
</style>
