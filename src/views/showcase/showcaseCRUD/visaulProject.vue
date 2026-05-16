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
          <div class="upload-section-card p-4 rounded-4 bg-white border mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-palette text-primary"></i>
              <h6 class="fw-bold mb-0">Project Branding</h6>
            </div>
            
            <div class="d-flex flex-column flex-md-row gap-4 align-items-center">
              <div class="upload-box-square-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4">
                <div class="upload-icon-circle mb-2">
                  <i class="bi bi-image"></i>
                </div>
                <span class="xx-small fw-bold text-muted text-uppercase">Upload Logo</span>
              </div>
              <div class="requirements-list flex-grow-1">
                <div class="fw-bold small mb-2 text-dark">Branding Requirements</div>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="requirement-pill d-flex align-items-center gap-2">
                      <i class="bi bi-aspect-ratio text-primary"></i>
                      <span>1:1 Square</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="requirement-pill d-flex align-items-center gap-2">
                      <i class="bi bi-file-earmark-image text-primary"></i>
                      <span>PNG/SVG</span>
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
          <div class="upload-section-card p-4 rounded-4 bg-white border mb-4 shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-camera-video text-primary"></i>
              <h6 class="fw-bold mb-0">Gallery & Media</h6>
            </div>
            <p class="text-muted x-small mb-4">Showcase your project's best features with high-res screenshots.</p>
            
            <div class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 py-5">
              <div class="drop-icon-animated mb-3">
                <i class="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <h6 class="fw-bold mb-1">Drag & Drop Screenshots</h6>
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
              <h6 class="fw-bold mb-0">Social & OG Assets <span class="text-muted fw-normal small">(Optional)</span></h6>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="social-upload-card p-4 rounded-4 bg-white border h-100 shadow-sm transition-up">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="fw-bold small">Banner Image</div>
                    <i class="bi bi-info-circle text-muted x-small"></i>
                  </div>
                  <div class="asset-preview-placeholder rounded-3 mb-3 d-flex align-items-center justify-content-center">
                    <i class="bi bi-image text-muted opacity-25 fs-2"></i>
                  </div>
                  <p class="text-muted xx-small mb-3">1200×400px • Ideal for headers</p>
                  <button class="btn btn-light-modern w-100 rounded-pill py-2 small fw-bold">
                    <i class="bi bi-upload me-2"></i> Upload Banner
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <div class="social-upload-card p-4 rounded-4 bg-white border h-100 shadow-sm transition-up">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="fw-bold small">Social Card (OG)</div>
                    <i class="bi bi-info-circle text-muted x-small"></i>
                  </div>
                  <div class="asset-preview-placeholder rounded-3 mb-3 d-flex align-items-center justify-content-center">
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
          <div class="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
            <button @click="handleBack" class="btn btn-link-custom text-decoration-none fw-bold p-0">
              <i class="bi bi-chevron-left me-1"></i> Back to Project Info
            </button>
            <button @click="handleContinue" class="btn btn-primary-modern rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2">
              Continue to Review <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-white sticky-top" style="top: 100px;">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-lightbulb text-primary"></i>
              <h6 class="fw-bold mb-0 text-dark">Pro Tips</h6>
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
.visual-assets-page {
  background-color: #f8fafc;
  color: #1e293b;
}

/* Stepper Modern (Shared with Step 1) */
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

/* Upload Modern Elements */
.border-dashed-modern {
  border: 2px dashed #e2e8f0;
  transition: all 0.2s ease;
}

.upload-box-square-modern {
  width: 140px;
  height: 140px;
  background-color: #f8fafc;
  cursor: pointer;
}

.upload-box-square-modern:hover {
  background-color: #f1f5f9;
  border-color: #6366f1;
  transform: translateY(-2px);
}

.upload-icon-circle {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.requirement-pill {
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.screenshot-dropzone-modern {
  background-color: #fcfdfe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.screenshot-dropzone-modern:hover {
  background-color: #f8fafc;
  border-color: #6366f1;
}

.drop-icon-animated {
  font-size: 3rem;
  color: #6366f1;
  transition: transform 0.3s ease;
}

.screenshot-dropzone-modern:hover .drop-icon-animated {
  transform: translateY(-5px);
}

.asset-preview-placeholder {
  aspect-ratio: 16 / 9;
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
}

.btn-light-modern {
  background: #f1f5f9;
  color: #475569;
  border: none;
  transition: all 0.2s;
}

.btn-light-modern:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-primary-modern {
  background: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.2);
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

.x-small { font-size: 0.85rem; }
.xx-small { font-size: 0.75rem; }

@media (max-width: 991px) {
  .step-modern-line { display: none; }
  .step-modern-name { display: none; }
}
</style>
