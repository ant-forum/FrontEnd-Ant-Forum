<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';
import { useProjectStore } from '../../stores/ProjectStore.js';
import { useTagsStore } from '../../stores/TagsStore.js';

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const tagsStore = useTagsStore();

const filterTab = ref('latest');
const searchLoading = ref(false);
const searchQuery = ref('');
const selectedTag = ref('All');
const activeTab = ref('projects');

const availableTags = computed(() => {
  const list = ['All'];
  if (tagsStore.tags) {
    tagsStore.tags.forEach(t => {
      const name = t.name || t.tag_name;
      if (name) {
        const nameUpper = name.toUpperCase();
        if (!list.includes(nameUpper)) {
          list.push(nameUpper);
        }
      }
    });
  }
  return list;
});
const filters = ['Latest', 'Top Rated', 'Most Viewed'];

const projects = computed(() => projectStore.projects);
const loading = computed(() => projectStore.isLoading);

const filteredProjects = computed(() => {
  let result = [...projects.value];

  if (selectedTag.value !== 'All') {
    const selectedTagLower = selectedTag.value.toLowerCase();
    result = result.filter(p => 
      p.tags.some(tag => tag.toLowerCase().includes(selectedTagLower))
    );
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }

  if (filterTab.value === 'latest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (filterTab.value === 'top rated') {
    result.sort((a, b) => b.average_rating - a.average_rating);
  } else if (filterTab.value === 'most viewed') {
    result.sort((a, b) => b.views - a.views);
  }

  return result;
});

const formatNumber = (num, isRating = false) => {
  const n = Number(num) || 0;
  if (isRating) {
    return n.toFixed(1);
  }
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
};

const handleSearchInput = () => {
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 350);
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedTag.value = 'All';
  filterTab.value = 'latest';
};

onMounted(() => {
  projectStore.fetchProjects();
  tagsStore.fetchTags();
});
</script>

<template>
  <div class="showcase-page">
    <Navbar />

    <div class="showcase-global-grid">
      <!-- Main Content Container -->
      <div class="showcase-main-container">
        <!-- Sleek Page Header -->
        <section class="showcase-page-header">
          <div>
            <span class="showcase-page-kicker">Community Hub</span>
            <h1>Project Showcase</h1>
            <p>Discover, review, and get inspired by projects built by our developers.</p>
          </div>
          <div class="showcase-stats">
            <div class="stat-badge">
              <i class="bi bi-rocket-takeoff"></i>
              <span>{{ projects.length }} Active Projects</span>
            </div>
          </div>
        </section>

        <!-- Clean Local Search Bar with clickable button inside it -->
        <div class="showcase-search-section">
          <div class="search-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search projects, tags, or authors..."
              class="search-bar"
              @input="handleSearchInput"
            >
            <button class="search-btn" @click="handleSearchInput" title="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Elegant Filter Row -->
        <div class="showcase-tabs-section">
          <div class="tabs-group">
            <button
              v-for="filter in filters"
              :key="filter"
              :class="['tab-btn', { active: filterTab === filter.toLowerCase() }]"
              @click="filterTab = filter.toLowerCase()"
            >
              {{ filter }}
            </button>
          </div>
          <button class="create-btn" @click="router.push('/showcase/create')">
            <i class="bi bi-plus-lg"></i>
            <span>Submit Project</span>
          </button>
        </div>

        <!-- Tags Filter Row -->
        <div class="tags-filter-row">
          <button
            v-for="tag in availableTags"
            :key="tag"
            :class="['tag-filter-btn', { active: selectedTag === tag }]"
            @click="selectedTag = tag"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Inner Content (Projects Grid) -->
        <div class="showcase-feed-content">
          <!-- Skeletons Loader State -->
          <div v-if="loading || searchLoading" class="skeletons-grid">
            <div v-for="i in 6" :key="i" class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-desc"></div>
                <div class="skeleton-tags">
                  <div class="skeleton-tag"></div>
                  <div class="skeleton-tag"></div>
                </div>
                <div class="skeleton-footer">
                  <div class="skeleton-meta"></div>
                  <div class="skeleton-avatars"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredProjects.length === 0" class="empty-state-card">
            <div class="empty-icon-wrap">
              <i class="bi bi-code-slash"></i>
            </div>
            <h2>No Projects Found</h2>
            <p>We couldn't find any projects matching your active search terms or category choices. Try resetting filters or submit your own project!</p>
            <div class="empty-actions">
              <button class="reset-btn" @click="clearFilters">Reset All Filters</button>
              <button class="create-secondary" @click="router.push('/showcase/create')">Submit Project</button>
            </div>
          </div>

          <!-- Projects Grid -->
          <div v-else class="projects-grid">
            <div v-for="project in filteredProjects" :key="project.id" class="project-card">
              <div class="project-image-container">
                <img :src="project.image" class="project-image" alt="project.title">
                <div class="project-overlay">
                  <router-link :to="'/showcase/' + project.id" class="btn-view-details">
                    View Details
                  </router-link>
                </div>
              </div>
              
              <div class="project-content">
                <router-link :to="'/showcase/' + project.id" class="project-link">
                  <h3 class="project-title">{{ project.title }}</h3>
                </router-link>
                <p class="project-description">{{ project.description }}</p>
                
                <div class="project-tags">
                  <span v-for="tag in project.tags" :key="tag" class="project-tag">{{ tag }}</span>
                </div>

                <div class="project-footer">
                  <div class="project-meta">
                    <span class="meta-item"><i class="bi bi-star-fill"></i> {{ formatNumber(project.average_rating, true) }}</span>
                    <span class="meta-item"><i class="bi bi-eye"></i> {{ formatNumber(project.views) }}</span>
                  </div>
                  <div class="author-avatars">
                    <span class="author-name-text" v-if="project.author && project.author.name !== 'Unknown'" :title="project.author.username">
                      by {{ project.author.name }}
                    </span>
                    <div class="avatar-stack">
                      <img v-for="(author, idx) in project.authors.slice(0, 3)" :key="idx" 
                           :src="author.avatar" class="stack-avatar" 
                           width="28" height="28" :style="{ zIndex: 10 - idx }"
                           :title="author.name">
                      <div v-if="project.authors.length > 3" class="stack-more" 
                           style="width: 28px; height: 28px; z-index: 0;">+{{ project.authors.length - 3 }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="filteredProjects.length > 0 && !loading && !searchLoading" class="load-more-wrap">
            <button class="load-more-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Load More Projects
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <BaseFooter />
  </div>
</template>

<style scoped>
.showcase-page {
  min-height: 100vh;
}

.showcase-global-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.showcase-main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Page Header */
.showcase-page-header {
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
  margin-top: 8px;
}

.showcase-page-kicker {
  display: block;
  margin-bottom: 6px;
  color: var(--color-purple);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.showcase-page-header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.6rem, 2.5vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.showcase-page-header p {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.showcase-stats {
  display: flex;
  align-items: center;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--color-purple-light);
  color: var(--color-purple);
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
}

.stat-badge i {
  font-size: 15px;
}

@media (max-width: 768px) {
  .showcase-page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Local Search Bar Styling */
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
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
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
  color: #7c3aed;
}

.showcase-tabs-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--color-border);
  margin-top: 24px;
  padding-bottom: 0px;
}

.tabs-group {
  display: flex;
  gap: 24px;
}

.tab-btn {
  padding: 12px 4px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  font-family: inherit;
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  color: var(--color-primary);
  font-weight: 600;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: -1.5px;
  left: 0;
  right: 0;
  height: 2.5px;
  background-color: var(--color-primary);
  border-radius: 99px;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.create-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Tags Filter Row */
.tags-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-filter-btn {
  padding: 6px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tag-filter-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-filter-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.showcase-feed-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.project-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-image {
  transform: scale(1.08);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

[data-theme='dark'] .project-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.btn-view-details {
  padding: 8px 20px;
  background: var(--color-surface);
  color: var(--color-text);
  border: none;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-view-details:hover {
  background: var(--color-primary);
  color: white;
}

.project-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-link {
  text-decoration: none;
}

.project-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  transition: color 0.2s ease;
}

.project-card:hover .project-title {
  color: var(--color-primary);
}

.project-description {
  font-size: 13.5px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-tag {
  padding: 4px 10px;
  background: var(--color-purple-light);
  color: var(--color-purple);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.project-meta {
  display: flex;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item i {
  color: var(--color-primary);
}

.avatar-stack {
  display: flex;
}

.stack-avatar {
  border-radius: 50%;
  border: 2px solid var(--color-surface);
  margin-left: -8px;
  transition: transform 0.2s ease;
}

.stack-avatar:first-child {
  margin-left: 0;
}

.avatar-stack:hover .stack-avatar {
  transform: translateX(4px);
}

.stack-more {
  border-radius: 50%;
  border: 2px solid var(--color-surface);
  background: var(--color-surface-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text);
  margin-left: -8px;
}

.author-avatars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name-text {
  font-size: 12.5px;
  color: var(--color-text-muted);
  font-weight: 500;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.project-card:hover .author-name-text {
  color: var(--color-text);
}

/* Skeletons Styling */
.skeletons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-card {
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skeleton-image {
  height: 180px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title {
  width: 70%;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-desc {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-tags {
  display: flex;
  gap: 6px;
}

.skeleton-tag {
  width: 60px;
  height: 20px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.skeleton-meta {
  width: 100px;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-avatars {
  width: 80px;
  height: 28px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State Card styling */
.empty-state-card {
  background: var(--color-surface);
  border-radius: 20px;
  border: 1px dashed var(--color-primary);
  padding: 56px 40px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 68px;
  height: 68px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.empty-state-card h2 {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 12px;
}

.empty-state-card p {
  color: var(--color-text-muted);
  max-width: 460px;
  line-height: 1.6;
  font-size: 14.5px;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.reset-btn {
  padding: 10px 20px;
  background: var(--color-surface-hover);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.create-secondary {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13.5px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px var(--color-primary-light);
}

.create-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--color-primary-light);
}

/* Load More */
.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

@media (max-width: 1024px) {
  .showcase-global-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .showcase-global-grid { padding: 20px 16px 40px; }
  .tabs-group { width: 100%; justify-content: center; }
  .tab-btn { flex: 1; text-align: center; }
  .create-btn { justify-content: center; }
  .projects-grid { grid-template-columns: 1fr; }
}
</style>
