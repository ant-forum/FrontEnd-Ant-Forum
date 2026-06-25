<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";

// Disable automatic attribute inheritance
defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits(["selectTab"]);

const router = useRouter();
const route = useRoute();
const forumStore = useForumStore();

const isDrawerMobileOpen = ref(false);

const getCategoryIcon = (category) => {
  const label = String(
    category.name || category.label || category.type || "",
  ).toLowerCase();
  if (label.includes("question") || label.includes("answer"))
    return "bi-question-circle";
  if (label.includes("tutorial") || label.includes("guide")) return "bi-book";
  if (label.includes("showcase") || label.includes("project"))
    return "bi-rocket-takeoff";
  if (label.includes("announce") || label.includes("news"))
    return "bi-megaphone";
  if (label.includes("resource") || label.includes("link"))
    return "bi-link-45deg";
  if (label.includes("idea") || label.includes("feature"))
    return "bi-lightbulb";
  return "bi-chat-left-text";
};

const displayCategories = computed(() => {
  return forumStore.categories.map((category) => ({
    id: String(category.id),
    label:
      category.name ||
      category.label ||
      category.type ||
      `Category ${category.id}`,
    icon: category.icon || getCategoryIcon(category),
  }));
});

const handleItemClick = (category, tabId) => {
  isDrawerMobileOpen.value = false;
  const query = {};

  if (category) query.category = category;
  if (tabId) query.tab = tabId;

  // We are always routing to /forum with these queries for navigation
  router.push({ path: "/forum", query });
};

// Computed active states
const isCategoryActive = (cat) =>
  route.query.category === cat ||
  (!route.query.category && !route.query.tab && cat === "all");
const isTabActive = (tab) => route.query.tab === tab;

onMounted(() => {
  if (forumStore.categories.length === 0) {
    forumStore.fetchCategories().catch(() => {});
  }
});
</script>

<template>
  <!-- Mobile Toggle Button -->
  <button
    class="sidebar-mobile-toggle-btn d-lg-none"
    @click="isDrawerMobileOpen = !isDrawerMobileOpen"
  >
    <i class="bi bi-grid-fill"></i>
  </button>

  <!-- Mobile Backdrop -->
  <transition name="fade">
    <div
      v-if="isDrawerMobileOpen"
      class="sidebar-mobile-backdrop"
      @click="isDrawerMobileOpen = false"
    ></div>
  </transition>

  <aside
    class="left-sidebar-navigation"
    :class="{ 'mobile-open': isDrawerMobileOpen }"
    v-bind="$attrs"
  >
    <!-- Forum Directory Header -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Forum Directory</h2>
      <span class="sidebar-subtitle">Explore knowledge and discussions</span>
    </div>

    <!-- New Discussion CTA -->
    <div class="sidebar-cta-wrap mb-4">
      <button class="btn-submit-project" @click="router.push('/forum/create')">
        <i class="bi bi-plus-circle-fill"></i>
        New Discussion
      </button>
    </div>

    <!-- Explore Section -->
    <div class="sidebar-section">
      <h3 class="section-heading">EXPLORE</h3>
      <div class="sidebar-menu">
        <button
          class="sidebar-menu-item"
          :class="{ active: isCategoryActive('all') }"
          @click="handleItemClick('all', null)"
        >
          <i class="bi bi-globe2"></i>
          <span>All Discussions</span>
        </button>

        <button
          v-for="category in displayCategories"
          :key="category.id"
          class="sidebar-menu-item"
          :class="{ active: isCategoryActive(category.id) }"
          @click="handleItemClick(category.id, null)"
        >
          <i :class="['bi', category.icon]"></i>
          <span>{{ category.label }}</span>
        </button>
      </div>
    </div>

    <hr class="sidebar-divider" />

    <!-- Your Content Section -->
    <div class="sidebar-section">
      <h3 class="section-heading">YOUR STUFF</h3>
      <div class="sidebar-menu">
        <button
          class="sidebar-menu-item"
          :class="{ active: isTabActive('myposts') }"
          @click="handleItemClick(null, 'myposts')"
        >
          <i class="bi bi-journal-text"></i>
          <span>My Discussions</span>
        </button>

        <button
          class="sidebar-menu-item"
          :class="{ active: isTabActive('saves') }"
          @click="handleItemClick(null, 'saves')"
        >
          <i
            :class="[
              'bi',
              isTabActive('saves') ? 'bi-bookmark-fill' : 'bi-bookmark',
            ]"
          ></i>
          <span>Saved Posts</span>
        </button>
      </div>
    </div>

    <!-- Bottom menu links -->
    <div class="sidebar-footer">
      <router-link to="/help" class="footer-link">
        <i class="bi bi-file-earmark-text"></i>
        <span>Forum Guidelines</span>
      </router-link>
    </div>
  </aside>
</template>

<style scoped>
.left-sidebar-navigation {
  display: flex;
  flex-direction: column;
  background: var(--color-glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-sm), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  height: fit-content;
  user-select: none;
  min-height: 480px;
  position: sticky;
  top: 80px;
  align-self: start;
}

.sidebar-header {
  padding: 0 0 16px 0;
  margin-bottom: 8px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.sidebar-subtitle {
  font-size: 12.5px;
  color: var(--color-text-muted);
  display: block;
}

.section-heading {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-muted);
  letter-spacing: 0.8px;
  margin: 0 0 12px 6px;
  text-transform: uppercase;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-menu-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: translateX(2px);
}

.sidebar-menu-item.active {
  background: var(--color-blue-light);
  color: var(--color-blue);
  font-weight: 700;
}

.sidebar-divider {
  margin: 20px 0;
  border: 0;
  border-top: 1px solid var(--color-border-soft, var(--color-border));
}

/* CTA Button */
.sidebar-cta-wrap {
  margin-top: 0;
}

.btn-submit-project {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-blue) 100%
  );
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px var(--color-primary-light);
}

.btn-submit-project:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--color-primary-light);
}

.sidebar-footer {
  margin-top: auto;
  padding: 24px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--color-text);
}

.footer-link i {
  font-size: 15px;
}

/* Off-canvas sidebar drawer for mobile devices */
.sidebar-mobile-toggle-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 18px var(--color-primary-light);
  z-index: 9997;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9996;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .left-sidebar-navigation {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 260px;
    background: var(--color-surface);
    z-index: 9998;
    padding: 32px 24px;
    border-right: 1px solid var(--color-border);
    border-left: none !important;
    border-top: none !important;
    border-bottom: none !important;
    border-radius: 0px !important;
    box-shadow: 15px 0 35px var(--color-shadow) !important;
    transform: translateX(-100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .left-sidebar-navigation.mobile-open {
    transform: translateX(0);
  }
}
</style>
