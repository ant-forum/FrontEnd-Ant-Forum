<script setup>
import { computed } from 'vue';
import { useForumStore } from '@/stores/ForumStore';
import NetworkStatus from './NetworkStatus.vue';

const forumStore = useForumStore();

const discussions = computed(() => {
  return Array.isArray(forumStore.allDiscussions) ? forumStore.allDiscussions : [];
});

const getReplyCount = (thread) => {
  if (Array.isArray(thread?.replies)) return thread.replies.length;
  return Number(thread?.replies ?? thread?.comment_count ?? 0);
};

const totalReplies = computed(() => {
  return discussions.value.reduce((sum, thread) => sum + getReplyCount(thread), 0);
});

const unansweredCount = computed(() => {
  return discussions.value.filter((thread) => getReplyCount(thread) === 0).length;
});

const stats = computed(() => [
  { label: 'Threads', value: discussions.value.length, icon: 'bi-chat-square-text' },
  { label: 'Replies', value: totalReplies.value, icon: 'bi-reply-all' },
  { label: 'Open', value: unansweredCount.value, icon: 'bi-question-circle' },
]);
</script>

<template>
  <aside class="forum-sidebar">
    <!-- Stats Panel restored -->
    <div class="sidebar-card stats-panel">
      <div class="stats-grid">
        <div v-for="item in stats" :key="item.label" class="stat-card">
          <i :class="['bi', item.icon]"></i>
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="sidebar-card">
      <NetworkStatus />
    </div>
  </aside>
</template>

<style scoped>
.forum-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 80px;
  align-self: start;
}

.sidebar-card {
  background: transparent;
  border-radius: 0;
  padding: 6px 0;
  border: none;
  box-shadow: none;
  transition: all var(--transition-base);
}

/* Restored metrics layout */
.stats-panel {
  background: color-mix(in srgb, var(--color-surface-hover) 62%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 86%, transparent);
  border-radius: 14px;
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  min-width: 0;
  min-height: 82px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 5px;
  padding: 8px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.stat-card i {
  color: var(--color-purple);
  font-size: 1rem;
}

.stat-card strong {
  font-size: 1.35rem;
  font-weight: 900;
  line-height: 1;
}

.stat-card span {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
}
</style>