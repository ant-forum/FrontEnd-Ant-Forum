<script setup>
import { ref, onMounted } from 'vue';
import navbar from "../../components/layouts/header.vue";
import BaseFooter from "../../components/layouts/footer.vue";

const activeSection = ref('evolution');

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    activeSection.value = id;
  }
};
</script>

<template>
  <div class="blog-detail-layout min-vh-100 d-flex flex-column bg-white">
    <navbar class="bg-white border-bottom" />

    <main class="flex-grow-1 container py-5">
      <div class="row position-relative">
        
        <!-- Sticky Sidebar (Table of Contents) -->
        <aside class="col-lg-3 d-none d-lg-block">
          <div class="sticky-toc p-4 rounded-4 bg-light-purple">
            <h6 class="text-muted fw-bold mb-4 font-xs text-uppercase tracking-wide">Table of Contents</h6>
            <nav class="toc-nav d-flex flex-column gap-3">
              <a href="#evolution" 
                 @click.prevent="scrollTo('evolution')" 
                 :class="['text-decoration-none font-sm toc-link', activeSection === 'evolution' ? 'text-purple fw-bold active' : 'text-muted']">
                The Evolution of Vue State
              </a>
              <a href="#options-vs-composition" 
                 @click.prevent="scrollTo('options-vs-composition')"
                 :class="['text-decoration-none font-sm toc-link', activeSection === 'options-vs-composition' ? 'text-purple fw-bold active' : 'text-muted']">
                Options API vs Composition API
              </a>
              <a href="#enter-pinia" 
                 @click.prevent="scrollTo('enter-pinia')"
                 :class="['text-decoration-none font-sm toc-link', activeSection === 'enter-pinia' ? 'text-purple fw-bold active' : 'text-muted']">
                Enter Pinia
              </a>
              <a href="#key-takeaways" 
                 @click.prevent="scrollTo('key-takeaways')"
                 :class="['text-decoration-none font-sm toc-link', activeSection === 'key-takeaways' ? 'text-purple fw-bold active' : 'text-muted']">
                Key Takeaways
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <article class="col-lg-8 offset-lg-1">
          <!-- Metadata -->
          <div class="mb-4">
            <span class="badge bg-purple-subtle text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3 me-2">VUE.JS</span>
            <span class="badge bg-purple-subtle text-purple px-3 py-2 rounded-pill fw-semibold font-xs mb-3">ARCHITECTURE</span>
          </div>

          <h1 class="display-4 fw-bold text-dark mb-4 article-title">
            Mastering State Management in Vue 3: Beyond the Basics
          </h1>

          <div class="d-flex align-items-center mb-5">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA96xxWrXvoQpLKogis081FV20yF3_cAn54nojVxz-rxfG_DP6qVC4XHvbaFme-NmhsPRY07BDvVUzVOPsu96Dp-Sp88IVNgvqAwKv2AWL63ksuHfPnzZa0sFcrfXkdYaKFeKkGNzXH47pI1Ko7gHknT04_osktGO5MG-d0illH3HtNGMwBF22XZ5TN4fuhUPlUpKaMYZ9AZMWPOBzt8y6SxvOXwHxzTGTj5K4VR0r6jp2GxsocKEcwnUgm7PeF9zJGt3s5WYqgFrw" class="rounded-circle me-3 border" width="48" height="48" alt="Author">
            <div>
              <h6 class="mb-0 fw-bold text-dark">Elena Rodriguez</h6>
              <div class="text-muted font-sm d-flex align-items-center mt-1">
                Oct 26, 2023 &nbsp;&bull;&nbsp; 8 min read
              </div>
            </div>
          </div>

          <!-- Hero Image -->
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzsfO0Uy0oSqfPbYpwmNxuQ05SnXwi8FJutwX2Sg773d1iTzrF2c__8LgV7MhesTylLgVxk1X-RkYmHOqk5hTmArCDph5M26rngNWKAQmRhC7E7izqP4TfcgCF8Wp1ATmlqKrXzG3aru1yOD_Ee1vuEPCC7qY9egtngBiy2rACeypgUs0sv7y1XQI2zEKOcquIsLXxEb2-qidSvDKlu2edpFMin-fOFqrsG3YQEQH620HNsjO47Wxb2ZBuQs3bXw1laV3kcOywFCg" class="img-fluid rounded-4 mb-5 w-100 object-fit-cover" style="max-height: 400px;" alt="Hero Image">

          <!-- Article Body -->
          <div class="article-body text-dark lh-lg">
            <p class="lead mb-4 text-muted">
              State management is often the most challenging aspect of building robust Vue applications. While passing props down and emitting events up works for small components, it quickly becomes unmanageable as your app grows. This is where centralized state management comes into play.
            </p>

            <p class="mb-5">
              In this deep dive, we'll explore the evolution of state management in the Vue ecosystem, comparing the traditional Options API approach with the modern Composition API, and ultimately see why Pinia has become the standard for Vue 3.
            </p>

            <h3 id="evolution" class="fw-bold mb-3">The Evolution of Vue State</h3>
            <p class="mb-4">
              Historically, Vuex was the go-to solution. It provided a single source of truth, mutations, actions, and getters. While powerful, its verbose boilerplate and lack of strong TypeScript support made it cumbersome for modern development.
            </p>

            <h3 id="options-vs-composition" class="fw-bold mb-3 mt-5">Options API vs Composition API</h3>
            <p class="mb-4">
              The Options API naturally separated data, computed properties, and methods. This enforced structure but led to fragmented logic for complex features. The Composition API revolutionized this by allowing logic to be grouped by concern.
            </p>
            <p class="mb-5">
              Interestingly, this shift to the Composition API fundamentally changed how we approach state. Since we can now extract reactive state into standalone composables, many developers started using simple reactive objects as global stores, bypassing Vuex entirely.
            </p>

            <h3 id="enter-pinia" class="fw-bold mb-3">Enter Pinia</h3>
            <p class="mb-4">
              Pinia emerged as the successor to Vuex. It retains the concept of a centralized store but embraces the simplicity and type safety of the Composition API, dropping the need for mutations entirely.
            </p>

            <!-- Code Block -->
            <div class="code-block-wrapper my-5 rounded-4 overflow-hidden shadow-sm">
              <div class="code-header d-flex align-items-center px-4 py-3 bg-dark">
                <span class="dot text-danger">&bull;</span>
                <span class="dot text-warning">&bull;</span>
                <span class="dot text-success">&bull;</span>
                <span class="ms-3 font-sm text-white-50 font-monospace">store/counter.js</span>
              </div>
              <pre class="m-0 p-4 bg-darker text-light font-monospace font-sm overflow-x-auto"><code><span class="text-pink">import</span> { defineStore } <span class="text-pink">from</span> <span class="text-green">'pinia'</span>;
<span class="text-pink">import</span> { ref, computed } <span class="text-pink">from</span> <span class="text-green">'vue'</span>;

<span class="text-pink">export const</span> <span class="text-blue">useCounterStore</span> = defineStore(<span class="text-green">'counter'</span>, () => {
  <span class="text-muted">// State</span>
  <span class="text-blue">const</span> count = ref(<span class="text-warning">0</span>);
  <span class="text-blue">const</span> name = ref(<span class="text-green">'Eduardo'</span>);

  <span class="text-muted">// Getters</span>
  <span class="text-blue">const</span> doubleCount = computed(() => count.value * <span class="text-warning">2</span>);

  <span class="text-muted">// Actions</span>
  <span class="text-blue">function</span> <span class="text-purple">increment</span>() {
    count.value++;
  }
  
  <span class="text-blue">function</span> <span class="text-purple">randomize</span>() {
    count.value = Math.round(Math.random() * <span class="text-warning">100</span>);
  }

  <span class="text-pink">return</span> { count, name, doubleCount, increment, randomize };
});</code></pre>
            </div>

            <p class="mb-5">
              Notice how this looks just like a standard Vue composition function. This makes learning and using Pinia incredibly intuitive for anyone already familiar with Vue 3's core APIs.
            </p>

            <!-- Inline Image -->
            <figure class="my-5 text-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu_Rf69uYa8hP1M0Qx_hpMYmnbw_Nm8e5JkE1-fRHhTDN0lLWPT5WdoEDwnxYVgnNJUJC27Y73upk0OeQOXcirdQua1ILTJh9FrHiQcPgfWF2kFlVtRplg2bDfn_CrIqwNfGx8oLjapldTiEKuZIhdUAjMFz9tpcMMcdHpJaqfXrQkau6B3kz-0KcyfW3M3TuGU2nAalmx92x6mNsQVwMilvxWHSJpqIZGkXZp2oFlVt_DeVtE_6m1GwQ5APQjhhj6d8z1rUzuV_7M" class="img-fluid rounded-4 shadow-sm" alt="Pinia Devtools">
              <figcaption class="mt-3 text-muted font-sm font-italic">Figure 1: Pinia provides excellent Devtools integration out of the box.</figcaption>
            </figure>

            <!-- Key Takeaways -->
            <div id="key-takeaways" class="takeaways-box p-4 rounded-4 my-5 position-relative bg-light-purple">
              <div class="takeaways-icon bg-purple text-white d-flex align-items-center justify-content-center rounded-circle position-absolute">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-lightbulb-fill" viewBox="0 0 16 16">
                  <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <h4 class="fw-bold text-dark mb-3 ps-4 ms-2">Key Takeaways</h4>
              <ul class="mb-0 text-dark ps-5 pe-3 lh-lg">
                <li class="mb-2"><strong>Ditch the Mutations:</strong> Pinia actions combine the responsibilities of Vuex actions and mutations, streamlining your state update logic.</li>
                <li class="mb-2"><strong>Embrace Reactivity:</strong> Use standard `ref` and `computed` within store definitions, allowing for easy extraction from existing components.</li>
                <li><strong>Type Safety:</strong> Pinia is built with TypeScript in mind, providing excellent auto-completion and type inference without complex wrappers.</li>
              </ul>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="newsletter-section mt-5 p-5 rounded-4 text-center position-relative overflow-hidden">
            <div class="newsletter-gradient position-absolute top-0 start-0 w-100 h-100"></div>
            <div class="position-relative z-3">
              <div class="d-flex justify-content-center mb-3">
                <div class="bg-white rounded-3 p-2 shadow-sm text-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope-paper-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="Mm8 3a1 1 0 0 1 1 1v1h-2V4a1 1 0 0 1 1-1zm1 3v2h2v-2h-2zm-3 0v2H4v-2h2z"/>
                    <path d="M4 8.5v4.5A1.5 1.5 0 0 0 5.5 14.5h5a1.5 1.5 0 0 0 1.5-1.5v-4.5h-9z"/>
                    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h9A1.5 1.5 0 0 1 14 5.5v1.884L8 10.3l-6-2.916V5.5zm6 5.86-6-2.915v.85c0 .762.58 1.396 1.328 1.488A1.5 1.5 0 0 0 4.5 12h7a1.5 1.5 0 0 0 1.172-1.217C13.42 10.686 14 10.052 14 9.29v-.85L8 11.36z"/>
                    <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                  </svg>
                </div>
              </div>
              <h3 class="fw-bold mb-3 text-dark">Join the DevEcosystem Weekly</h3>
              <p class="text-muted mb-4 mx-auto" style="max-width: 400px;">
                Get deep-dive tutorials and architecture patterns sent straight to your inbox every Wednesday.
              </p>
              <form class="d-flex justify-content-center mx-auto" style="max-width: 450px;">
                <input type="email" class="form-control form-control-lg rounded-pill-start border-end-0 shadow-sm" placeholder="Enter your email address">
                <button class="btn btn-dark btn-lg rounded-pill-end px-4 shadow-sm" type="button">Subscribe</button>
              </form>
            </div>
          </div>

          <hr class="my-5 border-light">

          <!-- Related Publications -->
          <div>
            <h5 class="fw-bold mb-4 text-dark text-uppercase tracking-wide font-sm">Related Publications</h5>
            <div class="row g-4">
              <div class="col-md-6">
                <router-link to="/blog/2" class="text-decoration-none">
                  <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden related-card bg-white">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB2sdCEKnAG-jYy3YmOU73Fq4gq-1chXqB2y_e2cLyj5-UnCQEl7nsC79vtaQAVoq84zsNfB8Hiln0ea736Wm5QtMilvYWwbnkp3oXZWjtn-7tlO-MI2sqBQXqoyst1iby1ZJZasMsyRNj19nwD1dE_4HpFsUNjgDJQx9zXkP_yUck03_ixdbEPA5v7BGSyU7-YCtyUbM0LixImwF2sXxtNqA2hjc84nmFSSpB_jGGFMPHBG6GOmRWRUqGcPVg9FGCIO5_s0ROoP8" class="card-img-top object-fit-cover" height="140" alt="Related post">
                    <div class="card-body p-3">
                      <div class="text-purple fw-semibold font-xs mb-1">ARCHITECTURE</div>
                      <h6 class="fw-bold text-dark mb-1 lh-base">Scaling Frontend Architecture for Enterprise Applications</h6>
                      <div class="text-muted font-xs">12 min read</div>
                    </div>
                  </div>
                </router-link>
              </div>
              <div class="col-md-6">
                <router-link to="/blog/3" class="text-decoration-none">
                  <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden related-card bg-white">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuArlYEHQrTu4obaqv3ymp3jjXYE6wEApFKkGDTrcAYFfgWabzMxSzoW0SQ3IBRhlCmiUT5nbLyKT3YUjWmrYfAlfmLGNt1g-9Fog1rqEM-M76IBeDES4AlZlSoK8VWKNAL8TDyc4y1fqeYB7pIY77xpjvu37IqhVyBDXdQI0k6RlYWCHFyGgRYzHevS2T57TcMSCCnu0nQ0B0ZB9unbJRfl5LQs7UQ3d8P9i0v6_WwbP46RdPUTz6H5JudN847OuvBy7zQURXS627g" class="card-img-top object-fit-cover" height="140" alt="Related post">
                    <div class="card-body p-3">
                      <div class="text-purple fw-semibold font-xs mb-1">CONCEPTS</div>
                      <h6 class="fw-bold text-dark mb-1 lh-base">Advanced Generics: Building Reusable State Composables</h6>
                      <div class="text-muted font-xs">10 min read</div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped>
/* Typography & Colors */
.text-purple { color: #9333ea; }
.bg-purple { background-color: #9333ea; }
.bg-purple-subtle { background-color: #f3e8ff; }
.bg-light-purple { background-color: #faf5ff; }
.bg-darker { background-color: #111827; }
.text-pink { color: #ec4899; }
.text-green { color: #10b981; }
.text-blue { color: #60a5fa; }
.text-warning { color: #fbbf24; }
.font-xs { font-size: 0.75rem; }
.font-sm { font-size: 0.875rem; }
.tracking-wide { letter-spacing: 0.05em; }
.lh-lg { line-height: 1.8; }

.blog-detail-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Typography Overrides */
.article-title {
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.article-body h3 {
  letter-spacing: -0.01em;
  color: #1f2937;
}

.article-body p {
  color: #4b5563;
  font-size: 1.05rem;
}

/* Sticky TOC */
.sticky-toc {
  position: sticky;
  top: 100px;
}

.toc-nav {
  border-left: 2px solid #e5e7eb;
  padding-left: 1rem;
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
  background-color: #9333ea;
  transition: height 0.2s ease;
  border-radius: 4px;
}

.toc-link.active::before {
  height: 100%;
}

.toc-link:hover {
  color: #9333ea !important;
}

/* Code Block */
.code-block-wrapper {
  border: 1px solid rgba(0,0,0,0.1);
}

.code-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.dot {
  font-size: 24px;
  line-height: 10px;
  margin-right: 4px;
}

/* Takeaways */
.takeaways-box {
  border-left: 4px solid #9333ea;
}

.takeaways-icon {
  width: 32px;
  height: 32px;
  top: -16px;
  left: 32px;
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
}

/* Newsletter */
.newsletter-section {
  border: 1px solid #f3e8ff;
}

.newsletter-gradient {
  background: linear-gradient(135deg, rgba(243,232,255,1) 0%, rgba(255,255,255,1) 100%);
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
  border: 1px solid #f3f4f6 !important;
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.05) !important;
}
</style>
