<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/auth";

// Sub-components
import ProfileOverview from "../components/profile/ProfileOverview.vue";
import ProfileProject from "../components/profile/ProfileProject.vue";
import ProfileSetting from "../components/profile/ProfileSetting.vue";

// Auth Store
const authStore = useAuthStore();

// Tab state: 'profile' | 'projects' | 'settings'
const activeTab = ref("profile");

const savedAvatarPreview = ref("");
const savedProfile = reactive({
  name: "",
  bio: "",
  github: "",
  linkedin: "",
  skills: [],
});

const loadSavedProfile = () => {
  const user = authStore.user || {};
  savedProfile.name = user.name || "";
  savedProfile.bio = user.bio || "";
  savedProfile.github = user.github || "";
  savedProfile.linkedin = user.linkedin || "";
  savedProfile.skills = Array.isArray(user.skills) ? [...user.skills] : [];
  savedAvatarPreview.value = user.avatar || user.avatarUrl || "";
};

onMounted(loadSavedProfile);

const handleProfileSaved = (updatedUser) => {
  savedProfile.name = updatedUser.name;
  savedProfile.bio = updatedUser.bio;
  savedProfile.github = updatedUser.github;
  savedProfile.linkedin = updatedUser.linkedin;
  savedProfile.skills = Array.isArray(updatedUser.skills) ? [...updatedUser.skills] : [];
  savedAvatarPreview.value = updatedUser.avatar || updatedUser.avatarUrl || "";
  
  // Switch tab back to profile overview dashboard
  activeTab.value = "profile";
};

// Profile Dashboard Dynamic Data / Mock Data
const profileName = computed(() => savedProfile.name || "Alex 'Dev' Rivera");
const profileBio = computed(() => savedProfile.bio || "Passionate full-stack architect with 8+ years of experience building scalable distributed systems and open-source ecosystems. Specializing in high-performance React architectures and Go-based microservices. Active contributor to the ANT-Forum core and mentor for emerging tech talent.");
const profileGithub = computed(() => savedProfile.github || "https://github.com");
const profileLinkedin = computed(() => savedProfile.linkedin || "https://linkedin.com");
const profileSkills = computed(() => savedProfile.skills.length > 0 ? savedProfile.skills : ["Rust", "Go", "TypeScript", "Python"]);
const profileAvatar = computed(() => savedAvatarPreview.value || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300");

// Default Showcase Projects (matches screenshot)
const defaultProjects = [
  {
    title: "Nexus UI Engine",
    stars: "2.4k",
    desc: "A low-latency rendering engine for technical dashboards and real-time data visualization systems.",
    tags: ["REACT", "WEBGPU", "TYPESCRIPT"]
  },
  {
    title: "ANT-Gateway",
    stars: "842",
    desc: "High-performance API gateway and authentication layer optimized for the ANT-Forum ecosystem.",
    tags: ["GO", "REDIS", "GRPC"]
  }
];

// Additional Projects for Showcase tab
const additionalProjects = [
  {
    title: "Aether OS Gateway",
    stars: "1.2k",
    desc: "Microservices API gateway designed for low-latency financial systems.",
    tags: ["NODE.JS", "REDIS", "GRAPHQL"]
  },
  {
    title: "Lumina Design System",
    stars: "3.4k",
    desc: "A comprehensive suite of accessible React components for scale.",
    tags: ["REACT", "TAILWIND", "STORYBOOK"]
  }
];

// Activity Feed (matches screenshot)
const activityFeed = [
  {
    type: "discussion",
    title: "How to optimize SSR in large-scale Next.js apps?",
    meta: "FORUM DISCUSSION • 2H AGO • 48 COMMENTS",
    icon: "bi-chat-left-text"
  },
  {
    type: "merge",
    title: "Merge pull request #452: Implement dynamic layout slots",
    meta: "REPOSITORY: ANT-UI • 1D AGO",
    icon: "bi-git"
  }
];
</script>

<template>
  <Navbar />
  
  <div class="container profile-dashboard py-4">
    <div class="row g-4">
      
      <!-- Left Sidebar Column -->
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern shadow-sm p-4">
          <!-- Sidebar Header: User Info -->
          <div class="sidebar-user-info d-flex align-items-center gap-3 mb-4">
            <img :src="profileAvatar" class="rounded-circle border border-2 border-primary-subtle" width="48" height="48" alt="Profile avatar" style="object-fit: cover;">
            <div class="user-meta overflow-hidden">
              <h6 class="mb-0 fw-bold text-truncate" style="font-size: 0.95rem;">DevProfile</h6>
              <small class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">Technical Contributor</small>
            </div>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="sidebar-nav mb-4">
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <button 
                  @click="activeTab = 'profile'" 
                  class="nav-btn-modern" 
                  :class="{ 'active': activeTab === 'profile' }"
                >
                  <i class="bi bi-person-fill fs-5"></i>
                  <span>Profile</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeTab = 'projects'" 
                  class="nav-btn-modern" 
                  :class="{ 'active': activeTab === 'projects' }"
                >
                  <i class="bi bi-folder-fill fs-5"></i>
                  <span>Projects</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeTab = 'settings'" 
                  class="nav-btn-modern" 
                  :class="{ 'active': activeTab === 'settings' }"
                >
                  <i class="bi bi-gear-fill fs-5"></i>
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <hr class="my-4 border-slate">
          
          <!-- New Project Button -->
          <router-link to="/showcase/create" class="btn btn-new-project w-100 py-2-5 mb-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
            <span>New Project</span>
          </router-link>
          
          <!-- Bottom actions sticking to bottom -->
          <div class="sidebar-bottom d-flex flex-column gap-2">
            <a href="#" class="sidebar-link-btn text-decoration-none">
              <i class="bi bi-question-circle fs-5"></i>
              <span>Help</span>
            </a>
            <button @click="authStore.logout()" class="sidebar-link-btn bg-transparent border-0 text-start">
              <i class="bi bi-box-arrow-right fs-5"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      <!-- Main Content Column -->
      <main class="col-lg-9 col-md-8">
        
        <!-- Tab 1: Profile Dashboard -->
        <div v-if="activeTab === 'profile'" class="fade-in-content">
          <ProfileOverview
            :profileName="profileName"
            :profileBio="profileBio"
            :profileGithub="profileGithub"
            :profileLinkedin="profileLinkedin"
            :profileSkills="profileSkills"
            :profileAvatar="profileAvatar"
            :defaultProjects="defaultProjects"
            :activityFeed="activityFeed"
          />
        </div>
        
        <!-- Tab 2: Projects Showcase -->
        <div v-else-if="activeTab === 'projects'" class="fade-in-content">
          <ProfileProject
            :projects="[...defaultProjects, ...additionalProjects]"
          />
        </div>
        
        <!-- Tab 3: Settings (Edit Form) -->
        <div v-else-if="activeTab === 'settings'" class="fade-in-content">
          <ProfileSetting
            :user="authStore.user || {}"
            @saved="handleProfileSaved"
          />
        </div>
        
      </main>
      
    </div>
  </div>
  
  <Footer />
</template>

<style scoped>
.profile-dashboard {
  max-width: 1280px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 90vh;
  font-family: var(--font-family-base);
  color: #1e293b;
}

/* Sidebar */
.sidebar-card-modern {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  width: 100%;
}

.nav-btn-modern {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.75rem var(--spacing-md);
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all var(--transition-base);
}

.nav-btn-modern:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-btn-modern.active {
  background: #7c3aed;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}

.border-slate {
  border-color: #f1f5f9;
}

.btn-new-project {
  background: #7c3aed;
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-new-project:hover {
  background: #6d28d9;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
}

.sidebar-bottom {
  border-top: 1px solid #f1f5f9;
  padding-top: var(--spacing-md);
}

.sidebar-link-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.6rem var(--spacing-md);
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  text-decoration: none;
}

.sidebar-link-btn:hover {
  background: #f8fafc;
  color: #7c3aed;
}

.py-2-5 {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

/* Fade in animation */
.fade-in-content {
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
