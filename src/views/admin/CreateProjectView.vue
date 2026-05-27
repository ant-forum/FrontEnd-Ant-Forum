<template>
  <div class="create-project-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <div class="container-fluid max-width-md">
        <!-- Header -->
        <div class="mb-4">
          <button @click="$router.back()" class="btn btn-link text-decoration-none text-muted p-0 mb-2 d-flex align-items-center">
            <i class="bi bi-arrow-left me-2"></i>
            Back to Projects
          </button>
          <h3 class="fw-bold mb-0">Add New Project</h3>
          <p class="text-muted small mb-0">Onboard a new ecosystem initiative or internal tool.</p>
        </div>

        <!-- Form Card -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-body p-4 p-lg-5">
            <form @submit.prevent="handleSubmit">
              <div class="row g-4">
                <!-- Project Icon & Title -->
                <div class="col-md-8">
                  <label class="form-label text-muted small fw-bold">PROJECT TITLE</label>
                  <input 
                    v-model="formData.title" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="e.g. Neural Mesh API"
                    required
                  >
                </div>
                <div class="col-md-4">
                  <label class="form-label text-muted small fw-bold">ICON CLASS (Bootstrap)</label>
                  <input 
                    v-model="formData.icon" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="bi bi-cpu"
                  >
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label text-muted small fw-bold">DESCRIPTION</label>
                  <textarea 
                    v-model="formData.description" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    rows="3"
                    placeholder="Briefly describe the project's purpose and scope..."
                    required
                  ></textarea>
                </div>

                <!-- Tech Stack -->
                <div class="col-12">
                  <label class="form-label text-muted small fw-bold">TECH STACK (Comma separated)</label>
                  <input 
                    v-model="techStackInput" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="Vue, Node.js, PostgreSQL"
                  >
                </div>

                <!-- Lead Info -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">PROJECT LEAD NAME</label>
                  <input 
                    v-model="formData.member.name" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="Alex Rivera"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">LEAD ROLE</label>
                  <input 
                    v-model="formData.member.role" 
                    type="text" 
                    class="form-control rounded-3 border-light bg-light px-3 py-2" 
                    placeholder="Senior Developer"
                  >
                </div>

                <!-- Status Selection -->
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">INITIAL STATUS</label>
                  <select v-model="formData.status" class="form-select rounded-3 border-light bg-light px-3 py-2">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING REVIEW">Pending Review</option>
                    <option value="FLAGGED">Flagged</option>
                  </select>
                </div>

                <!-- Actions -->
                <div class="col-12 mt-5 d-flex gap-3 justify-content-end">
                  <button type="button" @click="$router.back()" class="btn btn-light rounded-pill px-4 py-2 fw-bold">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-brand">
                    Add Project
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
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const router = useRouter();
const techStackInput = ref('');

const formData = reactive({
  title: '',
  description: '',
  status: 'PENDING REVIEW',
  icon: 'bi bi-box-seam',
  iconBgClass: 'bg-light-purple text-purple',
  member: {
    name: '',
    role: '',
    avatar: 'https://i.pravatar.cc/150?u=new'
  }
});

const handleSubmit = () => {
  const newProject = {
    ...formData,
    id: Date.now(),
    techStack: techStackInput.value.split(',').map(s => s.trim()).filter(s => s !== '')
  };
  
  console.log('Adding project:', newProject);
  // Logic to persist would go here
  
  router.push('/admin/projects');
};
</script>

<style scoped>
.max-width-md {
  max-width: 900px;
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
</style>
