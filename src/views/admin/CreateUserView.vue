<template>
  <div class="create-user-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <div class="container-fluid max-width-md">
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
          <div class="card-body p-4 p-lg-5">
            <form @submit.prevent="handleSubmit">
              <div class="row g-4">
                <!-- Profile Preview (Optional) -->
                <div class="col-12 text-center mb-2">
                  <div class="position-relative d-inline-block">
                    <img 
                      :src="previewAvatar" 
                      class="rounded-circle border border-4 border-white shadow-sm" 
                      width="100" 
                      height="100"
                      alt="Avatar Preview"
                    >
                    <div class="position-absolute bottom-0 end-0">
                      <button type="button" class="btn btn-primary btn-sm rounded-circle shadow-brand p-1" style="width: 28px; height: 28px;">
                        <i class="bi bi-camera-fill" style="font-size: 0.7rem;"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Basic Info -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">FULL NAME</label>
                  <input 
                    v-model="formData.name" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="e.g. John Doe"
                    required
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                  <input 
                    v-model="formData.email" 
                    type="email" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="john@example.com"
                    required
                  >
                </div>

                <!-- Role & Status -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">ROLE</label>
                  <select v-model="formData.role" class="form-select rounded-3 border-light bg-light px-3 py-2">
                    <option value="Student">Student</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">INITIAL STATUS</label>
                  <select v-model="formData.status" class="form-select rounded-3 border-light bg-light px-3 py-2">
                    <option value="active">Active</option>
                    <option value="idle">Idle</option>
                  </select>
                </div>

                <!-- Additional Settings -->
                <div class="col-12 mt-4 pt-4 border-top">
                  <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" id="sendEmail" checked>
                    <label class="form-check-label text-muted small fw-bold" for="sendEmail">
                      SEND WELCOME EMAIL INVITATION
                    </label>
                  </div>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="requirePasswordChange">
                    <label class="form-check-label text-muted small fw-bold" for="requirePasswordChange">
                      REQUIRE PASSWORD CHANGE ON FIRST LOGIN
                    </label>
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-12 mt-5 d-flex gap-3 justify-content-end">
                  <button type="button" @click="$router.back()" class="btn btn-light rounded-pill px-4 py-2 fw-bold">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand">
                    Create User Account
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const router = useRouter();

const formData = reactive({
  name: '',
  email: '',
  role: 'Student',
  status: 'active'
});

const previewAvatar = computed(() => {
  const name = formData.name || 'user';
  return `https://i.pravatar.cc/150?u=${name.split(' ')[0].toLowerCase()}`;
});

const handleSubmit = () => {
  // In a real app, you'd call your store/API here
  // For now, we'll just log and redirect back
  console.log('Creating user:', formData);
  
  // Logic to "persist" would go here (e.g., pinia store)
  
  router.push('/admin/users');
};
</script>

<style scoped>
.create-user-layout {
  font-family: var(--font-family-base);
}

.max-width-md {
  max-width: 800px;
}

.form-control:focus, .form-select:focus {
  box-shadow: none;
  border-color: #8b5cf6;
  background-color: white !important;
}

.shadow-brand {
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}

.btn-primary {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.btn-primary:hover {
  background-color: #7c3aed;
  border-color: #7c3aed;
}

.form-check-input:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.btn-link {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
