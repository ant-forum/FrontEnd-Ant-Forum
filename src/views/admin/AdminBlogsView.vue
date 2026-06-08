<template>
  <AdminPageShell
    title="Blog Management"
    kicker="Admin Publishing"
    subtitle="Manage official posts. Only admins can create and publish blog content."
    :metrics="metrics"
  >
    <section class="admin-panel posts-panel">
      <div class="panel-heading">
        <div>
          <h2>Recent Blog Posts</h2>
          <p>Track admin-created blog content and publishing status.</p>
          <div class="filter-tabs">
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
        </div>
        <div class="panel-tools">
          <label class="search-box">
            <i class="bi bi-search"></i>
            <input v-model.trim="search" type="search" placeholder="Search posts">
          </label>
          <router-link class="btn btn-primary create-btn" to="/admin/blogs/create">
            <i class="bi bi-plus-lg"></i>
            <span>Create Blog</span>
          </router-link>
        </div>
      </div>

      <!-- Premium Category Filter Indicator -->
      <div v-if="route.query.category_id" class="category-filter-alert mb-4">
        <span class="alert-info-text">
          <i class="bi bi-funnel-fill text-purple"></i>
          <span>Showing articles in category: <strong>{{ getCategoryName(route.query.category_id) }}</strong></span>
        </span>
        <button type="button" class="btn-clear-filter" @click="clearCategoryFilter" title="Clear category filter">
          <i class="bi bi-x-circle-fill"></i>
          <span>Clear Filter</span>
        </button>
      </div>

      <div v-if="activeFilterChips.length" class="active-filters" aria-label="Active blog filters">
        <span>Filtered by</span>
        <button v-for="chip in activeFilterChips" :key="chip.key" type="button" class="filter-chip" @click="removePostFilter(chip.key)">
          {{ chip.label }}
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="post-list">
        <!-- Skeleton Loading State -->
        <template v-if="blogStore.isLoading || isTabSwitching">
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
        <div v-else-if="visiblePosts.length === 0" class="empty-posts">
          <i class="bi bi-file-earmark-x"></i>
          <strong>{{ emptyStateTitle }}</strong>
          <span>{{ emptyStateMessage }}</span>
          <button v-if="hasActiveFilters" class="btn btn-light btn-sm border empty-action" type="button" @click="clearPostFilters">
            <i class="bi bi-x-circle"></i>
            Clear Filters
          </button>
          <router-link v-else class="btn btn-primary btn-sm empty-action" to="/admin/blogs/create">
            <i class="bi bi-plus-lg"></i>
            Create Blog
          </router-link>
        </div>
        <article 
          v-else 
          v-for="post in paginatedPosts"
          :key="post.id || post.title" 
          class="post-row clickable-row"
          @click="navigateToDetail(post)"
        >
          <span class="post-thumb">
            <img v-if="post.image" :src="post.image" @error.once="handleImgError" class="thumb-img" alt="Post thumbnail">
            <i v-else class="bi bi-file-earmark-post"></i>
          </span>
          <div>
            <h3>{{ post.title }}</h3>
            <p class="post-desc">{{ post.excerpt || post.description }}</p>
            <div class="post-meta">
              <span><strong>Category:</strong> {{ post.category }}</span>
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

      <footer v-if="!blogStore.isLoading && visiblePosts.length" class="pagination-footer mt-4">
        <p>
          Showing <strong>{{ firstVisibleRow }}-{{ lastVisibleRow }}</strong>
          of <strong>{{ visiblePosts.length }}</strong> articles
        </p>

        <nav v-if="totalPages > 1" class="pagination-controls" aria-label="blog list pagination">
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
  </AdminPageShell>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import { useBlogStore } from '../../stores/BlogStore.js';
import { useToast } from '../../composables/useToast.js';

const blogStore = useBlogStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const activeTab = ref(
  route.query.tab && ['all', 'published', 'draft', 'scheduled'].includes(route.query.tab)
    ? route.query.tab
    : 'all'
);
const activeMenuId = ref(null);
const search = ref('');
const isTabSwitching = ref(false);

watch(activeTab, (newTab) => {
  isTabSwitching.value = true;
  setTimeout(() => {
    isTabSwitching.value = false;
  }, 350);

  router.replace({
    query: {
      ...route.query,
      tab: newTab === 'all' ? undefined : newTab
    }
  });
});

watch(() => route.query.tab, (newTab) => {
  const target = newTab || 'all';
  if (activeTab.value !== target && ['all', 'published', 'draft', 'scheduled'].includes(target)) {
    isTabSwitching.value = true;
    setTimeout(() => {
      isTabSwitching.value = false;
    }, 350);
    activeTab.value = target;
  }
});

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

  // Filter by Category Query Param
  const catId = route.query.category_id;
  if (catId) {
    items = items.filter(post => String(post.category_id) === String(catId));
  }

  // Filter by Tab Status
  if (activeTab.value !== 'all') {
    items = items.filter(post => post.status === activeTab.value);
  }

  // Filter by Search Query
  if (!needle) return items;
  return items.filter((post) => 
    (post.title || '').toLowerCase().includes(needle) || 
    (post.excerpt || post.description || '').toLowerCase().includes(needle)
  );
});
const hasActiveFilters = computed(() => Boolean(search.value) || activeTab.value !== 'all' || Boolean(route.query.category_id));
const activeFilterChips = computed(() => [
  ...(search.value ? [{ key: 'search', label: `Search: ${search.value}` }] : []),
  ...(activeTab.value !== 'all' ? [{ key: 'status', label: `Status: ${activeTab.value}` }] : []),
]);
const emptyStateTitle = computed(() => blogStore.ownBlogs.length ? 'No blog posts match these filters' : 'No blog posts yet');
const emptyStateMessage = computed(() => blogStore.ownBlogs.length ? 'Clear the filters or try a different search phrase.' : 'Create the first official article for the forum community.');
const clearPostFilters = () => {
  search.value = '';
  activeTab.value = 'all';
  router.replace({ path: '/admin/blogs' });
};
const removePostFilter = (key) => {
  if (key === 'search') search.value = '';
  if (key === 'status') activeTab.value = 'all';
};

const currentPage = ref(1);
const pageSize = 5;

const totalPages = computed(() => Math.max(1, Math.ceil(visiblePosts.value.length / pageSize)));
const firstVisibleRow = computed(() => (currentPage.value - 1) * pageSize + 1);
const lastVisibleRow = computed(() => Math.min(currentPage.value * pageSize, visiblePosts.value.length));
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1));
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return visiblePosts.value.slice(start, start + pageSize);
});

watch(visiblePosts, () => {
  currentPage.value = 1;
});

const handleImgError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800';
};

const getCategoryName = (catId) => {
  const cat = blogStore.categories.find(c => String(c.id) === String(catId));
  return cat ? (cat.name || cat.title) : `Category #${catId}`;
};

const clearCategoryFilter = () => {
  router.replace({ path: '/admin/blogs' });
};

const navigateToDetail = (post) => {
  if (post.status === 'draft') {
    router.push(`/admin/blogs/create?id=${post.id}`);
  } else {
    router.push(`/blog/${post.id}`);
  }
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

const editBlog = (post) => {
  activeMenuId.value = null;
  router.push(`/admin/blogs/create?id=${post.id}`);
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

.panel-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
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

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  width: fit-content;
  margin-top: 1rem;
  padding: 0.25rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.tab-btn {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.7rem;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  text-transform: capitalize;
  transition: color var(--transition-base), background-color var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base);
}

.tab-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary-light);
  border-color: rgba(99, 102, 241, 0.38);
  color: var(--color-primary-hover);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.08);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 0.1rem 0.3rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: var(--color-primary);
  color: #fff;
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
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
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.post-list {
  display: grid;
  gap: 0.75rem;
}

.empty-posts {
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.25rem;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  text-align: center;
}

.empty-posts > i {
  color: var(--color-primary);
  font-size: 1.65rem;
}

.empty-posts strong {
  color: var(--color-text);
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
  font-weight: 700;
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

  .panel-tools {
    width: 100%;
    align-items: stretch;
  }

  .filter-tabs {
    flex-wrap: wrap;
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

.category-filter-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-primary-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  font-size: 0.86rem;
  color: var(--color-primary);
}

.alert-info-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-clear-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-primary);
  background: transparent;
  border: 0;
  font-weight: 800;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.btn-clear-filter:hover {
  opacity: 0.8;
}

/* Pagination Footer Styles */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.pagination-footer p {
  color: var(--color-text-muted) !important;
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
  transition: all var(--transition-base);
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
</style>
