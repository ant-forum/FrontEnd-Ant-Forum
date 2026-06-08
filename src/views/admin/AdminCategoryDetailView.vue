<template>
  <AdminPageShell
    :title="category ? category.name : 'Category Detail'"
    kicker="Category Overview"
    :subtitle="category ? `Taxonomy detail view for Category: ${category.name}` : 'Category details page'"
    :metrics="metrics"
    :breadcrumbs="breadcrumbs"
  >
    <template #before-title>
      <router-link class="btn btn-light border back-link" to="/admin/categories">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Categories</span>
      </router-link>
    </template>

    <!-- Premium Shimmer Skeleton Loader -->
    <div v-if="isPageLoading" class="skeleton-page-container w-100">
      <!-- Category Hero Skeleton -->
      <div class="skeleton-hero mb-4 rounded-4 p-4 p-sm-5 border position-relative overflow-hidden">
        <div class="position-relative d-flex align-items-center gap-4 flex-column flex-sm-row z-1">
          <div class="skeleton-icon rounded-4 flex-shrink-0"></div>
          <div class="flex-grow-1 w-100 text-start">
            <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div class="skeleton-title rounded" style="width: 240px; height: 32px;"></div>
              <div class="skeleton-badge rounded-pill" style="width: 80px; height: 24px;"></div>
            </div>
            <div class="skeleton-text rounded mb-2.5" style="width: 85%; height: 16px;"></div>
            <div class="skeleton-text rounded" style="width: 50%; height: 16px;"></div>
          </div>
        </div>
      </div>

      <!-- Controls Skeleton -->
      <div class="skeleton-panel border rounded-4 p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-4">
          <div>
            <div class="skeleton-title rounded mb-2" style="width: 180px; height: 24px;"></div>
            <div class="skeleton-text rounded" style="width: 280px; height: 14px;"></div>
          </div>
          <div class="skeleton-search rounded-pill" style="width: 290px; height: 40px;"></div>
        </div>
        <div class="skeleton-tabs rounded-3 mb-4" style="width: 250px; height: 38px;"></div>

        <!-- Post Cards Skeleton Grid -->
        <div class="post-cards-grid">
          <div v-for="n in 3" :key="n" class="skeleton-card border rounded-4 overflow-hidden">
            <div class="skeleton-card-image" style="height: 170px;"></div>
            <div class="p-4 d-flex flex-column" style="height: 270px;">
              <div class="skeleton-title rounded mb-3" style="width: 80%; height: 20px;"></div>
              <div class="skeleton-text rounded mb-2" style="width: 95%; height: 14px;"></div>
              <div class="skeleton-text rounded mb-2" style="width: 90%; height: 14px;"></div>
              <div class="skeleton-text rounded mb-4" style="width: 60%; height: 14px;"></div>
              
              <div class="skeleton-meta-footer mt-auto pt-3 d-flex align-items-center gap-3">
                <div class="skeleton-avatar rounded-circle" style="width: 32px; height: 32px;"></div>
                <div class="flex-grow-1">
                  <div class="skeleton-text rounded mb-1.5" style="width: 100px; height: 12px;"></div>
                  <div class="skeleton-text rounded" style="width: 60px; height: 10px;"></div>
                </div>
                <div class="skeleton-btn rounded-pill" style="width: 70px; height: 30px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="category">
      <!-- Premium Category Hero Section -->
      <section 
        :class="['category-hero-banner mb-4 border rounded-4 overflow-hidden position-relative p-4 p-sm-5', category.colorClass || 'purple']"
      >
        <div class="position-relative d-flex align-items-center justify-content-between gap-4 flex-wrap flex-md-nowrap z-1 w-100">
          <div class="d-flex align-items-center gap-4 flex-column flex-sm-row text-center text-sm-start w-100">
            <div class="category-icon-wrapper rounded-4 d-flex align-items-center justify-content-center shadow-lg flex-shrink-0 animate-float">
              <i class="bi bi-grid-fill fs-2"></i>
            </div>
            
            <div class="flex-grow-1 min-width-0 text-start">
              <div class="hero-title-container mb-2">
                <h2 class="hero-title">{{ category.name }}</h2>
                <span class="badge category-badge">
                  <i class="bi bi-layers me-1.5"></i>{{ category.type || 'General' }}
                </span>
              </div>
              <p class="category-desc-hero m-0">
                {{ category.description || 'No official description provided for this category taxonomy. Edit this category to add an official description.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Posts List Panel -->
      <section class="admin-panel posts-panel shadow-sm border rounded-4 p-4 bg-surface mb-4">
        <div class="panel-heading d-flex justify-content-between align-items-center mb-4 flex-wrap gap-4">
          <div>
            <h3 class="m-0 fw-bold text-adaptive heading-panel">Articles in Category</h3>
            <p class="text-muted small m-0 mt-1">Review all active publications assigned to the "{{ category.name }}" classification.</p>
          </div>
          
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input 
              v-model.trim="search" 
              type="search" 
              placeholder="Search articles..." 
              class="search-box"
            >
          </div>
        </div>

        <!-- Glass control filter tabs -->
        <div class="tabs-container">
          <button 
            v-for="tab in ['all', 'published', 'draft']" 
            :key="tab"
            @click="activeTab = tab"
            :class="['tab-btn transition-all text-capitalize', { active: activeTab === tab }]"
          >
            <span class="tab-label">{{ tab }}</span>
            <span class="tab-badge">{{ getTabCount(tab) }}</span>
          </button>
        </div>

        <!-- Publications Grid -->
        <div v-if="visiblePosts.length === 0" class="text-center py-5 border rounded-4 border-dashed bg-input">
          <i class="bi bi-journal-x display-6 mb-2 d-block text-muted"></i>
          <span class="text-muted small">No articles found in this category.</span>
        </div>
        <div v-else class="post-cards-grid">
          <div v-for="post in visiblePosts" :key="post.id" class="post-card">
            <div class="card-image-wrap">
              <img :src="post.image" @error.once="handleImgError" class="card-img-top zoom-hover" alt="Article Cover">
              <span :class="['status-badge', post.status]">
                {{ post.status }}
              </span>
            </div>
            
            <div class="card-body">
              <h4 class="title-text">{{ post.title }}</h4>
              <p class="description-text">{{ post.excerpt || post.description }}</p>
              
              <div class="card-footer-meta">
                <img :src="post.author_avatar || 'https://i.pravatar.cc/150?u=author'" class="rounded-circle object-fit-cover author-avatar" width="30" height="30">
                <div class="flex-grow-1 min-width-0 text-start">
                  <strong class="text-adaptive d-block text-truncate" style="font-size: 0.78rem; font-weight: 800;">{{ post.author }}</strong>
                  <span class="text-muted d-block" style="font-size: 0.7rem;"><i class="bi bi-calendar3 me-1"></i>{{ post.date }}</span>
                </div>
                <router-link :to="'/blog/' + post.id" target="_blank" class="btn btn-view-article btn-sm rounded-pill px-3 py-1.5 flex-shrink-0" style="font-size: 0.76rem; font-weight: 800;">
                  View <i class="bi bi-arrow-right-short ms-0.5"></i>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="text-center py-5 border rounded-4 border-dashed bg-surface shadow-sm">
      <i class="bi bi-exclamation-triangle display-4 text-warning mb-2 d-block"></i>
      <h4 class="fw-bold mb-1 text-adaptive">Category Not Found</h4>
      <p class="text-muted small mb-3">The requested category record does not exist or has been deleted.</p>
      <router-link to="/admin/categories" class="btn btn-primary btn-sm rounded-pill px-4">
        Back to Categories
      </router-link>
    </div>

    <!-- Edit Category Modal -->
    <BaseModal
      v-if="mForm.isVisible"
      title="Edit Category"
      icon="bi bi-pencil-square"
      kicker="Forum Taxonomy"
      @closeModal="closeFormModal"
    >
      <form class="taxonomy-form" @submit.prevent="saveCategory">
        <label class="d-flex flex-column gap-2 mb-3">
          <span class="form-label-text fw-bold text-adaptive" style="font-size: 0.85rem;">Category Name</span>
          <input v-model.trim="mForm.data.name" class="form-control" type="text" maxlength="50" placeholder="Example: Frontend" required>
        </label>
        <label class="d-flex flex-column gap-2 mb-3">
          <span class="form-label-text fw-bold text-adaptive" style="font-size: 0.85rem;">Description</span>
          <textarea v-model.trim="mForm.data.description" class="form-control" rows="3" placeholder="Explain what belongs in this category" required></textarea>
        </label>

        <div class="modal-actions d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-light border" type="button" @click="closeFormModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="mForm.isLoading">
            <span v-if="mForm.isLoading" class="spinner-border spinner-border-sm me-1"></span>
            Save Changes
          </button>
        </div>
      </form>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useToast } from '../../composables/useToast';
import { useCategoriesStore } from '../../stores/CategoriesStore';
import { useBlogStore } from '../../stores/BlogStore';

const route = useRoute();
const categoryStore = useCategoriesStore();
const blogStore = useBlogStore();

const category = ref(null);
const blogs = ref([]);
const isPageLoading = ref(true);
const search = ref('');
const activeTab = ref('all');

onMounted(async () => {
  try {
    isPageLoading.value = true;
    const id = route.params.id;
    // Fetch dynamic Category and all Blogs to match
    category.value = await categoryStore.fetchCategoryById(id);
    blogs.value = await blogStore.fetchBlogsByCategory(id);
    
    // Fallback load category list if not populated
    if (categoryStore.categories.length === 0) {
      await categoryStore.fetchCategories();
    }
    if (blogStore.categories.length === 0) {
      await blogStore.fetchCategories();
    }
  } catch (error) {
    console.error('Failed to load category detail or posts:', error);
  } finally {
    isPageLoading.value = false;
  }
});

const getTabCount = (tab) => {
  const items = blogs.value || [];
  if (tab === 'all') return items.length;
  return items.filter(b => b.status === tab).length;
};

const breadcrumbs = computed(() => [
  { label: 'Category Management', to: '/admin/categories' },
  { label: category.value ? category.value.name : 'Category Details' }
]);

const metrics = computed(() => {
  if (!category.value) return [];
  const publishedCount = blogs.value.filter(b => b.status === 'published').length;
  const draftCount = blogs.value.filter(b => b.status === 'draft').length;
  return [
    { label: 'Total Posts', value: blogs.value.length.toString(), change: 'Assigned to category', icon: 'bi-file-earmark-text', className: 'blue' },
    { label: 'Published', value: publishedCount.toString(), change: 'Live on website', icon: 'bi-send-check', className: 'green' },
    { label: 'Drafts', value: draftCount.toString(), change: 'In progress', icon: 'bi-pencil', className: 'purple' },
    { label: 'Category Group', value: category.value.type || 'None', change: 'Type classification', icon: 'bi-layers', className: 'orange' },
  ];
});

const visiblePosts = computed(() => {
  const needle = search.value.toLowerCase().trim();
  let list = blogs.value || [];

  if (activeTab.value !== 'all') {
    list = list.filter(p => p.status === activeTab.value);
  }

  if (!needle) return list;
  return list.filter(p => 
    (p.title || '').toLowerCase().includes(needle) ||
    (p.excerpt || p.description || '').toLowerCase().includes(needle)
  );
});

const handleImgError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800';
};

const toast = useToast();

const mForm = ref({
  isVisible: false,
  isLoading: false,
  data: {
    name: '',
    description: '',
    type: '',
  },
});

const openEditModal = () => {
  if (!category.value) return;
  mForm.value.data = {
    name: category.value.name || '',
    description: category.value.description || '',
    type: category.value.type || '',
  };
  mForm.value.isVisible = true;
};

const closeFormModal = () => {
  mForm.value.isVisible = false;
};

const saveCategory = async () => {
  try {
    mForm.value.isLoading = true;
    await categoryStore.updateCategory(category.value.id, mForm.value.data);
    
    // Refresh category details on the page
    category.value = await categoryStore.fetchCategoryById(category.value.id);
    
    toast.success('Category updated successfully!');
    closeFormModal();
  } catch (error) {
    console.error('Failed to save category:', error);
    toast.error('Failed to update category.');
  } finally {
    mForm.value.isLoading = false;
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

.spinner-container {
  text-align: center;
}

/* Skeleton Shimmer Loading States */
.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 50%,
    var(--color-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer-anim 1.5s infinite linear;
}

@keyframes shimmer-anim {
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
.skeleton-text,
.skeleton-search,
.skeleton-tabs,
.skeleton-card-image,
.skeleton-avatar,
.skeleton-btn {
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 50%,
    var(--color-border-soft) 75%
  );
  background-size: 200% 100%;
  animation: shimmer-anim 1.5s infinite linear;
}

.skeleton-hero {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.skeleton-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.skeleton-icon {
  width: 72px;
  height: 72px;
}

.skeleton-card {
  height: 440px;
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.skeleton-card-image {
  background-color: var(--color-border-soft);
}

.skeleton-meta-footer {
  border-top: 1px solid var(--color-border);
}

/* Category Hero Banner Section */
.category-hero-banner {
  background: var(--hero-gradient);
  border: 1px solid var(--hero-border-color) !important;
  color: var(--color-text);
  transition: all var(--transition-slow);
  box-shadow: var(--shadow-sm);
}

.category-hero-banner.purple {
  --hero-gradient: linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, var(--color-surface) 100%);
  --hero-border-color: rgba(139, 92, 246, 0.3);
  --hero-accent: #a78bfa;
}

.category-hero-banner.blue {
  --hero-gradient: linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, var(--color-surface) 100%);
  --hero-border-color: rgba(14, 165, 233, 0.3);
  --hero-accent: #38bdf8;
}

.category-hero-banner.green {
  --hero-gradient: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, var(--color-surface) 100%);
  --hero-border-color: rgba(16, 185, 129, 0.3);
  --hero-accent: #34d399;
}

.category-hero-banner.orange {
  --hero-gradient: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, var(--color-surface) 100%);
  --hero-border-color: rgba(245, 158, 11, 0.3);
  --hero-accent: #fbbf24;
}

.category-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--color-surface);
  border: 1px solid var(--hero-border-color);
  color: var(--hero-accent);
  box-shadow: var(--shadow-sm);
}

.hero-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: 0;
  color: var(--color-text);
  margin: 0;
  line-height: 1.1;
  display: inline-flex;
  align-items: center;
}

.category-badge {
  background: var(--color-surface);
  border: 1px solid var(--hero-border-color) !important;
  color: var(--hero-accent);
  font-size: 0.68rem;
  padding: 6px 12px;
  letter-spacing: 0.08em;
  font-weight: 800;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  height: fit-content;
  align-self: center;
}

.category-desc-hero {
  color: var(--color-text-muted);
  font-size: 0.94rem;
  line-height: 1.6;
  max-width: 840px;
  margin-top: 10px !important;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

/* Controls - Panels */
.posts-panel {
  border-radius: 16px !important;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.heading-panel {
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 800;
}

/* Search Wrapper & Input Box */
.search-wrapper {
  position: relative;
  min-width: 290px;
}

.search-box {
  width: 100%;
  padding: 9px 16px 9px 40px;
  font-size: 0.88rem;
  border-radius: 99px;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  outline: none;
  transition: all var(--transition-base);
}

.search-box:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), var(--shadow-sm);
  background: var(--color-surface);
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: 0.9rem;
  transition: color var(--transition-base);
}

.search-wrapper:focus-within .search-icon {
  color: var(--color-primary);
}

/* Glass Tabs Filter Container */
.tabs-container {
  padding: 4px;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: inline-flex;
  gap: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  background: transparent;
  color: var(--color-text-muted);
  border: 0;
  padding: 7px 16px;
  font-weight: 800;
  font-size: 0.84rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary);
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.22);
}

.tab-badge {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 99px;
  font-weight: 800;
  transition: all var(--transition-base);
}

.tab-btn:hover .tab-badge {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.15);
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* Publications Grid & Bounded Cards */
.post-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card {
  display: flex;
  flex-direction: column;
  height: 440px; /* Constrains vertical stretch completely */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-slow);
}

.post-card:hover {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.3) !important;
  box-shadow: var(--shadow-lg), 0 0 20px rgba(99, 102, 241, 0.05) !important;
}

.card-image-wrap {
  position: relative;
  height: 170px;
  width: 100%;
  overflow: hidden;
  background: var(--color-border-soft);
  flex-shrink: 0;
}

.card-image-wrap::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35), transparent);
  pointer-events: none;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.post-card:hover .zoom-hover {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.65rem;
  letter-spacing: 0.6px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 99px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2;
  color: #fff;
}

.status-badge.published {
  background: rgba(16, 185, 129, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.status-badge.draft {
  background: rgba(245, 158, 11, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow: hidden;
}

.title-text {
  font-size: 1.02rem !important;
  font-weight: 800 !important;
  line-height: 1.4 !important;
  color: var(--color-text);
  margin-bottom: 8px;
  height: 2.8em; /* Exact limit for 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-text {
  font-size: 0.85rem !important;
  line-height: 1.6 !important;
  color: var(--color-text-muted);
  margin-bottom: 16px;
  height: 4.8em; /* Exact limit for 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

/* Card footer details */
.card-footer-meta {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.author-avatar {
  border: 2px solid var(--color-border-soft);
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-base);
}

.post-card:hover .author-avatar {
  border-color: rgba(99, 102, 241, 0.25);
}

.btn-view-article {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 0;
  transition: all var(--transition-base);
}

.btn-view-article:hover {
  background: var(--color-primary);
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
}

.btn-view-article i {
  transition: transform var(--transition-base);
  display: inline-block;
}

.btn-view-article:hover i {
  transform: translateX(2px);
}

.border-dashed {
  border-style: dashed !important;
}

@media (max-width: 576px) {
  .category-hero-banner {
    padding: 24px 20px !important;
  }
  .category-icon-wrapper {
    width: 60px;
    height: 60px;
  }
}

.btn-edit-category {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff !important;
  font-weight: 700;
  padding: 0.6rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-edit-category:hover {
  background: #ffffff;
  color: #0f172a !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.btn-edit-category i {
  font-size: 0.95rem;
}

.taxonomy-form,
.taxonomy-form label {
  display: grid;
  gap: 0.55rem;
}

.taxonomy-form {
  gap: 0.9rem;
}

.taxonomy-form span {
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
}

</style>
