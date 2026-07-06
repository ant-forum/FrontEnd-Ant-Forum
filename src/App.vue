<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useForumStore } from '@/stores/ForumStore';
import { useBlogStore } from '@/stores/BlogStore';
import { useProjectStore } from '@/stores/ProjectStore';
import { useNotificationStore } from '@/stores/NotificationStore';
import { useAuthStore } from '@/stores/AuthStore';

let globalPollInterval = null;

onMounted(() => {
  const forumStore = useForumStore();
  const blogStore = useBlogStore();
  const projectStore = useProjectStore();
  const notificationStore = useNotificationStore();
  const authStore = useAuthStore();

  globalPollInterval = setInterval(() => {
    // Only poll if we are not already loading to avoid overlapping requests
    if (!forumStore.isLoading) forumStore.pollLatestDiscussions().catch(() => {});
    if (!blogStore.isLoading) blogStore.pollLatestBlogs().catch(() => {});
    if (!projectStore.isLoading) projectStore.pollLatestProjects().catch(() => {});
    if (authStore.token && String(authStore.user?.role).toLowerCase() !== "admin" && !notificationStore.loading) {
      notificationStore.fetchNotifications().catch(() => {});
    }
  }, 10000);
});

onUnmounted(() => {
  if (globalPollInterval) clearInterval(globalPollInterval);
});
</script>
