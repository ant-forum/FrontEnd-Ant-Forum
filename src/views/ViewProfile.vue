<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/AuthStore";
import api from "../api/api";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { normalizeSkills } from "../utils/profileFields";
import { useForumStore } from "../stores/ForumStore";
import { useToast } from "vue-toastification";
import BaseModal from "../components/base/BaseModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const forumStore = useForumStore();
import { useProjectStore } from "../stores/ProjectStore";
const projectStore = useProjectStore();

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
  
  const currentUsername = (authStore.user.username || "").toLowerCase().replace("@", "");
  const visitedId = String(route.params.id || "").toLowerCase().replace("@", "");
  
  return currentUsername === visitedId || 
         (authStore.user.id && String(authStore.user.id) === visitedId) ||
         (authStore.user.name && authStore.user.name.toLowerCase().replace(/\s+/g, "_") === visitedId);
});

const socialLinks = ref([]);
const showSocialModal = ref(false);
const newSocialPlatform = ref("");
const newSocialUrl = ref("");
const isAddingSocial = ref(false);

const loadSocialLinks = async () => {
  try {
    const res = await api.get('/api/sociallink/get-all/social-link');
    const links = res.data?.data || res.data || [];
    if (links.length > 0 && links[0].user_id) {
      socialLinks.value = links.filter(l => Number(l.user_id) === Number(profile.id));
    } else {
      socialLinks.value = links;
    }
  } catch (err) {
    console.warn("Failed to load social links:", err);
  }
};

const addSocialLink = async () => {
  if (!newSocialPlatform.value || !newSocialUrl.value) return;
  isAddingSocial.value = true;
  try {
    await api.post('/api/sociallink/createSocialLink', {
      platform: newSocialPlatform.value,
      url: newSocialUrl.value
    });
    newSocialPlatform.value = '';
    newSocialUrl.value = '';
    toast.success("Social link added!");
    await loadSocialLinks();
  } catch (err) {
    toast.error("Failed to add social link.");
    console.error(err);
  } finally {
    isAddingSocial.value = false;
  }
};

const deleteSocialLink = async (id) => {
  if (!confirm("Are you sure you want to delete this link?")) return;
  try {
    await api.delete(`/api/sociallink/delete/social-link/${id}`);
    toast.success("Social link deleted!");
    await loadSocialLinks();
  } catch (err) {
    toast.error("Failed to delete social link.");
    console.error(err);
  }
};

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

// Mock database for standard ANT users
const mockProfiles = {
  david: {
    name: "David Smith",
    role: "Mentor",
    bio: "Senior DevOps Engineer and cloud architect. Specializing in high-performance dockerization, Kubernetes orchestration, and automating multi-stage deployment pipelines for Node.js workloads.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://i.pravatar.cc/150?u=david",
    skills: ["Docker", "Kubernetes", "Node.js", "CI/CD", "AWS"],
    projects: [
      {
        title: "Docker-Node Optimizer",
        stars: "1.2k",
        desc: "A collection of multi-stage Dockerfiles and configuration templates optimized specifically for production Node.js deployment.",
        tags: ["DOCKER", "NODE.JS", "DEVOPS"]
      },
      {
        title: "CloudFlow Orchestrator",
        stars: "450",
        desc: "Lightweight cloud orchestration utility wrapper around Kubernetes API for development teams.",
        tags: ["GO", "KUBERNETES", "YAML"]
      }
    ],
    activity: [
      { type: "discussion", title: "How to optimize Docker images for Node.js?", meta: "FORUM DISCUSSION • 2H AGO • 48 COMMENTS", icon: "bi-chat-left-text" },
      { type: "merge", title: "Merge branch 'release-v1.4' into dev", meta: "REPOSITORY: ANT-DOCKER • 1D AGO", icon: "bi-git" }
    ]
  },
  sarahc: {
    name: "Sarah Chen",
    role: "Mentor",
    bio: "Frontend Engineer passionate about design systems, accessible interface designs, and modular Vue 3 state management. Love creating smooth animations and custom CSS variables.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://i.pravatar.cc/150?u=sarahc",
    skills: ["Vue 3", "CSS Grid", "Tailwind", "JavaScript", "TypeScript"],
    projects: [
      {
        title: "Lumina Components",
        stars: "2.4k",
        desc: "A fully accessible, beautifully animated Vue 3 component library built with custom properties and HSL palettes.",
        tags: ["VUE 3", "TAILWIND", "CSS"]
      },
      {
        title: "FlexGrid Builder",
        stars: "812",
        desc: "Interactive visual generator for modern CSS Grid layouts with real-time responsive media queries.",
        tags: ["JAVASCRIPT", "CSS", "UI/UX"]
      }
    ],
    activity: [
      { type: "discussion", title: "Best practices for Vue 3 Composition API in large scale apps", meta: "FORUM DISCUSSION • 5H AGO • 12 COMMENTS", icon: "bi-chat-left-text" },
      { type: "merge", title: "Refactor: Add responsive layout variables in theme configuration", meta: "REPOSITORY: LUMINA-UI • 3D AGO", icon: "bi-git" }
    ]
  },
  marcus: {
    name: "Marcus Wright",
    role: "Student",
    bio: "Aspiring full-stack engineer and backend learner. Currently focusing on modern database query optimization, Redis caching patterns, and REST-to-GraphQL migration pipelines.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    skills: ["GraphQL", "Redis", "Node.js", "PostgreSQL", "API Design"],
    projects: [
      {
        title: "Apollo REST Gateway",
        stars: "340",
        desc: "An auto-mapping GraphQL schema layer on top of legacy REST API endpoints with cached response headers.",
        tags: ["GRAPHQL", "REDIS", "NODE.JS"]
      }
    ],
    activity: [
      { type: "discussion", title: "Is it worth moving from REST to GraphQL in 2026?", meta: "FORUM DISCUSSION • 1D AGO • 9 COMMENTS", icon: "bi-chat-left-text" },
      { type: "post", title: "Published tutorial on PostgreSQL query execution analysis", meta: "BLOG POST • 5D AGO", icon: "bi-book" }
    ]
  },
  elena: {
    name: "Elena Vance",
    role: "Admin",
    bio: "System administrator and cyber security auditor. Managing backend infrastructure reliability, conducting regular package vulnerability audits, and implementing JWT/refresh token security layers.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://i.pravatar.cc/150?u=elena",
    skills: ["Security", "Linux", "Node.js", "Bash", "Docker"],
    projects: [
      {
        title: "NPM Audit Watchdog",
        stars: "520",
        desc: "Continuous integration shell script utility that alerts development channels on high-severity vulnerability dependencies.",
        tags: ["SECURITY", "NPM", "BASH"]
      }
    ],
    activity: [
      { type: "discussion", title: "New security vulnerability found in popular npm package", meta: "FORUM DISCUSSION • 12H AGO • 14 COMMENTS", icon: "bi-chat-left-text" },
      { type: "system", title: "System Patch: Updated secure headers configuration in production load balancer", meta: "SYSTEM AUDIT • 2D AGO", icon: "bi-shield-check" }
    ]
  },
  james: {
    name: "James Wilson",
    role: "Mentor",
    bio: "Software Architect with 12+ years of enterprise experience. Specializing in microservices, distributed system designs, gRPC APIs, and teaching students how to structure applications for scale.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://i.pravatar.cc/150?u=james",
    skills: ["Microservices", "System Design", "Go", "gRPC", "Kubernetes"],
    projects: [
      {
        title: "Service Mesh Scaffold",
        stars: "1.8k",
        desc: "Boilerplate system design configuration for localized microservice orchestration with Istio and Docker Compose.",
        tags: ["GO", "GRPC", "MICROSERVICES"]
      }
    ],
    activity: [
      { type: "discussion", title: "Microservices vs Monolith: A practical guide", meta: "FORUM DISCUSSION • 2D AGO • 11 COMMENTS", icon: "bi-chat-left-text" },
      { type: "merge", title: "Add protobuf definitions for user profile service events", meta: "REPOSITORY: ANT-PROTO • 1W AGO", icon: "bi-git" }
    ]
  },
  performance_dev: {
    name: "Performance Dev",
    role: "Student",
    bio: "Obsessed with front-end rendering performance, low-latency lists, IntersectionObserver dynamic layout slots, and browser compositor thread optimizations.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=performance_dev",
    skills: ["Web Performance", "IntersectionObserver", "Vue.js", "CSS Rendering", "HTML5"],
    projects: [
      {
        title: "Dynamic Virtual Scroll",
        stars: "612",
        desc: "Low-latency vertical scroller container for heavy composite layers utilizing custom offset margins.",
        tags: ["VUE.JS", "PERFORMANCE", "HTML5"]
      }
    ],
    activity: [
      { type: "discussion", title: "Optimizing IntersectionObserver composite layers for heavy lists", meta: "FORUM DISCUSSION • 3H AGO • 10 COMMENTS", icon: "bi-chat-left-text" }
    ]
  },
  another_dev: {
    name: "Alternate Developer",
    role: "Student",
    bio: "Aspiring backend developer focused on API routing, middleware authentication structures, express controllers, and MongoDB clustering layouts.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=another_dev",
    skills: ["Node.js", "Express", "MongoDB", "JWT Auth", "JavaScript"],
    projects: [
      {
        title: "Express JWT Scaler",
        stars: "140",
        desc: "Drop-in authentication module with Redis token blacklisting features.",
        tags: ["EXPRESS", "JWT", "REDIS"]
      }
    ],
    activity: [
      { type: "reply", title: "Replied: Optimizing IntersectionObserver composite layers", meta: "FORUM REPLY • 1H AGO", icon: "bi-chat-left-text" }
    ]
  },
  frontend_wizard: {
    name: "Frontend Wizard",
    role: "Student",
    bio: "Designing clean layout frames, modern animations, typography scale charts, dark modes, and CSS variable-driven interactive templates.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=frontend_wizard",
    skills: ["CSS", "Tailwind", "Framer Motion", "Vue", "UX Design"],
    projects: [
      {
        title: "Magic Variables UI",
        stars: "740",
        desc: "A playground to build theme variables dynamically using HSL calculations and browser controls.",
        tags: ["CSS", "VUE", "TAILWIND"]
      }
    ],
    activity: [
      { type: "reply", title: "Replied: Optimizing IntersectionObserver composite layers", meta: "FORUM REPLY • 30M AGO", icon: "bi-chat-left-text" }
    ]
  },
  elena_rostova: {
    name: "Elena Rostova",
    role: "Core Team",
    bio: "Senior Architect at ANT. Contributing to the forum rendering modules, notification synchronization layers, and backend database index optimization.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    skills: ["Database indexing", "NodeJS", "Vue 3", "TailwindCSS", "PostgreSQL"],
    projects: [
      {
        title: "Index Analyzer",
        stars: "1.4k",
        desc: "Real-time index scanning metrics display for heavy enterprise PostgreSQL databases.",
        tags: ["POSTGRESQL", "NODEJS", "METRICS"]
      }
    ],
    activity: [
      { type: "merge", title: "Merge PR #892: Implement notification socket sync", meta: "REPOSITORY: ANT-CORE • 2D AGO", icon: "bi-git" }
    ]
  },
  david_chen: {
    name: "David Chen",
    role: "Mentor",
    bio: "Full stack instructor. Love coaching students on modern frontend patterns, state stores, and modular code encapsulation.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120",
    skills: ["Vue 3", "Pinia", "JavaScript", "Webpack", "CSS Grid"],
    projects: [
      {
        title: "Pinia Scaffold Dev",
        stars: "342",
        desc: "Scaffold generator tools to build modular state stores with automatic local storage persistence hooks.",
        tags: ["PINIA", "VUE 3", "BUILDER"]
      }
    ],
    activity: [
      { type: "post", title: "Shared: Designing cohesive Vue Store modules", meta: "FORUM DISCUSSION • 3D AGO", icon: "bi-chat-left-text" }
    ]
  },
  samira_al_fayed: {
    name: "Samira Al-Fayed",
    role: "Pro Member",
    bio: "Web developer specializing in accessible interactive visualizations, SVG animation charts, and client-side graph algorithms.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    skills: ["SVG", "D3.js", "TypeScript", "TailwindCSS", "Canvas"],
    projects: [
      {
        title: "VectorGraph Engine",
        stars: "890",
        desc: "Interactive canvas and SVG charting engine optimized for tree nodes rendering and drag actions.",
        tags: ["TYPESCRIPT", "SVG", "CANVAS"]
      }
    ],
    activity: [
      { type: "merge", title: "Merge PR #341: Fix responsive sizing coordinates in SVG chart bounds", meta: "REPOSITORY: VECTORGRAPH • 4D AGO", icon: "bi-git" }
    ]
  }
};

const cleanParam = (paramStr) => {
  if (!paramStr) return "";
  return String(paramStr).toLowerCase().trim().replace("@", "");
};

const loadProfileData = async () => {
  isLoading.value = true;
  await forumStore.fetchDiscussions().catch(e => console.error("Could not fetch discussions:", e));
  await projectStore.fetchProjects().catch(e => console.error("Could not fetch projects:", e));
  const rawParam = route.params.username;
  const username = cleanUsername(rawParam);

  try {
    // Attempt 1: Fetch profile from backend by id
    const res = await api.get(`/api/admin/get-user/${id}`);
    const data = res.data?.data || res.data;
    if (data && (data.name || data.username || data.id)) {
      await populateProfile(data);
      isLoading.value = false;
      return;
    }
  } catch (err) {
    console.warn("Backend profile requests failed. Falling back to mock database...");
  }

  // Fallback to high-fidelity mock profiles
  // Check direct username mapping first
  let match = mockProfiles[id];
  
  // If not found directly, check by matching name (e.g. "Elena Fisher" -> "elena")
  if (!match) {
    const formattedName = id.replace(/_/g, " ").replace(/-/g, " ");
    const matchingKey = Object.keys(mockProfiles).find(key => {
      const pName = mockProfiles[key].name.toLowerCase();
      return pName.includes(id) || id.includes(key);
    });
    if (matchingKey) {
      match = mockProfiles[matchingKey];
    }
  }

  // Final fallback object
  const profileFallback = match || {
    name: rawParam ? rawParam.charAt(0).toUpperCase() + rawParam.slice(1).replace(/_/g, " ") : "Ecosystem Member",
    role: "Student",
    bio: "Proud member of the ANT Forum development community. Passionate about learning web architectures, sharing coding tips, and collaborating on projects.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || "user"}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
    skills: ["JavaScript", "HTML", "CSS", "Git"],
    projects: [
      {
        title: "Sandbox Workspace",
        stars: "5",
        desc: "A sandbox environment for studying core web technologies and modern coding architectures.",
        tags: ["JAVASCRIPT", "HTML", "CSS"]
      }
    ],
    activity: [
      { type: "discussion", title: "Joined the ANT Forum developer network!", meta: "SYSTEM FEED • RECENT", icon: "bi-person-plus-fill" }
    ]
  };

  await populateProfile({
    username: "@" + id,
    ...profileFallback
  });

  // Small delay to make the premium skeleton transition visible
  setTimeout(() => {
    isLoading.value = false;
  }, 400);
};

const populateProfile = async (data) => {
  profile.id = data.id || data.user_id || null;
  profile.username = data.username || data.name?.toLowerCase().replace(/\s+/g, "_") || "";
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
  
  const allProjects = projectStore.projects || [];
  const currentUsername = profile.username.replace('@', '').toLowerCase();
  const currentName = (profile.name || '').toLowerCase();
  const userProjects = allProjects.filter(p => {
    const authorUsername = p.author?.username?.replace('@', '').toLowerCase();
    const authorName = p.author?.name?.toLowerCase();
    return authorUsername === currentUsername || authorName === currentName;
  }).map(p => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    stars: p.average_rating || 0,
    tags: p.tags || []
  }));

  const fallbackProjects = [];
  profile.projects = userProjects.length > 0 ? userProjects : fallbackProjects;
  
  const userDiscussions = forumStore.discussions.filter(d => {
    // Primary check: match by exact user_id from the backend
    const dUserId = d.user_id;
    const profileId = profile.id || data.id;
    if (dUserId && profileId && Number(dUserId) === Number(profileId)) return true;

    // Fallback check: match by name/username
    const authorName = (typeof d.author === 'object' && d.author !== null) ? (d.author.username || d.author.name) : d.author;
    const authorStr = (authorName || '').toLowerCase();
    const currentUsername = profile.username.replace('@', '').toLowerCase();
    const currentName = (profile.name || '').toLowerCase();
    return authorStr === currentUsername || authorStr === currentName || authorStr === data.username?.toLowerCase();
  }).map(d => ({
    id: d.id,
    type: "discussion",
    title: d.title,
    meta: `Posted in ${d.category}`,
    icon: "bi-chat-left-text-fill",
    link: `/forum/${d.id}`
  }));

  const fallbackActivity = Array.isArray(data.activity) && data.activity.length ? data.activity : [];
  profile.activity = userDiscussions.length > 0 ? userDiscussions : fallbackActivity;

  // Load social links dynamically after getting profile ID
  await loadSocialLinks();
};

onMounted(loadProfileData);

watch(() => route.params.id, () => {
  loadProfileData();
});

const handleFollowToggle = () => {
  isFollowing.value = !isFollowing.value;
};

const handleSendMessage = () => {
  alert(`Opening chat dashboard with ${profile.name}...`);
};
</script>

<template>
  <Navbar />
  
  <div class="container profile-dashboard py-4">
    <!-- Skeleton loader state -->
    <div v-if="isLoading" class="row g-4 fade-in-content">
      <!-- Left Skeleton -->
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern p-4">
          <div class="skeleton-shimmer rounded-circle mb-4 mx-auto" style="width: 80px; height: 80px;"></div>
          <div class="skeleton-shimmer rounded mb-2 w-75 mx-auto" style="height: 18px;"></div>
          <div class="skeleton-shimmer rounded w-50 mx-auto mb-4" style="height: 12px;"></div>
          <hr class="my-4 border-slate">
          <div class="skeleton-shimmer rounded mb-2" style="height: 32px;"></div>
          <div class="skeleton-shimmer rounded" style="height: 32px;"></div>
        </div>
      </aside>
      <!-- Right Skeleton -->
      <main class="col-lg-9 col-md-8">
        <div class="dashboard-card-modern p-4 mb-4">
          <div class="skeleton-shimmer rounded mb-3 w-50" style="height: 24px;"></div>
          <div class="skeleton-shimmer rounded mb-2 w-100" style="height: 14px;"></div>
          <div class="skeleton-shimmer rounded w-75" style="height: 14px;"></div>
        </div>
      </main>
    </div>

    <!-- Loaded profile state -->
    <div v-else class="row g-4 fade-in-content">
      
      <!-- Left Sidebar Column -->
      <aside class="col-lg-3 col-md-4">
        <div class="sidebar-card-modern shadow-sm p-4">
          <!-- Back button -->
          <button @click="router.back()" class="btn-back-profile mb-4 d-inline-flex align-items-center gap-2 border-0 bg-transparent text-muted small fw-bold ps-0">
            <i class="bi bi-arrow-left"></i>
            <span>Go Back</span>
          </button>

          <!-- Sidebar Header: User Info -->
          <div class="sidebar-user-info d-flex flex-column align-items-center text-center gap-2 mb-4">
            <div class="position-relative mb-2">
              <img :src="profile.avatar" class="rounded-circle border border-3 border-primary-subtle" width="80" height="80" alt="Profile avatar" style="object-fit: cover;">
              <span class="status-indicator-dot"></span>
            </div>
            <div class="user-meta overflow-hidden w-100">
              <h5 class="mb-0 fw-bold text-truncate" style="font-size: 1.1rem; color: var(--color-text);">{{ profile.name }}</h5>
              <div class="text-muted small mb-2">{{ profile.username }}</div>
              <span class="role-badge-sidebar">{{ profile.role }}</span>
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
                  <span>About Profile</span>
                </button>
              </li>
              <li>
                <button 
                  @click="activeTab = 'projects'" 
                  class="nav-btn-modern" 
                  :class="{ 'active': activeTab === 'projects' }"
                >
                  <i class="bi bi-folder-fill fs-5"></i>
                  <span>Showcase Projects ({{ profile.projects.length }})</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <hr class="my-3 border-slate">
      
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
              <div class="profile-hero-card p-4">
                <h5 class="fw-bold mb-3 themed-text">Biography</h5>
                <p class="bio-text text-muted mb-0">
                  {{ profile.bio }}
                </p>
              </div>

              <!-- Showcase Projects Brief -->
              <div class="featured-projects-section">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-rocket-takeoff text-primary-purple fs-4"></i>
                    <h5 class="mb-0 fw-bold header-title themed-text">Showcase Projects</h5>
                  </div>
                  <button v-if="profile.projects.length > 0" @click="activeTab = 'projects'" class="btn btn-link-premium p-0 text-decoration-none">
                    View All
                  </button>
                </div>
                
                <div v-if="profile.projects.length === 0" class="card-empty-state p-4 text-center">
                  <i class="bi bi-folder2-open text-muted fs-3 mb-2 d-block"></i>
                  <span class="text-muted small">No showcased projects created yet.</span>
                </div>

                <div v-else class="row g-3">
                  <div v-for="project in profile.projects.slice(0, 2)" :key="project.title" class="col-md-6">
                    <div class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <router-link v-slot="{ href, navigate }" :to="'/showcase/' + project.id" custom>
                            <a v-if="project.id" :href="href" @click="navigate" class="text-decoration-none">
                              <h6 class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
                            </a>
                            <h6 v-else class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
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
                </div>
              </div>

              <!-- Recent Activities -->
              <div class="recent-activity-section">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <i class="bi bi-clock-history text-primary-purple fs-4"></i>
                  <h5 class="mb-0 fw-bold header-title themed-text">Recent Feed Activity</h5>
                </div>
                
                <div v-if="profile.activity.length === 0" class="card-empty-state p-4 text-center">
                  <i class="bi bi-activity text-muted fs-3 mb-2 d-block"></i>
                  <span class="text-muted small">No recent forum activity recorded.</span>
                </div>

                <div v-else class="d-flex flex-column gap-3">
                  <div v-for="act in profile.activity" :key="act.id || act.title" 
                       class="activity-row-modern p-3 d-flex align-items-center gap-3"
                       style="cursor: pointer;"
                       @click="act.link ? router.push(act.link) : null">
                    <div class="activity-icon-container">
                      <i :class="['bi', act.icon, 'text-primary-purple']"></i>
                    </div>
                    <div class="overflow-hidden">
                      <h6 class="mb-1 fw-bold themed-text text-truncate small-title">{{ act.title }}</h6>
                      <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.5px;">{{ act.meta }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Info Block -->
            <div class="col-xl-4 col-lg-5 d-flex flex-column gap-4">
              <!-- Stack Proficiency -->
              <div class="dashboard-card-modern p-4">
                <h6 class="themed-text fw-bold mb-4" style="font-size: 0.9rem; letter-spacing: 0.3px;">Platform Statistics</h6>
                
                <div class="d-flex flex-column gap-3 mb-4">
                  <div class="proficiency-item">
                    <div class="d-flex justify-content-between mb-1">
                      <span class="proficiency-label">FORUM REPUTATION</span>
                      <span class="proficiency-percentage">1.2k</span>
                    </div>
                    <div class="proficiency-progress">
                      <div class="proficiency-progress-fill" style="width: 80%;"></div>
                    </div>
                  </div>
                  <div class="proficiency-item">
                    <div class="d-flex justify-content-between mb-1">
                      <span class="proficiency-label">THREAD ENGAGEMENT</span>
                      <span class="proficiency-percentage">92%</span>
                    </div>
                    <div class="proficiency-progress">
                      <div class="proficiency-progress-fill" style="width: 92%;"></div>
                    </div>
                  </div>
                </div>
                
                <hr class="my-3 border-slate">
                
                <h6 class="text-muted text-uppercase fw-bold mb-3" style="font-size: 0.7rem; letter-spacing: 0.5px;">LANGUAGES & STACK</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="skill in profile.skills" :key="skill" class="language-badge">
                    {{ skill }}
                  </span>
                </div>
                
                <hr class="my-3 border-slate">
                
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h6 class="text-muted text-uppercase fw-bold mb-0" style="font-size: 0.7rem; letter-spacing: 0.5px;">SOCIAL LINKS</h6>
                  <button v-if="isOwnProfile" @click="showSocialModal = true" class="btn btn-sm btn-link text-primary-purple p-0 text-decoration-none" style="font-size: 0.8rem;">
                    <i class="bi bi-pencil-square"></i> Manage
                  </button>
                </div>
                
                <div v-if="socialLinks.length === 0" class="text-muted small">No social links added.</div>
                <div v-else class="d-flex flex-wrap gap-3">
                  <a v-for="link in socialLinks" :key="link.id" :href="link.url" target="_blank" class="social-icon-btn d-flex align-items-center justify-content-center rounded-circle text-decoration-none" :title="link.platform">
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
            <h4 class="fw-bold mb-2 header-title themed-text">{{ profile.name }}'s Projects</h4>
            <p class="text-muted mb-0 subtitle-text">Showcase of web application architectures, system designs, and microservices.</p>
          </div>
          
          <div v-if="profile.projects.length === 0" class="card-empty-state p-5 text-center bg-surface border rounded-4">
            <i class="bi bi-folder2-open text-muted fs-1 mb-3 d-block"></i>
            <h5 class="fw-bold themed-text">No Projects Showcase</h5>
            <p class="text-muted small">This developer has not added any projects to their showcase folder yet.</p>
          </div>

          <div v-else class="row g-4">
            <div v-for="project in profile.projects" :key="project.title" class="col-md-6 col-lg-4">
              <div class="project-card-modern-v2 p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <router-link v-slot="{ href, navigate }" :to="'/showcase/' + project.id" custom>
                      <a v-if="project.id" :href="href" @click="navigate" class="text-decoration-none">
                        <h6 class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
                      </a>
                      <h6 v-else class="fw-bold mb-0 themed-text project-title-v2">{{ project.title }}</h6>
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
        <input v-model="newSocialPlatform" type="text" class="form-control" placeholder="Platform (e.g. LinkedIn)">
        <input v-model="newSocialUrl" type="text" class="form-control" placeholder="URL (https://...)">
      </div>
      <button class="btn btn-primary w-100" style="background: var(--color-primary-purple); border: none;" :disabled="!newSocialPlatform || !newSocialUrl || isAddingSocial" @click="addSocialLink">
        {{ isAddingSocial ? 'Adding...' : 'Add Social Link' }}
      </button>
    </div>
    
    <hr class="border-slate my-4">
    
    <h6 class="mb-3 fw-bold themed-text">Your Links</h6>
    <div v-if="socialLinks.length === 0" class="text-muted small">You haven't added any social links yet.</div>
    <div v-else class="d-flex flex-column gap-2">
      <div v-for="link in socialLinks" :key="link.id" class="d-flex align-items-center justify-content-between p-3 border rounded bg-surface">
        <div class="d-flex align-items-center gap-3">
          <i :class="getPlatformIcon(link.platform)" class="fs-4 text-primary-purple"></i>
          <div>
            <strong class="d-block themed-text">{{ link.platform }}</strong>
            <a :href="link.url" target="_blank" class="small text-muted text-decoration-none">{{ link.url }}</a>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-danger" @click="deleteSocialLink(link.id)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </BaseModal>

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

/* Sidebar Styling */
.sidebar-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.btn-back-profile {
  transition: color var(--transition-base);
}
.btn-back-profile:hover {
  color: var(--color-primary) !important;
}

.sidebar-user-info {
  background: transparent !important;
  padding: 1rem 0;
}

.status-indicator-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--color-success);
  border: 2px solid var(--color-surface) !important;
  border-radius: 50%;
}

.role-badge-sidebar {
  display: inline-block;
  background: var(--color-purple-light) !important;
  color: var(--color-purple) !important;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-purple-light) !important;
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
  background: var(--color-surface-hover);
  color: var(--color-primary) !important;
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
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
  background: var(--color-primary);
  color: #ffffff;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px -4px var(--color-primary-light);
  transition: all var(--transition-base);
}
.btn-follow:hover {
  background: var(--color-primary-hover);
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-following {
  background: var(--color-surface-hover);
  color: var(--color-success) !important;
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}
.btn-following:hover {
  background: var(--color-success-light);
}

.btn-message {
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}
.btn-message:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-primary);
}

/* Main Cards */
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

.bio-text {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--color-text-muted) !important;
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
  border-radius: var(--radius-lg);
}

/* Projects */
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
  color: var(--color-text) !important;
  transition: color var(--transition-base);
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
.tag-badge-v2.docker { background: var(--color-tag-blue-bg) !important; color: var(--color-tag-blue-text) !important; }
.tag-badge-v2.devops { background: var(--color-tag-purple-bg) !important; color: var(--color-tag-purple-text) !important; }
.tag-badge-v2.node\.js { background: var(--color-tag-cyan-bg) !important; color: var(--color-tag-cyan-text) !important; }

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
  background: linear-gradient(90deg, var(--color-purple) 0%, var(--color-primary) 100%);
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
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
