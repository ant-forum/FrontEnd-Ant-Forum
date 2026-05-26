<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "../../../components/layouts/header.vue";

const router = useRouter();
const currentStep = ref(2);

const handleBack = () => {
  router.push('/showcase/create');
};

const handleContinue = () => {
  router.push('/showcase/create/review');
};
</script>

<template>
  <div class="visual-assets-page min-vh-100 d-flex flex-column">
    <Navbar />

    <main class="container py-4 flex-grow-1">
      <div class="row g-4">
        <!-- Header & Stepper -->
        <div class="col-12">
          <div class="mb-4">
            <h1 class="fw-bold h2 mb-2">Project Assets</h1>
            <p class="text-muted">Upload high-quality visual materials to make your project stand out in the showcase.</p>
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
              <div class="step-modern-item active current">
                <div class="step-modern-circle">2</div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step 2</span>
                  <span class="step-modern-name">Assets</span>
                </div>
                <div class="step-modern-line"></div>
              </div>
              <div class="step-modern-item">
                <div class="step-modern-circle">3</div>
                <div class="step-modern-content">
                  <span class="step-modern-label">Step 3</span>
                  <span class="step-modern-name">Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Upload Section -->
        <div class="col-lg-8">
          <!-- Project Branding -->
          <div class="upload-section-card p-4 rounded-4 bg-surface border mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-palette text-primary"></i>
              <h6 class="fw-bold mb-0 text-adaptive">Project Branding</h6>
            </div>
            
            <div class="d-flex flex-column flex-md-row gap-4 align-items-center">
              <div class="upload-box-square-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 bg-surface-hover">
                <div class="upload-icon-circle mb-2">
                  <i class="bi bi-image"></i>
                </div>
                <span class="xx-small fw-bold text-muted text-uppercase">Upload Logo</span>
              </div>
              <div class="requirements-list flex-grow-1">
                <div class="fw-bold small mb-2 text-adaptive">Branding Requirements</div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="requirement-pill d-flex align-items-center gap-2">
                      <i class="bi bi-aspect-ratio text-primary"></i>
                      <span class="text-adaptive">1:1 Square</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="requirement-pill d-flex align-items-center gap-2">
                      <i class="bi bi-file-earmark-image text-primary"></i>
                      <span class="text-adaptive">PNG/SVG</span>
                    </div>
                  </div>
                  <div class="col-12 mt-3">
                    <p class="text-muted xx-small mb-0 lh-sm">High-quality vector logos are preferred for better scaling across different screen sizes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Media & Screenshots -->
          <div class="upload-section-card p-4 rounded-4 bg-surface border mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-camera-video text-primary"></i>
              <h6 class="fw-bold mb-0 text-adaptive">Gallery & Media</h6>
            </div>
            <p class="text-muted x-small mb-4">Showcase your project's best features with high-res screenshots.</p>
            
            <div class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 py-5 bg-surface-hover">
              <div class="drop-icon-animated mb-3">
                <i class="bi bi-cloud-arrow-up-fill text-primary"></i>
              </div>
              <h6 class="fw-bold mb-1 text-adaptive">Drag & Drop Screenshots</h6>
              <p class="text-muted x-small mb-4">Support for PNG, JPG and WEBP up to 5MB</p>
              <button class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold small">
                Browse Files
              </button>
            </div>
          </div>

          <!-- Social Assets -->
          <div class="mb-4">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-share text-primary"></i>
              <h6 class="fw-bold mb-0 text-adaptive">Social & OG Assets <span class="text-muted fw-normal small">(Optional)</span></h6>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="social-upload-card p-4 rounded-4 bg-surface border h-100 shadow-sm transition-up">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="fw-bold small text-adaptive">Banner Image</div>
                    <i class="bi bi-info-circle text-muted x-small"></i>
                  </div>
                  <div class="asset-preview-placeholder rounded-3 mb-3 d-flex align-items-center justify-content-center bg-surface-hover border">
                    <i class="bi bi-image text-muted opacity-25 fs-2"></i>
                  </div>
                  <p class="text-muted xx-small mb-3">1200×400px • Ideal for headers</p>
                  <button class="btn btn-light-modern w-100 rounded-pill py-2 small fw-bold">
                    <i class="bi bi-upload me-2"></i> Upload Banner
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="social-upload-card p-4 rounded-4 bg-surface border h-100 shadow-sm transition-up">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="fw-bold small text-adaptive">Social Card (OG)</div>
                    <i class="bi bi-info-circle text-muted x-small"></i>
                  </div>
                  <div class="asset-preview-placeholder rounded-3 mb-3 d-flex align-items-center justify-content-center bg-surface-hover border">
                    <i class="bi bi-share text-muted opacity-25 fs-2"></i>
                  </div>
                  <p class="text-muted xx-small mb-3">1200×630px • Link previews</p>
                  <button class="btn btn-light-modern w-100 rounded-pill py-2 small fw-bold">
                    <i class="bi bi-upload me-2"></i> Upload OG Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top-theme">
            <button @click="handleBack" class="btn btn-link-custom text-decoration-none fw-bold p-0">
              <i class="bi bi-chevron-left me-1"></i> Back to Project Info
            </button>
            <button @click="handleContinue" class="btn btn-primary-modern rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 shadow-sm">
              Continue to Review <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-surface border sticky-top" style="top: 100px;">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-lightbulb text-primary"></i>
              <h6 class="fw-bold mb-0 text-adaptive">Pro Tips</h6>
            </div>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
              <li class="d-flex gap-3">
                <div class="text-primary"><i class="bi bi-stars"></i></div>
                <p class="text-muted x-small mb-0">Use dark-mode screenshots if your project has a dark UI theme.</p>
              </li>
              <li class="d-flex gap-3">
                <div class="text-primary"><i class="bi bi-aspect-ratio"></i></div>
                <p class="text-muted x-small mb-0">Ensure screenshots are high resolution (min 1920x1080).</p>
              </li>
              <li class="d-flex gap-3">
                <div class="text-primary"><i class="bi bi-palette"></i></div>
                <p class="text-muted x-small mb-0">Your logo should be legible on both light and dark backgrounds.</p>
              </li>
            </ul>
            <div class="mt-5 pt-4 border-top-theme">
              <p class="text-muted small mb-0">
                Need help? <a href="#" class="text-primary text-decoration-none fw-semibold">Read the docs</a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container-fluid py-4 px-lg-5 border-top-theme bg-surface">
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
.visual-assets-page {
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* Stepper Modern (Shared) */
.stepper-modern {
  background: var(--color-surface);
  padding: 24px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
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
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid var(--color-border);
}

.step-modern-item.active .step-modern-circle {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 10px 15px -3px var(--color-primary-light);
}

.step-modern-item.current .step-modern-circle {
  border-color: var(--color-primary);
  background: var(--color-surface);
  color: var(--color-primary);
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
  color: var(--color-text-muted);
}

.step-modern-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.step-modern-item.active .step-modern-name {
  color: var(--color-text);
}

.step-modern-line {
  flex-grow: 1;
  height: 2px;
  background: var(--color-border);
  margin: 0 20px;
}

.step-modern-item.active .step-modern-line {
  background: var(--color-primary-light);
}

/* Upload Elements Modern */
.upload-section-card {
  background: var(--color-surface);
}

.upload-box-square-modern {
  width: 140px;
  height: 140px;
  border: 2px dashed var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-box-square-modern:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.upload-icon-circle {
  width: 48px;
  height: 48px;
  background: var(--color-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.border-dashed-modern {
  border-style: dashed !important;
}

.requirement-pill {
  padding: 6px 12px;
  background: var(--color-surface-hover);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.screenshot-dropzone-modern {
  border: 2px dashed var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.screenshot-dropzone-modern:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.drop-icon-animated {
  font-size: 2.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.asset-preview-placeholder {
  height: 120px;
  background: var(--color-surface-hover);
}

/* Sidebar & Cards */
.social-upload-card {
  background: var(--color-surface);
}

.transition-up {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transition-up:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg) !important;
}

/* Buttons */
.btn-primary-modern {
  background: var(--color-primary);
  color: white;
  border: none;
  box-shadow: 0 4px 14px 0 var(--color-primary-light);
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--color-primary-light);
}

.btn-light-modern {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.btn-light-modern:hover {
  background: var(--color-border-soft);
  border-color: var(--color-primary);
}

.btn-link-custom {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: color 0.2s;
}

.btn-link-custom:hover {
  color: var(--color-primary);
}

.xx-small { font-size: 0.75rem; }
.x-small { font-size: 0.85rem; }

.bg-surface { background-color: var(--color-surface) !important; }
.border-top-theme { border-top: 1px solid var(--color-border) !important; }
.text-adaptive { color: var(--color-text) !important; }

@media (max-width: 991px) {
  .step-modern-line { display: none; }
  .step-modern-name { display: none; }
}
</style>
