<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';
import { useProjectStore } from '../../stores/ProjectStore.js';
import { useAuthStore } from '../../stores/AuthStore.js';
import { useToast } from '../../composables/useToast.js';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);

const project = computed(() => projectStore.project || {
  id: null,
  title: 'Loading...',
  description: '',
  longDescription: '',
  lead: '',
  leadAvatar: '',
  tags: [],
  stats: { stars: '0', forks: '0', contributors: '0' }
});

const formattedDemoLink = computed(() => {
  const link = project.value.link;
  if (!link) return "";
  if (/^https?:\/\//i.test(link)) {
    return link;
  }
  return `http://${link}`;
});

const technicalSpecs = computed(() => [
  { label: 'Frontend', value: 'Vue 3, Pinia' },
  { label: 'Tags', value: project.value.tags?.join(', ') || 'N/A' },
  { label: 'Link', value: project.value.link || 'Not provided' },
  { label: 'Created At', value: new Date(project.value.createdAt).toLocaleDateString() || 'N/A' }
]);

const isOwner = computed(() => {
  if (!authStore.user || !project.value || !project.value.author) return false;
  const loggedInUser = (authStore.user.username || authStore.user.name || "").toLowerCase().replace('@', '').trim();
  const projectAuthor = (project.value.author.username || project.value.author.name || "").toLowerCase().replace('@', '').trim();
  return loggedInUser && projectAuthor && loggedInUser === projectAuthor;
});

const deleting = ref(false);
const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
    return;
  }
  deleting.value = true;
  try {
    const projectId = route.params.id;
    await projectStore.deleteProject(projectId);
    toast.success("Project deleted successfully!");
    router.push('/showcase');
  } catch (err) {
    console.error("Failed to delete project:", err);
    toast.error("Failed to delete project. Please try again.");
  } finally {
    deleting.value = false;
  }
};

const isTeacher = computed(() => {
  return authStore.user?.role?.toLowerCase() === 'teacher';
});

const submittingRating = ref(false);
const currentTeacherRating = computed(() => project.value.my_rating || 0);

const submitTeacherRating = async (rating) => {
  submittingRating.value = true;
  try {
    const projectId = route.params.id;
    if (project.value.my_rating) {
      await projectStore.updateRateProject(projectId, rating);
      toast.success("Project rating updated successfully!");
    } else {
      await projectStore.rateProject(projectId, rating);
      toast.success("Project rated successfully!");
    }
  } catch (err) {
    console.error("Failed to submit rating:", err);
    toast.error("Failed to submit rating. Please try again.");
  } finally {
    submittingRating.value = false;
  }
};

onMounted(async () => {
  const projectId = route.params.id;
  if (projectId) {
    await projectStore.fetchProject(projectId);
  }
  loading.value = false;
});
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

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Loading project details...</p>
      </div>

      <template v-else>
        <!-- Project Header -->
        <section class="project-header mb-5">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="project-icon bg-primary-light text-primary rounded-4 d-flex align-items-center justify-content-center">
              <i class="bi bi-layers-fill fs-2"></i>
            </div>
            <h1 class="fw-bold mb-0 text-adaptive">{{ project.title }}</h1>
          </div>
          <p class="lead text-muted mb-4">{{ project.description }}</p>
          
          <div class="d-flex flex-wrap gap-2 mb-4">
            <span v-for="tag in project.tags" :key="tag" class="minimal-tag">{{ tag }}</span>
          </div>

          <div class="d-flex gap-3 align-items-center">
            <a v-if="project.link" :href="formattedDemoLink" target="_blank" class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm">Live Demo</a>
            <button v-else class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm" disabled>No Demo</button>
            <router-link v-if="isOwner" :to="`/showcase/edit/${project.id}`" class="btn btn-outline-adaptive rounded-pill px-4 py-2 fw-bold shadow-sm">
              <i class="bi bi-pencil-square me-1"></i> Edit Project
            </router-link>
            <button v-if="isOwner" @click="handleDelete" :disabled="deleting" class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold shadow-sm">
              <span v-if="deleting" class="spinner-border spinner-border-sm" role="status"></span>
              <span v-else><i class="bi bi-trash3 me-1"></i> Delete Project</span>
            </button>
          </div>
        </section>

        <!-- Main Image/Visual -->
        <section class="project-visual mb-5">
          <img v-if="project.thumbnail" :src="project.thumbnail" :alt="project.title" class="visual-placeholder rounded-5 object-cover w-100 border">
          <div v-else class="visual-placeholder rounded-5 bg-surface-hover border d-flex align-items-center justify-content-center">
            <i class="bi bi-image text-muted opacity-25 fs-1"></i>
          </div>
        </section>

        <!-- About Section -->
        <section class="project-about mb-5">
          <h4 class="fw-bold mb-3 text-adaptive">About the Project</h4>
          <p class="text-muted lh-lg">{{ project.description }}</p>
        </section>

        <!-- Teacher Rating Section -->
        <section v-if="isTeacher" class="teacher-rating-section p-4 rounded-4 bg-surface border mb-5 shadow-sm">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-star-fill text-warning"></i>
            <h5 class="fw-bold mb-0 text-adaptive">Teacher Assessment</h5>
          </div>
          <p class="text-muted small mb-3">
            As a teacher, you can rate this project's implementation and design.
          </p>
          
          <div class="d-flex align-items-center gap-3">
            <div class="rating-stars d-flex gap-2 fs-3">
              <i 
                v-for="star in 5" 
                :key="star" 
                class="bi text-warning"
                :class="star <= currentTeacherRating ? 'bi-star-fill' : 'bi-star'"
                style="cursor: pointer;"
                @click="submitTeacherRating(star)"
              ></i>
            </div>
            <span v-if="submittingRating" class="spinner-border spinner-border-sm text-primary" role="status"></span>
            <span v-else-if="project.my_rating" class="text-success small fw-semibold">
              Your rating: {{ project.my_rating }} / 5 stars (Click star to update)
            </span>
            <span v-else class="text-muted small">
              You haven't rated this project yet.
            </span>
          </div>
        </section>

        <!-- Details Grid -->
        <section class="project-details row g-4 mb-5">
          <div class="col-md-6">
            <h5 class="fw-bold mb-3 small text-uppercase tracking-wider text-adaptive">Project Details</h5>
            <div class="d-flex flex-column gap-2">
              <div v-for="spec in technicalSpecs" :key="spec.label" class="d-flex justify-content-between border-bottom-theme pb-2">
                <span class="text-muted small">{{ spec.label }}</span>
                <span class="fw-semibold small text-adaptive">{{ spec.value }}</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <h5 class="fw-bold mb-3 small text-uppercase tracking-wider text-adaptive">Project Stats</h5>
            <div class="row g-3">
              <div class="col-4">
                <div class="text-center p-3 rounded-4 bg-surface-hover border">
                  <div class="fw-bold h5 mb-0 text-adaptive">{{ project.average_rating?.toFixed(1) || '0.0' }}</div>
                  <div class="text-muted xx-small text-uppercase">rating</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center p-3 rounded-4 bg-surface-hover border">
                  <div class="fw-bold h5 mb-0 text-adaptive">{{ project.views || '0' }}</div>
                  <div class="text-muted xx-small text-uppercase">views</div>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center p-3 rounded-4 bg-surface-hover border">
                  <div class="fw-bold h5 mb-0 text-adaptive">{{ project.tags?.length || '0' }}</div>
                  <div class="text-muted xx-small text-uppercase">tags</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Author Section -->
        <section v-if="project.author" class="project-lead pt-5 border-top-theme">
          <div class="d-flex align-items-center gap-3">
            <img :src="project.author.avatar" class="rounded-circle border border-2 border-surface shadow-sm" width="56" height="56" alt="Author">
            <div>
              <div class="text-muted xx-small text-uppercase fw-bold">Project Author</div>
              <div class="fw-bold text-adaptive">{{ project.author.name }}</div>
              <div class="text-muted small">{{ project.author.username }}</div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
.minimal-detail-page {
  min-height: 100vh;
  color: var(--color-text);
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
  color: var(--color-purple);
  background: var(--color-purple-light);
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

.border-bottom-theme {
  border-bottom: 1px solid var(--color-border) !important;
}

.border-top-theme {
  border-top: 1px solid var(--color-border) !important;
}

.text-adaptive {
  color: var(--color-text) !important;
}

.btn-outline-adaptive {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.btn-outline-adaptive:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .visual-placeholder {
    height: 250px;
  }
}
</style>
