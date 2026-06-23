<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import { useBlogStore } from "../../stores/BlogStore";
import { useAuthStore } from "../../stores/AuthStore";
import { createPlainTextExcerpt } from "../../utils/richContent";

const blogStore = useBlogStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const selectedCategory = ref("All");
const sortBy = ref("latest");
const showDrafts = ref(false);
const initialLoading = ref(true);
const BLOGS_PER_PAGE = 6;
const visibleBlogCount = ref(BLOGS_PER_PAGE);

// Custom Dropdown State & Methods
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const selectSort = (val) => {
  sortBy.value = val;
  isDropdownOpen.value = false;
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
});

const fallbackCategories = [
  { id: 1, name: "Frontend" },
  { id: 2, name: "DevOps" },
  { id: 3, name: "Systems" },
  { id: 4, name: "Architecture" },
];

const activeCategories = computed(() => {
  return blogStore.categories && blogStore.categories.length > 0
    ? blogStore.categories
    : fallbackCategories;
});

const categories = computed(() => {
  const categoryNames = activeCategories.value.map((c) => c.name || c.title);
  const uniqueCategoryNames = [...new Set(categoryNames)];
  return ["All", ...uniqueCategoryNames];
});

const categoryMeta = {
  All: { icon: "bi-grid-1x2-fill", tone: "all" },
  "General Discussion": {
    icon: "bi-chat-square-text-fill",
    tone: "discussion",
  },
  "Questions & Answers": { icon: "bi-question-circle-fill", tone: "questions" },
  Showcase: { icon: "bi-stars", tone: "showcase" },
  Announcements: { icon: "bi-megaphone-fill", tone: "announcements" },
  Tutorials: { icon: "bi-journal-code", tone: "tutorials" },
  Resources: { icon: "bi-collection-fill", tone: "resources" },
  "Showcase Projects": { icon: "bi-window-stack", tone: "projects" },
  Frontend: { icon: "bi-layout-text-window-reverse", tone: "frontend" },
  DevOps: { icon: "bi-cloud-arrow-up-fill", tone: "devops" },
  Systems: { icon: "bi-cpu-fill", tone: "systems" },
  Architecture: { icon: "bi-diagram-3-fill", tone: "architecture" },
};

const categoryOptions = computed(() => {
  return categories.value.map((name) => {
    const count =
      name === "All"
        ? activeBlogs.value.length
        : activeBlogs.value.filter((post) => post.category === name).length;
    return {
      name,
      count,
      ...(categoryMeta[name] || { icon: "bi-folder-fill", tone: "default" }),
    };
  });
});

const allTags = computed(() => {
  const tagsSet = new Set();
  activeBlogs.value.forEach((p) => {
    if (p.tags) {
      p.tags.forEach((t) => tagsSet.add(t));
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
  title: "",
  description: "",
  category_id: "1",
  status: "published",
  thumbnail: null,
});

onMounted(async () => {
  initialLoading.value = true;
  try {
    try {
      await blogStore.fetchCategories();
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }

    if (authStore.user?.role === "admin") {
      await blogStore.fetchAllBlogs();
    } else {
      await blogStore.fetchBlogs();
    }
  } finally {
    initialLoading.value = false;
  }
});

const activeBlogs = computed(() => {
  if (authStore.user?.role === "admin" && showDrafts.value) {
    return blogStore.drafts;
  }
  return blogStore.blogs;
});

const filteredPosts = computed(() => {
  let result = [...activeBlogs.value];

  if (selectedCategory.value !== "All") {
    result = result.filter((p) => p.category === selectedCategory.value);
  }

  if (selectedTag.value) {
    result = result.filter((p) => p.tags && p.tags.includes(selectedTag.value));
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.excerpt || p.description || "").toLowerCase().includes(query),
    );
  }

  if (sortBy.value === "popular") {
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

const visiblePosts = computed(() =>
  filteredPosts.value.slice(0, visibleBlogCount.value),
);
const canShowMore = computed(() => {
  return (
    visibleBlogCount.value < filteredPosts.value.length ||
    (blogStore.hasMore && !showDrafts.value)
  );
});

watch([searchQuery, selectedCategory, selectedTag, sortBy, showDrafts], () => {
  visibleBlogCount.value = BLOGS_PER_PAGE;
});

const loadMorePosts = async () => {
  if (visibleBlogCount.value < filteredPosts.value.length) {
    visibleBlogCount.value += BLOGS_PER_PAGE;
    return;
  }

  if (blogStore.hasMore && !showDrafts.value) {
    await blogStore.loadMore();
    visibleBlogCount.value += BLOGS_PER_PAGE;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingBlogId.value = null;
  thumbnailPreview.value = null;
  form.value = {
    title: "",
    description: "",
    category_id: "1",
    status: "published",
    thumbnail: null,
  };
  showModal.value = true;
};

const openEditModal = (post) => {
  isEditing.value = true;
  editingBlogId.value = post.id;
  thumbnailPreview.value = post.image || null;
  form.value = {
    title: post.title,
    description: post.content || post.description || "",
    category_id: post.category_id ? post.category_id.toString() : "1",
    status: post.status || "published",
    thumbnail: null,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  if (cameFromAdmin.value) {
    cameFromAdmin.value = false;
    router.push("/admin/blogs");
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
  formData.append("title", form.value.title);
  formData.append("description", createPlainTextExcerpt(content, 180));
  formData.append("content", content);
  formData.append("category_id", form.value.category_id);
  formData.append("status", form.value.status);

  if (form.value.thumbnail) {
    formData.append("thumbnail", form.value.thumbnail);
  }

  try {
    if (isEditing.value) {
      await blogStore.updateBlog(editingBlogId.value, formData);
    } else {
      await blogStore.createBlog(formData);
    }

    // Refresh blogs
    if (authStore.user?.role === "admin") {
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
  e.target.src =
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num;
};
</script>

<template>
  <div class="blog-page">
    <Navbar />

    <div class="blog-global-grid">
      <!-- Left Column: Blog Sidebar -->
      <aside class="blog-sidebar">
        <!-- Search Bar -->
        <div class="sidebar-search mb-4">
          <div class="sidebar-search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search articles..."
              class="sidebar-search-input"
            />
          </div>
        </div>

        <!-- Categories Section -->
        <div class="sidebar-section">
          <h3 class="sidebar-heading">CATEGORIES</h3>
          <div class="sidebar-menu">
            <button
              v-for="cat in categoryOptions"
              :key="cat.name"
              type="button"
              @click="selectedCategory = cat.name"
              :class="[
                'sidebar-menu-item',
                { active: selectedCategory === cat.name },
              ]"
            >
              <i :class="['bi', cat.icon, 'me-2']"></i>
              <span class="flex-grow-1 text-start fw-semibold">{{
                cat.name
              }}</span>
              <span class="sidebar-badge">{{ cat.count }}</span>
            </button>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="sidebar-section mt-5">
          <h3 class="sidebar-heading">POPULAR TAGS</h3>
          <div class="sidebar-tags">
            <button
              type="button"
              @click="selectedTag = null"
              :class="['sidebar-tag-pill', { active: !selectedTag }]"
            >
              All Tags
            </button>
            <button
              v-for="tag in allTags"
              :key="tag"
              type="button"
              @click="selectedTag = tag"
              :class="['sidebar-tag-pill', { active: selectedTag === tag }]"
            >
              #{{ tag }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Right Column: Main Content Container -->
      <div class="blog-main-container">
        <!-- Sleek Page Header -->
        <section class="blog-page-header mb-4">
          <div class="header-text-main" style="max-width: 600px">
            <span class="blog-page-kicker">Engineering Blog</span>
            <h1>Knowledge Base</h1>
            <p class="text-muted text-sm mb-0">
              Explore technical articles, system design guides, and coding
              patterns written by engineers, for engineers.
            </p>
            <div class="d-flex gap-2 mt-4">
              <span
                class="badge bg-surface border text-muted py-2 px-3 rounded-pill fw-semibold"
                ><i class="bi bi-journal-text me-1"></i>
                {{ blogStore.blogs.length }} Articles</span
              >
              <span
                class="badge bg-surface border text-muted py-2 px-3 rounded-pill fw-semibold"
                ><i class="bi bi-people me-1"></i> Community Driven</span
              >
              <span
                class="badge bg-surface border text-muted py-2 px-3 rounded-pill fw-semibold"
                ><i class="bi bi-stars me-1"></i> Weekly Updates</span
              >
            </div>
          </div>
        </section>

        <!-- Admin drafts toggle -->
        <div
          v-if="authStore.user?.role === 'admin'"
          class="mb-4 d-flex justify-content-start gap-2 pb-2"
        >
          <button
            @click="showDrafts = false"
            :class="[
              'btn-sm px-4 py-2 fw-bold rounded-pill transition-all',
              !showDrafts ? 'btn-purple text-white' : 'btn-light text-muted',
            ]"
          >
            <i class="bi bi-journal-check me-1"></i> Published ({{
              blogStore.blogs.length
            }})
          </button>
          <button
            @click="showDrafts = true"
            :class="[
              'btn-sm px-4 py-2 fw-bold rounded-pill transition-all',
              showDrafts ? 'btn-purple text-white' : 'btn-light text-muted',
            ]"
          >
            <i class="bi bi-journal-richtext me-1"></i> Drafts ({{
              blogStore.drafts.length
            }})
          </button>
        </div>

        <!-- Blog Grid Section Title -->
        <div
          class="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
        >
          <div class="d-flex align-items-center gap-3">
            <h4 class="fw-bold mb-0 text-nowrap">
              {{
                selectedCategory === "All"
                  ? "Latest Publications"
                  : selectedCategory + " Articles"
              }}
            </h4>
            <span class="text-muted text-sm text-nowrap">
              {{
                initialLoading
                  ? "Loading articles..."
                  : filteredPosts.length + " Articles found"
              }}
            </span>
          </div>

          <!-- Custom Premium Dropdown -->
          <div class="custom-dropdown-container" ref="dropdownRef">
            <button
              type="button"
              class="sort-select-trigger"
              @click.stop="isDropdownOpen = !isDropdownOpen"
            >
              <i class="bi bi-arrow-down-up sort-icon-leading"></i>
              <span>{{ sortBy === "latest" ? "Latest" : "Most Viewed" }}</span>
              <i
                class="bi bi-chevron-down chevron-icon"
                :class="{ 'rotate-180': isDropdownOpen }"
              ></i>
            </button>
            <transition name="dropdown-fade-slide">
              <div v-if="isDropdownOpen" class="custom-dropdown-menu">
                <button
                  type="button"
                  class="custom-dropdown-item"
                  :class="{ active: sortBy === 'latest' }"
                  @click="selectSort('latest')"
                >
                  <i class="bi bi-check2 check-icon"></i>
                  <span>Latest first</span>
                </button>
                <button
                  type="button"
                  class="custom-dropdown-item"
                  :class="{ active: sortBy === 'popular' }"
                  @click="selectSort('popular')"
                >
                  <i class="bi bi-check2 check-icon"></i>
                  <span>Most viewed</span>
                </button>
              </div>
            </transition>
          </div>
        </div>

        <!-- Blog Grid -->
        <div class="blog-grid">
          <template v-if="initialLoading">
            <article
              v-for="index in 4"
              :key="'skeleton-' + index"
              class="blog-card blog-card-skeleton"
              aria-hidden="true"
            >
              <div class="skeleton-media skeleton-shimmer"></div>
              <div class="skeleton-content">
                <div
                  class="skeleton-line skeleton-line-sm skeleton-shimmer"
                ></div>
                <div
                  class="skeleton-line skeleton-line-lg skeleton-shimmer"
                ></div>
                <div
                  class="skeleton-line skeleton-line-md skeleton-shimmer"
                ></div>
                <div
                  class="skeleton-line skeleton-line-xs skeleton-shimmer"
                ></div>
                <div class="skeleton-author">
                  <div class="skeleton-avatar skeleton-shimmer"></div>
                  <div
                    class="skeleton-line skeleton-line-author skeleton-shimmer"
                  ></div>
                </div>
              </div>
            </article>
          </template>

          <div
            v-else-if="filteredPosts.length === 0"
            class="blog-empty-state text-center py-5"
          >
            <div class="empty-state-card">
              <div class="empty-icon-wrap">
                <i class="bi bi-journal-x"></i>
              </div>
              <h4>No articles found</h4>
              <p class="text-muted">
                We couldn't find any articles matching your criteria.
              </p>
            </div>
          </div>

          <div v-for="post in visiblePosts" :key="post.id" class="blog-card">
            <router-link
              :to="'/blog/' + post.id"
              class="text-decoration-none h-100 d-block"
            >
              <article class="blog-card-surface h-100 transition-up">
                <div
                  class="post-image-container position-relative overflow-hidden"
                >
                  <img
                    :src="post.image"
                    @error.once="handleImgError"
                    class="post-img-zoom"
                    alt="Article"
                  />
                  <div
                    class="post-category-tag position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill bg-surface-blur backdrop-blur-sm"
                  >
                    <span class="text-xs fw-bold text-purple text-uppercase">{{
                      post.category
                    }}</span>
                  </div>
                </div>

                <div class="post-content p-4 d-flex flex-column">
                  <div
                    class="d-flex align-items-center gap-2 text-muted text-xs mb-3 fw-medium"
                  >
                    <i class="bi bi-calendar3"></i> {{ post.date }}
                    <span class="mx-1">•</span>
                    <i class="bi bi-eye"></i> {{ formatNumber(post.views) }}
                  </div>
                  <h5 class="fw-bold mb-2 blog-title line-clamp-2">
                    {{ post.title }}
                  </h5>

                  <p class="text-muted text-sm mb-4 line-clamp-2">
                    {{ post.excerpt || post.description }}
                  </p>

                  <div
                    class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto"
                  >
                    <div
                      class="author-info d-flex align-items-center gap-2 min-w-0"
                    >
                      <img
                        :src="post.author_avatar"
                        class="author-avatar"
                        width="28"
                        height="28"
                      />
                      <span class="text-sm fw-bold text-truncate">{{
                        post.author
                      }}</span>
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
        <div v-if="canShowMore" class="d-flex justify-content-center mt-5">
          <button
            @click="loadMorePosts"
            :disabled="blogStore.isLoading"
            class="btn-purple rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
          >
            <span
              v-if="blogStore.isLoading"
              class="spinner-border spinner-border-sm"
              role="status"
            ></span>
            <span>{{
              blogStore.isLoading ? "Loading Articles..." : "Load More Articles"
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Beautiful Glassmorphism Modal for Create/Edit Blog -->
    <div
      v-if="showModal"
      class="modal-backdrop-blur d-flex align-items-center justify-content-center position-fixed w-100 h-100 top-0 start-0 z-1050 p-3"
    >
      <div
        class="modal-card-glassmorphism rounded-5 p-4 p-lg-5 w-100 shadow-2xl border transition-all"
        style="max-width: 600px"
      >
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold mb-0">
            {{ isEditing ? "Edit Blog Article" : "Create New Article" }}
          </h3>
          <button
            @click="closeModal"
            class="btn-close-modal border-0 rounded-circle d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small fw-bold">ARTICLE TITLE</label>
              <input
                v-model="form.title"
                type="text"
                class="form-control rounded-pill px-4 py-2 bg-surface"
                placeholder="Enter blog title..."
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold">CATEGORY</label>
              <select
                v-model="form.category_id"
                class="form-select rounded-pill px-4 py-2 bg-surface"
              >
                <option
                  v-for="cat in activeCategories"
                  :key="cat.id"
                  :value="cat.id.toString()"
                >
                  {{ cat.name || cat.title }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold">STATUS</label>
              <select
                v-model="form.status"
                class="form-select rounded-pill px-4 py-2 bg-surface"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label small fw-bold">THUMBNAIL IMAGE</label>
              <div
                class="thumbnail-dropzone rounded-4 border-dashed border p-3 text-center position-relative transition-all bg-surface-hover"
              >
                <input
                  type="file"
                  @change="handleFileChange"
                  accept="image/*"
                  class="position-absolute w-100 h-100 top-0 start-0 opacity-0 cursor-pointer"
                />
                <div
                  v-if="thumbnailPreview"
                  class="d-flex flex-column align-items-center"
                >
                  <img
                    :src="thumbnailPreview"
                    class="img-preview rounded-3 mb-2 border"
                    style="
                      max-height: 120px;
                      max-width: 100%;
                      object-fit: cover;
                    "
                  />
                  <span class="text-purple small fw-semibold"
                    >Click to replace thumbnail</span
                  >
                </div>
                <div v-else class="text-center py-3">
                  <i class="bi bi-image text-muted display-6 mb-2 d-block"></i>
                  <span class="text-muted small"
                    >Drag & drop or click to upload thumbnail</span
                  >
                </div>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label small fw-bold"
                >CONTENT / DESCRIPTION</label
              >
              <textarea
                v-model="form.description"
                class="form-control rounded-4 px-4 py-3 bg-surface"
                rows="4"
                placeholder="Enter description/content..."
                required
              ></textarea>
            </div>

            <div class="col-12 d-flex justify-content-end gap-3 mt-4">
              <button
                type="button"
                @click="closeModal"
                class="btn-light rounded-pill px-4 py-2 fw-bold border text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-purple rounded-pill px-4 py-2 fw-bold text-white d-flex align-items-center gap-2"
              >
                <span
                  v-if="blogStore.isLoading"
                  class="spinner-border spinner-border-sm"
                  role="status"
                ></span>
                <span>{{
                  isEditing ? "Save Changes" : "Publish Article"
                }}</span>
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

/* Sidebar Styles */
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
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-shadow, rgba(0, 0, 0, 0.1)) 100%
  );
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

/* Sidebar Styles */
.blog-sidebar {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 100px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.sidebar-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 0 14px;
  transition: all 0.2s ease;
}

.sidebar-search-wrapper:focus-within {
  border-color: var(--color-purple);
  box-shadow: 0 0 0 3px var(--color-purple-light);
}

.search-icon {
  color: var(--color-text-muted);
  font-size: 14px;
}

.sidebar-search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 10px;
  color: var(--color-text);
  font-size: 13.5px;
  outline: none;
}

.sidebar-heading {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.8px;
  margin: 0 0 12px 6px;
  text-transform: uppercase;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: translateX(2px);
}

.sidebar-menu-item.active {
  background: var(--color-purple-light);
  color: var(--color-purple);
  font-weight: 700;
}

.sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sidebar-tag-pill {
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-tag-pill:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-purple);
  color: var(--color-purple);
}

.sidebar-tag-pill.active {
  background: var(--color-purple-light);
  border-color: var(--color-purple);
  color: var(--color-purple);
}

.sidebar-badge {
  padding: 2px 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.sidebar-menu-item.active .sidebar-badge {
  background: rgba(255, 255, 255, 0.2);
  border-color: transparent;
  color: var(--color-purple);
}

/* Page Header */
.blog-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-family: inherit;
}

.blog-page-kicker {
  display: block;
  margin-bottom: 6px;
  color: var(--color-purple);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.blog-page-header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.6rem, 2.5vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.blog-page-header p {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

/* Custom Dropdown Styling */
.custom-dropdown-container {
  position: relative;
  display: inline-block;
  user-select: none;
}

.sort-select-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 99px;
  cursor: pointer;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-sm);
}

.sort-select-trigger:hover {
  border-color: var(--color-purple);
  background-color: var(--color-surface-hover);
  transform: translateY(-1px);
}

.sort-select-trigger:focus-visible {
  border-color: var(--color-purple);
  box-shadow: 0 0 0 3px var(--color-purple-light);
}

.sort-icon-leading {
  font-size: 13px;
  color: var(--color-purple);
}

.chevron-icon {
  font-size: 12px;
  color: var(--color-purple);
  transition: transform 0.25s ease;
}

.chevron-icon.rotate-180 {
  transform: rotate(180deg);
}

.custom-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 6px;
  box-shadow: var(--shadow-md);
  z-index: 100;
  min-width: 170px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.custom-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text);
  font-size: 13.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-dropdown-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-purple);
}

.custom-dropdown-item.active {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
  font-weight: 700;
}

.check-icon {
  font-size: 14px;
  opacity: 0;
  color: var(--color-purple);
  transition: opacity 0.2s ease;
}

.custom-dropdown-item.active .check-icon {
  opacity: 1;
}

/* Transition animations */
.dropdown-fade-slide-enter-active,
.dropdown-fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-slide-enter-from,
.dropdown-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 992px) {
  .blog-global-grid {
    grid-template-columns: 1fr;
  }
}

/* Blog Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.blog-card {
  min-width: 0;
  border-radius: 18px;
  transform: translateY(0);
  transition:
    transform 260ms ease,
    filter 260ms ease;
}

.blog-card:hover {
  transform: translateY(-4px);
  filter: drop-shadow(
    0 18px 28px
      color-mix(
        in srgb,
        var(--color-shadow, rgba(15, 23, 42, 0.14)) 72%,
        transparent
      )
  );
}

.blog-card-surface {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface) 96%, var(--color-purple) 4%),
    var(--color-surface)
  );
  border: 1px solid
    color-mix(in srgb, var(--color-border) 88%, var(--color-purple) 12%);
  border-radius: inherit;
  box-shadow: 0 1px 2px
    color-mix(
      in srgb,
      var(--color-shadow, rgba(15, 23, 42, 0.12)) 50%,
      transparent
    );
  transition:
    border-color 260ms ease,
    box-shadow 260ms ease,
    background 260ms ease;
}

.blog-card:hover .blog-card-surface {
  border-color: color-mix(
    in srgb,
    var(--color-purple) 42%,
    var(--color-border)
  );
  box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 42%, transparent);
}

.post-image-container {
  height: 220px;
  background: var(--color-surface-hover);
  border-bottom: 1px solid
    color-mix(in srgb, var(--color-border) 82%, transparent);
}

.post-img-zoom {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition:
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 300ms ease;
}

.blog-card:hover .post-img-zoom {
  transform: scale(1.035);
  filter: saturate(1.04) contrast(1.02);
}

.post-category-tag {
  border: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
  box-shadow: 0 8px 18px
    color-mix(
      in srgb,
      var(--color-shadow, rgba(15, 23, 42, 0.12)) 38%,
      transparent
    );
}

.post-content {
  min-height: 300px;
}

.blog-title {
  font-size: 1.25rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: color 220ms ease;
}

.blog-card:hover .blog-title {
  color: var(--color-purple);
}

.read-more-link {
  transition:
    transform 220ms ease,
    color 220ms ease;
}

.blog-card:hover .read-more-link {
  transform: translateX(3px);
}

.blog-card-skeleton {
  overflow: hidden;
  pointer-events: none;
  background: var(--color-surface);
  border: 1px solid
    color-mix(in srgb, var(--color-border) 88%, var(--color-purple) 12%);
  box-shadow: 0 1px 2px
    color-mix(
      in srgb,
      var(--color-shadow, rgba(15, 23, 42, 0.12)) 50%,
      transparent
    );
}

.skeleton-media {
  height: 220px;
  border-radius: 20px 20px 0 0;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
}

.skeleton-line,
.skeleton-avatar,
.skeleton-media {
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 0%,
    color-mix(
        in srgb,
        var(--color-surface-hover) 72%,
        var(--color-text-muted) 28%
      )
      48%,
    var(--color-surface-hover) 100%
  );
  background-size: 220% 100%;
}

.skeleton-shimmer {
  animation: blogSkeletonShimmer 1.35s ease-in-out infinite;
}

.skeleton-line {
  height: 13px;
  border-radius: 999px;
}

.skeleton-line-sm {
  width: 38%;
}
.skeleton-line-lg {
  width: 88%;
  height: 22px;
}
.skeleton-line-md {
  width: 72%;
  height: 18px;
}
.skeleton-line-xs {
  width: 52%;
}
.skeleton-line-author {
  width: 92px;
}

.skeleton-author {
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid var(--color-border);
  margin-top: 10px;
  padding-top: 18px;
}

.skeleton-avatar {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 50%;
}

@keyframes blogSkeletonShimmer {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
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
.text-xs {
  font-size: 0.75rem;
}
.text-xxs {
  font-size: 0.65rem;
}
.text-sm {
  font-size: 0.875rem;
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

/* Empty State */
.blog-empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
}

.empty-state-card {
  padding: 60px 40px;
  width: min(100%, 520px);
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

.form-control,
.form-select {
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
