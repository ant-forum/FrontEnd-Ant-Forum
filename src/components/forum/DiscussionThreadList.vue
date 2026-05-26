<script setup>
import { ref } from 'vue';
import { useForumStore } from '../../stores/ForumStore';

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

const categoryMap = {
  question:   { label: 'Question', icon: 'bi-question-circle-fill', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: 'rgba(59, 130, 246, 0.25)' },
  discussion: { label: 'Discussion', icon: 'bi-chat-left-text-fill', gradient: 'linear-gradient(135deg, #10b981, #047857)', shadow: 'rgba(16, 185, 129, 0.25)' },
  showcase:   { label: 'Show & Tell', icon: 'bi-rocket-takeoff-fill', gradient: 'linear-gradient(135deg, #a855f7, #6d28d9)', shadow: 'rgba(168, 85, 247, 0.25)' },
  tutorial:   { label: 'Tutorial', icon: 'bi-book-half', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', shadow: 'rgba(245, 158, 11, 0.25)' },
  idea:       { label: 'Idea', icon: 'bi-lightbulb-fill', gradient: 'linear-gradient(135deg, #0d9488, #0f766e)', shadow: 'rgba(13, 148, 136, 0.25)' }
};

function getTagStyle(color) {
  const t = tagColorMap[color] || tagColorMap.gray;
  return { background: t.bg, color: t.color };
}

function toggleSave(d) {
  d.saved = !d.saved;
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

function handleVote(id, direction) {
  forumStore.toggleVoteDiscussion(id, direction);
}
</script>

<template>
  <div class="thread-list">
    <div v-for="d in discussions" :key="d.id" class="thread-card" @click="$router.push(`/forum/${d.id}`)">

      <!-- Vote Column (Highly Reactive) -->
      <div class="vote-col" :class="{ 'has-voted-up': d.voted === 'up', 'has-voted-down': d.voted === 'down' }" @click.stop>
        <button class="vote-btn up" :class="{ active: d.voted === 'up' }" @click.stop="handleVote(d.id, 'up')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <span class="vote-num" :class="{ 'voted-up': d.voted === 'up', 'voted-down': d.voted === 'down' }">
          {{ d.votes }}
        </span>
        <button class="vote-btn down" :class="{ active: d.voted === 'down' }" @click.stop="handleVote(d.id, 'down')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- Content Column -->
      <div class="thread-content">
        <!-- Meta Row -->
        <div class="thread-meta">
          <div class="thread-tags">
            <!-- Sleek Category indicator badge -->
            <span v-if="d.category && categoryMap[d.category]" class="category-badge" :style="{ background: categoryMap[d.category].gradient, boxShadow: '0 2px 8px ' + categoryMap[d.category].shadow }">
              <i :class="['bi', categoryMap[d.category].icon]"></i>
              {{ categoryMap[d.category].label }}
            </span>

            <!-- Code snippet badge indicator -->
            <span v-if="d.hasCode" class="snippet-badge">
              <i class="bi bi-code-slash"></i> Snippet
            </span>

            <span v-for="tag in d.tags" :key="tag.label" class="tag-chip" :style="getTagStyle(tag.color)">
              {{ tag.label }}
            </span>
          </div>
          <span class="thread-time">{{ d.timestamp }} by <em>{{ d.author }}</em></span>
        </div>

        <!-- Title -->
        <h3 class="thread-title">{{ d.title }}</h3>

        <!-- Excerpt -->
        <p class="thread-excerpt">{{ d.excerpt }}</p>

        <!-- Code block -->
        <div v-if="d.hasCode && d.code" class="code-block">
          <div class="code-header">
            <span class="code-lang">Go</span>
            <div class="code-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
          <pre><code>{{ d.code }}</code></pre>
        </div>

        <!-- Footer -->
        <div class="thread-footer">
          <button class="foot-btn replies" @click.stop="$router.push(`/forum/${d.id}`)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {{ d.replies?.length || 0 }} Replies
          </button>

          <button class="foot-btn bookmark" :class="{ 'is-saved': d.saved }" @click.stop="toggleSave(d)">
            <svg width="13" height="13" viewBox="0 0 24 24" :fill="d.saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {{ d.saved ? 'Saved' : 'Save' }}
          </button>

          <div class="foot-spacer"></div>

          <button class="foot-btn share" :class="{ 'is-copied': copiedId === d.id }" @click.stop="shareThread(d.id)">
            <svg v-if="copiedId === d.id" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {{ copiedId === d.id ? 'Copied!' : 'Share' }}
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
  gap: 12px;
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
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-purple-light);
}

/* Vote Column styling */
.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 22px 10px;
  gap: 3px;
  min-width: 52px;
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
  transition: all 0.25s ease;
  cursor: default;
}

.vote-col.has-voted-up {
  background: rgba(59, 130, 246, 0.03);
}

.vote-col.has-voted-down {
  background: rgba(239, 68, 68, 0.03);
}

.vote-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-purple);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.vote-btn:hover {
  background: var(--color-purple-light);
  color: var(--color-purple);
}

.vote-btn.up.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.vote-btn.down.active {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.vote-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text);
  text-align: center;
  padding: 2px 0;
  line-height: 1;
  transition: color 0.2s ease;
}

.vote-num.voted-up {
  color: var(--color-primary);
}

.vote-num.voted-down {
  color: var(--color-danger);
}

/* Content */
.thread-content {
  flex: 1;
  padding: 20px 22px 16px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Meta */
.thread-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.thread-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  color: white;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.2);
}

.category-badge i {
  font-size: 10.5px;
}

.snippet-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--color-purple-light);
  color: var(--color-purple);
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  border: 1px solid var(--color-purple-light);
}

.tag-chip {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  letter-spacing: 0.1px;
}

.thread-time {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.thread-time em {
  font-style: normal;
  color: var(--color-purple);
  font-weight: 700;
}

/* Title */
.thread-title {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
  transition: color 0.2s;
}

.thread-card:hover .thread-title {
  color: var(--color-purple);
}

/* Excerpt */
.thread-excerpt {
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Code block */
.code-block {
  background: #110e1a;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid rgba(168, 85, 247, 0.1);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #191624;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.code-lang {
  font-size: 10.5px;
  font-weight: 700;
  color: #c084fc;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.code-dots {
  display: flex;
  gap: 5px;
}

.code-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.code-dots span:nth-child(1) { background: #ef4444; }
.code-dots span:nth-child(2) { background: #f59e0b; }
.code-dots span:nth-child(3) { background: #22c55e; }

.code-block pre {
  margin: 0;
  padding: 14px 18px 18px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: #e9d5ff;
  white-space: pre;
}

/* Footer */
.thread-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid rgba(243, 244, 246, 0.8);
}

.foot-spacer { flex: 1; }

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid transparent;
  background: transparent;
  color: #9ca3af;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 9px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.foot-btn:hover {
  background: rgba(124, 58, 237, 0.05);
  color: #7c3aed;
}

.foot-btn.replies:hover {
  background: rgba(124, 58, 237, 0.05);
  color: #7c3aed;
}

.foot-btn.bookmark.is-saved {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.04);
  border-color: rgba(168, 85, 247, 0.15);
}

.foot-btn.share:hover {
  background: rgba(16, 185, 129, 0.05);
  color: #059669;
}

.foot-btn.share.is-copied {
  color: #059669;
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(52, 211, 153, 0.2);
}

@media (max-width: 600px) {
  .thread-card { flex-direction: column; }
  .vote-col { flex-direction: row; padding: 12px 16px; min-width: auto; gap: 12px; border-right: none; border-bottom: 1px solid rgba(229, 231, 235, 0.5); }
  .thread-meta { flex-direction: column; align-items: flex-start; }
}
</style>