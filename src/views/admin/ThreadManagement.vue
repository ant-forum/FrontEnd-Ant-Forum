<template>
  <div class="thread-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Threads</p>
              <h2 class="fw-bold mb-1">{{ totalThreads }}</h2>
              <div class="d-flex align-items-center text-success small">
                <i class="bi bi-graph-up me-1"></i>
                <span class="fw-bold">+5.2% this week</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-purple p-3">
              <i class="bi bi-chat-dots text-purple fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Pinned</p>
              <h2 class="fw-bold mb-1">{{ pinnedThreads }}</h2>
              <div class="d-flex align-items-center text-primary small">
                <i class="bi bi-pin-angle-fill me-1"></i>
                <span class="fw-bold">Important topics</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-blue p-3">
              <i class="bi bi-pin text-blue fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Flagged Content</p>
              <h2 class="fw-bold mb-1">{{ flaggedThreads }}</h2>
              <div class="d-flex align-items-center text-danger small">
                <i class="bi bi-exclamation-circle-fill me-1"></i>
                <span class="fw-bold">Needs attention</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-red p-3">
              <i class="bi bi-flag text-red fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Directory and Details -->
      <div class="row g-4">
        <div class="col-xl-8">
          <ThreadTable 
            :threads="filteredThreads" 
            v-model:searchQuery="searchQuery"
            v-model:categoryFilter="categoryFilter"
            :categories="categories"
            @select-thread="selectedThread = $event"
            @delete-thread="handleDeleteThread"
          />
        </div>
        <div class="col-xl-4">
          <ThreadDetailCard 
            :thread="selectedThread" 
            @toggle-pin="handleTogglePin"
            @toggle-lock="handleToggleLock"
            @delete-thread="handleDeleteThread"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ThreadTable from '../../components/admin/ThreadTable.vue';
import ThreadDetailCard from '../../components/admin/ThreadDetailCard.vue';

const searchQuery = ref('');
const categoryFilter = ref('ALL');

const threads = ref([
  {
    id: 1,
    title: 'How to optimize Docker images for Node.js?',
    category: 'Development / DevOps',
    author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david' },
    replies: 24,
    views: '1.2k',
    status: 'ACTIVE',
    statusClass: 'status-active',
    reports: 0
  },
  {
    id: 2,
    title: 'Best practices for Vue 3 Composition API in large scale apps',
    category: 'Frontend / Vue',
    author: { name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarahc' },
    replies: 45,
    views: '3.5k',
    status: 'PINNED',
    statusClass: 'status-pinned',
    reports: 2
  },
  {
    id: 3,
    title: 'Is it worth moving from REST to GraphQL in 2024?',
    category: 'Backend / API',
    author: { name: 'Marcus Wright', avatar: 'https://i.pravatar.cc/150?u=marcus' },
    replies: 12,
    views: '840',
    status: 'FLAGGED',
    statusClass: 'status-flagged',
    reports: 5
  },
  {
    id: 4,
    title: 'New security vulnerability found in popular npm package',
    category: 'Security / Announcements',
    author: { name: 'Elena Vance', avatar: 'https://i.pravatar.cc/150?u=elena' },
    replies: 8,
    views: '2.1k',
    status: 'LOCKED',
    statusClass: 'status-locked',
    reports: 0
  }
]);

const selectedThread = ref(threads.value[0]);

const categories = computed(() => {
  const cats = new Set(threads.value.map(t => t.category));
  return Array.from(cats);
});

// Metrics
const totalThreads = computed(() => threads.value.length);
const pinnedThreads = computed(() => threads.value.filter(t => t.status === 'PINNED').length);
const flaggedThreads = computed(() => threads.value.filter(t => t.status === 'FLAGGED').length);

// Filtering
const filteredThreads = computed(() => {
  let result = [...threads.value];

  if (categoryFilter.value !== 'ALL') {
    result = result.filter(t => t.category === categoryFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.title.toLowerCase().includes(query) || 
      t.author.name.toLowerCase().includes(query)
    );
  }

  return result;
});

// Handlers
const handleTogglePin = (id) => {
  const thread = threads.value.find(t => t.id === id);
  if (thread) {
    if (thread.status === 'PINNED') {
      thread.status = 'ACTIVE';
      thread.statusClass = 'status-active';
    } else {
      thread.status = 'PINNED';
      thread.statusClass = 'status-pinned';
    }
  }
};

const handleToggleLock = (id) => {
  const thread = threads.value.find(t => t.id === id);
  if (thread) {
    if (thread.status === 'LOCKED') {
      thread.status = 'ACTIVE';
      thread.statusClass = 'status-active';
    } else {
      thread.status = 'LOCKED';
      thread.statusClass = 'status-locked';
    }
  }
};

const handleDeleteThread = (id) => {
  if (confirm('Are you sure you want to delete this discussion?')) {
    threads.value = threads.value.filter(t => t.id !== id);
    if (selectedThread.value?.id === id) {
      selectedThread.value = threads.value[0] || null;
    }
  }
};
</script>

<style scoped>
.thread-management-layout {
  font-family: var(--font-family-base);
}

.icon-box {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.text-purple { color: #8b5cf6; }

.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }
.text-blue { color: #3b82f6; }

.bg-light-red { background-color: rgba(239, 68, 68, 0.1); }
.text-red { color: #ef4444; }

.bg-light {
  background-color: #f8fafc !important;
}
</style>
