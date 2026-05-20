<script setup>
import { ref } from 'vue';
import Navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";

const recentPosts = ref([
  {
    id: 1,
    category: "DEVOPS",
    date: "Oct 18",
    title: "Zero-Downtime Migrations in Kubernetes",
    description: "Strategies for managing stateful applications during cluster upgrades, focusing on pod...",
    author: "Sarah Jenkins",
    readTime: "8 min",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCB2sdCEKnAG-jYy3YmOU73Fq4gq-1chXqB2y_e2cLyj5-UnCQEl7nsC79vtaQAVoq84zsNfB8Hiln0ea736Wm5QtMilvYWwbnkp3oXZWjtn-7tlO-MI2sqBQXqoyst1iby1ZJZasMsyRNj19nwD1dE_4HpFsUNjgDJQx9zXkP_yUck03_ixdbEPA5v7BGSyU7-YCtyUbM0LixImwF2sXxtNqA2hjc84nmFSSpB_jGGFMPHBG6GOmRWRUqGcPVg9FGCIO5_s0ROoP8"
  },
  {
    id: 2,
    category: "FRONTEND",
    date: "Oct 12",
    title: "React Context vs. Signals: A Performance Benchmark",
    description: "An empirical study comparing render cycles and memory footprint when scaling global state across",
    author: "David Park",
    readTime: "6 min",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu_Rf69uYa8hP1M0Qx_hpMYmnbw_Nm8e5JkE1-fRHhTDN0lLWPT5WdoEDwnxYVgnNJUJC27Y73upk0OeQOXcirdQua1ILTJh9FrHiQcPgfWF2kFlVtRplg2bDfn_CrIqwNfGx8oLjapldTiEKuZIhdUAjMFz9tpcMMcdHpJaqfXrQkau6B3kz-0KcyfW3M3TuGU2nAalmx92x6mNsQVwMilvxWHSJpqIZGkXZp2oFlVt_DeVtE_6m1GwQ5APQjhhj6d8z1rUzuV_7M"
  },
  {
    id: 3,
    category: "SYSTEMS",
    date: "Oct 05",
    title: "Designing Idempotent APIs",
    description: "Why idempotency keys are critical for distributed systems reliability, preventing duplicate... transactions during network failures.",
    author: "Elena Rodriguez",
    readTime: "9 min",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArlYEHQrTu4obaqv3ymp3jjXYE6wEApFKkGDTrcAYFfgWabzMxSzoW0SQ3IBRhlCmiUT5nbLyKT3YUjWmrYfAlfmLGNt1g-9Fog1rqEM-M76IBeDES4AlZlSoK8VWKNAL8TDyc4y1fqeYB7pIY77xpjvu37IqhVyBDXdQI0k6RlYWCHFyGgRYzHevS2T57TcMSCCnu0nQ0B0ZB9unbJRfl5LQs7UQ3d8P9i0v6_WwbP46RdPUTz6H5JudN847OuvBy7zQURXS627g"
  }
]);
</script>

<template>
  <div class="blog-layout min-vh-100 d-flex flex-column">
    <Navbar class="bg-white" />

    <main class="flex-grow-1 bg-light-purple">
      <!-- Hero Section -->
      <section class="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden">
        <div class="hero-gradient position-absolute top-0 start-0 w-100 h-100"></div>
        
        <div class="container position-relative z-3 py-5 my-5 text-center">
          
          <!-- Floating elements -->
          <div class="floating-card code-card shadow-lg d-none d-lg-block">
            <div class="code-header d-flex align-items-center px-3 py-2">
              <span class="dot text-danger">&bull;</span>
              <span class="dot text-warning">&bull;</span>
              <span class="dot text-success">&bull;</span>
              <span class="ms-2 small text-muted">build.ts</span>
            </div>
            <div class="code-body p-3 text-start font-monospace small">
              <span class="text-pink">import</span> { optimize }<br>
              <span class="text-pink">from</span> <span class="text-green">'core'</span>;<br>
              <span class="text-blue">const</span> tree =<br>
              optimize(ast);
            </div>
          </div>

          <div class="floating-card deploy-card shadow-sm d-flex align-items-center px-3 py-2 rounded-pill bg-white d-none d-lg-flex">
            <span class="badge bg-warning rounded-circle p-1 me-2"><i class="bi bi-rocket-fill text-dark"></i></span>
            <span class="small fw-semibold text-dark">Deploying v2.4.0</span>
          </div>

          <!-- Main Hero Content -->
          <div class="mx-auto hero-content" style="max-width: 800px;">
            <div class="badge rounded-pill bg-purple-subtle text-purple mb-4 px-3 py-2 fw-semibold">
              <span class="me-1">&bull;</span> LATEST INSIGHTS
            </div>
            
            <h1 class="display-3 fw-bold mb-4 hero-title text-dark">
              Engineering clarity in a<br>
              <span class="text-purple">complex ecosystem</span>
            </h1>

            <p class="lead mb-5 text-muted px-4">
              Deep dives into systems architecture, frontend performance, and the
              operational patterns that scale modern applications.
            </p>

            <div class="d-flex flex-column flex-md-row justify-content-center gap-3 align-items-center">
              <button class="btn btn-dark btn-lg px-4 py-3 rounded-pill fw-semibold d-flex align-items-center font-sm">
                READ FEATURED
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right ms-2" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                </svg>
              </button>
              
              <div class="search-input-wrapper position-relative">
                <input type="text" class="form-control form-control-lg rounded-pill ps-4 pe-5 shadow-sm border-0" placeholder="Search topics...">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Article -->
      <section class="container py-5">
        <router-link to="/blog/1" class="text-decoration-none d-block">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden featured-card bg-white">
          <div class="row g-0">
            <div class="col-lg-6 position-relative">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzsfO0Uy0oSqfPbYpwmNxuQ05SnXwi8FJutwX2Sg773d1iTzrF2c__8LgV7MhesTylLgVxk1X-RkYmHOqk5hTmArCDph5M26rngNWKAQmRhC7E7izqP4TfcgCF8Wp1ATmlqKrXzG3aru1yOD_Ee1vuEPCC7qY9egtngBiy2rACeypgUs0sv7y1XQI2zEKOcquIsLXxEb2-qidSvDKlu2edpFMin-fOFqrsG3YQEQH620HNsjO47Wxb2ZBuQs3bXw1laV3kcOywFCg" class="img-fluid w-100 h-100 object-fit-cover" alt="Featured Article">
              <span class="badge bg-white text-dark position-absolute top-0 start-0 m-4 px-3 py-2 rounded-pill fw-semibold shadow-sm font-xs">ARCHITECTURE</span>
            </div>
            <div class="col-lg-6 d-flex align-items-center">
              <div class="card-body p-5">
                <div class="text-muted small mb-3 d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-calendar3 me-2" viewBox="0 0 16 16"><path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/><path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                  Oct 24, 2023 &nbsp;&bull;&nbsp; 
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-clock me-1" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
                  12 min read
                </div>
                <h2 class="display-6 fw-bold mb-3 text-dark">Deconstructing Micro-frontends at Enterprise Scale</h2>
                <p class="text-muted mb-4 lead font-sm">
                  An architectural deep dive into orchestrating independent deployment strategies, managing shared dependencies via Module Federation, and ensuring...
                </p>
                <div class="d-flex align-items-center">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96xxWrXvoQpLKogis081FV20yF3_cAn54nojVxz-rxfG_DP6qVC4XHvbaFme-NmhsPRY07BDvVUzVOPsu96Dp-Sp88IVNgvqAwKv2AWL63ksuHfPnzZa0sFcrfXkdYaKFeKkGNzXH47pI1Ko7gHknT04_osktGO5MG-d0illH3HtNGMwBF22XZ5TN4fuhUPlUpKaMYZ9AZMWPOBzt8y6SxvOXwHxzTGTj5K4VR0r6jp2GxsocKEcwnUgm7PeF9zJGt3s5WYqgFrw" class="rounded-circle me-3" width="48" height="48" alt="Marcus Lin">
                  <div>
                    <h6 class="mb-0 fw-bold text-dark">Marcus Lin</h6>
                    <small class="text-muted">Principal Staff Engineer</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </router-link>
      </section>

      <!-- Recent Publications -->
      <section class="container py-5 mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold m-0 text-dark">Recent Publications</h3>
          <a href="#" class="text-purple fw-semibold text-decoration-none font-sm">VIEW ALL ARCHIVE &rarr;</a>
        </div>

        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div v-for="post in recentPosts" :key="post.id" class="col">
            <router-link :to="`/blog/${post.id}`" class="text-decoration-none h-100 d-block text-dark">
              <article class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white post-card">
              <div class="post-img-wrapper overflow-hidden">
                <img :src="post.image" class="card-img-top w-100 h-100 object-fit-cover" :alt="post.title">
              </div>
              <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex align-items-center mb-3">
                  <span class="badge bg-purple-subtle text-purple fw-semibold font-xs me-2">{{ post.category }}</span>
                  <span class="text-muted font-xs">{{ post.date }}</span>
                </div>
                <h5 class="card-title fw-bold text-dark mb-2">{{ post.title }}</h5>
                <p class="card-text text-muted font-sm flex-grow-1">
                  {{ post.description }}
                </p>
                <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                  <span class="fw-semibold text-dark font-sm">{{ post.author }}</span>
                  <span class="text-muted font-xs d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clock me-1" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>
                    {{ post.readTime }}
                  </span>
                </div>
              </div>
              </article>
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Typography & Colors */
.text-purple { color: #9333ea; }
.bg-purple-subtle { background-color: #f3e8ff; }
.bg-light-purple { background-color: #faf5ff; }
.text-pink { color: #ec4899; }
.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }
.font-xs { font-size: 0.75rem; }
.font-sm { font-size: 0.875rem; }

.blog-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Hero Section */
.hero-gradient {
  background: linear-gradient(135deg, rgba(243,232,255,1) 0%, rgba(255,255,255,1) 50%, rgba(243,232,255,0.5) 100%);
  z-index: 1;
}

.hero-title {
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* Floating Elements */
.floating-card {
  position: absolute;
  z-index: 4;
  animation: float 6s ease-in-out infinite;
}

.code-card {
  background: #1e1e2e;
  border-radius: 12px;
  width: 260px;
  top: 20%;
  left: 10%;
  transform: rotate(-5deg);
  border: 1px solid rgba(255,255,255,0.1);
}

.code-header {
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.dot {
  font-size: 24px;
  line-height: 10px;
  margin-right: 4px;
}

.deploy-card {
  bottom: 25%;
  right: 15%;
  animation-delay: -3s;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(-5deg); }
  50% { transform: translateY(-15px) rotate(-3deg); }
  100% { transform: translateY(0px) rotate(-5deg); }
}

.deploy-card {
  animation: float-right 5s ease-in-out infinite;
}

@keyframes float-right {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Inputs & Buttons */
.search-input-wrapper {
  width: 250px;
}

.search-input-wrapper input {
  font-size: 0.9rem;
}

.btn-dark {
  background-color: #111827;
  border-color: #111827;
  transition: all 0.2s ease;
}

.btn-dark:hover {
  background-color: #1f2937;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.2);
}

/* Cards */
.featured-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.featured-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
}

.post-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
}

.post-img-wrapper {
  height: 200px;
}

.post-img-wrapper img {
  transition: transform 0.5s ease;
}

.post-card:hover .post-img-wrapper img {
  transform: scale(1.05);
}
</style>
