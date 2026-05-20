<script setup>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../../components/layouts/header.vue';
import FeaturedDiscussion from '../../components/forum/FeaturedDiscussion.vue';
import DiscussionThreadList from '../../components/forum/DiscussionThreadList.vue';
import ForumSidebar from '../../components/forum/ForumSidebar.vue';
import { useForumStore } from '../../stores/ForumStore';

const forumStore = useForumStore();

const filterTab = ref('latest');
const loading = ref(false);

const filters = ['Latest', 'Top Rated', 'Unanswered'];

const filteredDiscussions = computed(() => {
  let list = [...forumStore.allDiscussions];
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
    list = list.filter(d => d.replies === 0);
  }
  return list;
});

onMounted(async () => {
  loading.value = true;
  await forumStore.fetchDiscussions();
  loading.value = false;
});

const handleLoadMore = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 800);
};
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <div class="forum-wrapper">
      <FeaturedDiscussion />

      <div class="forum-content">
        <!-- Left: Discussions -->
        <div class="discussions-column">
          <!-- Filter Tabs -->
          <div class="filter-bar">
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

          <DiscussionThreadList :discussions="filteredDiscussions" />

          <div class="load-more-wrap">
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
</template>

<style scoped>
.forum-page {
  min-height: 100vh;
  background: #f6f5fb;
}

.forum-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.forum-content {
  display: grid;
  grid-template-columns: 1fr 292px;
  gap: 28px;
  margin-top: 28px;
}

.discussions-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 14px;
  padding: 6px 8px 6px 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.tabs-group {
  display: flex;
  gap: 2px;
}

.tab-btn {
  padding: 8px 18px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  color: #111827;
  background: #f3f4f6;
}

.tab-btn.active {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(109, 40, 217, 0.3);
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(109, 40, 217, 0.25);
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(109, 40, 217, 0.4);
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
  border: none;
  font-size: 14px;
  font-weight: 600;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}

.load-more-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.3);
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
  .forum-content { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .forum-wrapper { padding: 20px 16px 40px; }
  .filter-bar { flex-wrap: wrap; gap: 8px; }
}
</style>