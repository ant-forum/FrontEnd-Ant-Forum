<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useRoute } from "vue-router";
import logo from "../../assets/ANT-Forum.png";

const auth = useAuthStore();
const route = useRoute();

const isOpen = ref(false);

const navItems = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Forum", path: "/forum" },
  { name: "Blog", path: "/blog" },
  { name: "Dashboard", path: "/dashboard" },
];

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const logout = () => {
  auth.logout();
};
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm sticky-top app-navbar">
    <div class="container">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <img :src="logo" width="40" height="40" class="me-2 rounded" />
        <span class="fw-bold text-primary">ANT-Forum</span>
      </router-link>

      <!-- Hamburger -->
      <button class="navbar-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu -->
      <div class="collapse navbar-collapse" :class="{ show: isOpen }">
        <ul class="navbar-nav ms-auto">
          <!-- Main links -->
          <li class="nav-item" v-for="item in navItems" :key="item.path">
            <router-link
              class="nav-link"
              :class="{ active: route.path === item.path }"
              :to="item.path"
              @click="closeMenu"
            >
              {{ item.name }}
            </router-link>
          </li>

          <!-- Auth -->
          <template v-if="!auth.isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login" @click="closeMenu">
                Login
              </router-link>
            </li>
            <!-- <li class="nav-item">
              <router-link class="nav-link" to="/register" @click="closeMenu">
                Register
              </router-link>
            </li> -->
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/profile" @click="closeMenu">
                Profile
              </router-link>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-danger ms-2" @click="logout">
                Logout
              </button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  border-bottom: 1px solid var(--color-border);
}

.navbar-brand,
.nav-link {
  border-radius: var(--radius-sm);
}

.nav-link {
  font-weight: 500;
  padding-inline: var(--spacing-sm) !important;
}

.nav-link.active {
  color: var(--brand) !important;
}

@media (hover: hover) {
  .nav-link:hover {
    color: var(--brand-hover) !important;
    transform: translateY(-1px);
  }
}

.navbar-toggler {
  border-radius: var(--radius-md);
}
</style>
