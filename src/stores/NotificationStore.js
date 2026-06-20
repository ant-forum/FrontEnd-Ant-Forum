import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/api.js";

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
    loading.value = true;
    try {
      const response = await api.get('/api/notifications/getnotification');
      if (response.data && response.data.result) {
        notifications.value = response.data.data.map(n => {
          let type = "system";
          let title = "New Notification";
          let message = "";
          
          if (n.type === "comment") {
             type = "reply";
             title = `${n.sender_username} replied to your post`;
             message = `${n.sender_username} left a comment on your post.`;
          } else if (n.type === "like") {
             type = "like";
             title = `${n.sender_username} liked your post`;
             message = `${n.sender_username} reacted to your content.`;
          } else if (n.type === "mention") {
             type = "mention";
             title = `${n.sender_username} mentioned you`;
             message = `${n.sender_username} mentioned you.`;
          }
          
          const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
          
          return {
             id: n.id,
             type: type,
             title: title,
             message: message,
             read: Boolean(n.is_read),
             created_at: n.created_at,
             link: "#",
             sender: {
                name: n.sender_username,
                avatar: n.sender_profile_pic ? `${baseUrl}${n.sender_profile_pic}` : null
             }
          };
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      loading.value = false;
    }
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

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      notifications.value = notifications.value.filter((n) => n.id !== id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
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
