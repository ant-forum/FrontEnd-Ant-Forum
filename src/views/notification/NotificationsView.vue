<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from "../../components/layouts/header.vue";
import Footer from "../../components/layouts/footer.vue";
import { useNotificationStore } from "../../stores/NotificationStore";
import { useToast } from "../../composables/useToast";
import { useTimeFormat } from "../../composables/useTimeFormat";

const router = useRouter();
const notificationStore = useNotificationStore();
const toast = useToast();
const { formatFullTime } = useTimeFormat();

// Active filter state: 'all' | 'unread' | 'read' | 'reply' | 'like' | 'mention' | 'system'
const activeFilter = ref('all');
const searchQuery = ref('');
const displayLimit = ref(4);

watch([activeFilter, searchQuery], () => {
  displayLimit.value = 4;
});

const filterTypes = [
  { value: 'reply', label: 'Replies', icon: 'bi bi-chat-fill text-primary' },
  { value: 'like', label: 'Likes', icon: 'bi bi-heart-fill text-danger' },
  { value: 'mention', label: 'Mentions', icon: 'bi bi-at text-warning' },
  { value: 'system', label: 'System Updates', icon: 'bi bi-shield-fill-check text-success' }
];

onMounted(async () => {
  await notificationStore.fetchNotifications();
});

// Computed notifications based on filter and search query
const filteredNotifications = computed(() => {
  let list = notificationStore.allNotifications;

  // Apply Status / Type filter
  if (activeFilter.value === 'unread') {
    list = list.filter(n => !n.read);
  } else if (activeFilter.value === 'read') {
    list = list.filter(n => n.read);
  } else if (['reply', 'like', 'mention', 'system'].includes(activeFilter.value)) {
    list = list.filter(n => n.type === activeFilter.value);
  }

  // Apply Search query (matches title or message content)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter(n => 
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.message && n.message.toLowerCase().includes(query)) ||
      (n.sender && n.sender.name && n.sender.name.toLowerCase().includes(query))
    );
  }

  return list;
});

const visibleNotifications = computed(() => {
  return filteredNotifications.value.slice(0, displayLimit.value);
});

// Filter category counter helpers
const getCount = (filterType) => {
  if (filterType === 'all') return notificationStore.notifications.length;
  if (filterType === 'unread') return notificationStore.unreadCount;
  if (filterType === 'read') return notificationStore.notifications.filter(n => n.read).length;
  return notificationStore.notifications.filter(n => n.type === filterType).length;
};

// Handlers
const handleNotificationClick = async (e, item) => {
  if (e.target.closest('.actions-wrap')) return;
  await notificationStore.markAsRead(item.id);
  if (item.link) {
    router.push(item.link);
  }
};

const handleToggleRead = async (e, item) => {
  e.stopPropagation(); // Avoid triggering full routing navigation
  if (item.read) {
    // Custom mock functionality: allow toggling back to unread inside the detailed view page
    const found = notificationStore.notifications.find(n => n.id === item.id);
    if (found) found.read = false;
  } else {
    await notificationStore.markAsRead(item.id);
  }
};

const handleDeleteClick = async (e, id) => {
  e.stopPropagation();
  try {
    await notificationStore.deleteNotification(id);
    toast.success("Notification deleted successfully");
  } catch (error) {
    toast.error("Failed to delete notification");
  }
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleClearAll = () => {
  if (confirm("Are you sure you want to delete all notifications? This cannot be undone.")) {
    notificationStore.clearNotifications();
    toast.success("All notifications deleted successfully");
  }
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
  <div class="notifications-premium-page">
    <div class="hero-bg-effects" aria-hidden="true">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>
    
    <Navbar />

    <div class="container page-container py-4">
    <!-- Page Header Title -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-sm">
        <h2 class="page-title fw-black m-0 text-adaptive d-flex align-items-center gap-3">
          <i class="bi bi-bell-fill text-gradient"></i>
          <span>Notification Center</span>
        </h2>
        <p class="text-muted small m-0 mt-1">Manage, filter, and track all your school activity alerts.</p>
      </div>
      <div class="col-sm-auto d-flex gap-2">
        <button 
          v-if="notificationStore.unreadCount > 0" 
          @click="handleMarkAllRead" 
          class="btn btn-action-modern btn-mark-read d-flex align-items-center gap-2"
        >
          <i class="bi bi-check2-all"></i>
          <span>Mark all as read</span>
        </button>
        <button 
          v-if="notificationStore.notifications.length > 0" 
          @click="handleClearAll" 
          class="btn btn-action-modern btn-clear-all d-flex align-items-center gap-2"
        >
          <i class="bi bi-trash3"></i>
          <span>Clear all</span>
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Left Filters Sidebar Column -->
      <aside class="col-lg-3">
        <div class="sidebar-card glass-panel p-4 mb-4">
          <!-- Search Box -->
          <div class="search-box-wrap mb-4 position-relative">
            <i class="bi bi-search search-icon position-absolute text-muted"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control ps-5" 
              placeholder="Search notifications..."
            />
          </div>

          <!-- Navigation Filters -->
          <h6 class="sidebar-section-title text-muted text-uppercase fw-bold mb-3 px-2">Filters</h6>
          <nav class="sidebar-nav d-flex flex-column gap-1">
            <button 
              v-for="filter in ['all', 'unread', 'read']" 
              :key="filter"
              @click="activeFilter = filter" 
              class="filter-nav-btn text-start d-flex justify-content-between align-items-center"
              :class="{ 'active': activeFilter === filter }"
            >
              <span class="d-flex align-items-center gap-3 flex-shrink-0">
                <i :class="[
                  filter === 'all' ? 'bi bi-grid-fill' : 
                  filter === 'unread' ? 'bi bi-envelope-fill' : 'bi bi-envelope-open-fill'
                ]"></i>
                <span class="text-capitalize">{{ filter }}</span>
              </span>
              <span class="sidebar-badge flex-shrink-0 ms-2">
                {{ getCount(filter) }}
              </span>
            </button>
          </nav>

          <hr class="my-4 border-slate">

          <h6 class="sidebar-section-title text-muted text-uppercase fw-bold mb-3 px-2">Types</h6>
          <nav class="sidebar-nav d-flex flex-column gap-1">
            <button 
              v-for="type in filterTypes" 
              :key="type.value"
              @click="activeFilter = type.value" 
              class="filter-nav-btn text-start d-flex justify-content-between align-items-center"
              :class="{ 'active': activeFilter === type.value }"
            >
              <span class="d-flex align-items-center gap-3 flex-shrink-0">
                <i :class="type.icon"></i>
                <span>{{ type.label }}</span>
              </span>
              <span class="sidebar-badge flex-shrink-0 ms-2">
                {{ getCount(type.value) }}
              </span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Right Main Feed Column -->
      <main class="col-lg-9">
        <div class="feed-container d-flex flex-column gap-3">
          
          <!-- Loading skeleton state -->
          <div v-if="notificationStore.loading" class="skeletons-wrapper d-flex flex-column gap-3">
            <div v-for="i in 4" :key="i" class="skeleton-card p-4 rounded-4 shadow-sm d-flex gap-4">
              <div class="skeleton-avatar rounded-circle"></div>
              <div class="skeleton-body flex-grow-1 d-flex flex-column gap-3">
                <div class="skeleton-line-long"></div>
                <div class="skeleton-line-short"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredNotifications.length === 0" class="empty-state-card text-center p-5 rounded-4 border shadow-sm d-flex flex-column align-items-center justify-content-center">
            <div class="empty-icon-wrap mb-4 d-flex align-items-center justify-content-center rounded-circle">
              <i class="bi bi-bell-slash"></i>
            </div>
            <h4 class="fw-black mb-2 text-adaptive">No Notifications Found</h4>
            <p class="text-muted small mb-4 max-width-p">We couldn't find any notifications matching the selected filter or search query.</p>
            <button @click="activeFilter = 'all'; searchQuery = ''" class="btn btn-primary-gradient px-4 py-2 fw-bold shadow-sm rounded-pill">
              Clear All Filters
            </button>
          </div>

          <!-- Notifications List Feed -->
          <div v-else class="notifications-feed-list d-flex flex-column gap-3">
            <div 
              v-for="item in visibleNotifications" 
              :key="item.id" 
              @click="handleNotificationClick($event, item)" 
              class="notification-card-item p-4 rounded-4 shadow-sm d-flex gap-4 align-items-start transition-all cursor-pointer border border-theme"
              :class="{ 'unread': !item.read }"
            >
              <!-- Avatar Column -->
              <div class="avatar-wrap position-relative flex-shrink-0">
                <img 
                  v-if="item.sender?.avatar" 
                  :src="item.sender.avatar" 
                  class="sender-avatar rounded-circle object-fit-cover shadow-sm" 
                  alt="User Avatar"
                  width="48"
                  height="48"
                >
                <div 
                  v-else 
                  class="fallback-icon-wrap rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style="width: 48px; height: 48px;"
                >
                  <i class="bi bi-bell-fill text-muted"></i>
                </div>
                <!-- Badge Badge Icon -->
                <div class="badge-icon-badge rounded-circle shadow-sm position-absolute d-flex align-items-center justify-content-center">
                  <i :class="getNotificationIcon(item.type)"></i>
                </div>
              </div>

              <!-- Message Body Column -->
              <div class="body-wrap flex-grow-1 min-width-0">
                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2">
                  <h6 class="m-0 fw-black text-adaptive title-text text-truncate pe-sm-4">{{ item.title }}</h6>
                  <span class="time-text text-muted small text-nowrap">{{ formatFullTime(item.created_at || item.timestamp) }}</span>
                </div>
                <p class="message-text text-muted m-0 pe-md-4 mb-3">{{ item.message }}</p>
                <div class="action-bar d-flex gap-2">
                  <span v-if="!item.read" class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1-5 rounded-pill small fw-bold d-inline-flex align-items-center gap-2">
                    <span class="pulse-dot"></span>
                    <span>New Alert</span>
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-muted border border-secondary-subtle px-3 py-1-5 rounded-pill small fw-bold">
                    Read
                  </span>
                  <span :class="['badge text-uppercase type-badge px-3 py-1-5 rounded-pill small fw-bold', `badge-type-${item.type}`]">
                    {{ item.type }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons Column -->
              <div class="actions-wrap flex-shrink-0 dropdown">
                <button 
                  class="btn btn-circle-action border-0" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end custom-dropdown-menu shadow">
                  <li>
                    <button class="dropdown-item d-flex align-items-center gap-2" type="button" @click="handleToggleRead($event, item)">
                      <i :class="item.read ? 'bi bi-envelope-fill text-muted' : 'bi bi-envelope-open-fill text-primary'"></i>
                      <span>Mark as {{ item.read ? 'Unread' : 'Read' }}</span>
                    </button>
                  </li>
                  <li><hr class="dropdown-divider custom-divider"></li>
                  <li>
                    <button class="dropdown-item d-flex align-items-center gap-2 text-danger action-delete" type="button" @click="handleDeleteClick($event, item.id)">
                      <i class="bi bi-trash3-fill"></i>
                      <span>Delete Notification</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- See More Button -->
            <div v-if="filteredNotifications.length > displayLimit" class="d-flex justify-content-center mt-3 mb-2">
              <button @click="displayLimit += 10" class="btn btn-action-modern px-5 py-2 fw-bold">
                See More
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>

  <Footer />
  </div>
</template>

<style scoped>

.notifications-premium-page {
  min-height: 100vh;
  background: 
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    var(--color-bg);
  background-size: 34px 34px;
  color: var(--color-text);
  padding-bottom: 60px;
  position: relative;
  overflow-x: clip;
}

.hero-bg-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: drift ease-in-out infinite;
}

.orb-1 {
  width: 400px; height: 400px;
  left: -10%; top: -10%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
  animation-duration: 12s;
}

.orb-2 {
  width: 300px; height: 300px;
  right: 0%; top: 40%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 70%);
  animation-duration: 16s;
  animation-delay: -4s;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -20px); }
  66% { transform: translate(-20px, 15px); }
}

.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 24px;
  position: relative;
  z-index: 1;
}

.text-gradient {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 40%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-panel {
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

/* Sidebar and Cards Styling */
.sidebar-card {
  transition: all 0.3s ease;
  position: sticky;
  top: 100px;
  z-index: 10;
}

.border-slate {
  border-color: var(--color-border) !important;
}

.sidebar-section-title {
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  color: var(--color-text-muted) !important;
}

.sidebar-nav {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
}

.filter-nav-btn {
  width: 100% !important;
  margin: 0 0 4px 0 !important;
  padding: 10px 14px !important;
  border: none !important;
  background: transparent !important;
  color: var(--color-text-muted) !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  border-radius: 12px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  transition: all 0.3s ease !important;
}

.filter-nav-btn:hover {
  background: var(--color-surface-hover) !important;
  color: var(--color-text) !important;
}

.filter-nav-btn.active {
  background: var(--color-primary-light) !important;
  color: var(--color-primary) !important;
}

.sidebar-badge {
  background: var(--color-surface-hover) !important;
  color: var(--color-text-muted) !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: 999px !important;
  border: 1px solid var(--color-border) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 24px !important;
  height: 20px !important;
  line-height: 1 !important;
}

.filter-nav-btn.active .sidebar-badge {
  background: var(--color-primary) !important;
  color: #fff !important;
  border-color: var(--color-primary) !important;
}

/* modern search inputs */
.search-icon {
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.05rem;
  color: var(--color-text-muted) !important;
}

.form-control {
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-control:focus {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  color: var(--color-text);
}

.form-control::placeholder {
  color: var(--color-text-muted);
}

/* Action Buttons Header */
.btn-action-modern {
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: 999px;
  transition: all 0.3s ease;
}

.btn-action-modern:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-primary);
}

.btn-clear-all:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.btn-primary-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary-gradient:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

/* Notifications feed items */
.notification-card-item {
  background: var(--color-surface-elevated);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-soft);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  position: relative;
  z-index: 1;
}

.notification-card-item:hover,
.notification-card-item:focus-within,
.notification-card-item:has(.dropdown-menu.show) {
  z-index: 50;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg) !important;
  border-color: var(--color-primary-light) !important;
  background: var(--color-surface-hover);
}

.notification-card-item.unread {
  background: var(--color-primary-light);
  border-color: var(--color-primary-light) !important;
}

.sender-avatar {
  border: 2px solid var(--color-border);
}

.fallback-icon-wrap {
  background: var(--color-surface-hover);
}

.badge-icon-badge {
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  background: var(--color-surface-elevated);
  border: 1.5px solid var(--color-bg);
  font-size: 10px;
}

.title-text {
  font-size: 1.05rem;
  color: var(--color-text);
}

.message-text {
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--color-text-muted) !important;
}

.time-text {
  font-size: 0.8rem;
  color: var(--color-secondary) !important;
}

.py-1-5 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

/* Toggle unread pulse */
.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: #818cf8;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(129, 140, 248, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(129, 140, 248, 0); }
}

/* Feed item circle button actions */
.btn-circle-action {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border) !important;
  color: var(--color-text-muted);
  transition: all 0.3s ease;
}

.btn-circle-action:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary) !important;
  color: var(--color-primary);
}

.btn-delete:hover {
  background: var(--color-danger-light);
  border-color: var(--color-danger) !important;
  color: var(--color-danger);
}

/* Empty State Card */
.empty-state-card {
  background: var(--color-surface-elevated);
  backdrop-filter: blur(10px);
  border: 1px dashed var(--color-border);
  min-height: 350px;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  background: var(--color-surface-hover);
  font-size: 2rem;
  color: var(--color-text-muted);
}

.max-width-p {
  max-width: 320px;
}

/* Skeleton Loading animations */
.skeleton-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(90deg, var(--color-border-soft) 25%, var(--color-border) 50%, var(--color-border-soft) 75%);
  background-size: 200% 100%;
  animation: pulse-glow-skel 1.5s infinite;
}

.skeleton-line-long {
  width: 70%;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-border-soft) 25%, var(--color-border) 50%, var(--color-border-soft) 75%);
  background-size: 200% 100%;
  animation: pulse-glow-skel 1.5s infinite;
}

.skeleton-line-short {
  width: 40%;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-border-soft) 25%, var(--color-border) 50%, var(--color-border-soft) 75%);
  background-size: 200% 100%;
  animation: pulse-glow-skel 1.5s infinite;
}

@keyframes pulse-glow-skel {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.actions-wrap {
  align-self: center;
}

@media (max-width: 768px) {
  .actions-wrap {
    align-self: flex-end;
    margin-top: 12px;
  }
}

/* Custom premium badge themes for type elements */
.type-badge {
  font-size: 0.72rem !important;
  letter-spacing: 0.5px;
}

.badge-type-reply {
  background: var(--color-tag-indigo-bg) !important;
  color: var(--color-tag-indigo-text) !important;
  border: 1px solid var(--color-primary-light) !important;
}

.badge-type-like {
  background: var(--color-tag-red-bg) !important;
  color: var(--color-tag-red-text) !important;
  border: 1px solid var(--color-danger-light) !important;
}

.badge-type-mention {
  background: var(--color-warning-light) !important;
  color: var(--color-warning) !important;
  border: 1px solid var(--color-warning-light) !important;
}

.badge-type-system {
  background: var(--color-success-light) !important;
  color: var(--color-success) !important;
  border: 1px solid var(--color-success-light) !important;
}

/* Muted badge for old/read items */
.bg-secondary-subtle {
  background-color: var(--color-surface-hover) !important;
}
.border-secondary-subtle {
  border-color: var(--color-border) !important;
}

.bg-primary-subtle {
  background-color: var(--color-primary-light) !important;
}
.border-primary-subtle {
  border-color: var(--color-primary-light) !important;
}

.text-adaptive {
  color: var(--color-text) !important;
}

p.text-muted {
  color: var(--color-text-muted) !important;
}

/* Custom Dropdown Menu for 3-dots */
.custom-dropdown-menu {
  background: var(--color-surface-elevated);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 200px;
}

.custom-dropdown-menu .dropdown-item {
  color: var(--color-text);
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.custom-dropdown-menu .dropdown-item:hover,
.custom-dropdown-menu .dropdown-item:focus {
  background: var(--color-surface-hover);
  color: var(--color-text);
  outline: none;
}

.custom-dropdown-menu .dropdown-item.action-delete:hover,
.custom-dropdown-menu .dropdown-item.action-delete:focus {
  background: var(--color-danger-light);
  color: var(--color-danger) !important;
}

.custom-divider {
  border-top-color: var(--color-border);
  margin: 4px 0;
}
</style>
