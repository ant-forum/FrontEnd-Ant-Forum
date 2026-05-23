<script setup>
import { onMounted, ref, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import LeftSidebar from '../../components/forum/LeftSidebar.vue';
import { useForumStore } from '../../stores/ForumStore';

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();

const loading = ref(true);
const newReplyText = ref('');
const repliesEnd = ref(null);

const categoryMap = {
  question:   { label: 'Question', icon: 'bi-question-circle-fill', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: 'rgba(59, 130, 246, 0.25)' },
  discussion: { label: 'Discussion', icon: 'bi-chat-left-text-fill', gradient: 'linear-gradient(135deg, #10b981, #047857)', shadow: 'rgba(16, 185, 129, 0.25)' },
  showcase:   { label: 'Show & Tell', icon: 'bi-rocket-takeoff-fill', gradient: 'linear-gradient(135deg, #a855f7, #6d28d9)', shadow: 'rgba(168, 85, 247, 0.25)' },
  tutorial:   { label: 'Tutorial', icon: 'bi-book-half', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', shadow: 'rgba(245, 158, 11, 0.25)' },
  idea:       { label: 'Idea', icon: 'bi-lightbulb-fill', gradient: 'linear-gradient(135deg, #0d9488, #0f766e)', shadow: 'rgba(13, 148, 136, 0.25)' }
};

// We'll try to fetch the discussion using the ID.
const mockDiscussion = ref(null);

const discussion = () => {
  return forumStore.discussion || mockDiscussion.value;
};

onMounted(async () => {
  const id = route.params.id;
  await forumStore.fetchDiscussion(id);
  
  // Mock data fallback if the API call didn't populate discussion
  if (!forumStore.discussion) {
    mockDiscussion.value = {
      id: id,
      title: "Optimizing IntersectionObserver composite layers for heavy lists",
      author: "@performance_dev",
      timestamp: "Posted 3h ago",
      category: "question",
      voted: null,
      votes: 14,
      excerpt: "Hey guys! I have been creating a modular viewport renderer. The issue is that composite layer sizing expands beyond viewport boundaries. Any ideas on how to constrain observer viewport bounds dynamically?",
      tags: [
        { label: "Vue.js", color: "green" },
        { label: "Performance", color: "orange" }
      ],
      replies: [
        {
          author: "@another_dev",
          timestamp: "1 hour ago",
          body: "This is a great question! Make sure to set custom rootMargin thresholds. By default, it uses standard viewport metrics which causes early rendering of hidden layers.",
          likes: 3,
          likedByUser: false
        },
        {
          author: "@frontend_wizard",
          timestamp: "30 mins ago",
          body: "I highly recommend wrapping layer components with defensive CSS `contain-intrinsic-size` or `content-visibility: auto`. It mitigates thread lockup significantly.",
          likes: 8,
          likedByUser: false
        }
      ]
    };
  }

  loading.value = false;
  setupCopyButtons();
});

// Watch for discussion changes and setup copy code buttons
watch(() => forumStore.discussion, () => {
  setupCopyButtons();
}, { deep: true });

const goBack = () => {
  router.push('/forum');
};

const handleVote = (direction) => {
  if (discussion()) {
    forumStore.toggleVoteDiscussion(discussion().id, direction);
  }
};

const handleLikeReply = (replyIndex) => {
  if (discussion()) {
    forumStore.toggleLikeReply(discussion().id, replyIndex);
  }
};

const postReply = () => {
  if (!newReplyText.value.trim()) return;

  const replyData = {
    author: "@current_user",
    timestamp: "Just now",
    body: newReplyText.value.trim(),
    likes: 0,
    likedByUser: false
  };

  forumStore.postReply(discussion().id, replyData);
  newReplyText.value = '';

  // Trigger smooth scroll to bottom and reload copy actions
  nextTick(() => {
    scrollToBottom();
    setupCopyButtons();
  });
};

const scrollToBottom = () => {
  repliesEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Generates sleek deterministically-colored avatars based on username
function getAvatarStyle(username) {
  if (!username) return {};
  const name = username.replace('@', '');
  const gradients = [
    'linear-gradient(135deg, #3b82f6, #2563eb)', // Blue
    'linear-gradient(135deg, #10b981, #059669)', // Emerald
    'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
    'linear-gradient(135deg, #ec4899, #db2777)', // Pink
    'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Purple
    'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  const grad = gradients[sum % gradients.length];
  return { background: grad };
}

// Search and inject copy buttons in pre tags dynamically
const setupCopyButtons = () => {
  nextTick(() => {
    const preBlocks = document.querySelectorAll('.thread-body pre, .reply-body pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return;

      pre.style.position = 'relative';
      const codeText = pre.querySelector('code')?.innerText || pre.innerText;

      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code: ', err);
        }
      });
      pre.appendChild(btn);
    });
  });
};
</script>

<template>
  <div class="thread-replies-page">
    <Navbar />

    <div class="replies-page-grid-layout">
      <LeftSidebar active-tab="questions" />

      <div class="replies-wrapper">
      <button @click="goBack" class="back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Discussions
      </button>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        Loading thread...
      </div>
      
      <div v-else-if="discussion()" class="thread-container">
        <!-- Main Thread Card -->
        <div class="main-thread">
          <div class="thread-header">
            <div class="thread-header-meta">
              <!-- Styled Category badge -->
              <span v-if="discussion().category && categoryMap[discussion().category]" class="category-badge" :style="{ background: categoryMap[discussion().category].gradient }">
                <i :class="['bi', categoryMap[discussion().category].icon]"></i>
                {{ categoryMap[discussion().category].label }}
              </span>

              <!-- Code indicator -->
              <span v-if="discussion().hasCode" class="snippet-badge">
                <i class="bi bi-code-slash"></i> Snippet
              </span>
            </div>

            <h1 class="thread-title">{{ discussion().title }}</h1>
            
            <div class="thread-meta">
              <div class="thread-avatar" :style="getAvatarStyle(discussion().author)">
                {{ (discussion().author || 'U').charAt(1).toUpperCase() }}
              </div>
              <div class="thread-user-info">
                <span class="author">{{ discussion().author }}</span>
                <span class="time">{{ discussion().timestamp }}</span>
              </div>
            </div>
          </div>

          <div class="thread-body" v-html="discussion().excerpt || discussion().body || 'No description provided.'">
          </div>

          <!-- Codeblock if present -->
          <div v-if="discussion().hasCode && discussion().code" class="thread-code-block">
            <div class="code-header">
              <span class="code-lang">Code Block</span>
              <div class="code-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <pre><code>{{ discussion().code }}</code></pre>
          </div>

          <!-- Custom tags section -->
          <div v-if="discussion().tags && discussion().tags.length > 0" class="thread-tags-box">
            <span v-for="t in discussion().tags" :key="t.label" class="tag-badge">
              #{{ t.label }}
            </span>
          </div>

          <div class="thread-actions">
            <!-- Active Votes column in action bar -->
            <div class="vote-actions">
              <button class="vote-action-btn up" :class="{ active: discussion().voted === 'up' }" @click="handleVote('up')">
                <i class="bi bi-arrow-up-circle-fill"></i>
                Upvote
              </button>
              <span class="vote-count-num" :class="{ 'voted-up': discussion().voted === 'up', 'voted-down': discussion().voted === 'down' }">
                {{ discussion().votes }}
              </span>
              <button class="vote-action-btn down" :class="{ active: discussion().voted === 'down' }" @click="handleVote('down')">
                <i class="bi bi-arrow-down-circle-fill"></i>
                Downvote
              </button>
            </div>
            
            <div class="right-actions">
              <button class="action-btn" @click="scrollToBottom">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Reply
              </button>
            </div>
          </div>
        </div>

        <!-- Replies Section -->
        <div class="replies-section">
          <h2>Discussion Replies ({{ discussion().replies?.length || 0 }})</h2>
          
          <div class="reply-list-container">
            <!-- Sleek Timeline Connector lines -->
            <div class="timeline-line"></div>

            <div class="reply-list">
              <div class="no-replies" v-if="!discussion().replies?.length">
                No replies yet. Be the first to share your thoughts!
              </div>
              
              <div v-else v-for="(reply, idx) in discussion().replies" :key="idx" class="reply-card">
                <div class="reply-header">
                  <div class="reply-avatar" :style="getAvatarStyle(reply.author)">
                    {{ (reply.author || 'U').charAt(1).toUpperCase() }}
                  </div>
                  <div class="reply-user-info">
                    <span class="reply-author">{{ reply.author || 'Unknown' }}</span>
                    <span class="reply-time">{{ reply.timestamp || 'Just now' }}</span>
                  </div>
                </div>
                <div class="reply-body" v-html="reply.body">
                </div>
                
                <div class="reply-actions">
                  <button class="like-btn" :class="{ active: reply.likedByUser }" @click="handleLikeReply(idx)">
                    <i :class="['bi', reply.likedByUser ? 'bi-heart-fill' : 'bi-heart']"></i>
                    <span>{{ reply.likes || 0 }} Likes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Element to target smooth scroll -->
          <div ref="repliesEnd" class="scroll-anchor"></div>
          
          <!-- Reply Input Box Overhaul -->
          <div class="reply-input-wrapper">
            <div class="input-header">
              <div class="reply-avatar current-user" :style="getAvatarStyle('@current_user')">C</div>
              <span class="input-prompt">Add to the discussion</span>
            </div>
            
            <textarea
              v-model="newReplyText"
              placeholder="Write a constructive, formatted reply... Markdown is supported."
              class="reply-textarea"
            ></textarea>
            
            <div class="reply-footer">
              <button
                class="post-btn"
                :disabled="!newReplyText.trim()"
                @click="postReply"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-state">
        Thread not found or could not be loaded.
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.thread-replies-page {
  min-height: 100vh;
  background: #fdfcff;
}

.replies-page-grid-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  max-width: 1440px;
  margin: 0 auto;
  gap: 28px;
  padding: 0 24px;
}

@media (max-width: 1024px) {
  .replies-page-grid-layout {
    grid-template-columns: 1fr;
    padding: 0;
  }
  .left-sidebar-navigation {
    display: none !important;
  }
}

.replies-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid rgba(229, 231, 235, 0.8);
  color: #4b5563;
  font-weight: 600;
  font-size: 13.5px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.01);
}

.back-btn:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #7c3aed;
  transform: translateX(-2px);
}

.thread-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.main-thread {
  background: white;
  border-radius: 20px;
  padding: 36px;
  border: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  position: relative;
}

.thread-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
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

.snippet-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(124, 58, 237, 0.08);
  color: #7c3aed;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  border: 1px solid rgba(168, 85, 247, 0.15);
}

.thread-title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 20px;
  line-height: 1.35;
  letter-spacing: -0.5px;
}

.thread-header {
  margin-bottom: 24px;
}

.thread-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(243, 244, 246, 0.8);
}

.thread-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border: 2px solid white;
}

.thread-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.thread-meta .author {
  font-weight: 700;
  color: #111827;
  font-size: 15px;
}

.thread-meta .time {
  font-size: 12.5px;
  color: #9ca3af;
}

.thread-body {
  font-size: 16px;
  color: #374151;
  line-height: 1.75;
  margin-bottom: 24px;
}

/* Monospaced code snippets styling */
.thread-body :deep(code),
.reply-body :deep(code),
.thread-body :deep(font[face="monospace"]),
.reply-body :deep(font[face="monospace"]),
.thread-body :deep(span[style*="monospace"]),
.reply-body :deep(span[style*="monospace"]) {
  background-color: #f3f4f6 !important;
  padding: 3px 6px !important;
  border-radius: 6px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13.5px !important;
  color: #dc2626 !important;
  border: 1px solid #e5e7eb !important;
}

.thread-body :deep(pre),
.reply-body :deep(pre) {
  background: #110e1a !important;
  padding: 14px 18px !important;
  border-radius: 14px !important;
  overflow-x: auto !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  margin: 18px 0;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid rgba(168, 85, 247, 0.1);
}

.thread-body :deep(pre code),
.reply-body :deep(pre code) {
  background: transparent !important;
  color: #e9d5ff !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  font-size: 13px !important;
}

/* Floating copy code buttons inside pre blocks */
:deep(pre .copy-code-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #c084fc;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

:deep(pre .copy-code-btn:hover) {
  background: rgba(255,255,255,0.12);
  color: white;
  transform: translateY(-1px);
}

:deep(pre .copy-code-btn.copied) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.thread-body :deep(blockquote),
.reply-body :deep(blockquote) {
  border-left: 4px solid #c084fc !important;
  background: rgba(192, 132, 252, 0.03);
  margin: 18px 0 !important;
  padding: 10px 18px !important;
  border-radius: 0 10px 10px 0;
  color: #4b5563 !important;
}

/* Premium embedded table styling */
.thread-body :deep(table),
.reply-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 18px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  border: 1px solid #e5e7eb;
}

.thread-body :deep(th), .thread-body :deep(td),
.reply-body :deep(th), .reply-body :deep(td) {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
  text-align: left;
}

.thread-body :deep(th),
.reply-body :deep(th) {
  background-color: #faf9ff;
  font-weight: 700;
  color: #1f2937;
}

.thread-code-block {
  background: #110e1a;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
  border: 1px solid rgba(168, 85, 247, 0.1);
  margin-bottom: 24px;
}

.thread-code-block pre {
  margin: 0;
  padding: 14px 18px 18px;
  overflow-x: auto;
}

.thread-code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #e9d5ff;
}

.thread-tags-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tag-badge {
  font-size: 12.5px;
  font-weight: 700;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.05);
  padding: 4px 12px;
  border-radius: 8px;
}

.thread-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px dashed rgba(229, 231, 235, 0.8);
}

.vote-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(229, 231, 235, 0.8);
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vote-action-btn i {
  font-size: 14px;
  color: #d1d5db;
  transition: color 0.2s ease;
}

.vote-action-btn:hover {
  background: #f9fafb;
  color: #1f2937;
  border-color: #cbd5e1;
}

.vote-action-btn.up.active {
  background: rgba(37, 99, 235, 0.05);
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.2);
}

.vote-action-btn.up.active i {
  color: #2563eb;
}

.vote-action-btn.down.active {
  background: rgba(220, 38, 38, 0.05);
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.2);
}

.vote-action-btn.down.active i {
  color: #dc2626;
}

.vote-count-num {
  font-size: 15px;
  font-weight: 800;
  color: #1f2937;
  min-width: 24px;
  text-align: center;
}

.vote-count-num.voted-up {
  color: #2563eb;
}

.vote-count-num.voted-down {
  color: #dc2626;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(124, 58, 237, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.15);
  color: #7c3aed;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}

/* Replies Section styling */
.replies-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}

.replies-section h2 {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 10px 0 0;
  padding-left: 2px;
}

.reply-list-container {
  position: relative;
}

/* Sleek connector timeline thread lines */
.timeline-line {
  position: absolute;
  left: 20px;
  top: 10px;
  bottom: 20px;
  width: 2px;
  background: rgba(124, 58, 237, 0.08);
  pointer-events: none;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reply-card {
  background: white;
  border-radius: 18px;
  padding: 24px 28px;
  border: 1px solid rgba(229, 231, 235, 0.6);
  box-shadow: 0 4px 15px rgba(0,0,0,0.01);
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
  animation: slide-up-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-up-in {
  0% { transform: translateY(12px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.reply-card:hover {
  border-color: rgba(168, 85, 247, 0.2);
  box-shadow: 0 4px 20px rgba(124,58,237,0.03);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reply-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  border: 2px solid white;
}

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-author {
  font-weight: 700;
  font-size: 14.5px;
  color: #1f2937;
}

.reply-time {
  font-size: 12px;
  color: #9ca3af;
}

.reply-body {
  font-size: 15px;
  color: #4b5563;
  line-height: 1.65;
  margin-bottom: 16px;
}

.reply-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(243, 244, 246, 0.6);
}

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #9ca3af;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.like-btn i {
  font-size: 13.5px;
}

.like-btn:hover {
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
}

.like-btn.active {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.15);
  animation: heart-pop 0.3s ease;
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Reply Input Box Overhaul */
.reply-input-wrapper {
  background: white;
  border-radius: 20px;
  padding: 28px;
  margin-top: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  border: 1px solid rgba(229, 231, 235, 0.8);
  transition: all 0.3s ease;
}

.reply-input-wrapper:focus-within {
  border-color: #c084fc;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.08), 0 0 0 3px rgba(168, 85, 247, 0.15);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.current-user {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.input-prompt {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}

.reply-textarea {
  width: 100%;
  min-height: 110px;
  border: none;
  resize: vertical;
  font-family: inherit;
  font-size: 15px;
  outline: none;
  color: #1f2937;
  padding: 4px;
}

.reply-textarea::placeholder {
  color: #9ca3af;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(243, 244, 246, 0.8);
}

.post-btn {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);
}

.post-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(109, 40, 217, 0.3);
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.no-replies {
  text-align: center;
  padding: 48px 20px;
  color: #6b7280;
  background: #fdfcff;
  border-radius: 16px;
  border: 1px dashed rgba(168, 85, 247, 0.2);
  font-weight: 600;
}

.scroll-anchor {
  height: 1px;
}

/* Loading & Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #6b7280;
  font-size: 16px;
  font-weight: 600;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3.5px solid rgba(124, 58, 237, 0.08);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

