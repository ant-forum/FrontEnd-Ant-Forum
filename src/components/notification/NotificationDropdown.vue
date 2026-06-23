<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/NotificationStore';

const emit = defineEmits(['close']);

const displayedNotifications = computed(() => {
  return notificationStore.allNotifications.slice(0, 4);
});

const router = useRouter();
const notificationStore = useNotificationStore();

onMounted(async () => {
  await notificationStore.fetchNotifications();
  // Add global click listener to close dropdown on clicking outside
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

const dropdownRef = ref(null);

const handleOutsideClick = (e) => {
  // If clicked outside the dropdown and outside the header bell toggle button
  if (dropdownRef.value && !dropdownRef.value.contains(e.target) && !e.target.closest('.btn-bell-toggle')) {
    emit('close');
  }
};

const handleNotificationClick = async (item) => {
  emit('close');
  await notificationStore.routeToNotification(item, router);
};

const handleDeleteClick = async (e, id) => {
  e.stopPropagation(); // Prevent route navigation on clicking delete
  await notificationStore.deleteNotification(id);
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 0) return "Just now"; // Avoid future calculations due to clock offsets
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  const icons = {
    reply: "bi bi-chat-fill text-primary",
    like: "bi bi-heart-fill text-danger",
    system: "bi bi-shield-fill-check text-success",
    mention: "bi bi-at text-warning",
  };
  return icons[type] || "bi bi-bell-fill text-muted";
};
</script>

<template>
  <div ref="dropdownRef" class="notification-dropdown shadow-lg animate__animated animate__fadeIn">
    <!-- Header -->
    <div class="dropdown-header d-flex align-items-center justify-content-between">
      <h5 class="m-0 fw-bold header-title">Notifications</h5>
      <button 
        v-if="notificationStore.unreadCount > 0" 
        @click="handleMarkAllRead" 
        class="btn-mark-read btn btn-sm bg-transparent border-0 px-2 fw-semibold"
      >
        Mark all as read
      </button>
    </div>

    <!-- Scrollable content area -->
    <div class="dropdown-content">
      <!-- Loading skeletons state -->
      <div v-if="notificationStore.loading" class="skeletons-container p-3 d-flex flex-column gap-3">
        <div v-for="i in 3" :key="i" class="skeleton-item d-flex gap-3 align-items-start">
          <div class="skeleton-avatar rounded-circle"></div>
          <div class="skeleton-lines flex-grow-1 d-flex flex-column gap-2">
            <div class="skeleton-line-long rounded"></div>
            <div class="skeleton-line-short rounded"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="notificationStore.notifications.length === 0" class="empty-state p-4 text-center d-flex flex-column align-items-center justify-content-center">
        <div class="empty-icon-wrapper d-flex align-items-center justify-content-center rounded-circle mb-3">
          <i class="bi bi-bell-slash"></i>
        </div>
        <h6 class="fw-bold mb-1 themed-text">All caught up!</h6>
        <p class="text-muted small m-0">You have no active notifications at the moment.</p>
      </div>

      <!-- Notification list -->
      <div v-else class="notifications-list">
        <div 
          v-for="item in displayedNotifications" 
          :key="item.id" 
          @click="handleNotificationClick(item)" 
          class="notification-item d-flex gap-3 align-items-start"
          :class="{ 'unread': !item.read }"
        >
          <!-- Avatar / Icon -->
          <div class="item-avatar-wrap position-relative">
            <img 
              v-if="item.sender && item.sender.avatar" 
              :src="item.sender.avatar" 
              class="sender-avatar rounded-circle object-fit-cover" 
              alt="Avatar" 
              width="36" 
              height="36"
            >
            <div 
              v-else 
              class="fallback-icon-wrap rounded-circle d-flex align-items-center justify-content-center bg-secondary-subtle"
            >
              <i class="bi bi-bell"></i>
            </div>
            
            <!-- Type Icon badge -->
            <div class="badge-icon-wrap rounded-circle d-flex align-items-center justify-content-center shadow-sm">
              <i :class="getNotificationIcon(item.type)"></i>
            </div>
          </div>

          <!-- Message Body -->
          <div class="item-body flex-grow-1 min-width-0">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
              <span class="item-title text-truncate fw-bold">{{ item.title }}</span>
              <span class="item-time text-nowrap text-muted small">{{ formatTime(item.created_at) }}</span>
            </div>
            <p class="item-message text-muted small m-0">{{ item.message }}</p>
          </div>

          <!-- Inline Actions -->
          <div class="item-actions d-flex align-items-center justify-content-center">
            <!-- Unread Pulse Dot -->
            <span v-if="!item.read" class="unread-dot rounded-circle"></span>
            
            <!-- Delete Button -->
            <button 
              @click="handleDeleteClick($event, item.id)" 
              class="btn-delete-item btn btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 bg-transparent text-muted"
              title="Delete Notification"
            >
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- Dropdown Footer -->
      <div class="dropdown-footer">
        <router-link 
          to="/notifications" 
          @click="emit('close')" 
          class="view-all-btn text-decoration-none fw-bold"
        >
          View all notifications
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 380px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  z-index: 1050;
  overflow: hidden;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.dropdown-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-hover);
}

.header-title {
  font-size: 16px;
  color: var(--color-text);
}

.btn-mark-read {
  font-size: 12px;
  color: var(--color-primary, #7c3aed) !important;
  transition: all 0.2s;
}

.btn-mark-read:hover {
  opacity: 0.8;
}

.dropdown-footer {
  padding: 14px 20px;
  background: var(--color-surface-hover);
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.view-all-btn {
  font-size: 13px;
  color: var(--color-primary) !important;
  transition: all 0.2s ease;
}

.view-all-btn:hover {
  color: var(--color-primary-hover) !important;
  text-decoration: underline !important;
}

.dropdown-content {
  overflow-y: auto;
  flex-grow: 1;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
}

.notification-item.unread {
  background: var(--color-purple-light, rgba(124, 58, 237, 0.04));
}

.item-avatar-wrap {
  flex-shrink: 0;
}

.sender-avatar {
  border: 2px solid var(--color-border);
}

.fallback-icon-wrap {
  width: 36px;
  height: 36px;
  font-size: 16px;
  color: var(--color-text-muted);
}

.badge-icon-wrap {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: var(--color-surface, #1e1e30);
  border: 1px solid var(--color-border);
  font-size: 9px;
}

.item-body {
  min-width: 0;
}

.item-title {
  font-size: 13.5px;
  color: var(--color-text);
}

.item-time {
  font-size: 11.5px;
}

.item-message {
  font-size: 12.5px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-actions {
  flex-shrink: 0;
  width: 24px;
  height: 36px;
  position: relative;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary, #7c3aed);
  box-shadow: 0 0 8px var(--color-primary);
  display: inline-block;
  transition: opacity 0.2s ease;
}

.btn-delete-item {
  position: absolute;
  inset: 0;
  display: none !important;
  font-size: 14px;
  color: var(--color-text-muted) !important;
}

.btn-delete-item:hover {
  color: var(--color-danger, #ef4444) !important;
}

/* Toggle actions on hover */
.notification-item:hover .unread-dot {
  display: none;
}

.notification-item:hover .btn-delete-item {
  display: flex !important;
}

/* Empty State Styling */
.empty-state {
  min-height: 250px;
}

.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
  font-size: 24px;
  color: var(--color-text-muted);
}

.empty-state p {
  max-width: 240px;
  line-height: 1.5;
}

/* Skeletons loader styling */
.skeleton-item {
  overflow: hidden;
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-long {
  width: 80%;
  height: 12px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-short {
  width: 50%;
  height: 10px;
  background: linear-gradient(90deg, var(--color-surface-hover) 25%, var(--color-border) 50%, var(--color-surface-hover) 75%);
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 480px) {
  .notification-dropdown {
    position: fixed;
    top: 70px;
    left: 16px;
    right: 16px;
    width: auto;
    max-height: calc(100vh - 100px);
  }
}
</style>
