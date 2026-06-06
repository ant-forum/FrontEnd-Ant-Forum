<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForumStore } from '@/stores/ForumStore';

const router = useRouter();

function goToProfile(author) {
  let username = 'user';
  if (typeof author === 'object' && author !== null) {
    username = author.username || author.name || 'user';
  } else if (typeof author === 'string') {
    username = author;
  }
  username = username.replace('@', '').trim();
  router.push(`/viewprofile/${username}`);
}

defineProps({
  discussions: { type: Array, required: true }
});

const forumStore = useForumStore();

const tagColorMap = {
  blue:   { bg: 'var(--color-tag-blue-bg)', color: 'var(--color-tag-blue-text)' },
  orange: { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' }, // mapping orange to pink for now or adding more variables
  green:  { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  purple: { bg: 'var(--color-tag-purple-bg)', color: 'var(--color-tag-purple-text)' },
  pink:   { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  teal:   { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  red:    { bg: 'var(--color-tag-red-bg)', color: 'var(--color-tag-red-text)' },
  gray:   { bg: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' },
};

// Add standard categories as fallback colors
const tagStyles = {
  'React': { bg: 'var(--color-tag-blue-bg)', color: 'var(--color-tag-blue-text)' },
  'Performance': { bg: 'var(--color-tag-purple-bg)', color: 'var(--color-tag-purple-text)' },
  'System Design': { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  'Architecture': { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  'CSS': { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  'Tailwind': { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  'Docker': { bg: 'var(--color-tag-blue-bg)', color: 'var(--color-tag-blue-text)' },
  'Node.js': { bg: 'var(--color-tag-purple-bg)', color: 'var(--color-tag-purple-text)' },
  'DevOps': { bg: 'var(--color-tag-purple-bg)', color: 'var(--color-tag-purple-text)' },
  'Vue 3': { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  'Composition API': { bg: 'var(--color-tag-blue-bg)', color: 'var(--color-tag-blue-text)' },
  'GraphQL': { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  'API': { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  'Security': { bg: 'var(--color-tag-red-bg)', color: 'var(--color-tag-red-text)' },
  'npm': { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  'Microservices': { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  'Monolith': { bg: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }
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
  forumStore.toggleSaveForum(d.id);
}

function toggleLike(d) {
  forumStore.toggleLikeDiscussion(d.id);
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
            Posted {{ d.timestamp }} by <span class="author-name" @click.stop="goToProfile(d.author)">@{{ typeof d.author === 'object' ? (d.author.username?.replace('@','') || 'author') : d.author?.replace('@','') }}</span>
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
          <button class="foot-btn like" :class="{ 'is-liked': d.likedByUser }" @click.stop="toggleLike(d)">
            <i :class="[d.likedByUser ? 'bi-heart-fill text-danger' : 'bi-heart']"></i>
            <span>{{ d.likes || 0 }} {{ (d.likes === 1) ? 'Like' : 'Likes' }}</span>
          </button>

          <button class="foot-btn replies" @click.stop="$router.push(`/forum/${d.id}`)">
            <span>{{ Array.isArray(d.replies) ? d.replies.length : (typeof d.replies === 'number' ? d.replies : 0) }} Replies</span>
            <i class="bi bi-chat-left"></i>
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
  background: var(--color-surface);
  border-radius: 18px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.thread-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
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
  color: var(--color-text-muted);
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
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.vote-btn.up.active {
  color: var(--color-primary);
}

.vote-btn.down.active {
  color: var(--color-danger);
}

.vote-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.vote-num.voted-up {
  color: var(--color-primary);
}

.vote-num.voted-down {
  color: var(--color-danger);
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
  color: var(--color-text-muted);
}

.author-name {
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: color 0.2s ease;
}

.author-name:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Title & Excerpt */
.thread-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.35;
  transition: color 0.2s ease;
}

.thread-card:hover .thread-title {
  color: var(--color-primary);
}

.thread-excerpt {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Code block (Go style dark block inside card) */
.code-block {
  background: var(--color-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin-top: 4px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
}

.code-lang {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.code-dots {
  display: flex;
  gap: 4px;
}

.code-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
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
  color: var(--color-text);
}

/* Footer Action Buttons */
.thread-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
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
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.foot-btn.bookmark.is-saved {
  color: var(--color-primary);
  font-weight: 600;
}

.foot-btn.like.is-liked {
  color: #ef4444;
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