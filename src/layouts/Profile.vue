<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/AuthStore";
import BaseModal from "../components/base/BaseModal.vue";
import { normalizeSkills } from "../utils/profileFields";

// Sub-components
import ProfileOverview from "../components/profile/ProfileOverview.vue";
import ProfileProject from "../components/profile/ProfileProject.vue";
import ProfileSetting from "../components/profile/ProfileSetting.vue";

// Stores
import { useUserProfilesStore } from "../stores/UserProfilesStore";
import { useForumStore } from "../stores/ForumStore";
import { useProjectStore } from "../stores/ProjectStore";

const authStore = useAuthStore();
const router = useRouter();
const userProfilesStore = useUserProfilesStore();
const forumStore = useForumStore();
const projectStore = useProjectStore();

const activeTab = ref("profile");
const showLogoutModal = ref(false);
const isLoggingOut = ref(false);

const openLogoutModal = () => {
  showLogoutModal.value = true;
};

const closeLogoutModal = () => {
  if (isLoggingOut.value) return;
  showLogoutModal.value = false;
};

const confirmLogout = async () => {
  isLoggingOut.value = true;

  try {
    await authStore.logout();
    showLogoutModal.value = false;
    await router.push("/login");
  } finally {
    isLoggingOut.value = false;
  }
};

onMounted(async () => {
  try {
    await userProfilesStore.fetchProfile();
    await forumStore.fetchDiscussions();
    await projectStore.fetchMyProjects();
  } catch (err) {
    console.error(
      "Failed to load user profile or discussions or projects:",
      err,
    );
  }
});

const selectTab = (tab) => {
  activeTab.value = tab;
};

const openProfileEditor = () => selectTab("edit");
const handleProfileSaved = () => selectTab("profile");

// Profile Dashboard Dynamic Data from AuthStore (which is globally synced and normalized)
const profileFullname = computed(
  () => authStore.user?.fullname || authStore.user?.name || "",
);
const profileName = computed(() => authStore.user?.username || "ANT Developer");
const profileRole = computed(() => {
  const role = authStore.user?.role || "Student";
  if (role.toLowerCase() === "mentor") return "Teacher";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
});
const profileBio = computed(() => authStore.user?.bio || "");
const profileGithub = computed(() => authStore.user?.github || "");
const profileLinkedin = computed(() => authStore.user?.linkedin || "");
const profileSkills = computed(() => normalizeSkills(authStore.user?.skills));
const profileAvatar = computed(() => authStore.user?.profile_pic || "");

// Dynamic user projects loaded via ProjectStore
const defaultProjects = computed(() => {
  return (projectStore.myProjects || []).map((p) => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    stars: p.average_rating || 0,
    tags: p.tags || [],
  }));
});
const additionalProjects = ref([]);

const activityFeed = computed(() => {
  if (!authStore.user) return [];
  const username = authStore.user.username || authStore.user.name;
  if (!username) return [];

  return forumStore.discussions
    .filter((d) => {
      const authorName =
        typeof d.author === "object" && d.author !== null
          ? d.author.username || d.author.name
          : d.author;
      return (authorName || "").toLowerCase() === username.toLowerCase();
    })
    .map((d) => ({
      id: d.id,
      type: "discussion",
      title: d.title,
      meta: `Posted in ${d.category}`,
      icon: "bi-chat-left-text-fill",
      link: `/forum/${d.id}`,
    })); // Pass all activities
});
</script>

<template>
  <Navbar />
  <div class="profile-page">
    <div class="profile-global-grid">
      <main class="profile-main-container">
        <section class="profile-page-header">
          <div>
            <span class="profile-page-kicker">Developer console</span>
            <h1>My Profile</h1>
            <p>Manage your public profile and showcase projects.</p>
          </div>
        </section>

        <nav class="profile-tabs" aria-label="Profile sections">
          <button
            type="button"
            class="profile-tab"
            :class="{ active: activeTab === 'profile' }"
            @click="selectTab('profile')"
          >
            <i class="bi bi-person"></i>
            <span>Overview</span>
          </button>
          <button
            type="button"
            class="profile-tab"
            :class="{ active: activeTab === 'projects' }"
            @click="selectTab('projects')"
          >
            <i class="bi bi-code-slash"></i>
            <span>Projects</span>
          </button>
        </nav>

        <section class="profile-tab-content">
          <!-- Tab 1: Profile Dashboard -->
          <div v-if="activeTab === 'profile'" class="fade-in-content">
            <ProfileOverview
              :profileFullname="profileFullname"
              :profileName="profileName"
              :profileRole="profileRole"
              :profileBio="profileBio"
              :profileGithub="profileGithub"
              :profileLinkedin="profileLinkedin"
              :profileSkills="profileSkills"
              :profileAvatar="profileAvatar"
              :defaultProjects="defaultProjects"
              :activityFeed="activityFeed"
              canEdit
              @edit="openProfileEditor"
            />
          </div>

          <!-- Tab 2: Projects Showcase -->
          <div v-else-if="activeTab === 'projects'" class="fade-in-content">
            <ProfileProject
              :projects="[...defaultProjects, ...additionalProjects]"
            />
          </div>

          <div v-else-if="activeTab === 'edit'" class="fade-in-content">
            <ProfileSetting
              :user="authStore.user || {}"
              @saved="handleProfileSaved"
              @cancel="handleProfileSaved"
            />
          </div>
        </section>
      </main>
    </div>
  </div>

  <Footer />

  <BaseModal
    v-if="showLogoutModal"
    title="Log out of ANT Forum?"
    kicker=""
    icon="bi bi-box-arrow-right"
    theme="danger"
    @closeModal="closeLogoutModal"
  >
    <p class="logout-modal-copy">
      Are you sure you want to log out? You will need to sign in again to access
      your account.
    </p>

    <template #footer>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="isLoggingOut"
        @click="closeLogoutModal"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-danger d-inline-flex align-items-center gap-2"
        :disabled="isLoggingOut"
        @click="confirmLogout"
      >
        <span
          v-if="isLoggingOut"
          class="spinner-border spinner-border-sm"
          aria-hidden="true"
        ></span>
        <span>{{ isLoggingOut ? "Logging out..." : "Logout" }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
}

.profile-global-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px 60px;
}

.profile-main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.profile-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-family: var(--font-family-base);
}

.profile-page-kicker {
  display: block;
  margin-bottom: 6px;
  color: var(--color-blue);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-page-header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.7rem, 3vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.04em;
}

.profile-page-header p {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.logout-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.87rem;
  font-weight: 700;
  transition: all var(--transition-base);
}

.logout-button:hover {
  color: var(--color-danger, #dc3545);
  background: var(--color-surface-hover);
  border-color: rgba(220, 53, 69, 0.35);
}

.profile-tabs {
  display: flex;
  gap: 6px;
  margin-top: 20px;
  padding: 6px;
  overflow-x: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.profile-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  transition: all var(--transition-base);
}

.profile-tab:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.profile-tab.active {
  color: var(--color-blue);
  background: var(--color-blue-light);
}

.profile-tab-content {
  margin-top: 24px;
}

.logout-modal-copy {
  color: var(--color-text-muted);
  margin: 0;
}

/* Fade in animation */
.fade-in-content {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .profile-global-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-global-grid {
    padding: 20px 16px 40px;
  }

  .profile-page-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }
}
</style>
