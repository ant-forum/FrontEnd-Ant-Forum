<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/AuthStore";

// Sub-components
import ProfileOverview from "../components/profile/ProfileOverview.vue";
import ProfileProject from "../components/profile/ProfileProject.vue";
import ProfileSetting from "../components/profile/ProfileSetting.vue";

// Stores
const authStore = useAuthStore();
import { useUserProfilesStore } from "../stores/UserProfilesStore";

const userProfilesStore = useUserProfilesStore();

// Tab state: 'profile' | 'projects' | 'settings'
const activeTab = ref("profile");

onMounted(async () => {
  try {
    await userProfilesStore.fetchProfile();
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }
});

const handleProfileSaved = () => {
  // Switch tab back to profile overview dashboard
  activeTab.value = "profile";
};

// Profile Dashboard Dynamic Data from AuthStore (which is globally synced and normalized)
const profileName = computed(() => authStore.user?.username || "");
const profileRole = computed(() => {
  const role = authStore.user?.role || "Student";
  if (role.toLowerCase() === 'mentor') return 'Teacher';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
});
const profileBio = computed(() => "");
const profileGithub = computed(() => "");
const profileLinkedin = computed(() => "");
const profileSkills = computed(() => []);
const profileAvatar = computed(() => authStore.user?.profile_pic || authStore.user?.avatar || "");

// Empty arrays since these are not part of the current API schema
const defaultProjects = ref([]);
const additionalProjects = ref([]);
const activityFeed = ref([]);
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
              <h6 class="mb-0 fw-bold text-truncate" style="font-size: 0.95rem;">{{ profileName }}</h6>
              <small class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ profileRole }}</small>
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
      
      <!-- Main Content Column -->
      <main class="col-lg-9 col-md-8">
        
        <!-- Tab 1: Profile Dashboard -->
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
  background-color: transparent;
  min-height: 90vh;
  font-family: var(--font-family-base);
  color: var(--color-text) !important;
}

/* Sidebar */
.sidebar-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
  color: var(--color-text) !important;
}

.sidebar-user-info {
  background: var(--color-surface-hover) !important;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border) !important;
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
  color: var(--color-text-muted) !important;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all var(--transition-base);
}

.nav-btn-modern:hover {
  background: var(--color-surface-hover) !important;
  color: var(--color-text) !important;
  transform: translateX(2px);
}

.nav-btn-modern.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px -6px var(--color-primary-light);
}

.border-slate {
  border-color: var(--color-border);
}

.btn-new-project {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 6px 16px -4px var(--color-primary-light);
  transition: all var(--transition-base);
}

.btn-new-project:hover {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-purple-hover, #6d28d9) 100%);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -2px var(--color-primary-light);
}

.sidebar-bottom {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
}

.sidebar-link-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.65rem var(--spacing-md);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  text-decoration: none;
}

.sidebar-link-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  transform: translateX(2px);
}

.py-2-5 {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

/* Fade in animation */
.fade-in-content {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
