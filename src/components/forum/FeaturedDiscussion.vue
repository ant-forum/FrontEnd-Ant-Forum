<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForumStore } from '@/stores/ForumStore';

const router = useRouter();
const forumStore = useForumStore();

const discussions = computed(() => {
  return Array.isArray(forumStore.allDiscussions)
    ? forumStore.allDiscussions
    : [];
});

const threadScore = (thread) => {
  const votes = Number(thread?.votes ?? thread?.likes ?? 0);
  const replies = Array.isArray(thread?.replies)
    ? thread.replies.length
    : Number(thread?.replies ?? thread?.comment_count ?? 0);
  const createdTime = new Date(thread?.createdAt || thread?.created_at || 0).getTime();
  const recentBoost = Number.isFinite(createdTime) ? createdTime / 100000000000 : 0;
  return (votes * 3) + (replies * 5) + recentBoost;
};

const spotlightThread = computed(() => {
  if (!discussions.value.length) return null;
  return [...discussions.value].sort((a, b) => threadScore(b) - threadScore(a))[0];
});

const getReplyCount = (thread) => {
  if (Array.isArray(thread?.replies)) return thread.replies.length;
  return Number(thread?.replies ?? thread?.comment_count ?? 0);
};

const getAuthorName = (thread) => {
  const author = thread?.author;
  if (typeof author === 'object' && author) {
    return author.username || author.name || 'Forum member';
  }
  return author || thread?.username || 'Forum member';
};

const getThreadCategory = (thread) => {
  const raw = thread?.categoryLabel || thread?.categoryMeta?.label || thread?.category || 'Discussion';
  return String(raw)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const totalReplies = computed(() => {
  return discussions.value.reduce((sum, thread) => sum + getReplyCount(thread), 0);
});

const unansweredCount = computed(() => {
  return discussions.value.filter((thread) => getReplyCount(thread) === 0).length;
});

const activeTagNames = computed(() => {
  const counts = new Map();
  discussions.value.forEach((thread) => {
    const tags = Array.isArray(thread.tags) ? thread.tags : [];
    tags.forEach((tag) => {
      const label = typeof tag === 'object' ? tag.label || tag.name : tag;
      if (!label) return;
      const cleanLabel = String(label).replace(/^#/, '').trim();
      counts.set(cleanLabel, (counts.get(cleanLabel) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);
});

const stats = computed(() => [
  { label: 'Threads', value: discussions.value.length, icon: 'bi-chat-square-text' },
  { label: 'Replies', value: totalReplies.value, icon: 'bi-reply-all' },
  { label: 'Open', value: unansweredCount.value, icon: 'bi-question-circle' },
]);

const openSpotlight = () => {
  if (spotlightThread.value?.id) {
    router.push(`/forum/${spotlightThread.value.id}`);
    return;
  }
  router.push('/forum/create');
};

const openCreate = () => {
  router.push('/forum/create');
};

const openTag = (tag) => {
  router.push({ path: '/forum', query: { tag: tag } });
};
</script>

<template>
  <section class="featured-section" aria-label="Forum highlights">
    <div class="spotlight-panel">
      <div class="spotlight-top">
        <span class="featured-badge">
          <i class="bi bi-lightning-charge-fill"></i>
          Community Pulse
        </span>
        <span class="category-pill">{{ spotlightThread ? getThreadCategory(spotlightThread) : 'Discussion' }}</span>
      </div>

      <h1 class="featured-title">
        {{ spotlightThread?.title || 'Start the next useful discussion' }}
      </h1>

      <p class="featured-description">
        {{ spotlightThread?.excerpt || spotlightThread?.description || 'Ask a focused question, share what you tried, and help the community build better answers together.' }}
      </p>

      <div class="thread-meta">
        <span>
          <i class="bi bi-person-circle"></i>
          {{ getAuthorName(spotlightThread) }}
        </span>
        <span>
          <i class="bi bi-heart"></i>
          {{ spotlightThread?.likes || spotlightThread?.votes || 0 }}
        </span>
        <span>
          <i class="bi bi-chat-dots"></i>
          {{ getReplyCount(spotlightThread) }}
        </span>
      </div>

      <div class="featured-actions">
        <button class="primary-action" type="button" @click="openSpotlight">
          <i class="bi bi-arrow-right-circle-fill"></i>
          {{ spotlightThread ? 'Open Thread' : 'Ask Question' }}
        </button>
        <button class="secondary-action" type="button" @click="openCreate">
          <i class="bi bi-plus-lg"></i>
          New Question
        </button>
      </div>
    </div>

    <aside class="pulse-panel" aria-label="Forum activity">
      <div class="stats-grid">
        <div v-for="item in stats" :key="item.label" class="stat-card">
          <i :class="['bi', item.icon]"></i>
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <div class="tag-strip">
        <span class="tag-strip-label">Active tags</span>
        <div class="tag-list">
          <button
            v-for="tag in activeTagNames"
            :key="tag"
            type="button"
            class="tag-chip"
            @click="openTag(tag)"
          >
            #{{ tag }}
          </button>
          <span v-if="activeTagNames.length === 0" class="tag-empty">No tags yet</span>
        </div>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.featured-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: auto;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.spotlight-panel,
.pulse-panel {
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--color-border) 86%, transparent);
  border-radius: 14px;
}

.spotlight-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 28px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--color-surface-hover) 65%, transparent), transparent 70%),
    var(--color-bg);
}

.spotlight-top,
.featured-actions,
.thread-meta,
.tag-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.spotlight-top {
  justify-content: space-between;
}

.featured-badge,
.category-pill,
.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 850;
}

.featured-badge {
  color: var(--color-purple);
  background: var(--color-purple-light);
  padding: 0 12px;
}

.category-pill {
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 0 11px;
}

.featured-title {
  max-width: 780px;
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.8rem, 4vw, 2.55rem);
  font-weight: 900;
  line-height: 1.08;
  overflow-wrap: anywhere;
}

.featured-description {
  max-width: 720px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.96rem;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.thread-meta {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 750;
}

.thread-meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border-radius: 12px;
  padding: 0 15px;
  font-size: 0.88rem;
  font-weight: 850;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.primary-action {
  color: #ffffff;
  background: var(--color-purple);
  border: 1px solid transparent;
}

.secondary-action {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-1px);
}

.pulse-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: color-mix(in srgb, var(--color-surface-hover) 62%, transparent);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  min-width: 0;
  min-height: 92px;
  display: grid;
  align-content: center;
  gap: 5px;
  padding: 12px;
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
  font-size: 1.45rem;
  font-weight: 900;
  line-height: 1;
}

.stat-card span,
.tag-strip-label,
.tag-empty {
  color: var(--color-text-muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.tag-strip {
  display: grid;
  gap: 10px;
  padding: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.tag-strip-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tag-chip {
  color: var(--color-text);
  background: var(--color-surface-hover);
  border: 1px solid color-mix(in srgb, var(--color-border) 78%, transparent);
  padding: 0 11px;
  cursor: pointer;
}

.tag-chip:hover {
  color: var(--color-purple);
  border-color: color-mix(in srgb, var(--color-purple) 48%, var(--color-border));
}

@media (max-width: 1050px) {
  .featured-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .featured-section {
    padding: 12px;
    border-radius: 16px;
  }

  .spotlight-panel,
  .pulse-panel {
    padding: 16px;
  }

  .spotlight-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }
}
</style>
