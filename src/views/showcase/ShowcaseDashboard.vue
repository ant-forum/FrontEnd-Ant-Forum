<script setup>
import { ref, computed } from 'vue';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';

const searchQuery = ref('');
const selectedTag = ref('All');
const sortBy = ref('popular');

const availableTags = ['All', 'VUE.JS', 'NODE.JS', 'REACT', 'D3.JS', 'TYPESCRIPT', 'REDIS', 'GRAPHQL', 'TAILWIND'];

const projects = ref([
  {
    id: 1,
    title: 'Nexus Analytics Dashboard',
    desc: 'A high-performance data visualization engine built for real-time tracking.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    tags: ['VUE.JS', 'D3.JS', 'TYPESCRIPT'],
    stars: 1200,
    views: 8400,
    authors: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2']
  },
  {
    id: 2,
    title: 'Aether OS Gateway',
    desc: 'Microservices API gateway designed for low-latency financial systems.',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600',
    tags: ['NODE.JS', 'REDIS', 'GRAPHQL'],
    stars: 950,
    views: 12000,
    authors: ['https://i.pravatar.cc/150?u=3']
  },
  {
    id: 3,
    title: 'Lumina Design System',
    desc: 'A comprehensive suite of accessible React components for scale.',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600',
    tags: ['REACT', 'TAILWIND', 'STORYBOOK'],
    stars: 2100,
    views: 5600,
    authors: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6']
  }
]);

const filteredProjects = computed(() => {
  let result = [...projects.value];

  if (selectedTag.value !== 'All') {
    result = result.filter(p => p.tags.includes(selectedTag.value));
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.desc.toLowerCase().includes(query)
    );
  }

  if (sortBy.value === 'popular') {
    result.sort((a, b) => b.views - a.views);
  } else if (sortBy.value === 'stars') {
    result.sort((a, b) => b.stars - a.stars);
  }

  return result;
});

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num;
};
</script>

<template>
  <div class="showcase-page">
    <Navbar />

    <main class="showcase-wrapper">
      <!-- Pipeline Banner -->
      <div class="card border-0 shadow-sm rounded-4 p-4 p-lg-5 mb-5 pipeline-banner-modern position-relative overflow-hidden">
        <div class="banner-abstract-shape-1"></div>
        <div class="banner-abstract-shape-2"></div>
        
        <div class="row align-items-center position-relative z-1">
          <div class="col-md-8">
            <div class="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold mb-3 shadow-sm x-small">
              <i class="bi bi-stars me-1"></i> COMMUNITY SHOWCASE
            </div>
            <h2 class="fw-bold mb-3 banner-title-consistent">Project Pipeline</h2>
            <p class="text-muted mb-0 lead-small opacity-75">Discover top-tier technical projects, explore production architectures, and connect with visionary developers across the ecosystem.</p>
          </div>
          <div class="col-md-4 text-md-end mt-4 mt-md-0">
            <router-link to="/showcase/create" class="btn btn-submit-modern-hero rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 ms-md-auto text-decoration-none justify-content-center shadow-lg">
              <i class="bi bi-plus-lg fs-5"></i> Submit Your Work
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="row g-4 mb-5 align-items-center">
        <div class="col-lg-5">
          <div class="input-group shadow-sm rounded-pill overflow-hidden bg-white border">
            <span class="input-group-text border-0 bg-white ps-4"><i class="bi bi-search text-muted"></i></span>
            <input 
              v-model="searchQuery"
              type="text" 
              class="form-control border-0 py-3 ps-2" 
              placeholder="Search by project name or description..."
            >
          </div>
        </div>
        <div class="col-lg-7">
          <div class="d-flex flex-wrap gap-2 justify-content-lg-end">
            <div class="dropdown">
              <button class="btn btn-white border rounded-pill px-4 py-2 dropdown-toggle fw-semibold shadow-sm" data-bs-toggle="dropdown">
                Tag: {{ selectedTag }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2">
                <li v-for="tag in availableTags" :key="tag">
                  <a class="dropdown-item rounded-3 small py-2" href="#" @click.prevent="selectedTag = tag" :class="{ active: selectedTag === tag }">
                    {{ tag }}
                  </a>
                </li>
              </ul>
            </div>
            <div class="dropdown">
              <button class="btn btn-white border rounded-pill px-4 py-2 dropdown-toggle fw-semibold shadow-sm" data-bs-toggle="dropdown">
                Sort by: {{ sortBy === 'popular' ? 'Most Viewed' : 'Top Rated' }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2">
                <li><a class="dropdown-item rounded-3 small py-2" href="#" @click.prevent="sortBy = 'popular'" :class="{ active: sortBy === 'popular' }">Most Viewed</a></li>
                <li><a class="dropdown-item rounded-3 small py-2" href="#" @click.prevent="sortBy = 'stars'" :class="{ active: sortBy === 'stars' }">Top Rated</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-if="filteredProjects.length > 0" class="row g-4">
        <div v-for="project in filteredProjects" :key="project.id" class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 project-card-modern transition-up overflow-hidden">
            <div class="project-image-container position-relative overflow-hidden">
              <img :src="project.image" class="card-img-top object-fit-cover project-img-zoom" height="220">
              <div class="project-overlay d-flex align-items-center justify-content-center">
                <router-link :to="'/showcase/' + project.id" class="btn btn-light rounded-pill px-4 fw-bold shadow-sm">
                  View Details
                </router-link>
              </div>
            </div>
            
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <router-link :to="'/showcase/' + project.id" class="text-decoration-none text-dark">
                  <h5 class="fw-bold mb-0 project-title-modern">{{ project.title }}</h5>
                </router-link>
              </div>
              <p class="text-muted small mb-4 line-clamp-2">{{ project.desc }}</p>
              
              <div class="tags-container-modern d-flex flex-wrap gap-2 mb-4">
                <span v-for="tag in project.tags" :key="tag" class="tag-badge-modern">{{ tag }}</span>
              </div>

              <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                <div class="d-flex gap-3 text-muted x-small fw-bold">
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-star-fill text-warning"></i> {{ formatNumber(project.stars) }}</span>
                  <span class="d-flex align-items-center gap-1"><i class="bi bi-eye"></i> {{ formatNumber(project.views) }}</span>
                </div>
                <div class="author-avatars-modern d-flex">
                  <div class="avatar-stack d-flex">
                    <img v-for="(avatar, idx) in project.authors.slice(0, 3)" :key="idx" 
                         :src="avatar" class="rounded-circle border border-2 border-white ms-n2 shadow-sm stack-item" 
                         width="30" height="30" :style="{ zIndex: 10 - idx }">
                    <div v-if="project.authors.length > 3" class="rounded-circle border border-2 border-white ms-n2 shadow-sm bg-light-subtle d-flex align-items-center justify-content-center x-small fw-bold stack-item" 
                         style="width: 30px; height: 30px; z-index: 0;">+{{ project.authors.length - 3 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <div class="mb-4">
          <i class="bi bi-search fs-1 text-muted opacity-25"></i>
        </div>
        <h4 class="fw-bold">No projects found</h4>
        <p class="text-muted">Try adjusting your filters or search query.</p>
        <button @click="searchQuery = ''; selectedTag = 'All'" class="btn btn-purple rounded-pill px-4 mt-3">Reset All Filters</button>
      </div>

      <!-- Load More -->
      <div v-if="filteredProjects.length > 0" class="text-center mt-5">
        <button class="btn btn-white rounded-pill px-5 py-2 border shadow-sm fw-semibold d-inline-flex align-items-center gap-2">
          Load More Projects <i class="bi bi-chevron-down"></i>
        </button>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
.showcase-page {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  color: #1e293b;
  background-color: #fdfcff;
}

.showcase-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.btn-white {
  background-color: white;
  color: #1e293b;
}

.btn-purple {
  background-color: #7c3aed;
  color: white;
}

.btn-purple:hover {
  background-color: #6d28d9;
  color: white;
}

.text-purple {
  color: #7c3aed;
}

/* Banner Modern */
.pipeline-banner-modern {
  background: linear-gradient(135deg, #f8faff 0%, #f1f0ff 100%);
  border: 1px solid #e0e7ff;
}

.banner-abstract-shape-1 {
  position: absolute;
  top: -20%;
  right: -5%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.banner-abstract-shape-2 {
  position: absolute;
  bottom: -10%;
  left: 10%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.btn-submit-modern-hero {
  background: #6366f1;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-submit-modern-hero:hover {
  background: #4f46e5;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4) !important;
}

/* Project Card Modern */
.project-card-modern {
  background: white;
  border: 1px solid #f1f5f9 !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.project-image-container {
  height: 220px;
}

.project-img-zoom {
  transition: transform 0.6s ease;
}

.project-card-modern:hover .project-img-zoom {
  transform: scale(1.08);
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card-modern:hover .project-overlay {
  opacity: 1;
}

.project-title-modern {
  font-size: 1.1rem;
  transition: color 0.2s;
}

.project-title-modern:hover {
  color: #6366f1;
}

.tag-badge-modern {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.avatar-stack .stack-item {
  transition: transform 0.2s ease;
}

.avatar-stack:hover .stack-item {
  transform: translateX(4px);
}

/* Utilities */
.fw-black { font-weight: 900; }
.x-small { font-size: 0.7rem; }
.tracking-wider { letter-spacing: 0.05em; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 991px) {
  .pipeline-banner-modern { text-align: center; }
}
</style>