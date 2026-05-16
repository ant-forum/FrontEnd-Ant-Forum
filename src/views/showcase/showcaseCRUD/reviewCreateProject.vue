<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "../../../components/layouts/header.vue";

const router = useRouter();
const currentStep = ref(3);

const projectData = reactive({
  projectName: 'Nexus Analytics Dashboard',
  tagline: 'A high-performance data visualization engine built for real-time tracking.',
  description: 'Nexus Analytics provides sub-50ms telemetry ingestion and real-time visualization of high-cardinality datasets. It includes a modular dashboard system, automated reporting, and deep integration with existing CI/CD pipelines.',
  repositoryUrl: 'github.com/ant-ecosystem/nexus-analytics',
  liveDemoUrl: 'nexus-analytics.demo.io',
  assets: {
    logo: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=200',
    banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    ogImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1200',
    screenshots: [
      { id: 1, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400' },
      { id: 2, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400' },
      { id: 3, url: 'https://images.unsplash.com/photo-1504868584819-f8e905b6cbe7?auto=format&fit=crop&q=80&w=400' }
    ]
  }
});

const checklist = [
  { id: 1, label: 'Technical Accuracy', desc: 'All links and repository details are correct.', status: true },
  { id: 2, label: 'Asset Quality', desc: 'Images meet the minimum resolution requirements.', status: true },
  { id: 3, label: 'Community Guidelines', desc: 'Content adheres to the ANT-Forum code of conduct.', status: true }
];

const agreeToTerms = ref(false);

const handleBack = () => {
  router.push('/showcase/create/assets');
};

const handleSubmit = () => {
  if (agreeToTerms.value) {
    console.log('Project Submitted Successfully!', projectData);
    alert('Project submitted for review!');
  } else {
    alert('Please agree to the terms and conditions.');
  }
};
</script>

<template>
  <div class="review-project-page min-vh-100 d-flex flex-column">
    <Navbar />

    <main class="container py-4 flex-grow-1">
      <div class="row g-4">
        <!-- Header & Stepper -->
        <div class="col-12">
          <div class="mb-4">
            <h1 class="fw-bold h2 mb-2">Final Review</h1>
            <p class="text-muted">Almost there! Please double-check all information before submitting your project.</p>
          </div>

          <div class="stepper-modern mb-5">
            <div class="d-flex align-items-center justify-content-between">
              <div class="step-modern-item active">
                <div class="step-modern-circle">
                  <i class="bi bi-check-lg"></i>
                </div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step 1</span>
                  <span class="step-modern-name">Project Info</span>
                </div>
                <div class="step-modern-line"></div>
              </div>
              <div class="step-modern-item active">
                <div class="step-modern-circle">
                  <i class="bi bi-check-lg"></i>
                </div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step 2</span>
                  <span class="step-modern-name">Assets</span>
                </div>
                <div class="step-modern-line"></div>
              </div>
              <div class="step-modern-item active current">
                <div class="step-modern-circle">3</div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step 3</span>
                  <span class="step-modern-name">Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Content Section -->
        <div class="col-lg-8">
          <!-- Project Summary Card -->
          <div class="review-section-card p-4 rounded-4 border mb-4 bg-white shadow-sm transition-up">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-info-circle text-primary"></i>
                <h6 class="fw-bold mb-0">Project Identity</h6>
              </div>
              <button @click="router.push('/showcase/create')" class="btn btn-link-custom text-decoration-none small fw-bold p-0">
                <i class="bi bi-pencil-square me-1"></i> Edit
              </button>
            </div>
            
            <div class="d-flex flex-column flex-md-row gap-4 align-items-start mb-4">
              <div class="review-logo-preview-modern rounded-4 overflow-hidden shadow-sm border">
                <img :src="projectData.assets.logo" class="w-100 h-100 object-fit-cover" alt="Logo">
              </div>
              <div class="flex-grow-1">
                <h4 class="fw-bold mb-1 text-dark">{{ projectData.projectName }}</h4>
                <p class="text-primary fw-semibold mb-3">{{ projectData.tagline }}</p>
                <div class="d-flex flex-wrap gap-3">
                  <div class="info-badge-modern">
                    <i class="bi bi-github"></i>
                    <span>{{ projectData.repositoryUrl }}</span>
                  </div>
                  <div class="info-badge-modern">
                    <i class="bi bi-globe"></i>
                    <span>{{ projectData.liveDemoUrl }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="description-review-modern p-3 rounded-3 bg-light-subtle border">
              <label class="xx-small text-uppercase fw-bold text-muted mb-2 d-block tracking-wider">Project Description</label>
              <p class="text-muted small mb-0 lh-lg">{{ projectData.description }}</p>
            </div>
          </div>

          <!-- Visual Assets Review -->
          <div class="review-section-card p-4 rounded-4 border mb-4 bg-white shadow-sm transition-up">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-images text-primary"></i>
                <h6 class="fw-bold mb-0">Visual Presence</h6>
              </div>
              <button @click="router.push('/showcase/create/assets')" class="btn btn-link-custom text-decoration-none small fw-bold p-0">
                <i class="bi bi-pencil-square me-1"></i> Edit
              </button>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="xx-small text-uppercase fw-bold text-muted mb-2 d-block tracking-wider">Project Banner</label>
                <div class="asset-preview-rect-modern rounded-4 overflow-hidden shadow-sm border">
                  <img :src="projectData.assets.banner" class="w-100 h-100 object-fit-cover">
                </div>
              </div>
              <div class="col-md-6">
                <label class="xx-small text-uppercase fw-bold text-muted mb-2 d-block tracking-wider">OG Sharing Card</label>
                <div class="asset-preview-rect-modern rounded-4 overflow-hidden shadow-sm border">
                  <img :src="projectData.assets.ogImage" class="w-100 h-100 object-fit-cover">
                </div>
              </div>
            </div>

            <div>
              <label class="xx-small text-uppercase fw-bold text-muted mb-3 d-block tracking-wider">Feature Gallery ({{ projectData.assets.screenshots.length }})</label>
              <div class="d-flex gap-3 overflow-auto pb-3 screenshot-scroll-modern">
                <div v-for="img in projectData.assets.screenshots" :key="img.id" class="screenshot-preview-modern rounded-3 overflow-hidden shadow-sm border flex-shrink-0">
                  <img :src="img.url" class="w-100 h-100 object-fit-cover">
                </div>
              </div>
            </div>
          </div>

          <!-- Submission Agreement -->
          <div class="agreement-card-modern p-4 rounded-4 border mb-4" :class="{ 'agreed': agreeToTerms }">
            <div class="form-check d-flex gap-3 align-items-center">
              <input class="form-check-input custom-checkbox" type="checkbox" v-model="agreeToTerms" id="termsCheck">
              <label class="form-check-label small text-muted fw-medium lh-sm" for="termsCheck">
                I confirm that I am the owner of this project and agree to the 
                <a href="#" class="text-primary text-decoration-none fw-bold">Developer Terms</a>.
              </label>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
            <button @click="handleBack" class="btn btn-link-custom text-decoration-none fw-bold p-0">
              <i class="bi bi-chevron-left me-1"></i> Back to Assets
            </button>
            <button @click="handleSubmit" 
              :disabled="!agreeToTerms"
              class="btn btn-submit-modern rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 shadow-sm">
              Publish Project <i class="bi bi-rocket-takeoff-fill ms-1"></i>
            </button>
          </div>
        </div>

        <!-- Sidebar Checklist -->
        <aside class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-white sticky-top" style="top: 100px;">
            <div class="d-flex align-items-center gap-2 mb-4 text-success">
              <i class="bi bi-shield-check"></i>
              <h6 class="fw-bold mb-0 text-dark">Ready to Submit?</h6>
            </div>

            <div class="checklist-items d-flex flex-column gap-4">
              <div v-for="item in checklist" :key="item.id" class="checklist-item d-flex gap-3">
                <div class="check-icon-circle text-success bg-success-light">
                  <i class="bi bi-check2"></i>
                </div>
                <div>
                  <div class="fw-bold small mb-1">{{ item.label }}</div>
                  <p class="text-muted xx-small mb-0">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-top">
              <div class="d-flex align-items-center gap-2 text-muted x-small">
                <i class="bi bi-clock-history"></i>
                <span>Review typically takes 2-3 days</span>
              </div>
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
.review-project-page {
  background-color: #f8fafc;
  color: #1e293b;
}

/* Stepper Modern (Shared with Steps 1 & 2) */
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

/* Review Cards Modern */
.review-section-card {
  background: white;
}

.review-logo-preview-modern {
  width: 100px;
  height: 100px;
  background-color: #f8fafc;
}

.info-badge-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
}

.description-review-modern {
  background-color: #f8fafc;
}

.asset-preview-rect-modern {
  aspect-ratio: 16 / 9;
  background-color: #f8fafc;
}

.screenshot-preview-modern {
  width: 180px;
  aspect-ratio: 16 / 10;
  background-color: #f8fafc;
}

.screenshot-scroll-modern::-webkit-scrollbar {
  height: 6px;
}

.screenshot-scroll-modern::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.screenshot-scroll-modern::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Agreement Card */
.agreement-card-modern {
  background: #f8fafc;
  transition: all 0.3s ease;
}

.agreement-card-modern.agreed {
  background: #f0f9ff;
  border-color: #0ea5e9 !important;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
}

/* Sidebar Checklist */
.check-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.bg-success-light {
  background-color: #ecfdf5;
}

/* Buttons */
.btn-submit-modern {
  background: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.btn-submit-modern:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.2);
}

.btn-submit-modern:disabled {
  background-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-link-custom {
  color: #64748b;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.btn-link-custom:hover {
  color: #6366f1;
}

.transition-up {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transition-up:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
}

/* Utility */
.x-small { font-size: 0.85rem; }
.xx-small { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.05em; }

@media (max-width: 991px) {
  .step-modern-line { display: none; }
  .step-modern-name { display: none; }
}
</style>
