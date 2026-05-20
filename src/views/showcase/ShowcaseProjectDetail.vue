<script setup>
import { ref } from 'vue';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';

const project = ref({
  id: 1,
  title: 'Nexus Analytics',
  description: 'Real-time telemetry and visualization engine for enterprise-scale data.',
  longDescription: 'Nexus Analytics is a high-performance framework designed for sub-50ms telemetry ingestion and real-time visualization of high-cardinality datasets. It provides engineers with deep insights into system performance through an intuitive and responsive interface.',
  lead: 'Sarah Jenkins',
  leadAvatar: 'https://i.pravatar.cc/150?u=sarah',
  tags: ['VUE.JS', 'D3.JS', 'TYPESCRIPT', 'POSTGRESQL'],
  stats: {
    stars: '1.2k',
    forks: '342',
    contributors: '12'
  }
});

const technicalSpecs = [
  { label: 'Frontend', value: 'Vue 3, Pinia' },
  { label: 'Visualization', value: 'D3.js, Three.js' },
  { label: 'Database', value: 'PostgreSQL' },
  { label: 'Infrastructure', value: 'AWS EKS' }
];
</script>

<template>
  <div class="minimal-detail-page">
    <Navbar />

    <main class="container py-5 max-width-800">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-5">
        <router-link to="/showcase" class="text-decoration-none text-muted small d-flex align-items-center gap-2">
          <i class="bi bi-arrow-left"></i> Back to Showcase
        </router-link>
      </nav>

      <!-- Project Header -->
      <section class="project-header mb-5">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="project-icon bg-primary-subtle text-primary rounded-4 d-flex align-items-center justify-content-center">
            <i class="bi bi-layers-fill fs-2"></i>
          </div>
          <h1 class="fw-bold mb-0">{{ project.title }}</h1>
        </div>
        <p class="lead text-muted mb-4">{{ project.description }}</p>
        
        <div class="d-flex flex-wrap gap-2 mb-4">
          <span v-for="tag in project.tags" :key="tag" class="minimal-tag">{{ tag }}</span>
        </div>

        <div class="d-flex gap-3">
          <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold">Live Demo</button>
          <button class="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold">Source Code</button>
        </div>
      </section>

      <!-- Main Image/Visual -->
      <section class="project-visual mb-5">
        <div class="visual-placeholder rounded-5 bg-light border d-flex align-items-center justify-content-center">
          <i class="bi bi-image text-muted opacity-25 fs-1"></i>
        </div>
      </section>

      <!-- About Section -->
      <section class="project-about mb-5">
        <h4 class="fw-bold mb-3">About the Project</h4>
        <p class="text-muted lh-lg">{{ project.longDescription }}</p>
      </section>

      <!-- Details Grid -->
      <section class="project-details row g-4 mb-5">
        <div class="col-md-6">
          <h5 class="fw-bold mb-3 small text-uppercase tracking-wider">Technical Stack</h5>
          <div class="d-flex flex-column gap-2">
            <div v-for="spec in technicalSpecs" :key="spec.label" class="d-flex justify-content-between border-bottom pb-2">
              <span class="text-muted small">{{ spec.label }}</span>
              <span class="fw-semibold small">{{ spec.value }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <h5 class="fw-bold mb-3 small text-uppercase tracking-wider">Project Stats</h5>
          <div class="row g-3">
            <div v-for="(val, key) in project.stats" :key="key" class="col-4">
              <div class="text-center p-3 rounded-4 bg-light">
                <div class="fw-bold h5 mb-0">{{ val }}</div>
                <div class="text-muted xx-small text-uppercase">{{ key }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Lead Section -->
      <section class="project-lead pt-5 border-top">
        <div class="d-flex align-items-center gap-3">
          <img :src="project.leadAvatar" class="rounded-circle border border-2 border-white shadow-sm" width="56" height="56" alt="Lead">
          <div>
            <div class="text-muted xx-small text-uppercase fw-bold">Project Lead</div>
            <div class="fw-bold">{{ project.lead }}</div>
          </div>
          <button class="btn btn-sm btn-light rounded-pill px-3 ms-auto fw-bold">Contact</button>
        </div>
      </section>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
.minimal-detail-page {
  min-height: 100vh;
}

.max-width-800 {
  max-width: 800px;
}

.project-icon {
  width: 64px;
  height: 64px;
}

.minimal-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.visual-placeholder {
  height: 400px;
  width: 100%;
}

.xx-small {
  font-size: 0.65rem;
}

.tracking-wider {
  letter-spacing: 0.1em;
}

@media (max-width: 768px) {
  .visual-placeholder {
    height: 250px;
  }
}
</style>
