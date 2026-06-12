<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../../components/layouts/header.vue";
import Footer from "../../components/layouts/footer.vue";
import { useNotificationStore } from "../../stores/NotificationStore";

const router = useRouter();
const notificationStore = useNotificationStore();

// Active filter state: 'all' | 'unread' | 'read' | 'reply' | 'like' | 'mention' | 'system'
const activeFilter = ref("all");
const searchQuery = ref("");

const filterTypes = [
  { value: "reply", label: "Replies", icon: "bi bi-chat-fill text-primary" },
  { value: "like", label: "Likes", icon: "bi bi-heart-fill text-danger" },
  { value: "mention", label: "Mentions", icon: "bi bi-at text-warning" },
  {
    value: "system",
    label: "System Updates",
    icon: "bi bi-shield-fill-check text-success",
  },
];

onMounted(async () => {
  await notificationStore.fetchNotifications();
});

// Computed notifications based on filter and search query
const filteredNotifications = computed(() => {
  let list = notificationStore.allNotifications;

  // Apply Status / Type filter
  if (activeFilter.value === "unread") {
    list = list.filter((n) => !n.read);
  } else if (activeFilter.value === "read") {
    list = list.filter((n) => n.read);
  } else if (
    ["reply", "like", "mention", "system"].includes(activeFilter.value)
  ) {
    list = list.filter((n) => n.type === activeFilter.value);
  }

  // Apply Search query (matches title or message content)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(query)) ||
        (n.message && n.message.toLowerCase().includes(query)) ||
        (n.sender &&
          n.sender.name &&
          n.sender.name.toLowerCase().includes(query)),
    );
  }

  return list;
});

// Filter category counter helpers
const getCount = (filterType) => {
  if (filterType === "all") return notificationStore.notifications.length;
  if (filterType === "unread") return notificationStore.unreadCount;
  if (filterType === "read")
    return notificationStore.notifications.filter((n) => n.read).length;
  return notificationStore.notifications.filter((n) => n.type === filterType)
    .length;
};

// Handlers
const handleNotificationClick = async (item) => {
  await notificationStore.markAsRead(item.id);
  if (item.link) {
    router.push(item.link);
  }
};

const handleToggleRead = async (e, item) => {
  e.stopPropagation(); // Avoid triggering full routing navigation
  if (item.read) {
    // Custom mock functionality: allow toggling back to unread inside the detailed view page
    const found = notificationStore.notifications.find((n) => n.id === item.id);
    if (found) found.read = false;
  } else {
    await notificationStore.markAsRead(item.id);
  }
};

const handleDeleteClick = async (e, id) => {
  e.stopPropagation();
  await notificationStore.deleteNotification(id);
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleClearAll = () => {
  if (
    confirm(
      "Are you sure you want to delete all notifications? This cannot be undone.",
    )
  ) {
    notificationStore.clearNotifications();
  }
};

const formatFullTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  <Navbar />

  <div class="container notifications-view-page py-4">
    <!-- Page Header Title -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-sm">
        <h2
          class="page-title fw-black m-0 text-adaptive d-flex align-items-center gap-3"
        >
          <i class="bi bi-bell-fill text-gradient"></i>
          <span>Notification Center</span>
        </h2>
        <p class="text-muted small m-0 mt-1">
          Manage, filter, and track all your school activity alerts.
        </p>
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
        <div class="sidebar-card shadow-sm p-3">
          <!-- Search Box -->
          <div class="search-box-wrap mb-4 position-relative">
            <i
              class="bi bi-search search-icon position-absolute text-muted"
            ></i>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control ps-5"
              placeholder="Search notifications..."
            />
          </div>

          <!-- Navigation Filters -->
          <h6
            class="sidebar-section-title text-muted text-uppercase fw-bold mb-3 px-2"
          >
            Filters
          </h6>
          <nav class="sidebar-nav d-flex flex-column gap-1">
            <button
              v-for="filter in ['all', 'unread', 'read']"
              :key="filter"
              @click="activeFilter = filter"
              class="filter-nav-btn text-start d-flex justify-content-between align-items-center"
              :class="{ active: activeFilter === filter }"
            >
              <span class="d-flex align-items-center gap-3 flex-shrink-0">
                <i
                  :class="[
                    filter === 'all'
                      ? 'bi bi-grid-fill'
                      : filter === 'unread'
                        ? 'bi bi-envelope-fill'
                        : 'bi bi-envelope-open-fill',
                  ]"
                ></i>
                <span class="text-capitalize">{{ filter }}</span>
              </span>
              <span class="sidebar-badge flex-shrink-0 ms-2">
                {{ getCount(filter) }}
              </span>
            </button>
          </nav>

          <hr class="my-4 border-slate" />

          <h6
            class="sidebar-section-title text-muted text-uppercase fw-bold mb-3 px-2"
          >
            Types
          </h6>
          <nav class="sidebar-nav d-flex flex-column gap-1">
            <button
              v-for="type in filterTypes"
              :key="type.value"
              @click="activeFilter = type.value"
              class="filter-nav-btn text-start d-flex justify-content-between align-items-center"
              :class="{ active: activeFilter === type.value }"
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
          <div
            v-if="notificationStore.loading"
            class="skeletons-wrapper d-flex flex-column gap-3"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="skeleton-card p-4 rounded-4 shadow-sm d-flex gap-4"
            >
              <div class="skeleton-avatar rounded-circle"></div>
              <div class="skeleton-body flex-grow-1 d-flex flex-column gap-3">
                <div class="skeleton-line-long"></div>
                <div class="skeleton-line-short"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="filteredNotifications.length === 0"
            class="empty-state-card text-center p-5 rounded-4 border shadow-sm d-flex flex-column align-items-center justify-content-center"
          >
            <div
              class="empty-icon-wrap mb-4 d-flex align-items-center justify-content-center rounded-circle"
            >
              <i class="bi bi-bell-slash"></i>
            </div>
            <h4 class="fw-black mb-2 text-adaptive">No Notifications Found</h4>
            <p class="text-muted small mb-4 max-width-p">
              We couldn't find any notifications matching the selected filter or
              search query.
            </p>
            <button
              @click="
                activeFilter = 'all';
                searchQuery = '';
              "
              class="btn btn-primary-gradient px-4 py-2 fw-bold shadow-sm rounded-pill"
            >
              Clear All Filters
            </button>
          </div>

          <!-- Notifications List Feed -->
          <div v-else class="notifications-feed-list d-flex flex-column gap-3">
            <div
              v-for="item in filteredNotifications"
              :key="item.id"
              @click="handleNotificationClick(item)"
              class="notification-card-item p-4 rounded-4 shadow-sm d-flex gap-4 align-items-start transition-all cursor-pointer border border-theme"
              :class="{ unread: !item.read }"
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
                />
                <div
                  v-else
                  class="fallback-icon-wrap rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style="width: 48px; height: 48px"
                >
                  <i class="bi bi-bell-fill text-muted"></i>
                </div>
                <!-- Badge Badge Icon -->
                <div
                  class="badge-icon-badge rounded-circle shadow-sm position-absolute d-flex align-items-center justify-content-center"
                >
                  <i :class="getNotificationIcon(item.type)"></i>
                </div>
              </div>

              <!-- Message Body Column -->
              <div class="body-wrap flex-grow-1 min-width-0">
                <div
                  class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-2"
                >
                  <h6
                    class="m-0 fw-black text-adaptive title-text text-truncate pe-sm-4"
                  >
                    {{ item.title }}
                  </h6>
                  <span class="time-text text-muted small text-nowrap">{{
                    formatFullTime(item.created_at || item.timestamp)
                  }}</span>
                </div>
                <p class="message-text text-muted m-0 pe-md-4 mb-3">
                  {{ item.message }}
                </p>
                <div class="action-bar d-flex gap-2">
                  <span
                    v-if="!item.read"
                    class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1-5 rounded-pill small fw-bold d-inline-flex align-items-center gap-2"
                  >
                    <span class="pulse-dot"></span>
                    <span>New Alert</span>
                  </span>
                  <span
                    v-else
                    class="badge bg-secondary-subtle text-muted border border-secondary-subtle px-3 py-1-5 rounded-pill small fw-bold"
                  >
                    Read
                  </span>
                  <span
                    :class="[
                      'badge text-uppercase type-badge px-3 py-1-5 rounded-pill small fw-bold',
                      `badge-type-${item.type}`,
                    ]"
                  >
                    {{ item.type }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons Column -->
              <div class="actions-wrap flex-shrink-0 d-flex gap-2" @click.stop>
                <!-- Toggle Read -->
                <button
                  @click="handleToggleRead($event, item)"
                  class="btn-circle-action btn border"
                  :title="item.read ? 'Mark as Unread' : 'Mark as Read'"
                >
                  <i
                    :class="[
                      item.read
                        ? 'bi bi-envelope-fill text-muted'
                        : 'bi bi-envelope-open-fill text-primary',
                    ]"
                  ></i>
                </button>
                <!-- Delete -->
                <button
                  @click="handleDeleteClick($event, item.id)"
                  class="btn-circle-action btn border btn-delete"
                  title="Delete Notification"
                >
                  <i class="bi bi-trash3-fill text-danger"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <Footer />
</template>

<style scoped>
.notifications-view-page {
  max-width: 1280px;
  margin: 40px auto 0 auto; /* Push page content down so it is not cut off by floating global header */
  padding-top: 24px;
  min-height: 85vh;
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.text-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Sidebar and Cards Styling */
.sidebar-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-slow);
}

.border-slate {
  border-color: var(--color-border);
}

.sidebar-section-title {
  font-size: 0.72rem;
  letter-spacing: 0.8px;
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
  font-weight: 700 !important;
  font-size: 0.9rem !important;
  border-radius: var(--radius-md) !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  transition: all var(--transition-base) !important;
}

.filter-nav-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.filter-nav-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.sidebar-badge {
  background: var(--color-surface-hover) !important;
  color: var(--color-text-muted) !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 2px 8px !important;
  border-radius: var(--radius-pill) !important;
  border: 1px solid var(--color-border) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 24px !important;
  height: 20px !important;
  line-height: 1 !important;
}

/* Active filter state badge should highlight beautifully! */
.filter-nav-btn.active .sidebar-badge {
  background: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
}

.bg-theme-subtle {
  background-color: var(--color-surface-hover) !important;
}

.border-theme {
  border-color: var(--color-border) !important;
}

/* modern search inputs */
.search-icon {
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.05rem;
}

.form-control {
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-weight: 500;
  transition: all var(--transition-base);
}

.form-control:focus {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

/* Action Buttons Header */
.btn-action-modern {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  transition: all var(--transition-base);
}

.btn-action-modern:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-primary);
}

.btn-clear-all:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-primary-gradient {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-purple) 100%
  );
  color: white;
  border: none;
  transition: all var(--transition-base);
}

.btn-primary-gradient:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-primary-light);
}

/* Notifications feed items */
.notification-card-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.notification-card-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md) !important;
  border-color: var(--color-primary) !important;
}

.notification-card-item.unread {
  background: var(--color-primary-light);
  border-color: rgba(99, 102, 241, 0.25) !important;
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
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  font-size: 10px;
}

.title-text {
  font-size: 1.05rem;
}

.message-text {
  font-size: 0.92rem;
  line-height: 1.5;
}

.time-text {
  font-size: 0.8rem;
}

.py-1-5 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

/* Toggle unread pulse */
.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(99, 102, 241, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

/* Feed item circle button actions */
.btn-circle-action {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-surface);
  border-color: var(--color-border) !important;
  color: var(--color-text-muted);
  transition: all var(--transition-base);
}

.btn-circle-action:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary) !important;
  color: var(--color-primary);
}

.btn-delete:hover {
  border-color: var(--color-danger) !important;
  color: var(--color-danger);
}

/* Empty State Card */
.empty-state-card {
  background: var(--color-surface);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-border) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-long {
  width: 70%;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-border) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

.skeleton-line-short {
  width: 40%;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-border) 50%,
    var(--color-surface-hover) 75%
  );
  background-size: 200% 100%;
  animation: pulse-glow 1.5s infinite;
}

@keyframes pulse-glow {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.actions-wrap {
  align-self: center; /* Vertically center action buttons inside card on desktop */
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
  background: rgba(99, 102, 241, 0.08) !important;
  color: var(--color-primary, #6366f1) !important;
  border: 1px solid rgba(99, 102, 241, 0.2) !important;
}

.badge-type-like {
  background: rgba(239, 68, 68, 0.08) !important;
  color: var(--color-danger, #ef4444) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.badge-type-mention {
  background: rgba(245, 158, 11, 0.08) !important;
  color: var(--color-warning, #f59e0b) !important;
  border: 1px solid rgba(245, 158, 11, 0.2) !important;
}

.badge-type-system {
  background: rgba(16, 185, 129, 0.08) !important;
  color: var(--color-success, #10b981) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
}
</style>
