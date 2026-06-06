<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForumStore } from '@/stores/ForumStore';

const router = useRouter();
const forumStore = useForumStore();

onMounted(async () => {
  try {
    await forumStore.fetchDiscussions();
  } catch (err) {
    console.warn('TrendingTags: failed to fetch discussions', err);
  }
  
  try {
    await forumStore.fetchTags();
  } catch (err) {
    console.warn('TrendingTags: failed to fetch tags', err);
  }
});

const staticTagsFallback = [
  { id: 1, name: '#React19' },
  { id: 2, name: '#WebAssembly' },
  { id: 3, name: '#GraphQL' },
  { id: 4, name: '#RustLang' },
  { id: 5, name: '#Kubernetes' },
  { id: 6, name: '#AI-Agents' },
];

const tags = computed(() => {
  const tagCounts = {};
  forumStore.discussions.forEach(d => {
    if (Array.isArray(d.tags)) {
      d.tags.forEach(t => {
        const tagName = typeof t === 'string' ? t : (t.label || t.name);
        if (tagName) {
          const cleanName = tagName.trim();
          tagCounts[cleanName] = (tagCounts[cleanName] || 0) + 1;
        }
      });
    }
  });

  const sortedTags = Object.keys(tagCounts)
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .map((name, idx) => ({
      id: idx + 1,
      name: name.startsWith('#') ? name : `#${name}`
    }));

  if (sortedTags.length > 0) {
    // Show top 8 used tags
    return sortedTags.slice(0, 8);
  }

  // Fallback to database tags if no tags are used in discussions yet
  if (forumStore.tags && forumStore.tags.length > 0) {
    return forumStore.tags.slice(0, 8).map(t => ({
      id: t.id,
      name: t.name.startsWith('#') ? t.name : `#${t.name}`
    }));
  }

  return staticTagsFallback;
});

const selectTag = (tagName) => {
  const cleanTag = tagName.replace('#', '').trim();
  router.push({ path: '/forum', query: { q: cleanTag } });
};
</script>

<template>
  <div class="trending-section">
    <h3 class="section-title">
      <span class="title-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      </span>
      Trending Tags
    </h3>

    <div class="tags-wrap">
      <button v-for="tag in tags" :key="tag.id" class="tag-btn" @click="selectTag(tag.name)">
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.trending-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-purple-light);
  border-radius: 6px;
  color: var(--color-purple);
  flex-shrink: 0;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
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

.tag-btn:hover {
  background: var(--color-purple-light);
  color: var(--color-purple);
  border-color: var(--color-purple);
}
</style>