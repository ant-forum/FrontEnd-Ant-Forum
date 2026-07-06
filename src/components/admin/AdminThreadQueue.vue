<template>
  <section class="admin-panel">
    <div class="panel-title-row list-toolbar">
      <div>
        <h2>Thread Management</h2>
        <p>
          Monitor discussion threads, filter by category/tags, and manage
          community posts.
        </p>
      </div>
      <div class="toolbar-controls">
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input
            v-model.trim="query"
            type="search"
            placeholder="Search discussions..."
          />
        </label>
        <select
          v-model="categoryFilter"
          class="form-select compact-select"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          <option
            v-for="cat in forumStore.categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name || cat.type }}
          </option>
        </select>
        <select
          v-model="tagFilter"
          class="form-select compact-select"
          aria-label="Filter by tag"
        >
          <option value="all">All Tags</option>
          <option
            v-for="tag in tagsStore.tags"
            :key="tag.id"
            :value="tag.name || tag.label"
          >
            {{ tag.name || tag.label }}
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="hasActiveFilters"
      class="active-filters"
      aria-label="Active thread filters"
    >
      <span>Filtered by</span>
      <button
        v-if="query"
        type="button"
        class="filter-chip"
        @click="query = ''"
      >
        Search: {{ query }}
        <i class="bi bi-x"></i>
      </button>
      <button
        v-if="categoryFilter !== 'all'"
        type="button"
        class="filter-chip"
        @click="categoryFilter = 'all'"
      >
        Category: {{ getCategoryName(categoryFilter) }}
        <i class="bi bi-x"></i>
      </button>
      <button
        v-if="tagFilter !== 'all'"
        type="button"
        class="filter-chip"
        @click="tagFilter = 'all'"
      >
        Tag: {{ tagFilter }}
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div class="table-responsive">
      <table class="table clean-table align-middle mb-0">
        <thead>
          <tr>
            <th>Thread Forum</th>
            <th>User</th>
            <th>Category</th>
            <th>Tag</th>
            <th class="text-center">Replies</th>
            <th>Created</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody v-if="visibleThreads.length">
          <tr v-for="thread in paginatedThreads" :key="thread.id">
            <td>
              <div style="min-width: 260px;">
                <strong
                  class="thread-title-clickable"
                  style="display: block;"
                  @click="goToThread(thread.id)"
                >
                  {{ thread.title }}
                </strong>
                <small
                  class="text-truncate text-muted"
                  style="max-width: 300px; display: block;"
                  >{{ thread.excerpt || "No description provided." }}</small
                >
              </div>
            </td>
            <td>
              <div
                class="identity-cell"
              >
                <img
                  v-if="getThreadAuthor(thread).avatar && !failedAvatars.has(thread.id)"
                  :src="getThreadAuthor(thread).avatar"
                  :alt="`${getThreadAuthor(thread).name} profile picture`"
                  class="avatar-image"
                  @error="handleAvatarError(thread.id)"
                />
                <span v-else class="avatar-dot">
                  {{ initials(getThreadAuthor(thread).name) }}
                </span>
                <span class="user-name-text">
                  {{ getThreadAuthor(thread).name }}
                </span>
              </div>
            </td>
            <td>
              <span class="category-badge">
                {{
                  thread.categoryLabel ||
                  thread.categoryMeta?.label ||
                  thread.category ||
                  "Discussion"
                }}
              </span>
            </td>
            <td>
              <div class="tags-row-container">
                <span
                  v-for="tag in thread.tags"
                  :key="tag.label"
                  :class="['tag-pill-badge', tag.color || 'gray']"
                >
                  {{ tag.label }}
                </span>
                <span
                  v-if="!thread.tags || !thread.tags.length"
                  class="tag-pill-badge gray"
                  >no tag</span
                >
              </div>
            </td>
            <td class="text-center">
              <span class="replies-count">
                <i class="bi bi-chat-left-text-fill text-muted me-1"></i>
                {{
                  Array.isArray(thread.replies)
                    ? thread.replies.length
                    : thread.replies || 0
                }}
              </span>
            </td>
            <td>{{ formatDate(thread.createdAt || thread.created_at) }}</td>
            <td class="text-end">
              <div class="actions-dropdown-container">
                <button
                  class="btn-action-dots"
                  type="button"
                  title="Actions"
                  @click.stop="toggleMenu(thread.id)"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>

                <div
                  v-if="activeMenuId === thread.id"
                  class="actions-dropdown-menu"
                >
                  <button
                    v-if="isOwnThread(thread)"
                    type="button"
                    @click.stop="handleEditClick(thread)"
                    class="dropdown-item"
                  >
                    <i class="bi bi-pencil-fill text-primary"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="handleDeleteClick(thread)"
                    class="dropdown-item delete"
                  >
                    <i class="bi bi-trash-fill text-danger"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="7" class="empty-state">
              <i class="bi bi-chat-square-dots"></i>
              <strong>No discussions found</strong>
              <span>Clear your filters or create a new discussion thread.</span>
              <button
                v-if="hasActiveFilters"
                class="btn btn-light btn-sm border empty-action"
                type="button"
                @click="clearFilters"
              >
                <i class="bi bi-x-circle"></i>
                Clear Filters
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <footer v-if="visibleThreads.length" class="pagination-footer mt-3">
      <p>
        Showing <strong>{{ firstVisibleRow }}-{{ lastVisibleRow }}</strong> of
        <strong>{{ visibleThreads.length }}</strong> forums
      </p>

      <nav
        v-if="totalPages > 1"
        class="pagination-controls"
        aria-label="Forums list pagination"
      >
        <button
          class="pagination-btn"
          type="button"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          title="Previous page"
          @click="currentPage -= 1"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          class="pagination-btn"
          :class="{ active: currentPage === page }"
          type="button"
          :aria-current="currentPage === page ? 'page' : undefined"
          :aria-label="`Page ${page}`"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          class="pagination-btn"
          type="button"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          title="Next page"
          @click="currentPage += 1"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </nav>
    </footer>
  </section>

  <!-- Delete Confirmation Modal -->
  <BaseModal
    v-if="showDeleteModal && threadToDelete"
    title="Delete Discussion"
    icon="bi bi-trash"
    theme="danger"
    @closeModal="closeDeleteModal"
  >
    <p class="delete-message text-adaptive">
      Are you sure you want to delete the discussion
      <strong>{{ threadToDelete.title }}</strong
      >? This action will permanently delete this discussion and all associated
      replies from the system.
    </p>
    <div class="modal-actions mt-3">
      <button
        class="btn btn-light border"
        type="button"
        @click="closeDeleteModal"
      >
        Cancel
      </button>
      <button
        class="btn btn-danger"
        type="button"
        :disabled="isSubmitting"
        @click="confirmDelete"
      >
        <span
          v-if="isSubmitting"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        <i class="bi bi-trash me-1"></i>
        <span>Confirm Delete</span>
      </button>
    </div>
  </BaseModal>

  <!-- Create / Edit Form Modal -->
  <BaseModal
    v-if="showCreateModal || showEditModal"
    :title="showEditModal ? 'Edit Discussion' : 'Create New Discussion'"
    :icon="showEditModal ? 'bi bi-pencil-square' : 'bi-plus-circle'"
    @closeModal="closeFormModal"
  >
    <form @submit.prevent="submitForm" class="crud-form">
      <div class="form-group mb-3">
        <label class="form-label font-weight-bold"
          >Title <span class="text-danger">*</span></label
        >
        <input
          v-model="form.title"
          type="text"
          class="form-control"
          required
          placeholder="Enter discussion title (min 12 chars)"
        />
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label font-weight-bold"
            >Category <span class="text-danger">*</span></label
          >
          <select v-model="form.category" class="form-select" required>
            <option value="" disabled>Select Category</option>
            <option
              v-for="cat in forumStore.categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name || cat.type }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label font-weight-bold"
            >Tag <span class="text-danger">*</span></label
          >
          <select v-model="form.tag" class="form-select" required>
            <option value="" disabled>Select Tag</option>
            <option
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              :value="tag.name || tag.label"
            >
              {{ tag.name || tag.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-group mb-3">
        <label class="form-label font-weight-bold"
          >Description / Body <span class="text-danger">*</span></label
        >
        <textarea
          v-model="form.description"
          class="form-control"
          rows="5"
          required
          placeholder="Describe the discussion subject (min 25 chars)"
        ></textarea>
      </div>

      <div class="form-group mb-3">
        <label class="form-check-label d-flex align-items-center">
          <input
            type="checkbox"
            v-model="form.hasCode"
            class="form-check-input me-2"
          />
          <span>Attach code snippet</span>
        </label>
      </div>

      <div v-if="form.hasCode" class="form-group mb-3">
        <label class="form-label font-weight-bold">Code Snippet</label>
        <textarea
          v-model="form.code"
          class="form-control code-font"
          rows="5"
          placeholder="// Paste code here..."
        ></textarea>
      </div>

      <div class="modal-actions">
        <button
          class="btn btn-secondary me-2"
          type="button"
          @click="closeFormModal"
        >
          Cancel
        </button>
        <button
          class="btn btn-success"
          type="submit"
          :disabled="isSubmitting || !isFormValid"
        >
          {{
            isSubmitting
              ? "Saving..."
              : showEditModal
                ? "Save Changes"
                : "Publish"
          }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import BaseModal from "../base/BaseModal.vue";
import { useToast } from "../../composables/useToast";
import { useForumStore } from "../../stores/ForumStore";
import { useTagsStore } from "../../stores/TagsStore";
import { useAuthStore } from "../../stores/AuthStore";
import { useUsersStore } from "../../stores/UsersStore";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const router = useRouter();
const forumStore = useForumStore();
const tagsStore = useTagsStore();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const toast = useToast();

const query = ref("");
const categoryFilter = ref("all");
const tagFilter = ref("all");

const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() =>
  Math.max(1, Math.ceil(visibleThreads.value.length / pageSize)),
);
const firstVisibleRow = computed(() =>
  visibleThreads.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize + 1,
);
const lastVisibleRow = computed(() =>
  Math.min(currentPage.value * pageSize, visibleThreads.value.length),
);
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);
const paginatedThreads = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return visibleThreads.value.slice(start, start + pageSize);
});

watch([query, categoryFilter, tagFilter], () => {
  currentPage.value = 1;
});

const selectedId = ref(null);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const threadToDelete = ref(null);
const isSubmitting = ref(false);

const activeMenuId = ref(null);

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const closeMenu = () => {
  activeMenuId.value = null;
};

const handleEditClick = (thread) => {
  closeMenu();
  openEdit(thread);
};

const handleDeleteClick = (thread) => {
  closeMenu();
  handleDelete(thread);
};

const goToThread = (id) => {
  router.push(`/admin/threads/${id}`);
};

const goToProfile = (userId) => {
  if (userId) {
    router.push(`/viewprofile/${userId}`);
  }
};

const failedAvatars = ref(new Set());

const handleAvatarError = (id) => {
  failedAvatars.value.add(id);
};

const getThreadAuthor = (thread) => {
  const name =
    thread.author?.name ||
    thread.author?.username ||
    (typeof thread.author === "string" ? thread.author : "") ||
    "Anonymous";

  const userId = thread.user_id || thread.userId;
  let avatar = "";

  if (userId && usersStore.users && usersStore.users.length > 0) {
    const matchedUser = usersStore.users.find(
      (u) =>
        Number(u.id) === Number(userId) ||
        Number(u.user_id) === Number(userId),
    );
    if (matchedUser) {
      avatar = matchedUser.profile_pic || matchedUser.avatar || "";
    }
  }

  if (!avatar) {
    if (thread.author && typeof thread.author === "object") {
      avatar = thread.author.profile_pic || thread.author.avatar || "";
    } else {
      avatar = thread.author_avatar || thread.avatar || "";
    }
  }

  return {
    name,
    avatar: avatar ? resolveMediaUrl(avatar) : "",
  };
};

onMounted(async () => {
  document.addEventListener("click", closeMenu);
  try {
    await usersStore.fetchUsers(true);
  } catch (err) {
    console.error("Failed to load user avatars:", err);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenu);
});

const form = ref({
  id: null,
  title: "",
  category: "",
  tag: "",
  description: "",
  code: "",
  hasCode: false,
});

const isFormValid = computed(() => {
  return (
    form.value.title.trim().length >= 12 &&
    form.value.description.trim().length >= 25 &&
    form.value.category &&
    form.value.tag
  );
});

const isOwnThread = (thread) => {
  if (!thread || !authStore.user) return false;
  return (
    Number(thread.user_id) === Number(authStore.user.id) ||
    thread.author === authStore.user.username ||
    (thread.author?.username &&
      thread.author.username === authStore.user.username)
  );
};

const getCategoryName = (id) => {
  const cat = forumStore.categories.find((c) => c.id === id);
  return cat ? cat.name || cat.type : id;
};

const visibleThreads = computed(() => {
  const needle = query.value.toLowerCase();
  return forumStore.discussions.filter((thread) => {
    const matchesQuery =
      !needle ||
      thread.title?.toLowerCase().includes(needle) ||
      thread.excerpt?.toLowerCase().includes(needle) ||
      thread.description?.toLowerCase().includes(needle) ||
      (typeof thread.author === "string" &&
        thread.author.toLowerCase().includes(needle)) ||
      thread.author?.name?.toLowerCase().includes(needle) ||
      thread.author?.username?.toLowerCase().includes(needle);

    const matchesCategory =
      categoryFilter.value === "all" ||
      String(thread.category_id) === String(categoryFilter.value) ||
      thread.category === categoryFilter.value;

    const matchesTag =
      tagFilter.value === "all" ||
      thread.tags?.some(
        (t) =>
          t.label === tagFilter.value ||
          String(t.id) === String(tagFilter.value),
      );

    return matchesQuery && matchesCategory && matchesTag;
  });
});

const hasActiveFilters = computed(
  () =>
    Boolean(query.value) ||
    categoryFilter.value !== "all" ||
    tagFilter.value !== "all",
);

const clearFilters = () => {
  query.value = "";
  categoryFilter.value = "all";
  tagFilter.value = "all";
};

const openCreate = () => {
  form.value = {
    id: null,
    title: "",
    category: forumStore.categories[0]?.id || "",
    tag: tagsStore.tags[0]?.name || tagsStore.tags[0]?.label || "",
    description: "",
    code: "",
    hasCode: false,
  };
  showCreateModal.value = true;
};

const openEdit = (thread) => {
  form.value = {
    id: thread.id,
    title: thread.title || "",
    category: thread.category_id || "",
    tag: thread.tags?.[0]?.label || thread.tags?.[0]?.name || "",
    description: thread.description || thread.body || thread.excerpt || "",
    code: thread.code || "",
    hasCode: Boolean(thread.code),
  };
  showEditModal.value = true;
};

const closeFormModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
};

const handleDelete = (thread) => {
  threadToDelete.value = thread;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  threadToDelete.value = null;
};

const confirmDelete = async () => {
  if (!threadToDelete.value) return;
  isSubmitting.value = true;
  try {
    await forumStore.adminDeleteForum(threadToDelete.value.id);
    toast.success("Discussion thread successfully deleted.");
    closeDeleteModal();
  } catch (err) {
    toast.error(err.message || err || "Failed to delete discussion.");
  } finally {
    isSubmitting.value = false;
  }
};

const submitForm = async () => {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  try {
    const payload = {
      title: form.value.title,
      description: form.value.description,
      category_id: form.value.category,
      category: form.value.category,
      tags: [form.value.tag],
      code: form.value.hasCode ? form.value.code : null,
      hasCode: form.value.hasCode,
    };

    if (showEditModal.value) {
      await forumStore.updateDiscussion(form.value.id, payload);
      toast.success("Discussion thread updated successfully.");
    } else {
      await forumStore.createDiscussion(payload);
      toast.success("New discussion thread created successfully.");
    }
    closeFormModal();
  } catch (err) {
    toast.error(err.message || err || "Failed to save discussion.");
  } finally {
    isSubmitting.value = false;
  }
};

const initials = (name) => {
  if (!name) return "AN";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

defineExpose({
  openCreate,
});
</script>

<style scoped>
.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}
.panel-title-row,
.toolbar-controls,
.identity-cell,
.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.panel-title-row {
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.panel-title-row h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}
.panel-title-row p {
  color: var(--color-text-muted);
  margin: 0;
}
.toolbar-controls {
  flex-wrap: wrap;
  justify-content: flex-end;
}
.search-box {
  min-width: min(260px, 50vw);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
.search-box input {
  width: 100%;
  color: var(--color-text);
  background: transparent;
  border: 0;
  outline: 0;
}
.compact-select {
  width: auto;
  min-width: 140px;
  height: 40px;
  font-size: 0.82rem;
}
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid rgba(84, 131, 179, 0.22);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}
.filter-chip:hover {
  border-color: var(--color-primary);
}
.clean-table th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
.identity-cell {
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.identity-cell strong,
.identity-cell small {
  display: block;
}
.identity-cell small {
  color: var(--color-text-muted);
}
.avatar-dot {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 50%;
  font-size: 0.76rem;
  font-weight: 800;
}
.lock-icon {
  color: var(--color-primary);
}
.empty-state {
  padding: 2.5rem !important;
  color: var(--color-text-muted);
  text-align: center;
}
.empty-state > i,
.empty-state strong,
.empty-state span {
  display: block;
}
.empty-state > i {
  margin-bottom: 0.45rem;
  color: var(--color-primary);
  font-size: 1.45rem;
}
.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.85rem;
  font-weight: 700;
}
.empty-action i {
  color: inherit;
}
.review-content {
  display: grid;
  gap: 1rem;
}
.modal-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
}
@media (max-width: 991.98px) {
  .panel-title-row {
    flex-direction: column;
  }
  .toolbar-controls,
  .search-box {
    width: 100%;
  }
  .compact-select {
    flex: 1;
  }
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
.tag-pill-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}
.tag-pill-badge.green {
  background: var(--color-success-light);
  color: var(--color-success);
}
.tag-pill-badge.blue {
  background: var(--color-info-light);
  color: var(--color-info);
}
.tag-pill-badge.orange {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
.tag-pill-badge.blue {
  background: var(--color-blue-light);
  color: var(--color-blue);
}
.tag-pill-badge.gray {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}
.tags-row-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.code-font {
  font-family: var(
    --font-mono,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace
  );
  font-size: 0.82rem;
}
.action-buttons-group {
  display: inline-flex;
  gap: 0.35rem;
}
.crud-form .form-label {
  color: var(--color-text);
}
.crud-form .form-control,
.crud-form .form-select {
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 8px;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}
.crud-form .form-control:focus,
.crud-form .form-select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  background-color: var(--color-surface);
}
.content-preview {
  padding: 0.85rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  white-space: pre-wrap;
}

/* Pagination Footer */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: 1rem;
}
.pagination-footer p {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  margin: 0;
}
.pagination-footer strong {
  color: var(--color-text);
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.pagination-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pagination-btn:hover:not(:disabled) {
  color: var(--color-primary);
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}
.pagination-btn.active {
  color: #fff;
  background: var(--color-primary);
  border-color: var(--color-primary);
}
.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.delete-message {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}
.delete-message strong {
  color: var(--color-text);
}

/* Premium Actions Dropdown */
.actions-dropdown-container {
  position: relative;
  display: inline-block;
}

.btn-action-dots {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.btn-action-dots:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.actions-dropdown-menu {
  position: absolute;
  right: 0;
  top: 110%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 0.35rem;
  z-index: 100;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  animation: dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.4rem 0.65rem;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.dropdown-item i {
  font-size: 0.9rem;
}

.dropdown-item.delete {
  color: var(--color-danger, #ef4444);
}

.dropdown-item.delete:hover {
  background: var(--color-danger-light, rgba(239, 68, 68, 0.12));
  color: var(--color-danger, #ef4444);
}

.avatar-image {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}

.thread-title-clickable {
  color: var(--color-text);
  cursor: pointer;
  transition: color var(--transition-base);
}

.thread-title-clickable:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.user-clickable {
  cursor: pointer;
}

.user-clickable:hover .user-name-text {
  color: var(--color-primary);
  text-decoration: underline;
}

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
    align-items: stretch !important;
  }
  .toolbar-controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch !important;
  }
  .search-box {
    min-width: 0 !important;
    width: 100%;
  }
  .compact-select {
    width: 100%;
  }
}
</style>
