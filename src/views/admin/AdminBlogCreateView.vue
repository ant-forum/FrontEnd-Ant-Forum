<template>
  <AdminPageShell
    :title="route.query.id ? 'Edit Blog' : 'Create Blog'"
    kicker="Admin Publishing"
    :subtitle="route.query.id ? 'Edit and refine your existing article.' : 'Write and prepare an official long-form article for the ANT Forum community.'"
    :breadcrumbs="[
      { label: 'Blog Management', to: '/admin/blogs' },
      { label: route.query.id ? 'Edit Blog' : 'Create Blog' }
    ]"
  >
    <template #before-title>
      <router-link class="btn btn-light border back-link" to="/admin/blogs">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Blogs</span>
      </router-link>
    </template>

    <router-link
      v-if="form.status === 'draft' && !saved"
      to="/admin/blogs?tab=draft"
      class="composer-toolbar clickable-toolbar-banner"
      title="Click to view all drafts in the Blog Management dashboard"
    >
      <div class="composer-state">
        <span class="status-badge draft">{{ statusBadgeLabel }}</span>
        <span class="state-message">
          You are editing a local draft. You have <strong>{{ blogStore.drafts.length }}</strong> drafts ready to be published.
        </span>
      </div>
      <div class="toolbar-notes">
        <span class="action-hint">View all drafts <i class="bi bi-arrow-right"></i></span>
      </div>
    </router-link>

    <!-- Normal non-clickable toolbar when not draft or when saved -->
    <div v-else class="composer-toolbar">
      <div class="composer-state">
        <span :class="['status-badge', saved ? 'saved' : form.status]">{{ statusBadgeLabel }}</span>
        <p class="state-message">{{ statusMessage }}</p>
      </div>
      <div class="toolbar-notes">
        <span><i class="bi bi-type-h2"></i> Headings</span>
        <span><i class="bi bi-card-image"></i> Inline images</span>
        <span><i class="bi bi-braces"></i> Code blocks</span>
      </div>
    </div>

    <!-- Premium Loader Overlay when fetching draft -->
    <div v-if="isEditLoading" class="editor-loading-overlay">
      <div class="loader-content">
        <div class="d-flex gap-2 justify-content-center">
          <div class="spinner-grow text-primary" role="status"></div>
          <div class="spinner-grow text-purple" role="status"></div>
          <div class="spinner-grow text-info" role="status"></div>
        </div>
        <p class="loading-text">Loading your draft workspace...</p>
      </div>
    </div>

    <section v-else class="blog-editor-grid">
      <form id="blog-post-form" class="editor-column" @submit.prevent="savePost">
        <section class="admin-panel article-header-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Article Header</p>
              <h2>Start with the story</h2>
              <p>Add a focused title and a cover image that introduces the article.</p>
            </div>
            <span class="field-counter">{{ form.title.length }}/120</span>
          </div>

          <div class="field-block">
            <label for="blog-title">Blog Title</label>
            <input
              id="blog-title"
              v-model="form.title"
              class="form-control title-input"
              type="text"
              maxlength="120"
              placeholder="Example: Mastering State Management in Vue 3"
            >
          </div>

          <div class="field-block">
            <div class="field-heading">
              <label>Cover Image</label>
              <small>Shown at the top of the article</small>
            </div>
            <label class="cover-uploader" :class="{ 'has-preview': thumbnailPreview }">
              <input ref="thumbnailInputRef" type="file" accept="image/*" @change="handleThumbnail">
              <img v-if="thumbnailPreview" :src="thumbnailPreview" alt="Selected article cover preview">
              <span v-else class="cover-placeholder">
                <i class="bi bi-image"></i>
                <strong>Upload a cover image</strong>
                <small>JPG, PNG, or WebP. Use a wide image for the article header.</small>
              </span>
              <span v-if="thumbnailPreview" class="replace-cover">
                <i class="bi bi-arrow-repeat"></i>
                Replace cover
              </span>
            </label>
          </div>
        </section>

        <section class="admin-panel article-body-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Article Body</p>
              <h2>Write the full blog post</h2>
              <p>Write directly in the final article view with headings, links, images, lists, tables, quotes, and code blocks.</p>
            </div>
            <span class="field-counter">{{ descriptionWordCount }} words</span>
          </div>

          <RichTextEditor
            v-model="form.description"
            class="blog-markdown-editor"
            placeholder="Introduce the topic, add clear sections, insert supporting images, and include code blocks where they help..."
          />
        </section>

        <section class="admin-panel settings-panel">
          <div>
            <p class="section-kicker">Publishing</p>
            <h2>Post Settings</h2>
            <p>Choose where the article belongs and how it should be saved.</p>
          </div>

          <div class="settings-row">
            <div class="field-block">
              <label for="blog-category">Category</label>
              <select id="blog-category" v-model="form.category_id" class="form-select">
                <option v-for="cat in blogStore.categories" :key="cat.id" :value="cat.id.toString()">
                  {{ cat.name || cat.title }}
                </option>
              </select>
            </div>

            <div class="field-block">
              <label for="blog-status">Status</label>
              <select id="blog-status" v-model="form.status" class="form-select">
                <option value="draft">Save as draft</option>
                <option value="published">Publish now</option>
                <option value="scheduled">Schedule for later</option>
              </select>
            </div>
          </div>

          <div class="publish-actions">
            <button class="btn btn-light border" type="button" @click="resetForm" :disabled="blogStore.isLoading || !hasChanges">Clear</button>
            <button class="btn btn-primary" type="submit" form="blog-post-form" :disabled="blogStore.isLoading || !hasChanges">
              <span v-if="blogStore.isLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="bi bi-send-check"></i>
              <span>{{ saveButtonLabel }}</span>
            </button>
          </div>
        </section>
      </form>

      <aside class="side-stack">
        <section class="admin-panel article-preview-panel">
          <p class="section-kicker">Article Preview</p>
          <div v-if="thumbnailPreview" class="preview-cover">
            <img :src="thumbnailPreview" alt="Selected article cover preview">
          </div>
          <div v-else class="preview-cover empty">
            <i class="bi bi-image"></i>
          </div>
          <span :class="['status-badge', form.status]">{{ statusBadgeLabel }}</span>
          <h2>{{ form.title || 'Your article title' }}</h2>
          <p>{{ previewText }}</p>
          <div class="preview-meta">
            <span><i class="bi bi-folder2"></i> {{ categoryLabel }}</span>
            <span><i class="bi bi-file-earmark-text"></i> {{ descriptionWordCount }} words</span>
          </div>
        </section>

        <section class="admin-panel readiness-panel">
          <div class="readiness-heading">
            <div>
              <p class="section-kicker">Before Publishing</p>
              <h2>Article Readiness</h2>
            </div>
            <strong>{{ readyItemCount }}/4</strong>
          </div>

          <ul class="readiness-list">
            <li :class="{ complete: hasClearTitle }">
              <i :class="hasClearTitle ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              <span>Clear article title</span>
            </li>
            <li :class="{ complete: hasUsefulDescription }">
              <i :class="hasUsefulDescription ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              <span>Long-form article body</span>
            </li>
            <li :class="{ complete: Boolean(form.category_id) }">
              <i :class="form.category_id ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              <span>Category selected</span>
            </li>
            <li :class="{ complete: Boolean(form.thumbnail) }">
              <i :class="form.thumbnail ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              <span>Cover image attached</span>
            </li>
          </ul>
        </section>

        <section class="admin-panel editor-help-panel">
          <i class="bi bi-lightbulb"></i>
          <div>
            <h2>Writing Tip</h2>
            <p>Use the image icon in the article toolbar for images inside the post. Use the braces icon for formatted code blocks.</p>
          </div>
        </section>
      </aside>
    </section>
  </AdminPageShell>

  <BaseModal
    v-if="showLeaveModal"
    title="Discard Unsaved Changes?"
    icon="bi bi-exclamation-triangle"
    theme="primary"
    @closeModal="cancelLeave"
  >
    <p class="leave-modal-text">{{ leaveMessage }}</p>
    <p class="leave-modal-note">Your latest title, cover, and article body edits have not been saved yet.</p>

    <template #footer>
      <button class="btn btn-light border" type="button" @click="cancelLeave">
        Keep Editing
      </button>
      <button class="btn btn-danger" type="button" @click="confirmLeave">
        Discard Changes
      </button>
    </template>
  </BaseModal>

  <ImageCropModal
    v-if="isCoverCropOpen"
    :source="coverCropSource"
    @confirm="confirmCoverCrop"
    @cancel="cancelCoverCrop"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import ImageCropModal from '../../components/base/ImageCropModal.vue';
import RichTextEditor from '../../components/forum/create/RichTextEditor.vue';
import { useBlogStore } from '../../stores/BlogStore.js';
import { useImageCropper } from '../../composables/useImageCropper.js';
import { useToast } from '../../composables/useToast.js';
import { useUnsavedChangesGuard } from '../../composables/useUnsavedChangesGuard.js';
import { htmlToPlainText } from '../../utils/richContent.js';

const blogStore = useBlogStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const saved = ref(false);
const thumbnailInputRef = ref(null);
const thumbnailPreview = ref('');
const selectedFile = ref(null);
const isEditLoading = ref(!!route.query.id);
const isInitializing = ref(true);
const {
  cropSource: coverCropSource,
  isCropModalOpen: isCoverCropOpen,
  openCropper: openCoverCropper,
  confirmCrop: confirmCoverCrop,
  cancelCrop: cancelCoverCrop,
} = useImageCropper({
  title: 'Crop Cover Image',
  aspectRatio: 'original',
  outputWidth: 1200,
  outputType: 'image/jpeg',
  shape: 'rect',
});

const form = reactive({
  title: '',
  description: '',
  category_id: '2',
  thumbnail: '',
  status: 'draft',
});
const serializeForm = () => JSON.stringify(form);
const formSnapshot = ref(serializeForm());
const hasChanges = computed(() => !isInitializing.value && (serializeForm() !== formSnapshot.value || Boolean(selectedFile.value)));
const {
  showLeaveModal,
  message: leaveMessage,
  confirmLeave,
  cancelLeave,
} = useUnsavedChangesGuard(
  hasChanges,
  'You have unsaved blog changes. Leave this page and discard them?',
  { useModal: true },
);

const statusBadgeLabel = computed(() => {
  if (saved.value) return 'Saved';
  if (form.status === 'draft') return 'Draft';
  if (form.status === 'published') return 'Publishing';
  if (form.status === 'scheduled') return 'Scheduled';
  return form.status;
});

const statusMessage = computed(() => {
  if (saved.value) return 'All latest draft changes have been successfully saved to the database.';
  if (form.status === 'draft') {
    return 'You are editing a local draft. Your changes will not be visible to the community until you publish.';
  }
  if (form.status === 'published') {
    return 'Ready to publish: This article will become immediately visible to all community members upon submission.';
  }
  if (form.status === 'scheduled') {
    return 'Scheduled: This article will be queued for future release based on your calendar and date settings.';
  }
  return 'Prepare your official long-form article for the community.';
});

onMounted(async () => {
  try {
    await blogStore.fetchCategories();
    if (blogStore.categories.length > 0) {
      form.category_id = blogStore.categories[0].id.toString();
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
  try {
    await blogStore.fetchAllBlogs();
  } catch (err) {
    console.error('Failed to load blogs:', err);
  }

  // Load for editing if query parameter 'id' is present
  const editId = route.query.id;
  if (editId) {
    isEditLoading.value = true;
    try {
      const blogData = await blogStore.fetchBlogById(editId);
      if (blogData) {
        form.title = blogData.title || '';
        form.description = blogData.description || '';
        form.category_id = blogData.category_id ? blogData.category_id.toString() : '2';
        form.status = blogData.status || 'draft';
        if (blogData.thumbnail || blogData.image) {
          thumbnailPreview.value = blogData.thumbnail || blogData.image;
          // Set to a truthy value so preview is showing, but selectedFile is null unless replaced
          form.thumbnail = blogData.thumbnail || blogData.image;
        }
      }
    } catch (err) {
      console.error('Failed to load blog for editing:', err);
      toast.error('Failed to load blog details.');
    } finally {
      isEditLoading.value = false;
    }
  }

  formSnapshot.value = serializeForm();
  isInitializing.value = false;
});

const previewText = computed(() => {
  const text = htmlToPlainText(form.description);

  return text || 'Your introduction will appear here as you start writing.';
});

const descriptionWordCount = computed(() => {
  const text = htmlToPlainText(form.description);
  return text ? text.split(/\s+/).length : 0;
});

const categoryLabel = computed(() => {
  const found = blogStore.categories.find(c => c.id.toString() === form.category_id.toString());
  return found ? (found.name || found.title) : 'Guides';
});

const hasClearTitle = computed(() => form.title.trim().length >= 8);
const hasUsefulDescription = computed(() => descriptionWordCount.value >= 40);

const readyItemCount = computed(() => [
  hasClearTitle.value,
  hasUsefulDescription.value,
  Boolean(form.category_id),
  Boolean(form.thumbnail),
].filter(Boolean).length);

const saveButtonLabel = computed(() => {
  if (form.status === 'published') return 'Publish Post';
  if (form.status === 'scheduled') return 'Schedule Post';
  return 'Save Draft';
});

const releaseThumbnailPreview = () => {
  if (thumbnailPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(thumbnailPreview.value);
  }
  thumbnailPreview.value = '';
};

const handleThumbnail = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';

  if (!file) {
    if (!thumbnailPreview.value) {
      selectedFile.value = null;
      form.thumbnail = '';
    }
    return;
  }

  if (!file.type.startsWith('image/')) {
    toast.error('Please choose an image file.');
    return;
  }

  const cropped = await openCoverCropper(file);
  if (!cropped) return;

  releaseThumbnailPreview();
  selectedFile.value = cropped.file;
  form.thumbnail = cropped.file.name;
  thumbnailPreview.value = cropped.previewUrl;
};

const clearThumbnail = () => {
  releaseThumbnailPreview();
  if (thumbnailInputRef.value) thumbnailInputRef.value.value = '';
  if (!route.query.id) {
    selectedFile.value = null;
    form.thumbnail = '';
  }
};

const savePost = async () => {
  if (!form.title.trim()) {
    toast.error('Please enter a blog title.');
    return;
  }
  if (!form.description.trim()) {
    toast.error('Please enter the blog content.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category_id', form.category_id);
    formData.append('status', form.status);
    
    if (selectedFile.value) {
      formData.append('thumbnail', selectedFile.value);
    }

    if (route.query.id) {
      await blogStore.updateBlog(route.query.id, formData);
      toast.success('Blog updated successfully!');
    } else {
      await blogStore.createBlog(formData);
      toast.success('Blog created successfully!');
    }
    
    formSnapshot.value = serializeForm();
    selectedFile.value = null;
    saved.value = true;

    setTimeout(() => {
      router.push('/admin/blogs');
    }, 800);
  } catch (err) {
    console.error('Failed to save blog:', err);
    toast.error(err.message || 'Failed to save blog.');
  }
};

const resetForm = () => {
  clearThumbnail();
  selectedFile.value = null;
  form.title = '';
  form.description = '';
  form.category_id = blogStore.categories.length > 0 ? blogStore.categories[0].id.toString() : '2';
  form.thumbnail = '';
  form.status = 'draft';
  saved.value = false;
  if (thumbnailInputRef.value) thumbnailInputRef.value.value = '';
};

onBeforeUnmount(releaseThumbnailPreview);
</script>

<style scoped>
.back-link,
.publish-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.back-link {
  margin-bottom: 1rem;
}

.composer-toolbar,
.composer-state,
.toolbar-notes,
.field-heading,
.readiness-heading,
.preview-meta {
  display: flex;
  align-items: center;
}

.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1.25rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.84rem;
}

.clickable-toolbar-banner {
  text-decoration: none !important;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-color: rgba(139, 92, 246, 0.3) !important;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.08) 0%, var(--color-surface) 100%) !important;
}

.clickable-toolbar-banner:hover {
  transform: translateY(-2px);
  border-color: var(--color-purple) !important;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.15) !important;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, var(--color-surface-hover) 100%) !important;
}

.clickable-toolbar-banner .state-message strong {
  color: var(--color-purple);
  background: rgba(139, 92, 246, 0.15);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  margin: 0 0.15rem;
}

.action-hint {
  color: var(--color-purple);
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: transform 0.2s ease;
}

.clickable-toolbar-banner:hover .action-hint {
  transform: translateX(4px);
}

.composer-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.state-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.state-message {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-notes {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.preview-meta {
  gap: 0.65rem;
  flex-wrap: wrap;
}

.editor-loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 3rem;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loader-content .spinner-grow {
  width: 1.25rem;
  height: 1.25rem;
  animation-duration: 0.75s;
}

.text-purple {
  color: var(--color-purple) !important;
}

.loading-text {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-top: 1rem;
  animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.toolbar-notes span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.toolbar-notes i {
  color: var(--color-primary);
}

.blog-editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.62fr);
  gap: 1rem;
  align-items: start;
}

.editor-column,
.side-stack,
.settings-panel {
  display: grid;
  gap: 1rem;
}

.admin-panel {
  padding: 1.15rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-heading,
.readiness-heading {
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.section-kicker {
  color: var(--color-primary) !important;
  font-size: 0.68rem !important;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.3rem !important;
  text-transform: uppercase;
}

.panel-heading h2,
.settings-panel h2,
.article-preview-panel h2,
.readiness-panel h2,
.editor-help-panel h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-heading p,
.settings-panel p,
.article-preview-panel p,
.editor-help-panel p {
  color: var(--color-text-muted);
  font-size: 0.84rem;
  margin: 0;
}

.field-block {
  display: grid;
  gap: 0.55rem;
}

.field-block + .field-block {
  margin-top: 1rem;
}

.field-heading {
  justify-content: space-between;
  gap: 0.75rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
}

.field-heading small,
.field-counter {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.form-control,
.form-select {
  min-height: 42px;
  border-radius: 8px !important;
  font-size: 0.88rem;
}

.title-input {
  min-height: 50px;
  font-size: 1rem;
  font-weight: 700;
}

.cover-uploader {
  position: relative;
  min-height: 210px;
  display: grid;
  overflow: hidden;
  place-items: center;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  cursor: pointer;
}

.cover-uploader:hover {
  border-color: var(--color-primary);
}

.cover-uploader input {
  display: none;
}

.cover-uploader img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.cover-placeholder {
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  padding: 1rem;
  text-align: center;
}

.cover-placeholder i {
  color: var(--color-primary);
  font-size: 1.45rem;
}

.cover-placeholder strong {
  color: var(--color-text);
  font-size: 0.9rem;
}

.cover-placeholder small {
  font-size: 0.75rem;
}

.replace-cover {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.6rem;
  color: #fff;
  background: rgba(2, 6, 23, 0.78);
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 800;
}

.blog-markdown-editor :deep(.editor-container) {
  border-radius: 8px;
}

.blog-markdown-editor :deep(.editor-workspace) {
  height: 640px;
}

.publish-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

.settings-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.settings-row .field-block + .field-block {
  margin-top: 0;
}

.status-badge {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.28rem 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.status-badge.draft {
  color: var(--color-purple);
  background: var(--color-purple-light);
}

.status-badge.published {
  color: var(--color-success);
  background: var(--color-success-light);
}

.status-badge.scheduled {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.status-badge.saved {
  color: var(--color-success);
  background: var(--color-success-light);
}

.readiness-heading strong {
  display: inline-flex;
  width: fit-content;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.28rem 0.6rem;
  text-transform: capitalize;
}

.article-preview-panel {
  display: grid;
  gap: 0.65rem;
}

.preview-cover {
  height: 128px;
  overflow: hidden;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.preview-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-cover.empty {
  display: grid;
  color: var(--color-primary);
  place-items: center;
}

.article-preview-panel h2,
.article-preview-panel p {
  overflow-wrap: anywhere;
}

.article-preview-panel p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.preview-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.readiness-list {
  display: grid;
  gap: 0.55rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.readiness-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;
}

.readiness-list li.complete {
  color: var(--color-success);
}

.editor-help-panel {
  display: flex;
  gap: 0.7rem;
}

.editor-help-panel > i {
  color: var(--color-warning);
}

@media (min-width: 1200px) {
  .side-stack {
    position: sticky;
    top: calc(76px + 1rem);
    max-height: calc(100vh - 76px - 2rem);
    overflow-y: auto;
    padding-right: 0.15rem;
  }
}

@media (max-width: 1199.98px) {
  .blog-editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 991.98px) {
  .composer-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1rem;
  }

  .composer-state {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .state-header {
    flex-direction: row;
    width: 100%;
  }

  .state-message {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .toolbar-notes {
    margin-top: 0.25rem;
    justify-content: space-between;
    border-top: 1px solid var(--color-border);
    padding-top: 0.75rem;
    width: 100%;
  }
}

@media (max-width: 767.98px) {
  .toolbar-notes {
    display: none;
  }

  .cover-uploader {
    min-height: 170px;
  }

  .blog-markdown-editor :deep(.editor-workspace) {
    height: 520px;
  }

  .settings-row {
    grid-template-columns: 1fr;
  }
}
</style>
