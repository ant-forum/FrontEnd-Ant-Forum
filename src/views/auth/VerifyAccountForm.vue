<template>
  <div class="left-panel">
    <h1>Check your email</h1>
    <p class="subtitle">
      We've sent a 6-digit verification code to your email<br />
      address. Please enter it below to verify your account.
    </p>

    <div class="form-stack">
      <div class="otp-container">
        <input
          v-for="(digit, index) in 6"
          :key="index"
          type="text"
          class="otp-input form-control-custom"
          :class="{ error: hasError }"
          maxlength="1"
          v-model="otp[index]"
          @input="handleInput($event, index)"
          @keydown="handleKeyDown($event, index)"
          @paste="handlePaste"
          ref="otpInputs"
        />
      </div>
      <div v-if="hasError" class="error-msg text-center mt-1">Please enter all 6 digits.</div>

      <!-- Submit -->
      <button class="btn-signin mt-3" :disabled="loading" @click="handleVerify">
        <template v-if="loading">
          <div class="spinner"></div>
          <span>Verifying…</span>
        </template>
        <template v-else>
          <span>Verify Account</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </template>
      </button>
    </div>

    <!-- Resend -->
    <div class="back-link text-center mt-4">
      Didn't receive the code? <a href="#" @click.prevent="resendCode">Resend code</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const hasError = ref(false)

const otp = reactive(['', '', '', '', '', ''])
const otpInputs = ref([])

function handleInput(event, index) {
  hasError.value = false
  const val = event.target.value
  
  if (val && !/^[0-9]$/.test(val)) {
    otp[index] = ''
    return
  }

  if (val && index < 5) {
    nextTick(() => {
      otpInputs.value[index + 1].focus()
    })
  }
}

function handleKeyDown(event, index) {
  if (event.key === 'Backspace' && !otp[index] && index > 0) {
    otpInputs.value[index - 1].focus()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').slice(0, 6)
  if (!/^[0-9]+$/.test(pastedData)) return
  
  for (let i = 0; i < pastedData.length; i++) {
    otp[i] = pastedData[i]
  }
  
  const focusIndex = Math.min(pastedData.length, 5)
  otpInputs.value[focusIndex].focus()
}

async function handleVerify() {
  const code = otp.join('')
  if (code.length < 6) {
    hasError.value = true
    return
  }
  
  loading.value = true
  // Mock API call
  await new Promise(r => setTimeout(r, 1500))
  loading.value = false
  alert('Account verified successfully! 🎉')
  router.push('/login')
}

function resendCode() {
  alert('Verification code resent!')
}
</script>

<style scoped>
.left-panel {
  padding: 3.5rem 3rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 24px 0 0 24px;
  background: #fff;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: -.5px;
  margin-bottom: .5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: .93rem;
  line-height: 1.55;
  margin-bottom: 2rem;
}

.form-stack { display: flex; flex-direction: column; gap: 1rem; }

.otp-container {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.otp-input {
  width: 48px;
  height: 54px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0;
}

.form-control-custom {
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.form-control-custom:focus {
  border-color: var(--brand-light);
  box-shadow: 0 0 0 3px rgba(124,58,237,.15);
}
.form-control-custom.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}

.error-msg { font-size: .85rem; color: #ef4444; }

.btn-signin {
  width: 100%;
  padding: .8rem;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 14px rgba(109,40,217,.35);
}
.btn-signin:hover {
  background: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(109,40,217,.45);
}
.btn-signin:active { transform: translateY(0); }
.btn-signin:disabled { opacity: .7; cursor: not-allowed; transform: none; }

.back-link { font-size: .875rem; color: var(--text-muted); }
.back-link a { color: var(--brand-light); text-decoration: none; font-weight: 600; }
.back-link a:hover { text-decoration: underline; }

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .left-panel {
    padding: 2.5rem 2rem;
    border-radius: 20px;
  }
  h1 { font-size: 1.6rem; }
  .otp-container { gap: 0.3rem; }
  .otp-input { width: 42px; height: 50px; font-size: 1.2rem; }
}
@media (max-width: 420px) {
  .left-panel { padding: 2rem 1.5rem; }
  .otp-input { width: 36px; height: 46px; }
}
</style>
