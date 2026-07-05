<template>
  <AdminPageShell
    :title="project ? project.title : 'Project Details'"
    kicker="Project Overview"
    :subtitle="
      project
        ? `Administrative detail view for student project: ${project.title}`
        : 'Project details page'
    "
    :metrics="metrics"
    :breadcrumbs="breadcrumbs"
  >
    <template #before-title>
      <router-link
        class="btn btn-light border back-link mb-3 d-inline-flex align-items-center gap-2"
        to="/admin/projects"
      >
        <i class="bi bi-arrow-left"></i>
        <span>Back to Project Management</span>
      </router-link>
    </template>

    <!-- Premium Shimmer Skeleton Loader -->
    <div v-if="isPageLoading" class="skeleton-page-container w-100">
      <div class="row g-4">
        <!-- Left Column Skeleton -->
        <div class="col-lg-8">
          <div class="skeleton-panel border rounded-4 p-4 mb-4">
            <div class="d-flex align-items-center gap-4 mb-4 flex-wrap flex-sm-nowrap">
              <div class="skeleton-icon rounded-4 flex-shrink-0"></div>
              <div class="flex-grow-1 w-100">
                <div class="skeleton-title rounded mb-3" style="width: 60%; height: 32px"></div>
                <div class="skeleton-text rounded" style="width: 85%; height: 16px"></div>
              </div>
            </div>
            <div class="d-flex gap-2 mb-3">
              <div class="skeleton-badge rounded-pill" style="width: 70px; height: 24px"></div>
              <div class="skeleton-badge rounded-pill" style="width: 70px; height: 24px"></div>
            </div>
          </div>

          <!-- Cover Image Skeleton -->
          <div class="skeleton-panel border rounded-4 overflow-hidden p-0 mb-4" style="height: 380px">
            <div class="skeleton-image w-100 h-100"></div>
          </div>

          <!-- Description Skeleton -->
          <div class="skeleton-panel border rounded-4 p-4">
            <div class="skeleton-title rounded mb-3" style="width: 150px; height: 24px"></div>
            <div class="d-flex flex-column gap-2">
              <div class="skeleton-text rounded" style="width: 100%; height: 16px"></div>
              <div class="skeleton-text rounded" style="width: 95%; height: 16px"></div>
              <div class="skeleton-text rounded" style="width: 90%; height: 16px"></div>
              <div class="skeleton-text rounded" style="width: 60%; height: 16px"></div>
            </div>
          </div>
        </div>

        <!-- Right Column Skeleton -->
        <div class="col-lg-4">
          <div class="skeleton-panel border rounded-4 p-4 mb-4">
            <div class="skeleton-title rounded mb-3" style="width: 120px; height: 20px"></div>
            <div class="skeleton-text rounded mb-2" style="width: 100%; height: 50px"></div>
          </div>
          <div class="skeleton-panel border rounded-4 p-4 mb-4">
            <div class="skeleton-title rounded mb-3" style="width: 120px; height: 20px"></div>
            <div class="skeleton-text rounded mb-2" style="width: 100%; height: 80px"></div>
          </div>
          <div class="skeleton-panel border rounded-4 p-4">
            <div class="skeleton-title rounded mb-3" style="width: 120px; height: 20px"></div>
            <div class="skeleton-text rounded mb-2" style="width: 100%; height: 120px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="project">
      <div class="row g-4">
        <!-- Left Column: Primary Content -->
        <div class="col-lg-8">
          <div class="admin-visual-card glass-card mb-4 overflow-hidden border rounded-4 p-0 bg-surface text-start">
            <div class="visual-img-container position-relative">
              <img
                v-if="project.thumbnail || project.image"
                :src="project.thumbnail || project.image"
                :alt="project.title"
                class="visual-img object-fit-cover w-100"
                style="max-height: 400px; min-height: 200px"
              />
              <div v-else class="visual-placeholder d-flex flex-column align-items-center justify-content-center bg-input py-5 text-muted">
                <i class="bi bi-image display-4 mb-2"></i>
                <span>No cover image uploaded for this project</span>
              </div>
            </div>
          </div>
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <div class="d-flex align-items-center gap-4 mb-4 flex-wrap flex-sm-nowrap">
              <div class="project-icon-wrapper rounded-4 d-flex align-items-center justify-content-center flex-shrink-0">
                <i class="bi bi-layers-fill fs-2 text-primary"></i>
              </div>
              <div class="flex-grow-1 text-start">
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <h2 class="fw-bold mb-0 text-adaptive">{{ project.title }}</h2>
                  <span :class="['status-badge rounded-pill px-3 py-1 text-xs fw-bold', getStatusClass(project.status)]">
                    {{ getDisplayStatus(project.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <span v-for="tag in project.tags" :key="tag" class="badge tag-badge-pill">
                {{ tag }}
              </span>
              <span v-if="!project.tags || project.tags.length === 0" class="text-muted small">
                No tags assigned.
              </span>
            </div>

            <!-- Demo Link -->
            <div class="d-flex gap-3 align-items-center flex-wrap">
              <a
                v-if="project.link"
                :href="formattedDemoLink"
                target="_blank"
                class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2 text-white"
              >
                <i class="bi bi-box-arrow-up-right"></i> Live Demo
              </a>
              <button
                v-else
                class="btn btn-secondary rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                disabled
              >
                <i class="bi bi-slash-circle"></i> No Live Demo Link
              </button>
              
            </div>
            <h4 class="fw-bold mb-3 mt-3 text-adaptive section-subtitle">
                About the Project
              </h4>
              <div class="text-muted lh-lg long-desc mb-0" v-html="renderStoredContent(project.description || 'No description provided.')"></div>
          </div>
        </div>

        <!-- Right Column: Sidebar Widgets -->
        <div class="col-lg-4">
          <div class="sticky-sidebar d-flex flex-column gap-4">
            <!-- Review Assessment Status -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-shield-check me-2 text-primary"></i>Review Status
              </h5>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Status:</span>
                <span :class="['badge rounded-pill py-1 px-3 fw-bold', getStatusClass(project.status)]">
                  {{ getDisplayStatus(project.status) }}
                </span>
              </div>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Views:</span>
                <span class="fw-bold text-adaptive">{{ project.view_count || project.views || 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Teacher Rating:</span>
                <div class="d-flex align-items-center gap-1">
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="fw-bold text-adaptive">{{ project.average_rating ? project.average_rating.toFixed(1) : '0.0' }}</span>
                  <span class="text-muted text-xs">/5</span>
                </div>
              </div>
            </div>

            <!-- Author Info Widget -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-person me-2 text-primary"></i>Submitted By
              </h5>
              <div class="d-flex align-items-center gap-3">
                <img
                  :src="authorAvatar"
                  class="rounded-circle object-fit-cover shadow-sm"
                  width="54"
                  height="54"
                  @error.once="handleAuthorAvatarError"
                />
                <div class="min-width-0">
                  <h6 class="fw-bold mb-1 text-adaptive text-truncate" title="Full Name">
                    {{ authorName }}
                  </h6>
                  <span class="badge bg-primary-light text-primary text-xs me-2" title="Role">
                    {{ authorRole }}
                  </span>
                </div>
              </div>
              <div class="border-top mt-3 pt-3">
                <div class="d-flex justify-content-between text-xs mb-1">
                  <span class="text-muted">Submission Date:</span>
                  <span class="text-adaptive">{{ formatJoinedDate(project.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Project Not Found -->
    <div
      v-else
      class="text-center py-5 border rounded-4 border-dashed bg-surface shadow-sm"
    >
      <i class="bi bi-exclamation-triangle display-4 text-warning mb-2 d-block"></i>
      <h4 class="fw-bold mb-1 text-adaptive">Project Not Found</h4>
      <p class="text-muted small mb-3">
        The requested student project record does not exist or has been deleted.
      </p>
      <router-link
        to="/admin/projects"
        class="btn btn-primary btn-sm rounded-pill px-4"
      >
        Back to Project Management
      </router-link>
    </div>

    <!-- Edit Project Modal -->
    <BaseModal
      v-if="mEdit.isVisible"
      title="Edit Project Details"
      icon="bi bi-pencil-square"
      kicker="Project Review Editor"
      @closeModal="closeEditModal"
    >
      <form class="edit-project-form" @submit.prevent="handleUpdateProject" novalidate>
        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small">Project Title</label>
          <input
            v-model="mEdit.data.title"
            class="form-control"
            :class="{ 'is-invalid': errors.title }"
            type="text"
            placeholder="Enter project title"
            @input="handleEditInput('title')"
          />
          <div v-if="errors.title" class="invalid-feedback d-block text-xs">
            {{ errors.title }}
          </div>
        </div>

        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small">Short Description</label>
          <textarea
            v-model="mEdit.data.description"
            class="form-control"
            :class="{ 'is-invalid': errors.description }"
            rows="4"
            placeholder="Enter project description"
            @input="handleEditInput('description')"
          ></textarea>
          <div v-if="errors.description" class="invalid-feedback d-block text-xs">
            {{ errors.description }}
          </div>
        </div>

        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small">Live Demo URL</label>
          <input
            v-model="mEdit.data.link"
            class="form-control"
            type="text"
            placeholder="https://example.com"
          />
        </div>

        <!-- Project Status Switch inside Edit Form too -->
        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small">Submission Status</label>
          <select v-model="mEdit.data.status" class="form-select">
            <option value="Active">Published / Active</option>
            <option value="In Review">In Review</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <!-- Project Tags -->
        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small mb-2">Project Tags</label>
          <div class="tags-checkbox-grid border rounded-3 p-3 bg-input">
            <div
              v-for="tag in tagsStore.tags"
              :key="tag.id || tag.tag_id"
              class="form-check-custom mb-2 d-flex align-items-center"
            >
              <input
                type="checkbox"
                :id="'tag-edit-' + (tag.id || tag.tag_id)"
                :value="tag.id || tag.tag_id"
                v-model="mEdit.data.tag_ids"
                class="form-check-input me-2 cursor-pointer"
              />
              <label
                class="form-check-label cursor-pointer text-adaptive small"
                :for="'tag-edit-' + (tag.id || tag.tag_id)"
              >
                {{ tag.name || tag.tag_name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Thumbnail Upload -->
        <div class="field-block text-start mb-3">
          <label class="form-label fw-bold text-adaptive small">Project Thumbnail</label>
          <div
            class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed rounded-4 py-4 position-relative overflow-hidden cursor-pointer"
            :class="{ dragging: isEditDragging }"
            @click="triggerEditLogoUpload"
            @dragover.prevent="handleEditDragOver"
            @dragleave="handleEditDragLeave"
            @drop.prevent="handleEditDrop"
            style="min-height: 160px; background-color: var(--color-surface-hover)"
          >
            <div
              v-if="editLogoPreviewUrl"
              class="w-100 h-100 position-absolute top-0 start-0 d-flex align-items-center justify-content-center bg-dark"
            >
              <img
                :src="editLogoPreviewUrl"
                class="w-100 h-100 object-fit-cover"
                style="max-height: 100%"
              />
              <button
                type="button"
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
                style="width: 24px; height: 24px; z-index: 10"
                @click.stop="removeEditLogo"
                title="Remove Image"
              >
                <i class="bi bi-x" style="font-size: 1rem"></i>
              </button>
            </div>
            <div
              v-else
              class="d-flex flex-column align-items-center justify-content-center text-muted"
            >
              <i class="bi bi-cloud-arrow-up-fill text-primary display-6 mb-2"></i>
              <h6 class="fw-bold mb-1 small text-adaptive">Drag & Drop Thumbnail Image</h6>
              <p class="x-small mb-2">PNG, JPG, or WEBP up to 5MB</p>
              <button
                type="button"
                class="btn btn-outline-primary rounded-pill px-3 py-1 fw-bold x-small"
              >
                Browse Files
              </button>
            </div>
            <input
              type="file"
              ref="editLogoInput"
              class="d-none"
              accept="image/*"
              @change="handleEditLogoChange"
            />
          </div>
        </div>

        <div class="modal-actions d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button
            class="btn btn-light border rounded-pill px-4"
            type="button"
            @click="closeEditModal"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary rounded-pill px-4 text-white"
            type="submit"
            :disabled="projectStore.isLoading || isSaveDisabled"
          >
            <span
              v-if="projectStore.isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Project Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Project"
      icon="bi bi-trash"
      theme="danger"
      kicker="Action Confirmation"
      @closeModal="closeDeleteModal"
    >
      <div class="text-start">
        <p class="delete-message">
          Are you sure you want to permanently delete the project
          <strong>{{ project ? project.title : '' }}</strong>?
        </p>
        <p class="text-danger small">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> This action is irreversible. This project submission and all ratings will be permanently removed.
        </p>
        <div class="modal-actions d-flex justify-content-end gap-2 mt-4">
          <button
            class="btn btn-light border rounded-pill px-4"
            type="button"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger rounded-pill px-4"
            type="button"
            :disabled="projectStore.isLoading"
            @click="handleDeleteProject"
          >
            <span
              v-if="projectStore.isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i class="bi bi-trash me-1"></i>
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref, onMounted, reactive, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useProjectStore } from "../../stores/ProjectStore";
import { useTagsStore } from "../../stores/TagsStore";
import { useToast } from "../../composables/useToast";
import { useRequiredValidator } from "../../composables/useRequiredValidator";
import { useUsersStore } from "../../stores/UsersStore";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { renderStoredContent } from "../../utils/richContent";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const tagsStore = useTagsStore();
const usersStore = useUsersStore();
const toast = useToast();

const isPageLoading = ref(true);
const isStatusUpdating = ref(false);
const isEditSubmitted = ref(false);
const { errors, clearError, validateField } = useRequiredValidator();

const project = computed(() => projectStore.project);

// Status mappings and colors
const isPublished = computed(() => {
  if (!project.value) return false;
  const s = String(project.value.status || "").toLowerCase();
  return s === "active" || s === "published";
});

const getDisplayStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "active" || s === "published") return "Published";
  return "In Review";
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "active" || s === "published") return "bg-success text-white";
  return "bg-warning text-dark";
};

// Formatted Links
const formattedDemoLink = computed(() => {
  if (!project.value || !project.value.link) return "";
  const link = project.value.link;
  if (/^https?:\/\//i.test(link)) {
    return link;
  }
  return `http://${link}`;
});

// Author Meta
const cachedAuthor = computed(() => {
  const userId = project.value?.user_id || project.value?.userId;
  if (!userId) return null;
  return projectStore.userCache[userId] || null;
});

const authorName = computed(() => {
  return cachedAuthor.value?.fullname || project.value?.author?.name || project.value?.author?.username || "Unknown Author";
});

const authorEmail = computed(() => {
  return cachedAuthor.value?.email || project.value?.author?.email || "No email available";
});

const authorRole = computed(() => {
  const rawRole = cachedAuthor.value?.role || project.value?.author?.role || "student";
  if (rawRole === "user" || rawRole === "student") return "Student";
  if (rawRole === "mentor") return "Mentor";
  if (rawRole === "teacher") return "Teacher";
  if (rawRole === "admin") return "Admin";
  return rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
});

const authorAvatar = computed(() => {
  const rawAvatar = cachedAuthor.value?.profile_pic || cachedAuthor.value?.avatar || project.value?.author?.avatar;
  if (rawAvatar) return rawAvatar;
  return "https://i.pravatar.cc/150?u=student";
});

const handleAuthorAvatarError = (e) => {
  e.target.src = "https://i.pravatar.cc/150?u=student";
};

const formatJoinedDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Loading logic
const loadProjectDetails = async () => {
  try {
    const id = route.params.id;
    await projectStore.fetchProject(id);
  } catch (error) {
    console.error("Failed to load project:", error);
    toast.error("Could not fetch project details from the server.");
  }
};

const highlightCodeBlocks = () => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll(
      ".long-desc pre code, .long-desc code"
    );
    codeBlocks.forEach((block) => {
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block);
      }
    });

    const preBlocks = document.querySelectorAll(".long-desc pre");
    preBlocks.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;

      pre.style.position = "relative";
      const codeText = pre.querySelector("code")?.innerText || pre.innerText;

      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            btn.classList.remove("copied");
          }, 2000);
        } catch (err) {
          console.error("Failed to copy code: ", err);
        }
      });
      pre.appendChild(btn);
    });
  });
};

watch(
  () => project.value,
  (newVal) => {
    if (newVal) {
      highlightCodeBlocks();
    }
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  try {
    isPageLoading.value = true;
    await loadProjectDetails();
    await tagsStore.fetchTags();
    if (usersStore?.users?.length === 0) {
      await usersStore.fetchUsers(true).catch(() => {});
    }
  } catch (error) {
    console.error("Failed onMounted:", error);
  } finally {
    isPageLoading.value = false;
    highlightCodeBlocks();
  }
});

// Breadcrumbs & metrics
const breadcrumbs = computed(() => [
  { label: "Project Management", to: "/admin/projects" },
  { label: project.value ? project.value.title : "Project Details" },
]);

const metrics = computed(() => {
  if (!project.value) return [];
  const statusStr = getDisplayStatus(project.value.status);
  return [
    {
      label: "Project Status",
      value: statusStr,
      change: "Current review stage",
      icon: statusStr === "Published" ? "bi-cloud-check" : "bi-hourglass-split",
      className: statusStr === "Published" ? "green" : "orange",
    },
    {
      label: "Views Total",
      value: String(project.value.view_count || project.value.views || 0),
      change: "Student showcase traffic",
      icon: "bi-eye",
      className: "blue",
    },
    {
      label: "Rating",
      value: project.value.average_rating ? project.value.average_rating.toFixed(1) : "0.0",
      change: "Average teacher evaluation",
      icon: "bi-star",
      className: "orange",
    },
  ];
});

// Administrative Status Toggles
const handleToggleStatus = async (newStatus) => {
  if (isStatusUpdating.value || !project.value) return;
  try {
    isStatusUpdating.value = true;
    await projectStore.updateProject(project.value.id, {
      title: project.value.title,
      description: project.value.description,
      status: newStatus,
    });
    toast.success(`Project status updated to ${getDisplayStatus(newStatus)} successfully!`);
    await loadProjectDetails();
  } catch (error) {
    console.error("Failed to toggle project status:", error);
    toast.error("Failed to update project status.");
  } finally {
    isStatusUpdating.value = false;
  }
};

// Edit Modal Logic
const mEdit = reactive({
  isVisible: false,
  data: {
    title: "",
    description: "",
    link: "",
    tag_ids: [],
    status: "In Review",
    thumbnail: null,
    thumbnailUrl: "",
  },
});

const isEditDragging = ref(false);
const editLogoInput = ref(null);

const editLogoPreviewUrl = computed(() => {
  return mEdit.data.thumbnailUrl || "";
});

const openEditModal = () => {
  if (!project.value) return;
  isEditSubmitted.value = false;
  clearError("title");
  clearError("description");

  const tagsList = Array.isArray(project.value.tag) ? project.value.tag : [];
  const tagIds = tagsList
    .map((t) => (t.id !== undefined && t.id !== null ? t.id : t.tag_id))
    .filter(Boolean);

  mEdit.data = {
    title: project.value.title || "",
    description: project.value.description || "",
    link: project.value.link || "",
    tag_ids: tagIds.length ? tagIds : (project.value.tag_ids || []),
    status: project.value.status || "In Review",
    thumbnail: null,
    thumbnailUrl: project.value.thumbnail || project.value.image || "",
  };
  mEdit.isVisible = true;
};

const closeEditModal = () => {
  mEdit.isVisible = false;
};

const handleEditInput = (field) => {
  if (isEditSubmitted.value) {
    if (field === "title")
      validateField("title", mEdit.data.title, "Project title is required.");
    if (field === "description")
      validateField(
        "description",
        mEdit.data.description,
        "Description is required.",
      );
  } else {
    clearError(field);
  }
};

const triggerEditLogoUpload = () => {
  editLogoInput.value?.click();
};

const handleEditLogoChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mEdit.data.thumbnail = file;
    mEdit.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const handleEditDragOver = () => {
  isEditDragging.value = true;
};

const handleEditDragLeave = () => {
  isEditDragging.value = false;
};

const handleEditDrop = (event) => {
  isEditDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mEdit.data.thumbnail = file;
    mEdit.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const removeEditLogo = () => {
  mEdit.data.thumbnail = null;
  mEdit.data.thumbnailUrl = "";
  if (editLogoInput.value) {
    editLogoInput.value.value = "";
  }
};

const isSaveDisabled = computed(() => {
  if (!project.value) return true;
  const currentTitle = (mEdit.data.title || "").trim();
  const currentDescription = (mEdit.data.description || "").trim();
  if (!currentTitle || !currentDescription) return true;
  return false;
});

const handleUpdateProject = async () => {
  isEditSubmitted.value = true;
  const isTitleValid = validateField(
    "title",
    mEdit.data.title,
    "Project title is required.",
  );
  const isDescriptionValid = validateField(
    "description",
    mEdit.data.description,
    "Description is required.",
  );

  if (!isTitleValid || !isDescriptionValid) {
    toast.error("Please fill in all required fields.");
    return;
  }

  try {
    await projectStore.updateProject(project.value.id, {
      title: mEdit.data.title,
      description: mEdit.data.description,
      link: mEdit.data.link,
      tag_ids: mEdit.data.tag_ids,
      thumbnail: mEdit.data.thumbnail,
      status: mEdit.data.status,
    });
    toast.success("Project updated successfully!");
    closeEditModal();
    await loadProjectDetails();
  } catch (error) {
    console.error("Failed to update project:", error);
    toast.error(error.message || "Could not update the project details.");
  }
};

// Delete Modal Logic
const mDelete = reactive({
  isVisible: false,
});

const openDeleteModal = () => {
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
};

const handleDeleteProject = async () => {
  if (!project.value) return;
  try {
    await projectStore.deleteProject(project.value.id);
    toast.success("Project deleted successfully!");
    closeDeleteModal();
    router.push("/admin/projects");
  } catch (error) {
    console.error("Failed to delete project:", error);
    toast.error("An error occurred while deleting the project.");
  }
};
</script>

<style scoped>
.page-loading-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Skeleton Loading Shimmer */
.skeleton-image {
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 50%,
    var(--color-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-icon,
.skeleton-title,
.skeleton-badge,
.skeleton-text {
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 50%,
    var(--color-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.skeleton-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.skeleton-icon {
  width: 72px;
  height: 72px;
}

/* Project Details Styling */
.project-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.tag-badge-pill {
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border) !important;
  color: var(--color-text);
  font-size: 0.78rem;
  padding: 6px 12px;
  font-weight: 600;
  border-radius: 99px;
}

.visual-img-container {
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-img {
  width: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.visual-placeholder {
  min-height: 200px;
  background-color: var(--color-surface-hover);
}

.sticky-sidebar {
  position: sticky;
  top: 90px;
}

.text-xs {
  font-size: 0.75rem;
}

.xx-small {
  font-size: 0.65rem;
}

.form-label-custom {
  font-weight: 700;
}

.tags-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
}

.edit-project-form {
  display: grid;
  gap: 0.5rem;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-block label {
  color: var(--color-text);
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.delete-message {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.long-desc :deep(pre) {
  position: relative !important;
  background: #181a1f !important;
  border-radius: 12px !important;
  margin: 18px 0;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 0 !important;
}

.long-desc :deep(pre code) {
  display: block !important;
  background: transparent !important;
  color: #abb2bf !important;
  padding: 16px 20px !important;
  padding-right: 90px !important;
  border-radius: 12px !important;
  border: none !important;
  font-size: 13.5px !important;
  line-height: 1.6 !important;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  overflow-x: auto !important;
  white-space: pre !important;
  word-break: normal !important;
  overflow-wrap: normal !important;
}

.long-desc :deep(code:not(pre code)) {
  background: var(--color-surface-hover) !important;
  padding: 3px 6px !important;
  border-radius: 6px !important;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13.5px !important;
  color: var(--color-danger) !important;
  border: 1px solid var(--color-border) !important;
}

.long-desc :deep(pre .copy-code-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #abb2bf;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.long-desc :deep(pre .copy-code-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-1px);
}

.long-desc :deep(pre .copy-code-btn.copied) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}
</style>
