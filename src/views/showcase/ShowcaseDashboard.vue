<script setup>
import { ref } from 'vue';

const activeExplore = ref('Trending');

const exploreMenu = [
  { name: 'Trending', icon: 'bi-graph-up-arrow' },
  { name: 'Latest Drops', icon: 'bi-patch-check' },
  { name: 'Top Rated', icon: 'bi-star' },
  { name: 'My Saved', icon: 'bi-bookmark' }
];

const projects = [
  {
    id: 1,
    title: 'Nexus Analytics Dashboard',
    desc: 'A high-performance data visualization engine built for real-time tracking.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    tags: ['VUE.JS', 'D3.JS', 'TYPESCRIPT'],
    stars: '1.2k',
    views: '8.4k',
    authors: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2']
  },
  {
    id: 2,
    title: 'Aether OS Gateway',
    desc: 'Microservices API gateway designed for low-latency financial systems.',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=600',
    tags: ['NODE.JS', 'REDIS', 'GRAPHQL'],
    stars: '1.2k',
    views: '8.4k',
    authors: ['https://i.pravatar.cc/150?u=3']
  },
  {
    id: 3,
    title: 'Lumina Design System',
    desc: 'A comprehensive suite of accessible React components for scale.',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=600',
    tags: ['REACT', 'TAILWIND', 'STORYBOOK'],
    stars: '1.2k',
    views: '8.4k',
    authors: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6']
  }
];
</script>

<template>
  <div class="showcase-page">
    <!-- Header -->
    <header class="showcase-header sticky-top">
      <div class="container py-3 d-flex align-items-center justify-content-between">
        <div class="header-left d-flex align-items-center">
          <span class="logo-text fw-black fs-3 text-gradient">ANT</span>
          <span class="ms-1 fw-bold fs-5 text-muted opacity-50">Showcase</span>
        </div>

      <div class="header-center d-none d-md-block">
        <div class="nav-pills-modern d-flex gap-1 p-1 border rounded-pill bg-white shadow-sm">
          <router-link v-for="link in ['Forum', 'Showcase', 'Blog']" :key="link" 
                       :to="'/' + link.toLowerCase()" 
                       class="nav-link-modern" 
                       :class="{ 'active': link === 'Showcase' }">
            {{ link }}
          </router-link>
        </div>
      </div>

      <div class="header-right d-flex align-items-center gap-3">
        <div class="search-box-modern d-none d-lg-flex align-items-center bg-light rounded-pill px-3 py-2 border">
          <i class="bi bi-search text-muted me-2"></i>
          <input type="text" class="border-0 bg-transparent small fw-medium" placeholder="Search projects..." style="outline: none; width: 180px;">
          <span class="badge bg-white text-muted border border-light-subtle rounded px-2 py-1 ms-2 x-small">⌘K</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-icon-modern"><i class="bi bi-bell"></i></button>
          <button class="btn btn-icon-modern"><i class="bi bi-gear"></i></button>
        </div>
        <div class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 bg-white border rounded-pill shadow-sm">
          <img src="https://i.pravatar.cc/150?u=alex" class="rounded-circle border border-2 border-primary-subtle" width="32" height="32" alt="User">
          <span class="small fw-bold d-none d-xl-block">Alex Chen</span>
        </div>
      </div>
    </div>
  </header>

    <main class="container py-4 flex-grow-1">
      <div class="row g-4">
        <!-- Sidebar -->
        <aside class="col-lg-3">
          <!-- Profile Card -->
          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 profile-card-modern">
            <div class="text-center mb-4">
              <div class="avatar-wrapper position-relative d-inline-block">
                <img src="https://i.pravatar.cc/150?u=alex" class="rounded-circle mb-3 border border-4 border-white shadow-md profile-img" width="90" height="90">
                <span class="status-indicator online"></span>
              </div>
              <h5 class="fw-bold mb-1">Alex Chen</h5>
              <p class="text-muted small fw-medium mb-0">Senior Frontend Engineer</p>
              <div class="badge bg-primary-subtle text-primary mt-2 px-3 rounded-pill x-small fw-bold">PRO DEVELOPER</div>
            </div>
            
            <div class="skills-section-modern mb-4">
              <div class="skill-item-modern mb-3">
                <div class="d-flex justify-content-between small fw-bold mb-2">
                  <span class="text-muted">Vue.js Ecosystem</span>
                  <span class="text-primary">92%</span>
                </div>
                <div class="progress-modern">
                  <div class="progress-fill" style="width: 92%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
                </div>
              </div>
              <div class="skill-item-modern mb-3">
                <div class="d-flex justify-content-between small fw-bold mb-2">
                  <span class="text-muted">Node.js / GraphQL</span>
                  <span class="text-primary">85%</span>
                </div>
                <div class="progress-modern">
                  <div class="progress-fill" style="width: 85%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
                </div>
              </div>
            </div>

            <button class="btn btn-cv-modern w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 py-2 fw-bold">
              <i class="bi bi-file-earmark-pdf"></i> View Digital CV
            </button>
          </div>

          <!-- Explore Menu -->
          <div class="card border-0 shadow-sm rounded-4 p-3 explore-menu-modern">
            <div class="d-flex align-items-center gap-2 mb-3 ps-2">
              <div class="explore-dot"></div>
              <h6 class="text-dark small fw-black mb-0 text-uppercase tracking-wider">Explore Feed</h6>
            </div>
            <nav class="nav flex-column gap-1">
              <a v-for="item in exploreMenu" :key="item.name" href="#" 
                 class="nav-link-modern-sidebar d-flex align-items-center gap-3 px-3 py-2 rounded-3"
                 :class="{ 'active': activeExplore === item.name }"
                 @click.prevent="activeExplore = item.name">
                <div class="icon-circle shadow-sm">
                  <i :class="['bi', item.icon]"></i>
                </div>
                <span class="fw-semibold">{{ item.name }}</span>
                <i v-if="activeExplore === item.name" class="bi bi-chevron-right ms-auto small opacity-50"></i>
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Pipeline Banner -->
          <div class="card border-0 shadow-sm rounded-4 p-4 p-lg-5 mb-4 pipeline-banner-modern position-relative overflow-hidden">
            <div class="banner-abstract-shape-1"></div>
            <div class="banner-abstract-shape-2"></div>
            
            <div class="row align-items-center position-relative z-1">
              <div class="col-md-8">
                <div class="badge bg-white text-primary rounded-pill px-3 py-2 fw-bold mb-3 shadow-sm x-small">
                  <i class="bi bi-stars me-1"></i> COMMUNITY SHOWCASE
                </div>
                <h2 class="display-6 fw-black mb-3">Project Pipeline</h2>
                <p class="text-muted mb-0 lead-small opacity-75">Discover top-tier technical projects, explore production architectures, and connect with visionary developers across the ecosystem.</p>
              </div>
              <div class="col-md-4 text-md-end mt-4 mt-md-0">
                <router-link to="/showcase/create" class="btn btn-submit-modern-hero rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2 ms-md-auto text-decoration-none justify-content-center shadow-lg">
                  <i class="bi bi-plus-lg fs-5"></i> Submit Your Work
                </router-link>
              </div>
            </div>
          </div>

          <!-- Projects Grid -->
          <div class="row g-4">
            <div v-for="project in projects" :key="project.title" class="col-md-6 col-xl-4">
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
                      <span class="d-flex align-items-center gap-1"><i class="bi bi-star-fill text-warning"></i> {{ project.stars }}</span>
                      <span class="d-flex align-items-center gap-1"><i class="bi bi-eye"></i> {{ project.views }}</span>
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

          <!-- Load More -->
          <div class="text-center mt-5">
            <button class="btn btn-white rounded-pill px-5 py-2 border shadow-sm fw-semibold d-inline-flex align-items-center gap-2">
              Load More Projects <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container-fluid py-4 px-lg-5 mt-5 border-top">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div class="text-muted small fw-bold">ANT-Forum</div>
        <div class="text-muted small">© 2024 ANT-Forum Ecosystem. Built for developers.</div>
        <div class="footer-links d-flex gap-4">
          <a href="#" class="text-muted text-decoration-none small fw-bold">Privacy</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">Terms</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">Github</a>
          <a href="#" class="text-muted text-decoration-none small fw-bold">Status</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.showcase-page {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  color: #1e293b;
}

/* Header Modern */
.showcase-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.text-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-link-modern {
  padding: 6px 18px;
  border-radius: 50px;
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.nav-link-modern:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.nav-link-modern.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.btn-icon-modern {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;
  border: 1px solid #f1f5f9;
  color: #64748b;
  transition: all 0.2s;
}

.btn-icon-modern:hover {
  background: #f8fafc;
  color: #6366f1;
  border-color: #e0e7ff;
}

/* Profile Card Modern */
.profile-card-modern {
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
}

.profile-img {
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover .profile-img {
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 15px;
  right: 5px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid white;
}

.status-indicator.online { background-color: #10b981; }

.progress-modern {
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
}

.btn-cv-modern {
  background: #1e293b;
  color: white;
  border: none;
  transition: all 0.2s;
}

.btn-cv-modern:hover {
  background: #0f172a;
  transform: translateY(-2px);
}

/* Explore Menu Modern */
.explore-menu-modern {
  background: white;
}

.explore-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.nav-link-modern-sidebar {
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s ease;
}

.icon-circle {
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-link-modern-sidebar:hover .icon-circle {
  background: #f1f5f9;
  color: #6366f1;
}

.nav-link-modern-sidebar.active {
  background: #f5f3ff;
  color: #6366f1;
}

.nav-link-modern-sidebar.active .icon-circle {
  background: #6366f1;
  color: white;
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
  background: #f1f5f9;
  color: #475569;
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
  .sidebar { margin-bottom: 2rem; }
  .pipeline-banner-modern { text-align: center; }
}
</style>