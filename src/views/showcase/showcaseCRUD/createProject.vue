<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "../../../components/layouts/header.vue";

const router = useRouter();
const currentStep = ref(1);

const steps = [
  { id: 1, name: 'Project Info' },
  { id: 2, name: 'Assets' },
  { id: 3, name: 'Review' }
];

const form = reactive({
  projectName: '',
  tagline: '',
  description: '',
  repositoryUrl: '',
  liveDemoUrl: ''
});

const guidelines = [
  { title: 'Technical Accuracy', desc: 'Ensure all repository and demo links are functional and public.', icon: 'bi-check-circle' },
  { title: 'Clear Documentation', desc: 'A well-written description helps other developers understand your work.', icon: 'bi-file-text' },
  { title: 'Visual Impact', desc: 'Use high-quality logos and screenshots in the next step.', icon: 'bi-image' }
];

const handleContinue = () => {
  router.push('/showcase/create/assets');
};
</script>

<template>
  <div class="create-project-page min-vh-100 d-flex flex-column">
    <Navbar />

    <main class="container py-4 flex-grow-1">
      <div class="row g-4">
        <!-- Header & Stepper -->
        <div class="col-12">
          <div class="mb-4">
            <h1 class="fw-bold h2 mb-2">Create New Project</h1>
            <p class="text-muted">Submit your work to the ANT-Forum ecosystem. Ensure all technical details are accurate.</p>
          </div>

          <div class="stepper-modern mb-5">
            <div class="d-flex align-items-center justify-content-between">
              <div v-for="(step, index) in steps" :key="step.id" class="step-modern-item" :class="{ 'active': currentStep >= step.id, 'current': currentStep === step.id }">
                <div class="step-modern-circle">
                  <i v-if="currentStep > step.id" class="bi bi-check-lg"></i>
                  <span v-else>{{ step.id }}</span>
                </div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step {{ step.id }}</span>
                  <span class="step-modern-name">{{ step.name }}</span>
                </div>
                <div v-if="index < steps.length - 1" class="step-modern-line"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-5 p-4 p-lg-5 bg-white">
            <form @submit.prevent="handleContinue">
              <!-- Basic Information -->
              <section class="mb-5">
                <div class="section-header d-flex align-items-center gap-3 mb-4">
                  <div class="section-icon bg-primary-subtle text-primary rounded-3">
                    <i class="bi bi-info-circle"></i>
                  </div>
                  <h5 class="fw-bold mb-0">Basic Information</h5>
                </div>
                
                <div class="form-group-custom mb-4">
                  <label class="form-label-custom">Project Name</label>
                  <div class="input-wrapper">
                    <i class="bi bi-rocket-takeoff input-icon"></i>
                    <input type="text" v-model="form.projectName" class="form-control-modern" placeholder="e.g., Nexus Core Engine">
                  </div>
                  <div class="form-text small opacity-75 mt-2">A unique and memorable name for your project.</div>
                </div>

                <div class="form-group-custom mb-4">
                  <label class="form-label-custom">Tagline</label>
                  <div class="input-wrapper">
                    <i class="bi bi-lightning-charge input-icon"></i>
                    <input type="text" v-model="form.tagline" class="form-control-modern" placeholder="A brief description of what your project does">
                  </div>
                </div>

                <div class="form-group-custom mb-4">
                  <label class="form-label-custom">Full Description</label>
                  <textarea v-model="form.description" class="form-control-modern py-3" rows="6" placeholder="Detail the problem it solves and its main features..."></textarea>
                  <div class="d-flex justify-content-between mt-2">
                    <div class="form-text small opacity-75">Markdown is supported.</div>
                    <div class="form-text small opacity-75">{{ form.description.length }} / 2000</div>
                  </div>
                </div>
              </section>

              <!-- Repository Integration -->
              <section class="mb-5">
                <div class="section-header d-flex align-items-center gap-3 mb-4">
                  <div class="section-icon bg-indigo-subtle text-indigo rounded-3">
                    <i class="bi bi-code-slash"></i>
                  </div>
                  <h5 class="fw-bold mb-0">Links & Resources</h5>
                </div>

                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group-custom">
                      <label class="form-label-custom">Repository URL</label>
                      <div class="input-group-modern">
                        <span class="prefix">https://</span>
                        <input type="text" v-model="form.repositoryUrl" class="form-control-modern" placeholder="github.com/user/repo">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group-custom">
                      <label class="form-label-custom">Live Demo URL</label>
                      <div class="input-group-modern">
                        <span class="prefix">https://</span>
                        <input type="text" v-model="form.liveDemoUrl" class="form-control-modern" placeholder="yourproject.com">
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Form Actions -->
              <div class="d-flex justify-content-end align-items-center gap-4 mt-5 pt-4 border-top">
                <button type="button" class="btn btn-link text-decoration-none fw-bold text-primary">Save Draft</button>
                <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2">
                  Continue <i class="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-white sticky-top" style="top: 100px;">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-shield-check text-primary"></i>
              <h6 class="fw-bold mb-0 text-dark">Submission Guidelines</h6>
            </div>

            <div class="guidelines-list d-flex flex-column gap-4">
              <div v-for="item in guidelines" :key="item.title" class="guideline-item d-flex gap-3">
                <div class="check-icon text-primary">
                  <i :class="['bi', item.icon]"></i>
                </div>
                <div>
                  <div class="fw-bold small mb-1">{{ item.title }}</div>
                  <p class="text-muted x-small mb-0">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-top">
              <p class="text-muted small mb-0">
                Need help? <a href="#" class="text-primary text-decoration-none fw-semibold">Read the docs</a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container-fluid py-4 px-lg-5 border-top bg-white">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div class="text-muted small fw-bold">© 2024 ANT-Forum Ecosystem. Built for developers.</div>
        <div class="footer-links d-flex gap-4">
          <a href="#" class="text-muted text-decoration-none small fw-bold">Privacy</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">Terms</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">API Status</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">GitHub</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">Changelog</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.create-project-page {
  background-color: #f8fafc;
  color: #1e293b;
}

/* Modern Stepper */
.stepper-modern {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.step-modern-item {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  flex: 1;
}

.step-modern-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.step-modern-item.active .step-modern-circle {
  background: #6366f1;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
}

.step-modern-item.current .step-modern-circle {
  border-color: #6366f1;
  background: white;
  color: #6366f1;
}

.step-modern-content {
  display: flex;
  flex-direction: column;
}

.step-modern-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.step-modern-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
}

.step-modern-item.active .step-modern-name {
  color: #1e293b;
}

.step-modern-line {
  flex-grow: 1;
  height: 2px;
  background: #f1f5f9;
  margin: 0 20px;
}

.step-modern-item.active .step-modern-line {
  background: #e2e8f0;
}

/* Modern Form Elements */
.section-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.form-label-custom {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  pointer-events: none;
  transition: color 0.2s;
}

.form-control-modern {
  width: 100%;
  padding: 12px 16px;
  padding-left: 48px;
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s;
}

textarea.form-control-modern {
  padding-left: 16px;
}

.form-control-modern:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
}

.form-control-modern:focus + .input-icon {
  color: #6366f1;
}

.input-group-modern {
  display: flex;
  align-items: center;
}

.input-group-modern .prefix {
  padding: 12px 16px;
  background: #f8fafc;
  border: 2px solid #f1f5f9;
  border-right: none;
  border-radius: 12px 0 0 12px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
}

.input-group-modern .form-control-modern {
  border-radius: 0 12px 12px 0;
  padding-left: 16px;
}

.bg-indigo-subtle { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }

.btn-primary {
  background: #6366f1;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.23);
}

@media (max-width: 991px) {
  .step-modern-line { display: none; }
  .step-modern-name { display: none; }
}
</style>
