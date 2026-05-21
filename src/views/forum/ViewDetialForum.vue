<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import { useForumStore } from '../../stores/ForumStore';

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();

const loading = ref(true);

const mockDiscussion = ref({
  id: "1",
  title: "Memory Leak when using custom hooks with IntersectionObserver",
  author: "@dev_marco",
  timestamp: "2h ago",
  tags: ["REACT", "PERFORMANCE"],
  votes: 128,
  body: `I've been noticing a steady increase in memory usage when implementing an infinite scroll feature. I suspect my custom useIntersection hook isn't cleaning up listeners properly when components unmount, especially in long lists.\n\nHere is a simplified version of the hook. I'm using React 18. Anyone spot the issue?`,
  codeSnippet: `import { useEffect, useRef, useState } from 'react';

export function useIntersection(options) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // Is this cleanup sufficient?
    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return { targetRef, isIntersecting };
}`,
  repliesCount: 24,
  replies: [
    {
      author: "@sys_admin_sarah",
      role: "Core Team",
      timestamp: "5h ago",
      votes: 85,
      accepted: true,
      body: `The issue is indeed in your cleanup function. You are calling unobserve on a specific element, but it's generally safer and more robust to just call disconnect() on the observer instance itself when the component unmounts.\n\nFurthermore, because options is in your dependency array, if you pass an inline object like { threshold: 0.5 } to this hook, it will re-create the observer on *every* render, leading to significant memory churn.`,
      codeSnippet: `// Better cleanup and memoization
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsIntersecting(entry.isIntersecting);
  }, options);

  const currentTarget = targetRef.current;
  if (currentTarget) {
    observer.observe(currentTarget);
  }

  return () => {
    // Disconnects all observed elements and cleans up
    observer.disconnect();
  };
}, [options]); // Ensure 'options' is memoized outside!`,
    }
  ]
});

onMounted(async () => {
  const id = route.params.id;
  await forumStore.fetchDiscussion(id);
  loading.value = false;
});

const discussion = () => {
  return forumStore.discussion || mockDiscussion.value;
};

const markdownInput = ref("");

</script>

<template>
  <div class="page-container">
    <Navbar />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      Loading thread...
    </div>

    <div v-else class="content-layout">
      <!-- Main Content Column -->
      <main class="main-column">
        <!-- Thread Post -->
        <article class="thread-post">
          <div class="vote-column">
            <button class="vote-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <span class="vote-count">{{ discussion().votes }}</span>
            <button class="vote-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <button class="star-btn mt-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
          </div>
          
          <div class="post-content">
            <div class="post-header">
              <h1 class="post-title">{{ discussion().title }}</h1>
              <span class="post-time">{{ discussion().timestamp }}</span>
            </div>
            
            <div class="post-tags" v-if="discussion().tags">
              <span v-for="tag in discussion().tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="post-body">
              <p v-for="(paragraph, index) in discussion().body.split('\n\n')" :key="index">{{ paragraph }}</p>
              
              <div v-if="discussion().codeSnippet" class="code-block">
                <pre><code>{{ discussion().codeSnippet }}</code></pre>
              </div>
            </div>

            <div class="post-footer">
              <div class="post-actions">
                <button class="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  {{ discussion().repliesCount }} Replies
                </button>
                <button class="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  Save
                </button>
                <button class="action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Share
                </button>
              </div>
              <div class="post-author">
                <div class="author-avatar">{{ (discussion().author || 'U').charAt(1).toUpperCase() }}</div>
                <span class="author-name">{{ discussion().author }}</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Answers Section -->
        <div class="answers-section">
          <div class="answers-header">
            <h2>{{ discussion().repliesCount }} Answers</h2>
            <div class="answers-sort">
              <button class="sort-btn active">Top Rated</button>
              <button class="sort-btn">Newest</button>
            </div>
          </div>

          <div class="answers-list">
            <article v-for="(reply, idx) in discussion().replies" :key="idx" class="answer-card" :class="{'accepted-answer': reply.accepted}">
              <div class="vote-column">
                <button class="vote-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </button>
                <span class="vote-count">{{ reply.votes || 0 }}</span>
                <button class="vote-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div v-if="reply.accepted" class="accepted-icon mt-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              
              <div class="answer-content">
                <div class="answer-header">
                  <div class="answer-author-info">
                    <div class="author-avatar small">{{ (reply.author || 'U').charAt(1).toUpperCase() }}</div>
                    <span class="author-name">{{ reply.author }}</span>
                    <span v-if="reply.role" class="author-role">{{ reply.role }}</span>
                  </div>
                  <span class="post-time">{{ reply.timestamp }}</span>
                </div>

                <div class="post-body">
                  <p v-for="(paragraph, pIdx) in (reply.body || '').split('\n\n')" :key="pIdx">{{ paragraph }}</p>
                  
                  <div v-if="reply.codeSnippet" class="code-block">
                    <pre><code>{{ reply.codeSnippet }}</code></pre>
                  </div>
                </div>

                <div class="post-footer">
                  <button class="action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div class="load-more-wrapper">
            <button class="load-more-btn">Load More Replies</button>
          </div>
        </div>

        <!-- Your Answer Section -->
        <div class="your-answer-section">
          <h3>Your Answer</h3>
          <div class="editor-container">
            <textarea 
              v-model="markdownInput" 
              placeholder="Write your technical response here... Markdown is supported."
            ></textarea>
            <div class="editor-footer">
              <button class="preview-btn">Preview</button>
              <button class="post-answer-btn">Post Answer</button>
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar Column -->
      <aside class="sidebar-column">
        <!-- Network Status -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            <h3>Network Status</h3>
          </div>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">Active Topics</span>
              <span class="status-value">1,482</span>
            </div>
            <div class="status-item">
              <span class="status-label">Online Devs</span>
              <span class="status-value with-dot"><span class="dot"></span> 8,945</span>
            </div>
            <div class="status-item">
              <span class="status-label">System Load</span>
              <span class="status-value">42%</span>
            </div>
          </div>
        </div>

        <!-- Trending Tags -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <h3>Trending Tags</h3>
          </div>
          <div class="tags-cloud">
            <span class="tag-pill">#React19</span>
            <span class="tag-pill">#WebAssembly</span>
            <span class="tag-pill">#GraphQL</span>
            <span class="tag-pill">#RustLang</span>
            <span class="tag-pill">#Kubernetes</span>
          </div>
        </div>

        <!-- Top Contributors -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            <h3>Top Contributors</h3>
          </div>
          <div class="contributors-list">
            <div class="contributor-item">
              <img src="https://i.pravatar.cc/150?u=1" class="contrib-avatar" alt="Elena Rostova">
              <div class="contrib-info">
                <span class="contrib-name">Elena Rostova</span>
                <span class="contrib-rep">14.2k Rep • Core Team</span>
              </div>
              <svg class="contrib-badge" width="16" height="16" viewBox="0 0 24 24" fill="#fef08a" stroke="#eab308" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div class="contributor-item">
              <img src="https://i.pravatar.cc/150?u=2" class="contrib-avatar" alt="David Chen">
              <div class="contrib-info">
                <span class="contrib-name">David Chen</span>
                <span class="contrib-rep">8.9k Rep • Mentor</span>
              </div>
            </div>
            <div class="contributor-item">
              <img src="https://i.pravatar.cc/150?u=3" class="contrib-avatar" alt="Samira Al-Fayed">
              <div class="contrib-info">
                <span class="contrib-name">Samira Al-Fayed</span>
                <span class="contrib-rep">6.1k Rep • Pro</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.content-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
  align-items: start;
}

/* Common Post Styles */
.thread-post, .answer-card {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.thread-post {
  margin-bottom: 32px;
}

.vote-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
}

.vote-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.vote-btn:hover {
  background: #f1f5f9;
  color: #6d28d9;
}

.vote-count {
  font-size: 20px;
  font-weight: 700;
  color: #6d28d9;
  margin: 4px 0;
}

.star-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.star-btn:hover {
  color: #f59e0b;
}

.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

.accepted-icon {
  color: #10b981;
  background: #d1fae5;
  border-radius: 50%;
  padding: 4px;
  display: flex;
}

.post-content, .answer-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.post-time {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.tag:nth-child(1) { background: #e0e7ff; color: #4338ca; }
.tag:nth-child(2) { background: #fce7f3; color: #be185d; }

.post-body {
  font-size: 15px;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 24px;
}

.post-body p {
  margin: 0 0 16px 0;
}

.code-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.code-block pre {
  margin: 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.post-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e293b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.author-avatar.small {
  background: url('https://i.pravatar.cc/150?u=4') center/cover;
  color: transparent;
}

.author-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

/* Answers Section */
.answers-section {
  margin-bottom: 40px;
}

.answers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.answers-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.answers-sort {
  display: flex;
  gap: 8px;
}

.sort-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn.active {
  background: white;
  color: #6d28d9;
  border-color: #6d28d9;
}

.answers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.answer-card {
  position: relative;
}

.accepted-answer {
  border-left: 4px solid #10b981;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.answer-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-role {
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #b45309;
  padding: 3px 8px;
  border-radius: 12px;
}

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more-btn {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Your Answer */
.your-answer-section h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.editor-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.editor-container textarea {
  width: 100%;
  min-height: 150px;
  border: none;
  padding: 20px;
  font-family: inherit;
  font-size: 15px;
  color: #334155;
  resize: vertical;
  outline: none;
}

.editor-container textarea::placeholder {
  color: #94a3b8;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.preview-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  cursor: pointer;
}

.post-answer-btn {
  background: #6d28d9;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.post-answer-btn:hover {
  background: #5b21b6;
}

/* Sidebar */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.sidebar-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.sidebar-card-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Network Status */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.status-label {
  color: #64748b;
  font-weight: 500;
}

.status-value {
  color: #0f172a;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
}

.status-value.with-dot {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

/* Trending Tags */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-pill:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Top Contributors */
.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contributor-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contrib-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.contrib-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.contrib-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.contrib-rep {
  font-size: 12px;
  color: #64748b;
}

.contrib-badge {
  margin-left: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-column {
    display: none; /* Can be moved to bottom or hidden on small screens */
  }
}

@media (max-width: 640px) {
  .thread-post, .answer-card {
    flex-direction: column;
    padding: 16px;
  }
  .vote-column {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }
}
</style>
