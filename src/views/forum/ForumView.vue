<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '@/components/layouts/header.vue';
import BaseFooter from '@/components/layouts/footer.vue';
import FeaturedDiscussion from '@/components/forum/FeaturedDiscussion.vue';
import DiscussionThreadList from '@/components/forum/DiscussionThreadList.vue';
import ForumSidebar from '@/components/forum/ForumSidebar.vue';
import LeftSidebar from '@/components/forum/LeftSidebar.vue';
import { useForumStore } from '@/stores/ForumStore';
import { useTagsStore } from '@/stores/TagsStore';
import { useAuthStore } from '@/stores/AuthStore';

const route = useRoute();
const router = useRouter();

const forumStore = useForumStore();
const tagsStore = useTagsStore();
const authStore = useAuthStore();

const filterTab = ref('latest');
const loading = ref(false);
const searchLoading = ref(false);
const searchQuery = ref('');
const activeTagFilter = ref('');

const activeTab = computed(() => route.query.tab || '');
const showSavedOnly = computed(() => activeTab.value === 'saves');
const showMyPostsOnly = computed(() => activeTab.value === 'myposts');
const selectedCategory = computed(() => route.query.category || 'all');

const searchInput = ref(null);

const filters = ['Latest', 'Top Rated', 'Unanswered'];

const normalizeCategoryValue = (value = '') => String(value || '').trim().toLowerCase();

const categoryMatches = (discussion, selected) => {
  const target = normalizeCategoryValue(selected);
  if (!target || target === 'all') return true;

  return [
    discussion.category_id,
    discussion.categoryId,
    discussion.category,
    discussion.categoryLabel,
    discussion.categoryMeta?.id,
    discussion.categoryMeta?.slug,
    discussion.categoryMeta?.label,
  ]
    .filter((value) => value !== undefined && value !== null)
    .some((value) => normalizeCategoryValue(value) === target);
};

const getDiscussionCategoryText = (discussion) => {
  return [
    discussion.categoryLabel,
    discussion.categoryMeta?.label,
    discussion.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const filteredDiscussions = computed(() => {
  let list = Array.isArray(forumStore.allDiscussions) ? [...forumStore.allDiscussions] : [];

  if (activeTagFilter.value) {
    const tq = activeTagFilter.value.toLowerCase().trim();
    list = list.filter(d => {
      return d.tags && Array.isArray(d.tags) && d.tags.some(t => {
        if (!t) return false;
        const label = typeof t === 'object' ? (t.label || t.name || '') : String(t);
        return label.toLowerCase() === tq;
      });
    });
  }

  // 1. Search Query filter
  if (searchQuery.value && typeof searchQuery.value === 'string' && searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(d => {
      if (!d) return false;
      const title = (d.title || '').toString().toLowerCase();
      const excerpt = (d.excerpt || d.description || d.body || '').toString().toLowerCase();
      
      let authorName = '';
      if (d.author) {
        if (typeof d.author === 'object') {
          authorName = (d.author.username || d.author.name || '').toString().toLowerCase();
        } else {
          authorName = d.author.toString().toLowerCase();
        }
      }

      const matchesTags = d.tags && Array.isArray(d.tags) && d.tags.some(t => {
        if (!t) return false;
        const label = typeof t === 'object' ? (t.label || t.name || '') : String(t);
        return label.toLowerCase().includes(q);
      });

      const matchesCategory = getDiscussionCategoryText(d).includes(q);

      return title.includes(q) || excerpt.includes(q) || authorName.includes(q) || matchesTags || matchesCategory;
    });
  }

  // 1.5 Saves filter
  if (showSavedOnly.value) {
    list = list.filter(d => d.saved);
  }

  // 1.6 My Posts filter
  if (showMyPostsOnly.value && authStore.user) {
    const myUsername = (authStore.user.username || authStore.user.name || '').toLowerCase();
    list = list.filter(d => {
      const authorName = (typeof d.author === 'object' && d.author !== null) ? (d.author.username || d.author.name) : d.author;
      return (authorName || '').toLowerCase() === myUsername;
    });
  }

  // 2. Category filter
  if (selectedCategory.value !== 'all') {
    list = list.filter(d => categoryMatches(d, selectedCategory.value));
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
    list = list.filter(d => {
      const repliesCount = d.replies !== undefined ? Number(d.replies) : 0;
      const likesCount = d.likes !== undefined ? Number(d.likes) : 0;
      return repliesCount === 0 && likesCount === 0;
    });
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

const submitSearch = () => {
  const qVal = searchQuery.value.trim();
  router.push({ path: '/forum', query: { q: qVal || undefined } });
};

const showSuggestions = ref(false);

const matchingSuggestedTags = computed(() => {
  if (!searchQuery.value || !tagsStore.tags) return [];
  const q = searchQuery.value.toLowerCase().replace('#', '').trim();
  if (!q) return [];
  return tagsStore.tags.filter(t => t.name.toLowerCase().includes(q)).slice(0, 5);
});

const selectSuggestedTag = (tagName) => {
  const cleanTag = tagName.replace('#', '').trim();
  router.push({ path: '/forum', query: { tag: cleanTag } });
  showSuggestions.value = false;
};

const handleSearchBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

watch(() => [route.query.tab, route.query.category], () => {
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 350);

  if (route.query.tab === 'saves') {
    forumStore.fetchBookmarks().catch(() => {});
  }
});

watch(() => [route.query.q, route.query.tag], async ([newQ, newTag]) => {
  const qVal = newQ ? String(newQ).replace('#', '').trim() : '';
  const tagVal = newTag ? String(newTag).replace('#', '').trim() : '';
  
  searchQuery.value = newQ ? String(newQ) : '';
  activeTagFilter.value = tagVal;
  
  loading.value = true;
  try {
    if (!tagsStore.tags || tagsStore.tags.length === 0) {
      await tagsStore.fetchTags();
    }
    if (tagVal) {
      const matchedTag = tagsStore.tags && tagsStore.tags.find(t => t.name.toLowerCase() === tagVal.toLowerCase());
      if (matchedTag) {
        const results = await forumStore.fetchDiscussionsByTagName(matchedTag.name);
        if (!results || results.length === 0) {
          // Fallback to fetching recent discussions so local filtering can find newly created tags
          await forumStore.fetchDiscussions();
        }
      } else {
        await forumStore.fetchDiscussions();
      }
    } else {
      await forumStore.fetchDiscussions();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}, { immediate: true });

onMounted(async () => {
  loading.value = true;
  try {
    await tagsStore.fetchTags();
  } catch (e) {}

  try {
    if (route.query.tab === 'saves') {
      await forumStore.fetchBookmarks().catch(() => {});
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }

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
  router.push({ path: '/forum', query: { ...route.query, q: undefined } });
  searchInput.value?.focus();
};

const clearFilters = () => {
  searchQuery.value = '';
  filterTab.value = 'latest';
  router.push({ path: '/forum', query: {} });
};
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <div class="forum-global-grid">
      <!-- Left Column: Left Sidebar Navigation stuck on the left -->
      <LeftSidebar />

      <!-- Right Column: Main Content Container -->
      <div class="forum-main-container">
        <FeaturedDiscussion />

        <!-- Clean Local Search Bar with clickable button inside it -->
        <div class="forum-search-section">
          <div class="search-input-wrapper">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search discussions, tags, or authors..."
              class="search-bar"
              @input="handleSearchInput"
              @focus="showSuggestions = true"
              @blur="handleSearchBlur"
              @keydown.enter="submitSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch" title="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <button class="search-btn" @click="submitSearch" title="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <!-- Tag Suggestions Dropdown -->
          <div v-if="showSuggestions && matchingSuggestedTags.length > 0" class="search-suggestions-dropdown">
            <div class="suggestions-header">Suggested Tags</div>
            <div class="suggestions-list">
              <button
                v-for="tag in matchingSuggestedTags"
                :key="tag.id"
                class="suggestion-item"
                @mousedown.prevent="selectSuggestedTag(tag.name)"
              >
                #{{ tag.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Elegant Filter Row -->
        <div class="forum-tabs-section">
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
          <!-- <button class="create-btn" @click="$router.push('/forum/create')">
            <i class="bi bi-plus-lg"></i>
            <span>Create Question</span>
          </button> -->
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
}

.forum-global-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
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

/* Local Search Bar Styling */
.forum-search-section {
  margin-top: 24px;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 99px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.search-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-bar {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  font-size: 14.5px;
  color: var(--color-text);
  outline: none;
  font-family: inherit;
}

.search-bar::placeholder {
  color: var(--color-text-muted);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: var(--color-danger, #ef4444);
}

.search-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover {
  color: #7c3aed;
}

.forum-tabs-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--color-border);
  margin-top: 24px;
  padding-bottom: 0px;
}

.tabs-group {
  display: flex;
  gap: 24px;
}

.tab-btn {
  padding: 12px 4px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: -1.5px;
  left: 0;
  right: 0;
  height: 2.5px;
  background-color: var(--color-primary);
  border-radius: 99px;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.create-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
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
  animation: pulse-glow 1.5s infinite linear;
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
  animation: pulse-glow 1.5s infinite linear;
}

.skeleton-line-sm {
  width: 100px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite linear;
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
  animation: pulse-glow 1.5s infinite linear;
}

.skeleton-excerpt {
  width: 100%;
  height: 38px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite linear;
}

.skeleton-footer {
  width: 120px;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite linear;
}

@keyframes pulse-glow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State Card styling */
.empty-state-card {
  background: var(--color-surface);
  border-radius: 20px;
  border: 1px dashed var(--color-primary);
  padding: 56px 40px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 68px;
  height: 68px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.empty-state-card h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 12px;
}

.empty-state-card p {
  color: var(--color-text-muted);
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
  background: var(--color-surface-hover);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.create-secondary {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px var(--color-primary-light);
}

.create-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--color-primary-light);
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
  padding: 10px 24px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.load-more-btn:disabled {
  opacity: 0.6;
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
}

@media (max-width: 640px) {
  .forum-global-grid { padding: 20px 16px 40px; }
  .filter-actions-bar { flex-direction: column; align-items: stretch; gap: 10px; }
  .tabs-group { width: 100%; justify-content: center; }
  .tab-btn { flex: 1; text-align: center; }
  .create-btn { justify-content: center; }
}

.forum-search-section {
  position: relative;
}

.search-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  margin-top: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestions-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 6px 12px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.suggestion-item:hover {
  background: var(--color-purple-light);
  color: var(--color-purple);
  border-color: var(--color-purple);
}
</style>
