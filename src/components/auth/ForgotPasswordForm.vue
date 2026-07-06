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

    <!-- Right Column: Branding Graphic Display -->
    <div class="login-branding-pane">
      <div class="graphics-wrapper">
        <!-- Floating Code Editor -->
        <div class="mock-editor">
          <div class="editor-header">
            <div class="mac-controls">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="editor-status-pill">
              <span class="status-dot green"></span>
              <span>Systems Online</span>
            </div>
          </div>
          <pre class="editor-code"><code><span class="keyword">function</span> <span class="function">authenticateUser</span>(<span class="param">credentials</span>) {
  <span class="keyword">try</span> {
    <span class="keyword">const</span> token = <span class="keyword">await</span> authService.<span class="method">login</span>({
      email: credentials.<span class="property">email</span>,
      password: credentials.<span class="property">password</span>
    });
    <span class="keyword">return</span> { success: <span class="literal">true</span> };
  } <span class="keyword">catch</span> (err) {
    <span class="comment">// handle error</span>
  }
}</code></pre>
        </div>

        <!-- Floating Performance Card -->
        <div class="performance-card">
          <div class="perf-header">
            <h3 class="perf-title">System Performance</h3>
            <i class="bi bi-rocket-takeoff perf-icon"></i>
          </div>
          <div class="perf-metrics">
            <div class="metric-item">
              <span class="metric-label">RESPONSE TIME</span>
              <span class="metric-value font-mono">42 <span class="metric-unit">ms</span></span>
            </div>
            <div class="metric-item">
              <span class="metric-label">UPTIME</span>
              <span class="metric-value font-mono text-green">99.9 <span class="metric-unit">%</span></span>
            </div>
          </div>
          <!-- Bar chart visual elements -->
          <div class="perf-chart">
            <div class="chart-bar" style="height: 15px"></div>
            <div class="chart-bar active" style="height: 38px"></div>
            <div class="chart-bar" style="height: 10px"></div>
            <div class="chart-bar" style="height: 14px"></div>
            <div class="chart-bar active" style="height: 28px"></div>
            <div class="chart-bar" style="height: 8px"></div>
            <div class="chart-bar" style="height: 12px"></div>
            <div class="chart-bar active" style="height: 48px"></div>
          </div>
        </div>
      </div>

      <!-- Text below graphic elements -->
      <div class="branding-footer">
        <h2 class="branding-title">Connect with developers worldwide</h2>
        <p class="branding-desc">
          Join discussions, share code snippets, and collaborate on open-source projects.
        </p>
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
/* Main dual-column container */
.login-card-container {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  width: 100%;
  max-width: 1000px;
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

/* Left Form Pane */
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

/* Right Branding Pane */
.login-branding-pane {
  background: #f0f4f9;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  position: relative;
  overflow: hidden;
}

[data-theme="dark"] .login-branding-pane {
  background: rgba(255, 255, 255, 0.02);
}

.login-branding-pane::before {
  content: "";
  position: absolute;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(92, 96, 245, 0.08) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  pointer-events: none;
}

.graphics-wrapper {
  position: relative;
  width: 100%;
  max-width: 380px;
  margin-top: 20px;
  margin-bottom: 40px;
  height: 250px;
}

/* Mock IDE Code Editor window */
.mock-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 88%;
  background: #14141e;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  z-index: 2;
  transition: transform 0.3s ease;
}

.mock-editor:hover {
  transform: translateY(-4px) scale(1.01);
}

.editor-header {
  height: 38px;
  padding: 0 16px;
  background: #1a1a26;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mac-controls {
  display: flex;
  gap: 6px;
}

.mac-controls .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.mac-controls .dot.red { background: #ff5f56; }
.mac-controls .dot.yellow { background: #ffbd2e; }
.mac-controls .dot.green { background: #27c93f; }

.editor-status-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .editor-status-pill {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.editor-status-pill .status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.editor-status-pill .status-dot.green {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.editor-code {
  padding: 16px 20px;
  margin: 0;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.72rem;
  line-height: 1.5;
  color: #a9b2c3;
  overflow: auto;
}

/* Syntax Highlighting */
.editor-code .keyword { color: #f43f5e; }
.editor-code .function { color: #3b82f6; }
.editor-code .param { color: #f59e0b; }
.editor-code .method { color: #60a5fa; }
.editor-code .property { color: #38bdf8; }
.editor-code .literal { color: #10b981; }
.editor-code .comment { color: #64748b; font-style: italic; }

/* System Performance card overlay */
.performance-card {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 65%;
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 15px 35px rgba(92, 96, 245, 0.12), 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(92, 96, 245, 0.05);
  z-index: 3;
  transition: transform 0.3s ease;
}

[data-theme="dark"] .performance-card {
  background: #1a1a26;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.performance-card:hover {
  transform: translateY(-4px) scale(1.02);
}

.perf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.perf-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

[data-theme="dark"] .perf-title {
  color: #ffffff;
}

.perf-icon {
  color: #5c60f5;
  font-size: 1rem;
}

.perf-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

[data-theme="dark"] .metric-value {
  color: #ffffff;
}

.metric-value.text-green {
  color: #10b981;
}

.metric-unit {
  font-size: 0.7rem;
  font-weight: 500;
  color: #94a3b8;
  margin-left: 1px;
}

/* Micro bar chart visual styling */
.perf-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 50px;
  padding-top: 4px;
  border-top: 1px solid #f1f5f9;
}

[data-theme="dark"] .perf-chart {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-bar {
  flex: 1;
  background: #f1f5f9;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease, background 0.3s ease;
}

[data-theme="dark"] .chart-bar {
  background: rgba(255, 255, 255, 0.06);
}

.chart-bar.active {
  background: rgba(92, 96, 245, 0.7);
}

.performance-card:hover .chart-bar.active {
  background: #5c60f5;
}

/* Branding footer */
.branding-footer {
  text-align: center;
  width: 100%;
}

.branding-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

[data-theme="dark"] .branding-title {
  color: #ffffff;
}

.branding-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

[data-theme="dark"] .branding-desc {
  color: #9ca3af;
}

/* Responsive breakpoints */
@media (max-width: 900px) {
  .login-card-container {
    grid-template-columns: 1fr;
    max-width: 480px;
  }

  .login-branding-pane {
    display: none; /* Hide branding graphics pane on mobile */
  }

  .login-form-pane {
    padding: 40px 32px;
  }
}
</style>
