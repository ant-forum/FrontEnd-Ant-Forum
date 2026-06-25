<script setup>
import { defineProps } from "vue";

const props = defineProps({
  projects: { type: Array, required: true },
});
</script>

<template>
  <div>
    <div class="dashboard-card-modern p-4 mb-4">
      <h4 class="fw-bold mb-2 header-title themed-text">My Projects</h4>
      <p class="text-muted mb-0 subtitle-text">
        Showcase of web application architectures, system designs, and
        microservices.
      </p>
    </div>

    <div class="row g-4">
      <div
        v-for="project in projects"
        :key="project.title"
        class="col-md-6 col-lg-4"
      >
        <div
          class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between"
        >
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <router-link
                :to="'/showcase/' + project.id"
                class="text-decoration-none"
              >
                <h6 class="fw-bold mb-0 themed-text project-title-v2">
                  {{ project.title }}
                </h6>
              </router-link>
              <span class="d-flex align-items-center gap-1 text-muted small"
                ><i class="bi bi-star-fill text-warning"></i>
                {{ project.stars }}</span
              >
            </div>
            <p class="text-muted small mb-4 line-clamp-3">
              {{ project.desc }}
            </p>
          </div>

          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="tag-badge-v2"
              :class="tag.toLowerCase()"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
      <div v-if="projects.length === 0" class="col-12">
        <div class="empty-projects-card">
          <i class="bi bi-code-square"></i>
          <h5>Your showcase is ready for its first project</h5>
          <p>
            Share what you have built and make it discoverable to the ANT Forum
            community.
          </p>
          <router-link to="/showcase/create">Submit project</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.header-title {
  color: var(--color-text) !important;
  letter-spacing: -0.5px;
}

.themed-text {
  color: var(--color-text) !important;
}

.subtitle-text {
  font-size: 0.92rem;
  color: var(--color-text-muted) !important;
}

.project-card-modern-v2 {
  background: var(--color-surface) !important;
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  color: var(--color-text) !important;
}

.project-card-modern-v2:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-blue-light) !important;
}

.project-title-v2 {
  font-size: 0.95rem;
  transition: color var(--transition-base);
  color: var(--color-text) !important;
}

.project-card-modern-v2:hover .project-title-v2 {
  color: var(--color-blue) !important;
}

.tag-badge-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-badge-v2.react {
  background: var(--color-tag-blue-bg);
  color: var(--color-tag-blue-text);
}
.tag-badge-v2.webgpu {
  background: var(--color-tag-pink-bg);
  color: var(--color-tag-pink-text);
}
.tag-badge-v2.typescript {
  background: var(--color-tag-indigo-bg);
  color: var(--color-tag-indigo-text);
}
.tag-badge-v2.go {
  background: var(--color-tag-cyan-bg);
  color: var(--color-tag-cyan-text);
}
.tag-badge-v2.redis {
  background: var(--color-tag-red-bg);
  color: var(--color-tag-red-text);
}
.tag-badge-v2.grpc {
  background: var(--color-tag-blue-bg);
  color: var(--color-tag-blue-text);
}
.tag-badge-v2.node\.js {
  background: var(--color-tag-green-bg);
  color: var(--color-tag-green-text);
}
.tag-badge-v2.graphql {
  background: var(--color-tag-red-bg);
  color: var(--color-tag-red-text);
}
.tag-badge-v2.tailwind {
  background: var(--color-tag-blue-bg);
  color: var(--color-tag-blue-text);
}
.tag-badge-v2.storybook {
  background: var(--color-tag-amber-bg);
  color: var(--color-tag-amber-text);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-projects-card {
  padding: 36px 24px;
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.empty-projects-card i {
  color: var(--color-blue);
  font-size: 2rem;
}

.empty-projects-card h5 {
  margin: 12px 0 6px;
  color: var(--color-text);
  font-weight: 800;
}

.empty-projects-card p {
  max-width: 520px;
  margin: 0 auto 16px;
  font-size: 0.9rem;
}

.empty-projects-card a {
  display: inline-flex;
  padding: 9px 14px;
  color: #ffffff;
  background: var(--color-blue);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: all var(--transition-base);
}

.empty-projects-card a:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
}
</style>
