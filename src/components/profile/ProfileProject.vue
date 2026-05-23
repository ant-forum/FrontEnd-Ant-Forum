<script setup>
import { defineProps } from "vue";

const props = defineProps({
  projects: { type: Array, required: true }
});
</script>

<template>
  <div>
    <div class="dashboard-card-modern p-4 mb-4">
      <h4 class="fw-bold mb-2 header-title">My Projects</h4>
      <p class="text-muted mb-0 subtitle-text">Showcase of web application architectures, system designs, and microservices.</p>
    </div>
    
    <div class="row g-4">
      <div v-for="project in projects" :key="project.title" class="col-md-6 col-lg-4">
        <div class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="fw-bold mb-0 text-dark project-title-v2">{{ project.title }}</h6>
              <span class="d-flex align-items-center gap-1 text-muted small"><i class="bi bi-star-fill text-warning"></i> {{ project.stars }}</span>
            </div>
            <p class="text-muted small mb-4 line-clamp-3">
              {{ project.desc }}
            </p>
          </div>
          
          <div class="d-flex flex-wrap gap-2">
            <span v-for="tag in project.tags" :key="tag" class="tag-badge-v2" :class="tag.toLowerCase()">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-modern {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
}

.header-title {
  color: #0f172a;
  letter-spacing: -0.5px;
}

.subtitle-text {
  font-size: 0.92rem;
}

.project-card-modern-v2 {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.02);
}

.project-card-modern-v2:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(124, 58, 237, 0.3);
}

.project-title-v2 {
  font-size: 0.95rem;
  transition: color var(--transition-base);
}

.project-card-modern-v2:hover .project-title-v2 {
  color: #7c3aed !important;
}

.tag-badge-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-badge-v2.react { background: #e0f2fe; color: #0369a1; }
.tag-badge-v2.webgpu { background: #fdf2f8; color: #be185d; }
.tag-badge-v2.typescript { background: #eff6ff; color: #1d4ed8; }
.tag-badge-v2.go { background: #ecfeff; color: #0891b2; }
.tag-badge-v2.redis { background: #fef2f2; color: #dc2626; }
.tag-badge-v2.grpc { background: #f5f3ff; color: #6d28d9; }
.tag-badge-v2.node\.js { background: #f0fdf4; color: #166534; }
.tag-badge-v2.graphql { background: #fff1f2; color: #be123c; }
.tag-badge-v2.tailwind { background: #ecfeff; color: #0369a1; }
.tag-badge-v2.storybook { background: #fff7ed; color: #c2410c; }

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
