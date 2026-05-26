<script setup>
import { ref } from 'vue';
import { useForumStore } from '@/stores/ForumStore';

defineProps({
  discussions: { type: Array, required: true }
});

const forumStore = useForumStore();

const tagColorMap = {
  blue:   { bg: '#eff6ff', color: '#3b82f6' }, // React, etc.
  yellow: { bg: '#fef9c3', color: '#ca8a04' },
  green:  { bg: '#f0fdf4', color: '#16a34a' },
  purple: { bg: '#f5f3ff', color: '#7c3aed' },
  pink:   { bg: '#fdf2f8', color: '#db2777' },
  teal:   { bg: '#f0fdfa', color: '#0d9488' },
  red:    { bg: '#fef2f2', color: '#dc2626' },
  gray:   { bg: '#f8fafc', color: '#64748b' },
};

// Add standard categories as fallback colors
const tagStyles = {
  'React': { bg: '#e0f2fe', color: '#0284c7' },
  'Performance': { bg: '#f5f3ff', color: '#7c3aed' },
  'System Design': { bg: '#fdf2f8', color: '#db2777' },
  'Architecture': { bg: '#ecfdf5', color: '#059669' },
  'CSS': { bg: '#fff7ed', color: '#ea580c' },
  'Tailwind': { bg: '#f0fdfa', color: '#0d9488' },
  'Docker': { bg: '#e0f2fe', color: '#0284c7' },
  'Node.js': { bg: '#fef9c3', color: '#ca8a04' },
  'DevOps': { bg: '#f5f3ff', color: '#7c3aed' },
  'Vue 3': { bg: '#ecfdf5', color: '#059669' },
  'Composition API': { bg: '#e0f2fe', color: '#0284c7' },
  'GraphQL': { bg: '#fdf2f8', color: '#db2777' },
  'API': { bg: '#f0fdfa', color: '#0d9488' },
  'Security': { bg: '#fef2f2', color: '#dc2626' },
  'npm': { bg: '#fff7ed', color: '#ea580c' },
  'Microservices': { bg: '#f0fdfa', color: '#0d9488' },
  'Monolith': { bg: '#f8fafc', color: '#64748b' }
};

function getTagStyle(label, defaultColor) {
  if (tagStyles[label]) {
    return { background: tagStyles[label].bg, color: tagStyles[label].color };
  }
  const colorKey = defaultColor || 'gray';
  const t = tagColorMap[colorKey] || tagColorMap.gray;
  return { background: t.bg, color: t.color };
}

const copiedId = ref(null);

async function shareThread(id) {
  const url = `${window.location.origin}/forum/${id}`;
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

function toggleSave(d) {
  d.saved = !d.saved;
}

function handleVote(id, direction) {
  forumStore.toggleVoteDiscussion(id, direction);
}
</script>

<template>
  <div class="thread-list">
    <div v-for="d in discussions" :key="d.id" class="thread-card" @click="$router.push(`/forum/${d.id}`)">
      
      <!-- Vote Column (Exactly like screenshot) -->
      <div class="vote-col" @click.stop>
        <button class="vote-btn up" :class="{ active: d.voted === 'up' }" @click.stop="handleVote(d.id, 'up')">
          <i class="bi bi-chevron-up"></i>
        </button>
        <span class="vote-num" :class="{ 'voted-up': d.voted === 'up', 'voted-down': d.voted === 'down' }">
          {{ d.votes }}
        </span>
        <button class="vote-btn down" :class="{ active: d.voted === 'down' }" @click.stop="handleVote(d.id, 'down')">
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>

      <!-- Content Column -->
      <div class="thread-content">
        <!-- Meta Row: Tags on left, posted info on right -->
        <div class="thread-meta">
          <div class="thread-tags">
            <span v-for="tag in d.tags" :key="tag.label" class="tag-chip" :style="getTagStyle(tag.label, tag.color)">
              {{ tag.label }}
            </span>
          </div>
          <span class="thread-time">
            Posted {{ d.timestamp }} by <span class="author-name">@{{ typeof d.author === 'object' ? (d.author.username?.replace('@','') || 'author') : d.author?.replace('@','') }}</span>
          </span>
        </div>

        <!-- Title -->
        <h3 class="thread-title">{{ d.title }}</h3>

        <!-- Excerpt -->
        <p class="thread-excerpt">{{ d.excerpt }}</p>

        <!-- Code Block (Card 2 / hasCode) -->
        <div v-if="d.hasCode && d.code" class="code-block" @click.stop>
          <div class="code-header">
            <span class="code-lang">Go snippet example</span>
            <div class="code-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
          <pre><code>{{ d.code }}</code></pre>
        </div>

        <!-- Footer Row -->
        <div class="thread-footer">
          <button class="foot-btn replies" @click.stop="$router.push(`/forum/${d.id}`)">
            <i class="bi bi-chat-left"></i>
            <span>{{ Array.isArray(d.replies) ? d.replies.length : (typeof d.replies === 'number' ? d.replies : 0) }} Replies</span>
          </button>

          <button class="foot-btn bookmark" :class="{ 'is-saved': d.saved }" @click.stop="toggleSave(d)">
            <i :class="[d.saved ? 'bi-bookmark-fill' : 'bi-bookmark']"></i>
            <span>{{ d.saved ? 'Saved' : 'Save' }}</span>
          </button>

          <button class="foot-btn share" :class="{ 'is-copied': copiedId === d.id }" @click.stop="shareThread(d.id)">
            <i :class="[copiedId === d.id ? 'bi-check' : 'bi-share']"></i>
            <span>{{ copiedId === d.id ? 'Copied!' : 'Share' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thread-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thread-card {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.thread-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

/* Vote Column (Clean layout matching reference) */
.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 8px 24px 24px;
  gap: 6px;
  min-width: 60px;
  user-select: none;
}

.vote-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.vote-btn:hover {
  color: #7c3aed;
  background: #f1f5f9;
}

.vote-btn.up.active {
  color: #2563eb;
}

.vote-btn.down.active {
  color: #dc2626;
}

.vote-num {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.vote-num.voted-up {
  color: #2563eb;
}

.vote-num.voted-down {
  color: #dc2626;
}

/* Thread Content Column */
.thread-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Metadata Row */
.thread-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.thread-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-chip {
  padding: 4px 12px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 99px;
}

.thread-time {
  font-size: 12.5px;
  color: #64748b;
}

.author-name {
  font-weight: 600;
  color: #0f172a;
}

/* Title & Excerpt */
.thread-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  transition: color 0.2s ease;
}

.thread-card:hover .thread-title {
  color: #7c3aed;
}

.thread-excerpt {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Code block (Go style dark block inside card) */
.code-block {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #1e293b;
  margin-top: 4px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.code-lang {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.code-dots {
  display: flex;
  gap: 4px;
}

.code-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #475569;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #e2e8f0;
}

/* Footer Action Buttons */
.thread-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.foot-btn i {
  font-size: 14px;
}

.foot-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.foot-btn.bookmark.is-saved {
  color: #7c3aed;
  font-weight: 600;
}

.foot-btn.share.is-copied {
  color: #16a34a;
}

@media (max-width: 640px) {
  .thread-card {
    flex-direction: column;
  }
  .vote-col {
    flex-direction: row;
    padding: 16px 16px 8px 16px;
    min-width: auto;
    gap: 12px;
  }
  .thread-content {
    padding: 8px 16px 16px 16px;
  }
}
</style>