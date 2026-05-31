<template>
  <AdminPageShell
    title="Blog Management"
    kicker="Admin Publishing"
    subtitle="Manage official posts. Only admins can create and publish blog content."
    :metrics="metrics"
  >
    <template #actions>
      <router-link class="btn btn-primary create-btn" to="/admin/blogs/create">
        <i class="bi bi-plus-lg"></i>
        <span>Create Blog</span>
      </router-link>
    </template>

    <section class="admin-panel posts-panel">
      <div class="panel-heading">
        <div>
          <h2>Recent Blog Posts</h2>
          <p>Track admin-created blog content and publishing status.</p>
        </div>
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="search" type="search" placeholder="Search posts">
        </label>
      </div>

      <!-- Premium Status Filter Tabs -->
      <div class="filter-tabs mb-4">
        <button 
          v-for="tab in ['all', 'published', 'draft', 'scheduled']" 
          :key="tab"
          @click="activeTab = tab"
          :class="['tab-btn', { active: activeTab === tab }]"
        >
          <span class="tab-label">{{ tab }}</span>
          <span class="tab-badge">{{ getTabCount(tab) }}</span>
        </button>
      </div>

      <div class="post-list">
        <!-- Skeleton Loading State -->
        <template v-if="blogStore.isLoading && blogStore.ownBlogs.length === 0">
          <article v-for="i in 3" :key="i" class="post-row skeleton-row animate-pulse">
            <span class="post-thumb skeleton-thumb shimmer"></span>
            <div class="flex-grow-1 d-flex flex-column gap-2 ms-2">
              <div class="skeleton-line w-50 shimmer"></div>
              <div class="skeleton-line w-75 shimmer"></div>
              <div class="skeleton-line w-25 shimmer"></div>
            </div>
            <div class="post-actions-block">
              <div class="skeleton-badge shimmer"></div>
              <div class="skeleton-btn shimmer"></div>
            </div>
          </article>
        </template>
        <div v-else-if="visiblePosts.length === 0" class="py-5 text-center text-muted">
          <i class="bi bi-file-earmark-x display-6 mb-2 d-block"></i>
          <span>No {{ activeTab !== 'all' ? activeTab : '' }} blog posts found matching your search.</span>
        </div>
        <article 
          v-else 
          v-for="post in visiblePosts" 
          :key="post.id || post.title" 
          class="post-row clickable-row"
          @click="navigateToDetail(post.id)"
        >
          <span class="post-thumb">
            <img v-if="post.image" :src="post.image" @error="handleImgError" class="thumb-img" alt="Post thumbnail">
            <i v-else class="bi bi-file-earmark-post"></i>
          </span>
          <div>
            <h3>{{ post.title }}</h3>
            <p class="post-desc">{{ post.description }}</p>
            <div class="post-meta">
              <span><strong>Category:</strong> {{ post.category }} (ID: {{ post.category_id }})</span>
              <span class="mx-1">•</span>
              <span><i class="bi bi-calendar3"></i> {{ post.date || 'Recent' }}</span>
              <span v-if="post.author" class="mx-1">•</span>
              <span v-if="post.author"><i class="bi bi-person"></i> {{ post.author }}</span>
            </div>
          </div>
          <div class="post-actions-block" @click.stop>
            <span :class="['status-pill', post.status]">{{ post.status }}</span>
            
            <!-- Actions Dropdown Container -->
            <div class="actions-dropdown-container">
              <button @click.stop="toggleMenu(post.id)" class="btn-action-dots" title="Actions">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              
              <div v-if="activeMenuId === post.id" class="actions-dropdown-menu">
                <button @click.stop="editBlog(post)" class="dropdown-item">
                  <i class="bi bi-pencil-fill text-primary"></i>
                  <span>Edit</span>
                </button>
                <button @click.stop="deleteBlog(post.id)" class="dropdown-item delete">
                  <i class="bi bi-trash-fill text-danger"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <!-- Beautiful BaseModal for Edit Blog -->
    <BaseModal
      v-if="showModal"
      title="Edit Blog Article"
      icon="bi bi-pencil-fill"
      kicker=""
      @closeModal="showModal = false"
    >
      <form class="edit-blog-form" @submit.prevent="submitForm">
        <div class="field-block">
          <label>Article Title</label>
          <input v-model="form.title" class="form-control" type="text" placeholder="Enter article title" required>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Category</label>
            <select v-model="form.category_id" class="form-select" required>
              <option v-for="cat in blogStore.categories" :key="cat.id" :value="cat.id.toString()">
                {{ cat.name || cat.title }}
              </option>
            </select>
          </div>

          <div class="field-block">
            <label>Status</label>
            <select v-model="form.status" class="form-select" required>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div class="field-block">
          <label>Thumbnail Image</label>
          <div class="thumbnail-dropzone rounded-4 border-dashed border-theme p-3 text-center position-relative transition-all bg-surface-hover">
            <input type="file" @change="handleFileChange" accept="image/*" class="position-absolute w-100 h-100 top-0 start-0 opacity-0 cursor-pointer">
            <div v-if="thumbnailPreview" class="d-flex flex-column align-items-center">
              <img :src="thumbnailPreview" class="img-preview rounded-3 mb-2 border border-theme" style="max-height: 120px; max-width: 100%; object-fit: cover;">
              <span class="text-purple small fw-semibold">Click to replace thumbnail</span>
            </div>
            <div v-else class="text-center py-3">
              <i class="bi bi-image text-muted display-6 mb-2 d-block"></i>
              <span class="text-muted small">Drag & drop or click to upload thumbnail</span>
            </div>
          </div>
        </div>

        <div class="field-block">
          <label>Content / Description</label>
          <textarea v-model="form.description" class="form-control" rows="4" placeholder="Enter description/content..." required></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-light border" @click="showModal = false">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="blogStore.isLoading">
            <span v-if="blogStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import { useBlogStore } from '../../stores/BlogStore.js';
import { useToast } from '../../composables/useToast.js';
import BaseModal from '../../components/base/BaseModal.vue';

const blogStore = useBlogStore();
const router = useRouter();
const toast = useToast();
const search = ref('');
const activeTab = ref('all');
const activeMenuId = ref(null);

onMounted(async () => {
  try {
    await blogStore.fetchCategories();
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
  try {
    await blogStore.fetchAllBlogs();
  } catch (err) {
    console.error('Failed to fetch all blogs:', err);
  }
});

const getTabCount = (tab) => {
  const items = blogStore.ownBlogs || [];
  if (tab === 'all') return items.length;
  return items.filter(b => b.status === tab).length;
};

const metrics = computed(() => [
  { label: 'Admin Posts', value: blogStore.ownBlogs.length.toString(), change: 'Only admins publish', icon: 'bi-file-earmark-text', className: 'blue' },
  { label: 'Published', value: blogStore.blogs.length.toString(), change: 'Live content', icon: 'bi-send-check', className: 'green' },
  { label: 'Drafts', value: blogStore.drafts.length.toString(), change: 'Needs editing', icon: 'bi-pencil', className: 'purple' },
  { label: 'Scheduled', value: blogStore.ownBlogs.filter(b => b.status === 'scheduled').length.toString(), change: 'This week', icon: 'bi-calendar-event', className: 'orange' },
]);

const visiblePosts = computed(() => {
  const needle = search.value.toLowerCase();
  let items = blogStore.ownBlogs || [];

  // Filter by Tab Status
  if (activeTab.value !== 'all') {
    items = items.filter(post => post.status === activeTab.value);
  }

  // Filter by Search Query
  if (!needle) return items;
  return items.filter((post) => 
    (post.title || '').toLowerCase().includes(needle) || 
    (post.description || '').toLowerCase().includes(needle)
  );
});

const handleImgError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800';
};

const navigateToDetail = (id) => {
  router.push(`/blog/${id}`);
};

const toggleMenu = (id) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null;
  } else {
    activeMenuId.value = id;
  }
};

const closeAllMenus = () => {
  activeMenuId.value = null;
};

onMounted(() => {
  document.addEventListener('click', closeAllMenus);
});

onUnmounted(() => {
  document.removeEventListener('click', closeAllMenus);
});

const showModal = ref(false);
const editingBlogId = ref(null);
const thumbnailPreview = ref(null);

const form = ref({
  title: '',
  description: '',
  category_id: '1',
  status: 'published',
  thumbnail: null
});

const openEditModal = (post) => {
  editingBlogId.value = post.id;
  thumbnailPreview.value = post.image || null;
  form.value = {
    title: post.title,
    description: post.description || post.content || '',
    category_id: post.category_id ? post.category_id.toString() : '1',
    status: post.status || 'published',
    thumbnail: null
  };
  showModal.value = true;
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.thumbnail = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      thumbnailPreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = async () => {
  const formData = new FormData();
  formData.append('title', form.value.title);
  formData.append('description', form.value.description);
  formData.append('category_id', form.value.category_id);
  formData.append('status', form.value.status);
  
  if (form.value.thumbnail) {
    formData.append('thumbnail', form.value.thumbnail);
  }

  try {
    await blogStore.updateBlog(editingBlogId.value, formData);
    toast.success('Blog article updated successfully.');
    showModal.value = false;
    await blogStore.fetchAllBlogs();
  } catch (err) {
    console.error("Failed to update blog:", err);
    toast.error('Failed to update blog.');
  }
};

const editBlog = (post) => {
  activeMenuId.value = null;
  openEditModal(post);
};

const deleteBlog = async (id) => {
  activeMenuId.value = null;
  if (confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
    try {
      await blogStore.deleteOwnBlog(id);
      toast.success('Blog deleted successfully.');
      await blogStore.fetchAllBlogs();
    } catch (err) {
      console.error('Failed to delete blog:', err);
      toast.error('Failed to delete blog.');
    }
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-heading h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-heading p {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  margin: 0;
}

.search-box {
  min-width: min(320px, 55vw);
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.8rem;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
}

/* Premium Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 0;
  padding: 0.5rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-transform: capitalize;
}

.tab-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--color-border);
  color: var(--color-text-muted);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.tab-btn.active .tab-badge {
  background: var(--color-primary);
  color: #fff;
}

.post-list {
  display: grid;
  gap: 0.75rem;
}

.post-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.post-thumb {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-info);
  background: var(--color-info-light);
  border-radius: 8px;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-row h3 {
  color: var(--color-text);
  font-size: 0.98rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
}

.post-desc {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.post-meta {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.6rem;
}

.post-actions-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.clickable-row {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.clickable-row:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary) !important;
  box-shadow: var(--shadow-md) !important;
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
  display: flex;
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
  from { opacity: 0; transform: translateY(-4px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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

.status-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  text-transform: capitalize;
}

.status-pill.published {
  color: var(--color-success);
  background: var(--color-success-light);
}

.status-pill.draft {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.status-pill.scheduled {
  color: var(--color-info);
  background: var(--color-info-light);
}

@media (max-width: 767.98px) {
  .panel-heading,
  .post-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: 0;
  }
}

/* Shimmer Skeleton Styles */
.skeleton-row {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.skeleton-line {
  height: 12px;
  background: var(--color-border-soft, rgba(0, 0, 0, 0.08));
  border-radius: 4px;
}

[data-theme='dark'] .skeleton-line {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--color-border-soft, rgba(0, 0, 0, 0.08));
}

[data-theme='dark'] .skeleton-thumb {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-badge {
  width: 64px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border-soft, rgba(0, 0, 0, 0.08));
}

[data-theme='dark'] .skeleton-badge {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--color-border-soft, rgba(0, 0, 0, 0.08));
}

[data-theme='dark'] .skeleton-btn {
  background: rgba(255, 255, 255, 0.05);
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-border-soft, rgba(0, 0, 0, 0.08)) 25%,
    var(--color-surface-hover, rgba(0, 0, 0, 0.04)) 37%,
    var(--color-border-soft, rgba(0, 0, 0, 0.08)) 63%
  );
  background-size: 400% 100%;
  animation: shimmer-animation 1.4s ease infinite;
}

[data-theme='dark'] .shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 37%,
    rgba(255, 255, 255, 0.04) 63%
  );
  background-size: 400% 100%;
}

@keyframes shimmer-animation {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.edit-blog-form {
  display: grid;
  gap: 0.85rem;
}

.field-block {
  display: grid;
  gap: 0.4rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1rem;
}

.thumbnail-dropzone {
  cursor: pointer;
  border-width: 2px;
  border-style: dashed;
}

.thumbnail-dropzone:hover {
  border-color: var(--color-purple) !important;
}

.border-dashed {
  border-style: dashed !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

.bg-surface-hover {
  background-color: var(--color-surface-hover) !important;
}
</style>
