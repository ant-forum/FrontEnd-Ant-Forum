import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);
  const loading = ref(false);

  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.read).length;
  });

  const allNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      return new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp);
    });
  });

  // Actions
  // Actions
  const fetchNotifications = async () => {
    // If notifications are already loaded, don't reload mock data
    if (notifications.value.length > 0) return;

    loading.value = true;

    // Simulate a brief, ultra-smooth local loading state to display skeleton loaders
    await new Promise((resolve) => setTimeout(resolve, 300));

    // High-fidelity static mock data tailored for ANT students and teachers
    notifications.value = [
      {
        id: 1,
        type: "reply",
        title: "Sarah Chen replied to your thread",
        message: '"Make sure you use multi-stage builds and choose a lightweight base image like node:18-alpine..."',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        link: "/forum/1",
        sender: {
          name: "Sarah Chen",
          avatar: "https://i.pravatar.cc/150?u=sarahc",
        }
      },
      {
        id: 2,
        type: "like",
        title: "David Smith liked your post",
        message: "David Smith liked your project showcase 'DevOps Optimization Blueprint'.",
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        link: "/showcase/1",
        sender: {
          name: "David Smith",
          avatar: "https://i.pravatar.cc/150?u=david",
        }
      },
      {
        id: 3,
        type: "system",
        title: "Project Showcase Approved",
        message: "Administrator Alex Chen approved your project 'ANT Forum Redesign Mockups' for public view.",
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        link: "/showcase/1",
        sender: {
          name: "Alex Chen",
          avatar: "/charles_leclerc.png",
        }
      },
      {
        id: 4,
        type: "mention",
        title: "Marcus Wright mentioned you in a comment",
        message: "@SopanhaZin is there an endpoint `/auth/refresh` on the deployed NodeJS server?",
        read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        link: "/forum/2",
        sender: {
          name: "Marcus Wright",
          avatar: "https://i.pravatar.cc/150?u=marcus",
        }
      }
    ];

    loading.value = false;
  };

  const markAsRead = (id) => {
    const item = notifications.value.find((n) => n.id === id);
    if (item) {
      item.read = true;
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach((n) => {
      n.read = true;
    });
  };

  const deleteNotification = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const addNotification = (item) => {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      created_at: new Date().toISOString(),
      ...item,
    });
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  return {
    notifications,
    loading,
    unreadCount,
    allNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearNotifications,
  };
});
