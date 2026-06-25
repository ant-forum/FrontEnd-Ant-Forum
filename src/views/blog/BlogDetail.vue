<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import SkeletonLoader from "../../components/SkeletonLoader.vue";

// ── Text-to-Speech ────────────────────────────────────────────────────────
const ttsState = ref("idle"); // 'idle' | 'playing' | 'paused'
const ttsProgress = ref(0);
const ttsError = ref("");
const ttsRate = ref(0.9); // speed: 0.5 – 2
const ttsVoices = ref([]);
const ttsVoice = ref(null); // selected SpeechSynthesisVoice

const isTTSSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

// Priority list – first match wins
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Google UK English Female",
  "Google UK English Male",
  "Microsoft Aria Online (Natural)",
  "Microsoft Guy Online (Natural)",
  "Samantha", // macOS
  "Karen", // macOS AU
  "Daniel", // macOS UK
  "Alex", // macOS
];

const loadVoices = () => {
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return;
  // Only show English voices
  const enVoices = all.filter((v) => v.lang.startsWith("en"));
  ttsVoices.value = enVoices;
  // Pick best default
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = enVoices.find((v) => v.name === name);
    if (found) {
      ttsVoice.value = found;
      break;
    }
  }
  if (!ttsVoice.value && enVoices.length) ttsVoice.value = enVoices[0];
};

if (isTTSSupported) {
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  loadVoices(); // may already be ready
}

const getArticleText = () => {
  const el = document.querySelector(".article-body");
  return el ? el.innerText : "";
};

const ttsPlay = () => {
  if (!isTTSSupported) return;
  if (ttsState.value === "paused") {
    window.speechSynthesis.resume();
    ttsState.value = "playing";
    return;
  }
  window.speechSynthesis.cancel();
  const text = getArticleText();
  if (!text) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = ttsRate.value;
  utt.pitch = 1;
  if (ttsVoice.value) utt.voice = ttsVoice.value;
  utt.onstart = () => {
    ttsState.value = "playing";
    ttsProgress.value = 0;
  };
  utt.onend = () => {
    ttsState.value = "idle";
    ttsProgress.value = 100;
  };
  utt.onerror = (e) => {
    ttsState.value = "idle";
    ttsError.value = e.error;
  };
  utt.onboundary = (e) => {
    if (e.charLength != null)
      ttsProgress.value = Math.round((e.charIndex / text.length) * 100);
  };
  window.speechSynthesis.speak(utt);
};

const ttsPause = () => {
  if (!isTTSSupported) return;
  window.speechSynthesis.pause();
  ttsState.value = "paused";
};

const ttsStop = () => {
  if (!isTTSSupported) return;
  window.speechSynthesis.cancel();
  ttsState.value = "idle";
  ttsProgress.value = 0;
};

const ttsSpeedLabel = computed(() => {
  const r = ttsRate.value;
  if (r <= 0.6) return "Slow";
  if (r <= 0.85) return "Normal";
  if (r <= 1.1) return "Fast";
  return "Very Fast";
});
// ─────────────────────────────────────────────────────────────────────────
import { useBlogStore } from "../../stores/BlogStore";
import { useAuthStore } from "../../stores/AuthStore";
import { renderStoredContent } from "../../utils/richContent";

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const authStore = useAuthStore();

const activeSection = ref("");
const scrollProgress = ref(0);
const localLoading = ref(true);

const post = computed(() => blogStore.blog);
const articleContent = computed(() => {
  const rawContent = post.value?.content || post.value?.description || "";
  const normalizedContent =
    typeof rawContent === "string" ? rawContent.replace(/\r\n/g, "\n") : "";
  const rendered = renderStoredContent(normalizedContent);
  
  let headingCount = 0;
  return rendered.replace(/<h([2-4])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    if (attrs.includes("id=")) return match;
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    const slug = textContent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `heading-${headingCount++}`;
    return `<h${level}${attrs} id="${slug}">${content}</h${level}>`;
  });
});

const relatedPosts = computed(() => {
  if (!post.value) return [];
  const list = blogStore.blogs.filter((b) => b.id != post.value.id);
  const sameCategory = list.filter((b) => b.category === post.value.category);
  const remaining = list.filter((b) => b.category !== post.value.category);
  return [...sameCategory, ...remaining].slice(0, 3);
});

const headings = computed(() => {
  const list = [];
  const bodyText = articleContent.value || "";
  const regex = /<h([2-4])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    list.push({
      id: match[2],
      label: match[3].replace(/<[^>]*>/g, ""),
    });
  }
  return list;
});

const updateScrollProgress = () => {
  const winScroll = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    // scroll with offset for the sticky navbar
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - 90;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
    activeSection.value = id;
    activeHeadingId.value = id;
  }
};

const copied = ref(false);
const activeHeadingId = ref("");

const copyArticleLink = () => {
  navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const shareOnTwitter = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(post.value?.title || "");
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
};

const shareOnLinkedin = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
};

const shareOnFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
};

let tocObserver = null;
const setupTocObserver = () => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  if (tocObserver) tocObserver.disconnect();

  tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeHeadingId.value = entry.target.id;
          activeSection.value = entry.target.id;
        }
      });
    },
    { rootMargin: "-90px 0px -50% 0px" }
  );

  headings.value.forEach((h) => {
    const el = document.getElementById(h.id);
    if (el) tocObserver.observe(el);
  });
};

const loadBlogData = async (id) => {
  try {
    if (blogStore.categories.length === 0) {
      await blogStore.fetchCategories().catch(() => {});
    }

    if (authStore.user?.role === "admin") {
      await blogStore.fetchBlogById(id);
    } else {
      await blogStore.fetchBlogPreview(id);
    }
    if (blogStore.blogs.length === 0) {
      await blogStore.fetchBlogs();
    }
    blogStore.incrementBlogView(id).catch((err) => {
      console.warn("Failed to increment blog view count:", err);
    });
  } catch (err) {
    console.error("Failed to load blog:", err);
    router.push({ name: "not-found" });
  } finally {
    localLoading.value = false;
  }
};

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      localLoading.value = true;
      await loadBlogData(newId);
      nextTick(() => {
        setupTocObserver();
      });
    }
  },
);

watch(headings, () => {
  nextTick(() => {
    setupTocObserver();
  });
});

onMounted(async () => {
  window.addEventListener("scroll", updateScrollProgress);
  await loadBlogData(route.params.id);
  nextTick(() => {
    setupTocObserver();
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateScrollProgress);
  if (tocObserver) tocObserver.disconnect();
  ttsStop();
});

const handleImgError = (e) => {
  e.target.src =
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};
</script>

<template>
  <div class="blog-detail-page min-vh-100">
    <!-- Reading Progress Bar -->
    <div class="reading-progress-container">
      <div
        class="reading-progress-bar"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <Navbar />

    <div class="blog-detail-global-grid">
      <!-- Back Button -->
      <div class="mb-4">
        <router-link
          to="/blog"
          class="btn-back-soft text-decoration-none d-inline-flex align-items-center gap-2"
        >
          <i class="bi bi-arrow-left"></i>
          <span>Back to Articles</span>
        </router-link>
      </div>

      <!-- Loading State: Beautiful skeletons matching standard layout dimensions -->
      <div v-if="localLoading" class="blog-detail-content">
        <div class="row py-5">
          <!-- Main Content Skeleton -->
          <div class="col-12 col-xl-10 mx-auto">
            <div class="mb-4">
              <SkeletonLoader
                variant="text"
                height="20px"
                width="100px"
                class="d-inline-block me-2"
              />
              <SkeletonLoader
                variant="text"
                height="20px"
                width="120px"
                class="d-inline-block"
              />
            </div>
            <SkeletonLoader
              variant="text"
              height="48px"
              width="90%"
              class="mb-4"
            />

            <div class="d-flex align-items-center mb-5">
              <SkeletonLoader
                variant="avatar"
                width="48px"
                height="48px"
                class="me-3"
                round
              />
              <div class="w-50">
                <SkeletonLoader
                  variant="text"
                  height="20px"
                  width="40%"
                  class="mb-2"
                />
                <SkeletonLoader variant="text" height="16px" width="25%" />
              </div>
            </div>

            <SkeletonLoader variant="image" height="350px" class="mb-5" />
            <SkeletonLoader
              variant="text"
              height="20px"
              width="100%"
              class="mb-3"
            />
            <SkeletonLoader
              variant="text"
              height="20px"
              width="95%"
              class="mb-3"
            />
          </div>
        </div>
      </div>

      <!-- Loaded State -->
      <div v-else-if="post" class="blog-detail-content position-relative">
        <div class="row">
          <!-- Main Article & Related Publications -->
          <div class="col-12 col-xl-10 mx-auto">
            <article
              class="blog-main-card p-4 p-md-5 rounded-4 mb-4 border border-theme bg-surface shadow-sm"
            >
              <!-- Author row -->
              <div class="blog-author-row d-flex align-items-center mb-4">
                <img
                  :src="post.author_avatar"
                  class="rounded-circle me-3 border border-theme object-fit-cover"
                  width="48"
                  height="48"
                  alt="Author"
                />
                <div class="min-w-0">
                  <h6 class="mb-0 fw-bold text-adaptive byline-title">
                    {{ post.author }}
                  </h6>
                  <div
                    class="text-muted font-sm d-flex align-items-center mt-1 blog-post-meta"
                  >
                    <span class="d-inline-flex align-items-center gap-1">
                      <i class="bi bi-clock-history"></i>
                      {{ post.postedAt || post.date }}
                    </span>
                    <span class="mx-2">•</span>
                    <span class="d-inline-flex align-items-center gap-1">
                      <i class="bi bi-eye"></i>
                      {{ post.views || 0 }} views
                    </span>
                  </div>
                </div>
              </div>

              <!-- Metadata -->
              <div class="mb-4">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="badge bg-blue-light text-blue px-3 py-2 rounded-pill fw-semibold font-xs mb-3 me-2 text-uppercase"
                >
                  {{ tag }}
                </span>
                <span
                  class="badge bg-blue-light text-blue px-3 py-2 rounded-pill fw-semibold font-xs mb-3 text-uppercase"
                >
                  {{ post.category }}
                </span>
              </div>

              <h1 class="display-4 fw-bold text-adaptive mb-4 article-title">
                {{ post.title }}
              </h1>

              <!-- Hero Image -->
              <div class="article-hero-wrapper mb-5 position-relative overflow-hidden rounded-4 border border-theme shadow-sm">
                <img
                  :src="post.image"
                  @error.once="handleImgError"
                  class="img-fluid w-100 object-fit-cover article-hero-img"
                  style="max-height: 420px; min-height: 240px;"
                  alt="Hero Image"
                />
              </div>

              <!-- ── Clean & Minimal TTS player bar ── -->
              <div class="minimal-tts-player d-flex align-items-center justify-content-between flex-wrap gap-3 py-2 px-3 rounded-pill border border-theme bg-surface-hover mb-4 shadow-sm">
                <div class="d-flex align-items-center gap-3">
                  <!-- Play / Pause Button -->
                  <button
                    id="tts-play-pause-btn"
                    @click="ttsState === 'playing' ? ttsPause() : ttsPlay()"
                    :disabled="!isTTSSupported"
                    class="tts-min-btn play-pause-btn"
                    :class="{ active: ttsState === 'playing' }"
                    :title="ttsState === 'playing' ? 'Pause' : 'Play'"
                  >
                    <i :class="['bi', ttsState === 'playing' ? 'bi-pause-fill' : 'bi-play-fill']"></i>
                  </button>

                  <!-- Stop Button (only active/visible when playing/paused) -->
                  <button
                    v-if="ttsState !== 'idle'"
                    id="tts-stop-btn"
                    @click="ttsStop"
                    class="tts-min-btn stop-btn"
                    title="Stop"
                  >
                    <i class="bi bi-stop-fill"></i>
                  </button>

                  <!-- Text label -->
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-adaptive fw-semibold font-sm">Listen to article</span>
                    <span
                      class="tts-wave-icon"
                      :class="{ active: ttsState === 'playing' }"
                    >
                      <span></span><span></span><span></span><span></span>
                    </span>
                  </div>
                </div>

                <!-- TTS Settings & Controls (Dropdowns & progress) -->
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <!-- Progress bar (shown while reading) -->
                  <div v-if="isTTSSupported && ttsState !== 'idle'" class="tts-min-progress d-flex align-items-center gap-2 me-2">
                    <div class="tts-progress-track" style="width: 80px;">
                      <div class="tts-progress-fill" :style="{ width: ttsProgress + '%' }"></div>
                    </div>
                    <span class="text-muted font-xs">{{ ttsProgress }}%</span>
                  </div>

                  <!-- Voice Selection Dropdown -->
                  <div v-if="isTTSSupported && ttsVoices.length" class="tts-dropdown-wrap">
                    <i class="bi bi-mic text-muted font-xs me-1"></i>
                    <select
                      id="tts-voice-select"
                      class="tts-borderless-select font-xs text-adaptive"
                      :disabled="ttsState === 'playing'"
                      :value="ttsVoice?.name"
                      @change="(e) => ttsVoice = ttsVoices.find((v) => v.name === e.target.value)"
                    >
                      <option v-for="v in ttsVoices" :key="v.name" :value="v.name">
                        {{ v.name.replace("Google ", "").replace(" Online (Natural)", "") }}
                      </option>
                    </select>
                  </div>

                  <!-- Speed Selector -->
                  <div v-if="isTTSSupported" class="tts-dropdown-wrap">
                    <i class="bi bi-speedometer2 text-muted font-xs me-1"></i>
                    <select
                      id="tts-speed-select"
                      class="tts-borderless-select font-xs text-adaptive"
                      :disabled="ttsState === 'playing'"
                      v-model.number="ttsRate"
                    >
                      <option :value="0.7">0.7x (Slow)</option>
                      <option :value="0.9">0.9x (Normal)</option>
                      <option :value="1.1">1.1x (Fast)</option>
                      <option :value="1.3">1.3x (Very Fast)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Article Body -->
              <div
                class="article-body text-adaptive lh-lg"
                v-html="articleContent"
              ></div>
            </article>


            <hr class="my-5 border-theme" />

            <!-- Related Publications -->
            <div v-if="relatedPosts.length > 0" class="mb-5">
              <h5 class="fw-bold mb-4 text-adaptive text-uppercase tracking-wide font-sm">
                Related Publications
              </h5>
              <div class="row g-4">
                <div
                  v-for="related in relatedPosts"
                  :key="related.id"
                  class="col-md-4"
                >
                  <router-link :to="'/blog/' + related.id" class="text-decoration-none">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden related-card bg-surface">
                      <img
                        :src="related.image"
                        @error.once="handleImgError"
                        class="card-img-top object-fit-cover"
                        height="140"
                        alt="Related post"
                      />
                      <div class="card-body p-3">
                        <div class="text-blue fw-semibold font-xs mb-1 text-uppercase">
                          {{ related.category }}
                        </div>
                        <h6 class="fw-bold text-adaptive mb-1 lh-base line-clamp-2">
                          {{ related.title }}
                        </h6>
                        <div class="text-muted font-xs">
                          {{ related.readTime || '5 min' }} read
                        </div>
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Typography & Colors */
.text-blue {
  color: var(--color-blue);
}
.bg-blue-light {
  background-color: var(--color-blue-light);
}
.bg-surface-hover {
  background-color: var(--color-surface-hover);
}
.font-xs {
  font-size: 0.75rem;
}
.font-sm {
  font-size: 0.875rem;
}
.tracking-wide {
  letter-spacing: 0.05em;
}
.tracking-wider {
  letter-spacing: 0.08em;
}
.lh-lg {
  line-height: 1.9;
}

/* Global Page Layout & Grid */
.blog-detail-page {
  min-height: 100vh;
  font-family: var(--font-family-display, "Sora", sans-serif);
  color: var(--color-text);
  background: var(--page-linear-bg);
}

.blog-detail-global-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 80px;
}

/* Reading Progress */
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: transparent;
  z-index: 9999;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-blue));
  transition: width 0.1s ease-out;
}

/* Back Button */
.btn-back-soft {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
  border-radius: 99px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.btn-back-soft:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateX(-4px);
  box-shadow: var(--shadow-sm);
}

/* Main Article Card */
.blog-main-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.blog-author-row {
  min-width: 0;
}

.byline-title {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.blog-post-meta {
  flex-wrap: wrap;
  gap: 0.25rem 0.45rem;
}

.article-title {
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-size: clamp(2rem, 5vw, 2.75rem);
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

/* Hero Image Section */
.article-hero-wrapper {
  background-color: var(--color-surface-hover);
  border-radius: 20px;
}

.article-hero-img {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-hero-wrapper:hover .article-hero-img {
  transform: scale(1.02);
}

/* ── Clean & Minimal TTS player bar ───────────────────────────────── */
.minimal-tts-player {
  background: var(--color-glass-bg, rgba(255, 255, 255, 0.65));
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border, var(--color-border)) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 100%;
}

[data-theme="dark"] .minimal-tts-player {
  background: rgba(255, 255, 255, 0.03);
}

/* TTS Animated Soundwaves */
.tts-wave-icon {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 20px;
  width: 24px;
}

.tts-wave-icon span {
  display: block;
  width: 3px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 4px;
  transition: height 0.2s ease;
}

.tts-wave-icon.active span:nth-child(1) {
  animation: tts-wave 0.8s ease-in-out infinite 0s;
}
.tts-wave-icon.active span:nth-child(2) {
  animation: tts-wave 0.8s ease-in-out infinite 0.15s;
}
.tts-wave-icon.active span:nth-child(3) {
  animation: tts-wave 0.8s ease-in-out infinite 0.3s;
}
.tts-wave-icon.active span:nth-child(4) {
  animation: tts-wave 0.8s ease-in-out infinite 0.45s;
}

@keyframes tts-wave {
  0%, 100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
}

/* Minimal Player buttons */
.tts-min-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.tts-min-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: #fff;
  transform: scale(1.08);
}

.tts-min-btn.active {
  background: var(--color-primary);
  color: #fff;
}

.tts-min-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Borderless selectors */
.tts-borderless-select {
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tts-borderless-select:hover:not(:disabled) {
  color: var(--color-primary);
  background-color: var(--color-surface-hover);
}

.tts-dropdown-wrap {
  display: flex;
  align-items: center;
  background: var(--color-surface);
  padding: 4px 10px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
}

.tts-min-progress {
  min-width: 120px;
}

/* Progress bar inside TTS */
.tts-progress-track {
  height: 6px;
  background: var(--color-border-soft, var(--color-border));
  border-radius: 99px;
  overflow: hidden;
}

.tts-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-blue));
  border-radius: 99px;
  transition: width 0.25s linear;
}

/* ── Article Content Body typography ───────────────────────────────── */
.article-body {
  font-size: 1.08rem;
  line-height: 1.95;
  color: var(--color-text);
}

.article-body :deep(p) {
  margin-bottom: 1.75rem;
}

.article-body :deep(h2) {
  margin-top: 2.75rem;
  margin-bottom: 1.25rem;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

.article-body :deep(h3) {
  margin-top: 2.25rem;
  margin-bottom: 1rem;
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

.article-body :deep(h4) {
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
  scroll-margin-top: 100px;
}

/* List element enhancements */
.article-body :deep(ul),
.article-body :deep(ol) {
  margin-bottom: 1.75rem;
  padding-left: 1.75rem;
}

.article-body :deep(li) {
  margin-bottom: 0.65rem;
}

/* Interactive tables */
.article-body :deep(table) {
  width: 100%;
  margin: 2.5rem 0;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  font-size: 0.95rem;
}

.article-body :deep(th:last-child),
.article-body :deep(td:last-child) {
  border-right: none;
}

.article-body :deep(tr:last-child) td {
  border-bottom: none;
}

.article-body :deep(th) {
  background-color: var(--color-surface-hover);
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.article-body :deep(tr:hover) td {
  background-color: var(--color-surface-hover);
}

/* ── Sticky Right Sidebar ────────────────────────────────────────── */
.sticky-sidebar-container {
  position: sticky;
  top: 95px;
}

.toc-card {
  border: 1px solid var(--color-border);
}

.toc-nav {
  border-left: 2px solid var(--color-border);
  padding-left: 0.5rem;
}

.toc-link {
  color: var(--color-text-muted) !important;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 6px 12px;
  border-left: 2px solid transparent;
  margin-left: -2px;
}

.toc-link:hover {
  color: var(--color-primary) !important;
  background-color: var(--color-surface-hover);
}

.toc-link.active {
  color: var(--color-primary) !important;
  border-left-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* Author widget & cards */
.author-widget-card,
.share-widget-card {
  border: 1px solid var(--color-border);
}

/* Custom Share Buttons */
.share-btn-round {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.share-btn-round:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

/* Social media colors on hover */
.twitter-btn:hover {
  background-color: #000 !important;
  border-color: #000 !important;
  color: #fff !important;
}

.linkedin-btn:hover {
  background-color: #0077b5 !important;
  border-color: #0077b5 !important;
  color: #fff !important;
}

.facebook-btn:hover {
  background-color: #1877f2 !important;
  border-color: #1877f2 !important;
  color: #fff !important;
}

.copy-btn:hover {
  background-color: var(--color-primary-light) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

/* Transition animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Related cards */
.related-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--color-border) !important;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-primary) !important;
}

/* Responsive configurations */
@media (max-width: 991px) {
  .blog-detail-global-grid {
    padding: 24px 16px 40px;
  }

  .blog-main-card {
    padding: 1.5rem !important;
  }

  .article-title {
    font-size: clamp(1.8rem, 5vw, 2.25rem);
  }

  .article-body {
    font-size: 1rem;
  }

  /* Style mobile share pills nicely */
  .d-lg-none .share-btn-round {
    width: auto;
    height: auto;
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    gap: 8px;
  }
}
</style>
