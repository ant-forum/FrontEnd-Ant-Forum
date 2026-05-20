<script setup>
import { ref } from 'vue';

defineProps({
  discussions: { type: Array, required: true }
});

const tagColorMap = {
  blue:   { bg: '#dbeafe', color: '#1d4ed8' },
  orange: { bg: '#ffedd5', color: '#c2410c' },
  green:  { bg: '#dcfce7', color: '#15803d' },
  purple: { bg: '#ede9fe', color: '#7c3aed' },
  pink:   { bg: '#fce7f3', color: '#be185d' },
  teal:   { bg: '#ccfbf1', color: '#0f766e' },
  red:    { bg: '#fee2e2', color: '#dc2626' },
  gray:   { bg: '#f3f4f6', color: '#374151' },
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
</script>

<template>
  <div class="thread-list">
    <div v-for="d in discussions" :key="d.id" class="thread-card">

      <!-- Vote -->
      <div class="vote-col">
        <button class="vote-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <span class="vote-num">{{ d.votes }}</span>
        <button class="vote-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="thread-content">
        <!-- Meta -->
        <div class="thread-meta">
          <div class="thread-tags">
            <span v-for="tag in d.tags" :key="tag.label" class="tag-chip" :style="getTagStyle(tag.color)">
              {{ tag.label }}
            </span>
          </div>
          <span class="thread-time">{{ d.timestamp }} by <em>{{ d.author }}</em></span>
        </div>

        <!-- Title -->
        <h3 class="thread-title" @click="$router.push(`/forum/${d.id}`)">{{ d.title }}</h3>

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
          <button class="foot-btn" @click="$router.push(`/forum/${d.id}`)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {{ d.replies }} Replies
          </button>

          <button class="foot-btn" :class="{ 'is-saved': d.saved }" @click="toggleSave(d)">
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
  gap: 10px;
}

.thread-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.thread-card:hover {
  box-shadow: 0 8px 28px rgba(109, 40, 217, 0.1);
  transform: translateY(-1px);
}

/* Vote */
.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 22px 10px;
  gap: 2px;
  min-width: 48px;
  background: #faf9ff;
}

.vote-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #c4b5fd;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.18s ease;
}

.vote-btn:hover {
  background: #ede9fe;
  color: #6d28d9;
}

.vote-num {
  font-size: 16px;
  font-weight: 800;
  color: #1f1030;
  text-align: center;
  padding: 2px 0;
  line-height: 1;
}

/* Content */
.thread-content {
  flex: 1;
  padding: 20px 22px 16px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
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
  gap: 6px;
  flex-wrap: wrap;
}

.tag-chip {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  letter-spacing: 0.2px;
}

.thread-time {
  font-size: 11.5px;
  color: #b0b7c3;
  white-space: nowrap;
}

.thread-time em {
  font-style: normal;
  color: #7c3aed;
  font-weight: 600;
}

/* Title */
.thread-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.5;
  cursor: pointer;
  transition: color 0.18s ease;
}

.thread-title:hover { color: #6d28d9; }

/* Excerpt */
.thread-excerpt {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Code block */
.code-block {
  background: #13111c;
  border-radius: 12px;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #1c1928;
}

.code-lang {
  font-size: 10.5px;
  font-weight: 700;
  color: #a78bfa;
  letter-spacing: 0.5px;
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
  background: #374151;
}

.code-dots span:nth-child(1) { background: #ef4444; }
.code-dots span:nth-child(2) { background: #f59e0b; }
.code-dots span:nth-child(3) { background: #22c55e; }

.code-block pre {
  margin: 0;
  padding: 12px 16px 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #c4b5fd;
  white-space: pre;
}

/* Footer */
.thread-footer {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
}

.foot-spacer { flex: 1; }

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.18s ease;
  font-family: inherit;
}

.foot-btn:hover {
  background: #f5f3ff;
  color: #6d28d9;
}

.foot-btn.is-saved {
  color: #7c3aed;
  font-weight: 600;
}

.foot-btn.share:hover {
  background: #f5f3ff;
  color: #6d28d9;
}

.foot-btn.is-copied {
  color: #10b981;
  font-weight: 600;
}

.foot-btn.is-copied:hover {
  background: #ecfdf5;
  color: #059669;
}

@media (max-width: 600px) {
  .thread-card { flex-direction: column; }
  .vote-col { flex-direction: row; padding: 12px 16px; min-width: auto; gap: 10px; }
  .thread-meta { flex-direction: column; align-items: flex-start; }
}
</style>