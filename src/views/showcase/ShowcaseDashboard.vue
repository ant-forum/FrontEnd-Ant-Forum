<script setup>
import { ref, computed } from 'vue';
import Navbar from '../../components/layouts/header.vue';
import BaseFooter from '../../components/layouts/footer.vue';

const sortBy = ref('latest');
const searchQuery = ref('');

const allProjects = [
  {
    id: 1,
    title: 'Nexus Analytics Dashboard',
    description: 'A high-performance data visualization engine built for real-time tracking.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    tags: ['VUE.JS', 'D3.JS', 'TYPESCRIPT'],
    avg_rating: 4.8,
    views: '8.4k',
    author: 'Sarah Jenkins',
    author_avatar: 'https://i.pravatar.cc/150?u=1',
    created_at: '2024-05-20',
    category: 'Technology'
  },
  {
    id: 2,
    title: 'Aether OS Gateway',
    description: 'Microservices API gateway designed for low-latency financial systems.',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600',
    tags: ['NODE.JS', 'REDIS', 'GRAPHQL'],
    avg_rating: 4.5,
    views: '12.1k',
    author: 'Marcus Chen',
    author_avatar: 'https://i.pravatar.cc/150?u=3',
    created_at: '2024-05-18',
    category: 'Infrastructure'
  },
  {
    id: 3,
    title: 'Lumina Design System',
    description: 'A comprehensive suite of accessible React components for scale.',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600',
    tags: ['REACT', 'TAILWIND', 'STORYBOOK'],
    avg_rating: 4.9,
    views: '5.2k',
    author: 'Elena Rodriguez',
    author_avatar: 'https://i.pravatar.cc/150?u=4',
    created_at: '2024-05-22',
    category: 'Design'
  },
  {
    id: 4,
    title: 'Quantum Ledger',
    description: 'Immutable distributed ledger technology for secure asset management.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600',
    tags: ['RUST', 'WEBASSEMBLY', 'GRPC'],
    avg_rating: 4.7,
    views: '15.6k',
    author: 'David Wu',
    author_avatar: 'https://i.pravatar.cc/150?u=5',
    created_at: '2024-05-25',
    category: 'Infrastructure'
  }
];

const categories = ['All', 'Technology', 'Infrastructure', 'Design'];
const selectedCategory = ref('All');

const filteredProjects = computed(() => {
  let result = [...allProjects];

  // Category filter
  if (selectedCategory.value !== 'All') {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
  }

  // Sort filter
  if (sortBy.value === 'top_rated') {
    result.sort((a, b) => b.avg_rating - a.avg_rating);
  } else if (sortBy.value === 'most_viewed') {
    result.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
  } else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return result;
});
</script>

<template>
  <div class="showcase-page">
    <Navbar />

    <main class="container py-4 flex-grow-1">
      <div class="row justify-content-center">
        <!-- Main Content -->
        <div class="col-12 showcase-wrapper">
          <!-- Pipeline Banner (Clean Soft Style) -->
          <div class="banner-wrapper mb-5">
            <div class="card border-0 rounded-5 p-4 p-lg-5 pipeline-banner-soft position-relative overflow-hidden">
              <!-- Soft Background Shapes -->
              <div class="soft-blob blob-left"></div>
              <div class="soft-blob blob-right"></div>
              
              <div class="row align-items-center position-relative z-2">
                <div class="col-lg-9">
                  <div class="soft-badge mb-3">
                    <span class="dot"></span>
                    <span class="badge-text text-uppercase">Community Showcase</span>
                  </div>
                  <h3 class="fw-bold text-dark-blue mb-3">Project Pipeline</h3>
                  <p class="soft-description mb-4">
                    Discover top-tier technical projects, explore production architectures, and connect with visionary developers across the ecosystem.
                  </p>
                  
                  <div class="d-flex align-items-center gap-3 flex-wrap">
                    <router-link to="/showcase/create" class="btn btn-soft-purple rounded-4 px-4 py-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                      <i class="bi bi-play-fill fs-5"></i> Submit Your Work
                    </router-link>
                    
                    <!-- Avatar Group -->
                    <div class="d-flex align-items-center gap-2 ms-lg-3">
                      <div class="avatar-group-soft">
                        <div class="avatar-mini bg-primary">AM</div>
                        <div class="avatar-mini bg-danger">SK</div>
                        <div class="avatar-mini bg-success">JL</div>
                      </div>
                      <span class="text-muted small fw-medium">+42 members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters Section -->
          <div class="mb-5">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
              <div class="search-box-modern position-relative flex-grow-1">
                <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input v-model="searchQuery" type="text" class="form-control rounded-pill ps-5 py-2 border-0 shadow-sm" placeholder="Search projects...">
              </div>
              
              <div class="filter-group d-flex gap-2 overflow-x-auto pb-1">
                <button @click="sortBy = 'latest'" :class="['btn rounded-pill px-4 py-2 fw-semibold transition-all whitespace-nowrap', sortBy === 'latest' ? 'btn-primary shadow-sm' : 'btn-light border']">
                  Latest
                </button>
                <button @click="sortBy = 'top_rated'" :class="['btn rounded-pill px-4 py-2 fw-semibold transition-all whitespace-nowrap', sortBy === 'top_rated' ? 'btn-primary shadow-sm' : 'btn-light border']">
                  Top Rated
                </button>
                <button @click="sortBy = 'most_viewed'" :class="['btn rounded-pill px-4 py-2 fw-semibold transition-all whitespace-nowrap', sortBy === 'most_viewed' ? 'btn-primary shadow-sm' : 'btn-light border']">
                  Most Viewed
                </button>
              </div>
            </div>

            <!-- Category Pills -->
            <div class="d-flex flex-wrap gap-2 mt-4 justify-content-center">
              <button 
                v-for="cat in categories" 
                :key="cat"
                @click="selectedCategory = cat"
                :class="['btn btn-sm rounded-pill px-3 py-1 transition-all', selectedCategory === cat ? 'btn-dark' : 'btn-outline-secondary border-0 opacity-75']"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Projects Grid -->
          <div class="row g-4">
            <div v-if="filteredProjects.length === 0" class="col-12 text-center py-5">
              <div class="opacity-50">
                <i class="bi bi-folder2-open display-1 mb-3 d-block"></i>
                <h4>No projects found matching your criteria.</h4>
              </div>
            </div>
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
                  <p class="text-muted small mb-4 line-clamp-2">{{ project.description }}</p>
                  
                  <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                    <div class="d-flex gap-3 text-muted x-small fw-bold">
                      <span class="d-flex align-items-center gap-1">
                        <i class="bi bi-star-fill text-warning"></i> 
                        {{ project.avg_rating }}
                      </span>
                      <span class="d-flex align-items-center gap-1">
                        <i class="bi bi-eye"></i> 
                        {{ project.views }}
                      </span>
                    </div>
                    <div class="author-info d-flex align-items-center gap-2">
                      <img :src="project.author_avatar" class="rounded-circle" width="24" height="24">
                      <span class="x-small text-muted">{{ project.author }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div v-if="filteredProjects.length > 0" class="text-center mt-5">
            <button class="btn btn-white rounded-pill px-5 py-2 border shadow-sm fw-semibold d-inline-flex align-items-center gap-2">
              Load More Projects <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Clean Soft Banner Styles */
.showcase-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.pipeline-banner-soft {
  background-color: #f8f7ff;
  min-height: 280px;
  border: 1px solid rgba(0, 0, 0, 0.03) !important;
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
  background: rgba(139, 92, 246, 0.08);
  top: -100px;
  left: -50px;
}

.blob-right {
  width: 400px;
  height: 400px;
  background: rgba(168, 85, 247, 0.12);
  bottom: -150px;
  right: -100px;
}

.soft-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ede9ff;
  padding: 6px 16px;
  border-radius: 100px;
}

.soft-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #7c3aed;
  border-radius: 50%;
}

.soft-badge .badge-text {
  color: #7c3aed;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.text-dark-blue {
  color: #1e1b4b;
  font-size: 1.75rem;
}

.soft-description {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 650px;
}

.btn-soft-purple {
  background-color: #7c3aed;
  color: white;
  border: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-soft-purple:hover {
  background-color: #6d28d9;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3) !important;
}

.avatar-group-soft {
  display: flex;
  align-items: center;
}

.avatar-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  border: 2px solid #f8f7ff;
  margin-left: -10px;
}

.avatar-mini:first-child {
  margin-left: 0;
}

/* Original Styles Fallback/Compatibility */
.showcase-page {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  color: #1e293b;
}

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

.search-box-modern {
  min-width: 300px;
}

.search-box-modern input {
  background: #f8fafc;
  transition: all 0.3s ease;
}

.search-box-modern input:focus {
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
}

.transition-all {
  transition: all 0.3s ease;
}

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

.fw-black { font-weight: 900; }
.x-small { font-size: 0.7rem; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.whitespace-nowrap {
  white-space: nowrap;
}

@media (max-width: 991px) {
  .showcase-wrapper { padding: 20px 16px 40px; }
  .pipeline-banner-modern { text-align: center; }
  .search-box-modern { width: 100%; }
  .filter-group { width: 100%; justify-content: center; }
}
</style>
