<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import { useForumStore } from '../../stores/ForumStore';

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();

const loading = ref(true);

// We'll try to fetch the discussion using the ID. 
// If the API isn't ready, we will mock it so the UI works right now.
const mockDiscussion = ref(null);

onMounted(async () => {
  const id = route.params.id;
  await forumStore.fetchDiscussion(id);
  
  // Mock data fallback if the API call didn't populate discussion
  if (!forumStore.discussion) {
    mockDiscussion.value = {
      id: id,
      title: "Sample discussion thread " + id,
      author: "@sample_user",
      timestamp: "Just now",
      excerpt: "This is a placeholder content since the backend API may not be wired up to return this specific discussion thread yet.",
      replies: [
        {
          author: "@another_dev",
          timestamp: "1 hour ago",
          body: "This is a great question! I've run into this same issue before. Make sure to check your dependency array.",
          likes: 2
        },
        {
          author: "@frontend_wizard",
          timestamp: "30 mins ago",
          body: "I highly recommend extracting the logic into a custom hook or composable. It keeps the component clean and makes testing much easier.",
          likes: 5
        }
      ]
    };
  }

  loading.value = false;
});

const goBack = () => {
  router.back();
};

const discussion = () => {
  return forumStore.discussion || mockDiscussion.value;
};
</script>

<template>
  <div class="thread-replies-page">
    <Navbar />

    <div class="replies-wrapper">
      <button @click="goBack" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Forum
      </button>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        Loading thread...
      </div>
      
      <div v-else-if="discussion()" class="thread-container">
        <!-- Main Thread Content -->
        <div class="main-thread">
          <div class="thread-header">
            <h1 class="thread-title">{{ discussion().title }}</h1>
            <div class="thread-meta">
              <div class="thread-avatar">{{ (discussion().author || 'U').charAt(1).toUpperCase() }}</div>
              <div class="thread-user-info">
                <span class="author">{{ discussion().author }}</span>
                <span class="time">{{ discussion().timestamp }}</span>
              </div>
            </div>
          </div>
          <div class="thread-body" v-html="discussion().excerpt || discussion().body || 'No description provided.'">
          </div>
          <div class="thread-actions">
            <button class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
              Upvote
            </button>
            <button class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Reply
            </button>
            <button class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              Share
            </button>
          </div>
        </div>

        <!-- Replies Section -->
        <div class="replies-section">
          <h2>Discussion Replies</h2>
          
          <div class="reply-list">
            <div class="no-replies" v-if="!discussion().replies?.length">
              No replies yet. Be the first to share your thoughts!
            </div>
            
            <div v-else v-for="(reply, idx) in discussion().replies" :key="idx" class="reply-card">
              <div class="reply-header">
                <div class="reply-avatar" :class="'avatar-' + (idx % 3)">{{ (reply.author || 'U').charAt(1).toUpperCase() }}</div>
                <div class="reply-user-info">
                  <span class="reply-author">{{ reply.author || 'Unknown' }}</span>
                  <span class="reply-time">{{ reply.timestamp || 'Just now' }}</span>
                </div>
              </div>
              <div class="reply-body" v-html="reply.body">
              </div>
              <div class="reply-actions">
                <button class="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                  {{ reply.likes || 0 }}
                </button>
                <button class="action-btn">Reply</button>
              </div>
            </div>
          </div>
          
          <!-- Reply Input Placeholder -->
          <div class="reply-input-wrapper">
            <div class="input-header">
              <div class="reply-avatar current-user">Y</div>
              <span class="input-prompt">Add to the discussion</span>
            </div>
            <textarea placeholder="Write a reply..." class="reply-textarea"></textarea>
            <div class="reply-footer">
              <button class="post-btn">Post Reply</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-state">
        Thread not found or could not be loaded.
      </div>
    </div>
  </div>
</template>

<style scoped>
.thread-replies-page {
  min-height: 100vh;
  background: #f6f5fb;
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
  border: none;
  color: #6d28d9;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #ede9fe;
}

.thread-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-thread {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.thread-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px;
  line-height: 1.3;
}

.thread-header {
  margin-bottom: 24px;
}

.thread-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.thread-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.thread-user-info {
  display: flex;
  flex-direction: column;
}

.thread-meta .author {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.thread-meta .time {
  font-size: 13px;
  color: #9ca3af;
}

.thread-body {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 24px;
}

.thread-body :deep(code),
.reply-body :deep(code),
.thread-body :deep(font[face="monospace"]),
.reply-body :deep(font[face="monospace"]),
.thread-body :deep(span[style*="monospace"]),
.reply-body :deep(span[style*="monospace"]) {
  background-color: #e5e7eb !important;
  padding: 3px 6px !important;
  border-radius: 4px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 13.5px !important;
  color: #111827 !important;
}

.thread-body :deep(pre),
.reply-body :deep(pre) {
  background: #f3f4f6 !important;
  padding: 12px !important;
  border-radius: 6px !important;
  overflow-x: auto !important;
  font-family: monospace !important;
  margin: 12px 0;
}

.thread-body :deep(blockquote),
.reply-body :deep(blockquote) {
  border-left: 4px solid #d1d5db !important;
  margin: 12px 0 12px 10px !important;
  padding: 0 0 0 12px !important;
  color: #374151 !important;
}

.thread-body :deep(table),
.reply-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}
.thread-body :deep(th), .thread-body :deep(td),
.reply-body :deep(th), .reply-body :deep(td) {
  border: 1px solid #d1d5db;
  padding: 10px 14px;
  text-align: left;
}
.thread-body :deep(th),
.reply-body :deep(th) {
  background-color: #f3f4f6;
}

.thread-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

/* Replies Section */
.replies-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.replies-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 10px 0;
  padding-left: 8px;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reply-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.avatar-0 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.avatar-1 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.avatar-2 { background: linear-gradient(135deg, #ec4899, #db2777); }

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-author {
  font-weight: 600;
  font-size: 14.5px;
  color: #111827;
}

.reply-time {
  font-size: 12px;
  color: #9ca3af;
}

.reply-body {
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 16px;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

/* Reply Input */
.reply-input-wrapper {
  background: white;
  border-radius: 14px;
  padding: 24px;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.reply-input-wrapper:focus-within {
  border-color: #d8b4fe;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1);
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
  font-size: 14px;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}

.input-prompt {
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

.reply-textarea {
  width: 100%;
  min-height: 100px;
  border: none;
  resize: vertical;
  font-family: inherit;
  font-size: 15px;
  outline: none;
  color: #111827;
}

.reply-textarea::placeholder {
  color: #9ca3af;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
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

.post-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(109, 40, 217, 0.3);
}

.no-replies {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
  font-weight: 500;
}

/* Loading & Error */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
