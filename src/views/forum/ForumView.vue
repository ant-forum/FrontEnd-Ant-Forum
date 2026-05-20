<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../../components/layouts/header.vue';
import FeaturedDiscussion from '../../components/forum/FeaturedDiscussion.vue';
import DiscussionThreadList from '../../components/forum/DiscussionThreadList.vue';
import ForumSidebar from '../../components/forum/ForumSidebar.vue';

const filterTab = ref('latest');
const discussions = ref([]);
const loading = ref(false);

const filters = ['Latest', 'Top Rated', 'Unanswered'];

const sampleDiscussions = [
  {
    id: 1,
    votes: 128,
    tags: [
      { label: 'React', color: 'blue' },
      { label: 'Performance', color: 'orange' }
    ],
    title: 'Memory Leak when using custom hooks with IntersectionObserver',
    excerpt: "I've been noticing a steady increase in memory usage when implementing an infinite scroll feature. I suspect my custom useIntersection hook isn't cleaning up properly on component unmount...",
    replies: 24,
    author: '@dev_marco',
    timestamp: 'Posted 2h ago',
    saved: false,
    hasCode: false
  },
  {
    id: 2,
    votes: 85,
    tags: [
      { label: 'System Design', color: 'green' },
      { label: 'Architecture', color: 'purple' }
    ],
    title: 'Architecting a real-time notification system for scale (1M+ concurrent users)',
    excerpt: 'Looking for feedback on a proposed architecture using Redis Pub/Sub, WebSockets, and a set of Go microservices to handle high-throughput...',
    replies: 56,
    author: '@sys_admin_sarah',
    timestamp: 'Posted 5h ago',
    saved: false,
    hasCode: true,
    code: `// Go snippet example
func (s *Sub) Subscribe(ctx context.Context, channel string) error {
  pubsub := s.rdb.Subscribe(ctx, channel)
  defer pubsub.Close()
  // handle messages...
}`
  },
  {
    id: 3,
    votes: 42,
    tags: [
      { label: 'CSS', color: 'pink' },
      { label: 'Tailwind', color: 'teal' }
    ],
    title: 'Best practices for organizing large Tailwind configuration files',
    excerpt: 'As our design system grows, our tailwind.config.js is becoming a monolithic nightmare. How are larger teams structuring and splitting their configs for...',
    replies: 12,
    author: '@ui_josh',
    timestamp: 'Posted 1d ago',
    saved: false,
    hasCode: false
  }
];

onMounted(() => {
  discussions.value = sampleDiscussions;
});

const handleLoadMore = () => {
  loading.value = true;
  setTimeout(() => {
    const moreDiscussions = sampleDiscussions.map((d, i) => ({
      ...d,
      id: d.id + 100 + i
    }));
    discussions.value = [...discussions.value, ...moreDiscussions];
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
            <button class="filter-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
            </button>
          </div>

          <DiscussionThreadList :discussions="discussions" />

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

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-btn:hover {
  background: #ede9fe;
  color: #6d28d9;
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