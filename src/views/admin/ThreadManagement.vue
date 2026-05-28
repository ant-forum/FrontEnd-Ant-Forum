<template>
  <div class="thread-management-layout d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="fw-bold mb-1 text-adaptive">Discussion Moderation</h2>
          <p class="text-muted small mb-0">Monitor and manage community conversations</p>
        </div>
      </div>

      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <StatCard 
            label="Total Threads" 
            :value="totalThreads" 
            description="Active community discussions"
            descriptionIcon="bi-chat-left-dots"
            descriptionColorClass="text-success"
            icon="bi bi-chat-dots"
            iconBgClass="bg-purple-light"
            iconColorClass="text-purple"
            :active="currentFilter === 'ALL'"
            @click="currentFilter = 'ALL'"
            class="cursor-pointer"
          />
        </div>
        <div class="col-md-4">
          <StatCard 
            label="Pinned" 
            :value="pinnedThreads" 
            description="Important featured topics"
            descriptionIcon="bi-pin-angle"
            descriptionColorClass="text-teal"
            icon="bi bi-pin-angle"
            iconBgClass="bg-teal-light"
            iconColorClass="text-teal"
            :active="currentFilter === 'PINNED'"
            @click="currentFilter = 'PINNED'"
            class="cursor-pointer"
          />
        </div>
        <div class="col-md-4">
          <StatCard 
            label="Flagged" 
            :value="flaggedThreads" 
            description="Requires moderator review"
            descriptionIcon="bi-exclamation-triangle"
            descriptionColorClass="text-danger"
            icon="bi bi-flag"
            iconBgClass="bg-red-light"
            iconColorClass="text-red"
            :active="currentFilter === 'FLAGGED'"
            @click="currentFilter = 'FLAGGED'"
            class="cursor-pointer"
          />
        </div>
      </div>

      <!-- Main Directory and Details -->
      <div v-if="loading" class="row g-4">
        <div class="col-xl-8">
          <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-surface border">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mb-0">Fetching community discussions...</p>
          </div>
        </div>
        <div class="col-xl-4">
          <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-surface border h-100">
             <div class="spinner-border text-primary opacity-25" role="status"></div>
          </div>
        </div>
      </div>

      <div v-else class="row g-4">
        <div class="col-xl-8">
          <ThreadTable 
            :threads="paginatedThreads" 
            :totalThreads="filteredThreads.length"
            :currentPage="currentPage"
            :totalPages="totalPages"
            v-model:searchQuery="searchQuery"
            v-model:categoryFilter="categoryFilter"
            :categories="categories"
            :selectedId="selectedThread?.id"
            @select-thread="selectedThread = $event"
            @delete-thread="handleDeleteThread"
            @page-change="handlePageChange"
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
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ThreadTable from '../../components/admin/ThreadTable.vue';
import ThreadDetailCard from '../../components/admin/ThreadDetailCard.vue';
import StatCard from '../../components/admin/StatCard.vue';
import { useForumStore } from '../../stores/ForumStore';
import { useToast } from '../../composables/useToast.js';

const forumStore = useForumStore();
const toast = useToast();

const searchQuery = ref('');
const categoryFilter = ref('ALL');
const currentFilter = ref('ALL');
const loading = ref(true);
const selectedThread = ref(null);

onMounted(async () => {
  await loadThreads();
});

const loadThreads = async () => {
  loading.value = true;
  try {
    // Simulate a brief network delay for the "loading" experience
    await new Promise(resolve => setTimeout(resolve, 500));
    await forumStore.fetchDiscussions();
    if (forumStore.discussions.length > 0) {
      selectedThread.value = forumStore.discussions[0];
    }
  } catch (error) {
    toast.error('Failed to load discussions');
  } finally {
    loading.value = false;
  }
};

const threads = computed(() => forumStore.discussions);

const categories = computed(() => {
  const cats = new Set(threads.value.map(t => t.category));
  return Array.from(cats).filter(Boolean);
});

const currentPage = ref(1);
const itemsPerPage = 8;

const totalThreads = computed(() => threads.value.length);
const pinnedThreads = computed(() => threads.value.filter(t => t.status === 'PINNED').length);
const flaggedThreads = computed(() => threads.value.filter(t => t.status === 'FLAGGED').length);

// Filtering
const filteredThreads = computed(() => {
  let result = [...threads.value];

  if (currentFilter.value !== 'ALL') {
    result = result.filter(t => t.status === currentFilter.value);
  }

  if (categoryFilter.value !== 'ALL') {
    result = result.filter(t => t.category === categoryFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      (t.title && t.title.toLowerCase().includes(query)) || 
      (t.author?.name && t.author.name.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.id && t.id.toString().includes(query))
    );
  }

  return result;
});

const paginatedThreads = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredThreads.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredThreads.value.length / itemsPerPage));

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

watch([searchQuery, categoryFilter, currentFilter], () => {
  currentPage.value = 1;
});

// Handlers
const handleTogglePin = async (id) => {
  await forumStore.togglePin(id);
  const updated = threads.value.find(t => t.id === id);
  if (selectedThread.value?.id === id) {
    selectedThread.value = { ...updated };
  }
  toast.success(updated.status === 'PINNED' ? 'Thread pinned' : 'Thread unpinned');
};

const handleToggleLock = async (id) => {
  await forumStore.toggleLock(id);
  const updated = threads.value.find(t => t.id === id);
  if (selectedThread.value?.id === id) {
    selectedThread.value = { ...updated };
  }
  toast.success(updated.status === 'LOCKED' ? 'Thread locked' : 'Thread unlocked');
};

const handleDeleteThread = async (id) => {
  if (confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
    try {
      await forumStore.deleteDiscussion(id);
      if (selectedThread.value?.id === id) {
        selectedThread.value = threads.value[0] || null;
      }
      toast.success('Discussion deleted successfully');
    } catch (error) {
      toast.error('Failed to delete discussion');
    }
  }
};
</script>

<style scoped>
.thread-management-layout {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.admin-main {
  background-color: var(--color-bg);
}

.cursor-pointer {
  cursor: pointer;
}

.text-purple {
  color: var(--color-purple);
}

.text-blue {
  color: var(--color-info);
}

.text-red {
  color: var(--color-danger);
}

.bg-surface { background-color: var(--color-surface) !important; }
.text-adaptive { color: var(--color-text) !important; }
</style>
