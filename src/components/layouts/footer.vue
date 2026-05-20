<script setup>
const year = new Date().getFullYear();

const communityLinks = [
  { name: "Project Showcase", path: "/showcase" },
  { name: "Discussion Forum", path: "/forum" },
  { name: "Developer Blog", path: "/blog" },
];

const resourceLinks = [
  { name: "FAQs", path: "#" },
  { name: "About ANT", path: "#" },
  { name: "Terms of Service", path: "#" },
];

import logo from "../../assets/ANT-Forum.png";
</script>

<template>
  <footer class="ant-footer mt-auto position-relative overflow-hidden">
    <!-- Decorative Wave Top -->
    <div class="footer-wave">
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path 
          fill="#4A0E4E" 
          fill-opacity="1" 
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      
      <!-- Silhouettes (Developer Themed) -->
      <div class="silhouette-container">
        <div class="silhouette-item item-1">
          <i class="bi bi-code-slash"></i>
        </div>
        <div class="silhouette-item tree-1"></div>
        <div class="silhouette-item item-2">
          <i class="bi bi-terminal-fill"></i>
        </div>
        <div class="silhouette-item ferris-wheel">
          <i class="bi bi-gear-wide-connected"></i>
        </div>
        <div class="silhouette-item balloon">
          <i class="bi bi-chat-heart-fill"></i>
        </div>
        <div class="silhouette-item tree-2"></div>
        <div class="silhouette-item item-3">
          <i class="bi bi-cpu-fill"></i>
        </div>
      </div>
    </div>

    <div class="footer-content pt-5 pb-4">
      <div class="container">
        <div class="row g-5">
          <!-- Newsletter Section -->
          <div class="col-12 col-lg-3">
            <h6 class="text-white fw-bold mb-4">Stay Updated</h6>
            <p class="text-white-50 small mb-3">Get the latest project updates and community highlights.</p>
            <div class="newsletter-form">
              <input type="email" class="form-control mb-3" placeholder="Enter your email">
              <button class="btn btn-subscribe w-100 fw-bold">SUBSCRIBE</button>
            </div>
          </div>

          <!-- Community Links -->
          <div class="col-6 col-lg-3">
            <h6 class="text-white fw-bold mb-4">Community</h6>
            <ul class="list-unstyled">
              <li v-for="link in communityLinks" :key="link.name" class="mb-2">
                <router-link :to="link.path" class="footer-link">{{ link.name }}</router-link>
              </li>
            </ul>
            <div class="social-links mt-4">
              <a href="#" class="text-white me-3"><i class="bi bi-github fs-5"></i></a>
              <a href="#" class="text-white me-3"><i class="bi bi-discord fs-5"></i></a>
              <a href="#" class="text-white"><i class="bi bi-twitter-x fs-5"></i></a>
            </div>
          </div>

          <!-- Resources -->
          <div class="col-6 col-lg-3">
            <h6 class="text-white fw-bold mb-4">Resources</h6>
            <ul class="list-unstyled">
              <li v-for="link in resourceLinks" :key="link.name" class="mb-2">
                <a :href="link.path" class="footer-link">{{ link.name }}</a>
              </li>
            </ul>
          </div>

          <!-- Branding & Contact -->
          <div class="col-12 col-lg-3">
            <div class="d-flex align-items-center mb-4">
              <img :src="logo" width="32" height="28" class="me-2 rounded bg-white p-1" />
              <h6 class="text-white fw-bold mb-0">ANT Forum</h6>
            </div>
            <div class="contact-details text-white small">
              <p class="mb-2 text-white-50">
                A modern platform for developers to showcase projects and share knowledge.
              </p>
              <div class="d-flex align-items-center">
                <i class="bi bi-envelope-fill me-2 text-white-50"></i>
                <span>support@antforum.io</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="footer-bottom mt-5 pt-4 border-top border-secondary text-center">
          <div class="legal-text text-white-50 small">
            <p class="mb-0">© {{ year }} ANT Forum. Built for the developer community.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ant-footer {
  background-color: #4A0E4E;
  color: rgb(185, 2, 2);
}

.footer-wave {
  position: relative;
  height: 120px;
  /* background-color: transparent; */
  background-color: #f5f3ff;
}

.footer-wave svg {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.silhouette-container {
  position: absolute;
  bottom: 5px;
  width: 100%;
  height: 80px;
  z-index: 1;
  pointer-events: none;
}

.silhouette-item {
  position: absolute;
  color: #4A0E4E;
  opacity: 0.8;
}

.item-1 { left: 8%; bottom: 35px; font-size: 2rem; transform: rotate(-10deg); }
.tree-1 { left: 18%; bottom: 20px; width: 18px; height: 35px; background: currentColor; border-radius: 50% 50% 0 0; }
.item-2 { left: 30%; bottom: 40px; font-size: 1.8rem; }
.ferris-wheel { left: 48%; bottom: 25px; font-size: 2.8rem; animation: spin 25s linear infinite; }
.balloon { left: 65%; bottom: 70px; font-size: 1.8rem; }
.tree-2 { left: 80%; bottom: 20px; width: 12px; height: 30px; background: currentColor; border-radius: 50%; }
.item-3 { right: 10%; bottom: 40px; font-size: 2rem; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.footer-content {
  position: relative;
  z-index: 2;
}

.newsletter-form .form-control {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
}

.newsletter-form .form-control:focus {
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.newsletter-form .form-control::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.btn-subscribe {
  background: linear-gradient(90deg, #8B5CF6 0%, #D946EF 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  transition: transform 0.2s ease;
}

.btn-subscribe:hover {
  transform: translateY(-2px);
  color: white;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: white;
  padding-left: 4px;
}

.border-secondary {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

@media (max-width: 991.98px) {
  .footer-wave { height: 80px; }
  .silhouette-container { height: 60px; }
  .ferris-wheel { font-size: 2rem; }
  .item-1, .item-3 { font-size: 1.5rem; }
}
</style>
