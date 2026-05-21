<script setup>
import { defineProps } from "vue";

const props = defineProps({
  profileName: { type: String, required: true },
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
      <!-- Profile Main Info Card -->
      <div class="dashboard-card-modern p-4">
        <div class="d-flex flex-column flex-sm-row align-items-start gap-4">
          <!-- Big Avatar with Online Badge -->
          <div class="position-relative flex-shrink-0">
            <img :src="profileAvatar" class="rounded-3 object-fit-cover shadow-sm border border-3 border-white" width="130" height="130" alt="Developer Avatar">
            <span class="status-indicator-dot"></span>
          </div>
          
          <!-- Info Block -->
          <div class="flex-grow-1">
            <div class="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-3">
              <div>
                <h3 class="fw-bold mb-1 profile-name">{{ profileName }}</h3>
                <span class="text-primary-purple fw-semibold" style="font-size: 0.95rem;">Full-Stack Architect</span>
              </div>
              <!-- Action Buttons -->
              <div class="d-flex gap-2">
                <a :href="profileGithub" target="_blank" class="btn btn-social-icon shadow-sm" title="GitHub">
                  <i class="bi bi-link-45deg"></i>
                </a>
                <a :href="profileLinkedin" target="_blank" class="btn btn-social-icon shadow-sm" title="LinkedIn">
                  <i class="bi bi-youtube"></i>
                </a>
                <button class="btn btn-follow px-4 fw-bold shadow-sm">Follow</button>
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
          <h5 class="mb-0 fw-bold">Featured Projects</h5>
        </div>
        
        <div class="row g-3">
          <div v-for="project in defaultProjects" :key="project.title" class="col-md-6">
            <div class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="fw-bold mb-0 text-dark project-title-v2">{{ project.title }}</h6>
                  <span class="d-flex align-items-center gap-1 text-muted small"><i class="bi bi-star"></i> {{ project.stars }}</span>
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
          <h5 class="mb-0 fw-bold">Recent Activity</h5>
        </div>
        
        <div class="d-flex flex-column gap-3">
          <div v-for="activity in activityFeed" :key="activity.title" class="activity-row-modern p-3 shadow-sm d-flex align-items-center gap-3">
            <div class="activity-icon-container">
              <i :class="['bi', activity.icon, 'text-primary-purple']"></i>
            </div>
            <div class="overflow-hidden">
              <h6 class="mb-1 fw-bold text-dark text-truncate small-title">{{ activity.title }}</h6>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ activity.meta }}</small>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Right Column: Vitals & Skills -->
    <div class="col-xl-4 col-lg-5 d-flex flex-column gap-4">
      <!-- Vitals Card -->
      <div class="dashboard-card-modern p-4">
        <h6 class="text-muted text-uppercase fw-bold mb-4" style="font-size: 0.75rem; letter-spacing: 1px;">Vitals</h6>
        
        <div class="row g-4">
          <div class="col-6">
            <div class="vital-item">
              <span class="vital-number">42</span>
              <span class="vital-label">PROJECTS</span>
            </div>
          </div>
          <div class="col-6">
            <div class="vital-item">
              <span class="vital-number">1.2k</span>
              <span class="vital-label">COMMITS</span>
            </div>
          </div>
          <div class="col-6">
            <div class="vital-item">
              <span class="vital-number">4.8k</span>
              <span class="vital-label">REPUTATION</span>
            </div>
          </div>
          <div class="col-6">
            <div class="vital-item">
              <span class="vital-number">Lvl 8</span>
              <span class="vital-label">MENTOR</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stack Proficiency -->
      <div class="dashboard-card-modern p-4">
        <h6 class="text-dark fw-bold mb-4" style="font-size: 0.9rem;">Stack Proficiency</h6>
        
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
      
      <!-- Achievements -->
      <div class="dashboard-card-modern p-4">
        <h6 class="text-dark fw-bold mb-3" style="font-size: 0.9rem;">Achievements</h6>
        
        <div class="d-flex gap-3 justify-content-start">
          <div class="achievement-icon-circle bg-purple-subtle" title="Verified Contributor">
            <i class="bi bi-patch-check-fill text-purple"></i>
          </div>
          <div class="achievement-icon-circle bg-rose-subtle" title="Bug Hunter">
            <i class="bi bi-bug-fill text-rose"></i>
          </div>
          <div class="achievement-icon-circle bg-green-subtle" title="Mentor">
            <i class="bi bi-mortarboard-fill text-green"></i>
          </div>
          <div class="achievement-icon-circle bg-blue-subtle" title="Top Contributor">
            <i class="bi bi-trophy-fill text-blue"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-modern {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.status-indicator-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background-color: #10b981;
  border: 3px solid #ffffff;
  border-radius: 50%;
}

.profile-name {
  color: #0f172a;
  letter-spacing: -0.5px;
}

.text-primary-purple {
  color: #7c3aed;
}

.btn-social-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 1.1rem;
  transition: all var(--transition-base);
}

.btn-social-icon:hover {
  background: #f8fafc;
  color: #7c3aed;
  border-color: #ddd6fe;
}

.btn-follow {
  background: #7c3aed;
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.btn-follow:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

.bio-text {
  font-size: 0.95rem;
  line-height: 1.6;
}

.project-card-modern-v2 {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.project-card-modern-v2:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md) !important;
  border-color: #ddd6fe;
}

.project-title-v2 {
  transition: color var(--transition-base);
}

.project-card-modern-v2:hover .project-title-v2 {
  color: #7c3aed !important;
}

.tag-badge-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-badge-v2.react { background: #e0f2fe; color: #0369a1; }
.tag-badge-v2.webgpu { background: #fdf2f8; color: #be185d; }
.tag-badge-v2.typescript { background: #eff6ff; color: #1d4ed8; }
.tag-badge-v2.go { background: #ecfeff; color: #0891b2; }
.tag-badge-v2.redis { background: #fef2f2; color: #dc2626; }
.tag-badge-v2.grpc { background: #f5f3ff; color: #6d28d9; }

.activity-row-modern {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.activity-row-modern:hover {
  border-color: #ddd6fe;
  transform: translateX(4px);
}

.activity-icon-container {
  width: 36px;
  height: 36px;
  background: #f5f3ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.small-title {
  font-size: 0.9rem;
}

.vital-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.vital-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: #7c3aed;
  line-height: 1.1;
}

.vital-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.proficiency-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
}

.proficiency-percentage {
  font-size: 0.75rem;
  font-weight: 800;
  color: #7c3aed;
}

.proficiency-progress {
  height: 8px;
  background: #f1f5f9;
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.proficiency-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
  border-radius: var(--radius-pill);
}

.language-badge {
  background: #eff6ff;
  color: #1e40af;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}

.achievement-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: transform var(--transition-fast);
  cursor: help;
}

.achievement-icon-circle:hover {
  transform: scale(1.1);
}

.bg-purple-subtle { background-color: #f3e8ff; }
.bg-rose-subtle { background-color: #ffe4e6; }
.bg-green-subtle { background-color: #dcfce7; }
.bg-blue-subtle { background-color: #dbeafe; }

.text-purple { color: #8b5cf6; }
.text-rose { color: #f43f5e; }
.text-green { color: #22c55e; }
.text-blue { color: #3b82f6; }

.border-slate {
  border-color: #f1f5f9;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
