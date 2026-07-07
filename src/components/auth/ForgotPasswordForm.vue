<template>
  <div class="login-card-container">
    <!-- Left Column: Reset Password Form -->
    <div class="login-form-pane">
      <h1 class="welcome-title">Reset Password</h1>
      <p class="welcome-subtitle">
        Enter your email address and we'll send you a link to reset your password. Your access remains uninterrupted and secure.
      </p>

      <form class="form-stack" @submit.prevent="handleReset" novalidate>
        <!-- Email Field -->
        <div class="form-group">
          <div class="input-wrap">
            <input
              v-model="form.email"
              type="email"
              placeholder="Email address"
              class="form-control-custom"
              :class="{
                error: errors.email,
                success: isEmailValid && !errors.email,
              }"
              autocomplete="email"
              @focus="onEmailInput"
              @input="onEmailInput"
            />
          </div>
          <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
          <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
        </div>

        <!-- Submit Button -->
        <div class="action-row">
          <button type="submit" class="btn-signin" :disabled="loading">
            <template v-if="loading">
              <div class="spinner"></div>
              <span>Sending link…</span>
            </template>
            <template v-else>
              <span>Reset Password</span>
              <span class="arrow-icon">→</span>
            </template>
          </button>
        </div>
      </form>

      <!-- ANT Security Portal Box -->
      <div class="security-portal-box">
        <div class="portal-header">
          <i class="bi bi-shield-fill-check portal-icon"></i>
          <span class="portal-title">ANT Security Portal</span>
        </div>
        <p class="portal-desc">
          Authenticated sessions are protected by enterprise-grade token encryption and automatic session cycling.
        </p>
        <div class="portal-status">
          <span class="status-dot"></span>
          <span class="status-text">ALL GATEWAY SERVICES OPERATIONAL</span>
        </div>
      </div>

      <!-- Bottom Links -->
      <div class="bottom-links">
        <p>Remember your password? <router-link to="/login" class="contact-admin-link">Back to Login</router-link></p>
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

    const resetToken = res?.resetToken;

    // Save recovery email for resending OTP code securely
    sessionStorage.setItem("ANT_ResetEmail", form.email);

    errors.email = "";
    successMsg.value =
      "OTP sent to your email successfully! Please check your inbox mail.";

    // A recovery token is required by the OTP page. Older API versions did not
    // return one for unknown emails, which caused /verify to redirect to /login.
    if (resetToken) {
      sessionStorage.setItem("ANT_ResetToken", resetToken);
      setTimeout(() => {
        router.push("/verify");
      }, 1800);
    }
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
      // Keep the response generic and remain on this page when an older API
      // does not provide the recovery token required by the OTP page.
      sessionStorage.setItem("ANT_ResetEmail", form.email);
      errors.email = "";
      successMsg.value =
        "OTP sent to your email successfully! Please check your inbox mail.";
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
/* Main reset-password card */
.login-card-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  max-width: 550px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0 auto;
  min-height: 600px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] .login-card-container {
  background: rgba(10, 15, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.login-form-pane {
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
}

[data-theme="dark"] .login-form-pane {
  background: transparent;
}

.welcome-title {
  font-family: var(--font-family-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

[data-theme="dark"] .welcome-title {
  color: #ffffff;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 32px;
  line-height: 1.5;
}

[data-theme="dark"] .welcome-subtitle {
  color: #9ca3af;
}

/* Form layouts */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-wrap {
  position: relative;
}

.form-control-custom {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s ease;
}

[data-theme="dark"] .form-control-custom {
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
  background: rgba(0, 0, 0, 0.3);
}

.form-control-custom::placeholder {
  color: #94a3b8;
}

[data-theme="dark"] .form-control-custom::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-control-custom:focus {
  border-color: #5c60f5;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(92, 96, 245, 0.15);
}

[data-theme="dark"] .form-control-custom:focus {
  border-color: #5c60f5;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0 3px rgba(92, 96, 245, 0.25);
}

.form-control-custom.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.form-control-custom.success {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.error-msg {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 2px;
  padding-left: 4px;
}

.success-msg {
  font-size: 0.8rem;
  color: #10b981;
  margin-top: 2px;
  padding-left: 4px;
}

/* Submit button */
.action-row {
  margin-top: 8px;
}

.btn-signin {
  width: 100%;
  padding: 14px 20px;
  background: #5c60f5;
  color: #ffffff;
  border: none;
  border-radius: 99px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(92, 96, 245, 0.25);
}

.btn-signin:hover:not(:disabled) {
  background: #4f52d9;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(92, 96, 245, 0.35);
}

.btn-signin:active:not(:disabled) {
  transform: translateY(0);
}

.btn-signin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.arrow-icon {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.btn-signin:hover:not(:disabled) .arrow-icon {
  transform: translateX(4px);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Security Portal Box */
.security-portal-box {
  margin-top: 32px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

[data-theme="dark"] .security-portal-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.portal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.portal-icon {
  color: #10b981;
  font-size: 1.1rem;
}

.portal-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
}

[data-theme="dark"] .portal-title {
  color: #ffffff;
}

.portal-desc {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
  margin: 0;
}

[data-theme="dark"] .portal-desc {
  color: #9ca3af;
}

.portal-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

[data-theme="dark"] .portal-status {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-text {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #10b981;
}

/* Footer links */
.bottom-links {
  text-align: center;
  margin-top: 24px;
}

.bottom-links p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

[data-theme="dark"] .bottom-links p {
  color: #9ca3af;
}

.contact-admin-link {
  color: #5c60f5;
  font-weight: 600;
  text-decoration: none;
}

.contact-admin-link:hover {
  text-decoration: underline;
}

/* Responsive breakpoints */
@media (max-width: 900px) {
  .login-card-container {
    max-width: 480px;
  }

  .login-form-pane {
    padding: 40px 32px;
  }
}
</style>
