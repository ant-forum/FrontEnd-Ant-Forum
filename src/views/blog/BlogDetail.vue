<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";
import SkeletonLoader from "../../components/SkeletonLoader.vue";

// ── Text-to-Speech ────────────────────────────────────────────────────────
const ttsState    = ref('idle'); // 'idle' | 'playing' | 'paused'
const ttsProgress = ref(0);
const ttsError    = ref('');
const ttsRate     = ref(0.9);   // speed: 0.5 – 2
const ttsVoices   = ref([]);
const ttsVoice    = ref(null);  // selected SpeechSynthesisVoice

const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Priority list – first match wins
const PREFERRED_VOICE_NAMES = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Aria Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Samantha',      // macOS
  'Karen',         // macOS AU
  'Daniel',        // macOS UK
  'Alex',          // macOS
];

const loadVoices = () => {
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return;
  // Only show English voices
  const enVoices = all.filter(v => v.lang.startsWith('en'));
  ttsVoices.value = enVoices;
  // Pick best default
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = enVoices.find(v => v.name === name);
    if (found) { ttsVoice.value = found; break; }
  }
  if (!ttsVoice.value && enVoices.length) ttsVoice.value = enVoices[0];
};

if (isTTSSupported) {
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  loadVoices(); // may already be ready
}

const getArticleText = () => {
  const el = document.querySelector('.article-body');
  return el ? el.innerText : '';
};

const ttsPlay = () => {
  if (!isTTSSupported) return;
  if (ttsState.value === 'paused') {
    window.speechSynthesis.resume();
    ttsState.value = 'playing';
    return;
  }
  window.speechSynthesis.cancel();
  const text = getArticleText();
  if (!text) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'en-US';
  utt.rate  = ttsRate.value;
  utt.pitch = 1;
  if (ttsVoice.value) utt.voice = ttsVoice.value;
  utt.onstart    = () => { ttsState.value = 'playing'; ttsProgress.value = 0; };
  utt.onend      = () => { ttsState.value = 'idle';    ttsProgress.value = 100; };
  utt.onerror    = (e) => { ttsState.value = 'idle';   ttsError.value = e.error; };
  utt.onboundary = (e) => {
    if (e.charLength != null)
      ttsProgress.value = Math.round((e.charIndex / text.length) * 100);
  };
  window.speechSynthesis.speak(utt);
};

const ttsPause = () => {
  if (!isTTSSupported) return;
  window.speechSynthesis.pause();
  ttsState.value = 'paused';
};

const ttsStop = () => {
  if (!isTTSSupported) return;
  window.speechSynthesis.cancel();
  ttsState.value = 'idle';
  ttsProgress.value = 0;
};

const ttsSpeedLabel = computed(() => {
  const r = ttsRate.value;
  if (r <= 0.6) return 'Slow';
  if (r <= 0.85) return 'Normal';
  if (r <= 1.1) return 'Fast';
  return 'Very Fast';
});
// ─────────────────────────────────────────────────────────────────────────
import { useBlogStore } from '../../stores/BlogStore';
import { useAuthStore } from '../../stores/AuthStore';
import { renderStoredContent } from '../../utils/richContent';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();
const authStore = useAuthStore();

const activeSection = ref('');
const scrollProgress = ref(0);
const localLoading = ref(true);

const post = computed(() => blogStore.blog);
const articleContent = computed(() => {
  const rawContent = post.value?.content || post.value?.description || '';
  const normalizedContent = typeof rawContent === 'string' ? rawContent.replace(/\r\n/g, '\n') : '';
  return renderStoredContent(normalizedContent);
});

const relatedPosts = computed(() => {
  if (!post.value) return [];
  const list = blogStore.blogs.filter(b => b.id != post.value.id);
  const sameCategory = list.filter(b => b.category === post.value.category);
  const remaining = list.filter(b => b.category !== post.value.category);
  return [...sameCategory, ...remaining].slice(0, 2);
});

const headings = computed(() => {
  const list = [];
  if (!post.value) return list;
  
  const bodyText = post.value.content || post.value.description || '';
  const regex = /<h[2-4][^>]*id="([^"]+)"[^>]*>(.*?)<\/h[2-4]>/gi;
  let match;
  while ((match = regex.exec(bodyText)) !== null) {
    list.push({
      id: match[1],
      label: match[2].replace(/<[^>]*>/g, '')
    });
  }
  return list;
});

const updateScrollProgress = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0;
};

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeSection.value = id;
  }
};

const loadBlogData = async (id) => {
  try {
    // Ensure categories are loaded so normalizeBlog can resolve category names
    if (blogStore.categories.length === 0) {
      await blogStore.fetchCategories().catch(() => {});
    }

    if (authStore.user?.role === 'admin') {
      await blogStore.fetchBlogById(id);
    } else {
      await blogStore.fetchBlogPreview(id);
    }
    if (blogStore.blogs.length === 0) {
      await blogStore.fetchBlogs();
    }
  } catch (err) {
    console.error("Failed to load blog:", err);
    router.push({ name: 'not-found' });
  } finally {
    localLoading.value = false;
  }
};

watch(() => route.params.id, async (newId) => {
  if (newId) {
    localLoading.value = true;
    await loadBlogData(newId);
  }
});

onMounted(async () => {
  window.addEventListener('scroll', updateScrollProgress);
  await loadBlogData(route.params.id);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress);
  ttsStop();
});

const handleImgError = (e) => {
  e.target.src = "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};
</script>

<template>
  <div class="blog-detail-page min-vh-100">
    <!-- Reading Progress Bar -->
    <div class="reading-progress-container">
      <div class="reading-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <Navbar />

    <div class="blog-detail-global-grid">
      <!-- Main Content -->
      <div class="blog-detail-wrapper">
      <!-- Back Button -->
      <div class="mb-4">
        <router-link to="/blog" class="btn-back-soft text-decoration-none d-inline-flex align-items-center gap-2">
          <i class="bi bi-arrow-left"></i>
          <span>Back to Articles</span>
        </router-link>
      </div>

      <!-- Loading State: Beautiful skeletons matching standard layout dimensions -->
      <div v-if="localLoading" class="blog-detail-content">
        <div class="row py-5">
          <article class="col-12">
            <div class="mb-4">
              <SkeletonLoader variant="text" height="20px" width="100px" class="d-inline-block me-2" />
              <SkeletonLoader variant="text" height="20px" width="120px" class="d-inline-block" />
            </div>
            <SkeletonLoader variant="text" height="48px" width="90%" class="mb-4" />
            
            <div class="d-flex align-items-center mb-5">
              <SkeletonLoader variant="avatar" width="48px" height="48px" class="me-3" round />
              <div class="w-50">
                <SkeletonLoader variant="text" height="20px" width="40%" class="mb-2" />
                <SkeletonLoader variant="text" height="16px" width="25%" />
              </div>
            </div>
            
            <SkeletonLoader variant="image" height="350px" class="mb-5" />
            <SkeletonLoader variant="text" height="20px" width="100%" class="mb-3" />
            <SkeletonLoader variant="text" height="20px" width="95%" class="mb-3" />
          </article>
        </div>
      </div>



      <!-- Loaded State -->
      <div v-else-if="post" class="blog-detail-content position-relative">
        
        <div class="row position-relative">
          <!-- Main Content -->
          <article class="col-12">
            <div class="blog-main-card p-4 p-md-5 rounded-4 mb-5 border border-theme bg-surface shadow-sm">
              <div class="blog-author-row d-flex align-items-center mb-4">
                <img :src="post.author_avatar" class="rounded-circle me-3 border border-theme object-fit-cover" width="48" height="48" alt="Author">
                <div class="min-w-0">
                  <h6 class="mb-0 fw-bold text-adaptive byline-title">
                    {{ post.author }}
                  </h6>
                  <div class="text-muted font-sm d-flex align-items-center mt-1 blog-post-meta">
                    <span class="d-inline-flex align-items-center gap-1">
                      <i class="bi bi-clock-history"></i>
                      {{ post.postedAt || post.date }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Metadata -->
              <div class="mb-4">
                <span v-for="tag in post.tags" :key="tag" class="badge bg-purple-light text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3 me-2 text-uppercase">
                  {{ tag }}
                </span>
                <span class="badge bg-purple-light text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3 text-uppercase">
                  {{ post.category }}
                </span>
              </div>

              <h1 class="display-4 fw-bold text-adaptive mb-4 article-title">
                {{ post.title }}
              </h1>

              <!-- Hero Image -->
              <img :src="post.image" @error.once="handleImgError" class="img-fluid rounded-4 mb-5 w-100 object-fit-cover border border-theme" style="max-height: 400px;" alt="Hero Image">

              <!-- ── Read Article bar ── -->
              <div class="read-article-bar mb-4">

                <!-- Row 1: label + controls + status -->
                <div class="d-flex align-items-center gap-3 flex-wrap">
                  <!-- Wave + label -->
                  <div class="d-flex align-items-center gap-2">
                    <span class="tts-wave-icon" :class="{ active: ttsState === 'playing' }">
                      <span></span><span></span><span></span><span></span>
                    </span>
                    <span class="fw-bold text-adaptive" style="font-size:.9rem">Read Article</span>
                    <span v-if="!isTTSSupported" class="text-muted" style="font-size:.75rem">(unsupported)</span>
                  </div>

                  <!-- Play / Pause -->
                  <button
                    id="tts-play-pause-btn"
                    @click="ttsState === 'playing' ? ttsPause() : ttsPlay()"
                    :disabled="!isTTSSupported"
                    :class="['tts-btn', ttsState === 'playing' ? 'tts-btn-active' : '']"
                    :title="ttsState === 'playing' ? 'Pause' : 'Play'"
                  >
                    <i :class="['bi', ttsState === 'playing' ? 'bi-pause-fill' : 'bi-play-fill']"></i>
                  </button>

                  <!-- Stop -->
                  <button
                    id="tts-stop-btn"
                    @click="ttsStop"
                    :disabled="!isTTSSupported || ttsState === 'idle'"
                    class="tts-btn" title="Stop"
                  >
                    <i class="bi bi-stop-fill"></i>
                  </button>

                  <!-- Progress (only while active) -->
                  <div v-if="ttsState !== 'idle'" class="tts-progress-wrap flex-grow-1">
                    <div class="tts-progress-track">
                      <div class="tts-progress-fill" :style="{ width: ttsProgress + '%' }"></div>
                    </div>
                  </div>

                  <span v-if="ttsState !== 'idle'" class="tts-status-badge" :class="ttsState">
                    {{ ttsState === 'playing' ? 'Reading…' : 'Paused' }}
                  </span>
                </div>

                <!-- Row 2: Voice + Speed settings -->
                <div class="tts-settings-row d-flex align-items-center gap-3 flex-wrap mt-2">

                  <!-- Voice selector -->
                  <div class="d-flex align-items-center gap-2" v-if="ttsVoices.length">
                    <i class="bi bi-mic-fill text-muted" style="font-size:.8rem"></i>
                    <select
                      id="tts-voice-select"
                      class="tts-select"
                      :disabled="ttsState === 'playing'"
                      :value="ttsVoice?.name"
                      @change="e => ttsVoice = ttsVoices.find(v => v.name === e.target.value)"
                    >
                      <option v-for="v in ttsVoices" :key="v.name" :value="v.name">
                        {{ v.name.replace('Google ', '').replace(' Online (Natural)', '') }}
                        {{ v.localService ? '' : '(Online)' }}
                      </option>
                    </select>
                  </div>

                  <!-- Speed slider -->
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-speedometer2 text-muted" style="font-size:.8rem"></i>
                    <span class="tts-speed-label">{{ ttsSpeedLabel }}</span>
                    <input
                      id="tts-speed-slider"
                      type="range"
                      class="tts-slider"
                      min="0.5" max="1.5" step="0.05"
                      :disabled="ttsState === 'playing'"
                      v-model.number="ttsRate"
                    >
                  </div>

                </div>
              </div>

              <!-- Article Body -->
              <div class="article-body text-adaptive lh-lg" v-html="articleContent"></div>
            </div>

            <!-- Newsletter -->
            <!-- <div class="newsletter-section mt-5 p-5 rounded-4 text-center position-relative overflow-hidden border">
              <div class="newsletter-gradient position-absolute top-0 start-0 w-100 h-100"></div>
              <div class="position-relative z-3">
                <div class="d-flex justify-content-center mb-3">
                  <div class="bg-surface rounded-3 p-2 shadow-sm text-purple border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope-paper-heart-fill" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M8 3a1 1 0 0 1 1 1v1h-2V4a1 1 0 0 1 1-1zm1 3v2h2v-2h-2zm-3 0v2H4v-2h2z"/>
                      <path d="M4 8.5v4.5A1.5 1.5 0 0 0 5.5 14.5h5a1.5 1.5 0 0 0 1.5-1.5v-4.5h-9z"/>
                      <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h9A1.5 1.5 0 0 1 14 5.5v1.884L8 10.3l-6-2.916V5.5zm6 5.86-6-2.915v.85c0 .762.58 1.396 1.328 1.488A1.5 1.5 0 0 0 4.5 12h7a1.5 1.5 0 0 0 1.172-1.217C13.42 10.686 14 10.052 14 9.29v-.85L8 11.36z"/>
                      <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                    </svg>
                  </div>
                </div>
                <h3 class="fw-bold mb-3 text-adaptive">Join the DevEcosystem Weekly</h3>
                <p class="text-muted mb-4 mx-auto" style="max-width: 400px;">
                  Get deep-dive tutorials and architecture patterns sent straight to your inbox every Wednesday.
                </p>
                <form class="d-flex justify-content-center mx-auto" style="max-width: 450px;">
                  <input type="email" class="form-control form-control-lg rounded-pill-start border-end-0 shadow-sm bg-surface" placeholder="Enter your email address">
                  <button class="btn btn-dark btn-lg rounded-pill-end px-4 shadow-sm" type="button">Subscribe</button>
                </form>
              </div>
            </div> -->

            <hr class="my-5 border-theme">

            <!-- Related Publications -->
            <div v-if="relatedPosts.length > 0">
              <h5 class="fw-bold mb-4 text-adaptive text-uppercase tracking-wide font-sm">Related Publications</h5>
              <div class="row g-4">
                <div v-for="related in relatedPosts" :key="related.id" class="col-md-6">
                  <router-link :to="'/blog/' + related.id" class="text-decoration-none">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden related-card bg-surface">
                      <img :src="related.image" @error.once="handleImgError" class="card-img-top object-fit-cover" height="140" alt="Related post">
                      <div class="card-body p-3">
                        <div class="text-purple fw-semibold font-xs mb-1 text-uppercase">{{ related.category }}</div>
                        <h6 class="fw-bold text-adaptive mb-1 lh-base line-clamp-2">{{ related.title }}</h6>
                        <div class="text-muted font-xs">{{ related.readTime }} read</div>
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Typography & Colors */
.text-purple { color: var(--color-purple); }
.bg-purple { background-color: var(--color-purple); }
.bg-purple-light { background-color: var(--color-purple-light); }
.bg-surface-hover { background-color: var(--color-surface-hover); }
.bg-darker { background-color: #0a0e17; }
.text-pink { color: #ec4899; }
.text-green { color: #10b981; }
.text-blue { color: #60a5fa; }
.text-warning { color: #fbbf24; }
.text-red { color: #ef4444; }
.text-yellow { color: #fbbf24; }
.font-xs { font-size: 0.75rem; }
.font-sm { font-size: 0.875rem; }
.tracking-wide { letter-spacing: 0.05em; }
.lh-lg { line-height: 1.8; }

/* ── Read Article / TTS ──────────────────────────────────────────── */
.read-article-bar {
  background: var(--color-glass-bg, rgba(255,255,255,.06));
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border, rgba(255,255,255,.1));
  border-radius: 999px;
  padding: .6rem 1.1rem;
  flex-wrap: wrap;
  gap: .5rem;
  box-shadow: var(--shadow-sm);
  transition: all .3s ease;
}

/* Wave icon animation */
.tts-wave-icon {
  display: flex; align-items: center; gap: 2px; height: 18px;
}
.tts-wave-icon span {
  display: block;
  width: 3px; height: 6px;
  background: var(--color-primary);
  border-radius: 4px;
  transition: height .2s ease;
}
.tts-wave-icon.active span:nth-child(1) { animation: tts-wave 1s ease-in-out infinite .0s; }
.tts-wave-icon.active span:nth-child(2) { animation: tts-wave 1s ease-in-out infinite .15s; }
.tts-wave-icon.active span:nth-child(3) { animation: tts-wave 1s ease-in-out infinite .3s; }
.tts-wave-icon.active span:nth-child(4) { animation: tts-wave 1s ease-in-out infinite .45s; }
@keyframes tts-wave {
  0%,100% { height: 6px; }
  50%      { height: 16px; }
}

/* Control buttons */
.tts-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-hover);
  color: var(--color-text);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.tts-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  transform: scale(1.08);
}
.tts-btn-active {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: #fff !important;
}
.tts-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Progress track */
.tts-progress-wrap { min-width: 80px; }
.tts-progress-track {
  height: 4px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}
.tts-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-purple));
  border-radius: 999px;
  transition: width .3s linear;
}

/* Status badge */
.tts-status-badge {
  font-size: .7rem; font-weight: 800;
  padding: .25rem .65rem;
  border-radius: 999px;
  letter-spacing: .04em;
}
.tts-status-badge.playing {
  background: rgba(99,102,241,.12);
  color: var(--color-primary);
}
.tts-status-badge.paused {
  background: rgba(217,119,6,.12);
  color: #d97706;
}

/* Voice selector */
.tts-select {
  max-width: 200px;
  font-size: .78rem;
  font-weight: 600;
  padding: .3rem .65rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-hover);
  color: var(--color-text);
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right .65rem center;
  padding-right: 1.8rem;
  transition: border-color .2s;
}
.tts-select:focus { border-color: var(--color-primary); }
.tts-select:disabled { opacity: .45; cursor: not-allowed; }

/* Speed label */
.tts-speed-label {
  font-size: .75rem;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 56px;
}

/* Speed slider */
.tts-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100px;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
  outline: none;
  cursor: pointer;
  transition: background .2s;
}
.tts-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  transition: transform .15s;
}
.tts-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
.tts-slider:disabled { opacity: .4; cursor: not-allowed; }

/* Settings row divider */
.tts-settings-row {
  border-top: 1px solid var(--color-border);
  padding-top: .5rem;
  margin-top: .25rem !important;
}
/* ──────────────────────────────────────────────────────────────── */

.text-adaptive {
  color: var(--color-text) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

.bg-surface {
  background-color: var(--color-surface) !important;
}

/* Global Grid */
.blog-detail-global-grid {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

.blog-detail-wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.blog-detail-content {
  width: 100%;
}

.blog-detail-page {
  min-height: 100vh;
  font-family: 'Sora', sans-serif;
  color: var(--color-text);
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
  background: var(--color-purple);
  transition: width 0.1s ease-out;
}

/* Back Button */
.btn-back-soft {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-back-soft:hover {
  color: var(--color-purple);
  transform: translateX(-3px);
}

/* Typography Overrides */
.article-title {
  letter-spacing: -0.03em;
  line-height: 1.15;
  font-size: clamp(2rem, 4vw, 2.8rem);
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
}

.blog-main-card {
  background-color: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
  overflow: hidden;
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

.meta-dot {
  color: var(--color-text-muted);
}

/* Article Body */
.article-body {
  font-size: 1.05rem;
  line-height: 1.9;
  max-width: 72ch;
}

.article-body :deep(table) {
  width: 100%;
  margin: 2rem 0;
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
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: left;
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

.article-body :deep(td) {
  color: var(--color-text-muted);
}

.article-body :deep(tr:hover) td {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.article-body :deep(tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.015);
}

[data-theme='dark'] .article-body :deep(tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.02);
}

.article-body :deep(p) {
  margin-bottom: 1.5rem;
}

.article-body :deep(h2) {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.article-body :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.4rem;
  font-weight: 600;
}

.article-body :deep(ul), 
.article-body :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.article-body :deep(li) {
  margin-bottom: 0.5rem;
}

/* Sticky Sidebar */
.sticky-sidebar-container {
  position: sticky;
  top: 100px;
}

.toc-nav {
  border-left: 2px solid var(--color-border);
  padding-left: 1rem;
}

/* Share Buttons */
.share-card {
  border: 1px solid var(--color-border) !important;
}

.share-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  font-size: 1.25rem;
}

.share-btn:hover {
  background-color: var(--color-purple-light);
  color: var(--color-purple);
  border-color: var(--color-purple);
  transform: translateY(-2px);
}

.toc-link {
  transition: all 0.2s ease;
  position: relative;
}

.toc-link::before {
  content: '';
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background-color: var(--color-purple);
  transition: height 0.2s ease;
  border-radius: 4px;
}

.toc-link.active::before {
  height: 100%;
}

.toc-link:hover {
  color: var(--color-purple) !important;
}

/* Code Block */
.code-block-wrapper {
  border: 1px solid var(--color-border);
  border-radius: 1rem !important;
}

.code-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.dot {
  font-size: 24px;
  line-height: 10px;
  margin-right: 4px;
}

.code-block-wrapper pre {
  overflow-x: auto;
}

/* Takeaways */
.takeaways-box {
  border-left: 4px solid var(--color-purple);
}

.takeaways-icon {
  width: 32px;
  height: 32px;
  top: -16px;
  left: 32px;
  box-shadow: 0 4px 6px var(--color-shadow);
}

/* Newsletter */
.newsletter-section {
  border: 1px solid var(--color-border);
}

.newsletter-gradient {
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-surface) 100%);
  z-index: 1;
}

.rounded-pill-start {
  border-top-left-radius: 50rem;
  border-bottom-left-radius: 50rem;
  padding-left: 1.5rem;
}

.rounded-pill-end {
  border-top-right-radius: 50rem;
  border-bottom-right-radius: 50rem;
}

/* Related Cards */
.related-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--color-border) !important;
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
}



@media (max-width: 991px) {
  .blog-detail-global-grid {
    padding: 20px 16px 40px;
  }
  
  .article-title {
    font-size: clamp(1.75rem, 5vw, 2.25rem);
  }
  
  .article-body {
    font-size: 1rem;
  }
}
</style>
