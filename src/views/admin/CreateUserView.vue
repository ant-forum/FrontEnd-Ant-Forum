<template>
  <div class="create-user-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5 position-relative">
      <!-- Toast Notification -->
      <Transition name="toast">
        <div v-if="toast.show" :class="['toast-notification', `bg-${toast.type}`]">
          <i :class="['bi', toast.icon, 'me-2']"></i>
          {{ toast.message }}
        </div>
      </Transition>

      <!-- Header -->
      <header class="d-flex justify-content-between align-items-center mb-5">
        <div class="d-flex align-items-center gap-3">
          <router-link to="/admin/users" class="btn btn-white border shadow-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
            <i class="bi bi-arrow-left text-dark"></i>
          </router-link>
          <div>
            <h2 class="fw-bold mb-1">Add New User</h2>
            <p class="text-muted small mb-0">Step {{ currentStep }} of 3: {{ stepTitles[currentStep - 1] }}</p>
          </div>
        </div>
      </header>

      <div class="row">
        <div class="col-xl-9 mx-auto">
          <!-- Stepper -->
          <div class="stepper-container mb-5">
            <div class="d-flex justify-content-between position-relative">
              <div class="stepper-line" :style="{ width: ((currentStep - 1) / 2) * 100 + '%' }"></div>
              <div v-for="n in 3" :key="n" 
                class="step-item d-flex flex-column align-items-center position-relative z-1"
                :class="{ 'active': currentStep >= n, 'completed': currentStep > n }"
              >
                <div class="step-circle shadow-sm">
                  <i v-if="currentStep > n" class="bi bi-check-lg"></i>
                  <span v-else>{{ n }}</span>
                </div>
                <span class="step-label xx-small fw-bold text-uppercase mt-2">{{ stepTitles[n-1] }}</span>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="row g-0">
              <!-- Left Side: Form -->
              <div class="col-lg-8 p-4 p-md-5">
                <form @submit.prevent="handleSubmit">
                  <!-- Step 1: Account Information -->
                  <div v-if="currentStep === 1" class="animate__animated animate__fadeIn">
                    <div class="d-flex align-items-center gap-3 mb-4">
                      <div class="icon-box bg-purple-soft text-purple rounded-4 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-person-lines-fill fs-4"></i>
                      </div>
                      <div>
                        <h5 class="fw-bold mb-0">Account Information</h5>
                        <p class="text-muted xx-small mb-0">Basic identity and organizational details</p>
                      </div>
                    </div>
                    <div class="row g-4">
                      <div class="col-md-6">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Full Name</label>
                        <div class="input-group">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-person text-muted"></i></span>
                          <input 
                            v-model="form.name" 
                            type="text" 
                            :class="['form-control border-0 bg-light p-3 ps-2 rounded-3', errors.name ? 'is-invalid' : '']" 
                            placeholder="John Doe" 
                          >
                        </div>
                        <div v-if="errors.name" class="text-danger xx-small mt-1 ps-2">{{ errors.name }}</div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Email Address</label>
                        <div class="input-group position-relative">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-envelope text-muted"></i></span>
                          <input 
                            v-model="form.email" 
                            type="email" 
                            :class="['form-control border-0 bg-light p-3 ps-2 rounded-3', errors.email ? 'is-invalid' : '']" 
                            placeholder="john@example.com" 
                          >
                          <div v-if="isCheckingEmail" class="position-absolute end-0 top-50 translate-middle-y me-3">
                            <div class="spinner-border spinner-border-sm text-purple" role="status"></div>
                          </div>
                          <i v-else-if="emailAvailable === true" class="bi bi-check-circle-fill text-success position-absolute end-0 top-50 translate-middle-y me-3"></i>
                        </div>
                        <div v-if="errors.email" class="text-danger xx-small mt-1 ps-2">{{ errors.email }}</div>
                      </div>
                      <div class="col-md-12">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Department</label>
                        <div class="input-group">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-building text-muted"></i></span>
                          <select v-model="form.department" class="form-select border-0 bg-light p-3 ps-2 rounded-3 shadow-none">
                            <option value="Engineering">Engineering</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Management">Management</option>
                            <option value="Education">Education</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 2: Access & Permissions -->
                  <div v-if="currentStep === 2" class="animate__animated animate__fadeIn">
                    <div class="d-flex align-items-center gap-3 mb-4">
                      <div class="icon-box bg-purple-soft text-purple rounded-4 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-shield-lock fs-4"></i>
                      </div>
                      <div>
                        <h5 class="fw-bold mb-0">Access & Permissions</h5>
                        <p class="text-muted xx-small mb-0">Define the user's role and platform access</p>
                      </div>
                    </div>
                    <div class="row g-4">
                      <div class="col-md-6">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Access Level</label>
                        <div class="input-group">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-shield-check text-muted"></i></span>
                          <select v-model="form.role" class="form-select border-0 bg-light p-3 ps-2 rounded-3 shadow-none">
                            <option value="Student">Student</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Initial Status</label>
                        <div class="input-group">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-activity text-muted"></i></span>
                          <select v-model="form.status" class="form-select border-0 bg-light p-3 ps-2 rounded-3 shadow-none">
                            <option value="active">Active</option>
                            <option value="idle">Idle</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase">Professional Bio</label>
                        <textarea 
                          v-model="form.bio" 
                          class="form-control border-0 bg-light p-3 rounded-3" 
                          rows="4" 
                          placeholder="Briefly describe the user's expertise..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Step 3: Security & Finish -->
                  <div v-if="currentStep === 3" class="animate__animated animate__fadeIn">
                    <div class="d-flex align-items-center gap-3 mb-4">
                      <div class="icon-box bg-purple-soft text-purple rounded-4 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-key fs-4"></i>
                      </div>
                      <div>
                        <h5 class="fw-bold mb-0">Security Setup</h5>
                        <p class="text-muted xx-small mb-0">Configure account password and final review</p>
                      </div>
                    </div>
                    <div class="row g-4">
                      <div class="col-12">
                        <label class="form-label text-muted xx-small fw-bold text-uppercase d-flex justify-content-between">
                          Initial Password
                          <button type="button" @click="generatePassword" class="btn btn-link p-0 xx-small text-purple text-decoration-none fw-bold">Generate Random</button>
                        </label>
                        <div class="input-group">
                          <span class="input-group-text border-0 bg-light pe-0"><i class="bi bi-lock text-muted"></i></span>
                          <input 
                            v-model="form.password" 
                            :type="showPassword ? 'text' : 'password'" 
                            :class="['form-control border-0 bg-light p-3 ps-2 rounded-3', errors.password ? 'is-invalid' : '']" 
                            placeholder="••••••••" 
                          >
                          <button type="button" @click="showPassword = !showPassword" class="btn btn-light border-0 bg-light px-3">
                            <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye', 'text-muted']"></i>
                          </button>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                          <div class="form-text xx-small text-muted mb-0">
                            <i class="bi bi-info-circle me-1"></i>
                            Minimum 8 characters.
                          </div>
                          <div v-if="form.password" class="xx-small fw-bold" :class="passwordStrength.color">
                            {{ passwordStrength.label }}
                          </div>
                        </div>
                        <div v-if="errors.password" class="text-danger xx-small mt-1 ps-2">{{ errors.password }}</div>
                      </div>

                      <!-- Final Review Section -->
                      <div class="col-12 mt-4">
                        <div class="p-4 rounded-4 bg-light border border-dashed">
                          <h6 class="fw-bold xx-small text-uppercase tracking-wider mb-3">Onboarding Summary</h6>
                          <div class="row g-3">
                            <div class="col-sm-6">
                              <div class="xx-small text-muted">User</div>
                              <div class="small fw-bold">{{ form.name || 'Not set' }}</div>
                            </div>
                            <div class="col-sm-6">
                              <div class="xx-small text-muted">Email</div>
                              <div class="small fw-bold">{{ form.email || 'Not set' }}</div>
                            </div>
                            <div class="col-sm-6">
                              <div class="xx-small text-muted">Role</div>
                              <div class="small fw-bold"><span class="badge bg-purple-soft text-purple">{{ form.role }}</span></div>
                            </div>
                            <div class="col-sm-6">
                              <div class="xx-small text-muted">Department</div>
                              <div class="small fw-bold">{{ form.department }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer Actions -->
                  <div class="mt-5 pt-4 border-top d-flex justify-content-between align-items-center">
                    <button 
                      v-if="currentStep > 1" 
                      type="button" 
                      @click="prevStep" 
                      class="btn btn-link text-decoration-none text-muted fw-bold p-0 d-flex align-items-center gap-2"
                    >
                      <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <div v-else></div>

                    <div class="d-flex gap-3">
                      <router-link v-if="currentStep === 1" to="/admin/users" class="btn btn-light rounded-pill px-4 py-2 fw-bold">Cancel</router-link>
                      
                      <button 
                        v-if="currentStep < 3"
                        type="button" 
                        @click="nextStep"
                        class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand d-flex align-items-center gap-2"
                      >
                        Next Step <i class="bi bi-chevron-right"></i>
                      </button>

                      <button 
                        v-else
                        type="submit" 
                        class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand d-flex align-items-center gap-2"
                        :disabled="isSubmitting"
                      >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status"></span>
                        {{ isSubmitting ? 'Finalizing...' : 'Complete Onboarding' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Right Side: Preview & Info -->
              <div class="col-lg-4 bg-light p-4 p-md-5 border-start">
                <div class="text-center mb-5">
                  <div class="avatar-preview-container mb-4 mx-auto position-relative">
                    <img :src="avatarUrl" class="rounded-circle shadow-sm border border-4 border-white" width="120" height="120">
                    <div class="status-indicator position-absolute" :class="form.status === 'active' ? 'bg-success' : 'bg-warning'"></div>
                    <button 
                      type="button" 
                      @click="refreshAvatar" 
                      class="btn btn-white shadow-sm rounded-circle p-1 position-absolute top-0 end-0"
                      title="Refresh Avatar"
                    >
                      <i class="bi bi-arrow-clockwise small"></i>
                    </button>
                  </div>
                  <h6 class="fw-bold mb-1">{{ form.name || 'New User' }}</h6>
                  <p class="text-muted xx-small text-uppercase fw-bold mb-1">{{ form.role }} • {{ form.status }}</p>
                  <p v-if="form.department" class="text-purple xx-small fw-bold mb-0">{{ form.department }} Team</p>
                </div>

                <div v-if="form.bio" class="bio-preview p-3 rounded-4 bg-white border shadow-sm mb-4 animate__animated animate__fadeIn">
                  <h6 class="fw-bold mb-2 xx-small text-uppercase tracking-wider opacity-50">About</h6>
                  <p class="xx-small text-muted mb-0 lh-sm fst-italic">"{{ form.bio }}"</p>
                </div>

                <div class="role-info p-4 rounded-4 bg-white border shadow-sm mb-4">
                  <h6 class="fw-bold mb-3 small text-uppercase tracking-wider d-flex align-items-center gap-2">
                    <i class="bi bi-shield-check text-purple"></i>
                    Role Permissions
                  </h6>
                  <div v-if="form.role === 'Student'" class="animate__animated animate__fadeIn">
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-check2 small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Access to all course materials, video lectures, and resources</span>
                    </div>
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-check2 small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Participate in community discussions and Q&A sessions</span>
                    </div>
                    <div class="permission-item d-flex gap-3">
                      <div class="icon-box bg-success bg-opacity-10 text-success rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-check2 small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Track personal progress and receive achievement badges</span>
                    </div>
                  </div>
                  <div v-if="form.role === 'Mentor'" class="animate__animated animate__fadeIn">
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-purple bg-opacity-10 text-purple rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-pencil-square small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Create, edit, and manage educational course content</span>
                    </div>
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-purple bg-opacity-10 text-purple rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-chat-left-dots small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Moderate forums and provide feedback on student submissions</span>
                    </div>
                    <div class="permission-item d-flex gap-3">
                      <div class="icon-box bg-purple bg-opacity-10 text-purple rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-graph-up-arrow small"></i>
                      </div>
                      <span class="xx-small text-muted leading-tight">Access analytics for assigned courses and student performance</span>
                    </div>
                  </div>
                  <div v-if="form.role === 'Admin'" class="animate__animated animate__fadeIn">
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-danger bg-opacity-10 text-danger rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-shield-lock small"></i>
                      </div>
                      <span class="xx-small fw-bold text-dark leading-tight">Full administrative control over users, projects, and system settings</span>
                    </div>
                    <div class="permission-item d-flex gap-3 mb-3">
                      <div class="icon-box bg-danger bg-opacity-10 text-danger rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-database-fill-gear small"></i>
                      </div>
                      <span class="xx-small fw-bold text-dark leading-tight">Manage database records, API keys, and platform security</span>
                    </div>
                    <div class="permission-item d-flex gap-3">
                      <div class="icon-box bg-danger bg-opacity-10 text-danger rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; min-width: 24px;">
                        <i class="bi bi-receipt small"></i>
                      </div>
                      <span class="xx-small fw-bold text-dark leading-tight">Access financial reports and detailed audit logs</span>
                    </div>
                  </div>
                </div>

                <div class="alert alert-purple border-0 rounded-4 p-3 mb-0">
                  <div class="d-flex gap-2">
                    <i class="bi bi-lightning-charge-fill"></i>
                    <div>
                      <div class="fw-bold xx-small text-uppercase">Auto-Onboarding</div>
                      <p class="xx-small mb-0 mt-1 opacity-75">Welcome email with login instructions will be sent immediately.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const router = useRouter();
const isSubmitting = ref(false);
const showPassword = ref(false);
const avatarSeed = ref(Math.random().toString(36).substring(7));

// Step Management
const currentStep = ref(1);
const stepTitles = ['Account Details', 'Access & Role', 'Security Setup'];
const isCheckingEmail = ref(false);
const emailAvailable = ref(null);

const form = ref({
  name: '',
  email: '',
  role: 'Student',
  department: 'Engineering',
  bio: '',
  status: 'active',
  password: ''
});

const errors = ref({
  name: '',
  email: '',
  password: ''
});

const toast = ref({
  show: false,
  message: '',
  type: 'success',
  icon: 'bi-check-circle'
});

const showToast = (message, type = 'success', icon = 'bi-check-circle') => {
  toast.value = { show: true, message, type, icon };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const validateField = (field) => {
  if (field === 'name') {
    errors.value.name = form.value.name.length < 3 ? 'Name must be at least 3 characters' : '';
  }
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.value.email)) {
      errors.value.email = 'Please enter a valid email address';
      emailAvailable.value = null;
    } else {
      errors.value.email = '';
      // Mock email check
      if (form.value.email) checkEmailAvailability();
    }
  }
  if (field === 'password') {
    errors.value.password = form.value.password.length < 8 ? 'Password must be at least 8 characters' : '';
  }
};

const checkEmailAvailability = () => {
  isCheckingEmail.value = true;
  setTimeout(() => {
    isCheckingEmail.value = false;
    emailAvailable.value = true; // Always available in mock
  }, 800);
};

watch(() => form.value.name, () => validateField('name'));
watch(() => form.value.email, () => validateField('email'));
watch(() => form.value.password, () => validateField('password'));

const nextStep = () => {
  if (currentStep.value === 1) {
    validateField('name');
    validateField('email');
    if (errors.value.name || errors.value.email || !form.value.name || !form.value.email) {
      showToast('Please complete account details correctly', 'danger', 'bi-exclamation-triangle');
      return;
    }
  }
  if (currentStep.value === 2) {
    // No specific validation for step 2 yet
  }
  if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const passwordStrength = computed(() => {
  const pwd = form.value.password;
  if (!pwd) return { score: 0, label: 'Empty', color: 'text-muted' };
  if (pwd.length < 6) return { score: 1, label: 'Weak', color: 'text-danger' };
  if (pwd.length < 10) return { score: 2, label: 'Fair', color: 'text-warning' };
  return { score: 3, label: 'Strong', color: 'text-success' };
});

const avatarUrl = computed(() => {
  const seed = avatarSeed.value + (form.value.name || '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
});

const refreshAvatar = () => {
  avatarSeed.value = Math.random().toString(36).substring(7);
  showToast('Avatar style refreshed!', 'purple', 'bi-magic');
};

const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const length = 14;
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  form.value.password = password;
  showPassword.value = true;
  showToast('Secure password generated', 'success', 'bi-shield-lock');
};

const handleSubmit = () => {
  validateField('password');
  if (errors.value.password || !form.value.password) {
    showToast('Please set a secure password', 'danger', 'bi-exclamation-triangle');
    return;
  }
  
  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
    showToast('Account created successfully!', 'success', 'bi-check-circle-fill');
    setTimeout(() => {
      router.push('/admin/users');
    }, 1000);
  }, 1500);
};
</script>

<style scoped>
.create-user-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.xx-small {
  font-size: 0.7rem;
  letter-spacing: 0.025em;
}

.text-purple {
  color: #8b5cf6;
}

.bg-purple-soft {
  background-color: rgba(139, 92, 246, 0.1);
}

.alert-purple {
  background-color: #f5f3ff;
  color: #5b21b6;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

/* Stepper Styles */
.stepper-container {
  max-width: 600px;
  margin: 0 auto;
}

.stepper-line {
  position: absolute;
  top: 18px;
  left: 0;
  height: 2px;
  background: #8b5cf6;
  transition: width 0.4s ease;
  z-index: 0;
}

.stepper-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  background: #e2e8f0;
  z-index: -1;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 2;
}

.step-item.active .step-circle {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.step-item.completed .step-circle {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

.step-label {
  color: #94a3b8;
  transition: color 0.3s ease;
}

.step-item.active .step-label {
  color: #1e293b;
}

textarea:focus, input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  background-color: white !important;
  border-color: #8b5cf6 !important;
}

.btn-white {
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-white:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.avatar-preview-container {
  width: 120px;
  height: 120px;
  transition: transform 0.3s ease;
}

.avatar-preview-container:hover {
  transform: scale(1.05);
}

.status-indicator {
  width: 16px;
  height: 16px;
  border: 3px solid white;
  border-radius: 50%;
  bottom: 8px;
  right: 8px;
}

.role-info {
  transition: all 0.3s ease;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.form-control::placeholder {
  color: #94a3b8;
  font-size: 0.9rem;
}

.input-group-text {
  transition: all 0.2s ease;
}

.input-group:focus-within .input-group-text {
  color: #8b5cf6 !important;
}

.is-invalid {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
  border: 1px solid #dc3545 !important;
}

/* Toast Styles */
.toast-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  color: white;
  z-index: 9999;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.bg-purple { background-color: #8b5cf6; }
.bg-danger { background-color: #ef4444; }
.bg-success { background-color: #10b981; }

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  transform: translateX(100%) scale(0.5);
  opacity: 0;
}
.toast-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.bio-preview {
  border-left: 3px solid #8b5cf6 !important;
}

.lh-sm {
  line-height: 1.25;
}

textarea {
  resize: none;
}

.border-dashed {
  border-style: dashed !important;
}
</style>
