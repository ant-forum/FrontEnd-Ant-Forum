<template>
  <div class="row g-4">
    <!-- Center Column -->
    <div class="col-xl-8 col-lg-7 d-flex flex-column gap-4">
      <!-- Profile Main Info Card (Hero Banner) -->
      <div class="profile-hero-card p-4">
        <div class="d-flex flex-column flex-sm-row align-items-start gap-4">
          <!-- Big Avatar with Online Badge -->
          <div class="position-relative flex-shrink-0 profile-avatar-wrapper">
            <img
              v-if="profileAvatar"
              :src="profileAvatar"
              class="rounded-4 object-fit-cover shadow-sm"
              width="120"
              height="120"
              alt="Developer avatar"
            >
            <div v-else class="profile-avatar-fallback rounded-4" aria-label="Developer avatar">
              {{ profileInitials }}
            </div>
            <span class="status-indicator-dot"></span>
          </div>
          
          <!-- Info Block -->
          <div class="flex-grow-1">
            <div class="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-2">
              <div>
                <h3 v-if="profileFullname" class="fw-bold mb-0 profile-name">{{ profileFullname }}</h3>
                <h3 v-else class="fw-bold mb-0 profile-name">{{ profileName }}</h3>
                <div class="d-flex align-items-center gap-2 mt-1 mb-2">
                  <span class="text-muted fw-semibold">@{{ profileName }}</span>
                  <span class="role-badge-overview">{{ profileRole }}</span>
                </div>
              </div>
              <button v-if="canEdit" type="button" class="btn-edit-profile" @click="emit('edit')">
                <i class="bi bi-pencil-square"></i>
                <span>Edit Profile</span>
              </button>
            </div>
            <!-- Description -->
            <p class="bio-text text-muted mb-0 mt-3 pt-1 border-top border-slate text-break">
              {{ profileBio || "Share your background, interests, and what you are building with the ANT Forum community." }}
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
                  <router-link :to="'/showcase/' + project.id" class="text-decoration-none">
                    <h6 class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
                  </router-link>
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
          <div v-if="defaultProjects.length === 0" class="col-12">
            <div class="empty-state-card">
              <i class="bi bi-code-square"></i>
              <div>
                <h6>No featured projects yet</h6>
                <p>Submit your first project to start building your developer showcase.</p>
              </div>
              <router-link to="/showcase/create">Submit project</router-link>
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
          <div v-for="activity in displayedActivities" :key="activity.id || activity.title" 
               class="activity-row-modern p-3 d-flex align-items-center gap-3"
               style="cursor: pointer;"
               @click="activity.link ? router.push(activity.link) : null">
            <div class="activity-icon-container">
              <i :class="['bi', activity.icon, 'text-primary-purple']"></i>
            </div>
            <div class="overflow-hidden">
              <h6 class="mb-1 fw-bold themed-text text-truncate small-title">{{ activity.title }}</h6>
              <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ activity.meta }}</small>
            </div>
          </div>
          
          <button v-if="activityFeed.length > 3" 
                  @click="showAllActivities = !showAllActivities" 
                  class="btn btn-sm btn-outline-secondary mt-2 border-0 fw-bold themed-text">
            {{ showAllActivities ? 'Show Less' : `View All Activity (${activityFeed.length})` }}
          </button>
          <div v-if="activityFeed.length === 0" class="empty-state-card">
            <i class="bi bi-clock-history"></i>
            <div>
              <h6>No recent activity</h6>
              <p>Your forum participation and project updates will appear here.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Right Column: Profile Snapshot -->
    <div class="col-xl-4 col-lg-5 d-flex flex-column gap-4">
      <div class="dashboard-card-modern p-4">
        <h6 class="themed-text fw-bold mb-3 snapshot-heading">Profile Snapshot</h6>

        <div class="snapshot-grid">
          <div class="snapshot-item">
            <strong>{{ defaultProjects.length }}</strong>
            <span>Projects</span>
          </div>
          <div class="snapshot-item">
            <strong>{{ activityFeed.length }}</strong>
            <span>Activities</span>
          </div>
          <div class="snapshot-item">
            <strong>{{ profileSkills.length }}</strong>
            <span>Skills</span>
          </div>
        </div>

        <hr class="my-3 border-slate">

        <h6 class="text-muted text-uppercase fw-bold mb-3 skills-heading">Skills</h6>
        <div v-if="profileSkills.length" class="d-flex flex-wrap gap-2">
          <span v-for="skill in profileSkills" :key="skill" class="language-badge">
            {{ skill }}
          </span>
        </div>
        <p v-else class="empty-skills-copy">Add skills to help the community understand your strengths.</p>
        
        <hr class="my-3 border-slate">

        <h6 class="text-muted text-uppercase fw-bold mb-3 skills-heading">Social Links</h6>
        <div v-if="userProfilesStore.socialLinks.length" class="d-flex flex-wrap gap-2">
          <a v-for="link in userProfilesStore.socialLinks" :key="link.id" :href="link.url" target="_blank" class="social-icon-btn d-flex align-items-center justify-content-center rounded-circle text-decoration-none" :title="link.platform">
            <i :class="getPlatformIcon(link.platform)"></i>
          </a>
        </div>
        <p v-else class="empty-skills-copy">No social links added yet.</p>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserProfilesStore } from "../../stores/UserProfilesStore";

const router = useRouter();
const userProfilesStore = useUserProfilesStore();
const showAllActivities = ref(false);
const props = defineProps({
  profileFullname: { type: String, default: "" },
  profileName: { type: String, required: true },
  profileRole: { type: String, default: "Student" },
  profileBio: { type: String, required: true },
  profileGithub: { type: String, required: true },
  profileLinkedin: { type: String, required: true },
  profileSkills: { type: Array, required: true },
  profileAvatar: { type: String, required: true },
  defaultProjects: { type: Array, required: true },
  activityFeed: { type: Array, required: true },
  canEdit: { type: Boolean, default: false },
});

const emit = defineEmits(["edit"]);

const profileInitials = computed(() => {
  const nameToUse = props.profileFullname || props.profileName;
  return nameToUse
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase() || "A";
});

const getPlatformIcon = (platformStr) => {
  const p = (platformStr || '').toLowerCase();
  if (p.includes('linkedin')) return 'bi-linkedin';
  if (p.includes('github')) return 'bi-github';
  if (p.includes('twitter') || p.includes('x')) return 'bi-twitter-x';
  if (p.includes('facebook')) return 'bi-facebook';
  if (p.includes('instagram')) return 'bi-instagram';
  if (p.includes('youtube')) return 'bi-youtube';
  if (p.includes('discord')) return 'bi-discord';
  if (p.includes('tiktok')) return 'bi-tiktok';
  return 'bi-link-45deg';
};

const displayedActivities = computed(() => {
  return showAllActivities.value ? props.activityFeed : props.activityFeed.slice(0, 3);
});
</script>

<style scoped>
.social-icon-btn {
  width: 40px;
  height: 40px;
  color: var(--color-purple);
  background: var(--color-purple-light);
  font-size: 1.1rem;
  transition: all var(--transition-base);
}

.social-icon-btn:hover {
  background: var(--color-purple);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -2px var(--color-purple-light);
}

.dashboard-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);
}

.profile-hero-card {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
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

.profile-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--color-purple) 0%, var(--color-primary) 100%);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  box-shadow: 0 8px 20px -6px var(--color-purple-light);
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

.btn-edit-profile {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  color: var(--color-purple);
  background: var(--color-purple-light);
  border: 1px solid var(--color-purple-light);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  transition: all var(--transition-base);
}

.btn-edit-profile:hover {
  color: #ffffff;
  background: var(--color-purple);
  border-color: var(--color-purple);
  transform: translateY(-1px);
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
  border-radius: var(--radius-md);
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
.snapshot-heading {
  font-size: 0.9rem;
  letter-spacing: 0.3px;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.snapshot-item {
  padding: 12px 6px;
  text-align: center;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.snapshot-item strong,
.snapshot-item span {
  display: block;
}

.snapshot-item strong {
  color: var(--color-purple);
  font-size: 1.1rem;
}

.snapshot-item span {
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 700;
}

.skills-heading {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.empty-skills-copy {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.83rem;
  line-height: 1.5;
}

.empty-state-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 12px;
}

.empty-state-card i {
  flex-shrink: 0;
  color: var(--color-purple);
  font-size: 1.35rem;
}

.empty-state-card h6,
.empty-state-card p {
  margin: 0;
}

.empty-state-card h6 {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 700;
}

.empty-state-card p {
  margin-top: 3px;
  font-size: 0.82rem;
}

.empty-state-card a {
  margin-left: auto;
  color: var(--color-purple);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.empty-state-card a:hover {
  text-decoration: underline;
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

@media (max-width: 640px) {
  .empty-state-card {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .empty-state-card a {
    width: 100%;
    margin-left: 0;
  }
}
</style>
