<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForumStore } from '../../stores/ForumStore';
import Navbar from '../../components/layouts/header.vue';

const router = useRouter();
const forumStore = useForumStore();

const form = ref({
  title: '',
  excerpt: '',
  tags: '',
  code: '',
  hasCode: false
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!form.value.title || !form.value.excerpt) return;
  
  isSubmitting.value = true;
  
  const tagsArray = form.value.tags
    .split(',')
    .map(t => t.trim())
    .filter(t => t)
    .map(label => ({
      label,
      color: ['blue', 'purple', 'green', 'orange', 'pink'][Math.floor(Math.random() * 5)]
    }));

  const newDiscussion = {
    title: form.value.title,
    excerpt: form.value.excerpt,
    tags: tagsArray.length ? tagsArray : [{ label: 'General', color: 'gray' }],
    code: form.value.hasCode ? form.value.code : null,
    hasCode: form.value.hasCode,
    votes: 0,
    replies: 0,
    author: '@current_user',
    timestamp: 'Just now',
    createdAt: new Date().toISOString(),
    saved: false,
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Actually we should use forumStore.createDiscussion if it existed, but since we mock,
  // let's just unshift it to the store's array for now to simulate success
  forumStore.discussions.unshift({ ...newDiscussion, id: Date.now() });
  
  isSubmitting.value = false;
  router.push('/forum');
};
</script>

<template>
  <div class="create-page">
    <Navbar />

    <div class="create-wrapper">
      <div class="page-header">
        <button class="back-btn" @click="router.push('/forum')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Forum
        </button>
        <h1>Ask a Question</h1>
        <p>Get help from the community by asking a clear, concise question.</p>
      </div>

      <div class="form-card">
        <form @submit.prevent="handleSubmit" class="create-form">
          <!-- Title -->
          <div class="form-group">
            <label>Title</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="e.g. How to handle state management in large Vue apps?" 
              required
              class="form-input"
            />
            <span class="help-text">Be specific and imagine you’re asking a question to another person.</span>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="form.excerpt" 
              rows="6" 
              placeholder="Provide context, what you have tried, and what you need help with..."
              required
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input 
              v-model="form.tags" 
              type="text" 
              placeholder="e.g. Vue, Pinia, Architecture" 
              class="form-input"
            />
          </div>

          <!-- Code Snippet -->
          <div class="form-group code-toggle-group">
            <label class="toggle-label">
              <input type="checkbox" v-model="form.hasCode" />
              <span class="toggle-text">Include a code snippet</span>
            </label>
          </div>

          <div v-if="form.hasCode" class="form-group">
            <textarea 
              v-model="form.code" 
              rows="5" 
              placeholder="// Paste your code here..."
              class="form-textarea code-font"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="router.push('/forum')">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="btn-spinner"></span>
              {{ isSubmitting ? 'Posting...' : 'Post Question' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #f6f5fb;
}

.create-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* Header */
.page-header {
  margin-bottom: 30px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  transition: color 0.2s;
  font-family: inherit;
}

.back-btn:hover {
  color: #111827;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

/* Card */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #111827;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  line-height: 1.5;
}

.code-font {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  background: #1e1e2e;
  color: #cdd6f4;
  border-color: #1e1e2e;
}

.code-font:focus {
  background: #1e1e2e;
  border-color: #8b5cf6;
}

.help-text {
  font-size: 12px;
  color: #9ca3af;
}

.code-toggle-group {
  margin-top: -8px;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.toggle-text {
  font-size: 14px;
  font-weight: 500 !important;
  color: #4b5563 !important;
}

/* Actions */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.btn-cancel, .btn-submit {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #111827;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  border: none;
  color: white;
  box-shadow: 0 4px 14px rgba(109, 40, 217, 0.25);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(109, 40, 217, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .create-wrapper {
    padding: 24px 16px 60px;
  }
  .form-card {
    padding: 20px;
  }
}
</style>
