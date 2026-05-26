<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/auth";

import ProfileOverview from "../components/profile/ProfileOverview.vue";
import ProfileProject from "../components/profile/ProfileProject.vue";
import ProfileSetting from "../components/profile/ProfileSetting.vue";

const authStore = useAuthStore();

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
  
  activeTab.value = "profile";
};

const profileName = computed(() => savedProfile.name || "Alex 'Dev' Rivera");
const profileRole = computed(() => {
  const role = authStore.user?.role || "Student";
  if (role.toLowerCase() === 'mentor') return 'Teacher';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
});
const profileBio = computed(() => savedProfile.bio || "Passionate full-stack architect with 8+ years of experience building scalable distributed systems and open-source ecosystems. Specializing in high-performance React architectures and Go-based microservices. Active contributor to the ANT-Forum core and mentor for emerging tech talent.");
const profileGithub = computed(() => savedProfile.github || "https://github.com");
const profileLinkedin = computed(() => savedProfile.linkedin || "https://linkedin.com");
const profileSkills = computed(() => savedProfile.skills.length > 0 ? savedProfile.skills : ["Rust", "Go", "TypeScript", "Python"]);
const profileAvatar = computed(() => savedAvatarPreview.value || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300");

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
      
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern shadow-sm p-4">
          <div class="sidebar-user-info d-flex align-items-center gap-3 mb-4">
            <img :src="profileAvatar" class="rounded-circle border border-2 border-primary-subtle" width="48" height="48" alt="Profile avatar" style="object-fit: cover;">
            <div class="user-meta overflow-hidden">
              <h6 class="mb-0 fw-bold text-truncate" style="font-size: 0.95rem;">{{ profileName }}</h6>
              <small class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ profileRole }}</small>
            </div>
          </div>
          
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
          
          <router-link to="/showcase/create" class="btn btn-new-project w-100 py-2-5 mb-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2">
            <span>New Project</span>
          </router-link>
          
          <div class="sidebar-bottom d-flex flex-column gap-2">
            <router-link to="/help" class="sidebar-link-btn text-decoration-none">
              <i class="bi bi-question-circle fs-5"></i>
              <span>Help</span>
            </router-link>
            <button @click="authStore.logout()" class="sidebar-link-btn bg-transparent border-0 text-start">
              <i class="bi bi-box-arrow-right fs-5"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      
      <main class="col-lg-9 col-md-8">
        
        <div v-if="activeTab === 'profile'" class="fade-in-content">
          <ProfileOverview
            :profileName="profileName"
            :profileRole="profileRole"
            :profileBio="profileBio"
            :profileGithub="profileGithub"
            :profileLinkedin="profileLinkedin"
            :profileSkills="profileSkills"
            :profileAvatar="profileAvatar"
            :defaultProjects="defaultProjects"
            :activityFeed="activityFeed"
          />
        </div>
        
        <div v-else-if="activeTab === 'projects'" class="fade-in-content">
          <ProfileProject
            :projects="[...defaultProjects, ...additionalProjects]"
          />
        </div>
        
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
  background-color: transparent;
  min-height: 90vh;
  font-family: var(--font-family-base);
  color: #1e293b;
}

.sidebar-card-modern {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04);
}

.sidebar-user-info {
  background: rgba(248, 250, 252, 0.6);
  border-radius: var(--radius-lg);
  border: 1px solid #f1f5f9;
  padding: 0.75rem;
}

.sidebar-nav {
  width: 100%;
}

.nav-btn-modern {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.8rem var(--spacing-md);
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all var(--transition-base);
}

.nav-btn-modern:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateX(2px);
}

.nav-btn-modern.active {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px -6px rgba(124, 58, 237, 0.4);
}

.border-slate {
  border-color: #f1f5f9;
}

.btn-new-project {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 6px 16px -4px rgba(124, 58, 237, 0.35);
  transition: all var(--transition-base);
}

.btn-new-project:hover {
  background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -2px rgba(124, 58, 237, 0.45);
}

.sidebar-bottom {
  border-top: 1px solid #f1f5f9;
  padding-top: var(--spacing-md);
}

.sidebar-link-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.65rem var(--spacing-md);
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  text-decoration: none;
}

.sidebar-link-btn:hover {
  background: #f8fafc;
  color: #7c3aed;
  transform: translateX(2px);
}

.py-2-5 {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.fade-in-content {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
