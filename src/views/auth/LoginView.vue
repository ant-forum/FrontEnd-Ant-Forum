<template>
  <div class="login-container d-flex align-items-center justify-content-center">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%; border-radius: 15px;">
      <div class="card-body">
        <div class="text-center mb-4">
          <h3 class="fw-bold text-primary">Welcome Back</h3>
          <p class="text-muted">Please sign in to your account</p>
        </div>

        <!-- Alert for Errors -->
        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <small>{{ errorMessage }}</small>
        </div>

        <form @submit.prevent="handleLogin">
          <!-- Email Input -->
          <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <input 
              type="email" 
              class="form-control form-control-lg" 
              id="email" 
              v-model="form.email" 
              placeholder="name@example.com"
              :disabled="loading"
              required
            >
          </div>

          <!-- Password Input -->
          <div class="mb-3">
            <div class="d-flex justify-content-between">
              <label for="password" class="form-label">Password</label>
              <a href="#" class="text-decoration-none small">Forgot password?</a>
            </div>
            <div class="input-group">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control form-control-lg border-end-0" 
                id="password" 
                v-model="form.password" 
                placeholder="••••••••"
                :disabled="loading"
                required
              >
              <span class="input-group-text bg-white border-start-0 cursor-pointer" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                <!-- Simple text fallback if Bootstrap Icons aren't loaded -->
                <small style="font-size: 0.7rem; cursor: pointer;">{{ showPassword ? 'HIDE' : 'SHOW' }}</small>
              </span>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="mb-4 form-check">
            <input type="checkbox" class="form-check-input" id="remember" v-model="form.remember" :disabled="loading">
            <label class="form-check-label mt-1" for="remember">Keep me logged in</label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm mt-2" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <!-- Social Login / Footer -->
        <div class="text-center mt-4">
          <p class="text-muted small">Don't have an account? <a href="#" class="fw-bold">Sign up</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    console.log('Logging in with:', form.email);
    
    // Mocking an API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate a failure for demonstration if password is too short
        if (form.password.length < 6) {
          reject(new Error('Password must be at least 6 characters long.'));
        } else {
          resolve();
        }
      }, 1500);
    });

    // On success: redirect to dashboard or home
    // router.push('/dashboard');
    
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred during login. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.card {
  border: none;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-control:focus {
  border-color: #764ba2;
  box-shadow: 0 0 0 0.25rem rgba(118, 75, 162, 0.25);
}

.btn-primary {
  background-color: #764ba2;
  border: none;
  transition: transform 0.2s ease;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #5a3a7d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}
</style>