<template>
  <!-- Full Page Mode (Default / Page route) -->
  <div v-if="fullPage" class="loading-page">
    <div class="glow-bg glow-primary"></div>
    <div class="glow-bg glow-accent"></div>

    <div class="loading-card shadow-lg">
      <div class="brand-logo-container mb-4">
        <div class="brand-orb">
          <i class="bi bi-rocket-takeoff-fill"></i>
        </div>
      </div>

      <h2 class="brand-title fw-black mb-2">ANT-Forum</h2>
      <p class="brand-subtitle text-muted mb-4">Ecosystem Initialization</p>

      <!-- Progress Track -->
      <div class="progress-track mb-3">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <!-- Loading Status Text -->
      <div class="status-message-wrapper">
        <p class="status-text themed-text small">{{ statusText }}</p>
        <span class="status-percentage font-monospace">{{ progress }}%</span>
      </div>

      <!-- Tiny Spinner -->
      <div class="spinner-mini mt-4">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </div>

  <!-- Inline Component Mode (Backwards Compatibility) -->
  <div v-else class="loading-container-inline">
    <div class="spinner">
      <div class="dot1"></div>
      <div class="dot2"></div>
      <div class="dot3"></div>
    </div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";
import { useBlogStore } from "@/stores/BlogStore";
import { useArticleStore } from "@/stores/ArticleStore";
import { useTagsStore } from "@/stores/TagsStore";

const props = defineProps({
  fullPage: {
    type: Boolean,
    default: true,
  },
  text: {
    type: String,
    default: "Loading...",
  },
});

const router = useRouter();
const forumStore = useForumStore();
const blogStore = useBlogStore();
const articleStore = useArticleStore();
const tagsStore = useTagsStore();

const statusText = ref("Connecting to server...");
const progress = ref(0);

// Smoothly increments progress to a target percentage
const animateProgress = (target, speed = 12) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (progress.value < target) {
        progress.value++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
};

onMounted(async () => {
  // Only execute the initial pre-fetching sequence if in fullPage mode
  if (!props.fullPage) return;

  try {
    // Stage 1: Load Tags
    statusText.value = "Syncing developer tags...";
    await Promise.all([
      tagsStore
        .fetchTags()
        .catch((err) => console.warn("Tags fetch warning:", err)),
      animateProgress(25),
    ]);

    // Stage 2: Load Forums & Showcases (Forum Categories and Forums List)
    statusText.value = "Caching forum discussions and showcase pipeline...";
    await Promise.all([
      forumStore
        .fetchCategories()
        .catch((err) => console.warn("Categories fetch warning:", err)),
      forumStore
        .fetchDiscussions()
        .catch((err) => console.warn("Discussions fetch warning:", err)),
      animateProgress(65),
    ]);

    // Stage 3: Load Blogs & Articles
    statusText.value = "Preparing engineering articles and blogs...";
    await Promise.all([
      blogStore
        .fetchBlogs()
        .catch((err) => console.warn("Blogs fetch warning:", err)),
      articleStore
        .fetchArticles()
        .catch((err) => console.warn("Articles fetch warning:", err)),
      animateProgress(90),
    ]);

    // Stage 4: Execution Complete
    statusText.value = "Initialization complete!";
    await animateProgress(100, 5);

    // Pause briefly for transition animation / visual styling satisfaction
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Redirect to home/dashboard page
    router.push("/");
  } catch (error) {
    console.error("Failed to pre-fetch critical app data:", error);
    statusText.value = "System initialized with local fallback...";
    await animateProgress(100, 3);
    router.push("/");
  }
});
</script>

<style scoped>
.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  overflow: hidden;
  z-index: 99999;
}

/* Glowing Backgrounds */
.glow-bg {
  position: absolute;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 1;
}

.glow-primary {
  background: var(--color-primary);
  top: -10%;
  left: -10%;
  animation: pulse-glow 8s ease-in-out infinite;
}

.glow-accent {
  background: var(--color-purple);
  bottom: -10%;
  right: -10%;
  animation: pulse-glow 8s ease-in-out infinite 4s;
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.12;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.18;
  }
}

/* Glassmorphism Card */
.loading-card {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 440px;
  padding: 3rem 2.5rem;
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

/* Logo Orb */
.brand-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-orb {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-purple)
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 12px 24px var(--color-primary-light);
  animation: rotate-orb 12s linear infinite;
}

@keyframes rotate-orb {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.brand-orb i {
  /* Counter-rotate icon so it stays upright and looks stable */
  animation: counter-rotate 12s linear infinite;
}

@keyframes counter-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

/* Brand Texts */
.brand-title {
  font-family: var(--font-family-display);
  color: var(--color-text);
  letter-spacing: -0.03em;
}

.brand-subtitle {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
  color: var(--color-text-muted) !important;
}

/* Progress Track */
.progress-track {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-purple));
  border-radius: var(--radius-pill);
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px var(--color-primary);
}

/* Status Message and Percentage */
.status-message-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
}

.status-text {
  margin: 0;
  color: var(--color-text-muted) !important;
  font-weight: 500;
  text-align: left;
}

.status-percentage {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.9rem;
}

/* Mini dots spinner at bottom */
.spinner-mini {
  display: flex;
  gap: 6px;
}

.spinner-mini .dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-text-muted);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse-dot 1.2s infinite ease-in-out both;
}

.spinner-mini .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-mini .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse-dot {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
    background-color: var(--color-primary);
  }
}

/* Inline Loading Fallback Styling */
.loading-container-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
}

.spinner {
  display: flex;
  gap: 8px;
}

.spinner > div {
  width: 12px;
  height: 12px;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner .dot1 {
  animation-delay: -0.32s;
}

.spinner .dot2 {
  animation-delay: -0.16s;
}

.loading-text {
  margin-top: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-muted);
  font-family: var(--font-family-base);
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
