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

/* ── typing animation ── */
const typingPhrases = [
  "Technical Discussions",
  "Project Showcases",
  "Saved Knowledge",
  "Developer Blogs",
];
const typedText = ref("");
const typingIndex = ref(0);
const charIndex = ref(0);
const isDeleting = ref(false);
let typingTimer = null;

function typeLoop() {
  const current = typingPhrases[typingIndex.value];
  if (!isDeleting.value) {
    typedText.value = current.slice(0, charIndex.value + 1);
    charIndex.value++;
    if (charIndex.value >= current.length) {
      isDeleting.value = true;
      typingTimer = setTimeout(typeLoop, 1800);
      return;
    }
    typingTimer = setTimeout(typeLoop, 70);
  } else {
    typedText.value = current.slice(0, charIndex.value - 1);
    charIndex.value--;
    if (charIndex.value <= 0) {
      isDeleting.value = false;
      typingIndex.value = (typingIndex.value + 1) % typingPhrases.length;
      typingTimer = setTimeout(typeLoop, 400);
      return;
    }
    typingTimer = setTimeout(typeLoop, 40);
  }
}

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
            platformStats.value.forEach((stat, i) => {
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
    title: "Discuss Better",
    desc: "Replies, saves, votes, and clean author details make every thread easier to follow.",
    icon: "bi-command",
    accent: "blue",
  },
  {
    title: "Show The Work",
    desc: "Showcase projects, screenshots, and tags turn finished builds into public proof.",
    icon: "bi-window-stack",
    accent: "green",
  },
];

const workflowSteps = [
  {
    label: "Create",
    text: "Write a focused post with category, tags, and code.",
  },
  {
    label: "Discuss",
    text: "Collect replies, suggestions, and better approaches.",
  },
  { label: "Save", text: "Keep useful threads visible for future reference." },
  {
    label: "Showcase",
    text: "Publish the final project for community feedback.",
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
  typeLoop();
  setupScrollReveal();
});

onUnmounted(() => {
  clearTimeout(typingTimer);
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

const platformStats = computed(() => {
  const discussions = liveDiscussions.value;
  const replies = discussions.reduce(
    (total, item) => total + countReplies(item),
    0,
  );
  const projects = discussions.filter(isShowcaseThread).length;
  const categories = new Set(discussions.map(getCategoryName).filter(Boolean))
    .size;

  return [
    { value: `${discussions.length || 12}+`, label: "Threads" },
    { value: `${replies || 28}+`, label: "Replies" },
    { value: `${projects || 4}+`, label: "Projects" },
    { value: `${categories || 6}+`, label: "Categories" },
  ];
});

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
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="container">
        <div class="hero-grid">
          <!-- Left: Copy -->
          <section class="hero-copy scroll-reveal">
            <div class="eyebrow">
              <span class="status-dot"></span>
              Developer community workspace
            </div>

            <h1 class="hero-title">
              <span class="gradient-text">ANT</span
              ><span class="gradient-text-alt">FORUM</span>
            </h1>

            <p class="hero-lead">
              A clean home for
              <span class="typing-wrapper">
                <span class="typed-text">{{ typedText }}</span
                ><span class="typing-cursor">|</span>
              </span>
              <br />from your developer community.
            </p>

            <div class="hero-actions">
              <router-link
                :to="auth.user ? '/forum/create' : '/login'"
                class="primary-action glow-btn"
              >
                <i class="bi bi-plus-circle"></i>
                Start a Discussion
              </router-link>
              <router-link to="/forum" class="secondary-action glass-btn">
                Browse Forum
                <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>

            <div class="feature-pills" aria-label="ANT Forum platform support">
              <span
                class="feature-pill floating-pill"
                style="--float-delay: 0s"
              >
                <i class="bi bi-code-slash"></i> Markdown editor
              </span>
              <span
                class="feature-pill floating-pill"
                style="--float-delay: 0.5s"
              >
                <i class="bi bi-tags"></i> Admin tags
              </span>
              <span
                class="feature-pill floating-pill"
                style="--float-delay: 1s"
              >
                <i class="bi bi-person-badge"></i> Member profiles
              </span>
              <span
                class="feature-pill floating-pill"
                style="--float-delay: 1.5s"
              >
                <i class="bi bi-kanban"></i> Showcases
              </span>
            </div>
          </section>

          <!-- Right: Live Activity Feed -->
          <section
            class="activity-feed glass-panel scroll-reveal"
            aria-label="Forum activity feed"
          >
            <div class="feed-header">
              <div>
                <span class="feed-label"
                  ><span class="pulse-dot"></span> Live</span
                >
                <strong>Community Activity</strong>
              </div>
              <img :src="heroStack" alt="ANT Forum" class="feed-logo" />
            </div>

            <!-- Featured thread card -->
            <button
              class="featured-card"
              type="button"
              @click="goToThread(heroThread?.id)"
            >
              <span class="featured-badge">{{ heroThread?.category }}</span>
              <strong>{{ heroThread?.title }}</strong>
              <small>{{ heroThread?.desc }}</small>
            </button>

            <!-- Animated stats -->
            <div class="preview-stats scroll-reveal">
              <div
                v-for="(stat, index) in platformStats"
                :key="stat.label"
                class="stat-card"
                :style="{ '--stagger': index }"
              >
                <strong>
                  <template v-if="statsVisible"
                    >{{ countUpValues[index] }}+</template
                  >
                  <template v-else>0+</template>
                </strong>
                <span>{{ stat.label }}</span>
              </div>
            </div>

            <!-- Category tags -->
            <div class="preview-categories">
              <span
                v-for="(category, i) in categorySummary"
                :key="category.label"
                class="cat-tag"
                :style="{ '--cat-delay': `${i * 0.1}s` }"
              >
                {{ category.label }} <b>{{ category.count }}</b>
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- ═══════════════  CAPABILITY STRIP  ═══════════════ -->
    <section class="community-strip">
      <div class="container">
        <div class="strip-grid">
          <article
            v-for="(card, i) in capabilityCards"
            :key="card.title"
            :class="[
              'capability-card',
              'glass-card',
              card.accent,
              'scroll-reveal',
            ]"
            :style="{ '--stagger': i }"
          >
            <div class="card-icon-wrap">
              <i :class="['bi', card.icon]"></i>
            </div>
            <h2>{{ card.title }}</h2>
            <p>{{ card.desc }}</p>
            <div class="card-glow" aria-hidden="true"></div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════  ACTIVITY SECTION  ═══════════════ -->
    <section class="activity-section">
      <div class="container">
        <div class="section-top scroll-reveal">
          <div>
            <span class="section-label">Community Pulse</span>
            <h2>Recent work, questions, and project signals</h2>
          </div>
          <router-link to="/forum" class="text-link">
            Open forum <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>

        <div class="activity-grid">
          <article
            class="project-spotlight glass-card scroll-reveal"
            @click="goToThread(primaryProject?.id)"
          >
            <img :src="primaryProject?.image" :alt="primaryProject?.title" />
            <div class="project-body">
              <span class="section-label">Showcase</span>
              <h3>{{ primaryProject?.title }}</h3>
              <p>{{ primaryProject?.desc }}</p>
              <div class="project-meta">
                <div class="author-inline">
                  <img
                    :src="primaryProject?.avatar"
                    :alt="primaryProject?.author"
                  />
                  <span>{{ primaryProject?.author }}</span>
                </div>
                <div class="tag-list">
                  <span v-for="tag in primaryProject?.tags" :key="tag">{{
                    tag
                  }}</span>
                </div>
              </div>
            </div>
          </article>

          <div class="thread-list glass-card scroll-reveal">
            <button
              v-for="(thread, i) in displayThreads"
              :key="thread.title"
              type="button"
              class="thread-row"
              :style="{ '--stagger': i }"
              @click="goToThread(thread.id)"
            >
              <img :src="thread.avatar" :alt="thread.author" />
              <span class="thread-main">
                <strong>{{ thread.title }}</strong>
                <small>{{ thread.category }} by {{ thread.author }}</small>
              </span>
              <span class="thread-count">{{ thread.replies }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════  WORKFLOW  ═══════════════ -->
    <section class="workflow-section">
      <div class="container">
        <div class="workflow-panel glass-card scroll-reveal">
          <div class="workflow-copy">
            <span class="section-label">Workflow</span>
            <h2>Built around how developers actually ask for help</h2>
            <p>
              The landing page now points people straight into the useful parts
              of the app: forum questions, categorized content, and showcase
              work.
            </p>
          </div>
          <div class="workflow-steps">
            <article
              v-for="(step, index) in workflowSteps"
              :key="step.label"
              class="scroll-reveal"
              :style="{ '--stagger': index }"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <div>
                <strong>{{ step.label }}</strong>
                <p>{{ step.text }}</p>
              </div>
              <div
                class="step-connector"
                v-if="index < workflowSteps.length - 1"
                aria-hidden="true"
              ></div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════  CTA  ═══════════════ -->
    <section class="final-cta">
      <div class="container">
        <div class="cta-panel glass-card scroll-reveal">
          <div>
            <span class="section-label">Start here</span>
            <h2>Bring your next technical problem into ANT Forum.</h2>
          </div>
          <div class="cta-actions">
            <router-link
              :to="auth.user ? '/forum/create' : '/login'"
              class="primary-action glow-btn"
            >
              Ask now
            </router-link>
            <router-link to="/showcase" class="secondary-action glass-btn">
              View showcase
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
/* ╔══════════════════════════════════════════════╗
   ║  ANT FORUM — PREMIUM LANDING PAGE STYLES    ║
   ╚══════════════════════════════════════════════╝ */

/* ── Design tokens ── */
.landing-page {
  min-height: 100vh;
  color: var(--color-text);
  background:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    var(--page-bg);
  background-size: 34px 34px;
  overflow-x: clip;
  --page-bg: #080d18;
  --panel-bg: #101827;
  --panel-soft: #172131;
  --panel-strong: #0b1120;
  --grid-line: rgba(148, 163, 184, 0.06);
  --landing-border: rgba(148, 163, 184, 0.14);
  --muted: #9aa5b6;
  --accent: #6d6af7;
  --cyan: #28b7d7;
  --green: #21b982;
  --glow-1: rgba(99, 102, 241, 0.35);
  --glow-2: rgba(139, 92, 246, 0.25);
  --glow-3: rgba(40, 183, 215, 0.2);
}

/* ── HERO BACKGROUND EFFECTS ── */
.landing-hero {
  position: relative;
  padding: 72px 0 34px;
  overflow: hidden;
}

.hero-bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 50% at 50% -20%,
      rgba(99, 102, 241, 0.12),
      transparent
    ),
    radial-gradient(
      ellipse 60% 40% at 80% 80%,
      rgba(139, 92, 246, 0.08),
      transparent
    );
}

/* Floating particles */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
  animation: float-particle linear infinite;
}

.p1 {
  left: 10%;
  top: 20%;
  width: 3px;
  height: 3px;
  animation-duration: 18s;
  animation-delay: 0s;
}
.p2 {
  left: 25%;
  top: 60%;
  width: 5px;
  height: 5px;
  animation-duration: 22s;
  animation-delay: -3s;
  background: rgba(99, 102, 241, 0.5);
}
.p3 {
  left: 45%;
  top: 30%;
  width: 3px;
  height: 3px;
  animation-duration: 20s;
  animation-delay: -7s;
}
.p4 {
  left: 65%;
  top: 70%;
  width: 4px;
  height: 4px;
  animation-duration: 16s;
  animation-delay: -2s;
  background: rgba(40, 183, 215, 0.5);
}
.p5 {
  left: 80%;
  top: 15%;
  width: 6px;
  height: 6px;
  animation-duration: 24s;
  animation-delay: -5s;
}
.p6 {
  left: 15%;
  top: 80%;
  width: 3px;
  height: 3px;
  animation-duration: 19s;
  animation-delay: -8s;
  background: rgba(40, 183, 215, 0.4);
}
.p7 {
  left: 55%;
  top: 50%;
  width: 4px;
  height: 4px;
  animation-duration: 21s;
  animation-delay: -12s;
}
.p8 {
  left: 90%;
  top: 40%;
  width: 3px;
  height: 3px;
  animation-duration: 17s;
  animation-delay: -4s;
  background: rgba(99, 102, 241, 0.4);
}

@keyframes float-particle {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translate(-40px, -60px) scale(1.5);
    opacity: 0.7;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translate(30px, -120px) scale(0.8);
    opacity: 0;
  }
}

/* Glowing orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: drift ease-in-out infinite;
}

.orb-1 {
  width: 320px;
  height: 320px;
  left: -5%;
  top: -10%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.18),
    transparent 70%
  );
  animation-duration: 12s;
}

.orb-2 {
  width: 260px;
  height: 260px;
  right: 5%;
  top: 30%;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.14),
    transparent 70%
  );
  animation-duration: 16s;
  animation-delay: -4s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  left: 35%;
  bottom: -10%;
  background: radial-gradient(
    circle,
    rgba(40, 183, 215, 0.12),
    transparent 70%
  );
  animation-duration: 14s;
  animation-delay: -8s;
}

@keyframes drift {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(30px, -20px);
  }
  66% {
    transform: translate(-20px, 15px);
  }
}

/* ── HERO GRID ── */
.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(400px, 0.82fr);
  gap: 32px;
  align-items: stretch;
  min-height: calc(100vh - 190px);
}

/* ── HERO COPY ── */
.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 620px;
  padding: clamp(28px, 5vw, 64px);
  border-radius: 28px;
  border: 1px solid var(--landing-border);
  background: rgba(16, 24, 39, 0.65);
  backdrop-filter: blur(20px);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

/* Subtle inner gradient glow */
.hero-copy::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(99, 102, 241, 0.08),
    transparent 60%
  );
  pointer-events: none;
}

.eyebrow,
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b9b7ff;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--green);
  box-shadow: 0 0 0 5px rgba(33, 185, 130, 0.14);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 5px rgba(33, 185, 130, 0.14);
  }
  50% {
    box-shadow:
      0 0 0 10px rgba(33, 185, 130, 0.06),
      0 0 20px rgba(33, 185, 130, 0.2);
  }
}

/* ── Gradient title ── */
.hero-title {
  margin: 18px 0 18px;
  font-size: clamp(3.2rem, 7.5vw, 6.2rem);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-alt {
  background: linear-gradient(135deg, #c4b5fd 0%, #e0e7ff 50%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Typing animation ── */
.hero-lead {
  max-width: 680px;
  margin: 0;
  color: #c2c9d6;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  line-height: 1.65;
  position: relative;
  z-index: 1;
}

.typing-wrapper {
  display: inline;
}

.typed-text {
  color: #a5b4fc;
  font-weight: 700;
}

.typing-cursor {
  color: #6366f1;
  font-weight: 300;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* ── CTA Buttons ── */
.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
  position: relative;
  z-index: 1;
}

.primary-action,
.secondary-action {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border-radius: 999px;
  font-weight: 900;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glow-btn {
  color: #fff;
  background: linear-gradient(135deg, #625df5, #7c3aed);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 0 20px rgba(98, 93, 245, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);
}

.glow-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 0 30px rgba(98, 93, 245, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.25);
  background: linear-gradient(135deg, #7c78f8, #8b5cf6);
}

.glass-btn {
  color: var(--color-text, #e2e8f0);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.glass-btn:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* ── Floating feature pills ── */
.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 34px;
  position: relative;
  z-index: 1;
}

.feature-pill {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border-radius: 999px;
  color: #d5dbea;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  font-size: 0.78rem;
  font-weight: 800;
  backdrop-filter: blur(6px);
  transition: all 0.3s ease;
}

.feature-pill:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.floating-pill {
  animation: float-pill 4s ease-in-out infinite;
  animation-delay: var(--float-delay, 0s);
}

@keyframes float-pill {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* ── ACTIVITY FEED (right panel) ── */
.glass-panel {
  border: 1px solid var(--landing-border);
  background: rgba(16, 24, 39, 0.6);
  backdrop-filter: blur(24px);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.activity-feed {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  padding: 22px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
}

/* Decorative corner glow */
.activity-feed::after {
  content: "";
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%);
  pointer-events: none;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.feed-header span,
.feed-header strong {
  display: block;
}

.feed-label {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 800;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse-live 1.5s ease-in-out infinite;
}

@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.8);
  }
}

.feed-header strong {
  color: #fff;
  font-size: 1.2rem;
}

.feed-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  animation: float-pill 5s ease-in-out infinite;
}

/* ── Featured thread card ── */
.featured-card {
  width: 100%;
  text-align: left;
  padding: 22px;
  border: 1px solid rgba(109, 106, 247, 0.22);
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    rgba(11, 17, 32, 0.9),
    rgba(16, 24, 39, 0.7)
  );
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.featured-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.featured-card:hover {
  transform: translateY(-3px);
  border-color: rgba(109, 106, 247, 0.45);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
}

.featured-card:hover::before {
  opacity: 1;
}

.featured-badge {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  color: #b9b7ff;
  background: rgba(109, 106, 247, 0.16);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.featured-card strong,
.featured-card small {
  display: block;
}

.featured-card strong {
  color: #fff;
  font-size: 1.3rem;
  line-height: 1.28;
}

.featured-card small {
  margin-top: 12px;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.55;
}

/* ── Stats grid ── */
.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
  position: relative;
  z-index: 1;
}

.stat-card {
  min-height: 94px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(23, 33, 49, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(6px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.04),
    transparent
  );
  transition: left 0.6s ease;
}

.stat-card:hover::after {
  left: 100%;
}

.stat-card:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(23, 33, 49, 0.9);
}

.stat-card strong,
.stat-card span {
  display: block;
}

.stat-card strong {
  color: #fff;
  font-size: 1.65rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-card span {
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

/* ── Category tags ── */
.preview-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 18px;
  position: relative;
  z-index: 1;
}

.cat-tag,
.tag-list span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 0.72rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.cat-tag:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
}

.preview-categories b {
  color: #fff;
}

/* ══════════════════════════════════════
   CAPABILITY STRIP
   ══════════════════════════════════════ */
.community-strip,
.activity-section,
.workflow-section,
.final-cta {
  padding: 34px 0;
}

.strip-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.glass-card {
  border: 1px solid var(--landing-border);
  background: rgba(16, 24, 39, 0.65);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.capability-card {
  min-height: 220px;
  padding: 28px;
  border-radius: 22px;
  position: relative;
  overflow: hidden;
}

.capability-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 32px 60px rgba(0, 0, 0, 0.3);
}

/* Per-accent hover glow */
.capability-card .card-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.capability-card.violet .card-glow {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(99, 102, 241, 0.1),
    transparent 70%
  );
}
.capability-card.blue .card-glow {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(40, 183, 215, 0.1),
    transparent 70%
  );
}
.capability-card.green .card-glow {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(33, 185, 130, 0.1),
    transparent 70%
  );
}

.capability-card:hover .card-glow {
  opacity: 1;
}

.card-icon-wrap {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  margin-bottom: 22px;
  color: #fff;
  font-size: 1.2rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.capability-card:hover .card-icon-wrap {
  transform: scale(1.1);
}

.capability-card.violet .card-icon-wrap {
  background: linear-gradient(135deg, #625df5, #7c3aed);
  box-shadow: 0 4px 16px rgba(98, 93, 245, 0.3);
}
.capability-card.blue .card-icon-wrap {
  background: linear-gradient(135deg, var(--cyan), #0ea5e9);
  box-shadow: 0 4px 16px rgba(40, 183, 215, 0.3);
}
.capability-card.green .card-icon-wrap {
  background: linear-gradient(135deg, var(--green), #059669);
  box-shadow: 0 4px 16px rgba(33, 185, 130, 0.3);
}

.capability-card:hover.violet .card-icon-wrap {
  box-shadow: 0 8px 24px rgba(98, 93, 245, 0.45);
}
.capability-card:hover.blue .card-icon-wrap {
  box-shadow: 0 8px 24px rgba(40, 183, 215, 0.45);
}
.capability-card:hover.green .card-icon-wrap {
  box-shadow: 0 8px 24px rgba(33, 185, 130, 0.45);
}

.capability-card h2,
.section-top h2,
.workflow-copy h2,
.cta-panel h2 {
  color: var(--color-text);
  font-weight: 950;
  letter-spacing: 0;
}

.capability-card h2 {
  font-size: 1.22rem;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.capability-card p,
.workflow-copy p,
.project-body p {
  color: var(--muted);
  line-height: 1.65;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* ══════════════════════════════════════
   ACTIVITY SECTION
   ══════════════════════════════════════ */
.section-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.section-top h2 {
  max-width: 760px;
  margin: 8px 0 0;
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.05;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b9b7ff;
  font-weight: 900;
  text-decoration: none;
  transition: all 0.2s ease;
}

.text-link:hover {
  color: #c4b5fd;
  gap: 12px;
}

.activity-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(420px, 1fr);
  gap: 18px;
}

.project-spotlight {
  cursor: pointer;
  border-radius: 24px;
  overflow: hidden;
}

.project-spotlight:hover {
  transform: translateY(-4px);
  box-shadow: 0 32px 60px rgba(0, 0, 0, 0.3);
}

.project-spotlight img {
  display: block;
  width: 100%;
  height: 290px;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.project-spotlight:hover img {
  transform: scale(1.03);
}

.project-body {
  padding: 24px;
}

.project-body h3 {
  margin: 10px 0 10px;
  color: #fff;
  font-size: clamp(1.45rem, 2.5vw, 2rem);
  font-weight: 950;
  line-height: 1.1;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--landing-border);
}

.author-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-weight: 900;
}

.author-inline img,
.thread-row img {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgba(99, 102, 241, 0.2);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Thread list ── */
.thread-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 24px;
}

.thread-row {
  width: 100%;
  min-height: 98px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 16px;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: rgba(11, 17, 32, 0.7);
  backdrop-filter: blur(6px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.thread-row:hover {
  transform: translateY(-3px);
  border-color: rgba(109, 106, 247, 0.35);
  background: rgba(17, 26, 43, 0.9);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.thread-main {
  min-width: 0;
}

.thread-main strong,
.thread-main small {
  display: block;
}

.thread-main strong {
  color: #fff;
  font-size: 1rem;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-main small {
  margin-top: 6px;
  color: var(--muted);
  font-size: 0.78rem;
}

.thread-count {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(
    135deg,
    rgba(109, 106, 247, 0.2),
    rgba(139, 92, 246, 0.15)
  );
  border: 1px solid rgba(109, 106, 247, 0.25);
  font-weight: 950;
  font-size: 0.9rem;
}

/* ══════════════════════════════════════
   WORKFLOW
   ══════════════════════════════════════ */
.workflow-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(420px, 1fr);
  gap: 28px;
  padding: 30px;
  border-radius: 26px;
}

.workflow-copy h2,
.cta-panel h2 {
  margin: 10px 0 14px;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  line-height: 1.04;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.workflow-steps article {
  display: flex;
  gap: 14px;
  min-height: 130px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(11, 17, 32, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.workflow-steps article:hover {
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(17, 26, 43, 0.8);
}

.step-number {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(135deg, #625df5, #7c3aed);
  font-weight: 950;
  box-shadow: 0 4px 12px rgba(98, 93, 245, 0.3);
}

.workflow-steps strong {
  display: block;
  color: #fff;
  margin-bottom: 6px;
}

.workflow-steps p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
  font-size: 0.88rem;
}

/* ── CTA ── */
.cta-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 30px;
  border-radius: 26px;
  position: relative;
  overflow: hidden;
}

.cta-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.06),
    transparent 60%
  );
  pointer-events: none;
}

.cta-panel h2 {
  max-width: 780px;
  margin-bottom: 0;
  position: relative;
  z-index: 1;
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
  --grid-line: rgba(99, 102, 241, 0.07);
  --landing-border: #dde5ef;
  --muted: #637083;
}

[data-theme="light"] .hero-copy,
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
  background: rgba(255, 255, 255, 0.88);
}

[data-theme="light"] .hero-title .gradient-text {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="light"] .hero-title .gradient-text-alt {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="light"] .hero-lead,
[data-theme="light"] .feature-pill {
  color: var(--color-text-muted);
}

[data-theme="light"] .typed-text {
  color: #4f46e5;
}

[data-theme="light"] .featured-card,
[data-theme="light"] .stat-card,
[data-theme="light"] .thread-row,
[data-theme="light"] .workflow-steps article {
  background: #ffffff;
  border-color: var(--landing-border);
}

[data-theme="light"] .featured-card strong,
[data-theme="light"] .feed-header strong,
[data-theme="light"] .stat-card strong,
[data-theme="light"] .project-body h3,
[data-theme="light"] .thread-main strong,
[data-theme="light"] .workflow-steps strong {
  color: var(--color-text);
}

[data-theme="light"] .glass-btn {
  background: #fff;
  color: var(--color-text);
  border-color: var(--landing-border);
}

[data-theme="light"] .feature-pill {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.15);
  color: #475569;
}

[data-theme="light"] .cat-tag {
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.12);
  color: #475569;
}

[data-theme="light"] .particle {
  background: rgba(99, 102, 241, 0.25);
  box-shadow: 0 0 6px rgba(99, 102, 241, 0.15);
}

[data-theme="light"] .orb-1 {
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.08),
    transparent 70%
  );
}
[data-theme="light"] .orb-2 {
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.06),
    transparent 70%
  );
}
[data-theme="light"] .orb-3 {
  background: radial-gradient(
    circle,
    rgba(40, 183, 215, 0.06),
    transparent 70%
  );
}

/* ══════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════ */
@media (max-width: 1100px) {
  .hero-grid,
  .activity-grid,
  .workflow-panel {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .landing-hero {
    padding: 42px 0 22px;
  }

  .hero-copy,
  .activity-feed,
  .workflow-panel,
  .cta-panel {
    border-radius: 20px;
    padding: 22px;
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

  .strip-grid,
  .preview-stats,
  .workflow-steps {
    grid-template-columns: 1fr;
  }

  .project-spotlight img {
    height: 220px;
  }

  .thread-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .thread-count {
    display: none;
  }

  .hero-title {
    font-size: clamp(2.6rem, 10vw, 4rem);
  }

  /* Reduce particle effects on mobile for performance */
  .particle {
    display: none;
  }
  .orb {
    filter: blur(40px);
  }
}
</style>
