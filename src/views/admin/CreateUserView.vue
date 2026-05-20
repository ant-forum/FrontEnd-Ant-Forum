<template>
  <div class="create-user-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Breadcrumb / Header -->
      <div class="mb-4">
        <button @click="$router.back()" class="btn btn-link text-decoration-none text-muted p-0 mb-2 d-flex align-items-center">
          <i class="bi bi-arrow-left me-2"></i>
          Back to User Directory
        </button>
        <h3 class="fw-bold mb-0">Create New User</h3>
        <p class="text-muted small mb-0">Platform registration for new members</p>
      </div>

      <!-- Form Card -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-0">
            <div class="row g-0">
              <!-- Left Panel: Profile & Intro -->
              <div class="col-lg-4 bg-light-purple-soft p-4 p-lg-5 text-center d-flex flex-column justify-content-center border-end">
                <div class="position-relative d-inline-block mb-4 mx-auto">
                  <div class="avatar-wrapper rounded-circle p-1 bg-white shadow-sm">
                    <img 
                      :src="previewAvatar" 
                      class="rounded-circle border border-4 border-white profile-preview" 
                      width="120" 
                      height="120"
                      alt="Avatar Preview"
                    >
                  </div>
                  <div class="position-absolute bottom-0 end-0">
                    <label for="avatar-upload" class="btn btn-primary btn-sm rounded-circle shadow-brand p-0 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; cursor: pointer;">
                      <i class="bi bi-camera-fill" style="font-size: 0.8rem;"></i>
                    </label>
                    <input type="file" id="avatar-upload" class="d-none" @change="handleAvatarUpload" accept="image/*">
                  </div>
                </div>
                <h5 class="fw-bold mb-1">{{ formData.name || 'New User' }}</h5>
                <p class="text-muted small mb-4">{{ formData.email || 'user@example.com' }}</p>
                
                <div class="role-preview-badge mb-4">
                  <span :class="['badge rounded-pill px-3 py-2 fw-bold', getRoleClass(formData.role)]">
                    {{ formData.role.toUpperCase() }}
                  </span>
                </div>

                <div class="text-start mt-auto pt-4 border-top">
                  <p class="text-muted xx-small fw-bold text-uppercase mb-2" style="letter-spacing: 1px;">Quick Tips</p>
                  <ul class="list-unstyled mb-0">
                    <li class="small text-muted mb-2 d-flex align-items-start gap-2">
                      <i class="bi bi-check2-circle text-primary"></i>
                      <span>Role defines platform permissions</span>
                    </li>
                    <li class="small text-muted d-flex align-items-start gap-2">
                      <i class="bi bi-check2-circle text-primary"></i>
                      <span>Invitation email is sent instantly</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Right Panel: Form Fields -->
              <div class="col-lg-8 p-4 p-lg-5">
                <form @submit.prevent="handleSubmit" class="needs-validation">
                  <div class="form-section mb-5">
                    <h6 class="text-uppercase fw-bold text-primary mb-4" style="font-size: 0.75rem; letter-spacing: 1.5px;">Account Information</h6>
                    <div class="row g-4">
                      <div class="col-md-6">
                        <label class="form-label text-muted small fw-bold">FULL NAME</label>
                        <div class="input-group input-group-modern">
                          <span class="input-group-text bg-light border-0"><i class="bi bi-person text-muted"></i></span>
                          <input 
                            v-model="formData.name" 
                            type="text" 
                            class="form-control rounded-3 border-light bg-light px-3 py-2" 
                            placeholder="e.g. John Doe"
                            required
                          >
                        </div>
                      </div>

                      <div class="col-md-6">
                        <label class="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                        <div class="input-group input-group-modern">
                          <span class="input-group-text bg-light border-0"><i class="bi bi-envelope text-muted"></i></span>
                          <input 
                            v-model="formData.email" 
                            type="email" 
                            class="form-control rounded-3 border-light bg-light px-3 py-2" 
                            placeholder="john@example.com"
                            required
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-section mb-5">
                    <h6 class="text-uppercase fw-bold text-primary mb-4" style="font-size: 0.75rem; letter-spacing: 1.5px;">Role & Status</h6>
                    <div class="row g-4">
                      <div class="col-12">
                        <label class="form-label text-muted small fw-bold mb-3">SELECT ROLE</label>
                        <div class="row g-3">
                          <div v-for="role in roles" :key="role.name" class="col-md-4">
                            <div 
                              :class="['role-selector-card p-3 rounded-4 border text-center cursor-pointer transition-all', formData.role === role.name ? 'active border-primary bg-primary-subtle-light' : 'bg-white border-light']"
                              @click="formData.role = role.name"
                            >
                              <div :class="['icon-box rounded-circle mx-auto mb-2', role.bgClass]">
                                <i :class="[role.icon, role.textClass]"></i>
                              </div>
                              <div class="fw-bold small">{{ role.name }}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-md-6 mt-4">
                        <label class="form-label text-muted small fw-bold">ACCOUNT STATUS</label>
                        <div class="d-flex gap-2">
                          <button 
                            type="button"
                            v-for="status in statuses" 
                            :key="status.value"
                            :class="['btn btn-sm rounded-pill px-4 py-2 flex-grow-1 fw-bold transition-all', formData.status === status.value ? 'btn-primary shadow-brand' : 'btn-light text-muted border-light']"
                            @click="formData.status = status.value"
                          >
                            {{ status.label }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Settings -->
                  <div class="form-section mb-5">
                    <h6 class="text-uppercase fw-bold text-primary mb-4" style="font-size: 0.75rem; letter-spacing: 1.5px;">Security & Invitations</h6>
                    <div class="p-4 rounded-4 bg-light">
                      <div class="form-check form-switch mb-3 custom-switch">
                        <input class="form-check-input" type="checkbox" id="sendEmail" v-model="formData.sendInvitation">
                        <label class="form-check-label text-muted small fw-bold ms-2" for="sendEmail">
                          SEND WELCOME EMAIL INVITATION
                        </label>
                      </div>
                      <div class="form-check form-switch custom-switch">
                        <input class="form-check-input" type="checkbox" id="requirePasswordChange" v-model="formData.requirePasswordReset">
                        <label class="form-check-label text-muted small fw-bold ms-2" for="requirePasswordChange">
                          REQUIRE PASSWORD CHANGE ON FIRST LOGIN
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="d-flex gap-3 justify-content-end align-items-center mt-5">
                    <button type="button" @click="$router.back()" class="btn btn-link text-muted text-decoration-none fw-bold small">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-primary rounded-pill px-5 py-3 fw-bold shadow-brand d-flex align-items-center gap-2"
                      :disabled="isSubmitting || showSuccess"
                    >
                      <template v-if="isSubmitting">
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Creating Account...</span>
                      </template>
                      <template v-else-if="showSuccess">
                        <i class="bi bi-check-lg"></i>
                        <span>User Created!</span>
                      </template>
                      <template v-else>
                        <span>Create User Account</span>
                        <i class="bi bi-arrow-right"></i>
                      </template>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const router = useRouter();

const formData = reactive({
  name: '',
  email: '',
  role: 'Student',
  status: 'active',
  sendInvitation: true,
  requirePasswordReset: false,
  avatar: null
});

const uploadedAvatar = ref(null);

const roles = [
  { name: 'Student', icon: 'bi bi-mortarboard', bgClass: 'bg-light-blue', textClass: 'text-blue' },
  { name: 'Mentor', icon: 'bi bi-person-badge', bgClass: 'bg-light-purple', textClass: 'text-purple' },
  { name: 'Admin', icon: 'bi bi-shield-lock', bgClass: 'bg-light-orange', textClass: 'text-orange' }
];

const statuses = [
  { label: 'Active', value: 'active' },
  { label: 'Idle', value: 'idle' }
];

const previewAvatar = computed(() => {
  if (uploadedAvatar.value) return uploadedAvatar.value;
  const name = formData.name || 'user';
  return `https://i.pravatar.cc/150?u=${name.split(' ')[0].toLowerCase()}`;
});

const getRoleClass = (role) => {
  const classes = {
    'Admin': 'role-admin',
    'Mentor': 'role-mentor',
    'Student': 'role-student'
  };
  return classes[role] || 'bg-light';
};

const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedAvatar.value = e.target.result;
    };
    reader.readAsDataURL(file);
    formData.avatar = file;
  }
};

const isSubmitting = ref(false);
const showSuccess = ref(false);

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('Creating user:', formData);
  
  isSubmitting.value = false;
  showSuccess.value = true;
  
  // Redirect after showing success
  setTimeout(() => {
    router.push('/admin/users');
  }, 2000);
};
</script>

<style scoped>
.create-user-layout {
  font-family: var(--font-family-base);
}

.bg-light-purple-soft {
  background-color: #f8faff;
}

.avatar-wrapper {
  width: 130px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-preview {
  object-fit: cover;
  transition: transform 0.3s ease;
}

.profile-preview:hover {
  transform: scale(1.05);
}

.input-group-modern {
  border-radius: 12px;
  overflow: hidden;
}

.input-group-modern .input-group-text {
  border-right: none;
}

.input-group-modern .form-control {
  border-left: none;
}

.role-selector-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.role-selector-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.role-selector-card.active {
  background-color: rgba(139, 92, 246, 0.08) !important;
  border-color: #8b5cf6 !important;
}

.icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }
.text-blue { color: #3b82f6; }
.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.text-purple { color: #8b5cf6; }
.bg-light-orange { background-color: rgba(245, 158, 11, 0.1); }
.text-orange { color: #f59e0b; }

.custom-switch .form-check-input {
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
}

.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #8b5cf6;
  background-color: white !important;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.btn-primary {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.btn-primary:hover {
  background-color: #7c3aed;
  border-color: #7c3aed;
  transform: translateY(-1px);
}

.role-mentor { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.role-student { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.role-admin { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }

.xx-small { font-size: 0.65rem; }
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease; }
</style>
