<template>
  <AdminPageShell
    :title="thread ? thread.title : 'Thread Details'"
    kicker="Forum Moderation"
    :subtitle="
      thread
        ? `Administrative moderation details for thread: ${thread.title}`
        : 'Thread details page'
    "
    :metrics="metrics"
    :breadcrumbs="breadcrumbs"
  >
    <template #before-title>
      <router-link
        class="btn btn-light border back-link mb-3 d-inline-flex align-items-center gap-2"
        to="/admin/threads"
      >
        <i class="bi bi-arrow-left"></i>
        <span>Back to Thread Management</span>
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
            <div class="d-flex gap-2">
              <div class="skeleton-badge rounded-pill" style="width: 70px; height: 24px"></div>
            </div>
          </div>

          <div class="skeleton-panel border rounded-4 p-4">
            <div class="skeleton-title rounded mb-3" style="width: 150px; height: 24px"></div>
            <div class="d-flex flex-column gap-2">
              <div class="skeleton-text rounded" style="width: 100%; height: 16px"></div>
              <div class="skeleton-text rounded" style="width: 95%; height: 16px"></div>
              <div class="skeleton-text rounded" style="width: 70%; height: 16px"></div>
            </div>
          </div>
        </div>

        <!-- Right Column Skeleton -->
        <div class="col-lg-4">
          <div class="skeleton-panel border rounded-4 p-4 mb-4">
            <div class="skeleton-title rounded mb-3" style="width: 120px; height: 20px"></div>
            <div class="skeleton-text rounded mb-2" style="width: 100%; height: 50px"></div>
          </div>
          <div class="skeleton-panel border rounded-4 p-4">
            <div class="skeleton-title rounded mb-3" style="width: 120px; height: 20px"></div>
            <div class="skeleton-text rounded mb-2" style="width: 100%; height: 80px"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else-if="thread">
      <div class="row g-4 text-start">
        <!-- Left Column: Primary Content -->
        <div class="col-lg-8">
          <!-- Overview Card -->
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <div class="d-flex align-items-start gap-4 mb-3 flex-wrap flex-sm-nowrap">
              <div class="thread-icon-wrapper rounded-4 d-flex align-items-center justify-content-center flex-shrink-0">
                <i class="bi bi-chat-square-text fs-2 text-primary"></i>
              </div>
              <div class="flex-grow-1 text-start">
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <h2 class="fw-bold mb-0 text-adaptive">{{ thread.title }}</h2>
                  <span class="category-badge">
                    {{ thread.categoryLabel || 'Discussion' }}
                  </span>
                </div>
                <div class="post-meta-strip mt-2 d-flex flex-wrap gap-3 text-muted text-xs">
                  <span><i class="bi bi-clock me-1"></i>Created: <strong>{{ formatDate(thread.createdAt || thread.created_at) }}</strong></span>
                  <span v-if="thread.tags && thread.tags.length"><i class="bi bi-tags-fill me-1"></i>Tags: 
                    <strong v-for="tag in thread.tags" :key="tag.label" class="me-1">#{{ tag.label }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Discussion Content Body -->
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <h4 class="fw-bold mb-3 text-adaptive section-subtitle border-bottom pb-2">
              Discussion Subject
            </h4>
            <div class="text-muted lh-lg thread-content-body" v-html="renderStoredContent(thread.description || thread.body || 'No content provided.')"></div>
          </div>

          <!-- Code Snippet Card (if present) -->
          <div v-if="thread.code" class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <h4 class="fw-bold mb-3 text-adaptive section-subtitle border-bottom pb-2">
              Attached Code Snippet
            </h4>
            <div class="thread-code-block mt-3">
              <pre><code class="language-javascript">{{ thread.code }}</code></pre>
            </div>
          </div>

          <!-- Replies / Comments Section -->
          <div class="admin-detail-card glass-card mb-4 p-4 border rounded-4 bg-surface text-start">
            <h4 class="fw-bold mb-3 text-adaptive section-subtitle border-bottom pb-2">
              Discussion Replies ({{ comments ? comments.length : 0 }})
            </h4>

            <div v-if="comments && comments.length" class="d-flex flex-column gap-3 mt-3">
              <div v-for="comment in comments" :key="comment.id" class="reply-item border rounded-3 p-3 bg-input">
                <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                  <div class="d-flex align-items-center gap-3">
                    <img
                      :src="getCommentAuthorAvatar(comment)"
                      class="rounded-circle object-fit-cover shadow-sm"
                      width="36"
                      height="36"
                      @error.once="handleCommentAvatarError"
                    />
                    <div>
                      <h6 class="fw-bold mb-0 text-adaptive font-sm">{{ getCommentAuthorName(comment) }}</h6>
                      <span class="text-muted text-xs">{{ formatDate(comment.createdAt || comment.created_at) }}</span>
                    </div>
                  </div>
                  <!-- Moderator Delete Button -->
                  <button
                    class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 font-xs fw-bold d-flex align-items-center gap-1"
                    type="button"
                    @click="confirmDeleteComment(comment.id)"
                  >
                    <i class="bi bi-trash"></i>
                    <span>Delete Reply</span>
                  </button>
                </div>
                <div class="reply-body-content mt-2 text-muted text-sm" v-html="renderStoredContent(comment.description || comment.body || '')"></div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-muted small">
              <i class="bi bi-chat-left-dots display-6 mb-2 d-block text-muted-light"></i>
              No replies submitted to this thread yet.
            </div>
          </div>
        </div>

        <!-- Right Column: Sidebar Widgets -->
        <div class="col-lg-4">
          <div class="sticky-sidebar d-flex flex-column gap-4">
            <!-- Thread Stats Widget -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-shield-check me-2 text-primary"></i>Thread Metrics
              </h5>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Category:</span>
                <span class="badge bg-primary-light text-primary fw-bold">
                  {{ thread.categoryLabel || 'Discussion' }}
                </span>
              </div>
              <div class="mb-3 d-flex justify-content-between align-items-center">
                <span class="text-muted small">Total Replies:</span>
                <span class="fw-bold text-adaptive">{{ comments ? comments.length : 0 }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Upvotes / Likes:</span>
                <div class="d-flex align-items-center gap-1">
                  <i class="bi bi-arrow-up-circle-fill text-primary"></i>
                  <span class="fw-bold text-adaptive">{{ thread.votes || thread.likes || 0 }}</span>
                </div>
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
                  <span class="text-muted">Created Date:</span>
                  <span class="text-adaptive">{{ formatDate(thread.createdAt || thread.created_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Administrative Operations Widget -->
            <div class="admin-widget-card glass-card border rounded-4 p-4 bg-surface text-start">
              <h5 class="fw-bold text-adaptive mb-3 border-bottom pb-2">
                <i class="bi bi-sliders me-2 text-primary"></i>Administrative Operations
              </h5>
              <div class="d-flex flex-column gap-2">
                <!-- Delete Button -->
                <button
                  class="btn btn-outline-danger rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  @click="openDeleteModal"
                >
                  <i class="bi bi-trash"></i>
                  <span>Delete Thread</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Thread Not Found -->
    <div
      v-else
      class="text-center py-5 border rounded-4 border-dashed bg-surface shadow-sm"
    >
      <i class="bi bi-exclamation-triangle display-4 text-warning mb-2 d-block"></i>
      <h4 class="fw-bold mb-1 text-adaptive">Discussion Thread Not Found</h4>
      <p class="text-muted small mb-3">
        The requested discussion forum thread record does not exist or has been removed.
      </p>
      <router-link
        to="/admin/threads"
        class="btn btn-primary btn-sm rounded-pill px-4"
      >
        Back to Thread Management
      </router-link>
    </div>

    <!-- Delete Thread Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Discussion"
      icon="bi bi-trash"
      theme="danger"
      kicker="Action Confirmation"
      @closeModal="closeDeleteModal"
    >
      <div class="text-start">
        <p class="delete-message">
          Are you sure you want to permanently delete the discussion thread
          <strong>{{ thread ? thread.title : '' }}</strong>?
        </p>
        <p class="text-danger small">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> This action is irreversible. The discussion and all associated replies/comments will be permanently removed.
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
            @click="handleDeleteThread"
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
import { useForumStore } from "../../stores/ForumStore";
import { useUsersStore } from "../../stores/UsersStore";
import { useToast } from "../../composables/useToast";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { renderStoredContent } from "../../utils/richContent";

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();
const usersStore = useUsersStore();
const toast = useToast();

const isPageLoading = ref(true);
const isDeleting = ref(false);

const thread = computed(() => forumStore.discussion);
const comments = computed(() => forumStore.comments);

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Image Errors fallbacks
const handleAuthorAvatarError = (e) => {
  e.target.src = "https://i.pravatar.cc/150?u=admin";
};

const handleCommentAvatarError = (e) => {
  e.target.src = "https://i.pravatar.cc/150?u=user";
};

// Author Meta Resolver
const authorUserId = computed(() => {
  if (!thread.value) return null;
  return thread.value.user_id || thread.value.userId || thread.value.author?.id || thread.value.author?.user_id;
});

const cachedAuthor = computed(() => {
  const uid = authorUserId.value;
  if (!uid) return null;
  return usersStore.users.find(u => String(u.id) === String(uid) || String(u.user_id) === String(uid)) || null;
});

const authorName = computed(() => {
  return cachedAuthor.value?.fullname || cachedAuthor.value?.name || thread.value?.author?.name || thread.value?.author?.username || (typeof thread.value?.author === "string" ? thread.value?.author : "") || "Anonymous";
});

const authorEmail = computed(() => {
  return cachedAuthor.value?.email || "No email available";
});

const authorRole = computed(() => {
  const rawRole = cachedAuthor.value?.role || thread.value?.author?.role || "user";
  if (rawRole === "user" || rawRole === "student") return "Student";
  if (rawRole === "mentor") return "Mentor";
  if (rawRole === "teacher") return "Teacher";
  if (rawRole === "admin") return "Admin";
  return rawRole.charAt(0).toUpperCase() + rawRole.slice(1);
});

const authorAvatar = computed(() => {
  const rawAvatar = cachedAuthor.value?.profile_pic || cachedAuthor.value?.avatar || thread.value?.author?.profile_pic || thread.value?.author?.avatar;
  if (rawAvatar) return resolveMediaUrl(rawAvatar);
  return "https://i.pravatar.cc/150?u=admin";
});

// Comment Author helpers
const getCommentAuthorName = (comment) => {
  if (!comment) return "User";
  if (comment.author && typeof comment.author === "object") {
    return comment.author.name || comment.author.username || "User";
  }
  if (typeof comment.author === "string") return comment.author;
  
  // Lookup inside cached users
  if (comment.user_id && usersStore.users.length) {
    const u = usersStore.users.find(x => String(x.id) === String(comment.user_id));
    if (u) return u.name || u.fullname || u.username;
  }
  return `User #${comment.user_id || ""}`;
};

const getCommentAuthorAvatar = (comment) => {
  if (!comment) return "https://i.pravatar.cc/150?u=user";
  let avatar = "";
  if (comment.author && typeof comment.author === "object") {
    avatar = comment.author.profile_pic || comment.author.avatar || "";
  }
  if (!avatar && comment.user_id && usersStore.users.length) {
    const u = usersStore.users.find(x => String(x.id) === String(comment.user_id));
    if (u) avatar = u.profile_pic || u.avatar || "";
  }
  if (avatar) return resolveMediaUrl(avatar);
  return "https://i.pravatar.cc/150?u=user";
};

// highlight.js for code blocks
const highlightCodeBlocks = () => {
  nextTick(() => {
    const codeBlocks = document.querySelectorAll(
      ".thread-content-body pre code, .thread-content-body code, .thread-code-block pre code"
    );
    codeBlocks.forEach((block) => {
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block);
      }
    });

    const preBlocks = document.querySelectorAll(".thread-content-body pre, .thread-code-block pre");
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
  () => thread.value,
  (newVal) => {
    if (newVal) {
      highlightCodeBlocks();
    }
  },
  { deep: true, immediate: true }
);

// Loading logic
const loadThreadDetails = async () => {
  try {
    const id = route.params.id;
    await forumStore.fetchDiscussion(id);
  } catch (error) {
    console.error("Failed to load thread details:", error);
    toast.error("Could not fetch discussion details from the server.");
  }
};

onMounted(async () => {
  try {
    isPageLoading.value = true;
    await loadThreadDetails();
    if (usersStore.users.length === 0) {
      await usersStore.fetchUsers(true).catch(() => {});
    }
  } catch (error) {
    console.error("Failed onMounted thread details:", error);
  } finally {
    isPageLoading.value = false;
    highlightCodeBlocks();
  }
});

// Breadcrumbs & metrics
const breadcrumbs = computed(() => [
  { label: "Thread Management", to: "/admin/threads" },
  { label: thread.value ? thread.value.title : "Thread Details" },
]);

const metrics = computed(() => {
  if (!thread.value) return [];
  return [
    {
      label: "Replies Count",
      value: String(comments.value ? comments.value.length : 0),
      change: "Discussion messages count",
      icon: "bi-chat-left-text",
      className: "blue",
    },
    {
      label: "Total Votes",
      value: String(thread.value.votes || thread.value.likes || 0),
      change: "Community upvotes score",
      icon: "bi-arrow-up-circle",
      className: "orange",
    },
  ];
});

// Moderation: Delete comment
const confirmDeleteComment = async (commentId) => {
  if (window.confirm("Are you sure you want to permanently delete this reply?")) {
    try {
      await forumStore.deleteComment(commentId);
      toast.success("Reply deleted successfully!");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete the selected reply.");
    }
  }
};

// Modal delete thread
const mDelete = reactive({
  isVisible: false,
});

const openDeleteModal = () => {
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
};

const handleDeleteThread = async () => {
  if (!thread.value) return;
  try {
    isDeleting.value = true;
    await forumStore.deleteDiscussion(thread.value.id);
    toast.success("Discussion thread deleted successfully!");
    closeDeleteModal();
    router.push("/admin/threads");
  } catch (error) {
    console.error("Failed to delete thread:", error);
    toast.error("An error occurred while deleting the discussion thread.");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.skeleton-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.skeleton-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 50%,
    var(--color-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.thread-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 800;
}

.sticky-sidebar {
  position: sticky;
  top: 90px;
}

.text-xs {
  font-size: 0.75rem;
}

.font-sm {
  font-size: 0.9rem;
}

.font-xs {
  font-size: 0.8rem;
}

.reply-item {
  border: 1px solid var(--color-border);
  transition: background-color var(--transition-base);
}

.reply-item:hover {
  background-color: var(--color-surface-hover);
}

.reply-body-content {
  word-break: break-word;
  line-height: 1.6;
}

.thread-content-body {
  word-break: break-word;
}

.thread-content-body :deep(pre),
.thread-code-block :deep(pre) {
  position: relative !important;
  background: #181a1f !important;
  border-radius: 12px !important;
  margin: 18px 0;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 0 !important;
}

.thread-content-body :deep(pre code),
.thread-code-block :deep(pre code) {
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

.thread-content-body :deep(code:not(pre code)) {
  background: var(--color-surface-hover) !important;
  padding: 3px 6px !important;
  border-radius: 6px !important;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13.5px !important;
  color: var(--color-danger) !important;
  border: 1px solid var(--color-border) !important;
}

.thread-content-body :deep(pre .copy-code-btn),
.thread-code-block :deep(pre .copy-code-btn) {
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

.thread-content-body :deep(pre .copy-code-btn:hover),
.thread-code-block :deep(pre .copy-code-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-1px);
}

.thread-content-body :deep(pre .copy-code-btn.copied),
.thread-code-block :deep(pre .copy-code-btn.copied) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.delete-message {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}
</style>
