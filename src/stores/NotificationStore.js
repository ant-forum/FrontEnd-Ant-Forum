import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/api.js";
import { useForumStore } from "./ForumStore";
import { useAuthStore } from "./AuthStore";

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
  const mapNotification = (n) => {
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
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://ant-forum.khei.work.gd";
    
    const targetId = n.forum_id || n.forumId || n.forum?.id || 
                     n.post_id || n.postId || n.post?.id || 
                     n.discussion_id || n.discussionId || n.discussion?.id || 
                     n.reference_id || n.referenceId || 
                     n.target_id || n.targetId || 
                     n.related_id || n.relatedId || 
                     n.item_id || n.itemId || 
                     n.parent_id || n.parentId ||
                     n.data?.forum_id || n.data?.post_id || n.data?.discussion_id || n.data?.id ||
                     n.metadata?.forum_id || n.metadata?.post_id || n.meta?.forum_id || n.meta?.post_id;
    
    const forumId = n.forum_id || n.forumId || targetId;
    const commentId = n.comment_id || n.commentId || n.entity_id || n.entityId || (n.reference_type === "comment" ? n.referent_id : null);
    
    let linkUrl = "#";
    if (forumId) {
      linkUrl = `/forum/${forumId}`;
      if (commentId) {
        linkUrl += `#comment-${commentId}`;
      }
    } else if ((n.link && n.link !== "#") || (n.url && n.url !== "#")) {
      linkUrl = (n.link && n.link !== "#") ? n.link : n.url;
    }

    return {
       id: n.id,
       type: type,
       title: title,
       message: message,
       read: (() => {
         const val = n.is_read !== undefined ? n.is_read : (n.isRead !== undefined ? n.isRead : n.read);
         if (val === undefined || val === null) return false;
         if (typeof val === 'boolean') return val;
         if (typeof val === 'number') return val === 1;
         if (typeof val === 'string') return val === '1' || val.toLowerCase() === 'true';
         return Boolean(val);
       })(),
       created_at: n.created_at,
       link: linkUrl,
       sender: {
          name: n.sender_username,
          avatar: n.sender_profile_pic ? `${baseUrl}${n.sender_profile_pic}` : null
       }
    };
  };

  const fetchNotifications = async () => {
    const authStore = useAuthStore();
    if (!authStore.token) {
      notifications.value = [];
      return;
    }
    loading.value = true;
    try {
      const response = await api.get('/api/notifications/getnotification');
      if (response.data && response.data.result) {
        notifications.value = response.data.data.map(n => mapNotification(n));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/markasread/${id}`);
      const found = notifications.value.find((n) => n.id === id);
      if (found) {
        found.read = true;
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
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

  const routeToNotification = async (item, router) => {
    await markAsRead(item.id);
    if (item.link && item.link !== "#") {
      // As requested, fetch forum detail before routing if it's a forum link
      if (item.link.startsWith("/forum/")) {
        const cleanPath = item.link.split("#")[0];
        const targetId = cleanPath.split("/")[2];
        try {
          const forumStore = useForumStore();
          await forumStore.fetchDiscussion(targetId);
        } catch (error) {
          console.error("Failed to fetch forum details:", error);
        }
      }
      router.push(item.link);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    allNotifications,
    mapNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearNotifications,
    routeToNotification,
  };
});
