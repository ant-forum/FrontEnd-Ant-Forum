<script setup>
const year = new Date().getFullYear();

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Forum", path: "/forum" },
  { name: "Blog", path: "/blog" },
  { name: "Dashboard", path: "/dashboard" },
];

import logo from "../../assets/ANT-Forum.png";
</script>

<template>
  <footer class="bg-white border-top mt-auto pt-5">
    <!-- Top Section -->
    <div class="container">
      <div class="row g-4">
        <!-- Branding -->
        <div class="col-12 col-md-4">
          <router-link
            to="/"
            class="navbar-brand d-flex align-items-center mb-2"
          >
            <img :src="logo" width="40" height="34" class="me-2 rounded" />
            <span class="fw-bold text-primary">ANT-Forum</span>
          </router-link>

          <p class="text-muted small mb-2">
            A modern community platform for developers.
          </p>

          <!-- Social Icons -->
          <div class="mt-2">
            <i class="bi bi-github me-2"></i>
            <i class="bi bi-facebook me-2"></i>
            <i class="bi bi-telegram"></i>
          </div>
        </div>

        <!-- Links -->
        <div class="col-6 col-md-4">
          <h6 class="fw-semibold mb-3">Quick Links</h6>
          <ul class="list-unstyled">
            <li v-for="link in footerLinks" :key="link.path">
              <router-link
                :to="link.path"
                class="text-decoration-none text-dark d-block py-1 footer-link"
              >
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- About -->
        <div class="col-6 col-md-4">
          <h6 class="fw-semibold mb-3">About</h6>
          <p class="text-muted small mb-0">
            Built with Vue 3, Pinia, Bootstrap and modern UI practices.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="text-center text-muted border-top mt-4 py-3 small">
      © {{ year }} ANT-Forum. All rights reserved.
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  border-radius: var(--radius-sm);
  transition:
    color var(--transition-base),
    transform var(--transition-fast),
    box-shadow var(--transition-base);
}

@media (hover: hover) {
  .footer-link:hover {
    color: var(--bs-primary) !important;
    transform: translateX(4px);
  }
}

.footer-link:focus-visible {
  outline: none;
  color: var(--bs-primary) !important;
  box-shadow: var(--focus-ring);
}
</style>
