<template>
  <div v-if="show" class="modal-overlay d-flex align-items-center justify-content-center" @click.self="$emit('close')">
    <div class="modal-container bg-white rounded-4 shadow-lg overflow-hidden animate__animated animate__fadeInUp animate__faster">
      <!-- Header -->
      <div class="modal-header-custom p-4 d-flex justify-content-between align-items-center border-bottom">
        <div class="d-flex align-items-center gap-3">
          <div :class="['icon-box rounded-3 d-flex align-items-center justify-content-center shadow-sm', project.iconBgClass]">
            <i :class="[project.icon, 'fs-4']"></i>
          </div>
          <div>
            <h4 class="fw-bold mb-0">{{ project.title }}</h4>
            <span :class="['status-badge px-2 py-0 rounded-pill fw-bold text-uppercase small', getStatusClass(project.status)]">
              {{ project.status }}
            </span>
          </div>
        </div>
        <button class="btn-close-custom" @click="$emit('close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-body-custom p-4">
        <div class="row g-4">
          <!-- Left Column: Basic Info -->
          <div class="col-md-7">
            <div class="mb-4">
              <label class="form-label text-muted small fw-bold text-uppercase">Description</label>
              <textarea 
                v-model="editedProject.description" 
                class="form-control border-0 bg-light p-3 rounded-3" 
                rows="4"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="form-label text-muted small fw-bold text-uppercase">Tech Stack (comma separated)</label>
              <input 
                v-model="techStackString" 
                type="text" 
                class="form-control border-0 bg-light p-3 rounded-3"
              >
              <div class="d-flex flex-wrap gap-2 mt-2">
                <span v-for="tech in editedProject.techStack" :key="tech" class="tech-tag px-2 py-1 rounded-pill border small">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Column: Management -->
          <div class="col-md-5">
            <div class="management-section p-4 rounded-4 bg-light h-100">
              <h6 class="fw-bold mb-4">Project Management</h6>
              
              <div class="mb-4">
                <label class="form-label text-muted small fw-bold text-uppercase">Change Status</label>
                <select v-model="editedProject.status" class="form-select border-0 shadow-sm p-3 rounded-3">
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING REVIEW">Pending Review</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="form-label text-muted small fw-bold text-uppercase">Project Lead</label>
                <div class="d-flex align-items-center p-3 bg-white rounded-3 shadow-sm">
                  <img :src="project.member.avatar" class="rounded-circle me-3" width="40" height="40">
                  <div>
                    <div class="fw-bold small">{{ project.member.name }}</div>
                    <div class="text-muted xx-small text-uppercase">{{ project.member.role }}</div>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-column gap-2 mt-5">
                <button 
                  v-if="project.status === 'PENDING REVIEW'" 
                  class="btn btn-success rounded-pill py-2 fw-bold"
                  @click="updateStatus('ACTIVE')"
                >
                  Approve Project
                </button>
                <button 
                  v-if="project.status !== 'FLAGGED'" 
                  class="btn btn-outline-danger rounded-pill py-2 fw-bold"
                  @click="updateStatus('FLAGGED')"
                >
                  Flag for Review
                </button>
                <button class="btn btn-danger rounded-pill py-2 fw-bold" @click="$emit('delete', project.id)">
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer-custom p-4 border-top d-flex justify-content-end gap-3">
        <button class="btn btn-light rounded-pill px-4 py-2 fw-bold" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" @click="handleSave">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  project: Object
});

const emit = defineEmits(['close', 'save', 'delete']);

const editedProject = ref({ ...props.project });
const techStackString = ref(props.project.techStack.join(', '));

watch(() => props.project, (newVal) => {
  editedProject.value = { ...newVal };
  techStackString.value = newVal.techStack.join(', ');
}, { deep: true });

watch(techStackString, (newVal) => {
  editedProject.value.techStack = newVal.split(',').map(s => s.trim()).filter(s => s !== '');
});

const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'active': return 'status-active';
    case 'pending review': return 'status-pending';
    case 'flagged': return 'status-flagged';
    default: return 'status-default';
  }
};

const updateStatus = (status) => {
  editedProject.value.status = status;
};

const handleSave = () => {
  emit('save', { ...editedProject.value });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.icon-box {
  width: 48px;
  height: 48px;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-close-custom:hover {
  color: #1e293b;
  transform: rotate(90deg);
}

.status-badge {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.status-active { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-pending { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-flagged { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

.tech-tag {
  background: white;
  color: #64748b;
}

.xx-small {
  font-size: 0.65rem;
}

.management-section {
  border: 1px solid #e2e8f0;
}

textarea:focus, input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  background-color: white !important;
}

.btn-primary {
  background-color: #8b5cf6;
  border: none;
}

.btn-primary:hover {
  background-color: #7c3aed;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

.animate__animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.animate__faster {
  animation-duration: 0.2s;
}
</style>
