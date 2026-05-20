<script setup>
import { ref } from 'vue';

const activeTab = ref('Overview');

const project = ref({
  id: 1,
  title: 'Nexus Analytics',
  specTitle: 'Nexus Analytics Spec',
  description: 'Real-time telemetry and visualization engine for enterprise-scale data.',
  longDescription: 'This specification outlines the architecture of Nexus Analytics, a high-performance framework designed for sub-50ms telemetry ingestion and real-time visualization of high-cardinality datasets.',
  lead: 'Sarah Jenkins',
  leadAvatar: 'https://i.pravatar.cc/150?u=sarah',
  tags: ['VUE.JS', 'D3.JS', 'TYPESCRIPT', 'POSTGRESQL'],
  rating: 4.8,
  stats: {
    stars: '1.2k',
    forks: '342',
    contributors: '12',
    issues: '24'
  },
  maintainers: [
    { name: 'Sarah Jenkins', role: 'Lead Maintainer', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Marcus Chen', role: 'Data Viz', avatar: 'https://i.pravatar.cc/150?u=marcus' },
    { name: 'Elena Rodriguez', role: 'Backend', avatar: 'https://i.pravatar.cc/150?u=elena' }
  ]
});

const technicalSpecs = [
  { label: 'Frontend', value: 'Vue 3, Pinia, Tailwind CSS' },
  { label: 'Visualization', value: 'D3.js, Three.js' },
  { label: 'Database', value: 'PostgreSQL, TimescaleDB' },
  { label: 'Infrastructure', value: 'Kubernetes, AWS EKS' }
];

const architectureSteps = [
  { title: 'Ingestion', desc: 'Real-time telemetry collection via gRPC and WebSocket streams.', icon: 'bi-box-arrow-in-right' },
  { title: 'Processing', desc: 'Stream processing using Apache Kafka for data enrichment.', icon: 'bi-cpu' },
  { title: 'Storage', desc: 'Optimized time-series storage for sub-second query performance.', icon: 'bi-database' },
  { title: 'Visualization', desc: 'Dynamic rendering of high-cardinality datasets via D3.js.', icon: 'bi-graph-up' }
];

const relatedProjects = [
  { id: 2, title: 'Aether OS', tag: 'Microservices', image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=400' },
  { id: 3, title: 'Lumina UI', tag: 'Design System', image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400' }
];
</script>

<template>
  <div class="showcase-detail-page">
    <!-- Header Modern (Consistent with Dashboard) -->
    <header class="showcase-header sticky-top shadow-sm">
      <div class="container py-3 d-flex align-items-center justify-content-between">
        <div class="header-left d-flex align-items-center">
          <router-link to="/showcase" class="text-decoration-none d-flex align-items-center">
            <span class="logo-text fw-black fs-3 text-gradient">ANT</span>
            <span class="ms-1 fw-bold fs-5 text-muted opacity-50">Showcase</span>
          </router-link>
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
          <input type="text" class="border-0 bg-transparent small fw-medium" placeholder="Search components..." style="outline: none; width: 150px;">
        </div>
        <button class="btn btn-icon-modern"><i class="bi bi-bell"></i></button>
        <div class="user-profile-pill d-flex align-items-center gap-2 ps-1 pe-3 py-1 bg-white border rounded-pill shadow-sm">
          <img src="https://i.pravatar.cc/150?u=alex" class="rounded-circle border border-2 border-primary-subtle" width="32" height="32" alt="User">
          <span class="small fw-bold d-none d-xl-block">Alex Chen</span>
        </div>
      </div>
    </div>
  </header>

    <div class="container py-4 flex-grow-1">
      <div class="row g-4">
        <!-- Sidebar -->
        <aside class="col-lg-3">
          <div class="card border-0 shadow-sm rounded-5 p-4 bg-sidebar-modern h-100">
            <div class="project-info-card text-start position-relative z-1">
              <div class="project-logo-modern mb-4 shadow-sm rounded-4">
                <div class="logo-inner d-flex align-items-center justify-content-center bg-white rounded-4 p-3">
                  <i class="bi bi-layers-fill fs-2 text-primary"></i>
                  <span class="ms-2 fw-black fs-4 text-gradient">Nexus</span>
                </div>
              </div>

              <h3 class="fw-black h5 mb-2 text-dark">{{ project.title }}</h3>
              <p class="text-muted x-small mb-4 lh-base">{{ project.description }}</p>

              <div class="lead-info-pill d-flex align-items-center mb-4 p-2 rounded-pill bg-white border shadow-sm">
                <img :src="project.leadAvatar" class="rounded-circle border border-2 border-primary-subtle" width="32" height="32" alt="Lead">
                <div class="ms-2">
                  <div class="xx-small text-muted fw-bold text-uppercase">Project Lead</div>
                  <div class="small fw-bold text-dark">{{ project.lead }}</div>
                </div>
              </div>

              <div class="tags-cloud d-flex flex-wrap gap-2 mb-4">
                <span v-for="tag in project.tags" :key="tag" class="tag-pill-modern">{{ tag }}</span>
              </div>

              <!-- Rating Card Modern -->
              <div class="rating-card-modern p-3 rounded-4 mb-4 shadow-sm border border-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="xx-small text-uppercase fw-black text-primary tracking-wider opacity-75">Technical Score</div>
                  <div class="badge bg-white text-primary rounded-pill x-small fw-bold border shadow-sm">v1.2</div>
                </div>
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="h2 fw-black mb-0 text-dark">{{ project.rating }}</span>
                  <div>
                    <div class="stars text-warning small">
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-half"></i>
                    </div>
                    <div class="xx-small text-muted fw-bold">128 reviews</div>
                  </div>
                </div>
                <button class="btn btn-rate-modern w-100 rounded-pill py-2 small fw-bold shadow-sm">
                  Rate Architecture
                </button>
              </div>

              <!-- Action Buttons Modern -->
              <div class="action-buttons-modern d-flex flex-column gap-2 mt-auto">
                <button class="btn btn-demo-modern w-100 rounded-pill py-3 fw-bold shadow-md transition-up">
                  <i class="bi bi-rocket-takeoff-fill me-2"></i> Live Demo
                </button>
                <button class="btn btn-repo-modern w-100 rounded-pill py-3 fw-bold shadow-sm transition-up">
                  <i class="bi bi-github me-2"></i> Source Code
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="col-lg-9 d-flex flex-column gap-4">
          <!-- Top Sticky Navigation Tabs -->
          <div class="tabs-navigation-modern bg-white border rounded-5 px-4 shadow-sm">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex gap-4">
                <button v-for="tab in ['Overview', 'Architecture', 'Gallery']" :key="tab"
                        @click="activeTab = tab"
                        class="tab-link-modern"
                        :class="{ 'active': activeTab === tab }">
                  {{ tab }}
                </button>
              </div>
              <div class="d-none d-md-flex align-items-center gap-3 py-2">
                <div class="small fw-bold text-muted d-flex align-items-center gap-2">
                  <span class="status-dot online"></span>
                  Active
                </div>
                <button class="btn btn-share-modern"><i class="bi bi-share"></i></button>
              </div>
            </div>
          </div>

          <div class="content-wrapper-modern p-4 p-lg-5">
            <nav aria-label="breadcrumb" class="mb-4">
              <ol class="breadcrumb-modern d-flex align-items-center gap-2 p-0 m-0">
                <li class="breadcrumb-item"><router-link to="/showcase" class="text-decoration-none text-muted fw-bold">Projects</router-link></li>
                <li class="breadcrumb-separator"><i class="bi bi-chevron-right text-muted small"></i></li>
                <li class="breadcrumb-item active fw-black text-primary" aria-current="page">{{ project.specTitle }}</li>
              </ol>
            </nav>

            <div v-if="activeTab === 'Overview'" class="tab-content-fade">
              <section class="project-hero-section mb-0 p-4 p-lg-5 rounded-5 bg-white shadow-sm border position-relative overflow-hidden">
                <div class="abstract-bg-shape"></div>
                <div class="position-relative z-1">
                  <div class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold mb-3 x-small tracking-widest text-uppercase">
                    Architecture Spec
                  </div>
                  <h2 class="fw-black mb-3 tracking-tight">System Architecture Design</h2>
                  <p class="text-muted fs-6 lh-base max-w-800">{{ project.longDescription }}</p>
                </div>
              </section>

              <!-- Stats & Maintainers Modern -->
              <div class="row g-5 mb-5">
                <!-- Engine Health -->
                <div class="col-xl-7">
                  <div class="d-flex align-items-center gap-2 mb-4">
                    <div class="section-dot bg-success"></div>
                    <h6 class="text-uppercase small fw-black text-dark tracking-widest mb-0">Engine Health</h6>
                  </div>
                  <div class="row g-3">
                    <div v-for="(val, key) in project.stats" :key="key" class="col-6 col-md-3">
                      <div class="stat-card-modern p-4 rounded-5 bg-white shadow-sm border text-center transition-up h-100 d-flex flex-column justify-content-center">
                        <div class="h3 fw-black mb-1 text-dark">{{ val }}</div>
                        <div class="text-uppercase xx-small fw-black text-muted tracking-wider opacity-75">{{ key }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Core Maintainers -->
                <div class="col-xl-5">
                  <div class="d-flex align-items-center gap-2 mb-4">
                    <div class="section-dot bg-warning"></div>
                    <h6 class="text-uppercase small fw-black text-dark tracking-widest mb-0">Core Architects</h6>
                  </div>
                  <div class="maintainers-card-modern p-4 rounded-5 bg-white shadow-sm border">
                    <div class="maintainers-list d-flex flex-column gap-3">
                      <div v-for="m in project.maintainers" :key="m.name" class="d-flex align-items-center gap-3 p-2 rounded-4 hover-bg-light transition-all cursor-pointer">
                        <div class="avatar-wrapper-modern">
                          <img :src="m.avatar" class="rounded-circle shadow-sm border border-2 border-white" width="48" height="50" alt="Avatar">
                          <span class="status-dot online"></span>
                        </div>
                        <div class="flex-grow-1">
                          <div class="fw-black text-dark">{{ m.name }}</div>
                          <div class="xx-small text-muted fw-bold text-uppercase">{{ m.role }}</div>
                        </div>
                        <button class="btn btn-icon-sm rounded-circle"><i class="bi bi-chat-dots"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- System Visuals Section -->
              <section class="gallery-section mb-5">
                <div class="d-flex align-items-center justify-content-between mb-4">
                  <div class="d-flex align-items-center gap-2">
                    <div class="section-dot bg-primary"></div>
                    <h6 class="text-uppercase small fw-black text-dark tracking-widest mb-0">System Visuals</h6>
                  </div>
                  <button @click="activeTab = 'Gallery'" class="btn btn-link-custom small fw-bold text-decoration-none">View Full Gallery</button>
                </div>
                <div class="row g-4">
                  <div v-for="i in 3" :key="i" class="col-md-4">
                    <div class="gallery-card-modern rounded-5 overflow-hidden shadow-sm border transition-up">
                      <div class="gallery-placeholder-modern">
                        <i class="bi bi-image text-muted opacity-25 fs-1"></i>
                      </div>
                      <div class="p-3 bg-white border-top">
                        <div class="fw-bold small">Interface View {{ i }}</div>
                        <div class="xx-small text-muted">High-fidelity dashboard component</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Related Projects -->
              <section class="related-projects-section pt-5 border-top">
                <h6 class="text-uppercase small fw-black text-muted tracking-widest mb-4">Similar Architecture</h6>
                <div class="row g-4">
                  <div v-for="rp in relatedProjects" :key="rp.id" class="col-md-6">
                    <div class="related-card-modern d-flex align-items-center gap-3 p-3 rounded-4 bg-white border shadow-sm hover-bg-light cursor-pointer transition-all">
                      <img :src="rp.image" class="rounded-3 object-fit-cover" width="80" height="60">
                      <div>
                        <div class="fw-black text-dark">{{ rp.title }}</div>
                        <div class="xx-small text-primary fw-bold text-uppercase">{{ rp.tag }}</div>
                      </div>
                      <i class="bi bi-arrow-right ms-auto text-muted opacity-50"></i>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div v-else-if="activeTab === 'Architecture'" class="tab-content-fade">
              <div class="row g-4">
                <div class="col-lg-8">
                  <div class="card border-0 shadow-sm rounded-5 p-4 p-lg-5 bg-white mb-4">
                    <h4 class="fw-black mb-4">System Workflow</h4>
                    <div class="architecture-timeline position-relative ps-4 border-start">
                      <div v-for="(step, idx) in architectureSteps" :key="idx" class="timeline-item-modern mb-5 position-relative">
                        <div class="timeline-dot-modern"></div>
                        <div class="d-flex align-items-center gap-3 mb-2">
                          <div class="icon-circle-modern shadow-sm"><i :class="['bi', step.icon]"></i></div>
                          <h5 class="fw-bold mb-0">{{ step.title }}</h5>
                        </div>
                        <p class="text-muted small ms-5 ps-2">{{ step.desc }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-4">
                  <div class="card border-0 shadow-sm rounded-5 p-4 bg-white sticky-top" style="top: 100px;">
                    <h6 class="text-uppercase small fw-black text-muted tracking-widest mb-4">Technical Stack</h6>
                    <div class="tech-specs-list">
                      <div v-for="spec in technicalSpecs" :key="spec.label" class="spec-item-modern mb-4 pb-3 border-bottom border-light">
                        <div class="xx-small text-muted fw-bold text-uppercase mb-1">{{ spec.label }}</div>
                        <div class="small fw-bold text-dark">{{ spec.value }}</div>
                      </div>
                    </div>
                    <button class="btn btn-outline-primary w-100 rounded-pill py-2 mt-2 small fw-bold">Download Tech Spec PDF</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'Gallery'" class="tab-content-fade">
              <div class="row g-3">
                <div v-for="i in 6" :key="i" class="col-sm-6 col-md-4">
                  <div class="gallery-card-modern rounded-5 overflow-hidden shadow-sm border transition-up">
                    <div class="gallery-placeholder-modern h-100" style="min-height: 180px;">
                      <i class="bi bi-image text-muted opacity-25 fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="tab-placeholder-content py-5 text-center">
              <div class="display-1 text-muted opacity-10 mb-4"><i class="bi bi-cone-striped"></i></div>
              <h3 class="fw-black text-muted">{{ activeTab }} Section</h3>
              <p class="text-muted">This detailed technical module is currently being indexed by the ANT system.</p>
              <button @click="activeTab = 'Overview'" class="btn btn-primary-modern rounded-pill px-4 mt-3">Return to Overview</button>
            </div>
          </div>

          <!-- Footer matching image -->
          <footer class="custom-footer container-fluid py-5 px-lg-5 bg-white border-top mt-auto">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div class="footer-left text-start">
                <div class="h5 fw-black mb-1 text-gradient">ANT Ecosystem</div>
                <div class="small text-muted fw-bold">© 2026 Technical Developer Framework. All rights reserved.</div>
              </div>
              <div class="footer-right mt-4 mt-md-0">
                <ul class="list-unstyled d-flex gap-4 mb-0 small fw-bold">
                  <li><router-link to="#" class="text-decoration-none text-muted hover-primary">Documentation</router-link></li>
                  <li><router-link to="#" class="text-decoration-none text-muted hover-primary">Architecture</router-link></li>
                  <li><router-link to="#" class="text-decoration-none text-muted hover-primary">Security</router-link></li>
                  <li><router-link to="#" class="text-decoration-none text-muted hover-primary">Privacy</router-link></li>
                </ul>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.showcase-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Sora', sans-serif;
}

/* Header Modern */
.showcase-header {
  background: rgba(255, 255, 255, 0.85);
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

/* Sidebar Modern */
.bg-sidebar-modern {
  background-color: #fcfdfe;
  border: 1px solid #f1f5f9;
}

.project-logo-modern {
  background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%);
  padding: 2px;
}

.lead-info-pill {
  border: 1px solid #f1f5f9;
}

.tag-pill-modern {
  background: #f1f5f9;
  color: #6366f1;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 800;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.tag-pill-modern:hover {
  background: #e0e7ff;
  border-color: #6366f1;
}

/* Rating Card Modern */
.rating-card-modern {
  background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
}

.btn-rate-modern {
  background: #6366f1;
  color: white;
  border: none;
  transition: all 0.2s;
}

.btn-rate-modern:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

/* Action Buttons Modern */
.btn-demo-modern {
  background: #1e293b;
  color: white;
  border: none;
  transition: all 0.3s;
}

.btn-demo-modern:hover {
  background: #0f172a;
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(30, 41, 59, 0.3) !important;
}

.btn-repo-modern {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.btn-repo-modern:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-docs-modern {
  background: transparent;
  transition: all 0.2s;
  color: #6366f1;
}

.btn-docs-modern:hover {
  color: #4f46e5 !important;
}

/* Main Content Tabs */
.tabs-navigation-modern {
  z-index: 99;
}

.tab-link-modern {
  padding: 16px 0;
  background: transparent;
  border: none;
  color: #64748b;
  font-weight: 700;
  font-size: 0.95rem;
  position: relative;
  transition: all 0.2s;
}

.tab-link-modern::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 0;
  height: 3px;
  background: #6366f1;
  transition: width 0.3s ease;
  border-radius: 50px 50px 0 0;
}

.tab-link-modern:hover {
  color: #1e293b;
}

.tab-link-modern.active {
  color: #6366f1;
}

.tab-link-modern.active::after {
  width: 100%;
}

.tab-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.btn-share-modern {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #f1f5f9;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-share-modern:hover {
  background: #f8fafc;
  color: #6366f1;
  border-color: #6366f1;
}

/* Content Sections Modern */
.bg-modern-main {
  background-color: #fcfdfe;
}

.project-hero-section {
  background: white;
  min-height: 250px;
}

.abstract-bg-shape {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%);
  border-radius: 50%;
}

.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.gallery-placeholder-modern {
  background-color: #f8fafc;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-modern {
  border: 1px solid #f1f5f9 !important;
}

.maintainers-card-modern {
  border: 1px solid #f1f5f9 !important;
}

.avatar-wrapper-modern {
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-dot.online { background-color: #10b981; }

.hover-bg-light:hover {
  background-color: #f8fafc;
}

.btn-icon-sm {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  color: #64748b;
  transition: all 0.2s;
}

.btn-icon-sm:hover {
  background: #e2e8f0;
  color: #6366f1;
}

.transition-up {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transition-up:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08) !important;
}

.transition-all {
  transition: all 0.2s ease;
}

.tab-content-fade {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Architecture Timeline */
.architecture-timeline {
  border-left-width: 2px !important;
  border-color: #f1f5f9 !important;
}

.timeline-item-modern {
  padding-left: 20px;
}

.timeline-dot-modern {
  position: absolute;
  left: -27px;
  top: 10px;
  width: 12px;
  height: 12px;
  background: white;
  border: 3px solid #6366f1;
  border-radius: 50%;
  z-index: 2;
}

.icon-circle-modern {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.spec-item-modern {
  border-color: #f8fafc !important;
}

.related-card-modern:hover {
  background-color: #f8fafc;
  transform: translateX(5px);
}

.tab-placeholder-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Utilities */
.fw-black { font-weight: 900; }
.xx-small { font-size: 0.65rem; }
.x-small { font-size: 0.75rem; }
.max-w-800 { max-width: 800px; }
.tracking-widest { letter-spacing: 0.15em; }
.tracking-tight { letter-spacing: -0.03em; }

.btn-link-custom {
  color: #6366f1;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-link-custom:hover {
  color: #4f46e5;
  text-decoration: underline !important;
}

.hover-primary:hover {
  color: #6366f1 !important;
}

.custom-footer {
  border-color: #f1f5f9 !important;
  background-color: white;
}

@media (max-width: 991px) {
  .bg-sidebar-modern {
    min-height: auto !important;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
