<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/layouts/header.vue";
import Footer from "../components/layouts/footer.vue";
import { useAuthStore } from "../stores/AuthStore";
import { useForumStore } from "../stores/ForumStore";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import heroStack from "@/assets/hero.png";

const auth = useAuthStore();
const forumStore = useForumStore();
const router = useRouter();

/* ── typing animation removed ── */

/* ── count-up animation ── */
const statsVisible = ref(false);
const countUpValues = ref([0, 0, 0, 0]);

function animateCountUp(target, index, duration = 1600) {
  const num = parseInt(target) || 0;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    countUpValues.value[index] = Math.floor(eased * num);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── scroll reveal ── */
const revealElements = ref([]);
let observer = null;

function setupScrollReveal() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          // trigger count-up when stats section appears
          if (
            entry.target.classList.contains("preview-stats") &&
            !statsVisible.value
          ) {
            statsVisible.value = true;
            displayStats.value.forEach((stat, i) => {
              const num = parseInt(stat.value) || 0;
              setTimeout(() => animateCountUp(num, i), i * 150);
            });
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  nextTick(() => {
    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      observer.observe(el);
    });
  });
}

/* ── existing data logic (unchanged) ── */

const capabilityCards = [
  {
    title: "Ask With Context",
    desc: "Markdown, tags, categories, and code blocks keep technical posts easy to scan.",
    icon: "bi-chat-square-text",
    accent: "violet",
  },
  {
    title: "Show The Work",
    desc: "Showcase projects, screenshots, and tags turn finished builds into public proof.",
    icon: "bi-window-stack",
    accent: "green",
  },
  {
    title: "Discuss Better",
    desc: "Replies, saves, votes, and clean author details make every thread easier to follow.",
    icon: "bi-command",
    accent: "blue",
  },
];

const workflowSteps = [
  {
    label: "Create",
    text: "Write a focused post with category, tags, and code.",
    icon: "bi-pencil-fill",
    colorClass: "step-create",
  },
  {
    label: "Discuss",
    text: "Collect replies, suggestions, and better approaches.",
    icon: "bi-chat-left-text-fill",
    colorClass: "step-discuss",
  },
  {
    label: "Save",
    text: "Keep useful threads visible for future reference.",
    icon: "bi-bookmark-fill",
    colorClass: "step-save",
  },
  {
    label: "Showcase",
    text: "Publish the final project for community feedback.",
    icon: "bi-rocket-takeoff-fill",
    colorClass: "step-showcase",
  },
];

const previewThreads = [
  {
    id: null,
    title: "How should I handle refresh-token races in Axios?",
    desc: "Multiple protected requests can fail at the same time. Keep the code block, timeline, and accepted answer in one thread.",
    author: "PanhaZin6767",
    avatar: "https://i.pravatar.cc/150?u=panha-preview",
    category: "Questions & Answers",
    replies: 8,
    time: "Active",
  },
  {
    id: null,
    title: "Best way to render markdown code blocks in forum posts?",
    desc: "A clean discussion about storing markdown in description and rendering snippets without breaking edit mode.",
    author: "Admin_Nha",
    avatar: "https://i.pravatar.cc/150?u=admin-preview",
    category: "Tutorials",
    replies: 5,
    time: "New",
  },
  {
    id: null,
    title: "Profile skills should come from admin tags",
    desc: "A product thread for keeping user profile skills consistent with tags managed by admins.",
    author: "Sopanha",
    avatar: "https://i.pravatar.cc/150?u=sopanha-preview",
    category: "Resources",
    replies: 3,
    time: "Today",
  },
];

const previewProjects = [
  {
    id: null,
    title: "ANT Forum Developer Console",
    desc: "A workspace for discussions, project showcases, blog publishing, and profile tools.",
    author: "Admin_Nha",
    avatar: "https://i.pravatar.cc/150?u=admin-nha-preview",
    tags: ["Vue.js", "Pinia", "UI/UX"],
    stars: 12,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: null,
    title: "Markdown Forum Editor",
    desc: "Create technical posts with code blocks, inline code, categories, and clean edit states.",
    author: "PanhaZin6767",
    avatar: "https://i.pravatar.cc/150?u=panha-project-preview",
    tags: ["Markdown", "Tiptap", "Frontend"],
    stars: 9,
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=900",
  },
];

onMounted(async () => {
  if (!forumStore.allDiscussions || forumStore.allDiscussions.length === 0) {
    try {
      await forumStore.fetchDiscussions();
    } catch (error) {
      console.error("Error loading homepage discussions:", error);
    }
  }
  setupScrollReveal();
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

const liveDiscussions = computed(() => {
  return Array.isArray(forumStore.allDiscussions)
    ? forumStore.allDiscussions
    : [];
});

const getCategoryName = (discussion) => {
  return (
    discussion?.categoryLabel ||
    discussion?.categoryMeta?.label ||
    discussion?.category_name ||
    discussion?.category ||
    "General"
  );
};

const isShowcaseThread = (discussion) => {
  const category = getCategoryName(discussion).toLowerCase();
  return category.includes("showcase") || category.includes("project");
};

const cleanText = (text = "", max = 130) => {
  const value = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return value.length > max ? `${value.slice(0, max).trim()}...` : value;
};

const countReplies = (discussion = {}) => {
  if (Array.isArray(discussion.replies)) return discussion.replies.length;
  return Number(discussion.replies || discussion.comment_count || 0);
};

const getAuthorInfo = (discussion = {}) => {
  let author = "Community Member";
  let avatar = `https://i.pravatar.cc/150?u=${discussion?.id || "community"}`;

  if (discussion.user) {
    author = discussion.user.username || discussion.user.name || author;
    avatar = discussion.user.profile_pic || discussion.user.avatar || avatar;
  } else if (discussion.author) {
    author =
      typeof discussion.author === "object"
        ? discussion.author.username || discussion.author.name || author
        : discussion.author;
    avatar = discussion.author_avatar || avatar;
  }

  return {
    author,
    avatar: resolveMediaUrl(
      avatar,
      `https://i.pravatar.cc/150?u=${encodeURIComponent(author)}`,
    ),
  };
};

const displayStats = computed(() => {
  const discussions = liveDiscussions.value;
  const replies = discussions.reduce(
    (total, item) => total + countReplies(item),
    0,
  );
  const projects = discussions.filter(isShowcaseThread).length;
  const categories = new Set(discussions.map(getCategoryName).filter(Boolean)).size;

  return [
    {
      value: discussions.length || 37,
      label: "THREADS",
      subtext: "Active conversations",
      icon: "bi-chat-text-fill",
      colorClass: "threads-accent",
    },
    {
      value: replies || 38,
      label: "REPLIES",
      subtext: "Community responses",
      icon: "bi-reply-fill",
      colorClass: "replies-accent",
    },
    {
      value: projects || 6,
      label: "PROJECTS",
      subtext: "Shared by members",
      icon: "bi-code-slash",
      colorClass: "projects-accent",
    },
    {
      value: categories || 6,
      label: "CATEGORIES",
      subtext: "Topics to explore",
      icon: "bi-grid-fill",
      colorClass: "categories-accent",
    },
  ];
});

const categoryButtons = [
  { label: "Tutorials", icon: "bi-house-door", query: "Tutorials" },
  { label: "General Discussion", icon: "bi-chat-dots", query: "General Discussion" },
  { label: "Showcase Projects", icon: "bi-folder", query: "Showcase Projects" },
  { label: "Announcements", icon: "bi-megaphone", query: "Announcements" },
  { label: "Resources", icon: "bi-plus-square", query: "Resources" },
];

const goToCategory = (categoryLabel) => {
  const slug = categoryLabel.toLowerCase().replace(/\s+/g, "-");
  router.push({ path: "/forum", query: { category: slug } });
};

const categorySummary = computed(() => {
  const counts = new Map();

  liveDiscussions.value.forEach((discussion) => {
    const name = getCategoryName(discussion);
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  const live = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  return live.length
    ? live
    : [
        { label: "Questions & Answers", count: 4 },
        { label: "Showcase Projects", count: 3 },
        { label: "Tutorials", count: 2 },
        { label: "Resources", count: 2 },
      ];
});

const recentThreadsLive = computed(() => {
  return liveDiscussions.value
    .filter((discussion) => !isShowcaseThread(discussion))
    .slice(0, 4)
    .map((discussion) => {
      const { author, avatar } = getAuthorInfo(discussion);
      const createdAt = discussion.created_at || discussion.createdAt;
      const time = createdAt
        ? new Date(createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "Recent";

      return {
        id: discussion.id,
        title: discussion.title || "Untitled discussion",
        desc: cleanText(
          discussion.description || discussion.excerpt || discussion.body || "",
        ),
        author,
        avatar,
        category: getCategoryName(discussion),
        replies: countReplies(discussion),
        time,
      };
    });
});

const latestProjectsLive = computed(() => {
  return liveDiscussions.value
    .filter(isShowcaseThread)
    .slice(0, 2)
    .map((discussion) => {
      const { author, avatar } = getAuthorInfo(discussion);
      const tags = Array.isArray(discussion.tags)
        ? discussion.tags
            .map((tag) =>
              typeof tag === "object" ? tag.label || tag.name : tag,
            )
            .filter(Boolean)
        : [];

      return {
        id: discussion.id,
        title: discussion.title || "Untitled project",
        desc: cleanText(
          discussion.description || discussion.excerpt || discussion.body || "",
        ),
        author,
        avatar,
        tags: tags.slice(0, 3),
        stars:
          discussion.likes !== undefined
            ? discussion.likes
            : discussion.votes || 0,
        image: resolveMediaUrl(
          discussion.thumbnail || discussion.image,
          "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&q=80&w=900",
        ),
      };
    });
});

const displayThreads = computed(() =>
  recentThreadsLive.value.length ? recentThreadsLive.value : previewThreads,
);
const displayProjects = computed(() =>
  latestProjectsLive.value.length ? latestProjectsLive.value : previewProjects,
);
const heroThread = computed(() => displayThreads.value[0]);
const primaryProject = computed(() => displayProjects.value[0]);

const goToThread = (id) => {
  router.push(id ? `/forum/${id}` : "/forum");
};
</script>

<template>
  <div class="landing-page">
    <Navbar />

    <!-- ═══════════════  HERO  ═══════════════ -->
    <main class="landing-hero">
      <!-- Animated background -->
      <div class="hero-bg-effects" aria-hidden="true">
        <div class="particle p1"></div>
        <div class="particle p2"></div>
        <div class="particle p3"></div>
        <div class="particle p4"></div>
        <div class="particle p5"></div>
        <div class="particle p6"></div>
        <div class="particle p7"></div>
        <div class="particle p8"></div>
      </div>

      <div class="container">
        <div class="hero-grid">
          <!-- Left: Copy -->
          <section class="hero-copy scroll-reveal">
            <!-- Dot grid decorator -->
            <div class="dot-grid-decorator" aria-hidden="true">
              <span v-for="n in 36" :key="n" class="decorator-dot"></span>
            </div>

            <div class="eyebrow-badge">
              <span class="eyebrow-dot"></span>
              Developer community workspace
            </div>

            <h1 class="hero-title">
              <span class="hero-title-dark">Build.</span>
              <span class="hero-title-gradient"> Share.</span>
              <br />
              <span class="hero-title-dark">Grow</span>
              <span class="hero-title-gradient"> Together.</span>
            </h1>

            <p class="hero-lead">
              ANTFORUM is a clean, modern space for developers to connect, learn, and build amazing things together.
            </p>

            <div class="hero-actions">
              <router-link
                :to="auth.user ? '/forum/create' : '/login'"
                class="primary-action-btn"
              >
                <i class="bi bi-plus-circle"></i>
                Start a Discussion
              </router-link>
              <router-link to="/forum" class="secondary-action-btn">
                Browse Forum &rarr;
              </router-link>
            </div>

            <div class="feature-pills" aria-label="ANT Forum platform support">
              <span class="feature-pill">
                <i class="bi bi-code-slash"></i> Markdown editor
              </span>
              <span class="feature-pill">
                <i class="bi bi-tag"></i> Admin tags
              </span>
              <span class="feature-pill">
                <i class="bi bi-person-badge"></i> Member profiles
              </span>
              <span class="feature-pill">
                <i class="bi bi-window-sidebar"></i> Showcases
              </span>
            </div>
          </section>

          <!-- Right: Live Activity Feed -->
          <section
            class="activity-feed glass-panel scroll-reveal"
            aria-label="Forum activity feed"
          >
            <div class="feed-header">
              <div class="feed-header-left">
                <span class="feed-label">
                  <span class="pulse-dot"></span> Live
                </span>
                <strong class="feed-title">Community Activity</strong>
              </div>
              <img :src="heroStack" alt="ANT Forum" class="feed-logo" />
            </div>

            <!-- Featured thread card -->
            <div class="featured-card" @click="goToThread(heroThread?.id)">
              <div class="featured-card-content">
                <span class="featured-badge">{{ getCategoryName(heroThread) }}</span>
                <strong class="featured-title">{{ heroThread?.title || "Welcome to ANT Forum" }}</strong>
                <p class="featured-desc">{{ cleanText(heroThread?.description || heroThread?.desc || "Explore the community discussions, showcase projects, and connect with other developers.") }}</p>
              </div>
              <button class="featured-arrow-btn" type="button" aria-label="Go to discussion">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>

            <!-- Animated stats -->
            <div class="preview-stats scroll-reveal">
              <div
                v-for="(stat, index) in displayStats"
                :key="stat.label"
                class="stat-card"
                :style="{ '--stagger': index }"
              >
                <div class="stat-icon-wrap" :class="stat.colorClass">
                  <i class="bi" :class="stat.icon"></i>
                </div>
                <div class="stat-info">
                  <strong>
                    <template v-if="statsVisible">{{ countUpValues[index] }}+</template>
                    <template v-else>0+</template>
                  </strong>
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-subtext">{{ stat.subtext }}</span>
                </div>
              </div>
            </div>

            <!-- Category buttons -->
            <div class="preview-categories-buttons">
              <button
                v-for="btn in categoryButtons"
                :key="btn.label"
                class="cat-button-pill"
                type="button"
                @click="goToCategory(btn.query)"
              >
                <span class="cat-btn-content">
                  <i class="bi" :class="btn.icon"></i>
                  <span>{{ btn.label }}</span>
                </span>
                <i class="bi bi-chevron-right chevron-small"></i>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- ═══════════════  CAPABILITY STRIP / TECHNICAL CONVERSATIONS  ═══════════════ -->
    <section class="caps-section">
      <div class="container">
        <!-- Section Header -->
        <div class="caps-header scroll-reveal">
          <span class="caps-eyebrow-badge">
            <i class="bi bi-sparkles"></i> Built for better technical discussions
          </span>
          <h2 class="caps-title">
            Everything you need for <span class="text-gradient-pink-purple-blue">better</span><br />
            technical conversations
          </h2>
          <p class="caps-desc">
            Powerful tools that help you ask better questions, share your work, and connect with the right people.
          </p>
        </div>

        <!-- Capability Grid -->
        <div class="caps-grid">
          <!-- Column 1: Ask With Context -->
          <article class="caps-col scroll-reveal" style="--stagger: 0">
            <div class="caps-col-header">
              <span class="caps-num-badge num-pink">01</span>
              <div class="cap-illustration-wrap">
                <!-- Sparkles & loop SVG -->
                <svg class="cap-illustration-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,90 C15,40 145,20 140,80 C135,130 35,140 20,90" stroke="rgba(236, 72, 153, 0.35)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M12,45 L8,40" stroke="rgba(236, 72, 153, 0.45)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M25,28 L23,22" stroke="rgba(236, 72, 153, 0.45)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M42,20 L44,14" stroke="rgba(236, 72, 153, 0.45)" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <!-- Glowing central icon -->
                <div class="cap-icon-circle bg-pink-radial">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="cap-icon icon-pink">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h6" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="caps-col-content">
              <h3 class="cap-heading">Ask With Context</h3>
              <p class="cap-desc">
                Markdown, tags, categories, and code blocks keep posts easy to scan and understand.
              </p>
              <ul class="cap-checklist">
                <li>
                  <i class="bi bi-check-circle-fill check-pink"></i>
                  <span>Structured markdown</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-pink"></i>
                  <span>Smart tags & categories</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-pink"></i>
                  <span>Syntax-highlighted code</span>
                </li>
              </ul>
            </div>
          </article>

          <!-- Column 2: Show The Work -->
          <article class="caps-col scroll-reveal" style="--stagger: 1">
            <div class="caps-col-header">
              <span class="caps-num-badge num-green">02</span>
              <div class="cap-illustration-wrap">
                <!-- Circular arrow loop SVG -->
                <svg class="cap-illustration-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M140,60 C150,110 90,145 60,135 C30,125 15,75 40,45 C65,15 125,25 135,55" stroke="rgba(34, 197, 94, 0.35)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M130,45 L135,55 L125,58" stroke="rgba(34, 197, 94, 0.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M20,30 L24,34 L20,38 L16,34 Z" fill="rgba(34, 197, 94, 0.35)" />
                </svg>
                <!-- Glowing central icon -->
                <div class="cap-icon-circle bg-green-radial">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="cap-icon icon-green">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="caps-col-content">
              <h3 class="cap-heading">Show The Work</h3>
              <p class="cap-desc">
                Showcase projects, screenshots, and tags to turn your work into public proof.
              </p>
              <ul class="cap-checklist">
                <li>
                  <i class="bi bi-check-circle-fill check-green"></i>
                  <span>Project & screenshot galleries</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-green"></i>
                  <span>Public proof of your work</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-green"></i>
                  <span>Instant context with tags</span>
                </li>
              </ul>
            </div>
          </article>

          <!-- Column 3: Discuss Better -->
          <article class="caps-col scroll-reveal" style="--stagger: 2">
            <div class="caps-col-header">
              <span class="caps-num-badge num-blue">03</span>
              <div class="cap-illustration-wrap">
                <!-- Arcs & sparks SVG -->
                <svg class="cap-illustration-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25,60 C20,95 45,130 90,135 C135,140 145,95 130,70" stroke="rgba(59, 130, 246, 0.35)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M15,90 C12,110 30,135 60,142" stroke="rgba(59, 130, 246, 0.25)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="3 3" />
                  <path d="M142,40 L148,36" stroke="rgba(59, 130, 246, 0.45)" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M150,52 L157,51" stroke="rgba(59, 130, 246, 0.45)" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <!-- Glowing central icon -->
                <div class="cap-icon-circle bg-blue-radial">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="cap-icon icon-blue">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="caps-col-content">
              <h3 class="cap-heading">Discuss Better</h3>
              <p class="cap-desc">
                Replies, saves, votes, and clean author details make every thread easier to follow.
              </p>
              <ul class="cap-checklist">
                <li>
                  <i class="bi bi-check-circle-fill check-blue"></i>
                  <span>Threaded replies</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-blue"></i>
                  <span>Save & vote on posts</span>
                </li>
                <li>
                  <i class="bi bi-check-circle-fill check-blue"></i>
                  <span>Author reputation & details</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════  ACTIVITY SECTION  ═══════════════ -->
    <section class="activity-section">
      <div class="container">
        <div class="section-top scroll-reveal">
          <div class="section-top-left">
            <span class="section-label">
              Community Pulse <i class="bi bi-activity"></i>
            </span>
            <h2 class="section-title">
              Recent work, questions,<br />
              and <span class="text-gradient-purple">project signals</span>
            </h2>
            <p class="section-desc">See what the community is building, discussing, and asking.</p>
          </div>
          <router-link to="/forum" class="open-forum-btn">
            Open forum <i class="bi bi-arrow-up-right"></i>
          </router-link>
        </div>

        <div class="activity-grid">
          <!-- Left: Featured Showcase Card -->
          <article
            class="project-spotlight-card glass-panel scroll-reveal"
            @click="goToThread(primaryProject?.id)"
          >
            <div class="spotlight-header">
              <span class="spotlight-badge">
                <i class="bi bi-star"></i> FEATURED SHOWCASE
              </span>
            </div>
            
            <div class="spotlight-image-container">
              <img :src="primaryProject?.image" :alt="primaryProject?.title" />
            </div>
            
            <div class="spotlight-body">
              <h3>{{ primaryProject?.title }}</h3>
              <p>{{ primaryProject?.desc }}</p>
              
              <div class="spotlight-footer">
                <div class="author-info">
                  <img
                    :src="primaryProject?.avatar"
                    :alt="primaryProject?.author"
                  />
                  <span class="author-name">{{ primaryProject?.author }}</span>
                  <span class="author-divider">&middot;</span>
                  <span class="author-tag">{{ primaryProject?.tags?.[0] || 'Showcase' }}</span>
                </div>
                <router-link :to="`/forum/${primaryProject?.id}`" class="view-showcase-btn" @click.stop="goToThread(primaryProject?.id)">
                  View showcase <i class="bi bi-arrow-right"></i>
                </router-link>
              </div>
            </div>
          </article>

          <!-- Right: Recent Discussions Card -->
          <div class="discussions-list-card glass-panel scroll-reveal">
            <div class="list-card-header">
              <div class="list-card-title-wrap">
                <i class="bi bi-chat-left-text-fill"></i>
                <span class="list-card-title">RECENT DISCUSSIONS</span>
              </div>
              <i class="bi bi-three-dots"></i>
            </div>

            <div class="discussions-items-wrapper">
              <div
                v-for="thread in recentThreadsLive"
                :key="thread.id"
                class="discussion-item-row"
                @click="goToThread(thread.id)"
              >
                <div class="discussion-item-left">
                  <div class="avatar-container">
                    <img :src="thread.avatar" :alt="thread.author" class="item-avatar" />
                  </div>
                  <div class="item-content-wrap">
                    <strong class="item-title">{{ thread.title }}</strong>
                    <span class="item-meta">
                      {{ thread.category }} &middot; by {{ thread.author }}
                    </span>
                  </div>
                </div>
                <div class="discussion-item-right">
                  <span class="replies-counter-badge">
                    {{ thread.replies }}
                  </span>
                </div>
              </div>
            </div>

            <div class="list-card-footer">
              <router-link to="/forum" class="explore-discussions-btn">
                Explore all discussions &rarr;
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════  WORKFLOW  ═══════════════ -->
    <section class="workflow-section">
      <div class="container">
        <div class="workflow-panel glass-card scroll-reveal">
          <!-- Left side copy column -->
          <div class="workflow-copy-col">
            <span class="eyebrow-badge">
              <i class="bi bi-map-fill"></i> WORKFLOW MAP
            </span>
            <h2 class="section-title">
              Built around how<br />
              developers<br />
              actually <span class="text-gradient-purple">ask for help</span>
            </h2>
            <p class="workflow-desc-p">
              The landing page points you straight to the useful parts of the app: forum questions, categorized content, and showcase work.
            </p>
            <div class="path-badge">
              <i class="bi bi-compass-fill"></i> Your path to productive help
            </div>
          </div>

          <!-- Right side steps column -->
          <div class="workflow-steps-col">
            <!-- Background decorators -->
            <div class="workflow-path-bg" aria-hidden="true">
              <svg viewBox="0 0 760 220" fill="none" class="workflow-path-svg" preserveAspectRatio="none">
                <!-- Wavy Lavender Backdrop Blob -->
                <path d="M 30 110 C 30 50, 80 30, 160 30 C 260 30, 310 90, 420 90 C 530 90, 580 40, 670 40 C 730 40, 750 70, 750 110 C 750 150, 730 190, 670 190 C 580 190, 530 150, 420 150 C 310 150, 260 200, 160 200 C 80 200, 30 170, 30 110 Z" class="workflow-blob-path" />
                <!-- Connecting Dotted Route -->
                <path d="M 95 40 Q 95 60, 95 80 C 142 220, 237 220, 285 80 C 332 220, 427 220, 475 80 C 522 220, 617 220, 665 80 Q 665 60, 710 40" stroke="#6366f1" stroke-width="2" stroke-dasharray="5 7" class="workflow-route-line" />
              </svg>
              <!-- Map pin above card 1 -->
              <div class="path-icon-pin"><i class="bi bi-geo-alt-fill"></i></div>
              <!-- Checkered flag at finish -->
              <div class="path-icon-flag"><i class="bi bi-flag-fill"></i></div>
              <!-- Trees at bottom left -->
              <div class="pine-trees-wrap">
                <i class="bi bi-tree-fill tree-lg"></i>
                <i class="bi bi-tree-fill tree-sm"></i>
              </div>
              <!-- Mountains at bottom right -->
              <div class="mountains-wrap">
                <svg viewBox="0 0 100 50" class="mountain-svg" style="width: 45px; height: 22px; fill: currentColor;">
                  <polygon points="10,50 30,20 50,50" />
                  <polygon points="40,50 65,10 90,50" />
                </svg>
              </div>
            </div>

            <!-- Steps Cards Grid -->
            <div class="steps-cards-row">
              <article
                v-for="(step, index) in workflowSteps"
                :key="step.label"
                class="step-card-item scroll-reveal"
                :style="{ '--stagger': index }"
              >
                <!-- Number indicator above card -->
                <div class="step-card-num" :class="step.colorClass">
                  {{ index + 1 }}
                </div>
                <!-- Circular Icon Wrap -->
                <div class="step-card-icon-wrap" :class="step.colorClass">
                  <i class="bi" :class="step.icon"></i>
                </div>
                <!-- Card content -->
                <div class="step-card-content">
                  <h4 class="step-card-title">{{ step.label }}</h4>
                  <p class="step-card-desc">{{ step.text }}</p>
                </div>
                <!-- Colored accent line at bottom -->
                <div class="step-card-accent-bar" :class="step.colorClass"></div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════  CTA / START HERE  ═══════════════ -->
    <section class="final-cta">
      <div class="container">
        <div class="cta-panel glass-card scroll-reveal">
          <!-- Left side copy column -->
          <div class="cta-copy-col">
            <span class="eyebrow-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
                <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
                <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
                <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
                <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
                <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
                <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
              </svg>
              START HERE
            </span>
            <h2 class="cta-title">
              Bring your next<br />
              technical problem<br />
              into <span class="text-gradient-blue">ANT Forum.</span>
            </h2>
            <p class="cta-desc-p">
              Get help from experienced developers, share knowledge, and find the best solution—together.
            </p>
            <div class="cta-actions">
              <router-link
                :to="auth.user ? '/forum/create' : '/login'"
                class="cta-primary-btn"
              >
                <i class="bi bi-pencil-square"></i>
                Ask now
              </router-link>
              <router-link to="/showcase" class="cta-secondary-link">
                View showcase &rarr;
              </router-link>
            </div>
          </div>

          <!-- Right side visual stages column -->
          <div class="cta-visual-col">
            <!-- Three cards/circles row -->
            <div class="cta-stages-row">
              <!-- Stage 1: Think -->
              <div class="cta-stage-item">
                <div class="cta-ring-outer theme-purple">
                  <div class="cta-ring-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" />
                      <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" />
                      <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" />
                      <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" />
                      <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" />
                      <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" />
                    </svg>
                  </div>
                </div>
                <h4 class="cta-stage-title theme-purple-text">Think</h4>
                <p class="cta-stage-desc">Stuck on a technical issue or looking for a better approach?</p>
              </div>

              <!-- Stage 2: Find Help -->
              <div class="cta-stage-item">
                <div class="cta-ring-outer theme-blue">
                  <div class="cta-ring-inner">
                    <i class="bi bi-search"></i>
                  </div>
                </div>
                <h4 class="cta-stage-title theme-blue-text">Find Help</h4>
                <p class="cta-stage-desc">Ask the community and get insights from real developers.</p>
              </div>

              <!-- Stage 3: Get Results -->
              <div class="cta-stage-item">
                <div class="cta-ring-outer theme-green">
                  <div class="cta-ring-inner">
                    <i class="bi bi-check-circle"></i>
                  </div>
                </div>
                <h4 class="cta-stage-title theme-green-text">Get Results</h4>
                <p class="cta-stage-desc">Solve problems faster and build better solutions, together.</p>
              </div>

              <!-- Connecting Dotted Lines behind stages -->
              <div class="cta-stages-dots-wrap" aria-hidden="true">
                <div class="dots-line dot-purple-blue"></div>
                <div class="dots-line dot-blue-green"></div>
              </div>
            </div>

            <!-- Bottom illustration/timeline wave -->
            <div class="cta-wave-timeline" aria-hidden="true">
              <svg viewBox="0 0 600 120" fill="none" class="cta-timeline-svg">
                <path d="M 50 80 Q 150 40, 250 80 T 450 80 T 550 50" stroke="#e2e8f0" stroke-width="2" />
                <path d="M 50 80 Q 150 40, 250 80 T 450 80 T 550 50" stroke="url(#timeline-grad)" stroke-width="2" stroke-dasharray="5 5" class="wavy-dashed" />
                <defs>
                  <linearGradient id="timeline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#818cf8" />
                    <stop offset="50%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              <!-- Pulse Dots on wave -->
              <div class="wave-dot dot-think" style="left: 17%; top: 62px;">
                <span class="pulse-ring"></span>
              </div>
              <div class="wave-dot dot-find" style="left: 50%; top: 78px;">
                <span class="pulse-ring"></span>
              </div>
              <div class="wave-dot dot-results" style="left: 83%; top: 74px;">
                <span class="pulse-ring"></span>
              </div>

              <!-- Floating Chat Badges -->
              <div class="floating-chat badge-think" style="left: 17%; top: -14px;">
                <span class="badge-text">Help! API not returning data 😢</span>
              </div>
              <div class="floating-chat badge-find" style="left: 50%; top: 2px;">
                <span class="badge-text">Try checking your auth headers 👀</span>
              </div>
              <div class="floating-chat badge-results" style="left: 83%; top: -4px;">
                <span class="badge-text">That worked! Thanks! 🎉</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* ╔══════════════════════════════════════════════╗
   ║  ANT FORUM — PREMIUM LANDING PAGE STYLES     ║
   ╚══════════════════════════════════════════════╝ */

/* ── Design tokens ── */
.landing-page {
  min-height: 100vh;
  color: var(--color-text);
  overflow-x: clip;
  --page-bg: var(--color-bg);
  --panel-bg: var(--color-surface);
  --panel-soft: var(--color-surface-hover);
  --panel-strong: var(--color-surface-elevated);
  --grid-line: var(--color-border-soft);
  --landing-border: var(--color-border);
  --muted: var(--color-text-muted);
  --accent: var(--color-primary);
  --cyan: #7DA0CA;
  --green: #21b982;
  --glow-1: rgba(84, 131, 179, 0.35);
  --glow-2: rgba(125, 160, 202, 0.25);
  --glow-3: rgba(193, 232, 255, 0.2);
}

/* ── HERO BACKGROUND EFFECTS ── */
.landing-hero {
  position: relative;
  padding: 80px 0 48px;
  overflow: hidden;
}

.hero-bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
/* Floating particles */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.4);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.2);
  animation: float-particle linear infinite;
}

.p1 { left: 10%; top: 20%; width: 3px; height: 3px; animation-duration: 18s; animation-delay: 0s; }
.p2 { left: 25%; top: 60%; width: 5px; height: 5px; animation-duration: 22s; animation-delay: -3s; background: rgba(99, 102, 241, 0.3); }
.p3 { left: 45%; top: 30%; width: 3px; height: 3px; animation-duration: 20s; animation-delay: -7s; }
.p4 { left: 65%; top: 70%; width: 4px; height: 4px; animation-duration: 16s; animation-delay: -2s; background: rgba(167, 139, 250, 0.3); }
.p5 { left: 80%; top: 15%; width: 6px; height: 6px; animation-duration: 24s; animation-delay: -5s; }
.p6 { left: 15%; top: 80%; width: 3px; height: 3px; animation-duration: 19s; animation-delay: -8s; background: rgba(167, 139, 250, 0.25); }
.p7 { left: 55%; top: 50%; width: 4px; height: 4px; animation-duration: 21s; animation-delay: -12s; }
.p8 { left: 90%; top: 40%; width: 3px; height: 3px; animation-duration: 17s; animation-delay: -4s; background: rgba(99, 102, 241, 0.25); }

@keyframes float-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate(-40px, -60px) scale(1.5); opacity: 0.7; }
  90% { opacity: 0.3; }
  100% { transform: translate(30px, -120px) scale(0.8); opacity: 0; }
}

/* ── HERO GRID ── */
.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
  gap: 48px;
  align-items: center;
  min-height: calc(100vh - 190px);
}

/* ── HERO COPY (Transparent section) ── */
.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 600px;
  padding: 24px 24px 24px 0;
  position: relative;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  overflow: visible;
}

/* ── Eyebrow Status Badge ── */
.eyebrow-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  width: fit-content;
  margin-bottom: 24px;
}

.eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981; /* active green */
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
}

/* ── Hero Title ── */
.hero-title {
  margin: 0 0 24px;
  font-size: clamp(3.4rem, 6.2vw, 5rem);
  font-weight: 950;
  line-height: 1.05;
  letter-spacing: -0.02em;
  word-break: break-word;
}

.hero-title-dark {
  color: #f8fafc; /* dark mode default */
}

.hero-title-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Hero Lead ── */
.hero-lead {
  max-width: 540px;
  margin: 0 0 32px;
  color: #94a3b8;
  font-size: clamp(1.1rem, 1.8vw, 1.25rem);
  line-height: 1.6;
}

/* ── Hero CTA Buttons ── */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 40px;
}

.primary-action-btn {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 28px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff;
  background: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.25);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  text-decoration: none;
  transition: all 0.25s ease;
}

.primary-action-btn:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
}

.secondary-action-btn {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 28px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  transition: all 0.25s ease;
}

.secondary-action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-2px);
}

/* ── Feature Pills ── */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.feature-pill {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 10px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.78rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.feature-pill i {
  color: #6366f1;
}

.feature-pill:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

/* ── Dot Grid Decorator ── */
.dot-grid-decorator {
  position: absolute;
  bottom: -40px;
  left: -80px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;
}

.decorator-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #6366f1;
}

/* ── ACTIVITY FEED (Right Panel Card) ── */
.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(24px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.activity-feed {
  display: flex;
  flex-direction: column;
  align-self: center;
  padding: 28px;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  gap: 20px;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 1;
}

.feed-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feed-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-live 1.5s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.6); }
}

.feed-title {
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
}

.feed-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

/* ── Featured Card ── */
.featured-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 16px;
}

.featured-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.featured-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.featured-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.featured-title {
  color: #fff;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.featured-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.featured-card:hover .featured-arrow-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
  transform: scale(1.05);
}

/* ── Stats Grid ── */
.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  z-index: 1;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.25s ease;
}

.stat-card:hover {
  border-color: rgba(99, 102, 241, 0.2);
  background: rgba(255, 255, 255, 0.03);
  transform: translateY(-2px);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* Pastel accent categories */
.threads-accent { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
.replies-accent { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.projects-accent { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.categories-accent { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-info strong {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.stat-subtext {
  color: #64748b;
  font-size: 0.64rem;
  margin-top: 1px;
}

/* ── Category Buttons ── */
.preview-categories-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  z-index: 1;
}

.cat-button-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-grow: 1;
  min-width: calc(33.3% - 10px);
  text-align: left;
}

.cat-btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-btn-content i {
  color: #6366f1;
  font-size: 0.9rem;
}

.cat-button-pill .chevron-small {
  font-size: 0.7rem;
  opacity: 0.6;
  transition: transform 0.2s ease;
}

.cat-button-pill:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  color: #fff;
  transform: translateY(-1px);
}

.cat-button-pill:hover .chevron-small {
  transform: translateX(2px);
  opacity: 1;
}

/* ══════════════════════════════════════
   CAPABILITY STRIP / TECHNICAL CONVERSATIONS
   ══════════════════════════════════════ */
.caps-section {
  padding: 80px 0 64px;
}

.caps-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 56px;
}

.caps-eyebrow-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #6366f1;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.caps-title {
  margin: 0 0 20px;
  font-size: clamp(2.2rem, 5.2vw, 3.4rem);
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.text-gradient-pink-purple-blue {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.caps-desc {
  color: #94a3b8;
  font-size: clamp(1.05rem, 1.8vw, 1.2rem);
  line-height: 1.6;
  max-width: 580px;
  margin: 0 auto;
}

.caps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-radius: 24px;
  position: relative;
}

.caps-col {
  padding: 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  position: relative;
}

.caps-col:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  border-right: 1.5px dashed rgba(255, 255, 255, 0.08);
}

/* Number Badges */
.caps-num-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 24px;
}

.caps-num-badge.num-pink {
  background: rgba(236, 72, 153, 0.1);
  color: #f472b6;
}

.caps-num-badge.num-green {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.caps-num-badge.num-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

/* Illustration Wrap & SVGs */
.cap-illustration-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cap-illustration-wrap::before {
  content: "";
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  filter: blur(22px);
  opacity: 0.35;
  z-index: 0;
}

.caps-col:nth-child(1) .cap-illustration-wrap::before {
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
}
.caps-col:nth-child(2) .cap-illustration-wrap::before {
  background: radial-gradient(circle, #22c55e 0%, transparent 70%);
}
.caps-col:nth-child(3) .cap-illustration-wrap::before {
  background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
}

.cap-illustration-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: visible;
}

.cap-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  z-index: 1;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.caps-col:hover .cap-icon-circle {
  transform: scale(1.1);
}

.cap-icon {
  width: 26px;
  height: 26px;
}

.cap-icon.icon-pink { color: #f472b6; }
.cap-icon.icon-green { color: #4ade80; }
.cap-icon.icon-blue { color: #60a5fa; }

/* Content & Checklist */
.caps-col-content {
  width: 100%;
}

.cap-heading {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
}

.cap-desc {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 24px;
  min-height: 48px;
}

.cap-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cap-checklist li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #e2e8f0;
}

.cap-checklist li i {
  font-size: 0.95rem;
}

.cap-checklist li i.check-pink { color: #f472b6; }
.cap-checklist li i.check-green { color: #4ade80; }
.cap-checklist li i.check-blue { color: #60a5fa; }

/* ── Activity Section Spacing Alignment ── */
.activity-section {
  padding: 72px 0 48px;
}

/* ══════════════════════════════════════
   ACTIVITY SECTION
   ══════════════════════════════════════ */
.section-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.section-top-left {
  display: flex;
  flex-direction: column;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6366f1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.section-label i {
  font-size: 0.95rem;
}

.section-title {
  margin: 12px 0 8px;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.section-desc {
  margin: 0;
  color: #94a3b8;
  font-size: 1.02rem;
}

.open-forum-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
  font-size: 0.88rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  align-self: flex-end;
  margin-bottom: 4px;
}

.open-forum-btn i {
  transition: transform 0.25s ease;
}

.open-forum-btn:hover {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.open-forum-btn:hover i {
  transform: translate(2px, -2px);
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: stretch;
}

/* ── Left Showcase Spotlight Card ── */
.project-spotlight-card {
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-spotlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(99, 102, 241, 0.25);
}

.spotlight-header {
  margin-bottom: 16px;
}

.spotlight-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.spotlight-image-container {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  height: 270px;
}

.spotlight-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-spotlight-card:hover img {
  transform: scale(1.02);
}

.spotlight-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.spotlight-body h3 {
  margin: 0 0 12px;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
}

.spotlight-body p {
  margin: 0 0 24px;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #cbd5e1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spotlight-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-info img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 700;
  font-size: 0.85rem;
}

.author-divider {
  color: #94a3b8;
  font-size: 0.85rem;
}

.author-tag {
  color: #94a3b8;
  font-size: 0.82rem;
}

.view-showcase-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s ease;
}

.view-showcase-btn:hover {
  background: #4f46e5;
  color: #fff;
  transform: translateY(-1px);
}

/* ── Right Recent Discussions Card ── */
.discussions-list-card {
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.list-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
}

.list-card-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-card-title-wrap i {
  color: #4f46e5;
  font-size: 1.1rem;
}

.list-card-title {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #64748b;
}

.discussions-items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.discussion-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.25s ease;
  gap: 16px;
}

.discussion-item-row:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.discussion-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.15);
}

.item-content-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-title {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.35;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  margin-top: 4px;
  font-size: 0.74rem;
  color: #64748b;
}

.discussion-item-right {
  flex-shrink: 0;
}

.replies-counter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 26px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.15);
}

.discussion-item-row:hover .replies-counter-badge {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.list-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.explore-discussions-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 800;
  color: #4f46e5;
  text-decoration: none;
  transition: all 0.2s ease;
}

.explore-discussions-btn:hover {
  color: #6366f1;
  transform: translateX(2px);
}

/* ══════════════════════════════════════
   WORKFLOW
   ══════════════════════════════════════ */
/* ── WORKFLOW SECTION ── */
.workflow-section {
  padding: 64px 0 48px;
}

.workflow-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(420px, 1.8fr);
  gap: 48px;
  padding: 56px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
}

.workflow-copy-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.workflow-copy-col .eyebrow-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  width: fit-content;
  margin-bottom: 24px;
}

.workflow-copy-col .section-title {
  margin: 0 0 20px;
  font-size: clamp(2rem, 4.2vw, 2.8rem);
  font-weight: 950;
  line-height: 1.15;
}

.text-gradient-purple {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-blue {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.workflow-desc-p {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 320px;
}

.path-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.06);
  color: #818cf8;
  font-size: 0.78rem;
  font-weight: 700;
  width: fit-content;
}

/* Steps column on the right */
.workflow-steps-col {
  position: relative;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 64px 0;
}

/* Dotted path SVG and icon decorators */
.workflow-path-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.workflow-path-svg {
  width: 100%;
  height: 100%;
  opacity: 0.65;
}

/* Background blob style */
.workflow-blob-path {
  fill: rgba(129, 140, 248, 0.04);
  stroke: none !important;
  transition: fill 0.3s ease;
}

.path-icon-pin {
  position: absolute;
  left: 12.5%;
  top: 18%;
  color: #6366f1;
  font-size: 1.25rem;
  transform: translate(-50%, -50%);
  animation: float-pin 3s ease-in-out infinite;
}

@keyframes float-pin {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.path-icon-flag {
  position: absolute;
  left: 93.4%;
  top: 18%;
  color: #6366f1;
  font-size: 1.25rem;
  transform: translate(-50%, -50%);
}

.pine-trees-wrap {
  position: absolute;
  left: 24px;
  bottom: 8px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  opacity: 0.45;
  color: #818cf8;
}

.tree-lg { font-size: 1.5rem; }
.tree-sm { font-size: 1.15rem; }

.mountains-wrap {
  position: absolute;
  right: 24px;
  bottom: 8px;
  opacity: 0.45;
  color: #818cf8;
}

/* Cards Row */
.steps-cards-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.step-card-item {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.step-card-item:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.step-card-num {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.74rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.step-card-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 20px;
}

.step-card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
}

.step-card-desc {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #94a3b8;
}

.step-card-accent-bar {
  width: 24px;
  height: 3px;
  border-radius: 99px;
  margin-top: 20px;
}

/* Step color configurations */
.step-create { background-color: #6366f1 !important; color: #a5b4fc; }
div.step-create.step-card-icon-wrap { background-color: rgba(99, 102, 241, 0.1) !important; color: #a5b4fc; }

.step-discuss { background-color: #3b82f6 !important; color: #93c5fd; }
div.step-discuss.step-card-icon-wrap { background-color: rgba(59, 130, 246, 0.1) !important; color: #93c5fd; }

.step-save { background-color: #10b981 !important; color: #6ee7b7; }
div.step-save.step-card-icon-wrap { background-color: rgba(16, 185, 129, 0.1) !important; color: #6ee7b7; }

.step-showcase { background-color: #8b5cf6 !important; color: #c4b5fd; }
div.step-showcase.step-card-icon-wrap { background-color: rgba(139, 92, 246, 0.1) !important; color: #c4b5fd; }


/* ══════════════════════════════════════
   START HERE / FINAL CTA
   ══════════════════════════════════════ */
.final-cta {
  padding: 48px 0 80px;
}

.cta-panel {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  padding: 56px;
  border-radius: 28px;
  position: relative;
  overflow: visible; /* so chat tooltips can float slightly outside if needed */
}

.cta-copy-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cta-copy-col .eyebrow-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  width: fit-content;
  margin-bottom: 24px;
}

.cta-title {
  margin: 0 0 20px;
  font-size: clamp(2rem, 4.2vw, 2.8rem);
  font-weight: 950;
  line-height: 1.15;
  color: #ffffff;
}

.cta-desc-p {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 36px;
  max-width: 440px;
}

.cta-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.cta-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 12px;
  background: #4f46e5;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  border: 1px solid rgba(99, 102, 241, 0.25);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.cta-primary-btn:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.cta-secondary-link {
  display: inline-flex;
  align-items: center;
  color: #a5b4fc;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.25s ease;
}

.cta-secondary-link:hover {
  color: #818cf8;
  transform: translateX(4px);
}

/* Right side cta stages visual */
.cta-visual-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  min-height: 280px;
}

.cta-stages-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  position: relative;
  z-index: 2;
  margin-top: 10px;
}

.cta-stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Glowing outer ring */
.cta-ring-outer {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  background: rgba(15, 23, 42, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.cta-stage-item:hover .cta-ring-outer {
  transform: scale(1.08);
}

.cta-ring-inner {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(15, 23, 42, 0.6);
}

/* Stage theme color styles */
.theme-purple {
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
}
.theme-purple .cta-ring-inner {
  color: #a78bfa;
}
.theme-purple-text {
  color: #a78bfa !important;
}

.theme-blue {
  border: 1.5px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
}
.theme-blue .cta-ring-inner {
  color: #60a5fa;
}
.theme-blue-text {
  color: #60a5fa !important;
}

.theme-green {
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
}
.theme-green .cta-ring-inner {
  color: #34d399;
}
.theme-green-text {
  color: #34d399 !important;
}

.cta-stage-title {
  margin: 0 0 8px;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.cta-stage-desc {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.45;
  color: #94a3b8;
  max-width: 140px;
}

/* Dotted horizontal connector lines behind rings */
.cta-stages-dots-wrap {
  position: absolute;
  top: 32px;
  left: 12%;
  right: 12%;
  height: 2px;
  z-index: 0;
  pointer-events: none;
}

.dots-line {
  position: absolute;
  top: 0;
  height: 2px;
  width: 32%;
}

.dots-line.dot-purple-blue {
  left: 5%;
  border-top: 2px dotted rgba(139, 92, 246, 0.4);
}

.dots-line.dot-blue-green {
  right: 5%;
  border-top: 2px dotted rgba(59, 130, 246, 0.4);
}

/* Wavy illustration path section */
.cta-wave-timeline {
  position: relative;
  width: 100%;
  height: 120px;
  margin-top: 16px;
  z-index: 1;
}

.cta-timeline-svg {
  width: 100%;
  height: 100%;
}

.wavy-dashed {
  animation: wave-dash-move 20s linear infinite;
}

@keyframes wave-dash-move {
  to {
    stroke-dashoffset: -200;
  }
}

/* Pulse dots on wave */
.wave-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.wave-dot.dot-think { background-color: #a78bfa; }
.wave-dot.dot-find { background-color: #60a5fa; }
.wave-dot.dot-results { background-color: #34d399; }

.pulse-ring {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: pulse-ring-anim 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@keyframes pulse-ring-anim {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* Floating Chat Badges */
.floating-chat {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: floating-bounce 4s ease-in-out infinite;
}

.floating-chat.badge-think {
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.15);
  color: #c084fc;
  animation-delay: 0s;
}

.floating-chat.badge-find {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  animation-delay: 1.3s;
}

.floating-chat.badge-results {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  color: #34d399;
  animation-delay: 2.6s;
}

@keyframes floating-bounce {
  0%, 100% { transform: translate(-50%, -100%) translateY(0); }
  50% { transform: translate(-50%, -100%) translateY(-5px); }
}

/* ══════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ══════════════════════════════════════ */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--stagger, 0) * 0.12s);
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ══════════════════════════════════════
   LIGHT MODE OVERRIDES
   ══════════════════════════════════════ */
[data-theme="light"] .landing-page {
  --page-bg: #f7f9fc;
  --panel-bg: #ffffff;
  --panel-soft: #f1f5f9;
  --panel-strong: #ffffff;
  --grid-line: rgba(84, 131, 179, 0.07);
  --landing-border: #dde5ef;
  --muted: #637083;
}

[data-theme="light"] .activity-feed,
[data-theme="light"] .capability-card,
[data-theme="light"] .project-spotlight,
[data-theme="light"] .thread-list,
[data-theme="light"] .workflow-panel,
[data-theme="light"] .cta-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .hero-copy {
  background: transparent;
  border: none;
  box-shadow: none;
}

[data-theme="light"] .hero-title-dark {
  color: #0f172a; /* Slate-900 */
}

[data-theme="light"] .hero-title-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="light"] .hero-lead {
  color: #475569; /* Slate-600 */
}

[data-theme="light"] .secondary-action-btn {
  background: #ffffff;
  border-color: #dde5ef;
  color: #1e293b;
}

[data-theme="light"] .secondary-action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

[data-theme="light"] .feature-pill {
  background: #ffffff;
  border-color: #dde5ef;
  color: #475569;
}

[data-theme="light"] .feature-pill:hover {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.15);
  color: #4f46e5;
}

[data-theme="light"] .glass-panel {
  background: #ffffff;
  border-color: #dde5ef;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

[data-theme="light"] .feed-title {
  color: #0f172a;
}

[data-theme="light"] .featured-card {
  background: #ffffff;
  border-color: #e2e8f0;
}

[data-theme="light"] .featured-card:hover {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(99, 102, 241, 0.25);
}

[data-theme="light"] .featured-title {
  color: #0f172a;
}

[data-theme="light"] .featured-desc {
  color: #637083;
}

[data-theme="light"] .featured-arrow-btn {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

[data-theme="light"] .featured-card:hover .featured-arrow-btn {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

[data-theme="light"] .stat-card {
  background: #ffffff;
  border-color: #e2e8f0;
}

[data-theme="light"] .stat-card:hover {
  border-color: rgba(99, 102, 241, 0.2);
  background: rgba(248, 250, 252, 0.8);
}

[data-theme="light"] .stat-info strong {
  color: #0f172a;
}

[data-theme="light"] .stat-label {
  color: #475569;
}

[data-theme="light"] .stat-subtext {
  color: #94a3b8;
}

[data-theme="light"] .cat-button-pill {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #475569;
}

[data-theme="light"] .cat-button-pill:hover {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
  color: #4f46e5;
}

[data-theme="light"] .particle {
  background: rgba(99, 102, 241, 0.15);
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.08);
}

[data-theme="light"] .section-title {
  color: #0f172a;
}

[data-theme="light"] .section-desc {
  color: #475569;
}

[data-theme="light"] .open-forum-btn {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

[data-theme="light"] .open-forum-btn:hover {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

[data-theme="light"] .project-spotlight-card,
[data-theme="light"] .discussions-list-card {
  background: #ffffff;
  border-color: #dde5ef;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

[data-theme="light"] .spotlight-badge {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

[data-theme="light"] .spotlight-body h3 {
  color: #0f172a;
}

[data-theme="light"] .spotlight-body p {
  color: #475569;
}

[data-theme="light"] .spotlight-footer {
  border-top-color: #dde5ef;
}

[data-theme="light"] .author-name {
  color: #334155;
}

[data-theme="light"] .author-tag {
  color: #64748b;
}

[data-theme="light"] .view-showcase-btn {
  background: rgba(99, 102, 241, 0.06);
  color: #4f46e5;
}

[data-theme="light"] .view-showcase-btn:hover {
  background: #4f46e5;
  color: #ffffff;
}

[data-theme="light"] .list-card-title {
  color: #64748b;
}

[data-theme="light"] .discussion-item-row {
  background: #ffffff;
  border-color: #dde5ef;
}

[data-theme="light"] .discussion-item-row:hover {
  background: #f8fafc;
  border-color: rgba(99, 102, 241, 0.25);
}

[data-theme="light"] .item-title {
  color: #0f172a;
}

[data-theme="light"] .item-meta {
  color: #64748b;
}

[data-theme="light"] .replies-counter-badge {
  background: rgba(99, 102, 241, 0.06);
  color: #4f46e5;
  border-color: rgba(99, 102, 241, 0.12);
}

[data-theme="light"] .discussion-item-row:hover .replies-counter-badge {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #ffffff;
}

[data-theme="light"] .workflow-panel {
  background: #ffffff;
  border-color: #dde5ef;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .workflow-copy-col .eyebrow-badge {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

[data-theme="light"] .workflow-desc-p {
  color: #475569;
}

[data-theme="light"] .path-badge {
  background: #f1f3fe;
  color: #4f46e5;
}

[data-theme="light"] .workflow-path-svg {
  opacity: 0.8;
}

[data-theme="light"] .workflow-route-line {
  stroke: #6366f1;
}

[data-theme="light"] .workflow-blob-path {
  fill: rgba(99, 102, 241, 0.035);
  stroke: none !important;
}

[data-theme="light"] .mountains-wrap {
  color: #c7d2fe;
}

[data-theme="light"] .step-card-item {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .step-card-item:hover {
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .step-card-title {
  color: #0f172a;
}

[data-theme="light"] .step-card-desc {
  color: #475569;
}

[data-theme="light"] .pine-trees-wrap {
  color: #c7d2fe;
}

/* Light mode final cta overrides */
[data-theme="light"] .cta-panel {
  background: #ffffff;
  border-color: #dde5ef;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .cta-copy-col .eyebrow-badge {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

[data-theme="light"] .cta-title {
  color: #0f172a;
}

[data-theme="light"] .cta-desc-p {
  color: #475569;
}

[data-theme="light"] .cta-secondary-link {
  color: #4f46e5;
}

[data-theme="light"] .cta-secondary-link:hover {
  color: #4338ca;
}

[data-theme="light"] .cta-ring-outer {
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.06);
}

[data-theme="light"] .cta-ring-inner {
  background: #f8fafc;
}

[data-theme="light"] .theme-purple {
  border-color: rgba(139, 92, 246, 0.15);
}

[data-theme="light"] .theme-purple .cta-ring-inner {
  color: #8b5cf6;
}

[data-theme="light"] .theme-purple-text {
  color: #8b5cf6 !important;
}

[data-theme="light"] .theme-blue {
  border-color: rgba(59, 130, 246, 0.15);
}

[data-theme="light"] .theme-blue .cta-ring-inner {
  color: #2563eb;
}

[data-theme="light"] .theme-blue-text {
  color: #2563eb !important;
}

[data-theme="light"] .theme-green {
  border-color: rgba(16, 185, 129, 0.15);
}

[data-theme="light"] .theme-green .cta-ring-inner {
  color: #059669;
}

[data-theme="light"] .theme-green-text {
  color: #059669 !important;
}

[data-theme="light"] .cta-stage-desc {
  color: #475569;
}

[data-theme="light"] .floating-chat.badge-think {
  background: #faf5ff;
  border-color: #e9d5ff;
  color: #7e22ce;
}

[data-theme="light"] .floating-chat.badge-find {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

[data-theme="light"] .floating-chat.badge-results {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
}

[data-theme="light"] .cta-stages-dots-wrap .dots-line.dot-purple-blue {
  border-top-color: rgba(139, 92, 246, 0.2);
}

[data-theme="light"] .cta-stages-dots-wrap .dots-line.dot-blue-green {
  border-top-color: rgba(59, 130, 246, 0.2);
}
/* Light mode caps overrides */
[data-theme="light"] .caps-eyebrow-badge {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}
[data-theme="light"] .caps-title {
  color: #0f172a;
}
[data-theme="light"] .caps-desc {
  color: #475569;
}
[data-theme="light"] .cap-heading {
  color: #0f172a;
}
[data-theme="light"] .cap-desc {
  color: #475569;
}
[data-theme="light"] .cap-checklist li {
  color: #334155;
}
[data-theme="light"] .cap-icon-circle {
  background: #ffffff;
  border-color: #dde5ef;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
}
[data-theme="light"] .caps-col:not(:last-child)::after {
  border-right-color: rgba(15, 23, 42, 0.08);
}
/* ══════════════════════════════════════ */

/* ══════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════ */
@media (max-width: 1100px) {
  .hero-grid,
  .activity-grid,
  .workflow-panel,
  .cta-panel,
  .caps-grid {
    grid-template-columns: 1fr;
  }

  .caps-col:not(:last-child)::after {
    display: none;
  }

  .hero-copy {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .landing-hero {
    padding: 24px 0 12px;
  }

  .hero-copy,
  .activity-feed,
  .workflow-panel,
  .cta-panel {
    border-radius: 16px;
    padding: 16px;
  }

  .hero-grid,
  .activity-grid,
  .workflow-panel {
    width: 100%;
  }

  .hero-actions,
  .cta-actions,
  .cta-panel,
  .section-top {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .caps-section {
    padding: 48px 0;
  }

  .caps-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .caps-col {
    padding: 0 16px;
    align-items: center;
    text-align: center;
  }

  .caps-col-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cap-desc {
    min-height: auto;
  }

  .cap-checklist {
    align-items: flex-start;
    text-align: left;
  }

  .preview-stats,
  .workflow-steps {
    grid-template-columns: 1fr;
  }

  .spotlight-image-container {
    height: 180px;
  }

  .discussion-item-row {
    padding: 12px 14px;
  }

  .steps-cards-row {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 12px;
  }

  .workflow-path-bg {
    display: none;
  }

  .workflow-panel {
    grid-template-columns: 1fr;
    padding: 32px 20px;
    gap: 32px;
  }

  .hero-title {
    font-size: clamp(2.2rem, 8vw, 3.2rem);
  }

  /* CTA mobile overrides */
  .cta-panel {
    grid-template-columns: 1fr;
    padding: 32px 20px;
    gap: 32px;
  }

  .cta-stages-row {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 12px;
  }

  .cta-stage-desc {
    max-width: 100%;
  }

  .cta-stages-dots-wrap,
  .cta-wave-timeline {
    display: none;
  }

  .cta-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .cta-primary-btn {
    justify-content: center;
    width: 100%;
  }

  .cta-secondary-link {
    justify-content: center;
    width: 100%;
  }

  /* Reduce particle effects on mobile for performance */
  .particle {
    display: none;
  }
}
</style>
