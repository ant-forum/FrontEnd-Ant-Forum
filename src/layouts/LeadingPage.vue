<script setup>
import { ref, onMounted } from "vue";
import Navbar from "../components/layouts/header.vue";
import BaseFooter from "../components/layouts/footer.vue";
import SkeletonLoader from "../components/SkeletonLoader.vue";
import EmptyState from "../components/EmptyState.vue";

const isLoading = ref(true);
const recentPosts = ref([]);

onMounted(() => {
  // Simulate API fetch
  setTimeout(() => {
    recentPosts.value = [
      {
        category: "DEVOPS",
        title: "Zero-Downtime Migrations in Kubernetes",
        description:
          "Strategies for managing stateful applications during cluster upgrades, focusing on pod disruption budgets.",
        author: "Sarah Jenkins",
        readTime: "8 min",
        date: "Oct 18",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCB2sdCEKnAG-jYy3YmOU73Fq4gq-1chXqB2y_e2cLyj5-UnCQEl7nsC79vtaQAVoq84zsNfB8Hiln0ea736Wm5QtMilvYWwbnkp3oXZWjtn-7tlO-MI2sqBQXqoyst1iby1ZJZasMsyRNj19nwD1dE_4HpFsUNjgDJQx9zXkP_yUck03_ixdbEPA5v7BGSyU7-YCtyUbM0LixImwF2sXxtNqA2hjc84nmFSSpB_jGGFMPHBG6GOmRWRUqGcPVg9FGCIO5_s0ROoP8",
      },
      {
        category: "FRONTEND",
        title: "React Context vs. Signals: A Performance Benchmark",
        description:
          "An empirical study comparing render cycles and memory footprint when scaling global state.",
        author: "David Park",
        readTime: "6 min",
        date: "Oct 12",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDu_Rf69uYa8hP1M0Qx_hpMYmnbw_Nm8e5JkE1-fRHhTDN0lLWPT5WdoEDwnxYVgnNJUJC27Y73upk0OeQOXcirdQua1ILTJh9FrHiQcPgfWF2kFlVtRplg2bDfn_CrIqwNfGx8oLjapldTiEKuZIhdUAjMFz9tpcMMcdHpJaqfXrQkau6B3kz-0KcyfW3M3TuGU2nAalmx92x6mNsQVwMilvxWHSJpqIZGkXZp2oFlVt_DeVtE_6m1GwQ5APQjhhj6d8z1rUzuV_7M",
      },
      {
        category: "SYSTEMS",
        title: "Designing Idempotent APIs",
        description:
          "Why idempotency keys are critical for distributed systems reliability, preventing duplicate transactions.",
        author: "Elena Rodriguez",
        readTime: "9 min",
        date: "Oct 05",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuArlYEHQrTu4obaqv3ymp3jjXYE6wEApFKkGDTrcAYFfgWabzMxSzoW0SQ3IBRhlCmiUT5nbLyKT3YUjWmrYfAlfmLGNt1g-9Fog1rqEM-M76IBeDES4AlZlSoK8VWKNAL8TDyc4y1fqeYB7pIY77xpjvu37IqhVyBDXdQI0k6RlYWCHFyGgRYzHevS2T57TcMSCCnu0nQ0B0ZB9unbJRfl5LQs7UQ3d8P9i0v6_WwbP46RdPUTz6H5JudN847OuvBy7zQURXS627g",
      },
    ];
    isLoading.value = false;
  }, 1500);
});
</script>

<template>
  <div class="main-layout d-flex flex-column min-vh-100">
    <Navbar />

    <main class="flex-grow-1">
      <section
        class="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden"
      >
        <div class="position-absolute top-0 start-0 w-100 h-100 dark-bg"></div>
        <div class="position-absolute glow-spot glow-blue"></div>
        <div class="position-absolute glow-spot glow-pink"></div>

        <div class="container position-relative z-3 py-5">
          <div class="text-center">
            <h1
              class="display-1 fw-black mb-4 tracking-tight hero-title text-uppercase hero-text-color"
            >
              Engineering <span class="text-glow-pink">Clarity</span> in a
              <br />
              <span class="text-glow-blue">Complex Ecosystem</span>
            </h1>

            <p class="lead mx-auto mb-5 opacity-75 hero-text-color" style="max-width: 800px">
              Deep dives into systems architecture, frontend performance, and
              the operational patterns that scale modern applications.
            </p>

            <div
              class="d-flex justify-content-center gap-4 mb-5 align-items-center hero-text-color"
            >
              <div class="text-start">
                <div
                  class="badge rounded-pill border border-secondary text-uppercase mb-2"
                  style="font-size: 10px"
                >
                  Latest Insights
                </div>
                <div class="h2 fw-bold text-glow-blue mb-0">
                  48.3<small class="fs-6 ms-1">ms</small>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="h2 fw-bold px-2">12</div>
              <div class="h2 fw-bold px-2 opacity-50">10</div>
              <div class="h2 fw-bold px-2 text-danger">8</div>
            </div>

            <div
              class="d-flex flex-column flex-md-row justify-content-center gap-4 align-items-center"
            >
              <button
                class="btn btn-outline-info btn-glow px-4 py-3 text-uppercase fw-bold rounded-pill d-flex align-items-center"
              >
                Read Featured
                <span class="material-symbols-outlined ms-2"
                  >arrow_forward</span
                >
              </button>

              <div class="position-relative search-wrapper">
                <span
                  class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ms-3 text-info search-icon"
                >
                </span>
                <input
                  type="text"
                  class="form-control form-control-lg modern-input ps-5 pe-4 rounded-pill"
                  placeholder="SEARCH TOPICS..."
                />
                <span class="fake-cursor"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="container py-5">
        <div
          class="card border-0 glass-panel shadow-lg rounded-5 overflow-hidden p-4 mt-n5 position-relative z-4"
        >
          <div class="row g-4 align-items-center">
            <div class="col-lg-7">
              <div
                class="featured-media position-relative rounded-4 overflow-hidden"
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzsfO0Uy0oSqfPbYpwmNxuQ05SnXwi8FJutwX2Sg773d1iTzrF2c__8LgV7MhesTylLgVxk1X-RkYmHOqk5hTmArCDph5M26rngNWKAQmRhC7E7izqP4TfcgCF8Wp1ATmlqKrXzG3aru1yOD_Ee1vuEPCC7qY9egtngBiy2rACeypgUs0sv7y1XQI2zEKOcquIsLXxEb2-qidSvDKlu2edpFMin-fOFqrsG3YQEQH620HNsjO47Wxb2ZBuQs3bXw1laV3kcOywFCg"
                  class="img-fluid w-100 h-100 object-fit-cover hover-zoom"
                />
                <span
                  class="badge bg-dark border border-info text-info position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold"
                  >ARCHITECTURE</span
                >
              </div>
            </div>
            <div class="col-lg-5">
              <div class="p-lg-3">
                <div class="small text-muted mb-2">
                  OCT 24, 2023 • 12 MIN READ
                </div>
                <h2 class="display-6 fw-bold mb-3">
                  Deconstructing Micro-frontends
                </h2>
                <p class="text-muted mb-4">
                  An architectural deep dive into orchestrating independent
                  deployment strategies and managing shared dependencies.
                </p>
                <div class="d-flex align-items-center gap-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96xxWrXvoQpLKogis081FV20yF3_cAn54nojVxz-rxfG_DP6qVC4XHvbaFme-NmhsPRY07BDvVUzVOPsu96Dp-Sp88IVNgvqAwKv2AWL63ksuHfPnzZa0sFcrfXkdYaKFeKkGNzXH47pI1Ko7gHknT04_osktGO5MG-d0illH3HtNGMwBF22XZ5TN4fuhUPlUpKaMYZ9AZMWPOBzt8y6SxvOXwHxzTGTj5K4VR0r6jp2GxsocKEcwnUgm7PeF9zJGt3s5WYqgFrw"
                    class="rounded-circle border"
                    width="45"
                    height="45"
                  />
                  <div class="small fw-bold">
                    Marcus Lin <br /><span class="text-muted fw-normal"
                      >Principal Engineer</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="container pb-5 mt-4">
        <h3 class="fw-bold mb-4 border-bottom pb-2">Recent Publications</h3>
        <div v-if="isLoading" class="row row-cols-1 row-cols-md-3 g-4">
          <div v-for="i in 3" :key="i" class="col">
            <div class="card h-100 border-0 shadow-sm p-3">
              <SkeletonLoader variant="image" height="150px" class="mb-3" />
              <SkeletonLoader width="60%" height="20px" class="mb-2" />
              <SkeletonLoader height="15px" class="mb-2" />
              <SkeletonLoader height="15px" class="mb-2" />
              <SkeletonLoader width="80%" height="15px" class="mb-3" />
              <div class="d-flex justify-content-between mt-auto">
                <SkeletonLoader width="30%" height="12px" />
                <SkeletonLoader width="20%" height="12px" />
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="recentPosts.length === 0" class="py-4">
          <EmptyState
            title="No Publications Found"
            description="We haven't published any articles yet. Check back soon!"
          />
        </div>

        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
          <div v-for="post in recentPosts" :key="post.title" class="col">
            <article
              class="card h-100 border-0 glass-panel shadow-sm hover-up rounded-4 overflow-hidden"
              tabindex="0"
            >
              <div class="post-media">
                <img
                  :src="post.image"
                  class="card-img-top h-100 w-100 object-fit-cover"
                />
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <span
                  class="badge bg-primary-subtle text-primary fw-bold mb-2 align-self-start"
                  >{{ post.category }}</span
                >
                <h5 class="card-title fw-bold">{{ post.title }}</h5>
                <p class="card-text text-muted small flex-grow-1">
                  {{ post.description }}
                </p>
                <div
                  class="d-flex justify-content-between pt-3 border-top mt-3 small text-muted"
                >
                  <span>{{ post.author }}</span>
                  <span>{{ post.readTime }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* THEME CORE */
.hero-section {
  min-height: 75vh;
  background: var(--hero-bg-2);
  position: relative;
  transition: background-color var(--transition-slow);
}
.dark-bg {
  background: radial-gradient(circle at center, var(--hero-bg-1) 0%, var(--hero-bg-2) 100%);
  transition: background var(--transition-slow);
}
.hero-text-color {
  color: var(--hero-text);
}
.fw-black {
  font-weight: 900;
}
.tracking-tight {
  letter-spacing: 0;
}
.hero-title {
  line-height: 1.05;
}

/* SEARCH INPUT MODERN FIXES */
.search-wrapper {
  min-width: 340px;
  max-width: 100%;
}

/* Force Material Icon Rendering */
.search-icon {
  font-family: "Material Symbols Outlined" !important;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  pointer-events: none; /* Prevents icon from blocking input clicks */
}

.modern-input {
  background: var(--color-input-bg) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text) !important;
  font-size: 0.9rem;
  letter-spacing: 0;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.modern-input:focus {
  background: var(--color-surface) !important;
  border-color: var(--color-primary) !important;
  box-shadow: var(--focus-ring) !important;
}

.modern-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Fixed Typing Cursor */
.fake-cursor {
  position: absolute;
  left: 202px; /* Adjusted to sit exactly after placeholder text */
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 1.2rem;
  background: var(--color-info);
  box-shadow: 0 0 8px var(--color-info-light);
  animation: blink 1s infinite;
  pointer-events: none;
}

/* Hide fake cursor when typing or focused */
.modern-input:focus + .fake-cursor,
.modern-input:not(:placeholder-shown) + .fake-cursor {
  display: none;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

/* GLOW EFFECTS */
.text-glow-pink {
  color: var(--color-purple);
  text-shadow: 0 0 15px var(--color-purple-light);
}
.text-glow-blue {
  color: var(--color-info);
  text-shadow: 0 0 15px var(--color-info-light);
}

.glow-spot {
  width: 40vw;
  height: 40vw;
  filter: blur(120px);
  border-radius: 50%;
  opacity: 0.15;
  position: absolute;
  z-index: 1;
}
.glow-blue {
  background: var(--color-info);
  top: -10%;
  left: -10%;
}
.glow-pink {
  background: var(--color-purple);
  bottom: -10%;
  right: -10%;
}

.btn-glow {
  border: 1px solid var(--color-info);
  color: var(--color-info);
  transition:
    background-color var(--transition-base),
    color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
}
.btn-glow:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px var(--color-info-light),
    0 0 20px var(--color-info);
}

@media (hover: hover) {
  .btn-glow:hover {
    background: var(--color-info);
    color: var(--color-bg) !important;
    box-shadow: 0 0 20px var(--color-info);
    transform: translateY(-1px);
  }
}

/* LAYOUT UTILS */
.metric-divider {
  width: 1px;
  height: 35px;
  background: var(--color-glass-border);
}
.glass-panel {
  background: var(--color-glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-glass-border) !important;
  transition: background var(--transition-base), border-color var(--transition-base);
}
.border-bottom {
  border-bottom-color: var(--color-border) !important;
}
.mt-n5 {
  margin-top: -60px !important;
}
.featured-media {
  height: 400px;
}
.post-media {
  height: 200px;
  overflow: hidden;
}
.hover-up {
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
}
.hover-up:focus-visible {
  outline: none;
  box-shadow: var(--shadow-md), var(--focus-ring);
}

@media (hover: hover) {
  .hover-up:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md) !important;
  }
  .hover-zoom {
    transition: transform var(--transition-slow);
  }
  .hover-up:hover .hover-zoom,
  .hover-up:hover img {
    transform: scale(1.03);
  }
}

@media (max-width: 576px) {
  .hero-section {
    min-height: 68vh;
  }
  .hero-title {
    font-size: 2.6rem;
  }
  .search-wrapper {
    min-width: 100%;
  }
  .featured-media {
    height: 260px;
  }
}
</style>
