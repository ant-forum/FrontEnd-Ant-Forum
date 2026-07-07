<template>
  <div
    class="login-card-container"
    :class="{ 'password-reset-mode': isOtpVerified }"
  >
    <div class="login-form-pane">
      <template v-if="!isOtpVerified">
        <h1 class="welcome-title">Check your email</h1>
        <p class="welcome-subtitle">
          We've sent a 6-digit verification code to your email address. Please
          enter it below to verify your account.
        </p>

        <form class="form-stack" @submit.prevent="handleVerify">
          <div class="form-group">
            <div class="otp-container">
          <input
            v-for="(digit, index) in 6"
            :key="index"
            type="text"
            class="otp-input form-control-custom"
            :class="{ error: hasError || otpDisplayError }"
            maxlength="1"
            autocomplete="one-time-code"
            :disabled="isOtpLocked"
            v-model="otp[index]"
            @input="handleInput($event, index)"
            @keydown="handleKeyDown($event, index)"
            @paste="handlePaste"
            ref="otpInputs"
          />
        </div>
        </div>
        <div v-if="hasError" class="error-msg text-center mt-1">
          Please enter all 6 digits.
        </div>
        <div v-if="otpDisplayError" class="error-msg text-center mt-1">
          {{ otpDisplayError }}
        </div>
        <div v-if="otpSuccessMsg" class="success-msg text-center mt-1">
          {{ otpSuccessMsg }}
        </div>

        <!-- Submit -->
        <div class="action-row">
          <button
            type="submit"
            class="btn-signin mt-3"
            :disabled="loading || isOtpLocked"
            :title="isOtpLocked ? `Try again in ${remainingOtpLockoutText}` : undefined"
          >
            <template v-if="loading">
              <div class="spinner"></div>
              <span>Verifying…</span>
            </template>
            <template v-else-if="isOtpLocked">
              <span>Wait {{ remainingOtpLockoutText }}</span>
            </template>
            <template v-else>
              <span>Verify Account</span>
              <i class="bi bi-arrow-right"></i>
            </template>
          </button>
        </div>
      </form>

      <!-- Resend & Back to Login -->
      <div class="bottom-links">
        <p>
          Didn't receive the code?
          <button
            type="button"
            class="link-button"
            :disabled="loading || isOtpLocked"
            @click="resendCode"
          >
            Resend code
          </button>
          or
          <router-link to="/login" @click="clearTokens">
            go back to login
          </router-link>
        </p>
      </div>
    </template>

    <template v-else>
      <h1 class="welcome-title">Choose new password</h1>
      <p class="welcome-subtitle">
        Please enter your secure new password below to regain full access to
        your account.
      </p>

      <form class="form-stack" @submit.prevent="handleResetPassword" novalidate>
        <input
          class="password-manager-username"
          type="text"
          name="username"
          autocomplete="username"
          :value="resetUsername"
          readonly
          tabindex="-1"
          aria-hidden="true"
        />

        <!-- New Password -->
        <div class="form-group">
          <label class="field-label">New Password</label>
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
        <div class="form-group">
          <label class="field-label">Confirm Password</label>
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
        <div class="action-row">
          <button type="submit" class="btn-signin mt-3" :disabled="loading">
            <template v-if="loading">
              <div class="spinner"></div>
              <span>Resetting…</span>
            </template>
            <template v-else>
              <span>Reset Password</span>
              <span class="arrow-icon">→</span>
            </template>
          </button>
        </div>
      </form>

      <!-- Back to Login -->
      <div class="bottom-links">
        <p>Remember your password? <router-link to="/login" @click="clearTokens">Back to Login</router-link></p>
      </div>
    </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onUnmounted, onMounted } from "vue";
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
const otpLockoutExpiresAt = ref(0);
const otpLockoutRemainingMs = ref(0);
let otpLockoutTimerId = null;

const OTP_LOCKOUT_STORAGE_KEY = "ANTForumOtpLockout";
const DEFAULT_OTP_LOCKOUT_MS = 15 * 60 * 1000;

const isOtpLocked = computed(() => otpLockoutRemainingMs.value > 0);

const remainingOtpLockoutText = computed(() => {
  const totalSeconds = Math.max(
    Math.ceil(otpLockoutRemainingMs.value / 1000),
    0,
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
});

const otpDisplayError = computed(() => {
  if (isOtpLocked.value) {
    return `Too many verification attempts. Please try again in ${remainingOtpLockoutText.value}.`;
  }
  return otpErrorMsg.value;
});

const saveOtpLockout = () => {
  try {
    localStorage.setItem(
      OTP_LOCKOUT_STORAGE_KEY,
      JSON.stringify({ expiresAt: otpLockoutExpiresAt.value }),
    );
  } catch (error) {
    console.error("Unable to save OTP lockout state:", error);
  }
};

const clearOtpLockout = () => {
  otpLockoutExpiresAt.value = 0;
  otpLockoutRemainingMs.value = 0;

  if (otpLockoutTimerId !== null) {
    window.clearInterval(otpLockoutTimerId);
    otpLockoutTimerId = null;
  }

  try {
    localStorage.removeItem(OTP_LOCKOUT_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear OTP lockout state:", error);
  }
};

const updateOtpLockoutCountdown = () => {
  const remaining = otpLockoutExpiresAt.value - Date.now();
  if (remaining <= 0) {
    clearOtpLockout();
    return;
  }

  otpLockoutRemainingMs.value = remaining;
};

const startOtpLockoutTimer = () => {
  updateOtpLockoutCountdown();
  if (!otpLockoutExpiresAt.value || otpLockoutTimerId !== null) return;
  otpLockoutTimerId = window.setInterval(updateOtpLockoutCountdown, 1000);
};

const loadStoredOtpLockout = () => {
  try {
    const savedLockout = JSON.parse(
      localStorage.getItem(OTP_LOCKOUT_STORAGE_KEY) || "null",
    );

    if (!savedLockout?.expiresAt || savedLockout.expiresAt <= Date.now()) {
      clearOtpLockout();
      return;
    }

    otpLockoutExpiresAt.value = savedLockout.expiresAt;
    startOtpLockoutTimer();
  } catch (error) {
    console.error("Unable to read OTP lockout state:", error);
    clearOtpLockout();
  }
};

const getOtpLockoutDurationMs = (error) => {
  const retryAfterSeconds = Number(error?.retryAfter || error?.retry_after);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  const message = String(error?.message || error?.msg || "");
  const minuteMatch = message.match(/after\s+(\d+)\s+minutes?/i);
  if (minuteMatch) {
    return Number(minuteMatch[1]) * 60 * 1000;
  }

  return DEFAULT_OTP_LOCKOUT_MS;
};

const isOtpLockoutError = (error) => {
  const message = String(error?.message || error?.msg || "").toLowerCase();
  return (
    error?.status === 429 ||
    error?.statusCode === 429 ||
    message.includes("too many verification attempts") ||
    message.includes("too many requests")
  );
};

const startOtpLockout = (error) => {
  otpLockoutExpiresAt.value = Date.now() + getOtpLockoutDurationMs(error);
  otpErrorMsg.value = "";
  saveOtpLockout();
  startOtpLockoutTimer();
};

// Password Reset Flow States
const isOtpVerified = ref(false);
const verifiedToken = ref("");
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

onMounted(() => {
  loadStoredOtpLockout();

  const isFirstLogin = sessionStorage.getItem("ANT_FirstLogin") === "true";
  const storedToken = sessionStorage.getItem("ANT_VerifiedToken") || authStore.token;
  if (isFirstLogin && storedToken) {
    verifiedToken.value = storedToken;
    isOtpVerified.value = true;
  } else {
    const storedResetToken = sessionStorage.getItem("ANT_ResetToken");
    if (!storedResetToken) {
      router.push("/login");
    }
  }
});

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

const resetUsername = computed(() => {
  return sessionStorage.getItem("ANT_ResetEmail") || authStore.user?.email || "";
});

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
  if (isOtpLocked.value) return;

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
    if (isOtpLockoutError(error)) {
      startOtpLockout(error);
    } else {
      // Mask verification details without hiding the rate-limit state.
      otpErrorMsg.value = "OTP code is incorrect. Please try again.";
    }
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
    const isFirstLoginFlow =
      sessionStorage.getItem("ANT_FirstLogin") === "true";

    await authStore.resetPassword(
      resetForm.newPassword,
      resetForm.confirmPassword,
      verifiedToken.value,
    );

    sessionStorage.removeItem("ANT_ResetToken");
    sessionStorage.removeItem("ANT_VerifiedToken");
    sessionStorage.removeItem("ANT_FirstLogin");

    if (isFirstLoginFlow && authStore.token) {
      // The successful backend response means the pending account is active.
      // Update local state so the route guard allows immediate site access.
      if (authStore.user) {
        authStore.setUser({ ...authStore.user, status: "active" });
      }
      resetSuccessMsg.value =
        "Password created successfully! Redirecting to your account...";

      const destination =
        authStore.user?.role === "admin"
          ? { name: "AdminDashboard" }
          : { name: "HomePage" };

      setTimeout(() => {
        router.push(destination);
      }, 1800);
    } else {
      // Forgot-password recovery starts without a login session.
      resetSuccessMsg.value =
        "Password reset successfully! Redirecting to login...";

      setTimeout(() => {
        router.push("/login");
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
  if (isOtpLocked.value) return;

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
  sessionStorage.removeItem("ANT_FirstLogin");
};

onUnmounted(() => {
  if (otpLockoutTimerId !== null) {
    window.clearInterval(otpLockoutTimerId);
  }
  clearTokens();
});
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

.otp-container {
  display: flex;
  gap: var(--spacing-sm, 8px);
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

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-manager-username {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  color: rgba(15, 23, 42, 0.4);
  transition: color var(--transition-fast, 0.2s);
}

[data-theme="dark"] .eye-toggle-btn {
  color: rgba(255, 255, 255, 0.4);
}

.eye-toggle-btn:hover {
  color: rgba(15, 23, 42, 0.8);
}

[data-theme="dark"] .eye-toggle-btn:hover {
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(0, 0, 0, 0.02);
  padding: 8px 12px;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .strength-bar-container {
  background: rgba(255, 255, 255, 0.03);
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
  background: rgba(0, 0, 0, 0.01);
  padding: 10px 14px;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .requirements-checklist {
  background: rgba(255, 255, 255, 0.02);
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

@media (max-width: 768px) {
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
  .otp-input {
    width: 36px;
    height: 46px;
  }
}

/* Match the login and forgot-password authentication card. */
.login-card-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  max-width: 550px;
  min-height: 600px;
  margin: 0 auto;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  box-shadow: var(--shadow-lg), 0 20px 40px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-card-container.password-reset-mode {
  grid-template-columns: minmax(0, 1fr);
  max-width: 550px;
}

.password-reset-mode .login-form-pane {
  padding-right: 52px;
  padding-left: 52px;
}

[data-theme="dark"] .login-card-container {
  background: rgba(10, 15, 30, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.login-form-pane {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px;
  background: #ffffff;
}

[data-theme="dark"] .login-form-pane {
  background: transparent;
}

.welcome-title {
  margin: 0 0 8px;
  color: #0f172a !important;
  font-family: var(--font-family-display);
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: left;
}

[data-theme="dark"] .welcome-title {
  color: #ffffff !important;
}

.welcome-subtitle {
  margin: 0 0 32px;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

[data-theme="dark"] .welcome-subtitle {
  color: #9ca3af;
}

.form-stack {
  gap: 16px;
}

.form-group {
  gap: 4px;
}

.field-label {
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
}

[data-theme="dark"] .field-label {
  color: #d1d5db;
}

.form-control-custom {
  padding: 14px 16px;
  color: #0f172a !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

.form-control-custom::placeholder {
  color: #94a3b8;
}

.form-control-custom:focus {
  background: #ffffff !important;
  border-color: #5c60f5 !important;
  box-shadow: 0 0 0 3px rgba(92, 96, 245, 0.15) !important;
}

[data-theme="dark"] .form-control-custom {
  color: #ffffff !important;
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

[data-theme="dark"] .form-control-custom:focus {
  background: rgba(0, 0, 0, 0.5) !important;
  border-color: #5c60f5 !important;
  box-shadow: 0 0 0 3px rgba(92, 96, 245, 0.25) !important;
}

.action-row {
  margin-top: 8px;
}

.btn-signin {
  padding: 14px 20px;
  background: #5c60f5;
  box-shadow: 0 4px 14px rgba(92, 96, 245, 0.25);
}

.btn-signin:hover:not(:disabled) {
  background: #4f52d9;
  box-shadow: 0 6px 20px rgba(92, 96, 245, 0.35);
}

.arrow-icon {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.btn-signin:hover:not(:disabled) .arrow-icon {
  transform: translateX(4px);
}

.bottom-links {
  margin: 24px 0 0;
  color: #64748b;
}

.bottom-links p {
  margin: 0;
}

.bottom-links a {
  color: #5c60f5;
}

.bottom-links .link-button {
  padding: 0;
  color: #5c60f5;
  background: none;
  border: 0;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.bottom-links .link-button:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .login-card-container {
    max-width: 480px;
  }

  .login-form-pane {
    padding: 40px 32px;
  }

  .password-reset-mode .login-form-pane {
    padding: 40px 32px;
  }
}

@media (max-width: 420px) {
  .login-form-pane {
    padding: 32px 20px;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .otp-container {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
  }

  .otp-input {
    width: 100% !important;
  }
}
</style>
