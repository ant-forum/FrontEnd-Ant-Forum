<template>
  <AdminPageShell
    title="Activity Log"
    kicker="Admin Audit"
    subtitle="Track recent admin actions, moderation decisions, project reviews, and settings changes."
    :metrics="metrics"
  >
    <section class="activity-panel">
      <div class="activity-toolbar">
        <div>
          <h2>Recent Activity</h2>
          <p>Simple local audit history from the admin store.</p>
        </div>

        <div class="toolbar-controls">
          <label class="search-box">
            <i class="bi bi-search"></i>
            <input
              v-model.trim="searchText"
              type="search"
              placeholder="Search activity"
            />
          </label>

          <select v-model="typeFilter" class="form-select compact-select">
            <option value="all">All types</option>
            <option value="moderation">Moderation</option>
            <option value="project">Project</option>
            <option value="settings">Settings</option>
            <option value="profile">Profile</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      <div class="activity-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="{ active: typeFilter === tab.value }"
          @click="typeFilter = tab.value"
        >
          <span>{{ tab.label }}</span>
          <small>{{ tab.count }}</small>
        </button>
      </div>

      <div v-if="filteredActivities.length" class="activity-list">
        <article
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-item"
        >
          <span :class="['activity-icon', activity.type]">
            <i :class="['bi', iconFor(activity.type)]"></i>
          </span>

          <div class="activity-content">
            <div class="activity-title-row">
              <strong>{{ activity.action }}</strong>
              <span>{{ formatDate(activity.createdAt) }}</span>
            </div>
            <p>{{ activity.target }}</p>
            <small>{{ labelFor(activity.type) }}</small>
          </div>
        </article>
      </div>

      <div v-else class="empty-activity">
        <i class="bi bi-clock-history"></i>
        <strong>No activity found</strong>
        <span>Try another search or filter.</span>
        <button
          class="btn btn-light btn-sm border"
          type="button"
          @click="clearFilter"
        >
          Clear Filter
        </button>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref } from "vue";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import { useAdminOperationsStore } from "../../stores/AdminOperationsStore";

const adminStore = useAdminOperationsStore();

const searchText = ref("");
const typeFilter = ref("all");

const activities = computed(() => adminStore.activityLog);

const filteredActivities = computed(() => {
  const text = searchText.value.toLowerCase();

  return activities.value.filter((item) => {
    const matchType =
      typeFilter.value === "all" || item.type === typeFilter.value;
    const matchText =
      !text ||
      item.action.toLowerCase().includes(text) ||
      item.target.toLowerCase().includes(text) ||
      item.type.toLowerCase().includes(text);

    return matchType && matchText;
  });
});

const tabs = computed(() => [
  { label: "All", value: "all", count: activities.value.length },
  {
    label: "Moderation",
    value: "moderation",
    count: countByType("moderation"),
  },
  { label: "Projects", value: "project", count: countByType("project") },
  { label: "Settings", value: "settings", count: countByType("settings") },
]);

const metrics = computed(() => [
  {
    label: "Total Actions",
    value: String(activities.value.length),
    change: "Saved locally",
    icon: "bi-clock-history",
    className: "blue",
  },
  {
    label: "Moderation",
    value: String(countByType("moderation")),
    change: "Reports and threads",
    icon: "bi-flag",
    className: "orange",
  },
  {
    label: "Projects",
    value: String(countByType("project")),
    change: "Review decisions",
    icon: "bi-folder-check",
    className: "green",
  },
  {
    label: "Settings",
    value: String(countByType("settings")),
    change: "Forum changes",
    icon: "bi-gear",
    className: "blue",
  },
]);

function countByType(type) {
  return activities.value.filter((item) => item.type === type).length;
}

function iconFor(type) {
  if (type === "moderation") return "bi-flag";
  if (type === "project") return "bi-folder-check";
  if (type === "settings") return "bi-gear";
  if (type === "profile") return "bi-person-badge";
  if (type === "security") return "bi-shield-lock";
  return "bi-clock-history";
}

function labelFor(type) {
  if (type === "moderation") return "Moderation action";
  if (type === "project") return "Project review";
  if (type === "settings") return "Settings update";
  if (type === "profile") return "Profile update";
  if (type === "security") return "Security update";
  return "Admin action";
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function clearFilter() {
  searchText.value = "";
  typeFilter.value = "all";
}
</script>

<style scoped>
.activity-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
}

.activity-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.activity-toolbar h2 {
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.activity-toolbar p {
  color: var(--color-text-muted);
  margin-bottom: 0;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 250px;
  padding: 0.55rem 0.75rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.search-box input {
  width: 100%;
  color: var(--color-text);
  background: transparent;
  border: 0;
  outline: none;
}

.compact-select {
  width: 160px;
}

.activity-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.activity-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-weight: 700;
}

.activity-tabs button.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-color: color-mix(
    in srgb,
    var(--color-primary) 35%,
    var(--color-border)
  );
}

.activity-tabs small {
  min-width: 22px;
  padding: 0.1rem 0.4rem;
  color: var(--color-text);
  background: var(--color-surface);
  border-radius: 999px;
  text-align: center;
}

.activity-list {
  display: grid;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.9rem;
  padding: 1rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.activity-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  flex-shrink: 0;
}

.activity-icon.moderation {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.activity-icon.project {
  color: var(--color-success);
  background: var(--color-success-light);
}

.activity-icon.settings,
.activity-icon.security {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.activity-content {
  width: 100%;
}

.activity-title-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.activity-title-row strong {
  color: var(--color-text);
}

.activity-title-row span,
.activity-content small {
  color: var(--color-text-muted);
}

.activity-content p {
  color: var(--color-text);
  margin: 0.2rem 0;
}

.empty-activity {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-activity i {
  color: var(--color-primary);
  font-size: 2rem;
}

.empty-activity strong {
  color: var(--color-text);
}

@media (max-width: 767.98px) {
  .activity-toolbar,
  .toolbar-controls,
  .activity-title-row {
    flex-direction: column;
  }

  .search-box,
  .compact-select {
    width: 100%;
    min-width: 0;
  }
}
</style>
