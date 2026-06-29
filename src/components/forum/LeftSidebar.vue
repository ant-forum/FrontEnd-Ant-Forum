<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";
import { useTagsStore } from "@/stores/TagsStore";

// Disable automatic attribute inheritance
defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits(["selectTab"]);

const router = useRouter();
const route = useRoute();
const forumStore = useForumStore();
const tagsStore = useTagsStore();

const isDrawerMobileOpen = ref(false);

const categoryGradients = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #10b981, #047857)",
  "linear-gradient(135deg, #5483B3, #052659)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #0d9488, #0f766e)",
  "linear-gradient(135deg, #ef4444, #b91c1c)",
];

const categoryColors = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#5483B3", // Slate Blue
  "#f59e0b", // Orange
  "#0d9488", // Teal
  "#ef4444", // Red
];

const categoryLightColors = [
  "rgba(59, 130, 246, 0.15)",
  "rgba(16, 185, 129, 0.15)",
  "rgba(84, 131, 179, 0.15)",
  "rgba(245, 158, 11, 0.15)",
  "rgba(13, 148, 136, 0.15)",
  "rgba(239, 68, 68, 0.15)",
];

const hashString = (value = "") =>
  String(value)
    .split("")
    .reduce((hash, char) => hash + char.charCodeAt(0), 0);

const getCategoryTheme = (label) => {
  const index = hashString(label) % categoryColors.length;
  return {
    solid: categoryColors[index],
    light: categoryLightColors[index],
    gradient: categoryGradients[index],
  };
};

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
  return forumStore.categories.map((category) => {
    const label =
      category.name ||
      category.label ||
      category.type ||
      `Category ${category.id}`;
    const theme = getCategoryTheme(label);
    return {
      id: String(category.id),
      label,
      icon: category.icon || getCategoryIcon(category),
      theme,
    };
  });
});

const displayTags = computed(() => {
  return Array.isArray(tagsStore.tags) ? tagsStore.tags.slice(0, 10) : [];
});

const handleItemClick = (category, tabId) => {
  isDrawerMobileOpen.value = false;
  const query = {};

  if (category) query.category = category;
  if (tabId) query.tab = tabId;

  // We are always routing to /forum with these queries for navigation
  router.push({ path: "/forum", query });
};

const isTagActive = (tagName) => {
  return String(route.query.tag || "").toLowerCase() === String(tagName || "").toLowerCase();
};

const handleTagClick = (tagName) => {
  isDrawerMobileOpen.value = false;
  const cleanTag = tagName.replace("#", "").trim();
  
  if (isTagActive(cleanTag)) {
    const newQuery = { ...route.query };
    delete newQuery.tag;
    router.push({ path: "/forum", query: newQuery });
  } else {
    router.push({ path: "/forum", query: { ...route.query, tag: cleanTag } });
  }
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
  if (tagsStore.tags.length === 0) {
    tagsStore.fetchTags().catch(() => {});
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
          class="sidebar-menu-item category-item"
          :class="{ active: isCategoryActive('all') }"
          style="--category-color: #3b82f6; --category-color-light: rgba(59, 130, 246, 0.15);"
          @click="handleItemClick('all', null)"
        >
          <i class="bi bi-globe2"></i>
          <span>All Discussions</span>
        </button>

        <button
          v-for="category in displayCategories"
          :key="category.id"
          class="sidebar-menu-item category-item"
          :class="{ active: isCategoryActive(category.id) }"
          :style="{
            '--category-color': category.theme.solid,
            '--category-color-light': category.theme.light
          }"
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

    <!-- Tags Section -->
    <template v-if="displayTags.length > 0">
      <hr class="sidebar-divider" />
      <div class="sidebar-section">
        <h3 class="section-heading">Popular Tags</h3>
        <div class="sidebar-tags-container">
          <button
            v-for="tag in displayTags"
            :key="tag.id"
            class="sidebar-tag-item"
            :class="{ active: isTagActive(tag.name) }"
            @click="handleTagClick(tag.name)"
          >
            <span class="tag-hash">#</span>
            <span class="tag-name">{{ tag.name }}</span>
          </button>
        </div>
      </div>
    </template>
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
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* Custom Scrollbar for premium aesthetic */
.left-sidebar-navigation::-webkit-scrollbar {
  width: 4px;
}

.left-sidebar-navigation::-webkit-scrollbar-track {
  background: transparent;
}

.left-sidebar-navigation::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 99px;
}

.left-sidebar-navigation::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
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

/* Category Item custom styling */
.category-item i {
  color: var(--category-color);
  transition: transform 0.2s ease, color 0.2s ease;
}

.category-item:hover i {
  transform: scale(1.1);
}

.category-item.active {
  background: var(--category-color-light) !important;
  color: var(--category-color) !important;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.category-item:hover {
  background: var(--category-color-light) !important;
  color: var(--category-color) !important;
}

/* Sidebar tags widget */
.sidebar-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 4px;
}

.sidebar-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-glass-border, rgba(255, 255, 255, 0.08));
  color: var(--color-text-muted);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-tag-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.sidebar-tag-item.active {
  background: var(--color-primary-light, rgba(59, 130, 246, 0.15)) !important;
  border-color: var(--color-primary, #3b82f6) !important;
  color: var(--color-primary, #3b82f6) !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.tag-hash {
  opacity: 0.55;
  margin-right: 1px;
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

