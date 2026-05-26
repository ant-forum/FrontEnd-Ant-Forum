<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';
import FeaturedDiscussion from '../../components/forum/FeaturedDiscussion.vue';
import DiscussionThreadList from '../../components/forum/DiscussionThreadList.vue';
import ForumSidebar from '../../components/forum/ForumSidebar.vue';
import LeftSidebar from '../../components/forum/LeftSidebar.vue';
import { useForumStore } from '../../stores/ForumStore';

const route = useRoute();

const forumStore = useForumStore();

const filterTab = ref('latest');
const loading = ref(false);
const searchLoading = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');

const activeTab = ref(route.query.tab || 'questions');
const showSavedOnly = ref(activeTab.value === 'saves');

const searchInput = ref(null);

const filters = ['Latest', 'Top Rated', 'Unanswered'];

const categories = [
  { id: 'all', label: 'All Topics', icon: 'bi-grid-fill', color: 'purple', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { id: 'question', label: 'Questions', icon: 'bi-question-circle-fill', color: 'blue', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
  { id: 'discussion', label: 'Discussions', icon: 'bi-chat-left-text-fill', color: 'green', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { id: 'showcase', label: 'Show & Tell', icon: 'bi-rocket-takeoff-fill', color: 'fuchsia', gradient: 'linear-gradient(135deg, #c084fc, #a855f7)' },
  { id: 'tutorial', label: 'Tutorials', icon: 'bi-book-half', color: 'amber', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'idea', label: 'Ideas', icon: 'bi-lightbulb-fill', color: 'teal', gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
];

const filteredDiscussions = computed(() => {
  let list = [...forumStore.allDiscussions];

  // 1. Search Query filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.excerpt.toLowerCase().includes(q) ||
      (d.author && d.author.toLowerCase().includes(q)) ||
      (d.tags && d.tags.some(t => t.label.toLowerCase().includes(q)))
    );
  }

  // 1.5 Saves filter
  if (showSavedOnly.value) {
    list = list.filter(d => d.saved);
  }

  // 2. Category filter
  if (selectedCategory.value !== 'all') {
    list = list.filter(d => d.category === selectedCategory.value);
  }

  // 3. Tab Sort / Unanswered Filter
  if (filterTab.value === 'latest') {
    list.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return b.id - a.id;
    });
  } else if (filterTab.value === 'top rated') {
    list.sort((a, b) => (b.votes || 0) - (a.votes || 0));
  } else if (filterTab.value === 'unanswered') {
    list = list.filter(d => !d.replies || d.replies.length === 0);
  }
  return list;
});

// Trigger micro-loading on search or category changes to reveal the beautiful skeleton loaders
const handleSearchInput = () => {
  searchLoading.value = true;
  const bounce = setTimeout(() => {
    searchLoading.value = false;
  }, 350);
};

const handleSidebarSelect = (tabId) => {
  activeTab.value = tabId;
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 350);

  if (tabId === 'saves') {
    showSavedOnly.value = true;
    selectedCategory.value = 'all';
  } else if (tabId === 'questions') {
    showSavedOnly.value = false;
    selectedCategory.value = 'question';
  } else if (tabId === 'home') {
    showSavedOnly.value = false;
    selectedCategory.value = 'all';
  } else {
    showSavedOnly.value = false;
  }
};

const handleCategorySelect = (id) => {
  selectedCategory.value = id;
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 400);
};

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    handleSidebarSelect(newTab);
  }
});

onMounted(async () => {
  loading.value = true;
  await forumStore.fetchDiscussions();
  loading.value = false;

  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

const handleGlobalKeydown = (e) => {
  // Focus search input on slash "/" if not inside an editor
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

const handleLoadMore = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
};

const clearSearch = () => {
  searchQuery.value = '';
  searchInput.value?.focus();
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  filterTab.value = 'latest';
};
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <div class="forum-global-grid">
      <!-- Left Column: Left Sidebar Navigation stuck on the left -->
      <LeftSidebar :active-tab="activeTab" @select-tab="handleSidebarSelect" />

      <!-- Right Column: Main Content Container -->
      <div class="forum-main-container">
        <FeaturedDiscussion />

        <!-- Interactive Search & Filtering Bar -->
        <div class="search-filter-section">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search discussions, tags, or authors..."
              class="search-bar"
              @input="handleSearchInput"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <span v-else class="kbd-indicator">/</span>
          </div>

          <div class="filter-actions-bar">
            <div class="tabs-group">
              <button
                v-for="filter in filters"
                :key="filter"
                :class="['tab-btn', { active: filterTab === filter.toLowerCase() }]"
                @click="filterTab = filter.toLowerCase()"
              >
                {{ filter }}
              </button>
            </div>
            <button class="create-btn" @click="$router.push('/forum/create')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Question
            </button>
          </div>
        </div>

        <!-- Categories Pills Grid Slider -->
        <div class="categories-grid-bar">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="category-pill-btn"
            :class="[{ active: selectedCategory === cat.id }, cat.color]"
            @click="handleCategorySelect(cat.id)"
          >
            <span class="cat-pill-icon-wrap" :style="{ background: cat.gradient }">
              <i :class="['bi', cat.icon]"></i>
            </span>
            <span class="cat-pill-label">{{ cat.label }}</span>
          </button>
        </div>

        <!-- Inner Content Grid (Discussions Feed + Right Sidebar) -->
        <div class="forum-feed-content">
          <!-- Center: Discussions -->
          <div class="discussions-column">
            <!-- Skeletons Loader State -->
            <div v-if="loading || searchLoading" class="skeletons-list">
              <div v-for="i in 3" :key="i" class="skeleton-card">
                <div class="skeleton-vote-col">
                  <div class="skeleton-circle"></div>
                  <div class="skeleton-line-sm"></div>
                  <div class="skeleton-circle"></div>
                </div>
                <div class="skeleton-body">
                  <div class="skeleton-header">
                    <div class="skeleton-tags">
                      <div class="skeleton-pill"></div>
                      <div class="skeleton-pill"></div>
                    </div>
                    <div class="skeleton-line-sm right"></div>
                  </div>
                  <div class="skeleton-title"></div>
                  <div class="skeleton-excerpt"></div>
                  <div class="skeleton-footer"></div>
                </div>
              </div>
            </div>

            <!-- Empty Search State -->
            <div v-else-if="filteredDiscussions.length === 0" class="empty-state-card">
              <div class="empty-icon-wrap">
                <i class="bi bi-chat-square-text"></i>
              </div>
              <h2>No Threads Found</h2>
              <p>We couldn't find any threads matching your active search terms or category choices. Try resetting filters or write the very first discussion yourself!</p>
              <div class="empty-actions">
                <button class="reset-btn" @click="clearFilters">Reset All Filters</button>
                <button class="create-secondary" @click="$router.push('/forum/create')">Write Discussion</button>
              </div>
            </div>

            <!-- Discussions List -->
            <DiscussionThreadList v-else :discussions="filteredDiscussions" />

            <div v-if="filteredDiscussions.length > 0 && !loading && !searchLoading" class="load-more-wrap">
              <button @click="handleLoadMore" :disabled="loading" class="load-more-btn">
                <svg v-if="!loading" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span v-if="loading" class="btn-spinner"></span>
                {{ loading ? 'Loading...' : 'Load More Threads' }}
              </button>
            </div>
          </div>

          <!-- Right: Sidebar -->
          <ForumSidebar />
        </div>
      </div>
    </div>
    
    <BaseFooter />
  </div>
</template>

<style scoped>
.forum-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.forum-global-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.forum-main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Search and Filter Section */
.search-filter-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 28px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-bar {
  width: 100%;
  padding: 16px 52px 16px 52px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  font-size: 15px;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  font-family: inherit;
}

.search-bar::placeholder {
  color: var(--color-text-muted);
}

.search-bar:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
  background: var(--color-surface);
}

.clear-search-btn {
  position: absolute;
  right: 20px;
  background: var(--color-surface-hover);
  border: none;
  color: var(--color-text-muted);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.kbd-indicator {
  position: absolute;
  right: 20px;
  padding: 3px 8px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: monospace;
  pointer-events: none;
  box-shadow: var(--shadow-sm);
}

.filter-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tabs-group {
  display: flex;
  gap: 6px;
  background: var(--color-surface-hover);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  width: fit-content;
}

.tab-btn {
  padding: 8px 18px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 9px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.tab-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  color: white;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(109, 40, 217, 0.25);
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(109, 40, 217, 0.35);
}

/* Category Pills Bar */
.categories-grid-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  overflow-x: auto;
  padding: 6px 4px 10px;
  scrollbar-width: none; /* Firefox */
}

.categories-grid-bar::-webkit-scrollbar {
  display: none; /* Safari/Chrome */
}

.category-pill-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-muted);
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
  flex-shrink: 0;
  user-select: none;
}

.cat-pill-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.2);
  transition: all 0.2s ease;
}

.category-pill-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Category Pill Active styles */
.category-pill-btn.active.purple {
  border-color: var(--color-purple);
  background: var(--color-purple-light);
  color: var(--color-purple);
  box-shadow: 0 4px 14px var(--color-purple-light);
}
.category-pill-btn.active.blue {
  border-color: var(--color-info);
  background: var(--color-info-light);
  color: var(--color-info);
  box-shadow: 0 4px 14px var(--color-info-light);
}
.category-pill-btn.active.green {
  border-color: var(--color-success);
  background: var(--color-success-light);
  color: var(--color-success);
  box-shadow: 0 4px 14px var(--color-success-light);
}
.category-pill-btn.active.fuchsia {
  border-color: var(--color-purple);
  background: var(--color-purple-light);
  color: var(--color-purple);
  box-shadow: 0 4px 14px var(--color-purple-light);
}
.category-pill-btn.active.amber {
  border-color: var(--color-warning);
  background: var(--color-warning-light);
  color: var(--color-warning);
  box-shadow: 0 4px 14px var(--color-warning-light);
}
.category-pill-btn.active.teal {
  border-color: var(--color-info);
  background: var(--color-info-light);
  color: var(--color-info);
  box-shadow: 0 4px 14px var(--color-info-light);
}

.forum-feed-content {
  display: grid;
  grid-template-columns: 1fr 292px;
  gap: 28px;
  margin-top: 24px;
}

.discussions-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Skeletons Styling */
.skeletons-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-card {
  display: flex;
  background: var(--color-surface);
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 20px 22px;
  gap: 16px;
  overflow: hidden;
}

.skeleton-vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 32px;
}

.skeleton-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
}

.skeleton-pill {
  width: 60px;
  height: 20px;
  border-radius: 100px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-sm {
  width: 100px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-sm.right {
  width: 80px;
}

.skeleton-title {
  width: 80%;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-excerpt {
  width: 100%;
  height: 38px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-footer {
  width: 120px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State Card styling */
.empty-state-card {
  background: white;
  border-radius: 20px;
  border: 1px dashed rgba(168, 85, 247, 0.3);
  padding: 56px 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 68px;
  height: 68px;
  background: rgba(168, 85, 247, 0.08);
  color: #7c3aed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.05);
}

.empty-state-card h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
}

.empty-state-card p {
  color: #6b7280;
  max-width: 460px;
  line-height: 1.6;
  font-size: 14.5px;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.reset-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.create-secondary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(109,40,217,0.15);
}

.create-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(109,40,217,0.25);
}

/* Load More */
.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 30px;
  background: white;
  color: #374151;
  border: 1px solid rgba(229, 231, 235, 0.8);
  font-size: 14px;
  font-weight: 600;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 2px 12px rgba(0,0,0,0.02);
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.3);
  border-color: transparent;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(109,40,217,0.2);
  border-top-color: #6d28d9;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1024px) {
  .forum-global-grid { grid-template-columns: 1fr; }
  .forum-feed-content { grid-template-columns: 1fr; }
  .left-sidebar-navigation { display: none !important; }
}

@media (max-width: 640px) {
  .forum-global-grid { padding: 20px 16px 40px; }
  .filter-actions-bar { flex-direction: column; align-items: stretch; gap: 10px; }
  .tabs-group { width: 100%; justify-content: center; }
  .tab-btn { flex: 1; text-align: center; }
  .create-btn { justify-content: center; }
}
</style>