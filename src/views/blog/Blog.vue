<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import LeftSidebar from '../../components/forum/LeftSidebar.vue';
import { useBlogStore } from '../../stores/BlogStore';
import { useAuthStore } from '../../stores/AuthStore';
import { createPlainTextExcerpt } from '../../utils/richContent';

const blogStore = useBlogStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const selectedCategory = ref('All');
const sortBy = ref('latest');
const showDrafts = ref(false);

const fallbackCategories = [
  { id: 1, name: 'Frontend' },
  { id: 2, name: 'DevOps' },
  { id: 3, name: 'Systems' },
  { id: 4, name: 'Architecture' }
];

const activeCategories = computed(() => {
  return blogStore.categories && blogStore.categories.length > 0
    ? blogStore.categories
    : fallbackCategories;
});

const categories = computed(() => {
  const categoryNames = activeCategories.value.map(c => c.name || c.title);
  const uniqueCategoryNames = [...new Set(categoryNames)];
  return ['All', ...uniqueCategoryNames];
});

const categoryMeta = {
  All: { icon: 'bi-grid-1x2-fill', tone: 'all' },
  'General Discussion': { icon: 'bi-chat-square-text-fill', tone: 'discussion' },
  'Questions & Answers': { icon: 'bi-question-circle-fill', tone: 'questions' },
  Showcase: { icon: 'bi-stars', tone: 'showcase' },
  Announcements: { icon: 'bi-megaphone-fill', tone: 'announcements' },
  Tutorials: { icon: 'bi-journal-code', tone: 'tutorials' },
  Resources: { icon: 'bi-collection-fill', tone: 'resources' },
  'Showcase Projects': { icon: 'bi-window-stack', tone: 'projects' },
  Frontend: { icon: 'bi-layout-text-window-reverse', tone: 'frontend' },
  DevOps: { icon: 'bi-cloud-arrow-up-fill', tone: 'devops' },
  Systems: { icon: 'bi-cpu-fill', tone: 'systems' },
  Architecture: { icon: 'bi-diagram-3-fill', tone: 'architecture' },
};

const categoryOptions = computed(() => {
  return categories.value.map((name) => {
    const count = name === 'All'
      ? activeBlogs.value.length
      : activeBlogs.value.filter((post) => post.category === name).length;
    return {
      name,
      count,
      ...(categoryMeta[name] || { icon: 'bi-folder-fill', tone: 'default' }),
    };
  });
});

const allTags = computed(() => {
  const tagsSet = new Set();
  activeBlogs.value.forEach(p => {
    if (p.tags) {
      p.tags.forEach(t => tagsSet.add(t));
    }
  });
  return Array.from(tagsSet);
});
const selectedTag = ref(null);

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const editingBlogId = ref(null);
const thumbnailPreview = ref(null);
const cameFromAdmin = ref(false);

const form = ref({
  title: '',
  description: '',
  category_id: '1',
  status: 'published',
  thumbnail: null
});

onMounted(async () => {
  try {
    await blogStore.fetchCategories();
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  if (authStore.user?.role === 'admin') {
    await blogStore.fetchAllBlogs();
  } else {
    await blogStore.fetchBlogs();
  }
});

const activeBlogs = computed(() => {
  if (authStore.user?.role === 'admin' && showDrafts.value) {
    return blogStore.drafts;
  }
  return blogStore.blogs;
});

const filteredPosts = computed(() => {
  let result = [...activeBlogs.value];

  if (selectedCategory.value !== 'All') {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  if (selectedTag.value) {
    result = result.filter(p => p.tags && p.tags.includes(selectedTag.value));
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      (p.excerpt || p.description || '').toLowerCase().includes(query)
    );
  }

  if (sortBy.value === 'popular') {
    result.sort((a, b) => b.views - a.views);
  } else {
    result.sort((a, b) => {
      const dateA = a.created_at || a.createdAt || a.date;
      const dateB = b.created_at || b.createdAt || b.date;
      return new Date(dateB) - new Date(dateA);
    });
  }

  return result;
});

const openCreateModal = () => {
  isEditing.value = false;
  editingBlogId.value = null;
  thumbnailPreview.value = null;
  form.value = {
    title: '',
    description: '',
    category_id: '1',
    status: 'published',
    thumbnail: null
  };
  showModal.value = true;
};

const openEditModal = (post) => {
  isEditing.value = true;
  editingBlogId.value = post.id;
  thumbnailPreview.value = post.image || null;
  form.value = {
    title: post.title,
    description: post.content || post.description || '',
    category_id: post.category_id ? post.category_id.toString() : '1',
    status: post.status || 'published',
    thumbnail: null
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  if (cameFromAdmin.value) {
    cameFromAdmin.value = false;
    router.push('/admin/blogs');
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.thumbnail = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      thumbnailPreview.value = event.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = async () => {
  const formData = new FormData();
  const content = form.value.description;
  formData.append('title', form.value.title);
  formData.append('description', createPlainTextExcerpt(content));
  formData.append('content', content);
  formData.append('category_id', form.value.category_id);
  formData.append('status', form.value.status);
  
  if (form.value.thumbnail) {
    formData.append('thumbnail', form.value.thumbnail);
  }

  try {
    if (isEditing.value) {
      await blogStore.updateBlog(editingBlogId.value, formData);
    } else {
      await blogStore.createBlog(formData);
    }
    
    // Refresh blogs
    if (authStore.user?.role === 'admin') {
      await blogStore.fetchAllBlogs();
    } else {
      await blogStore.fetchBlogs();
    }
    
    closeModal();
  } catch (err) {
    console.error("Failed to submit blog form:", err);
  }
};

const handleImgError = (e) => {
  e.target.src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};
</script>

<template>
  <div class="blog-page">
    <Navbar />

    <div class="blog-global-grid">
      <!-- Left Column: Left Sidebar Navigation -->
      <LeftSidebar :active-tab="'Blog'" />

      <!-- Right Column: Main Content Container -->
      <div class="blog-main-container">
        <!-- Search Bar -->
        <div class="showcase-search-section mb-5">
          <div class="search-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search articles..."
              class="search-bar"
              @input="() => {}"
            >
            <button class="search-btn" @click="() => {}" title="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>



        <!-- Admin drafts toggle -->
        <div v-if="authStore.user?.role === 'admin'" class="mb-4 d-flex justify-content-start gap-2 border-bottom pb-2">
          <button 
            @click="showDrafts = false"
            :class="['btn-sm px-4 py-2 fw-bold rounded-pill transition-all', !showDrafts ? 'btn-purple text-white' : 'btn-light text-muted']"
          >
            <i class="bi bi-journal-check me-1"></i> Published ({{ blogStore.blogs.length }})
          </button>
          <button 
            @click="showDrafts = true"
            :class="['btn-sm px-4 py-2 fw-bold rounded-pill transition-all', showDrafts ? 'btn-purple text-white' : 'btn-light text-muted']"
          >
            <i class="bi bi-journal-richtext me-1"></i> Drafts ({{ blogStore.drafts.length }})
          </button>
        </div>

        <!-- Categories & Filters -->
        <section class="filter-panel mb-5" aria-label="Blog filters">
          <div class="filter-panel-header">
            <div>
              <span class="filter-kicker">Browse Library</span>
              <h2>Articles by category</h2>
            </div>

            <label class="sort-control">
              <span>Sort</span>
              <select v-model="sortBy" aria-label="Sort articles">
                <option value="latest">Latest first</option>
                <option value="popular">Most viewed</option>
              </select>
              <i class="bi bi-chevron-down"></i>
            </label>
          </div>

          <div class="category-filter-grid">
            <button
              v-for="cat in categoryOptions"
              :key="cat.name"
              type="button"
              @click="selectedCategory = cat.name"
              :class="['category-filter-card', cat.tone, { active: selectedCategory === cat.name }]"
            >
              <span class="category-icon">
                <i :class="['bi', cat.icon]"></i>
              </span>
              <span class="category-copy">
                <strong>{{ cat.name }}</strong>
                <small>{{ cat.count }} {{ cat.count === 1 ? 'article' : 'articles' }}</small>
              </span>
            </button>
          </div>

          <div class="filter-panel-footer">
            <div class="active-filter-chip">
              <i class="bi bi-funnel-fill"></i>
              <span>{{ selectedCategory }}</span>
              <button
                v-if="selectedCategory !== 'All' || selectedTag"
                type="button"
                title="Clear filters"
                @click="selectedCategory = 'All'; selectedTag = null"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="tag-filter-row" aria-label="Popular tags">
              <button
                type="button"
                @click="selectedTag = null"
                :class="['tag-filter-chip', { active: !selectedTag }]"
              >
                All Tags
              </button>
              <button
                v-for="tag in allTags"
                :key="tag"
                type="button"
                @click="selectedTag = tag"
                :class="['tag-filter-chip', { active: selectedTag === tag }]"
              >
                #{{ tag }}
              </button>
            </div>
          </div>
        </section>

        <!-- Blog Grid Section Title -->
        <div class="mb-4 d-flex align-items-center justify-content-between">
          <h4 class="fw-bold mb-0">
            {{ selectedCategory === 'All' ? 'Latest Publications' : selectedCategory + ' Articles' }}
          </h4>
          <div class="text-muted text-sm">{{ filteredPosts.length }} Articles found</div>
        </div>

        <!-- Blog Grid -->
        <div class="blog-grid">
          <div v-if="filteredPosts.length === 0" class="col-12 text-center py-5">
            <div class="empty-state-card">
              <div class="empty-icon-wrap">
                <i class="bi bi-journal-x"></i>
              </div>
              <h4>No articles found</h4>
              <p class="text-muted">We couldn't find any articles matching your criteria.</p>
            </div>
          </div>
          
          <div v-for="post in filteredPosts" :key="post.id" class="blog-card">
            <router-link :to="'/blog/' + post.id" class="text-decoration-none h-100 d-block">
              <article class="h-100 overflow-hidden bg-surface transition-up">
                <div class="post-image-container position-relative overflow-hidden">
                  <img :src="post.image" @error="handleImgError" class="post-img-zoom" alt="Article">
                  <div class="post-category-tag position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill bg-surface-blur backdrop-blur-sm">
                    <span class="text-xs fw-bold text-purple text-uppercase">{{ post.category }}</span>
                  </div>
                </div>
                
                <div class="post-content p-4 d-flex flex-column">
                  <div class="d-flex align-items-center gap-2 text-muted text-xs mb-3 fw-medium">
                    <i class="bi bi-calendar3"></i> {{ post.date }} 
                    <span class="mx-1">•</span>
                    <i class="bi bi-eye"></i> {{ formatNumber(post.views) }}
                    <span class="mx-1">•</span>
                    <i class="bi bi-heart"></i> {{ post.likes }}
                  </div>
                  <h5 class="fw-bold mb-2 blog-title line-clamp-2">{{ post.title }}</h5>
                  
                  <!-- Card Tags -->
                  <div class="d-flex flex-wrap gap-1 mb-3">
                    <span v-for="tag in post.tags" :key="tag" class="text-xxs text-muted">#{{ tag }}</span>
                  </div>
                  
                  <p class="text-muted text-sm mb-4 line-clamp-2">{{ post.excerpt || post.description }}</p>
                  
                  <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                    <div class="author-info d-flex align-items-center gap-2">
                      <img :src="post.author_avatar" class="author-avatar" width="28" height="28">
                      <span class="text-sm fw-bold">{{ post.author }}</span>
                    </div>
                    
                    <div class="read-more-link text-purple text-sm fw-bold">
                      Read <i class="bi bi-arrow-right ms-1"></i>
                    </div>
                  </div>
                </div>
              </article>
            </router-link>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="blogStore.hasMore && !showDrafts" class="d-flex justify-content-center mt-5">
          <button 
            @click="blogStore.loadMore()" 
            :disabled="blogStore.isLoading" 
            class="btn-purple rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
          >
            <span v-if="blogStore.isLoading" class="spinner-border spinner-border-sm" role="status"></span>
            <span>{{ blogStore.isLoading ? 'Loading Articles...' : 'Load More Articles' }}</span>
          </button>
        </div>

        <!-- Newsletter Soft Section -->
        <div class="mt-5 pt-5">
          <div class="newsletter-card-soft text-center position-relative overflow-hidden">
            <div class="position-relative z-2">
              <h3 class="fw-bold mb-2">Engineering Weekly</h3>
              <p class="text-muted mb-4 mx-auto" style="max-width: 500px;">
                Subscribe to get the latest technical patterns and community highlights delivered to your inbox.
              </p>
              <div class="d-flex justify-content-center mx-auto" style="max-width: 450px;">
                <div class="input-group rounded-pill overflow-hidden bg-surface border">
                  <input type="email" class="form-control border-0 ps-4 py-3 bg-transparent" placeholder="your@email.com">
                  <button class="btn-purple px-4 fw-bold" type="button">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Beautiful Glassmorphism Modal for Create/Edit Blog -->
    <div v-if="showModal" class="modal-backdrop-blur d-flex align-items-center justify-content-center position-fixed w-100 h-100 top-0 start-0 z-1050 p-3">
      <div class="modal-card-glassmorphism rounded-5 p-4 p-lg-5 w-100 shadow-2xl border transition-all" style="max-width: 600px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold mb-0">
            {{ isEditing ? 'Edit Blog Article' : 'Create New Article' }}
          </h3>
          <button @click="closeModal" class="btn-close-modal border-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small fw-bold">ARTICLE TITLE</label>
              <input v-model="form.title" type="text" class="form-control rounded-pill px-4 py-2 bg-surface" placeholder="Enter blog title..." required>
            </div>
            
            <div class="col-md-6">
              <label class="form-label small fw-bold">CATEGORY</label>
              <select v-model="form.category_id" class="form-select rounded-pill px-4 py-2 bg-surface">
                <option v-for="cat in activeCategories" :key="cat.id" :value="cat.id.toString()">
                  {{ cat.name || cat.title }}
                </option>
              </select>
            </div>
            
            <div class="col-md-6">
              <label class="form-label small fw-bold">STATUS</label>
              <select v-model="form.status" class="form-select rounded-pill px-4 py-2 bg-surface">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div class="col-12">
              <label class="form-label small fw-bold">THUMBNAIL IMAGE</label>
              <div class="thumbnail-dropzone rounded-4 border-dashed border p-3 text-center position-relative transition-all bg-surface-hover">
                <input type="file" @change="handleFileChange" accept="image/*" class="position-absolute w-100 h-100 top-0 start-0 opacity-0 cursor-pointer">
                <div v-if="thumbnailPreview" class="d-flex flex-column align-items-center">
                  <img :src="thumbnailPreview" class="img-preview rounded-3 mb-2 border" style="max-height: 120px; max-width: 100%; object-fit: cover;">
                  <span class="text-purple small fw-semibold">Click to replace thumbnail</span>
                </div>
                <div v-else class="text-center py-3">
                  <i class="bi bi-image text-muted display-6 mb-2 d-block"></i>
                  <span class="text-muted small">Drag & drop or click to upload thumbnail</span>
                </div>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label small fw-bold">CONTENT / DESCRIPTION</label>
              <textarea v-model="form.description" class="form-control rounded-4 px-4 py-3 bg-surface" rows="4" placeholder="Enter description/content..." required></textarea>
            </div>
            
            <div class="col-12 d-flex justify-content-end gap-3 mt-4">
              <button type="button" @click="closeModal" class="btn-light rounded-pill px-4 py-2 fw-bold border text-muted">
                Cancel
              </button>
              <button type="submit" class="btn-purple rounded-pill px-4 py-2 fw-bold text-white d-flex align-items-center gap-2">
                <span v-if="blogStore.isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                <span>{{ isEditing ? 'Save Changes' : 'Publish Article' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<style scoped>
.blog-page {
  min-height: 100vh;
}

.blog-global-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.blog-main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Search Bar Styles from Showcase */
.showcase-search-section {
  margin-top: 24px;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 99px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.search-input-wrapper:focus-within {
  border-color: var(--color-purple);
  box-shadow: 0 0 0 3px var(--color-purple-light);
}

.search-bar {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  font-size: 14.5px;
  color: var(--color-text);
  outline: none;
  font-family: inherit;
}

.search-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover {
  color: var(--color-purple);
}

/* Featured Card Styles */
.featured-section {
  margin-top: 32px;
}

.featured-card-premium {
  min-height: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
}

@media (max-width: 992px) {
  .featured-card-premium {
    grid-template-columns: 1fr;
  }
}

.featured-image-container {
  position: relative;
  min-height: 320px;
}

.featured-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.featured-card-premium:hover .featured-hero-img {
  transform: scale(1.03);
}

.featured-overlay-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, var(--color-shadow, rgba(0,0,0,0.1)) 100%);
  pointer-events: none;
}

.featured-content {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-badge {
  background: var(--color-purple-light);
  color: var(--color-purple);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.featured-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.featured-desc {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.btn-read-featured {
  transition: transform 0.2s ease;
}

.featured-card-premium:hover .btn-read-featured {
  transform: translateX(5px);
}

.author-avatar {
  border-radius: 50%;
  border: 2px solid var(--color-border);
}

.border-top {
  border-top: 1px solid var(--color-border);
}

/* Pills & Filters */
.btn-purple {
  background-color: var(--color-purple);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-purple:hover {
  background-color: var(--color-purple-hover, #6d28d9);
}

.btn-light {
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.btn-sm {
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 13.5px;
}

.btn-xs {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
}

.btn-dark {
  background-color: #1e293b;
  color: white;
}

.btn-outline-secondary {
  background-color: var(--color-surface);
  color: var(--color-text-muted);
}

.btn-purple-light {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
}

.transition-all {
  transition: all 0.3s ease;
}

.transition-up {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.text-purple {
  color: var(--color-purple);
}

/* Filter Panel */
.filter-panel {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 96%, var(--color-purple) 4%), var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-border) 82%, var(--color-purple) 18%);
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  padding: 18px;
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-kicker {
  display: block;
  color: var(--color-purple);
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.filter-panel-header h2 {
  color: var(--color-text);
  font-size: 1.15rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0;
}

.sort-control {
  min-width: 178px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0 12px 0 14px;
  font-size: 0.78rem;
  font-weight: 800;
  position: relative;
}

.sort-control select {
  width: 100%;
  color: var(--color-text);
  background: transparent;
  border: 0;
  appearance: none;
  outline: none;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  padding-right: 18px;
  cursor: pointer;
}

.sort-control i {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  pointer-events: none;
  position: absolute;
  right: 12px;
}

.category-filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
}

.category-filter-card {
  min-height: 70px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast),
    box-shadow var(--transition-fast);
}

.category-filter-card:hover {
  border-color: color-mix(in srgb, var(--color-purple) 58%, var(--color-border));
  transform: translateY(-1px);
}

.category-filter-card.active {
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-purple), var(--color-primary));
  border-color: transparent;
  box-shadow: 0 16px 34px -26px var(--color-purple);
}

.category-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--category-tone, var(--color-purple));
  background: color-mix(in srgb, var(--category-tone, var(--color-purple)) 14%, transparent);
  border-radius: 12px;
  font-size: 1rem;
}

.category-filter-card.active .category-icon {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

.category-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.category-copy strong {
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1.2;
}

.category-copy small {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  font-weight: 750;
}

.category-filter-card.active .category-copy small {
  color: rgba(255, 255, 255, 0.78);
}

.category-filter-card.all { --category-tone: #8b5cf6; }
.category-filter-card.discussion { --category-tone: #14b8a6; }
.category-filter-card.questions { --category-tone: #3b82f6; }
.category-filter-card.showcase,
.category-filter-card.projects { --category-tone: #a855f7; }
.category-filter-card.announcements { --category-tone: #f59e0b; }
.category-filter-card.tutorials { --category-tone: #22c55e; }
.category-filter-card.resources { --category-tone: #06b6d4; }
.category-filter-card.frontend { --category-tone: #0ea5e9; }
.category-filter-card.devops { --category-tone: #10b981; }
.category-filter-card.systems { --category-tone: #64748b; }
.category-filter-card.architecture { --category-tone: #ec4899; }

.filter-panel-footer {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
}

.active-filter-chip {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  color: var(--color-purple);
  background: var(--color-purple-light);
  border-radius: 999px;
  padding: 7px 10px 7px 12px;
  font-size: 0.78rem;
  font-weight: 900;
}

.active-filter-chip button {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  background: rgba(255, 255, 255, 0.4);
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.tag-filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.tag-filter-chip {
  min-height: 32px;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0 12px;
  font-size: 0.78rem;
  font-weight: 850;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.tag-filter-chip:hover,
.tag-filter-chip.active {
  color: var(--color-text);
  background: var(--color-surface-hover);
  border-color: color-mix(in srgb, var(--color-purple) 42%, var(--color-border));
}

.tag-filter-chip.active {
  color: #ffffff;
  background: #1e293b;
  border-color: transparent;
}

/* Blog Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.blog-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.post-image-container {
  height: 220px;
}

.post-img-zoom {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.blog-card:hover .post-img-zoom {
  transform: scale(1.05);
}

.blog-title {
  font-size: 1.25rem;
  line-height: 1.4;
  transition: color 0.2s;
}

.blog-card:hover .blog-title {
  color: var(--color-purple);
}

.bg-surface {
  background-color: var(--color-surface);
}

.bg-surface-hover {
  background-color: var(--color-surface-hover);
}

.bg-surface-blur {
  background-color: var(--color-surface);
  opacity: 0.9;
}

.border {
  border: 1px solid var(--color-border);
}

.border-dashed {
  border: 2px dashed var(--color-border);
}

/* Utility Text Styles */
.text-xs { font-size: 0.75rem; }
.text-xxs { font-size: 0.65rem; }
.text-sm { font-size: 0.875rem; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty State */
.empty-state-card {
  padding: 60px 40px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 24px;
}

/* Newsletter */
.newsletter-card-soft {
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 40px;
}

.modal-backdrop-blur {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-card-glassmorphism {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.btn-close-modal {
  background: var(--color-surface-hover);
  cursor: pointer;
}

.form-control, .form-select {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: inherit;
}

@media (max-width: 1024px) {
  .blog-global-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .blog-global-grid {
    padding: 20px 16px 40px;
  }
  .filter-panel {
    border-radius: 16px;
    padding: 14px;
  }
  .filter-panel-header,
  .filter-panel-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .sort-control {
    width: 100%;
  }
  .category-filter-grid {
    grid-template-columns: 1fr;
  }
  .blog-banner-soft {
    padding: 24px;
    text-align: center;
  }
  .search-input-wrapper {
    margin: 0 auto;
  }
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
