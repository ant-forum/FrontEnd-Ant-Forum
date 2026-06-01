<template>
  <AdminPageShell
    title="Create Blog"
    kicker="Admin Publishing"
    subtitle="Write and prepare an official long-form article for the ANT Forum community."
    :breadcrumbs="[
      { label: 'Blog Management', to: '/admin/blogs' },
      { label: 'Create Blog' }
    ]"
  >
    <template #before-title>
      <router-link class="btn btn-light border back-link" to="/admin/blogs">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Blogs</span>
      </router-link>
    </template>

    <div class="composer-toolbar">
      <div class="composer-state">
        <span class="status-badge">{{ saved ? 'Saved' : form.status }}</span>
        <span>{{ saved ? 'Your latest draft changes are saved.' : 'Create a clear article, then save it as a draft or publish it.' }}</span>
      </div>
      <div class="toolbar-notes">
        <span><i class="bi bi-type-h2"></i> Headings</span>
        <span><i class="bi bi-card-image"></i> Inline images</span>
        <span><i class="bi bi-braces"></i> Code blocks</span>
      </div>
    </div>

    <section class="blog-editor-grid">
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
              <p>Use headings, text styles, links, inline images, lists, quotes, and code blocks from the toolbar.</p>
            </div>
            <span class="field-counter">{{ descriptionWordCount }} words</span>
          </div>

          <MarkdownEditor
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
            <button class="btn btn-light border" type="button" @click="resetForm" :disabled="blogStore.isLoading">Clear</button>
            <button class="btn btn-primary" type="submit" form="blog-post-form" :disabled="blogStore.isLoading">
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
          <span class="status-badge">{{ form.status }}</span>
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
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import MarkdownEditor from '../../components/forum/create/MarkdownEditor.vue';
import { useBlogStore } from '../../stores/BlogStore.js';
import { useToast } from '../../composables/useToast.js';

const blogStore = useBlogStore();
const router = useRouter();
const toast = useToast();

const saved = ref(false);
const thumbnailInputRef = ref(null);
const thumbnailPreview = ref('');
const selectedFile = ref(null);

const form = reactive({
  title: '',
  description: '',
  category_id: '2',
  thumbnail: '',
  status: 'draft',
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
});

const previewText = computed(() => {
  const text = form.description
    .replace(/[#*_`>-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  return text || 'Your introduction will appear here as you start writing.';
});

const descriptionWordCount = computed(() => {
  const text = form.description.trim();
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
  if (thumbnailPreview.value) URL.revokeObjectURL(thumbnailPreview.value);
  thumbnailPreview.value = '';
};

const handleThumbnail = (event) => {
  releaseThumbnailPreview();
  const file = event.target.files?.[0];
  if (file) {
    selectedFile.value = file;
    form.thumbnail = file.name;
    thumbnailPreview.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    form.thumbnail = '';
    thumbnailPreview.value = '';
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

    await blogStore.createBlog(formData);
    
    toast.success('Blog created successfully!');
    saved.value = true;

    setTimeout(() => {
      router.push('/admin/blogs');
    }, 800);
  } catch (err) {
    console.error('Failed to create blog:', err);
    toast.error(err.message || 'Failed to create blog.');
  }
};

const resetForm = () => {
  releaseThumbnailPreview();
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
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.82rem;
}

.composer-state,
.toolbar-notes,
.preview-meta {
  gap: 0.65rem;
  flex-wrap: wrap;
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

.status-badge,
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
    top: 1rem;
  }
}

@media (max-width: 1199.98px) {
  .blog-editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .composer-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

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
