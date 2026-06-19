<template>
  <Navbar />

  <div class="container profile-dashboard py-4">
    <!-- Skeleton loader state -->
    <div v-if="isLoading" class="row g-4 fade-in-content">
      <!-- Left Skeleton -->
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern p-4">
          <div
            class="skeleton-shimmer rounded-circle mb-4 mx-auto"
            style="width: 80px; height: 80px"
          ></div>
          <div
            class="skeleton-shimmer rounded mb-2 w-75 mx-auto"
            style="height: 18px"
          ></div>
          <div
            class="skeleton-shimmer rounded w-50 mx-auto mb-4"
            style="height: 12px"
          ></div>
          <hr class="my-4 border-slate" />
          <div class="skeleton-shimmer rounded mb-2" style="height: 32px"></div>
          <div class="skeleton-shimmer rounded" style="height: 32px"></div>
        </div>
      </aside>
      <!-- Right Skeleton -->
      <main class="col-lg-9 col-md-8">
        <div class="dashboard-card-modern p-4 mb-4">
          <div
            class="skeleton-shimmer rounded mb-3 w-50"
            style="height: 24px"
          ></div>
          <div
            class="skeleton-shimmer rounded mb-2 w-100"
            style="height: 14px"
          ></div>
          <div class="skeleton-shimmer rounded w-75" style="height: 14px"></div>
        </div>
      </main>
    </div>

    <!-- Loaded profile state -->
    <div v-else class="row g-4 fade-in-content">
      <!-- Left Sidebar Column -->
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern shadow-sm p-4">
          <!-- Back button -->
          <button
            @click="router.back()"
            class="btn-back-profile mb-4 d-inline-flex align-items-center gap-2 border-0 bg-transparent text-muted small fw-bold ps-0"
          >
            <i class="bi bi-arrow-left"></i>
            <span>Go Back</span>
          </button>

          <!-- Sidebar Header: User Info -->
          <div
            class="sidebar-user-info d-flex flex-column align-items-center text-center gap-2 mb-4"
          >
            <div class="avatar-wrapper mb-2">
              <img
                :src="profile.avatar"
                class="avatar-img"
                alt="Profile avatar"
              />
              <span class="status-indicator-dot"></span>
            </div>
            <div class="user-meta overflow-hidden w-100">
              <h5
                class="mb-0 fw-bold text-truncate"
                style="font-size: 1.1rem; color: var(--color-text)"
              >
                {{ profile.name }}
              </h5>
              <div class="text-muted small mb-2">{{ profile.username }}</div>
              <span class="role-badge-sidebar mb-2 d-inline-block">{{
                profile.role
              }}</span>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="sidebar-nav mb-4">
            <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <button
                  @click="activeTab = 'profile'"
                  class="nav-btn-modern"
                  :class="{ active: activeTab === 'profile' }"
                >
                  <i class="bi bi-person-fill fs-5"></i>
                  <span>About Profile</span>
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'projects'"
                  class="nav-btn-modern"
                  :class="{ active: activeTab === 'projects' }"
                >
                  <i class="bi bi-folder-fill fs-5"></i>
                  <span>Showcase Projects ({{ profile.projects.length }})</span>
                </button>
              </li>
            </ul>
          </nav>

          <hr class="my-3 border-slate" />
        </div>
      </aside>

      <!-- Main Content Column -->
      <main class="col-lg-9 col-md-8">
        <!-- Tab 1: Profile Overview -->
        <div v-if="activeTab === 'profile'" class="fade-in-content">
          <div class="row g-4">
            <!-- Left Info Block -->
            <div class="col-xl-8 col-lg-7 d-flex flex-column gap-4">
              <!-- Biography -->
              <div
                class="profile-hero-card p-4 position-relative overflow-hidden"
              >
                <div class="bio-quote-icon">
                  <i class="bi bi-quote"></i>
                </div>
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="heading-accent"></div>
                  <h5 class="fw-bold mb-0 themed-text">Biography</h5>
                </div>
                <p class="bio-text text-muted mb-4">
                  {{ profile.bio }}
                </p>
                <div class="row g-3 bio-meta-grid pt-3 border-top border-slate">
                  <div class="col-6 col-sm-4">
                    <div class="meta-item-box">
                      <span class="meta-label">ROLE</span>
                      <span class="meta-value">{{ profile.role }}</span>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="meta-item-box">
                      <span class="meta-label">STATUS</span>
                      <span
                        class="meta-value text-success d-flex align-items-center gap-1"
                      >
                        <span class="status-pulse-dot"></span> Active
                      </span>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="meta-item-box">
                      <span class="meta-label">COMMUNITY</span>
                      <span class="meta-value">ANT Ecosystem</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Showcase Projects Brief -->
              <div class="featured-projects-section">
                <div
                  class="d-flex align-items-center justify-content-between mb-3"
                >
                  <div class="d-flex align-items-center gap-2">
                    <i
                      class="bi bi-rocket-takeoff text-primary-purple fs-4"
                    ></i>
                    <h5 class="mb-0 fw-bold header-title themed-text">
                      Showcase Projects
                    </h5>
                  </div>
                  <button
                    v-if="profile.projects.length > 0"
                    @click="activeTab = 'projects'"
                    class="btn btn-link-premium p-0 text-decoration-none"
                  >
                    View All
                  </button>
                </div>

                <div
                  v-if="profile.projects.length === 0"
                  class="card-empty-state p-4 text-center"
                >
                  <i
                    class="bi bi-folder2-open text-muted fs-3 mb-2 d-block"
                  ></i>
                  <span class="text-muted small"
                    >No showcased projects created yet.</span
                  >
                </div>

                <div v-else class="row g-3">
                  <div
                    v-for="project in profile.projects.slice(0, 2)"
                    :key="project.title"
                    class="col-md-6"
                  >
                    <div
                      class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between"
                      @click="
                        router.push(`/showcase/${project.id || project.title}`)
                      "
                    >
                      <div>
                        <div
                          class="d-flex justify-content-between align-items-start mb-3"
                        >
                          <div class="project-icon-box">
                            <i
                              class="bi bi-folder2-open text-primary-purple"
                            ></i>
                          </div>
                          <span class="star-badge"
                            ><i class="bi bi-star-fill text-warning"></i>
                            {{ project.stars }}</span
                          >
                        </div>
                        <h6 class="fw-bold mb-2 themed-text project-title-v2">
                          {{ project.title }}
                        </h6>
                        <p class="text-muted small mb-4 line-clamp-3">
                          {{ project.desc }}
                        </p>
                      </div>

                      <div class="d-flex flex-wrap gap-2">
                        <span
                          v-for="tag in project.tags"
                          :key="tag"
                          class="tag-badge-v2"
                          :class="tag.toLowerCase()"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Activities -->
              <div class="recent-activity-section">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <i class="bi bi-clock-history text-primary-purple fs-4"></i>
                  <h5 class="mb-0 fw-bold header-title themed-text">
                    Recent Feed Activity
                  </h5>
                </div>

                <div
                  v-if="profile.activity.length === 0"
                  class="card-empty-state p-4 text-center"
                >
                  <i class="bi bi-activity text-muted fs-3 mb-2 d-block"></i>
                  <span class="text-muted small"
                    >No recent forum activity recorded.</span
                  >
                </div>

                <div v-else class="d-flex flex-column gap-3">
                  <div
                    v-for="act in profile.activity"
                    :key="act.id || act.title"
                    class="activity-row-modern p-3 d-flex align-items-center gap-3"
                    style="cursor: pointer"
                    @click="act.link ? router.push(act.link) : null"
                  >
                    <div class="activity-icon-container">
                      <i :class="['bi', act.icon, 'text-primary-purple']"></i>
                    </div>
                    <div class="overflow-hidden">
                      <h6
                        class="mb-1 fw-bold themed-text text-truncate small-title"
                      >
                        {{ act.title }}
                      </h6>
                      <small
                        class="text-muted text-uppercase fw-semibold"
                        style="font-size: 0.65rem; letter-spacing: 0.5px"
                        >{{ act.meta }}</small
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Info Block -->
            <div class="col-xl-4 col-lg-5 d-flex flex-column gap-4">
              <!-- Stack Proficiency -->
              <div class="dashboard-card-modern p-4">
                <div class="d-flex align-items-center gap-2 mb-4">
                  <div class="heading-accent"></div>
                  <h6
                    class="themed-text fw-bold mb-0"
                    style="font-size: 0.9rem; letter-spacing: 0.3px"
                  >
                    Platform Statistics
                  </h6>
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <div class="stat-card-mini text-center p-3">
                      <div class="stat-icon mx-auto mb-2 rep-icon">
                        <i class="bi bi-award-fill"></i>
                      </div>
                      <div class="stat-num">1.2k</div>
                      <div class="stat-label">REPUTATION</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-card-mini text-center p-3">
                      <div class="stat-icon mx-auto mb-2 engage-icon">
                        <i class="bi bi-lightning-charge-fill"></i>
                      </div>
                      <div class="stat-num">92%</div>
                      <div class="stat-label">ENGAGEMENT</div>
                    </div>
                  </div>
                </div>

                <hr class="my-3 border-slate" />

                <h6
                  class="text-muted text-uppercase fw-bold mb-3"
                  style="font-size: 0.7rem; letter-spacing: 0.5px"
                >
                  LANGUAGES & STACK
                </h6>
                <div class="d-flex flex-wrap gap-2">
                  <span
                    v-for="skill in profile.skills"
                    :key="skill"
                    class="language-badge"
                  >
                    {{ skill }}
                  </span>
                </div>

                <hr class="my-3 border-slate" />

                <div
                  class="d-flex align-items-center justify-content-between mb-3"
                >
                  <h6
                    class="text-muted text-uppercase fw-bold mb-0"
                    style="font-size: 0.7rem; letter-spacing: 0.5px"
                  >
                    SOCIAL LINKS
                  </h6>
                  <button
                    v-if="isOwnProfile"
                    @click="showSocialModal = true"
                    class="btn btn-sm btn-link text-primary-purple p-0 text-decoration-none"
                    style="font-size: 0.8rem"
                  >
                    <i class="bi bi-pencil-square"></i> Manage
                  </button>
                </div>

                <div v-if="socialLinks.length === 0" class="text-muted small">
                  No social links added.
                </div>
                <div v-else class="d-flex flex-wrap gap-3">
                  <a
                    v-for="link in socialLinks"
                    :key="link.id"
                    :href="link.url"
                    target="_blank"
                    class="social-icon-btn d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                    :title="link.platform"
                  >
                    <i :class="getPlatformIcon(link.platform)"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Projects Showcase -->
        <div v-else-if="activeTab === 'projects'" class="fade-in-content">
          <div class="dashboard-card-modern p-4 mb-4">
            <h4 class="fw-bold mb-2 header-title themed-text">
              {{ profile.name }}'s Projects
            </h4>
            <p class="text-muted mb-0 subtitle-text">
              Showcase of web application architectures, system designs, and
              microservices.
            </p>
          </div>

          <div
            v-if="profile.projects.length === 0"
            class="card-empty-state p-5 text-center bg-surface border rounded-4"
          >
            <i class="bi bi-folder2-open text-muted fs-1 mb-3 d-block"></i>
            <h5 class="fw-bold themed-text">No Projects Showcase</h5>
            <p class="text-muted small">
              This developer has not added any projects to their showcase folder
              yet.
            </p>
          </div>

          <div v-else class="row g-4">
            <div
              v-for="project in profile.projects"
              :key="project.title"
              class="col-md-6 col-lg-4"
            >
              <div
                class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between"
                @click="router.push(`/showcase/${project.id || project.title}`)"
              >
                <div>
                  <div
                    class="d-flex justify-content-between align-items-start mb-3"
                  >
                    <div class="project-icon-box">
                      <i class="bi bi-folder2-open text-primary-purple"></i>
                    </div>
                    <span class="star-badge"
                      ><i class="bi bi-star-fill text-warning"></i>
                      {{ project.stars }}</span
                    >
                  </div>
                  <h6 class="fw-bold mb-2 themed-text project-title-v2">
                    {{ project.title }}
                  </h6>
                  <p class="text-muted small mb-4 line-clamp-3">
                    {{ project.desc }}
                  </p>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <span
                    v-for="tag in project.tags"
                    :key="tag"
                    class="tag-badge-v2"
                    :class="tag.toLowerCase()"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Footer />

  <!-- Social Links Management Modal -->
  <BaseModal
    v-if="showSocialModal"
    title="Manage Social Links"
    @closeModal="showSocialModal = false"
  >
    <div class="mb-4">
      <h6 class="mb-3 fw-bold themed-text">Add New Link</h6>
      <div class="d-flex gap-2 mb-2">
        <input
          v-model="newSocialPlatform"
          type="text"
          class="form-control"
          placeholder="Platform (e.g. LinkedIn)"
        />
        <input
          v-model="newSocialUrl"
          type="text"
          class="form-control"
          placeholder="URL (https://...)"
        />
      </div>
      <button
        class="btn btn-primary w-100"
        style="background: var(--color-primary-purple); border: none"
        :disabled="!newSocialPlatform || !newSocialUrl || isAddingSocial"
        @click="addSocialLink"
      >
        {{ isAddingSocial ? "Adding..." : "Add Social Link" }}
      </button>
    </div>

    <hr class="border-slate my-4" />

    <h6 class="mb-3 fw-bold themed-text">Your Links</h6>
    <div v-if="socialLinks.length === 0" class="text-muted small">
      You haven't added any social links yet.
    </div>
    <div v-else class="d-flex flex-column gap-2">
      <div
        v-for="link in socialLinks"
        :key="link.id"
        class="d-flex align-items-center justify-content-between p-3 border rounded bg-surface"
      >
        <div class="d-flex align-items-center gap-3">
          <i
            :class="getPlatformIcon(link.platform)"
            class="fs-4 text-primary-purple"
          ></i>
          <div>
            <strong class="d-block themed-text">{{ link.platform }}</strong>
            <a
              :href="link.url"
              target="_blank"
              class="small text-muted text-decoration-none"
              >{{ link.url }}</a
            >
          </div>
        </div>
        <button
          class="btn btn-sm btn-outline-danger"
          @click="deleteSocialLink(link.id)"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Delete Social Link Confirmation Modal -->
  <BaseModal
    v-if="showDeleteSocialConfirm"
    title="Confirm Delete Link"
    icon="bi-exclamation-triangle"
    theme="danger"
    @closeModal="showDeleteSocialConfirm = false"
  >
    <div class="p-3 text-center">
      <p class="themed-text">Are you sure you want to delete this social link?</p>
      <div class="d-flex justify-content-center gap-3 mt-4">
        <button
          class="btn btn-light border px-4 rounded-pill fw-bold"
          type="button"
          @click="showDeleteSocialConfirm = false"
        >
          Cancel
        </button>
        <button
          class="btn btn-danger px-4 rounded-pill fw-bold"
          type="button"
          @click="confirmDeleteSocialLink"
        >
          <i class="bi bi-trash me-1"></i> Confirm Delete
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Send Message Modal -->
  <BaseModal
    v-if="showSendMessageModal"
    :title="`Message ${profile.name}`"
    icon="bi-chat-dots"
    @closeModal="showSendMessageModal = false"
  >
    <div class="p-3 text-center">
      <p class="themed-text">Opening chat dashboard with <strong>{{ profile.name }}</strong>...</p>
      <p class="text-muted small">This is a mock chat dashboard integration.</p>
      <div class="d-flex justify-content-end gap-3 mt-4">
        <button
          class="btn btn-primary px-4 rounded-pill fw-bold"
          type="button"
          @click="showSendMessageModal = false"
        >
          OK
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/AuthStore";
import { useUserProfilesStore } from "../stores/UserProfilesStore";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { normalizeSkills } from "../utils/profileFields";
import { useForumStore } from "../stores/ForumStore";
import { useToast } from "vue-toastification";
import BaseModal from "../components/base/BaseModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userProfilesStore = useUserProfilesStore();
const forumStore = useForumStore();
const toast = useToast();

const showDeleteSocialConfirm = ref(false);
const socialLinkIdToDelete = ref(null);
const showSendMessageModal = ref(false);

// Tab state: 'profile' | 'projects'
const activeTab = ref("profile");
const isLoading = ref(true);
const isFollowing = ref(false);

const profile = reactive({
  id: null,
  username: "",
  name: "",
  bio: "",
  role: "Student",
  github: "",
  linkedin: "",
  avatar: "",
  skills: [],
  projects: [],
  activity: [],
});

const isOwnProfile = computed(() => {
  if (!authStore.user) return false;

  const currentId = String(authStore.user.id || "");
  const currentUsername = cleanUsername(authStore.user.username);
  const currentName = cleanUsername(authStore.user.name);
  const visitedId = cleanParam(route.params.id || "");

  return (
    currentId === visitedId ||
    currentUsername === visitedId ||
    currentName === visitedId
  );
});

const socialLinks = ref([]);
const showSocialModal = ref(false);
const newSocialPlatform = ref("");
const newSocialUrl = ref("");
const isAddingSocial = ref(false);

const loadSocialLinks = async () => {
  try {
    await userProfilesStore.fetchViewedSocialLinks(profile.id);
    socialLinks.value = userProfilesStore.viewedSocialLinks;
  } catch (err) {
    console.warn("Failed to load social links:", err);
  }
};

const addSocialLink = async () => {
  if (!newSocialPlatform.value || !newSocialUrl.value || !authStore.user)
    return;
  isAddingSocial.value = true;
  try {
    await userProfilesStore.addSocialLink(
      newSocialPlatform.value,
      newSocialUrl.value,
    );
    newSocialPlatform.value = "";
    newSocialUrl.value = "";
    showSocialModal.value = false;
    toast.success("Social link added!");
    await loadSocialLinks();
  } catch (err) {
    toast.error("Failed to add social link.");
    console.error(err);
  } finally {
    isAddingSocial.value = false;
  }
};

const deleteSocialLink = (id) => {
  socialLinkIdToDelete.value = id;
  showDeleteSocialConfirm.value = true;
};

const confirmDeleteSocialLink = async () => {
  if (!socialLinkIdToDelete.value) return;
  showDeleteSocialConfirm.value = false;
  try {
    await userProfilesStore.deleteSocialLink(socialLinkIdToDelete.value);
    toast.success("Social link deleted!");
    await loadSocialLinks();
  } catch (err) {
    toast.error("Failed to delete social link.");
    console.error(err);
  } finally {
    socialLinkIdToDelete.value = null;
  }
};

const getPlatformIcon = (platformStr) => {
  const p = (platformStr || "").toLowerCase();
  if (p.includes("linkedin")) return "bi-linkedin";
  if (p.includes("github")) return "bi-github";
  if (p.includes("twitter") || p.includes("x")) return "bi-twitter-x";
  if (p.includes("facebook")) return "bi-facebook";
  if (p.includes("instagram")) return "bi-instagram";
  if (p.includes("youtube")) return "bi-youtube";
  if (p.includes("discord")) return "bi-discord";
  if (p.includes("tiktok")) return "bi-tiktok";
  return "bi-link-45deg";
};

const loadUserProjects = async (userId) => {
  try {
    return await userProfilesStore.fetchViewedProjects(userId);
  } catch (err) {
    console.warn("Failed to load user projects:", err);
    return [];
  }
};



const cleanParam = (paramStr) => {
  if (!paramStr) return "";
  return String(paramStr).toLowerCase().trim().replace("@", "");
};

const cleanUsername = (str) => {
  if (!str) return "";
  return String(str).toLowerCase().trim().replace("@", "").replace(/\s+/g, "_");
};

const loadProfileData = async () => {
  isLoading.value = true;
  await forumStore
    .fetchDiscussions()
    .catch((e) => console.error("Could not fetch discussions:", e));
  const rawParam = route.params.id;
  const id = cleanParam(rawParam);

  try {
    // Attempt 1: Fetch profile from backend by id
    const data = await userProfilesStore.fetchViewedProfile(id);
    if (data && (data.name || data.username || data.id)) {
      await populateProfile(data);
      isLoading.value = false;
      return;
    }
  } catch (err) {
    console.warn("Backend profile requests failed. Redirecting to 404...", err);
    router.push("/404");
  }
};

const populateProfile = async (data) => {
  profile.id = data.id || data.user_id || null;
  profile.username =
    data.username || data.name?.toLowerCase().replace(/\s+/g, "_") || "";
  profile.name = data.name || data.username || "Ecosystem Member";
  profile.bio = data.bio || "No biography provided yet.";
  profile.role = data.role || "Student";
  profile.github = data.github || "https://github.com";
  profile.linkedin = data.linkedin || "https://linkedin.com";

  // Format avatar URL
  const rawAvatar = data.profile_pic || data.avatar || data.avatarUrl;
  const avatar = resolveMediaUrl(rawAvatar);
  if (avatar) {
    profile.avatar = avatar;
  } else {
    const seed = cleanUsername(data.name || "user");
    profile.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  profile.skills = normalizeSkills(data.skills);

  // Load and map user projects from API
  let userProjects = Array.isArray(data.projects) ? data.projects : [];
  if (profile.id) {
    const apiProjects = await loadUserProjects(profile.id);
    if (apiProjects.length > 0) {
      userProjects = apiProjects;
    }
    await loadSocialLinks(); // Load social links after we have profile.id
  }
  profile.projects = userProjects;

  const userDiscussions = forumStore.discussions
    .filter((d) => {
      // Primary check: match by exact user_id from the backend
      const dUserId = d.user_id;
      const profileId = profile.id || data.id;
      if (dUserId && profileId && Number(dUserId) === Number(profileId))
        return true;

      // Fallback check: match by name/username
      const authorName =
        typeof d.author === "object" && d.author !== null
          ? d.author.username || d.author.name
          : d.author;
      const authorStr = (authorName || "").toLowerCase();
      const currentUsername = profile.username.replace("@", "").toLowerCase();
      const currentName = (profile.name || "").toLowerCase();
      return (
        authorStr === currentUsername ||
        authorStr === currentName ||
        authorStr === data.username?.toLowerCase()
      );
    })
    .map((d) => ({
      id: d.id,
      type: "discussion",
      title: d.title,
      meta: `Posted in ${d.category}`,
      icon: "bi-chat-left-text-fill",
      link: `/forum/${d.id}`,
    }));

  const fallbackActivity =
    Array.isArray(data.activity) && data.activity.length ? data.activity : [];
  profile.activity =
    userDiscussions.length > 0 ? userDiscussions : fallbackActivity;
};

onMounted(loadProfileData);

watch(
  () => route.params.id,
  () => {
    loadProfileData();
  },
);

const handleFollowToggle = () => {
  isFollowing.value = !isFollowing.value;
};

const handleSendMessage = () => {
  showSendMessageModal.value = true;
};
</script>

<style scoped>
.profile-dashboard {
  max-width: 1280px;
  margin: 0 auto;
  background-color: transparent;
  min-height: 90vh;
  font-family: var(--font-family-base);
  color: var(--color-text) !important;
}

/* Sidebar Styling */
.sidebar-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
  transition: all var(--transition-slow);
}
.sidebar-card-modern:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
}

.avatar-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  padding: 3px;
  background: linear-gradient(
    135deg,
    var(--color-purple) 0%,
    var(--color-primary) 100%
  );
  border-radius: 50%;
  box-shadow: 0 8px 20px -6px rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-base);
}
.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-surface);
}

.btn-back-profile {
  transition: all var(--transition-base);
}
.btn-back-profile:hover {
  color: var(--color-primary) !important;
  transform: translateX(-3px);
}

.sidebar-user-info {
  background: transparent !important;
  padding: 1rem 0;
}

.status-indicator-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 15px;
  height: 15px;
  background-color: var(--color-success);
  border: 3px solid var(--color-surface) !important;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.role-badge-sidebar {
  display: inline-block;
  background: var(--color-purple-light) !important;
  color: var(--color-purple) !important;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(139, 92, 246, 0.15) !important;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.05);
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
  transform: translateX(4px);
}

.nav-btn-modern.active {
  background: linear-gradient(
    90deg,
    var(--color-primary-light) 0%,
    transparent 100%
  );
  color: var(--color-primary) !important;
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transform: translateX(4px);
}

.border-slate {
  border-color: var(--color-border);
}

/* Action buttons */
.btn-edit-self {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}
.btn-edit-self:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.btn-follow {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  color: #ffffff !important;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.4);
  transition: all var(--transition-base);
}
.btn-follow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -3px rgba(139, 92, 246, 0.5);
  filter: brightness(1.1);
}

.btn-following {
  background: var(--color-success-light) !important;
  color: var(--color-success) !important;
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px -4px rgba(16, 185, 129, 0.2);
}
.btn-following:hover {
  background: rgba(16, 185, 129, 0.2) !important;
  transform: translateY(-1px);
}

.btn-message {
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all var(--transition-base);
}
.btn-message:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-purple);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 92, 246, 0.1);
}

/* Main Cards */
.dashboard-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  color: var(--color-text);
  transition: box-shadow var(--transition-base);
}
.dashboard-card-modern:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.profile-hero-card {
  background: var(--color-surface) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
  color: var(--color-text);
  transition: all var(--transition-base);
}
.profile-hero-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
}

.profile-hero-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(
    90deg,
    var(--color-purple) 0%,
    var(--color-primary) 100%
  );
}

.bio-text {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--color-text-muted) !important;
  white-space: pre-wrap;
  word-break: break-word;
}

.themed-text {
  color: var(--color-text) !important;
}
.header-title {
  letter-spacing: -0.3px;
}

/* Empty states */
.card-empty-state {
  border: 1px dashed var(--color-border);
  background: var(--color-surface-hover);
  border-radius: var(--radius-md);
}

/* Projects */
.project-card-modern-v2 {
  background: var(--color-surface) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.project-card-modern-v2::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-purple),
    transparent
  );
  opacity: 0;
  transition: opacity var(--transition-base);
}
.project-card-modern-v2:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(139, 92, 246, 0.12) !important;
  border-color: rgba(139, 92, 246, 0.25) !important;
}
.project-card-modern-v2:hover::after {
  opacity: 1;
}
.project-title-v2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text) !important;
  transition: color var(--transition-base);
}
.project-card-modern-v2:hover .project-title-v2 {
  color: var(--color-purple) !important;
}

.project-icon-box {
  width: 42px;
  height: 42px;
  background: var(--color-purple-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border: 1px solid rgba(139, 92, 246, 0.1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.05);
}

.star-badge {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Stat Widgets */
.stat-card-mini {
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}
.stat-card-mini:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.05);
}
.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.rep-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.engage-icon {
  background: rgba(139, 92, 246, 0.1);
  color: var(--color-purple);
}
.stat-num {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: 2px;
}
.stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

/* Biography elements */
.bio-quote-icon {
  position: absolute;
  right: 15px;
  bottom: 0;
  font-size: 6rem;
  color: var(--color-border);
  opacity: 0.2;
  pointer-events: none;
  line-height: 1;
}
.heading-accent {
  width: 4px;
  height: 18px;
  background: linear-gradient(
    180deg,
    var(--color-purple) 0%,
    var(--color-primary) 100%
  );
  border-radius: var(--radius-pill);
}

.bio-meta-grid {
  margin-top: 1rem;
}
.meta-item-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}
.meta-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-success);
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.tag-badge-v2 {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tag-badge-v2.react {
  background: var(--color-tag-blue-bg) !important;
  color: var(--color-tag-blue-text) !important;
}
.tag-badge-v2.webgpu {
  background: var(--color-tag-pink-bg) !important;
  color: var(--color-tag-pink-text) !important;
}
.tag-badge-v2.typescript {
  background: var(--color-tag-indigo-bg) !important;
  color: var(--color-tag-indigo-text) !important;
}
.tag-badge-v2.go {
  background: var(--color-tag-cyan-bg) !important;
  color: var(--color-tag-cyan-text) !important;
}
.tag-badge-v2.redis {
  background: var(--color-tag-red-bg) !important;
  color: var(--color-tag-red-text) !important;
}
.tag-badge-v2.grpc {
  background: var(--color-tag-purple-bg) !important;
  color: var(--color-tag-purple-text) !important;
}
.tag-badge-v2.docker {
  background: var(--color-tag-blue-bg) !important;
  color: var(--color-tag-blue-text) !important;
}
.tag-badge-v2.devops {
  background: var(--color-tag-purple-bg) !important;
  color: var(--color-tag-purple-text) !important;
}
.tag-badge-v2.node\.js {
  background: var(--color-tag-cyan-bg) !important;
  color: var(--color-tag-cyan-text) !important;
}

/* Activity Timeline */
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
  width: 36px;
  height: 36px;
  background: var(--color-purple-light) !important;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.small-title {
  font-size: 0.9rem;
  color: var(--color-text) !important;
}

/* Side Info Section */
.proficiency-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-text-muted);
}
.proficiency-percentage {
  font-size: 0.72rem;
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
  background: linear-gradient(
    90deg,
    var(--color-purple) 0%,
    var(--color-primary) 100%
  );
  border-radius: var(--radius-pill);
}

.language-badge {
  background: var(--color-tag-indigo-bg);
  color: var(--color-tag-indigo-text);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  transition: all 0.2s ease;
}
.language-badge:hover {
  filter: brightness(0.9);
  transform: scale(1.05);
}

.social-icon-btn {
  width: 36px;
  height: 36px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 1.1rem;
  transition: all 0.2s ease;
}
.social-icon-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* Skeleton Loading Shimmer */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-border) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.btn-link-premium {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.88rem;
  transition: opacity 0.2s ease;
}
.btn-link-premium:hover {
  opacity: 0.8;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
