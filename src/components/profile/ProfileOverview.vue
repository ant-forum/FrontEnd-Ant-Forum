<script setup>
import { defineProps } from "vue";

const props = defineProps({
  profileName: { type: String, required: true },
  profileRole: { type: String, default: "Student" },
  profileBio: { type: String, required: true },
  profileGithub: { type: String, required: true },
  profileLinkedin: { type: String, required: true },
  profileSkills: { type: Array, required: true },
  profileAvatar: { type: String, required: true },
  defaultProjects: { type: Array, required: true },
  activityFeed: { type: Array, required: true },
});
</script>

<template>
  <div class="row g-4">
    <!-- Center Column -->
    <div class="col-xl-8 col-lg-7 d-flex flex-column gap-4">
      <!-- Profile Main Info Card (Hero Banner) -->
      <div class="profile-hero-card p-4">
        <div class="d-flex flex-column flex-sm-row align-items-start gap-4">
          <!-- Big Avatar with Online Badge -->
          <div class="position-relative flex-shrink-0 profile-avatar-wrapper">
            <img :src="profileAvatar" class="rounded-4 object-fit-cover shadow-sm" width="120" height="120" alt="Developer Avatar">
            <span class="status-indicator-dot"></span>
          </div>
          
          <!-- Info Block -->
          <div class="flex-grow-1">
            <div class="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-2">
              <div>
                <h3 class="fw-bold mb-2 profile-name">{{ profileName }}</h3>
                <span class="role-badge-overview">{{ profileRole }}</span>
              </div>
            </div>
            <!-- Description -->
            <p class="bio-text text-muted mb-0">
              {{ profileBio }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Featured Projects -->
      <div class="featured-projects-section">
        <div class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-rocket-takeoff text-primary-purple fs-4"></i>
          <h5 class="mb-0 fw-bold header-title themed-text">Featured Projects</h5>
        </div>
        
        <div class="row g-3">
          <div v-for="project in defaultProjects" :key="project.title" class="col-md-6">
            <div class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
                  <span class="d-flex align-items-center gap-1 text-muted small"><i class="bi bi-star-fill text-warning"></i> {{ project.stars }}</span>
                </div>
                <p class="text-muted small mb-4 line-clamp-3">
                  {{ project.desc }}
                </p>
              </div>
              
              <div class="d-flex flex-wrap gap-2">
                <span v-for="tag in project.tags" :key="tag" class="tag-badge-v2" :class="tag.toLowerCase()">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="recent-activity-section">
        <div class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-clock-history text-primary-purple fs-4"></i>
          <h5 class="mb-0 fw-bold header-title themed-text">Recent Activity</h5>
        </div>
        
        <div class="d-flex flex-column gap-3">
          <div v-for="activity in activityFeed" :key="activity.title" class="activity-row-modern p-3 d-flex align-items-center gap-3">
            <div class="activity-icon-container">
              <i :class="['bi', activity.icon, 'text-primary-purple']"></i>
            </div>
            <div class="overflow-hidden">
              <h6 class="mb-1 fw-bold themed-text text-truncate small-title">{{ activity.title }}</h6>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ activity.meta }}</small>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Right Column: Vitals & Skills -->
    <div class="col-xl-4 col-lg-5 d-flex flex-column gap-4">
      <!-- Stack Proficiency -->
      <div class="dashboard-card-modern p-4">
        <h6 class="themed-text fw-bold mb-4" style="font-size: 0.9rem; letter-spacing: 0.3px;">Stack Proficiency</h6>
        
        <div class="d-flex flex-column gap-3 mb-4">
          <div class="proficiency-item">
            <div class="d-flex justify-content-between mb-1">
              <span class="proficiency-label">FRONTEND ARCH</span>
              <span class="proficiency-percentage">95%</span>
            </div>
            <div class="proficiency-progress">
              <div class="proficiency-progress-fill" style="width: 95%;"></div>
            </div>
          </div>
          <div class="proficiency-item">
            <div class="d-flex justify-content-between mb-1">
              <span class="proficiency-label">SYSTEMS DESIGN</span>
              <span class="proficiency-percentage">88%</span>
            </div>
            <div class="proficiency-progress">
              <div class="proficiency-progress-fill" style="width: 88%;"></div>
            </div>
          </div>
          <div class="proficiency-item">
            <div class="d-flex justify-content-between mb-1">
              <span class="proficiency-label">DISTRIBUTED DBS</span>
              <span class="proficiency-percentage">72%</span>
            </div>
            <div class="proficiency-progress">
              <div class="proficiency-progress-fill" style="width: 72%;"></div>
            </div>
          </div>
        </div>
        
        <hr class="my-3 border-slate">
        
        <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 0.5px;">LANGUAGES</h6>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="skill in profileSkills" :key="skill" class="language-badge">
            {{ skill }}
          </span>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
}

.profile-hero-card {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  color: var(--color-text);
}

.profile-hero-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--color-purple) 0%, var(--color-primary) 100%);
}

.profile-avatar-wrapper img {
  border: 3px solid var(--color-surface) !important;
  box-shadow: 0 8px 20px -6px var(--color-purple-light);
  transition: all var(--transition-base);
}

.profile-avatar-wrapper:hover img {
  transform: scale(1.02);
  box-shadow: 0 12px 24px -4px var(--color-purple-light);
}

.status-indicator-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background-color: var(--color-success);
  border: 3px solid var(--color-surface) !important;
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--color-success-light);
}

.profile-name {
  color: var(--color-text) !important;
  letter-spacing: -0.5px;
  font-weight: 800;
}

.role-badge-overview {
  display: inline-block;
  background: var(--color-purple-light) !important;
  color: var(--color-purple) !important;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-purple-light) !important;
}

.text-primary-purple {
  color: var(--color-purple) !important;
}

.bio-text {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text-muted) !important;
}

.header-title {
  color: var(--color-text) !important;
  letter-spacing: -0.3px;
}

/* Projects Section */
.project-card-modern-v2 {
  background: var(--color-surface) !important;
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
}

.project-card-modern-v2:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-purple-light) !important;
}

.project-title-v2 {
  font-size: 0.95rem;
  transition: color var(--transition-base);
  color: var(--color-text) !important;
}

.project-card-modern-v2:hover .project-title-v2 {
  color: var(--color-purple) !important;
}

.tag-badge-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-badge-v2.react { background: var(--color-tag-blue-bg) !important; color: var(--color-tag-blue-text) !important; }
.tag-badge-v2.webgpu { background: var(--color-tag-pink-bg) !important; color: var(--color-tag-pink-text) !important; }
.tag-badge-v2.typescript { background: var(--color-tag-indigo-bg) !important; color: var(--color-tag-indigo-text) !important; }
.tag-badge-v2.go { background: var(--color-tag-cyan-bg) !important; color: var(--color-tag-cyan-text) !important; }
.tag-badge-v2.redis { background: var(--color-tag-red-bg) !important; color: var(--color-tag-red-text) !important; }
.tag-badge-v2.grpc { background: var(--color-tag-purple-bg) !important; color: var(--color-tag-purple-text) !important; }

/* Timeline Activity */
.activity-row-modern {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
}

.activity-row-modern:hover {
  border-color: var(--color-purple-light) !important;
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.activity-icon-container {
  width: 38px;
  height: 38px;
  background: var(--color-purple-light) !important;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.small-title {
  font-size: 0.9rem;
  color: var(--color-text) !important;
}

/* Side Info Section */
.proficiency-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-muted);
}

.proficiency-percentage {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-purple);
}

.proficiency-progress {
  height: 6px;
  background: var(--color-surface-hover);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.proficiency-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-purple) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-pill);
  box-shadow: 0 0 8px var(--color-purple-light);
}

.language-badge {
  background: var(--color-tag-indigo-bg);
  color: var(--color-tag-indigo-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  transition: all 0.2s ease;
}

.language-badge:hover {
  background: var(--color-tag-indigo-bg);
  filter: brightness(0.9);
  transform: scale(1.05);
}

.border-slate {
  border-color: var(--color-border-soft);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
