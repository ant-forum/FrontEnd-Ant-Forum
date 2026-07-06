<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import SkeletonLoader from "../../components/SkeletonLoader.vue";
import { useProjectStore } from "../../stores/ProjectStore.js";
import { useAuthStore } from "../../stores/AuthStore.js";
import { useToast } from "../../composables/useToast.js";
import ReportModal from "../../components/base/ReportModal.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useTagsStore } from "../../stores/TagsStore.js";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const toast = useToast();
const tagsStore = useTagsStore();

const showDeleteConfirmModal = ref(false);

const showReportModal = ref(false);

const loading = ref(true);

const project = computed(
  () =>
    projectStore.project || {
      id: null,
      title: "Loading...",
      description: "",
      longDescription: "",
      lead: "",
      leadAvatar: "",
      tags: [],
      stats: { stars: "0", forks: "0", contributors: "0" },
    },
);

const formattedDemoLink = computed(() => {
  const link = project.value.link;
  if (!link) return "";
  if (/^https?:\/\//i.test(link)) {
    return link;
  }
  return `http://${link}`;
});

const technicalSpecs = computed(() => [
  { label: "Frontend", value: "Vue 3, Pinia" },
  { label: "Tags", value: project.value.tags?.join(", ") || "N/A" },
  { label: "Link", value: project.value.link || "Not provided" },
  {
    label: "Created At",
    value: new Date(project.value.createdAt).toLocaleDateString() || "N/A",
  },
]);

const isOwner = computed(() => {
  if (!authStore.user || !project.value || !project.value.author) return false;
  const loggedInUser = (authStore.user.username || authStore.user.name || "")
    .toLowerCase()
    .replace("@", "")
    .trim();
  const projectAuthor = (
    project.value.author.username ||
    project.value.author.name ||
    ""
  )
    .toLowerCase()
    .replace("@", "")
    .trim();
  return loggedInUser && projectAuthor && loggedInUser === projectAuthor;
});

const deleting = ref(false);
// const hoveredStar = ref(0);

const handleDelete = () => {
  showDeleteConfirmModal.value = true;
};

const confirmDeleteProject = async () => {
  showDeleteConfirmModal.value = false;
  deleting.value = true;
  try {
    const projectId = route.params.id;
    await projectStore.deleteProject(projectId);
    toast.success("Project deleted successfully!");
    router.push("/showcase");
  } catch (err) {
    console.error("Failed to delete project:", err);
    toast.error("Failed to delete project. Please try again.");
  } finally {
    deleting.value = false;
  }
};

const openEditModal = () => {
  router.push(`/showcase/edit/${route.params.id}`);
};

const isTeacher = computed(() => {
  return authStore.user?.role?.toLowerCase() === "teacher";
});

const isTeacherOrAdmin = computed(() => {
  const role = authStore.user?.role?.toLowerCase();
  return role === "teacher" || role === "admin";
});

const submittingRating = ref(false);
const hoveredStar = ref(0);
const currentTeacherRating = computed(() => project.value.my_rating || 0);

const submitTeacherRating = async (rating) => {
  submittingRating.value = true;
  try {
    const projectId = route.params.id;
    await projectStore.submitRating(projectId, rating);
    toast.success("Project rating saved successfully!");
  } catch (err) {
    console.error("Failed to submit rating:", err);
    toast.error("Failed to submit rating. Please try again.");
  } finally {
    submittingRating.value = false;
  }
};

const undoTeacherRating = async () => {
  submittingRating.value = true;
  try {
    const projectId = route.params.id;
    await projectStore.deleteRating(projectId);
    toast.success("Project rating removed!");
  } catch (err) {
    console.error("Failed to undo rating:", err);
    toast.error("Failed to remove rating. Please try again.");
  } finally {
    submittingRating.value = false;
  }
};

const authorProfileId = computed(() => {
  if (!project.value) return "";
  const uId = project.value.user_id || project.value.userId;
  if (uId) return String(uId);
  if (project.value.author?.username) {
    return project.value.author.username.replace("@", "").trim();
  }
  return "";
});

onMounted(async () => {
  const projectId = route.params.id;
  if (projectId) {
    await projectStore.fetchProject(projectId);
    projectStore.incrementProjectView(projectId).catch((err) => {
      console.warn("Failed to increment project view count:", err);
    });
  }
  if (tagsStore.tags.length === 0) {
    await tagsStore.fetchTags().catch((err) => {
      console.warn("Failed to fetch tags:", err);
    });
  }
  loading.value = false;
});
</script>

<template>
  <div class="minimal-detail-page">
    <Navbar />

    <main class="container py-5 project-detail-container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <router-link
          to="/showcase"
          class="back-link d-inline-flex align-items-center gap-2"
        >
          <i class="bi bi-arrow-left"></i> Back to Showcase
        </router-link>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="py-5">
        <div class="row g-4">
          <!-- Left Column Skeleton -->
          <div class="col-lg-8">
            <div class="glass-card mb-4 p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <SkeletonLoader width="64px" height="64px" variant="card" />
                <div class="flex-grow-1">
                  <SkeletonLoader width="60%" height="32px" />
                </div>
              </div>
              <div class="mb-4">
                <SkeletonLoader width="100%" height="24px" class="mb-2" />
                <SkeletonLoader width="80%" height="20px" />
              </div>
            </div>

            <div
              class="glass-card mb-4 p-0 border-0 overflow-hidden"
              style="height: 400px"
            >
              <SkeletonLoader width="100%" height="100%" variant="image" />
            </div>

            <div class="glass-card mb-4 p-4">
              <SkeletonLoader width="150px" height="24px" class="mb-3" />
              <div class="d-flex flex-column gap-2">
                <SkeletonLoader width="100%" height="18px" />
                <SkeletonLoader width="100%" height="18px" />
                <SkeletonLoader width="90%" height="18px" />
              </div>
            </div>
          </div>

          <!-- Right Column Skeleton -->
          <div class="col-lg-4">
            <div class="glass-card mb-4 p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <SkeletonLoader width="52px" height="52px" variant="card" />
                <div class="flex-grow-1">
                  <SkeletonLoader width="60%" height="20px" />
                </div>
              </div>
              <SkeletonLoader width="100%" height="60px" />
            </div>

            <div class="glass-card mb-4 p-4">
              <SkeletonLoader width="120px" height="18px" class="mb-3" />
              <div class="row g-2">
                <div class="col-4">
                  <SkeletonLoader width="100%" height="60px" variant="card" />
                </div>
                <div class="col-4">
                  <SkeletonLoader width="100%" height="60px" variant="card" />
                </div>
                <div class="col-4">
                  <SkeletonLoader width="100%" height="60px" variant="card" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="row g-4">
          <!-- Left Column: Primary Content -->
          <div class="col-lg-8">
            <!-- Project Header Info -->
            <div class="project-card glass-card mb-4">
              <div
                class="d-flex align-items-center gap-4 mb-4 flex-wrap flex-sm-nowrap"
              >
                <div
                  class="project-icon-wrapper bg-primary-light text-primary rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                >
                  <i class="bi bi-layers-fill fs-2"></i>
                </div>
                <div class="flex-grow-1">
                  <h1 class="fw-bold mb-2 text-adaptive project-title">
                    {{ project.title }}
                  </h1>
                  <p class="lead text-muted mb-0 fs-6">
                    {{ project.description }}
                  </p>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="minimal-tag"
                  >{{ tag }}</span
                >
              </div>

              <div class="d-flex gap-3 align-items-center flex-wrap">
                <a
                  v-if="project.link"
                  :href="formattedDemoLink"
                  target="_blank"
                  class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                >
                  <i class="bi bi-box-arrow-up-right"></i> Live Demo
                </a>
                <button
                  v-else
                  class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                  disabled
                >
                  No Demo
                </button>

                <button
                  v-if="isOwner"
                  @click="openEditModal"
                  class="btn btn-outline-adaptive rounded-pill px-4 py-2 fw-bold shadow-sm"
                >
                  <i class="bi bi-pencil-square me-1"></i> Edit Project
                </button>

                <button
                  v-if="isOwner"
                  @click="handleDelete"
                  :disabled="deleting"
                  class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold shadow-sm"
                >
                  <span
                    v-if="deleting"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  <span v-else
                    ><i class="bi bi-trash3 me-1"></i> Delete Project</span
                  >
                </button>

                <button
                  v-if="project.id && !isOwner"
                  @click="showReportModal = true"
                  class="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold shadow-sm"
                >
                  <i class="bi bi-flag me-1"></i> Report Project
                </button>
              </div>
            </div>

            <!-- Cover Visual -->
            <div
              class="project-visual-card glass-card mb-4 overflow-hidden p-0 border-0"
            >
              <img
                v-if="project.thumbnail"
                :src="project.thumbnail"
                :alt="project.title"
                class="visual-img object-cover w-100"
              />
              <div
                v-else
                class="visual-empty-placeholder d-flex align-items-center justify-content-center bg-surface-hover"
              >
                <i class="bi bi-image text-muted opacity-25 fs-1"></i>
              </div>
            </div>

            <!-- About Section -->
            <div class="project-about-card glass-card mb-4">
              <h4 class="fw-bold mb-3 text-adaptive section-subtitle">
                About the Project
              </h4>
              <p
                class="text-muted lh-lg long-desc mb-0"
                style="white-space: pre-line"
              >
                {{ project.longDescription || project.description }}
              </p>
            </div>
          </div>

          <!-- Right Column: Sidebar Widgets -->
          <div class="col-lg-4">
            <div class="sticky-sidebar d-flex flex-column gap-4">
              <!-- Rating Assessment Widget -->
              <div class="rating-widget glass-card">
                <div class="widget-header mb-4">
                  <div class="d-flex align-items-center gap-3">
                    <div
                      class="rating-icon-wrapper d-flex align-items-center justify-content-center"
                    >
                      <i class="bi bi-star-fill text-white fs-5"></i>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="fw-bold mb-0 text-adaptive widget-title">
                        Teacher Rating
                      </h5>
                      <span class="text-muted xx-small"
                        >Evaluation Assessment</span
                      >
                    </div>
                    <div class="rating-score text-end">
                      <span class="score-num text-adaptive fw-bold">{{
                        project.average_rating?.toFixed(1) || "0.0"
                      }}</span>
                      <span class="score-max text-muted">/5</span>
                    </div>
                  </div>
                </div>

                <!-- For Teacher View -->
                <template v-if="isTeacher">
                  <p class="text-muted small mb-3">
                    Rate the project's quality, completeness, and presentation
                    to provide constructive feedback:
                  </p>
                  <div
                    class="stars-container d-flex align-items-center gap-2 mb-3"
                  >
                    <i
                      v-for="star in 5"
                      :key="star"
                      class="rating-star bi fs-2"
                      :class="[
                        star <= (hoveredStar || currentTeacherRating)
                          ? 'bi-star-fill'
                          : 'bi-star',
                        star <= (hoveredStar || currentTeacherRating)
                          ? 'text-warning'
                          : 'text-gray-400',
                      ]"
                      @click="submitTeacherRating(star)"
                      @mouseenter="hoveredStar = star"
                      @mouseleave="hoveredStar = 0"
                    ></i>
                  </div>

                  <div class="rating-labels d-flex gap-2 flex-wrap mb-4">
                    <span
                      v-for="(label, index) in [
                        'Poor',
                        'Fair',
                        'Good',
                        'Very Good',
                        'Excellent',
                      ]"
                      :key="index"
                      class="rating-badge small fw-semibold"
                      :class="{
                        active:
                          hoveredStar === index + 1 ||
                          currentTeacherRating === index + 1,
                      }"
                      >{{ label }}</span
                    >
                  </div>

                  <div
                    class="d-flex align-items-center justify-content-between"
                  >
                    <div
                      v-if="submittingRating"
                      class="d-flex align-items-center gap-2 text-primary"
                    >
                      <span
                        class="spinner-border spinner-border-sm"
                        role="status"
                      ></span>
                      <span class="small fw-semibold">Saving...</span>
                    </div>
                    <div
                      v-else-if="project.my_rating"
                      class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2"
                    >
                      <div
                        class="text-success small fw-semibold d-flex align-items-center gap-1"
                      >
                        <i class="bi bi-check-circle-fill"></i> Saved
                        Successfully
                      </div>
                    </div>
                    <div v-else class="text-muted small fw-medium">
                      <i class="bi bi-lightbulb"></i> Click stars to rate
                    </div>
                  </div>
                </template>

                <!-- Non-Teacher View -->
                <template v-else>
                  <p class="text-muted small mb-0">
                    Average score graded by registered instructors.
                  </p>
                  <div
                    class="d-flex align-items-center gap-2 mt-3 justify-content-center text-warning"
                  >
                    <i
                      v-for="star in 5"
                      :key="star"
                      class="bi"
                      :class="
                        star <= Math.round(project.average_rating || 0)
                          ? 'bi-star-fill'
                          : 'bi-star'
                      "
                    ></i>
                  </div>
                </template>
              </div>

              <!-- Project Stats Widget -->
              <div class="stats-widget glass-card">
                <h5
                  class="fw-bold mb-4 small text-uppercase tracking-wider text-adaptive widget-subtitle"
                >
                  Project Stats
                </h5>
                <div class="row g-3">
                  <div class="col-4">
                    <div class="stat-box text-center p-3 rounded-4">
                      <div class="stat-num fw-bold h5 mb-1 text-adaptive">
                        {{ project.average_rating?.toFixed(1) || "0.0" }}
                      </div>
                      <div class="stat-label text-muted">Rating</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-box text-center p-3 rounded-4">
                      <div class="stat-num fw-bold h5 mb-1 text-adaptive">
                        {{ project.views || "0" }}
                      </div>
                      <div class="stat-label text-muted">Views</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-box text-center p-3 rounded-4">
                      <div class="stat-num fw-bold h5 mb-1 text-adaptive">
                        {{ project.tags?.length || "0" }}
                      </div>
                      <div class="stat-label text-muted">Tags</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Technical Details Widget -->
              <div class="details-widget glass-card">
                <h5
                  class="fw-bold mb-4 small text-uppercase tracking-wider text-adaptive widget-subtitle"
                >
                  Technical Details
                </h5>
                <div class="d-flex flex-column gap-3">
                  <div
                    v-for="spec in technicalSpecs"
                    :key="spec.label"
                    class="spec-row d-flex justify-content-between pb-2"
                  >
                    <span class="spec-label text-muted small">{{
                      spec.label
                    }}</span>
                    <span
                      class="spec-value fw-semibold small text-adaptive text-end text-break"
                      >{{ spec.value }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Author Profile Widget -->
              <router-link
                v-if="project.author"
                :to="`/viewprofile/${authorProfileId}`"
                class="author-widget glass-card text-decoration-none d-block cursor-pointer"
              >
                <h5
                  class="fw-bold mb-4 small text-uppercase tracking-wider text-adaptive widget-subtitle"
                >
                  Project Creator
                </h5>
                <div class="d-flex align-items-center gap-3">
                  <img
                    :src="project.author.avatar"
                    class="author-avatar rounded-circle border shadow-sm"
                    width="54"
                    height="54"
                    alt="Author"
                  />
                  <div class="overflow-hidden">
                    <div class="fw-bold text-adaptive text-truncate">
                      {{ project.author.name }}
                    </div>
                    <div class="text-muted small text-truncate">
                      {{ project.author.username }}
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Report Modal -->
    <ReportModal
      v-if="showReportModal"
      type="project"
      :target-id="project.id"
      title="Report Project Showcase"
      @closeModal="showReportModal = false"
    />

    <!-- Delete Project Confirmation Modal -->
    <BaseModal
      v-if="showDeleteConfirmModal"
      title="Confirm Delete Project"
      icon="bi-exclamation-triangle"
      theme="danger"
      @closeModal="showDeleteConfirmModal = false"
    >
      <div class="p-3 text-center">
        <p class="themed-text">Are you sure you want to delete this project? This action cannot be undone.</p>
        <div class="d-flex justify-content-center gap-3 mt-4">
          <button
            class="btn btn-light border px-4 rounded-pill fw-bold"
            type="button"
            @click="showDeleteConfirmModal = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger px-4 rounded-pill fw-bold"
            type="button"
            @click="confirmDeleteProject"
            :disabled="deleting"
          >
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="bi bi-trash3 me-1"></i> Confirm Delete
          </button>
        </div>
      </div>
    </BaseModal>



    <BaseFooter />
  </div>
</template>

<style scoped>
.minimal-detail-page {
  min-height: 100vh;
  background: transparent;
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.project-detail-container {
  max-width: 1200px;
  position: relative;
  z-index: 1;
}

.back-link {
  color: var(--color-text-muted);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-3px);
}

.glass-card {
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-border);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: var(--shadow-lg);
}

.project-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  font-size: 2rem;
  box-shadow: 0 4px 16px rgba(84, 131, 179, 0.15);
}

.project-title {
  font-family: var(--font-family-display);
}

.minimal-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
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

/* Cover visual styling */
.project-visual-card {
  position: relative;
}

.visual-img {
  height: 480px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-visual-card:hover .visual-img {
  transform: scale(1.02);
}

.visual-empty-placeholder {
  height: 350px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.section-subtitle {
  font-family: var(--font-family-display);
}

.long-desc {
  font-size: 0.98rem;
}

/* Sidebar styling */
.sticky-sidebar {
  position: sticky;
  top: 100px;
}

.widget-title {
  font-family: var(--font-family-display);
}

.rating-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.rating-score .score-num {
  font-size: 1.6rem;
  line-height: 1;
}

.rating-score .score-max {
  font-size: 0.85rem;
}

.rating-star {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: var(--color-border);
}

.rating-star:hover {
  transform: scale(1.25);
  text-shadow: 0 4px 16px rgba(245, 158, 11, 0.5);
}

.rating-badge {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.rating-badge.active {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border-color: rgba(245, 158, 11, 0.3);
}

/* Stats widget styling */
.stat-box {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.stat-num {
  font-family: var(--font-family-display);
}

.stat-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* Technical Details rows */
.spec-row {
  border-bottom: 1px solid var(--color-border);
}

.spec-row:last-child {
  border-bottom: none;
}

/* Author widget styling */
.author-widget {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.author-widget:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary) !important;
  box-shadow: var(--shadow-lg);
}

.author-avatar {
  border-color: var(--color-surface) !important;
}

.xx-small {
  font-size: 0.65rem;
}

@media (max-width: 991.98px) {
  .visual-img {
    height: 320px;
  }
}

@media (max-width: 575.98px) {
  .glass-card {
    padding: 20px 16px !important;
  }

  .visual-img,
  .visual-empty-placeholder {
    height: 200px !important;
  }

  .detail-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
}
</style>
