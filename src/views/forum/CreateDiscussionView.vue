<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForumStore } from '../../stores/ForumStore';
import Navbar from '../../components/layouts/header.vue';

const router = useRouter();
const forumStore = useForumStore();

const isEditorFocused = ref(false);
const textareaRef = ref(null);
const imageInputRef = ref(null);

const activeStates = ref({
  bold: false,
  italic: false,
  strikeThrough: false,
  insertOrderedList: false,
  insertUnorderedList: false,
  code: false,
  pre: false,
  blockquote: false
});

const checkFormatting = () => {
  try {
    activeStates.value.bold = document.queryCommandState('bold');
    activeStates.value.italic = document.queryCommandState('italic');
    activeStates.value.strikeThrough = document.queryCommandState('strikeThrough');
    activeStates.value.insertOrderedList = document.queryCommandState('insertOrderedList');
    activeStates.value.insertUnorderedList = document.queryCommandState('insertUnorderedList');
    
    const selection = document.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      let isCode = false;
      let isPre = false;
      let isBlockquote = false;
      
      while (node && node !== textareaRef.value && node.tagName !== 'BODY') {
        if (node.nodeType === 1) { // Element node
          const tag = node.tagName.toLowerCase();
          if (tag === 'pre') isPre = true;
          if (tag === 'blockquote') isBlockquote = true;
        }
        node = node.parentNode;
      }
      
      const fontName = document.queryCommandValue('fontName');
      activeStates.value.code = typeof fontName === 'string' && fontName.includes('monospace');
      activeStates.value.pre = isPre;
      activeStates.value.blockquote = isBlockquote;
    }
  } catch (e) {
    console.error('Error checking formatting:', e);
  }
};

const handleEditorClick = (event) => {
  checkFormatting();
  
  if (event.target.tagName === 'IMG') {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(event.target);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const showLinkPopup = ref(false);
const linkForm = ref({ url: 'https://', text: '' });
let savedSelectionRange = null;

const openLinkPopup = () => {
  const editor = textareaRef.value;
  if (!editor) return;
  
  editor.focus();
  const selection = document.getSelection();
  if (selection.rangeCount > 0) {
    savedSelectionRange = selection.getRangeAt(0);
    linkForm.value.text = selection.toString();
  } else {
    savedSelectionRange = null;
    linkForm.value.text = '';
  }
  
  linkForm.value.url = '';
  showLinkPopup.value = true;
};

const saveLink = () => {
  if (!linkForm.value.url) return;
  
  const editor = textareaRef.value;
  editor.focus();
  
  if (savedSelectionRange) {
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelectionRange);
  }
  
  const linkText = linkForm.value.text || linkForm.value.url;
  const linkHtml = `<a href="${linkForm.value.url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  document.execCommand('insertHTML', false, linkHtml);
  
  form.value.excerpt = editor.innerHTML;
  checkFormatting();
  showLinkPopup.value = false;
};

const cancelLink = () => {
  showLinkPopup.value = false;
  if (savedSelectionRange) {
    const editor = textareaRef.value;
    editor.focus();
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelectionRange);
  }
};

const triggerImageUpload = () => {
  if (imageInputRef.value) {
    imageInputRef.value.click();
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Use ObjectURL to simulate uploaded image preview
  const imageUrl = URL.createObjectURL(file);
  
  const editor = textareaRef.value;
  if (!editor) return;

  editor.focus();
  document.execCommand('insertImage', false, imageUrl);

  event.target.value = ''; // Reset input
  
  // Update model
  form.value.excerpt = editor.innerHTML;
};

const insertFormat = (command, value = null) => {
  const editor = textareaRef.value;
  if (!editor) return;

  editor.focus();
  
  if (command === 'createLink') {
    openLinkPopup();
    return;
  }
  
  if (command === 'table') {
    const tableHTML = '<table><tr><th>Column 1</th><th>Column 2</th></tr><tr><td>Text</td><td>Text</td></tr></table><br/>';
    document.execCommand('insertHTML', false, tableHTML);
  } else if (command === 'code') {
    const currentFont = document.queryCommandValue('fontName');
    if (typeof currentFont === 'string' && currentFont.includes('monospace')) {
      document.execCommand('fontName', false, 'inherit');
    } else {
      document.execCommand('fontName', false, 'monospace');
    }
  } else if (command === 'blockquote') {
    const selection = document.getSelection().toString();
    document.execCommand('insertHTML', false, `<blockquote>${selection || 'Quote'}</blockquote><br/>`);
  } else if (command === 'pre') {
    const selection = document.getSelection().toString();
    document.execCommand('insertHTML', false, `<pre>${selection || 'Code'}</pre><br/>`);
  } else {
    document.execCommand(command, false, value);
  }
  
  // Update model
  form.value.excerpt = editor.innerHTML;
  checkFormatting();
};

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

          <!-- Body -->
          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 15px; font-weight: 700;">Body <span style="color: #d93025">*</span></label>
            <p class="help-text" style="margin-bottom: 8px; margin-top: 2px;">Include all the information someone would need to answer your question. Min 220 characters.</p>
            
            <div class="editor-container" :class="{ 'focused': isEditorFocused }">
              <input type="file" ref="imageInputRef" accept="image/*" style="display: none;" @change="handleImageUpload" />
              <div class="editor-toolbar">
                <div class="toolbar-left">
                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn text-icon" title="Text Formatting" @mousedown.prevent>
                      <span class="aa-text">Aa</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.bold}" title="Bold" @mousedown.prevent="insertFormat('bold')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.italic}" title="Italic" @mousedown.prevent="insertFormat('italic')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.strikeThrough}" title="Strikethrough" @mousedown.prevent="insertFormat('strikeThrough')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 6 8 8C8 10 9.5 11 12 11C14.5 11 16 13 16 15C16 17 14.5 19 12 19C9.5 19 8 17 8 17"></path></svg>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.code}" title="Inline code" @mousedown.prevent="insertFormat('code')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.pre}" title="Code block" @mousedown.prevent="insertFormat('pre')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="16" x2="16" y2="16"></line></svg>
                    </button>
                    <button type="button" class="toolbar-btn" title="Snippet" @mousedown.prevent="insertFormat('insertHTML', '<hr class=\'snippet-hr\'/>')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="14" y1="2" x2="10" y2="22"></line></svg>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" title="Link" @mousedown.prevent="insertFormat('createLink')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.blockquote}" title="Blockquote" @mousedown.prevent="insertFormat('blockquote')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                    </button>
                    <button type="button" class="toolbar-btn" title="Image" @mousedown.prevent="triggerImageUpload">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </button>
                    <button type="button" class="toolbar-btn" title="Table" @mousedown.prevent="insertFormat('table')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.insertOrderedList}" title="Numbered list" @mousedown.prevent="insertFormat('insertOrderedList')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
                    </button>
                    <button type="button" class="toolbar-btn" :class="{'is-active': activeStates.insertUnorderedList}" title="Bulleted list" @mousedown.prevent="insertFormat('insertUnorderedList')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </button>
                    <button type="button" class="toolbar-btn" title="Horizontal rule" @mousedown.prevent="insertFormat('insertHorizontalRule')">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    </button>
                    
                    <button type="button" class="toolbar-btn" title="More" @mousedown.prevent>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                  </div>
                  
                  <!-- <button type="button" class="toolbar-btn help-btn" title="Help">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </button> -->
                </div>

                <div class="toolbar-right">
                  <div class="mode-toggles">
                    <button type="button" class="mode-btn active" title="Rich Text">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    </button>
                    <button type="button" class="mode-btn" title="Markdown">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:4px"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Link Popup -->
              <div v-if="showLinkPopup" class="link-popup-panel">
                <div class="form-group" style="margin-bottom: 0;">
                  <label>Link URL</label>
                  <input type="text" v-model="linkForm.url" class="popup-input" placeholder="https://" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label>Link text</label>
                  <input type="text" v-model="linkForm.text" class="popup-input" />
                </div>
                <div class="popup-actions">
                  <button type="button" class="btn-save" @click="saveLink">Save</button>
                  <button type="button" class="btn-cancel-link" @click="cancelLink">Cancel</button>
                </div>
              </div>
              
              <div 
                ref="textareaRef"
                class="editor-textarea"
                contenteditable="true"
                @input="form.excerpt = $event.target.innerHTML; checkFormatting()"
                @keyup="checkFormatting"
                @mouseup="handleEditorClick"
                @focus="isEditorFocused = true; checkFormatting()"
                @blur="isEditorFocused = false"
                style="overflow-y: auto;"
              ></div>
            </div>
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
  color: #6b7280;
}

/* Custom Editor */
.editor-container {
  border: 1px solid #d1d5db; /* Grey when not focused */
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  background: white;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}
.editor-container.focused {
  border-color: #3b82f6; /* Blue ring */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.link-popup-panel {
  padding: 16px;
  background: #fdfdfd;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.popup-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}
.popup-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.popup-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}
.btn-save {
  padding: 6px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-save:hover {
  background: #2563eb;
}
.btn-cancel-link {
  padding: 6px 16px;
  background: transparent;
  color: #6b7280;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancel-link:hover {
  color: #111827;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
}
.toolbar-btn:hover {
  background: #e5e7eb;
  color: #111827;
}
.toolbar-btn.is-active {
  background: #e0e7ff; /* light indigo */
  color: #4f46e5;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}
.text-icon {
  width: auto;
  padding: 0 8px;
  gap: 2px;
}
.aa-text {
  font-weight: 600;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  font-size: 15px;
}
.help-btn {
  margin-left: 8px;
}
.toolbar-right {
  display: flex;
  align-items: center;
}
.mode-toggles {
  display: flex;
  align-items: center;
  background: #e5e7eb;
  border-radius: 6px;
  padding: 2px;
}
.mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #4b5563;
  cursor: pointer;
  font-size: 12px;
}
.mode-btn.active {
  background: white;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.editor-textarea {
  width: 100%;
  padding: 16px;
  border: none;
  resize: vertical;
  min-height: 250px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #111827;
  background: white;
}
.editor-textarea:focus {
  outline: none;
}
.editor-textarea :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  cursor: pointer;
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.editor-textarea :deep(img::selection) {
  background-color: rgba(59, 130, 246, 0.3);
}

/* Rich Text Elements Styling */
.editor-textarea :deep(blockquote) {
  border-left: 4px solid #d1d5db !important;
  margin: 12px 0 12px 10px !important;
  padding: 0 0 0 12px !important;
  color: #374151 !important;
}
.editor-textarea :deep(pre) {
  background: #f3f4f6 !important;
  padding: 12px !important;
  border-radius: 6px !important;
  overflow-x: auto !important;
  font-family: monospace !important;
}
.editor-textarea :deep(code),
.editor-textarea :deep(font[face="monospace"]),
.editor-textarea :deep(font[face='"monospace"']),
.editor-textarea :deep(span[style*="monospace"]) {
  background-color: #e5e7eb !important;
  padding: 3px 6px !important;
  border-radius: 4px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 13.5px !important;
  color: #111827 !important;
}
.editor-textarea :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  background-color: white;
}
.editor-textarea :deep(table), 
.editor-textarea :deep(th), 
.editor-textarea :deep(td) {
  border: 1px solid #d1d5db;
}
.editor-textarea :deep(th), 
.editor-textarea :deep(td) {
  padding: 10px 14px;
  text-align: left;
}
.editor-textarea :deep(th) {
  background-color: #f3f4f6;
  font-weight: 600;
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
