<template>
  <div class="left-panel">
    <template v-if="!isOtpVerified">
      <h1>Check your email</h1>
      <p class="subtitle">
        We've sent a 6-digit verification code to your email<br />
        address. Please enter it below to verify your account.
      </p>

      <form class="form-stack" @submit.prevent="handleVerify">
        <div class="otp-container">
          <input
            v-for="(digit, index) in 6"
            :key="index"
            type="text"
            class="otp-input form-control-custom"
            :class="{ error: hasError || otpErrorMsg }"
            maxlength="1"
            autocomplete="one-time-code"
            v-model="otp[index]"
            @input="handleInput($event, index)"
            @keydown="handleKeyDown($event, index)"
            @paste="handlePaste"
            ref="otpInputs"
          />
        </div>
        <div v-if="hasError" class="error-msg text-center mt-1">
          Please enter all 6 digits.
        </div>
        <div v-if="otpErrorMsg" class="error-msg text-center mt-1">
          {{ otpErrorMsg }}
        </div>
        <div v-if="otpSuccessMsg" class="success-msg text-center mt-1">
          {{ otpSuccessMsg }}
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-signin mt-3" :disabled="loading">
          <template v-if="loading">
            <div class="spinner"></div>
            <span>Verifying…</span>
          </template>
          <template v-else>
            <span>Verify Account</span>
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

      <!-- Resend & Back to Login -->
      <div class="back-link text-center mt-4">
        Didn't receive the code?
        <a href="#" @click.prevent="resendCode">Resend code</a>
        or
        <router-link to="/login" @click="clearTokens"
          >go back to login page</router-link
        >
      </div>
    </template>

    <template v-else>
      <h1>Choose new password</h1>
      <p class="subtitle">
        Please enter your secure new password below to regain full access to
        your account.
      </p>

      <form class="form-stack" @submit.prevent="handleResetPassword" novalidate>
        <!-- New Password -->
        <div>
          <label class="input-label">NEW PASSWORD</label>
          <div class="password-input-wrapper">
            <input
              v-model="resetForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="form-control-custom password-input"
              :class="{
                error: resetErrors.newPassword,
                success: isNewPasswordValid && !resetErrors.newPassword,
              }"
              placeholder="Min 8 characters (A-Z, a-z, 0-9, @)"
              autocomplete="new-password"
              @focus="clearResetError('newPassword')"
              @input="clearResetError('newPassword')"
            />
            <button
              type="button"
              class="eye-toggle-btn"
              @click="showNewPassword = !showNewPassword"
              tabindex="-1"
            >
              <svg
                v-if="showNewPassword"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="eye-icon"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="eye-icon"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <!-- Password Strength Bar -->
          <div v-if="resetForm.newPassword" class="strength-bar-container mt-2">
            <div
              class="strength-bar"
              :style="{
                width: passwordStrength + '%',
                backgroundColor: strengthColor,
              }"
            ></div>
            <div class="strength-text" :style="{ color: strengthColor }">
              Password Strength: {{ strengthLabel }} ({{ passwordStrength }}%)
            </div>
          </div>
          <!-- Password Requirements Checklist -->
          <div v-if="resetForm.newPassword" class="requirements-checklist mt-2">
            <div
              class="requirement-item"
              :class="{ met: passwordRequirements.length }"
            >
              <span class="icon">
                <svg
                  v-if="passwordRequirements.length"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <span>At least 8 characters</span>
            </div>
            <div
              class="requirement-item"
              :class="{ met: passwordRequirements.uppercase }"
            >
              <span class="icon">
                <svg
                  v-if="passwordRequirements.uppercase"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div
              class="requirement-item"
              :class="{ met: passwordRequirements.lowercase }"
            >
              <span class="icon">
                <svg
                  v-if="passwordRequirements.lowercase"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div
              class="requirement-item"
              :class="{ met: passwordRequirements.number }"
            >
              <span class="icon">
                <svg
                  v-if="passwordRequirements.number"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <span>At least one number (0-9)</span>
            </div>
            <div
              class="requirement-item"
              :class="{ met: passwordRequirements.special }"
            >
              <span class="icon">
                <svg
                  v-if="passwordRequirements.special"
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </span>
              <span>At least one special character (@$!%*?&amp;_...)</span>
            </div>
          </div>
          <div v-if="resetErrors.newPassword" class="error-msg">
            {{ resetErrors.newPassword }}
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="input-label">CONFIRM PASSWORD</label>
          <div class="password-input-wrapper">
            <input
              v-model="resetForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-control-custom password-input"
              :class="{
                error: resetErrors.confirmPassword,
                success: isConfirmPasswordValid && !resetErrors.confirmPassword,
              }"
              placeholder="Repeat your password"
              autocomplete="new-password"
              @focus="clearResetError('confirmPassword')"
              @input="clearResetError('confirmPassword')"
            />
            <button
              type="button"
              class="eye-toggle-btn"
              @click="showConfirmPassword = !showConfirmPassword"
              tabindex="-1"
            >
              <svg
                v-if="showConfirmPassword"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="eye-icon"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                ></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="eye-icon"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <div v-if="resetErrors.confirmPassword" class="error-msg">
            {{ resetErrors.confirmPassword }}
          </div>
          <div v-if="resetSuccessMsg" class="success-msg">
            {{ resetSuccessMsg }}
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-signin mt-3" :disabled="loading">
          <template v-if="loading">
            <div class="spinner"></div>
            <span>Resetting…</span>
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
        <router-link to="/login" @click="clearTokens"
          >Back to Login</router-link
        >
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/AuthStore.js";
import { useRequiredValidator } from "../../composables/useRequiredValidator.js";
import api from "@/api/api";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const hasError = ref(false);

const otp = reactive(["", "", "", "", "", ""]);
const otpInputs = ref([]);
const otpErrorMsg = ref("");
const otpSuccessMsg = ref("");

// Password Reset Flow States
const isOtpVerified = ref(false);
const verifiedToken = ref("");
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const { errors: validatorErrors, validatePassword } = useRequiredValidator();

const resetForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

const resetErrors = reactive({
  newPassword: "",
  confirmPassword: "",
});

const resetSuccessMsg = ref("");

const passwordStrength = computed(() => {
  const value = resetForm.newPassword;
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 25;
  if (/[A-Z]/.test(value)) score += 20;
  if (/[a-z]/.test(value)) score += 20;
  if (/[0-9]/.test(value)) score += 20;
  if (/[@$!%*?&_\-#.+=(){}[\]^~]/.test(value)) score += 15;
  return score;
});

const strengthColor = computed(() => {
  const score = passwordStrength.value;
  if (score <= 40) return "#ef4444"; // Red
  if (score <= 75) return "#f59e0b"; // Orange/Yellow
  return "#10b981"; // Green
});

const strengthLabel = computed(() => {
  const score = passwordStrength.value;
  if (score <= 40) return "Weak";
  if (score <= 75) return "Medium";
  return "Strong";
});

const isNewPasswordValid = computed(() => {
  const value = resetForm.newPassword;
  if (!value || value.length < 8) return false;
  const STRONG_PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#.+=(){}[\]^~])[A-Za-z\d@$!%*?&_\-#.+=(){}[\]^~]{8,}$/;
  return STRONG_PASSWORD_REGEX.test(value);
});

const isConfirmPasswordValid = computed(() => {
  return (
    isNewPasswordValid.value &&
    resetForm.confirmPassword === resetForm.newPassword
  );
});

const passwordRequirements = computed(() => {
  const value = resetForm.newPassword || "";
  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[@$!%*?&_\-#.+=(){}[\]^~]/.test(value),
  };
});

function handleInput(event, index) {
  hasError.value = false;
  otpErrorMsg.value = "";
  const val = event.target.value;

  if (val && !/^[0-9]$/.test(val)) {
    otp[index] = "";
    return;
  }

  if (val && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1].focus();
    });
  }
}

function handleKeyDown(event, index) {
  if (event.key === "Backspace" && !otp[index] && index > 0) {
    otpInputs.value[index - 1].focus();
  }
}

function handlePaste(event) {
  event.preventDefault();
  const pastedData = event.clipboardData.getData("text").slice(0, 6);
  if (!/^[0-9]+$/.test(pastedData)) return;

  for (let i = 0; i < pastedData.length; i++) {
    otp[i] = pastedData[i];
  }

  const focusIndex = Math.min(pastedData.length, 5);
  otpInputs.value[focusIndex].focus();
}

async function handleVerify() {
  const code = otp.join("");
  if (code.length < 6) {
    hasError.value = true;
    return;
  }

  loading.value = true;
  otpErrorMsg.value = "";
  otpSuccessMsg.value = "";
  try {
    const res = await authStore.verifyAccount(code);

    if (res && res.verifiedToken) {
      verifiedToken.value = res.verifiedToken;
      sessionStorage.setItem("ANT_VerifiedToken", res.verifiedToken);
    }

    otpSuccessMsg.value = "OTP verified successfully!";

    setTimeout(() => {
      isOtpVerified.value = true;
      loading.value = false;
    }, 1500);
  } catch (error) {
    console.error("Verification failed:", error);
    // Security hardening: Mask all verification errors as a clean "OTP is incorrect" to prevent leakage of technical details
    otpErrorMsg.value = "OTP code is incorrect. Please try again.";
    loading.value = false;
  }
}

const clearResetError = (field) => {
  resetErrors[field] = "";
  resetSuccessMsg.value = "";
};

async function handleResetPassword() {
  let valid = true;

  if (!validatePassword(resetForm.newPassword)) {
    resetErrors.newPassword = validatorErrors.password;
    valid = false;
  } else {
    resetErrors.newPassword = "";
  }

  if (!resetForm.confirmPassword) {
    resetErrors.confirmPassword = "Confirm password is required.";
    valid = false;
  } else if (resetForm.confirmPassword !== resetForm.newPassword) {
    resetErrors.confirmPassword = "Passwords do not match.";
    valid = false;
  } else {
    resetErrors.confirmPassword = "";
  }

  if (!valid) return;

  loading.value = true;
  resetSuccessMsg.value = "";

  try {
    await authStore.resetPassword(
      resetForm.newPassword,
      resetForm.confirmPassword,
      verifiedToken.value,
    );

    resetSuccessMsg.value =
      "Password reset successfully! Redirecting to login...";

    sessionStorage.removeItem("ANT_ResetToken");
    sessionStorage.removeItem("ANT_VerifiedToken");

    setTimeout(() => {
      router.push("/login");
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

    // Security hardening: Mask technical token errors with clean, safe user messages
    if (
      errMsg.includes("token") ||
      errMsg.includes("expired") ||
      errMsg.includes("invalid") ||
      error.status === 400 ||
      error.response?.status === 400
    ) {
      resetErrors.newPassword =
        "Your password reset session has expired or is invalid. Please request a new recovery link.";
    } else {
      resetErrors.newPassword = "Failed to reset password. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}

async function resendCode() {
  const email = sessionStorage.getItem("ANT_ResetEmail");
  if (!email) {
    otpErrorMsg.value =
      "Unable to resend: recovery session email not found. Please request a new recovery link.";
    otpSuccessMsg.value = "";
    return;
  }

  loading.value = true;
  otpErrorMsg.value = "";
  otpSuccessMsg.value = "";

  try {
    const res = await authStore.forgotPassword(email);

    // Update the resetToken in case a new one was generated by the resend request
    if (res && res.resetToken) {
      sessionStorage.setItem("ANT_ResetToken", res.resetToken);
    }

    otpSuccessMsg.value = "Verification code resent successfully!";
  } catch (error) {
    console.error("Resend failed:", error);
    otpErrorMsg.value = "Failed to resend verification code. Please try again.";
    otpSuccessMsg.value = "";
  } finally {
    loading.value = false;
  }
}

const clearTokens = () => {
  sessionStorage.removeItem("ANT_ResetToken");
  sessionStorage.removeItem("ANT_VerifiedToken");
  sessionStorage.removeItem("ANT_ResetEmail");
};

onUnmounted(() => {
  clearTokens();
});
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

.otp-container {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: space-between;
}

.otp-input {
  width: 48px !important;
  height: 54px !important;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0 !important;
}

.form-control-custom {
  width: 100%;
  padding: 0.75rem var(--spacing-md);
  font-size: 0.9rem;
  border: 1.5px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  font-family: "Sora", sans-serif;
  color: var(--color-text) !important;
  background: var(--color-input-bg) !important;
  outline: none;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
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
  font-size: 0.85rem;
  color: var(--color-danger);
  margin-top: 4px;
}
.success-msg {
  font-size: 0.85rem;
  color: var(--color-success, #10b981);
  margin-top: 4px;
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
  box-shadow:
    0 4px 14px var(--color-primary-light),
    var(--focus-ring);
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
  .otp-container {
    gap: 0.3rem;
  }
  .otp-input {
    width: 42px;
    height: 50px;
    font-size: 1.2rem;
  }
}
@media (max-width: 420px) {
  .left-panel {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  .otp-input {
    width: 36px;
    height: 46px;
  }
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input {
  padding-right: 45px !important;
}

.eye-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #94a3b8);
  transition: color var(--transition-fast, 0.2s);
}

.eye-toggle-btn:hover {
  color: var(--color-primary, #6366f1);
}

.eye-icon {
  width: 20px;
  height: 20px;
}

/* Strength Bar */
.strength-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  transition:
    width var(--transition-base, 0.3s),
    background-color var(--transition-base, 0.3s);
}

.strength-text {
  font-size: 0.76rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
}

/* Requirements Checklist */
.requirements-checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.02);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.76rem;
  color: var(--color-danger, #ef4444);
  font-weight: 500;
  transition: color var(--transition-base, 0.3s);
}

.requirement-item.met {
  color: var(--color-success, #10b981);
}

.requirement-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger, #ef4444);
  transition: all var(--transition-base, 0.3s);
}

.requirement-item.met .icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success, #10b981);
}
</style>
