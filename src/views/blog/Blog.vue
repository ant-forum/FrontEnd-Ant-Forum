<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import { useBlogStore } from '../../stores/BlogStore';
import { useAuthStore } from '../../stores/AuthStore';

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
  return ['All', ...activeCategories.value.map(c => c.name || c.title)];
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
      p.description.toLowerCase().includes(query)
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

const featuredPost = computed(() => {
  // Try to find a published post first as the featured one
  return activeBlogs.value.find(p => p.status === 'published') || activeBlogs.value[0] || null;
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
    description: post.description || post.content || '',
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
  formData.append('title', form.value.title);
  formData.append('description', form.value.description);
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
</script>

<template>
  <div class="blog-layout min-vh-100 d-flex flex-column">
    <Navbar />

    <main class="flex-grow-1 blog-wrapper">
      <!-- Soft Banner Hero -->
      <div class="banner-wrapper mb-5">
        <div class="card border-0 rounded-5 p-4 p-lg-5 blog-banner-soft position-relative overflow-hidden">
          <div class="soft-blob blob-left"></div>
          <div class="soft-blob blob-right"></div>
          
          <div class="row align-items-center position-relative z-2">
            <div class="col-lg-8">
              <div class="soft-badge mb-3">
                <span class="dot"></span>
                <span class="badge-text text-uppercase">Developer Blog</span>
              </div>
              <h2 class="display-5 fw-bold text-adaptive mb-3">Technical Insights & Engineering Patterns</h2>
              <p class="soft-description mb-4 text-muted">
                Deep dives into architecture, performance optimization, and modern development workflows from our engineering community.
              </p>
              
              <div class="d-flex align-items-center gap-3 flex-wrap">
                <div class="search-box-soft position-relative flex-grow-1" style="max-width: 400px;">
                  <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input v-model="searchQuery" type="text" class="form-control rounded-pill ps-5 py-2 border-0 shadow-sm bg-surface" placeholder="Search articles...">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Article Hero Section -->
      <div v-if="featuredPost && selectedCategory === 'All' && !searchQuery" class="mb-5 featured-section">
        <h4 class="fw-bold text-adaptive mb-4 d-flex align-items-center gap-2">
          <i class="bi bi-lightning-charge-fill text-warning"></i> Featured Article
        </h4>
        <router-link :to="'/blog/' + featuredPost.id" class="text-decoration-none">
          <div class="card border-0 rounded-5 overflow-hidden featured-card-premium shadow-sm transition-up">
            <div class="row g-0">
              <div class="col-lg-7 position-relative">
                <img :src="featuredPost.image" @error="handleImgError" class="featured-hero-img" alt="Featured article">
                <div class="featured-overlay-gradient"></div>
              </div>
              <div class="col-lg-5 d-flex flex-column justify-content-center p-4 p-lg-5 bg-surface">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="badge bg-purple-light text-purple rounded-pill px-3 py-1 font-xs fw-bold text-uppercase">
                    {{ featuredPost.category }}
                  </span>
                  <span class="text-muted font-xs fw-medium">{{ featuredPost.date }}</span>
                </div>
                <h2 class="display-6 fw-bold text-adaptive mb-3 featured-title">{{ featuredPost.title }}</h2>
                <p class="text-muted mb-4 featured-desc">{{ featuredPost.description }}</p>
                <div class="d-flex align-items-center justify-content-between mt-auto pt-4 border-top-theme">
                  <div class="author-info d-flex align-items-center gap-2">
                    <img :src="featuredPost.author_avatar" class="rounded-circle border border-theme" width="32" height="32">
                    <div>
                      <div class="font-sm text-adaptive fw-bold">{{ featuredPost.author }}</div>
                      <div class="font-xs text-muted">{{ featuredPost.readTime }} read</div>
                    </div>
                  </div>
                  <div class="btn-read-featured">
                    <span class="fw-bold text-purple font-sm">Read Story <i class="bi bi-arrow-right ms-1"></i></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Categories & Filters -->
      <div class="mb-5">
        <!-- Admin drafts toggle -->
        <div v-if="authStore.user?.role === 'admin'" class="mb-4 d-flex justify-content-start gap-2 border-bottom pb-2">
          <button 
            @click="showDrafts = false"
            :class="['btn btn-sm px-4 py-2 fw-bold rounded-pill transition-all', !showDrafts ? 'btn-purple text-white shadow-sm' : 'btn-light text-muted border-0']"
          >
            <i class="bi bi-journal-check me-1"></i> Published ({{ blogStore.blogs.length }})
          </button>
          <button 
            @click="showDrafts = true"
            :class="['btn btn-sm px-4 py-2 fw-bold rounded-pill transition-all', showDrafts ? 'btn-purple text-white shadow-sm' : 'btn-light text-muted border-0']"
          >
            <i class="bi bi-journal-richtext me-1"></i> Drafts ({{ blogStore.drafts.length }})
          </button>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 mb-4">
          <div class="category-pills d-flex flex-wrap gap-2">
            <button 
              v-for="cat in categories" 
              :key="cat"
              @click="selectedCategory = cat"
              :class="['btn btn-sm rounded-pill px-4 py-2 transition-all fw-medium', selectedCategory === cat ? 'btn-purple text-white shadow-sm' : 'btn-light border-0 text-muted']"
            >
              {{ cat }}
            </button>
          </div>
          
          <div class="filter-dropdown">
            <select v-model="sortBy" class="form-select rounded-pill px-4 py-2 border-0 shadow-sm text-muted fw-medium bg-surface-hover" style="width: 180px;">
              <option value="latest">Latest First</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        <!-- Tag Cloud -->
        <div class="tag-cloud-soft d-flex flex-wrap gap-2 align-items-center">
          <span class="text-muted font-xs fw-bold text-uppercase me-2">Popular Tags:</span>
          <button 
            @click="selectedTag = null"
            :class="['btn btn-xs rounded-pill px-3 py-1 transition-all', !selectedTag ? 'btn-dark' : 'btn-outline-secondary border-0 opacity-75']"
          >
            All Tags
          </button>
          <button 
            v-for="tag in allTags" 
            :key="tag"
            @click="selectedTag = tag"
            :class="['btn btn-xs rounded-pill px-3 py-1 transition-all', selectedTag === tag ? 'btn-purple-light text-purple' : 'btn-outline-secondary border-0 opacity-75']"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <!-- Blog Grid Section Title -->
      <div class="mb-4 d-flex align-items-center justify-content-between">
        <h4 class="fw-bold text-adaptive mb-0">
          {{ selectedCategory === 'All' ? 'Latest Publications' : selectedCategory + ' Articles' }}
        </h4>
        <div class="text-muted font-sm">{{ filteredPosts.length }} Articles found</div>
      </div>

      <!-- Blog Grid -->
      <div class="row g-4">
        <div v-if="filteredPosts.length === 0" class="col-12 text-center py-5">
          <div class="opacity-50">
            <i class="bi bi-journal-x display-1 mb-3 d-block"></i>
            <h4>No articles found matching your criteria.</h4>
          </div>
        </div>
        
        <div v-for="post in filteredPosts" :key="post.id" class="col-md-6 col-xl-4">
          <router-link :to="'/blog/' + post.id" class="text-decoration-none h-100 d-block">
            <article class="card border-0 shadow-sm rounded-4 h-100 blog-card-soft transition-up overflow-hidden bg-surface">
              <div class="post-image-container position-relative overflow-hidden">
                <img :src="post.image" @error="handleImgError" class="card-img-top object-fit-cover post-img-zoom" height="240">
                <div class="post-category-tag position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill bg-surface-blur backdrop-blur-sm shadow-sm">
                  <span class="font-xs fw-bold text-purple text-uppercase">{{ post.category }}</span>
                </div>
              </div>
              
              <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex align-items-center gap-2 text-muted font-xs mb-3 fw-medium">
                  <i class="bi bi-calendar3"></i> {{ post.date }} 
                  <span class="mx-1">•</span>
                  <i class="bi bi-eye"></i> {{ post.views >= 1000 ? (post.views/1000).toFixed(1) + 'k' : post.views }}
                  <span class="mx-1">•</span>
                  <i class="bi bi-heart"></i> {{ post.likes }}
                </div>
                <h5 class="fw-bold mb-2 text-adaptive blog-title-soft line-clamp-2">{{ post.title }}</h5>
                
                <!-- Card Tags -->
                <div class="d-flex flex-wrap gap-1 mb-3">
                  <span v-for="tag in post.tags" :key="tag" class="font-xxs text-muted">#{{ tag }}</span>
                </div>
                
                <p class="text-muted small mb-4 line-clamp-2">{{ post.description }}</p>
                
                <div class="d-flex align-items-center justify-content-between pt-3 border-top-theme mt-auto">
                  <div class="author-info d-flex align-items-center gap-2">
                    <img :src="post.author_avatar" class="rounded-circle border-theme" width="28" height="28">
                    <span class="font-sm text-adaptive fw-bold">{{ post.author }}</span>
                  </div>
                  
                  <div class="read-more-link text-purple font-sm fw-bold">
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
          class="btn btn-purple rounded-pill px-5 py-3 fw-bold shadow-sm d-flex align-items-center gap-2"
        >
          <span v-if="blogStore.isLoading" class="spinner-border spinner-border-sm" role="status"></span>
          <span>{{ blogStore.isLoading ? 'Loading Articles...' : 'Load More Articles' }}</span>
        </button>
      </div>

      <!-- Newsletter Soft Section -->
      <div class="mt-5 pt-5">
        <div class="newsletter-card-soft rounded-5 p-4 p-lg-5 text-center position-relative overflow-hidden border">
          <div class="position-relative z-2">
            <h3 class="fw-bold text-adaptive mb-2">Engineering Weekly</h3>
            <p class="text-muted mb-4 mx-auto" style="max-width: 500px;">
              Subscribe to get the latest technical patterns and community highlights delivered to your inbox.
            </p>
            <div class="d-flex justify-content-center mx-auto" style="max-width: 450px;">
              <div class="input-group shadow-sm rounded-pill overflow-hidden bg-surface border">
                <input type="email" class="form-control border-0 ps-4 py-3 bg-transparent" placeholder="your@email.com">
                <button class="btn btn-purple px-4 fw-bold" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Beautiful Glassmorphism Modal for Create/Edit Blog -->
    <div v-if="showModal" class="modal-backdrop-blur d-flex align-items-center justify-content-center position-fixed w-100 h-100 top-0 start-0 z-1050 p-3">
      <div class="modal-card-glassmorphism rounded-5 p-4 p-lg-5 w-100 shadow-2xl border transition-all" style="max-width: 600px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold text-adaptive mb-0">
            {{ isEditing ? 'Edit Blog Article' : 'Create New Article' }}
          </h3>
          <button @click="closeModal" class="btn-close-modal border-0 rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
            <i class="bi bi-x-lg text-adaptive"></i>
          </button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label text-adaptive small fw-bold">ARTICLE TITLE</label>
              <input v-model="form.title" type="text" class="form-control rounded-pill px-4 py-2 border-theme bg-surface text-adaptive" placeholder="Enter blog title..." required>
            </div>
            
            <div class="col-md-6">
              <label class="form-label text-adaptive small fw-bold">CATEGORY</label>
              <select v-model="form.category_id" class="form-select rounded-pill px-4 py-2 border-theme bg-surface text-adaptive">
                <option v-for="cat in activeCategories" :key="cat.id" :value="cat.id.toString()">
                  {{ cat.name || cat.title }}
                </option>
              </select>
            </div>
            
            <div class="col-md-6">
              <label class="form-label text-adaptive small fw-bold">STATUS</label>
              <select v-model="form.status" class="form-select rounded-pill px-4 py-2 border-theme bg-surface text-adaptive">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div class="col-12">
              <label class="form-label text-adaptive small fw-bold">THUMBNAIL IMAGE</label>
              <div class="thumbnail-dropzone rounded-4 border-dashed border-theme p-3 text-center position-relative transition-all bg-surface-hover">
                <input type="file" @change="handleFileChange" accept="image/*" class="position-absolute w-100 h-100 top-0 start-0 opacity-0 cursor-pointer">
                <div v-if="thumbnailPreview" class="d-flex flex-column align-items-center">
                  <img :src="thumbnailPreview" class="img-preview rounded-3 mb-2 border border-theme" style="max-height: 120px; max-width: 100%; object-fit: cover;">
                  <span class="text-purple small fw-semibold">Click to replace thumbnail</span>
                </div>
                <div v-else class="text-center py-3">
                  <i class="bi bi-image text-muted display-6 mb-2 d-block"></i>
                  <span class="text-muted small">Drag & drop or click to upload thumbnail</span>
                </div>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label text-adaptive small fw-bold">CONTENT / DESCRIPTION</label>
              <textarea v-model="form.description" class="form-control rounded-4 px-4 py-3 border-theme bg-surface text-adaptive" rows="4" placeholder="Enter description/content..." required></textarea>
            </div>
            
            <div class="col-12 d-flex justify-content-end gap-3 mt-4">
              <button type="button" @click="closeModal" class="btn btn-light rounded-pill px-4 py-2 fw-bold border-theme text-adaptive">
                Cancel
              </button>
              <button type="submit" class="btn btn-purple rounded-pill px-4 py-2 fw-bold text-white shadow-sm d-flex align-items-center gap-2">
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
.blog-layout {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  color: var(--color-text);
}

.blog-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

/* Featured Card Styles */
.featured-card-premium {
  min-height: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.featured-hero-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.8s ease;
}

@media (min-width: 992px) {
  .featured-hero-img {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }
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
  background: linear-gradient(90deg, transparent 0%, var(--color-shadow) 100%);
  pointer-events: none;
}

.featured-title {
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.featured-desc {
  font-size: 1.05rem;
  line-height: 1.6;
}

.btn-read-featured {
  transition: transform 0.2s ease;
}

.featured-card-premium:hover .btn-read-featured {
  transform: translateX(5px);
}

/* Soft Banner Styles */
.blog-banner-soft {
  background-color: var(--color-surface-hover);
  min-height: 300px;
  border: 1px solid var(--color-border) !important;
}

.soft-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.blob-left {
  width: 300px;
  height: 300px;
  background: var(--glow-purple);
  top: -100px;
  left: -50px;
}

.blob-right {
  width: 400px;
  height: 400px;
  background: var(--glow-pink);
  bottom: -150px;
  right: -100px;
}

.soft-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-purple-light);
  padding: 6px 16px;
  border-radius: 100px;
}

.soft-badge .dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-purple);
  border-radius: 50%;
}

.soft-badge .badge-text {
  color: var(--color-purple);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.text-adaptive {
  color: var(--color-text) !important;
}

.soft-description {
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
}

.search-box-soft input {
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 0.3s ease;
}

/* Pills & Filters */
.btn-purple {
  background-color: var(--color-purple);
  color: white;
}

.btn-purple:hover {
  background-color: var(--color-purple-hover, #6d28d9);
}

.transition-all {
  transition: all 0.3s ease;
}

/* Blog Cards */
.blog-card-soft {
  background: var(--color-surface);
  border: 1px solid var(--color-border) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.blog-card-soft:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg) !important;
}

.post-image-container {
  height: 240px;
}

.post-img-zoom {
  transition: transform 0.6s ease;
}

.blog-card-soft:hover .post-img-zoom {
  transform: scale(1.05);
}

.blog-title-soft {
  font-size: 1.25rem;
  line-height: 1.4;
  transition: color 0.2s;
}

.blog-card-soft:hover .blog-title-soft {
  color: var(--color-purple);
}

.text-purple {
  color: var(--color-purple);
}

/* Newsletter */
.newsletter-card-soft {
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

.bg-surface-blur {
  background-color: var(--color-surface);
  opacity: 0.9;
}

.border-top-theme {
  border-top: 1px solid var(--color-border) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

.font-xs { font-size: 0.75rem; }
.font-xxs { font-size: 0.65rem; }
.font-sm { font-size: 0.875rem; }

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

.bg-surface {
  background-color: var(--color-surface) !important;
}

.bg-surface-hover {
  background-color: var(--color-surface-hover) !important;
}

.font-xs { font-size: 0.75rem; }
.font-xxs { font-size: 0.65rem; }
.font-sm { font-size: 0.875rem; }

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
}

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

@media (max-width: 991px) {
  .blog-wrapper { padding: 20px 16px 40px; }
  .blog-banner-soft { text-align: center; padding: 40px 20px !important; }
  .soft-badge { margin-bottom: 1.5rem; }
  .search-box-soft { margin: 0 auto; }
}


</style>
