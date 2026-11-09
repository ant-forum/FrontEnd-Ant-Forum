<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";
import { useTagsStore } from "@/stores/TagsStore";

const router = useRouter();
const forumStore = useForumStore();
const tagsStore = useTagsStore();

const isCollapsed = ref(
  localStorage.getItem("forum_trending_tags_collapsed") === "true",
);
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem("forum_trending_tags_collapsed", isCollapsed.value);
};

onMounted(async () => {
  try {
    await forumStore.fetchDiscussions();
  } catch (err) {
    console.warn("TrendingTags: failed to fetch discussions", err);
  }

  try {
    await tagsStore.fetchTags();
  } catch (err) {
    console.warn("TrendingTags: failed to fetch tags", err);
  }
});

const staticTagsFallback = [
  { id: 1, name: "#Vue.js" },
  { id: 2, name: "#React" },
  { id: 3, name: "#Backend" },
  { id: 4, name: "#Frontend" },
  { id: 5, name: "#Database" },
  { id: 6, name: "#Help" },
  { id: 7, name: "#Node.js" },
  { id: 8, name: "#Python" },
  { id: 9, name: "#UI/UX" },
  { id: 10, name: "#Figma" },
  { id: 11, name: "#API" },
  { id: 12, name: "#FullStack" },
];

const tags = computed(() => {
  let list;
  if (tagsStore.tags && tagsStore.tags.length > 0) {
    list = tagsStore.tags.map((t) => ({
      id: t.id,
      name: t.name.startsWith("#") ? t.name : `#${t.name}`,
    }));
  } else {
    list = staticTagsFallback;
  }
  return list.slice(0, 12);
});

const selectTag = (tagName) => {
  const cleanTag = tagName.replace("#", "").trim();
  router.push({ path: "/forum", query: { tag: cleanTag } });
};
</script>

<template>
  <div class="trending-section">
    <div class="d-flex align-items-center justify-content-between w-100">
      <h3 class="section-title">
        <span class="title-icon">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </span>
        Trending Tags
      </h3>
      <button
        class="collapse-btn"
        @click="toggleCollapse"
        :aria-expanded="!isCollapsed"
        aria-label="Toggle trending tags"
      >
        <i
          class="bi"
          :class="isCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'"
        ></i>
      </button>
    </div>

    <Transition name="collapse">
      <div v-show="!isCollapsed" class="tags-wrap">
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="tag-btn"
          @click="selectTag(tag.name)"
        >
          {{ tag.name }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.trending-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: var(--color-blue-light);
  border-radius: 6px;
  color: var(--color-blue);
  flex-shrink: 0;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tag-btn {
  padding: 4px 10px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tag-btn:hover {
  background: var(--color-blue-light);
  color: var(--color-blue);
  border-color: var(--color-blue);
}

.collapse-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    margin-top 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0 !important;
  opacity: 0;
  margin-top: 0 !important;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 250px !important;
  opacity: 1;
}
</style>
