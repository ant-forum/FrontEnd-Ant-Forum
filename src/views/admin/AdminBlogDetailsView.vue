<template>
  <AdminPageShell
    :title="blog ? blog.title : 'Blog Details'"
    kicker="Admin Publishing"
    :subtitle="
      blog
        ? `Administrative detail view for blog post: ${blog.title}`
        : 'Blog details page'
    "
    :metrics="metrics"
    :breadcrumbs="breadcrumbs"
  >
    <template #before-title>
      <router-link
        class="btn btn-light border back-link mb-3 d-inline-flex align-items-center gap-2"
        to="/admin/blogs"
      >
        <i class="bi bi-arrow-left"></i>
        <span>Back to Blog Management</span>
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
            </div>
          </div>

          <!-- Cover Image Skeleton -->
          <div class="skeleton-panel border rounded-4 overflow-hidden p-0 mb-4" style="height: 320px">
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
    <template v-else-if="blog">
      <div class="row g-4 text-start">
        <!-- Left Column: Primary Content -->
        <div class="col-lg-8">
          <!-- Overview Card -->
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <div class="d-flex align-items-start gap-4 mb-3 flex-wrap flex-sm-nowrap">
              <div class="blog-icon-wrapper rounded-4 d-flex align-items-center justify-content-center flex-shrink-0">
                <i class="bi bi-file-earmark-post fs-2 text-primary"></i>
              </div>
              <div class="flex-grow-1 text-start">
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <h2 class="fw-bold mb-0 text-adaptive">{{ blog.title }}</h2>
                  <span :class="['status-badge rounded-pill px-3 py-1 text-xs fw-bold', getStatusClass(blog.status)]">
                    {{ getDisplayStatus(blog.status) }}
                  </span>
                </div>
                <div class="post-meta-strip mt-2 d-flex flex-wrap gap-3 text-muted text-xs">
                  <span><i class="bi bi-tag-fill me-1"></i>Category: <strong>{{ blog.category }}</strong></span>
                  <span><i class="bi bi-clock me-1"></i>Read Time: <strong>{{ blog.readTime }}</strong></span>
                  <span><i class="bi bi-calendar3 me-1"></i>{{ blog.date }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cover Visual Image -->
          <div class="admin-visual-card glass-card mb-4 overflow-hidden border rounded-4 p-0 bg-surface text-start">
            <div class="visual-img-container position-relative">
              <img
                v-if="blog.image"
                :src="blog.image"
                :alt="blog.title"
                class="visual-img object-fit-cover w-100"
                style="max-height: 400px; min-height: 200px"
                @error.once="handleImgError"
              />
              <div v-else class="visual-placeholder d-flex flex-column align-items-center justify-content-center bg-input py-5 text-muted">
                <i class="bi bi-image display-4 mb-2"></i>
                <span>No cover image uploaded for this blog post</span>
              </div>
            </div>
          </div>

          <!-- Blog Content Body -->
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <h4 class="fw-bold mb-3 text-adaptive section-subtitle border-bottom pb-2">
              Article Content
            </h4>
            <div class="text-muted lh-lg blog-content-body markdown-body" v-html="renderStoredContent(blog.content || blog.description || '')"></div>
          </div>
        </div>

        <!-- Right Column: Sidebar Widgets -->
        <div class="col-lg-4">
          <div class="sticky-sidebar d-flex flex-column gap-4">
            <!-- Review Assessment Status -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-shield-check me-2 text-primary"></i>Post Metrics
              </h5>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Status:</span>
                <span :class="['badge rounded-pill py-1 px-3 fw-bold', getStatusClass(blog.status)]">
                  {{ getDisplayStatus(blog.status) }}
                </span>
              </div>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Views / Reads:</span>
                <span class="fw-bold text-adaptive">{{ blog.view_count || blog.views || 0 }}</span>
              </div>
            </div>

            <!-- Author Info Widget -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-person me-2 text-primary"></i>Publisher Info
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
                  <span class="text-muted">Email address:</span>
                  <span class="text-adaptive">{{ authorEmail }}</span>
                </div>
                <div class="d-flex justify-content-between text-xs mt-1">
                  <span class="text-muted">Published Date:</span>
                  <span class="text-adaptive">{{ blog.date }}</span>
                </div>
              </div>
            </div>

            <!-- Administrative Operations Widget -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-sliders me-2 text-primary"></i>Administrative Operations
              </h5>
              <div class="d-flex flex-column gap-2">
                <!-- Status Switch Button -->
                <button
                  v-if="!isPublished"
                  class="btn btn-success rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
                  @click="handleToggleStatus('published')"
                  :disabled="isStatusUpdating"
                >
                  <span v-if="isStatusUpdating" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-check-circle"></i>
                  <span>Publish Article</span>
                </button>

                <!-- Edit details button -->
                <button
                  class="btn btn-outline-primary rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  @click="handleEdit"
                >
                  <i class="bi bi-pencil-square"></i>
                  <span>Edit Post Content</span>
                </button>

                <!-- Delete button -->
                <button
                  class="btn btn-outline-danger rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  @click="openDeleteModal"
                >
                  <i class="bi bi-trash"></i>
                  <span>Delete Article</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Blog Not Found -->
    <div
      v-else
      class="text-center py-5 border rounded-4 border-dashed bg-surface shadow-sm"
    >
      <i class="bi bi-exclamation-triangle display-4 text-warning mb-2 d-block"></i>
      <h4 class="fw-bold mb-1 text-adaptive">Blog Article Not Found</h4>
      <p class="text-muted small mb-3">
        The requested article record does not exist or has been deleted.
      </p>
      <router-link
        to="/admin/blogs"
        class="btn btn-primary btn-sm rounded-pill px-4"
      >
        Back to Blog Management
      </router-link>
    </div>

    <!-- Delete Blog Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Article"
      icon="bi bi-trash"
      theme="danger"
      kicker="Action Confirmation"
      @closeModal="closeDeleteModal"
    >
      <div class="text-start">
        <p class="delete-message">
          Are you sure you want to permanently delete the blog post
          <strong>{{ blog ? blog.title : '' }}</strong>?
        </p>
        <p class="text-danger small">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> This action is irreversible. The article and all statistics will be permanently removed.
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
            :disabled="isDeleting"
            @click="handleDeleteBlog"
          >
            <span
              v-if="isDeleting"
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
import { useBlogStore } from "../../stores/BlogStore";
import { useUsersStore } from "../../stores/UsersStore";
import { useToast } from "../../composables/useToast";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { renderStoredContent } from "../../utils/richContent";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const usersStore = useUsersStore();
const toast = useToast();

const isPageLoading = ref(true);
const isStatusUpdating = ref(false);
const isDeleting = ref(false);

const blog = computed(() => blogStore.blog);

// Status mappings and colors
const isPublished = computed(() => {
  if (!blog.value) return false;
  const s = String(blog.value.status || "").toLowerCase();
  return s === "published";
});

const getDisplayStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "published") return "Published";
  return "Draft";
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "published") return "bg-success text-white";
  return "bg-warning text-dark";
};

const handleImgError = (e) => {
  e.target.src =
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};

// Author Meta Resolver
const authorUserId = computed(() => {
  if (!blog.value) return null;
  return (
    blog.value.user_id ||
    blog.value.userId ||
    blog.value.author_id ||
    blog.value.authorId ||
    blog.value.admin_id ||
    blog.value.adminId ||
    blog.value.created_by_id ||
    blog.value.createdById
  );
});

const cachedAuthor = computed(() => {
  const uid = authorUserId.value;
  if (!uid) return null;
  return usersStore.users.find(u => String(u.id) === String(uid) || String(u.user_id) === String(uid)) || null;
});

const authorName = computed(() => {
  return cachedAuthor.value?.fullname || cachedAuthor.value?.name || blog.value?.author || "Admin";
});

const authorEmail = computed(() => {
  return cachedAuthor.value?.email || "No email available";
});

const authorRole = computed(() => {
  const rawRole = cachedAuthor.value?.role || "admin";
  if (rawRole === "user" || rawRole === "student") return "Student";
  if (rawRole === "mentor") return "Mentor";
  if (rawRole === "teacher") return "Teacher";
  if (rawRole === "admin") return "Admin";
  return rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
});

const authorAvatar = computed(() => {
  const rawAvatar = cachedAuthor.value?.profile_pic || cachedAuthor.value?.avatar || blog.value?.author_avatar;
  if (rawAvatar) return resolveMediaUrl(rawAvatar);
  return '/profile.jpg';
});

const handleAuthorAvatarError = (e) => {
  e.target.src = '/profile.jpg';
};

// Loading logic
const loadBlogDetails = async () => {
  try {
    const id = route.params.id;
    await blogStore.fetchBlogById(id);
  } catch (error) {
    console.error("Failed to load blog:", error);
    toast.error("Could not fetch blog details from the server.");
  }
};

const highlightCodeBlocks = () => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll(
      ".blog-content-body pre code, .blog-content-body code"
    );
    codeBlocks.forEach((block) => {
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block);
      }
    });

    const preBlocks = document.querySelectorAll(".blog-content-body pre");
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
  () => blog.value,
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
    await loadBlogDetails();
    if (usersStore.users.length === 0) {
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
  { label: "Blog Management", to: "/admin/blogs" },
  { label: blog.value ? blog.value.title : "Blog Details" },
]);

const metrics = computed(() => {
  if (!blog.value) return [];
  const statusStr = getDisplayStatus(blog.value.status);
  return [
    {
      label: "Article Status",
      value: statusStr,
      change: "Current publishing stage",
      icon: statusStr === "Published" ? "bi-send-check" : "bi-pencil",
      className: statusStr === "Published" ? "green" : "orange",
    },
    {
      label: "Total Views",
      value: String(blog.value.view_count || blog.value.views || 0),
      change: "Forum readers traffic",
      icon: "bi-eye",
      className: "blue",
    },
  ];
});


// Administrative Status Toggles
const handleToggleStatus = async (newStatus) => {
  if (isStatusUpdating.value || !blog.value) return;
  try {
    isStatusUpdating.value = true;
    await blogStore.updateBlog(blog.value.id, {
      status: newStatus,
    });
    toast.success(`Blog status updated to ${getDisplayStatus(newStatus)} successfully!`);
    await loadBlogDetails();
  } catch (error) {
    console.error("Failed to update blog status:", error);
    toast.error("Failed to update blog status.");
  } finally {
    isStatusUpdating.value = false;
  }
};

// Edit Post Content Navigation
const handleEdit = () => {
  if (!blog.value) return;
  router.push(`/admin/blogs/create?id=${blog.value.id}`);
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

const handleDeleteBlog = async () => {
  if (!blog.value) return;
  try {
    isDeleting.value = true;
    await blogStore.deleteOwnBlog(blog.value.id);
    toast.success("Blog post deleted successfully!");
    closeDeleteModal();
    router.push("/admin/blogs");
  } catch (error) {
    console.error("Failed to delete blog:", error);
    toast.error("An error occurred while deleting the blog post.");
  } finally {
    isDeleting.value = false;
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

/* Blog Details Styling */
.blog-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
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

.blog-content-body {
  word-break: break-word;
}
.blog-content-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}
.blog-content-body :deep(p) {
  margin-bottom: 1.25rem;
  line-height: 1.8;
}
.blog-content-body :deep(h1),
.blog-content-body :deep(h2),
.blog-content-body :deep(h3),
.blog-content-body :deep(h4) {
  color: var(--color-text);
  margin-top: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.blog-content-body :deep(pre) {
  position: relative !important;
  background: #181a1f !important;
  border-radius: 12px !important;
  margin: 18px 0;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 0 !important;
}

.blog-content-body :deep(pre code) {
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

.blog-content-body :deep(code:not(pre code)) {
  background: var(--color-surface-hover) !important;
  padding: 3px 6px !important;
  border-radius: 6px !important;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13.5px !important;
  color: var(--color-danger) !important;
  border: 1px solid var(--color-border) !important;
}

.blog-content-body :deep(pre .copy-code-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-blue);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.blog-content-body :deep(pre .copy-code-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-1px);
}

.blog-content-body :deep(pre .copy-code-btn.copied) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}
</style>
