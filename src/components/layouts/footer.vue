<script setup>
const year = new Date().getFullYear()

const footerLinks = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Forum', path: '/forum' },
  { name: 'Blog', path: '/blog' },
  { name: 'Dashboard', path: '/dashboard' }
]
</script>

<template>
  <footer class="bg-white border-top mt-auto pt-5">
    
    <!-- Top Section -->
    <div class="container">
      <div class="row g-4">

        <!-- Branding -->
        <div class="col-12 col-md-4">
          <h5 class="fw-bold text-primary">🐜 ANT-Forum</h5>
          <p class="text-muted mb-2">
            A modern community platform for developers.
          </p>

          <!-- Optional Social Icons -->
          <div class="mt-2">
            <i class="bi bi-github me-2"></i>
            <i class="bi bi-facebook me-2"></i>
            <i class="bi bi-telegram"></i>
          </div>
        </div>

        <!-- Links -->
        <div class="col-12 col-md-4">
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

        <!-- Info -->
        <div class="col-12 col-md-4">
          <h6 class="fw-semibold mb-3">About</h6>
          <p class="text-muted mb-0">
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
.footer-link:hover {
  color: var(--bs-primary) !important;
  transform: translateX(3px);
  transition: 0.2s ease;
}
</style>