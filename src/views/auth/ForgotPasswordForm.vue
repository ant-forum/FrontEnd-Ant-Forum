<template>
  <div class="left-panel">
    <h1>Reset Password</h1>
    <p class="subtitle">
      Enter your email address and we'll send you a link to reset<br />
      your password. Your access remains uninterrupted and secure.
    </p>

    <div class="form-stack">
      <!-- Email -->
      <div>
        <label class="input-label">EMAIL ADDRESS</label>
        <input
          v-model="form.email"
          type="email"
          class="form-control-custom"
          :class="{ error: errors.email }"
          placeholder="name@company.com"
          @focus="clearError('email')"
        />
        <div v-if="errors.email" class="error-msg">{{ errors.email }}</div>
      </div>

      <!-- Submit -->
      <button class="btn-signin mt-2" :disabled="loading" @click="handleReset">
        <template v-if="loading">
          <div class="spinner"></div>
          <span>Sending link…</span>
        </template>
        <template v-else>
          <span>Reset Password</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </template>
      </button>
    </div>

    <!-- Back to Login -->
    <div class="back-link text-center mt-4">
      Remember your password? <router-link to="/login">Back to Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = reactive({ email: '' })
const errors = reactive({ email: '' })

function clearError(field) { errors[field] = '' }

function validate() {
  let ok = true
  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
    ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    ok = false
  }
  return ok
}

async function handleReset() {
  if (!validate()) return
  loading.value = true
  // Mock API call
  await new Promise(r => setTimeout(r, 1500))
  loading.value = false
  // Redirect to verify step or show success
  router.push('/verify')
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

.input-label {
  display: block;
  font-size: .75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: .5rem;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.form-control-custom {
  width: 100%;
  padding: .75rem 1rem;
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: .9rem;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.form-control-custom::placeholder { color: #9ca3af; }
.form-control-custom:focus {
  border-color: var(--brand-light);
  box-shadow: 0 0 0 3px rgba(124,58,237,.15);
}
.form-control-custom.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,.12);
}

.error-msg { font-size: .78rem; color: #ef4444; margin-top: 4px; }

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
}
@media (max-width: 420px) {
  .left-panel { padding: 2rem 1.5rem; }
}
</style>
