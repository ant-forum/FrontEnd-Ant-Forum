<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import SkeletonLoader from "../../components/SkeletonLoader.vue";
import { useBlogStore } from '../../stores/BlogStore';
import { useAuthStore } from '../../stores/AuthStore';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const authStore = useAuthStore();

const activeSection = ref('');
const scrollProgress = ref(0);
const localLoading = ref(true);

const post = computed(() => blogStore.blog);

const relatedPosts = computed(() => {
  if (!post.value) return [];
  const list = blogStore.blogs.filter(b => b.id != post.value.id);
  const sameCategory = list.filter(b => b.category === post.value.category);
  const remaining = list.filter(b => b.category !== post.value.category);
  return [...sameCategory, ...remaining].slice(0, 2);
});

const headings = computed(() => {
  const list = [];
  if (!post.value) return list;
  
  const bodyText = post.value.content || post.value.description || '';
  const regex = /<h[2-4][^>]*id="([^"]+)"[^>]*>(.*?)<\/h[2-4]>/gi;
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    list.push({
      id: match[1],
      label: match[2].replace(/<[^>]*>/g, '')
    });
  }
  return list;
});

const updateScrollProgress = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeSection.value = id;
  }
};

const loadBlogData = async (id) => {
  try {
    // Ensure categories are loaded so normalizeBlog can resolve category names
    if (blogStore.categories.length === 0) {
      await blogStore.fetchCategories().catch(() => {});
    }

    if (authStore.user?.role === 'admin') {
      await blogStore.fetchBlogById(id);
    } else {
      await blogStore.fetchBlogPreview(id);
    }
    if (blogStore.blogs.length === 0) {
      await blogStore.fetchBlogs();
    }
  } catch (err) {
    console.error("Failed to load blog:", err);
    router.push({ name: 'not-found' });
  } finally {
    localLoading.value = false;
  }
};

watch(() => route.params.id, async (newId) => {
  if (newId) {
    localLoading.value = true;
    await loadBlogData(newId);
  }
});

onMounted(async () => {
  window.addEventListener('scroll', updateScrollProgress);
  await loadBlogData(route.params.id);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress);
});

const handleImgError = (e) => {
  e.target.src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};
</script>

<template>
  <div class="blog-detail-layout min-vh-100 d-flex flex-column">
    <!-- Reading Progress Bar -->
    <div class="reading-progress-container">
      <div class="reading-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <Navbar />

    <main class="flex-grow-1 blog-detail-wrapper">
      <!-- Back Button -->
      <div class="mb-4">
        <router-link to="/blog" class="btn-back-soft text-decoration-none d-inline-flex align-items-center gap-2">
          <i class="bi bi-arrow-left"></i>
          <span>Back to Articles</span>
        </router-link>
      </div>

      <!-- Loading State: Beautiful skeletons matching standard layout dimensions -->
      <div v-if="localLoading" class="row py-5">
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="p-4 rounded-4 bg-surface-hover border mb-4">
            <SkeletonLoader variant="text" height="24px" width="60%" class="mb-4" />
            <SkeletonLoader variant="text" height="18px" width="80%" class="mb-3" />
            <SkeletonLoader variant="text" height="18px" width="90%" class="mb-3" />
            <SkeletonLoader variant="text" height="18px" width="75%" class="mb-3" />
          </div>
        </aside>
        
        <article class="col-lg-8 offset-lg-1">
          <div class="mb-4">
            <SkeletonLoader variant="text" height="20px" width="100px" class="d-inline-block me-2" />
            <SkeletonLoader variant="text" height="20px" width="120px" class="d-inline-block" />
          </div>
          <SkeletonLoader variant="text" height="48px" width="90%" class="mb-4" />
          
          <div class="d-flex align-items-center mb-5">
            <SkeletonLoader variant="avatar" width="48px" height="48px" class="me-3" round />
            <div class="w-50">
              <SkeletonLoader variant="text" height="20px" width="40%" class="mb-2" />
              <SkeletonLoader variant="text" height="16px" width="25%" />
            </div>
          </div>
          
          <SkeletonLoader variant="image" height="350px" class="mb-5" />
          <SkeletonLoader variant="text" height="20px" width="100%" class="mb-3" />
          <SkeletonLoader variant="text" height="20px" width="95%" class="mb-3" />
        </article>
      </div>

      <!-- Loaded State -->
      <div v-else-if="post" class="row position-relative">
        
        <!-- Sticky Sidebar (Table of Contents & Share) -->
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="sticky-sidebar-container">
            <div v-if="headings.length > 0" class="sticky-toc p-4 rounded-4 bg-surface-hover mb-4 border">
              <h6 class="text-muted fw-bold mb-4 font-xs text-uppercase tracking-wide">Table of Contents</h6>
              <nav class="toc-nav d-flex flex-column gap-3">
                <a v-for="h in headings"
                   :key="h.id"
                   :href="'#' + h.id"
                   @click.prevent="scrollTo(h.id)"
                   :class="['text-decoration-none font-sm toc-link', activeSection === h.id ? 'text-purple fw-bold active' : 'text-muted']">
                  {{ h.label }}
                </a>
              </nav>
            </div>

            <!-- Social Share -->
            <div class="p-4 rounded-4 border share-card bg-surface">
              <h6 class="text-muted fw-bold mb-3 font-xs text-uppercase tracking-wide">Share this Story</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-light rounded-circle share-btn" title="Share on Twitter"><i class="bi bi-twitter-x"></i></button>
                <button class="btn btn-light rounded-circle share-btn" title="Share on LinkedIn"><i class="bi bi-linkedin"></i></button>
                <button class="btn btn-light rounded-circle share-btn" title="Copy Link"><i class="bi bi-link-45deg"></i></button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <article class="col-lg-8 offset-lg-1">
          <!-- Metadata -->
          <div class="mb-4">
            <span v-for="tag in post.tags" :key="tag" class="badge bg-purple-light text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3 me-2 text-uppercase">
              {{ tag }}
            </span>
            <span class="badge bg-purple-light text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3 text-uppercase">
              {{ post.category }}
            </span>
          </div>

          <h1 class="display-4 fw-bold text-adaptive mb-4 article-title">
            {{ post.title }}
          </h1>

          <div class="d-flex align-items-center mb-5">
            <img :src="post.author_avatar" class="rounded-circle me-3 border border-theme object-fit-cover" width="48" height="48" alt="Author">
            <div>
              <h6 class="mb-0 fw-bold text-adaptive">{{ post.author }}</h6>
              <div class="text-muted font-sm d-flex align-items-center mt-1">
                {{ post.date }} &nbsp;&bull;&nbsp; {{ post.readTime }} read
              </div>
            </div>
          </div>

          <!-- Hero Image -->
          <img :src="post.image" @error="handleImgError" class="img-fluid rounded-4 mb-5 w-100 object-fit-cover border border-theme" style="max-height: 400px;" alt="Hero Image">

          <!-- Article Body -->
          <div class="article-body text-adaptive lh-lg mb-5" style="white-space: pre-line;" v-html="post.content || post.description"></div>

          <!-- Newsletter -->
          <div class="newsletter-section mt-5 p-5 rounded-4 text-center position-relative overflow-hidden border">
            <div class="newsletter-gradient position-absolute top-0 start-0 w-100 h-100"></div>
            <div class="position-relative z-3">
              <div class="d-flex justify-content-center mb-3">
                <div class="bg-surface rounded-3 p-2 shadow-sm text-purple border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope-paper-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 3a1 1 0 0 1 1 1v1h-2V4a1 1 0 0 1 1-1zm1 3v2h2v-2h-2zm-3 0v2H4v-2h2z"/>
                    <path d="M4 8.5v4.5A1.5 1.5 0 0 0 5.5 14.5h5a1.5 1.5 0 0 0 1.5-1.5v-4.5h-9z"/>
                    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h9A1.5 1.5 0 0 1 14 5.5v1.884L8 10.3l-6-2.916V5.5zm6 5.86-6-2.915v.85c0 .762.58 1.396 1.328 1.488A1.5 1.5 0 0 0 4.5 12h7a1.5 1.5 0 0 0 1.172-1.217C13.42 10.686 14 10.052 14 9.29v-.85L8 11.36z"/>
                    <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                  </svg>
                </div>
              </div>
              <h3 class="fw-bold mb-3 text-adaptive">Join the DevEcosystem Weekly</h3>
              <p class="text-muted mb-4 mx-auto" style="max-width: 400px;">
                Get deep-dive tutorials and architecture patterns sent straight to your inbox every Wednesday.
              </p>
              <form class="d-flex justify-content-center mx-auto" style="max-width: 450px;">
                <input type="email" class="form-control form-control-lg rounded-pill-start border-end-0 shadow-sm bg-surface" placeholder="Enter your email address">
                <button class="btn btn-dark btn-lg rounded-pill-end px-4 shadow-sm" type="button">Subscribe</button>
              </form>
            </div>
          </div>

          <hr class="my-5 border-theme">

          <!-- Related Publications -->
          <div v-if="relatedPosts.length > 0">
            <h5 class="fw-bold mb-4 text-adaptive text-uppercase tracking-wide font-sm">Related Publications</h5>
            <div class="row g-4">
              <div v-for="related in relatedPosts" :key="related.id" class="col-md-6">
                <router-link :to="'/blog/' + related.id" class="text-decoration-none">
                  <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden related-card bg-surface">
                    <img :src="related.image" @error="handleImgError" class="card-img-top object-fit-cover" height="140" alt="Related post">
                    <div class="card-body p-3">
                      <div class="text-purple fw-semibold font-xs mb-1 text-uppercase">{{ related.category }}</div>
                      <h6 class="fw-bold text-adaptive mb-1 lh-base line-clamp-2">{{ related.title }}</h6>
                      <div class="text-muted font-xs">{{ related.readTime }} read</div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Typography & Colors */
.text-purple { color: var(--color-purple); }
.bg-purple { background-color: var(--color-purple); }
.bg-purple-light { background-color: var(--color-purple-light); }
.bg-surface-hover { background-color: var(--color-surface-hover); }
.bg-darker { background-color: #0a0e17; }
.text-pink { color: #ec4899; }
.text-green { color: #10b981; }
.text-blue { color: #60a5fa; }
.text-warning { color: #fbbf24; }
.font-xs { font-size: 0.75rem; }
.font-sm { font-size: 0.875rem; }
.tracking-wide { letter-spacing: 0.05em; }
.lh-lg { line-height: 1.8; }

.text-adaptive {
  color: var(--color-text) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

.bg-surface {
  background-color: var(--color-surface) !important;
}

/* Reading Progress */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: transparent;
  z-index: 9999;
}

.reading-progress-bar {
  height: 100%;
  background: var(--color-purple);
  transition: width 0.1s ease-out;
}

/* Back Button */
.btn-back-soft {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-back-soft:hover {
  color: var(--color-purple);
  transform: translateX(-3px);
}

.blog-detail-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.blog-detail-layout {
  font-family: 'Sora', sans-serif;
  color: var(--color-text);
}

/* Typography Overrides */
.article-title {
  letter-spacing: -0.03em;
  line-height: 1.2;
}

/* Sticky Sidebar */
.sticky-sidebar-container {
  position: sticky;
  top: 100px;
}

.toc-nav {
  border-left: 2px solid var(--color-border);
  padding-left: 1rem;
}

/* Share Buttons */
.share-card {
  border: 1px solid var(--color-border) !important;
}

.share-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
}

.share-btn:hover {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
  border-color: var(--color-purple);
}

.toc-link {
  transition: all 0.2s ease;
  position: relative;
}

.toc-link::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background-color: var(--color-purple);
  transition: height 0.2s ease;
  border-radius: 4px;
}

.toc-link.active::before {
  height: 100%;
}

.toc-link:hover {
  color: var(--color-purple) !important;
}

/* Code Block */
.code-block-wrapper {
  border: 1px solid var(--color-border);
}

.code-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.dot {
  font-size: 24px;
  line-height: 10px;
  margin-right: 4px;
}

/* Takeaways */
.takeaways-box {
  border-left: 4px solid var(--color-purple);
}

.takeaways-icon {
  width: 32px;
  height: 32px;
  top: -16px;
  left: 32px;
  box-shadow: 0 4px 6px var(--color-shadow);
}

/* Newsletter */
.newsletter-section {
  border: 1px solid var(--color-border);
}

.newsletter-gradient {
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-surface) 100%);
  z-index: 1;
}

.rounded-pill-start {
  border-top-left-radius: 50rem;
  border-bottom-left-radius: 50rem;
  padding-left: 1.5rem;
}

.rounded-pill-end {
  border-top-right-radius: 50rem;
  border-bottom-right-radius: 50rem;
}

/* Related Cards */
.related-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--color-border) !important;
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md) !important;
}

@media (max-width: 991px) {
  .blog-detail-wrapper { padding: 20px 16px 40px; }
}
</style>
