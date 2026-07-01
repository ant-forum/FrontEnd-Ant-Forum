<template>
  <AdminPageShell
    title="Thread Management"
    kicker="Forum Moderation"
    subtitle="Manage all forum threads, keep discussion topics organized, and create new topics."
    :metrics="metrics"
  >
    <AdminThreadQueue ref="threadQueueRef" />
  </AdminPageShell>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import AdminThreadQueue from "../../components/admin/AdminThreadQueue.vue";
import { useForumStore } from "../../stores/ForumStore";
import { useTagsStore } from "../../stores/TagsStore";

const forumStore = useForumStore();
const tagsStore = useTagsStore();
const threadQueueRef = ref(null);

onMounted(async () => {
  try {
    await Promise.allSettled([
      forumStore.fetchDiscussions(),
      forumStore.fetchCategories(),
      tagsStore.fetchTags(),
    ]);
  } catch (err) {
    console.error("Failed to pre-fetch thread management data:", err);
  }
});

const metrics = computed(() => [
  {
    label: "Thread Forum",
    value: String(forumStore.discussions.length),
    change: "Total discussions",
    icon: "bi-chat-square-text",
    className: "blue",
  },
  {
    label: "Categories",
    value: String(forumStore.categories.length),
    change: "Active sections",
    icon: "bi-grid-fill",
    className: "orange",
  },
  {
    label: "Tags",
    value: String(tagsStore.tags.length),
    change: "Usable keywords",
    icon: "bi-tags",
    className: "blue",
  },
  {
    label: "Total Replies",
    value: String(forumStore.discussions.reduce((acc, thread) => acc + (Number(thread.replies) || 0), 0)),
    change: "Community responses",
    icon: "bi-chat-left-dots",
    className: "green",
  },
]);
</script>
