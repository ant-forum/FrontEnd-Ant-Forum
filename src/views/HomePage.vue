<script setup>
import { useAuthStore } from '../stores/AuthStore'
import Navbar from '../components/layouts/header.vue'
import { useForumStore } from '../stores/ForumStore'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { resolveMediaUrl } from '../utils/mediaUrl'

const auth = useAuthStore()
const forumStore = useForumStore()
const router = useRouter()

const features = [
  { 
    title: 'Open Source', 
    desc: 'Everything we build is open for the community to learn and contribute.',
    icon: 'bi-github',
    color: '#8b5cf6'
  },
  { 
    title: 'Mentorship', 
    desc: 'Connect with senior engineers who can guide your technical journey.',
    icon: 'bi-person-badge',
    color: '#3b82f6'
  },
  { 
    title: 'Real Projects', 
    desc: 'Stop building todos. Start building production-ready software.',
    icon: 'bi-rocket-takeoff',
    color: '#22c55e'
  }
]

onMounted(async () => {
  if (!forumStore.allDiscussions || forumStore.allDiscussions.length === 0) {
    try {
      await forumStore.fetchDiscussions()
    } catch (e) {
      console.error('Error loading homepage discussions:', e)
    }
  }
})

const liveDiscussions = computed(() => {
  return Array.isArray(forumStore.allDiscussions) ? forumStore.allDiscussions : [];
});

const recentThreadsLive = computed(() => {
  return liveDiscussions.value.slice(0, 3).map(d => {
    let timeDisplay = 'Recent';
    if (d.created_at || d.createdAt) {
      const diffMs = new Date() - new Date(d.created_at || d.createdAt);
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) {
        timeDisplay = diffHours <= 0 ? 'Just now' : `${diffHours}h ago`;
      } else {
        timeDisplay = new Date(d.created_at || d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
    }
    
    let authorName = 'Anonymous';
    let authorAvatar = 'https://i.pravatar.cc/150?u=anonymous';
    if (d.user) {
      authorName = d.user.username || d.user.name || authorName;
      const rawPic = d.user.profile_pic || d.user.avatar;
      authorAvatar = resolveMediaUrl(rawPic) || authorAvatar;
    } else if (d.author) {
      authorName = typeof d.author === 'object' ? (d.author.username || d.author.name) : d.author;
      const rawPic = d.author_avatar || (typeof d.author === 'object' ? (d.author.profile_pic || d.author.avatar) : null);
      authorAvatar = resolveMediaUrl(rawPic) || authorAvatar;
    }

    return {
      id: d.id,
      title: d.title || '',
      desc: d.description || d.excerpt || d.body || '',
      author: authorName,
      avatar: authorAvatar,
      category: d.category || 'General',
      replies: d.replies !== undefined ? d.replies : 0,
      views: d.views !== undefined ? d.views : 0,
      isSolved: d.is_solved || false,
      isHot: (d.likes || d.votes || 0) > 5,
      time: timeDisplay
    };
  });
});

const latestProjectsLive = computed(() => {
  const showcaseThreads = liveDiscussions.value.filter(d => String(d.category).toLowerCase() === 'showcase');
  
  return showcaseThreads.slice(0, 3).map(d => {
    let authorName = 'Anonymous';
    let authorAvatar = 'https://i.pravatar.cc/150?u=anonymous';
    if (d.user) {
      authorName = d.user.username || d.user.name || authorName;
      const rawPic = d.user.profile_pic || d.user.avatar;
      authorAvatar = resolveMediaUrl(rawPic) || authorAvatar;
    } else if (d.author) {
      authorName = typeof d.author === 'object' ? (d.author.username || d.author.name) : d.author;
      const rawPic = d.author_avatar || (typeof d.author === 'object' ? (d.author.profile_pic || d.author.avatar) : null);
      authorAvatar = resolveMediaUrl(rawPic) || authorAvatar;
    }

    const tagLabels = Array.isArray(d.tags) 
      ? d.tags.map(t => typeof t === 'object' ? (t.label || t.name) : t)
      : [];

    return {
      id: d.id,
      title: d.title || '',
      desc: d.description || d.excerpt || d.body || '',
      author: authorName,
      avatar: authorAvatar,
      tags: tagLabels.slice(0, 3),
      stars: d.likes !== undefined ? d.likes : (d.votes !== undefined ? d.votes : 0),
      views: d.views !== undefined ? d.views : 0,
      image: resolveMediaUrl(d.thumbnail || d.image) || 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&q=80&w=600'
    };
  });
});
</script>

<template>
  <div class="home-page-container">
    <Navbar />

    <main class="hero-section position-relative">
      <!-- Background Glows -->
      <div class="glow-bg glow-pink"></div>
      <div class="glow-bg glow-purple"></div>
      
      <div class="container position-relative">
        
        <!-- Floating Elements -->
        <div class="floating-elements d-none d-lg-block">
          <!-- Sarah Jenkins Card -->
          <div class="floating-card sarah-card shadow-sm">
            <div class="d-flex align-items-center gap-2">
              <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah" class="avatar-img">
              <div>
                <div class="name">Sarah Jenkins</div>
                <div class="date">Joined Wed 27 Oct, 2023</div>
                <div class="accent-line"></div>
              </div>
            </div>
          </div>

          <!-- Alex Chen Card -->
          <div class="floating-card alex-card shadow-sm">
            <div class="d-flex align-items-center gap-3">
              <div class="icon-circle">
                <i class="bi bi-code-slash"></i>
              </div>
              <div>
                <div class="name">Alex Chen</div>
                <div class="status">Merged PR #1042</div>
                <div class="accent-line-green"></div>
              </div>
            </div>
          </div>

          <!-- Senior Engineer Pill -->
          <div class="floating-pill engineer-pill shadow">
            <img src="https://i.pravatar.cc/150?u=engineer" alt="Engineer" class="pill-avatar">
            Senior Engineer
          </div>

          <!-- Verified Contributor Pill -->
          <div class="floating-pill contributor-pill shadow">
            <div class="check-icon">
              <i class="bi bi-patch-check-fill"></i>
            </div>
            Verified Contributor
          </div>

          <!-- Tech Lead Team Card -->
          <div class="floating-card tech-lead-card shadow-lg">
            <div class="card-content">
              <div class="small-text">Code Review with</div>
              <div class="title">Tech Lead Team</div>
              <div class="tags-row mt-2">
                <span class="tag">React</span>
                <span class="tag">System Design</span>
              </div>
              <div class="time-row mt-3">
                <i class="bi bi-calendar-event me-2"></i>
                2:00 PM, Today
              </div>
            </div>
          </div>
        </div>

        <!-- Main Hero Content -->
        <div class="hero-content text-center">
          <h1 class="hero-title">
            Empowering the<br>
            Next Gen of Developers
          </h1>
          <p class="hero-subtitle mx-auto">
            Digital workspace for builders and technical communities. We provide<br class="d-none d-md-block">
            the mind to build better software together.
          </p>
          
          <div class="hero-actions d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <button class="btn btn-white-pill rounded-pill px-5 py-2 shadow-sm fw-semibold">Learn More</button>
            <router-link to="/login" class="btn btn-dark-pill rounded-pill px-5 py-2 shadow-sm fw-semibold d-flex align-items-center justify-content-center">
              Get Started
              <i class="bi bi-arrow-right ms-2"></i>
            </router-link>
          </div>
        </div>
      </div>

    </main>

    <!-- New Sections -->
    <section class="features-section py-5">
      <div class="container py-lg-5">
        <div class="row g-4">
          <div v-for="feature in features" :key="feature.title" class="col-lg-4">
            <div class="feature-card p-4 rounded-4 bg-surface border h-100 transition-up">
              <div class="icon-box mb-4" :style="{ color: feature.color, background: feature.color + '15' }">
                <i :class="['bi', feature.icon]"></i>
              </div>
              <h3 class="fw-bold mb-3">{{ feature.title }}</h3>
              <p class="text-muted mb-0">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="showcase-preview-section py-5 bg-surface-alt">
      <div class="container py-lg-5">
        <div class="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h2 class="section-title fw-black mb-2">Latest Showcase</h2>
            <p class="text-muted mb-0">Discover what the community is building.</p>
          </div>
          <router-link to="/showcase" class="btn btn-view-all rounded-pill px-4 fw-semibold">
            View All <i class="bi bi-grid-3x3-gap ms-1"></i>
          </router-link>
        </div>

        <div class="row g-4">
          <div v-for="project in latestProjectsLive" :key="project.id" class="col-lg-4" @click="router.push('/forum/' + project.id)" style="cursor: pointer;">
            <div class="project-card rounded-4 overflow-hidden bg-surface border-0 h-100 shadow-sm transition-up">
              <!-- Project Image with Hover Overlay -->
              <div class="project-image position-relative">
                <img :src="project.image" :alt="project.title" class="img-fluid w-100 object-fit-cover" style="height: 240px;">
                <div class="project-overlay-v2 d-flex flex-column justify-content-between p-3">
                  <div class="d-flex justify-content-end">
                    <button class="btn btn-glass-blur rounded-circle p-2">
                      <i class="bi bi-heart"></i>
                    </button>
                  </div>
                  <div class="tags-row-v2">
                    <span v-for="tag in project.tags" :key="tag" class="badge-v2">{{ tag }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Project Content -->
              <div class="p-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4 class="fw-bold mb-0 project-title-link">{{ project.title }}</h4>
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <span class="d-flex align-items-center gap-1"><i class="bi bi-star-fill text-warning"></i> {{ project.stars }}</span>
                  </div>
                </div>
                <p class="text-muted small mb-4 line-clamp-2">{{ project.desc }}</p>
                
                <div class="d-flex align-items-center justify-content-between pt-3 border-top theme-border">
                  <div class="d-flex align-items-center gap-2">
                    <img :src="project.avatar" :alt="project.author" class="rounded-circle border border-2 border-surface shadow-sm" width="32" height="32">
                    <span class="fw-semibold small">{{ project.author }}</span>
                  </div>
                  <div class="text-muted small">
                    <i class="bi bi-eye me-1"></i> {{ project.views }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="forum-preview-section py-5">
      <div class="container py-lg-5">
        <div class="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h2 class="section-title fw-black mb-2">Active Discussions</h2>
            <p class="text-muted mb-0">Join the conversation and solve technical challenges.</p>
          </div>
          <router-link to="/forum" class="btn btn-view-all rounded-pill px-4 fw-semibold">
            Browse Forum <i class="bi bi-chat-right-text ms-1"></i>
          </router-link>
        </div>

        <div class="forum-container">
          <div v-for="thread in recentThreadsLive" :key="thread.id" class="forum-thread-row p-3 p-md-4 mb-3 transition-up border theme-border" @click="router.push('/forum/' + thread.id)">
            <div class="row align-items-center">
              <!-- Solved Status Column -->
              <div class="col-auto d-none d-md-block">
                <div class="status-indicator" :class="{ 'solved': thread.isSolved }">
                  <i :class="[thread.isSolved ? 'bi-check-lg' : 'bi-chat-left-dots']"></i>
                </div>
              </div>

              <!-- Content Column -->
              <div class="col">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="category-tag">{{ thread.category }}</span>
                  <span v-if="thread.isHot" class="badge-hot"><i class="bi bi-fire me-1"></i> Trending</span>
                  <span class="text-muted small">• {{ thread.time }}</span>
                </div>
                <h4 class="thread-title mb-2">{{ thread.title }}</h4>
                <p class="text-muted small mb-0 line-clamp-1 d-none d-md-block">{{ thread.desc }}</p>
              </div>

              <!-- Author & Stats Column -->
              <div class="col-lg-3 col-md-4 mt-3 mt-md-0 border-start-md ps-md-4 theme-border-start">
                <div class="d-flex align-items-center justify-content-between justify-content-md-end gap-4">
                  <div class="d-flex align-items-center gap-2">
                    <img :src="thread.avatar" :alt="thread.author" class="author-thumb" width="28" height="28">
                    <div class="author-info">
                      <div class="fw-bold small">{{ thread.author }}</div>
                    </div>
                  </div>
                  <div class="stats-group d-flex gap-3">
                    <div class="stat-item">
                      <span class="count">{{ thread.replies }}</span>
                      <span class="label">replies</span>
                    </div>
                    <div class="stat-item">
                      <span class="count">{{ thread.views }}</span>
                      <span class="label">views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Simple Footer to match the image -->
    <footer class="custom-footer container py-4 d-flex flex-column flex-md-row justify-content-between align-items-center border-top">
      <div class="footer-left small text-muted text-uppercase mb-3 mb-md-0">
        © 2024 ANT-Forum Ecosystem. High-Performance Technical Community.
      </div>
      <div class="footer-right d-flex gap-4 small fw-semibold text-uppercase">
        <router-link to="/changelog" class="footer-link">Changelog</router-link>
        <router-link to="/privacy" class="footer-link">Privacy Policy</router-link>
        <router-link to="/terms" class="footer-link">Terms of Service</router-link>
        <router-link to="/github" class="footer-link">Github</router-link>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--color-text);
  transition: background-color var(--transition-slow), color var(--transition-slow);
}

.glow-bg {
  position: absolute;
  width: 40vw;
  height: 40vw;
  filter: blur(120px);
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
  pointer-events: none;
}

.glow-pink {
  background: var(--color-purple);
  top: -10%;
  left: -10%;
}

.glow-purple {
  background: var(--color-primary);
  bottom: 20%;
  right: -10%;
}

/* Hero Section */
.hero-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 120px;
  min-height: 85vh;
}

.hero-content {
  position: relative;
  z-index: 5;
  margin-top: 40px;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 900;
  line-height: 1.05;
  color: var(--color-text);
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 800px;
}

/* Action Buttons */
.btn-white-pill {
  background: var(--color-surface) !important;
  color: var(--color-text) !important;
  border: 1px solid var(--color-border) !important;
}

.btn-dark-pill {
  background: var(--color-text) !important;
  color: var(--color-bg) !important;
  border: none !important;
}

/* Floating Cards & Pills */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 14px 20px;
  pointer-events: auto;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.floating-pill {
  position: absolute;
  background: var(--color-text);
  color: var(--color-bg);
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

/* Positions matching the image */
.sarah-card {
  top: 15%;
  left: 3%;
  animation: float 8s ease-in-out infinite;
}

.alex-card {
  top: 25%;
  right: 5%;
  animation: float 8s ease-in-out infinite 1s;
}

.tech-lead-card {
  top: 38%;
  right: 15%;
  background: var(--color-purple);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 24px;
  width: 250px;
  animation: float 8s ease-in-out infinite 0.5s;
}

.engineer-pill {
  bottom: 40%;
  left: 12%;
  animation: float 8s ease-in-out infinite 2s;
}

.contributor-pill {
  bottom: 40%;
  right: 18%;
  background: var(--color-purple);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite 1.5s;
}

.contributor-pill {
  bottom: 40%;
  right: 18%;
  background: #8b5cf6;
  animation: float 8s ease-in-out infinite 1.5s;
}

/* Card Details */
.avatar-img { width: 44px; height: 44px; border-radius: 50%; }
.sarah-card .name { font-weight: 800; font-size: 0.95rem; color: var(--color-text); }
.sarah-card .date { font-size: 0.75rem; color: var(--color-text-muted); }
.accent-line { width: 24px; height: 3px; background: var(--color-purple); margin-top: 5px; border-radius: 2px; }

.icon-circle { 
  width: 36px; height: 36px; 
  background: var(--color-primary-light); 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  color: var(--color-primary);
}
.alex-card .name { font-weight: 800; font-size: 0.95rem; color: var(--color-text); }
.alex-card .status { font-size: 0.75rem; color: var(--color-text-muted); }
.accent-line-green { width: 34px; height: 3px; background: var(--color-success); margin-top: 5px; border-radius: 2px; }

.pill-avatar { width: 26px; height: 26px; border-radius: 50%; }
.check-icon { color: white; font-size: 1.2rem; display: flex; align-items: center; }

.tech-lead-card .small-text { font-size: 0.8rem; opacity: 0.9; font-weight: 500; }
.tech-lead-card .title { font-size: 1.35rem; font-weight: 800; margin-top: 4px; }
.tags-row { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: rgba(255,255,255,0.2); padding: 5px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.time-row { background: rgba(0,0,0,0.15); padding: 10px 14px; border-radius: 14px; font-size: 0.85rem; display: flex; align-items: center; font-weight: 500; }

/* Footer */
.custom-footer {
  border-color: var(--color-border) !important;
}

.footer-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-primary);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(0, -20px); }
}

/* New Section Styles */
.bg-surface {
  background-color: var(--color-surface) !important;
}

.bg-surface-alt {
  background-color: var(--color-bg) !important;
}

.theme-border {
  border-color: var(--color-border) !important;
}

.theme-border-start {
  border-left: 1px solid var(--color-border) !important;
}

.feature-card {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary) !important;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.project-card {
  transition: all 0.3s ease;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border) !important;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.project-image {
  overflow: hidden;
}

.project-image img {
  transition: transform 0.5s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

.project-overlay-v2 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay-v2 {
  opacity: 1;
}

.btn-glass-blur {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.badge-v2 {
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-right: 6px;
}

.project-title-link {
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text);
}

.project-card:hover .project-title-link {
  color: var(--color-primary);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-view-all {
  border: 2px solid var(--color-text) !important;
  color: var(--color-text) !important;
  transition: all 0.3s ease;
  background: transparent !important;
}

.btn-view-all:hover {
  background: var(--color-text) !important;
  color: var(--color-bg) !important;
}

.forum-thread-card {
  cursor: pointer;
  border-color: var(--color-border) !important;
}

.forum-thread-card:hover {
  border-color: var(--color-primary) !important;
}

.forum-thread-row {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.forum-thread-row:hover {
  border-color: var(--color-primary);
  box-shadow: 0 10px 30px var(--color-primary-light);
}

.status-indicator {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--color-bg);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.status-indicator.solved {
  background: var(--color-success-light);
  color: var(--color-success);
}

.category-tag {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-hot {
  background: var(--color-warning-light);
  color: var(--color-warning);
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.thread-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  transition: color 0.2s;
}

.forum-thread-row:hover .thread-title {
  color: var(--color-primary);
}

.author-thumb {
  border-radius: 50%;
  border: 2px solid var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.stats-group {
  min-width: 120px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .count {
  font-weight: 800;
  color: var(--color-text);
  font-size: 0.9rem;
}

.stat-item .label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.border-start-md {
  border-left: 1px solid var(--color-border);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transition-up {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.transition-up:hover {
  transform: translateY(-5px);
}

.section-title {
  color: var(--color-text);
}

.fw-black { font-weight: 900; }

@media (max-width: 991px) {
  .hero-section { padding-top: 100px; }
  .hero-title { font-size: 3.2rem; }
}
</style>
