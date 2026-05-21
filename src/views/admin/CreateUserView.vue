<template>
  <div class="create-user-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Header -->
      <header class="mb-4 d-flex justify-content-between align-items-end">
        <div>
          <router-link to="/admin/users" class="back-link d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-arrow-left"></i>
            <span>Back to User Directory</span>
          </router-link>
          <h1 class="fw-bold mb-1">Create New User</h1>
          <p class="text-muted small mb-0">Platform registration for new members</p>
        </div>
        <div class="completion-stats text-end d-none d-md-block">
          <div class="xx-small fw-bold text-uppercase text-muted mb-1">Form Completion</div>
          <div class="d-flex align-items-center gap-2">
            <div class="progress" style="width: 120px; height: 6px;">
              <div class="progress-bar bg-purple" :style="{ width: completionPercentage + '%' }"></div>
            </div>
            <span class="small fw-bold text-purple">{{ completionPercentage }}%</span>
          </div>
        </div>
      </header>

      <div class="row g-4">
        <div class="col-xl-8">
          <!-- Main Card -->
          <div class="card create-card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
            <form @submit.prevent="handleSubmit">
              <!-- Avatar Section -->
              <div class="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom border-light">
                <div class="avatar-wrapper position-relative">
                  <img :src="avatarUrl" class="rounded-circle shadow-sm border border-4 border-white" width="100" height="100" alt="Avatar Preview">
                  <button type="button" @click="refreshAvatar" class="camera-btn position-absolute bottom-0 end-0 rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm">
                    <i class="bi bi-camera-fill text-white small"></i>
                  </button>
                </div>
                <div>
                  <h5 class="fw-bold mb-1">Profile Photo</h5>
                  <p class="text-muted xx-small mb-0">This will be visible to other members across the platform.</p>
                </div>
              </div>

              <!-- Section: Basic Info -->
              <div class="mb-5">
                <h6 class="fw-bold text-uppercase small tracking-wider text-purple mb-4">
                  <i class="bi bi-person-circle me-2"></i>Personal Details
                </h6>
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Full Name</label>
                    <input v-model="form.name" type="text" class="form-control custom-input border-0" placeholder="e.g. John Doe" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Email Address</label>
                    <input v-model="form.email" type="email" class="form-control custom-input border-0" placeholder="john@example.com" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Role</label>
                    <div class="custom-select-wrapper position-relative" v-click-outside="() => showRoleDropdown = false">
                      <div @click="showRoleDropdown = !showRoleDropdown" class="form-control custom-input border-0 d-flex align-items-center justify-content-between cursor-pointer">
                        <div class="d-flex align-items-center gap-2">
                          <i :class="['bi', getRoleIcon(form.role), 'text-purple']"></i>
                          <span>{{ form.role }}</span>
                        </div>
                        <i class="bi bi-chevron-down small opacity-50"></i>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showRoleDropdown" class="dropdown-menu-custom position-absolute w-100 mt-2 p-2 rounded-4 shadow-lg border-0 bg-white z-3">
                          <div v-for="role in roleOptions" :key="role.label" 
                            @click="selectRole(role.label)"
                            class="dropdown-item-custom p-3 rounded-3 d-flex align-items-center gap-3 mb-1 cursor-pointer"
                            :class="{ 'active': form.role === role.label }"
                          >
                            <div class="icon-box-sm rounded-circle d-flex align-items-center justify-content-center" :class="role.bg">
                              <i :class="['bi', role.icon, role.text]"></i>
                            </div>
                            <div>
                              <div class="fw-bold small">{{ role.label }}</div>
                              <div class="xx-small text-muted">{{ role.desc }}</div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Department</label>
                    <div class="custom-select-wrapper position-relative" v-click-outside="() => showDeptDropdown = false">
                      <div @click="showDeptDropdown = !showDeptDropdown" class="form-control custom-input border-0 d-flex align-items-center justify-content-between cursor-pointer">
                        <div class="d-flex align-items-center gap-2">
                          <i :class="['bi', getDeptIcon(form.department), 'text-purple']"></i>
                          <span>{{ form.department }}</span>
                        </div>
                        <i class="bi bi-chevron-down small opacity-50"></i>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showDeptDropdown" class="dropdown-menu-custom position-absolute w-100 mt-2 p-2 rounded-4 shadow-lg border-0 bg-white z-3">
                          <div v-for="dept in deptOptions" :key="dept.label" 
                            @click="selectDept(dept.label)"
                            class="dropdown-item-custom p-3 rounded-3 d-flex align-items-center gap-3 mb-1 cursor-pointer"
                            :class="{ 'active': form.department === dept.label }"
                          >
                            <div class="icon-box-sm rounded-circle d-flex align-items-center justify-content-center bg-light">
                              <i :class="['bi', dept.icon, 'text-muted']"></i>
                            </div>
                            <div>
                              <div class="fw-bold small">{{ dept.label }}</div>
                              <div class="xx-small text-muted">{{ dept.desc }}</div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Work & Projects -->
              <div class="mb-5">
                <h6 class="fw-bold text-uppercase small tracking-wider text-purple mb-4">
                  <i class="bi bi-briefcase me-2"></i>Work & Assignments
                </h6>
                <div class="row g-4">
                  <div class="col-12">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Assign to Projects</label>
                    <div class="d-flex flex-wrap gap-2 p-3 bg-light rounded-4">
                      <div v-for="project in availableProjects" :key="project" 
                        class="project-pill px-3 py-1 rounded-pill small fw-bold border"
                        :class="form.projects.includes(project) ? 'bg-purple text-white border-purple' : 'bg-white text-muted border-light'"
                        @click="toggleProject(project)"
                        style="cursor: pointer; transition: all 0.2s ease;"
                      >
                        <i :class="form.projects.includes(project) ? 'bi bi-check-lg' : 'bi bi-plus'" class="me-1"></i>
                        {{ project }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Initial Status</label>
                    <div class="custom-select-wrapper position-relative" v-click-outside="() => showStatusDropdown = false">
                      <div @click="showStatusDropdown = !showStatusDropdown" class="form-control custom-input border-0 d-flex align-items-center justify-content-between cursor-pointer">
                        <div class="d-flex align-items-center gap-2">
                          <i :class="['bi', getStatusIcon(form.status), form.status === 'active' ? 'text-success' : 'text-warning']"></i>
                          <span>{{ form.status.charAt(0).toUpperCase() + form.status.slice(1) }}</span>
                        </div>
                        <i class="bi bi-chevron-down small opacity-50"></i>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showStatusDropdown" class="dropdown-menu-custom position-absolute w-100 mt-2 p-2 rounded-4 shadow-lg border-0 bg-white z-3">
                          <div v-for="status in statusOptions" :key="status.value" 
                            @click="selectStatus(status.value)"
                            class="dropdown-item-custom p-3 rounded-3 d-flex align-items-center gap-3 mb-1 cursor-pointer"
                            :class="{ 'active': form.status === status.value }"
                          >
                            <div class="icon-box-sm rounded-circle d-flex align-items-center justify-content-center" :class="status.bg">
                              <i :class="['bi', status.icon, status.text]"></i>
                            </div>
                            <div>
                              <div class="fw-bold small">{{ status.label }}</div>
                              <div class="xx-small text-muted">{{ status.desc }}</div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-muted xx-small fw-bold text-uppercase">Workspace Location</label>
                    <div class="custom-select-wrapper position-relative" v-click-outside="() => showLocationDropdown = false">
                      <div @click="showLocationDropdown = !showLocationDropdown" class="form-control custom-input border-0 d-flex align-items-center justify-content-between cursor-pointer">
                        <div class="d-flex align-items-center gap-2">
                          <i :class="['bi', getLocationIcon(form.location), 'text-purple']"></i>
                          <span>{{ form.location }}</span>
                        </div>
                        <i class="bi bi-chevron-down small opacity-50"></i>
                      </div>
                      <Transition name="dropdown">
                        <div v-if="showLocationDropdown" class="dropdown-menu-custom position-absolute w-100 mt-2 p-2 rounded-4 shadow-lg border-0 bg-white z-3">
                          <div v-for="loc in locationOptions" :key="loc.label" 
                            @click="selectLocation(loc.label)"
                            class="dropdown-item-custom p-3 rounded-3 d-flex align-items-center gap-3 mb-1 cursor-pointer"
                            :class="{ 'active': form.location === loc.label }"
                          >
                            <div class="icon-box-sm rounded-circle d-flex align-items-center justify-content-center bg-light">
                              <i :class="['bi', loc.icon, 'text-muted']"></i>
                            </div>
                            <div>
                              <div class="fw-bold small">{{ loc.label }}</div>
                              <div class="xx-small text-muted">{{ loc.desc }}</div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>

              <hr class="my-5 opacity-10">

              <!-- Section: Settings & Access -->
              <div class="mb-5">
                <h6 class="fw-bold text-uppercase small tracking-wider text-purple mb-4">
                  <i class="bi bi-shield-lock me-2"></i>Security & Notifications
                </h6>
                <div class="row g-3">
                  <div class="col-12">
                    <div class="form-check form-switch custom-switch mb-3 d-flex align-items-center gap-3 ps-0">
                      <input v-model="form.sendInvitation" class="form-check-input ms-0 mt-0" type="checkbox" id="sendInvitation">
                      <label class="form-check-label text-muted small fw-bold text-uppercase mt-1" for="sendInvitation">
                        Send Welcome Email Invitation
                      </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch custom-switch mb-3 d-flex align-items-center gap-3 ps-0">
                      <input v-model="form.require2FA" class="form-check-input ms-0 mt-0" type="checkbox" id="require2FA">
                      <label class="form-check-label text-muted small fw-bold text-uppercase mt-1" for="require2FA">
                        Enforce Two-Factor Authentication (2FA)
                      </label>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch custom-switch d-flex align-items-center gap-3 ps-0">
                      <input v-model="form.requirePasswordChange" class="form-check-input ms-0 mt-0" type="checkbox" id="requirePasswordChange">
                      <label class="form-check-label text-muted small fw-bold text-uppercase mt-1" for="requirePasswordChange">
                        Require Password Change on First Login
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="d-flex justify-content-end gap-3 pt-4 border-top border-light mt-5">
                <router-link to="/admin/users" class="btn btn-cancel rounded-pill px-4 py-2 fw-bold border-0">
                  Cancel
                </router-link>
                <button 
                  type="submit" 
                  class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand border-0"
                  :disabled="isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Side: Sidebar Tips -->
        <div class="col-xl-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style="top: 2rem; z-index: 10;">
            <h6 class="fw-bold mb-4 small text-uppercase tracking-wider">Onboarding Checklist</h6>
            
            <div class="checklist-item d-flex gap-3 mb-4">
              <div class="icon-box-sm bg-purple-soft text-purple rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-envelope small"></i>
              </div>
              <div>
                <div class="small fw-bold">Email Verification</div>
                <p class="xx-small text-muted mb-0">System will verify email format and domain accessibility.</p>
              </div>
            </div>

            <div class="checklist-item d-flex gap-3 mb-4">
              <div class="icon-box-sm bg-success-soft text-success rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-shield-check small"></i>
              </div>
              <div>
                <div class="small fw-bold">Permission Logic</div>
                <p class="xx-small text-muted mb-0">Role determines initial access to dashboard modules.</p>
              </div>
            </div>

            <div class="checklist-item d-flex gap-3 mb-4">
              <div class="icon-box-sm bg-warning-soft text-warning rounded-circle d-flex align-items-center justify-content-center">
                <i class="bi bi-lightning small"></i>
              </div>
              <div>
                <div class="small fw-bold">Auto-Provisioning</div>
                <p class="xx-small text-muted mb-0">Projects assigned will be ready for the user immediately.</p>
              </div>
            </div>

            <div class="alert alert-purple border-0 rounded-4 p-3 mt-2 mb-0">
              <div class="d-flex gap-2">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <p class="xx-small mb-0 opacity-75 fw-medium">Need to import multiple users? Use the <strong>Bulk Import</strong> tool on the main directory page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', `bg-${toast.type}`]">
        <i :class="['bi', toast.icon, 'me-2']"></i>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const router = useRouter();
const isSubmitting = ref(false);
const avatarSeed = ref(Math.random().toString(36).substring(7));

// Dropdown States
const showRoleDropdown = ref(false);
const showDeptDropdown = ref(false);
const showStatusDropdown = ref(false);
const showLocationDropdown = ref(false);

const roleOptions = [
  { label: 'Student', icon: 'bi-person', bg: 'bg-info-soft', text: 'text-info', desc: 'Standard member access' },
  { label: 'Mentor', icon: 'bi-mortarboard', bg: 'bg-purple-soft', text: 'text-purple', desc: 'Course management access' },
  { label: 'Admin', icon: 'bi-shield-lock', bg: 'bg-danger-soft', text: 'text-danger', desc: 'Full platform control' }
];

const deptOptions = [
  { label: 'Engineering', icon: 'bi-cpu', desc: 'Development & Infrastructure' },
  { label: 'Design', icon: 'bi-palette', desc: 'UI/UX & Creative' },
  { label: 'Marketing', icon: 'bi-megaphone', desc: 'Growth & Outreach' },
  { label: 'Support', icon: 'bi-headset', desc: 'Customer Success' }
];

const statusOptions = [
  { label: 'Active', value: 'active', icon: 'bi-check-circle', bg: 'bg-success-soft', text: 'text-success', desc: 'Full account access enabled' },
  { label: 'Idle', value: 'idle', icon: 'bi-clock-history', bg: 'bg-warning-soft', text: 'text-warning', desc: 'Temporary account pause' }
];

const locationOptions = [
  { label: 'Remote', icon: 'bi-house-door', desc: 'Working from home/outside' },
  { label: 'On-site', icon: 'bi-building', desc: 'Main headquarters office' },
  { label: 'Hybrid', icon: 'bi-intersect', desc: 'Mix of office and remote' }
];

const getRoleIcon = (roleName) => roleOptions.find(r => r.label === roleName)?.icon || 'bi-person';
const getDeptIcon = (deptName) => deptOptions.find(d => d.label === deptName)?.icon || 'bi-building';
const getStatusIcon = (statusValue) => statusOptions.find(s => s.value === statusValue)?.icon || 'bi-circle';
const getLocationIcon = (locName) => locationOptions.find(l => l.label === locName)?.icon || 'bi-geo-alt';

const selectRole = (role) => {
  form.value.role = role;
  showRoleDropdown.value = false;
};

const selectDept = (dept) => {
  form.value.department = dept;
  showDeptDropdown.value = false;
};

const selectStatus = (status) => {
  form.value.status = status;
  showStatusDropdown.value = false;
};

const selectLocation = (loc) => {
  form.value.location = loc;
  showLocationDropdown.value = false;
};

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};

const form = ref({
  name: '',
  email: '',
  role: 'Student',
  department: 'Engineering',
  status: 'active',
  location: 'Remote',
  projects: [],
  sendInvitation: true,
  require2FA: false,
  requirePasswordChange: false
});

const availableProjects = ['ANT Dashboard', 'Mobile App', 'E-commerce API', 'DevOps Pipeline', 'Design System'];

const toggleProject = (project) => {
  const index = form.value.projects.indexOf(project);
  if (index === -1) {
    form.value.projects.push(project);
  } else {
    form.value.projects.splice(index, 1);
  }
};

const completionPercentage = computed(() => {
  const fields = ['name', 'email', 'role', 'department'];
  const completed = fields.filter(f => !!form.value[f]).length;
  const projectBonus = form.value.projects.length > 0 ? 1 : 0;
  return Math.round(((completed + projectBonus) / (fields.length + 1)) * 100);
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

// Computed avatar URL
const avatarUrl = computed(() => {
  const seed = avatarSeed.value + (form.value.name || '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
});

const refreshAvatar = () => {
  avatarSeed.value = Math.random().toString(36).substring(7);
  showToast('Avatar refreshed!', 'purple', 'bi-magic');
};

const handleSubmit = () => {
  if (!form.value.name || !form.value.email) {
    showToast('Please fill in required fields', 'danger', 'bi-exclamation-triangle');
    return;
  }
  
  isSubmitting.value = true;
  
  // Mock save delay
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

.back-link {
  text-decoration: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #1e293b;
}

.create-card {
  background: white;
  width: 100%;
}

.avatar-wrapper {
  width: 100px;
  height: 100px;
}

.icon-box-sm {
  width: 32px;
  height: 32px;
  min-width: 32px;
}

.bg-success-soft { background-color: rgba(16, 185, 129, 0.1); }
.bg-warning-soft { background-color: rgba(245, 158, 11, 0.1); }
.bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }
.bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }

.project-pill:hover {
  border-color: #8b5cf6 !important;
  background-color: rgba(139, 92, 246, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.dropdown-menu-custom {
  background: white;
  border: 1px solid rgba(0,0,0,0.05) !important;
  transform-origin: top;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.dropdown-item-custom {
  transition: all 0.2s ease;
}

.dropdown-item-custom:hover {
  background-color: #f8fafc;
}

.dropdown-item-custom.active {
  background-color: rgba(139, 92, 246, 0.05);
  border-left: 3px solid #8b5cf6 !important;
}

.dropdown-enter-active {
  animation: dropdown-in 0.2s ease-out;
}
.dropdown-leave-active {
  animation: dropdown-in 0.15s ease-in reverse;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.camera-btn {
  width: 28px;
  height: 28px;
  background: #8b5cf6;
  transition: transform 0.2s ease, background 0.2s ease;
}

.camera-btn:hover {
  transform: scale(1.1);
  background: #7c3aed;
}

.custom-input {
  background-color: #f8fafc;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
  border-radius: 0.75rem;
  color: #1e293b;
  border: 1px solid transparent !important;
}

.custom-input:focus {
  background-color: white;
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.form-label {
  letter-spacing: 0.025em;
  margin-bottom: 0.5rem;
}

/* Custom Switch Styling */
.custom-switch .form-check-input {
  width: 2.5rem;
  height: 1.25rem;
  cursor: pointer;
  background-color: #e2e8f0;
  border: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='white'/%3e%3c/svg%3e");
}

.custom-switch .form-check-input:checked {
  background-color: #8b5cf6;
}

.custom-switch .form-check-input:focus {
  box-shadow: none;
}

.btn-cancel {
  background-color: #f1f5f9;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.btn-primary {
  background-color: #8b5cf6;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
}

.progress-bar {
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sticky-top {
  transition: all 0.3s ease;
}

.shadow-brand {
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.25);
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
</style>
