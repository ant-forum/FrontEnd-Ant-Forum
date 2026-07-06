<template>
  <div class="admin-dashboard-layout d-flex min-vh-100">
    <AdminSidebar />

    <main class="admin-main flex-grow-1">
      <AdminTopbar current-title="Overview" />

      <div class="admin-content-wrapper">
        <header class="admin-hero mb-4">
          <div>
            <p class="section-kicker mb-2">Admin Overview</p>
            <h1 class="fw-bold text-adaptive mb-2">ANT Forum Control Center</h1>
            <p class="text-muted mb-0">
              Track review queues, publishing activity, and forum moderation
              from one control center.
            </p>
          </div>

          <!-- <div class="admin-hero-actions">
            <router-link class="btn btn-primary action-btn" to="/admin/projects">
              <i class="bi bi-folder2-open"></i>
              <span>View Projects</span>
            </router-link>
          </div> -->
        </header>

        <section class="row g-3 mb-4">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="col-sm-6 col-xl-3"
          >
            <StatCard
              :label="metric.label"
              :value="metric.value"
              :description="metric.description"
              :description-icon="metric.descriptionIcon"
              :description-color-class="metric.descriptionColorClass"
              :icon="metric.icon"
              :icon-bg-class="metric.iconBgClass"
              :icon-color-class="metric.iconColorClass"
              :animate="false"
            />
          </div>
        </section>

        <section class="row g-4">
          <div class="col-xl-8">
            <div class="card border-0 shadow-sm dashboard-panel mb-4">
              <div class="panel-header">
                <div>
                  <h5 class="fw-bold text-adaptive mb-1">
                    {{ selectedPeriod }} Activity
                  </h5>
                  <p class="text-muted small mb-0">
                    Compare forum activity across the selected period
                  </p>
                </div>
                <div
                  class="btn-group btn-group-sm period-tabs"
                  role="group"
                  aria-label="Activity period"
                >
                  <button
                    v-for="period in periods"
                    :key="period"
                    type="button"
                    :class="[
                      'btn',
                      selectedPeriod === period ? 'btn-primary' : 'btn-light',
                    ]"
                    @click="selectedPeriod = period"
                  >
                    {{ period }}
                  </button>
                </div>
              </div>

              <div class="activity-summary">
                <article
                  v-for="item in activityTotals"
                  :key="item.key"
                  class="activity-total"
                >
                  <span :class="['legend-dot', item.key]"></span>
                  <div>
                    <small>{{ item.label }}</small>
                    <strong>{{ item.value }}</strong>
                  </div>
                </article>
              </div>

              <div
                class="activity-chart"
                :aria-label="`${selectedPeriod} activity chart`"
              >
                <div class="chart-scale" aria-hidden="true">
                  <span v-for="tick in chartScale" :key="tick">{{ tick }}</span>
                </div>

                <div class="chart-stage">
                  <div class="chart-grid" aria-hidden="true">
                    <span v-for="tick in chartScale" :key="tick"></span>
                  </div>

                  <div
                    class="bar-groups"
                    :style="{
                      gridTemplateColumns: `repeat(${chartData.length}, minmax(54px, 1fr))`,
                    }"
                  >
                    <div
                      v-for="item in chartData"
                      :key="item.day"
                      class="bar-group"
                    >
                      <div class="bar-stack">
                        <span
                          v-for="series in activitySeries"
                          :key="series.key"
                          :class="['activity-bar', series.key]"
                          :style="{ height: `${barHeight(item[series.key])}%` }"
                          :aria-label="`${item.day}: ${item[series.key]} ${series.label}`"
                          role="img"
                        >
                          <small>{{ item[series.key] }}</small>
                        </span>
                      </div>
                      <strong>{{ item.day }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="chart-legend">
                <span v-for="series in activitySeries" :key="series.key">
                  <i :class="['legend-dot', series.key]"></i>{{ series.label }}
                </span>
              </div>
            </div>

            <div class="card border-0 shadow-sm dashboard-panel">
              <div class="panel-header">
                <div>
                  <h5 class="fw-bold text-adaptive mb-1">Moderation Queue</h5>
                  <p class="text-muted small mb-0">
                    Items that need admin review
                  </p>
                </div>
                <router-link
                  class="btn btn-light btn-sm border"
                  to="/admin/reports"
                >
                  <i class="bi bi-arrow-up-right"></i>
                </router-link>
              </div>

              <div class="table-responsive">
                <table class="table align-middle admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Owner</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in queueItems" :key="item.id">
                      <td>
                        <div class="d-flex align-items-center gap-3">
                          <span :class="['queue-icon', item.iconClass]">
                            <i :class="['bi', item.icon]"></i>
                          </span>
                          <div>
                            <p class="fw-bold text-adaptive mb-0">
                              {{ item.title }}
                            </p>
                            <small class="text-muted">{{ item.type }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="text-muted small">{{ item.owner }}</td>
                      <td class="text-end">
                        <router-link
                          class="btn btn-light btn-sm border"
                          :to="item.to"
                        >
                          Review
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-xl-4">
            <div class="card border-0 shadow-sm dashboard-panel mb-4">
              <div class="panel-header">
                <div>
                  <h5 class="fw-bold text-adaptive mb-1">Quick Actions</h5>
                  <p class="text-muted small mb-0">Common admin tasks</p>
                </div>
              </div>

              <div class="quick-action-list">
                <router-link
                  v-for="action in quickActions"
                  :key="action.label"
                  :to="action.to"
                  class="quick-action"
                >
                  <span :class="['quick-action-icon', action.colorClass]">
                    <i :class="['bi', action.icon]"></i>
                  </span>
                  <span>
                    <strong>{{ action.label }}</strong>
                    <small>{{ action.description }}</small>
                  </span>
                  <i class="bi bi-chevron-right ms-auto"></i>
                </router-link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AdminSidebar from "../../components/admin/AdminSidebar.vue";
import AdminTopbar from "../../components/admin/AdminTopbar.vue";
import StatCard from "../../components/admin/StatCard.vue";
import { useAdminOperationsStore } from "../../stores/AdminOperationsStore";
import { useProjectStore } from "../../stores/ProjectStore";
import { useReportStore } from "../../stores/ReportStore";
import { useForumStore } from "../../stores/ForumStore";
import { useBlogStore } from "../../stores/BlogStore";

const adminStore = useAdminOperationsStore();
const projectStore = useProjectStore();
const reportStore = useReportStore();
const forumStore = useForumStore();
const blogStore = useBlogStore();
const selectedPeriod = ref("Week");
const periods = ["Day", "Week", "Month"];

onMounted(() => {
  projectStore.fetchProjects().catch(() => {});
  reportStore.fetchAllReports().catch(() => {});
  forumStore.fetchDiscussions().catch(() => {});
  blogStore.fetchBlogs().catch(() => {});
});

const metrics = computed(() => {
  const pendingCount = projectStore.projects.filter(
    (p) => String(p.status || "").toLowerCase() === "in review",
  ).length;
  return [
    {
      label: "Admin Actions",
      value: adminStore.activityLog.length,
      description: "Recorded locally",
      descriptionIcon: "bi-activity",
      descriptionColorClass: "text-muted",
      icon: "bi bi-activity",
      iconBgClass: "bg-blue-light",
      iconColorClass: "text-blue",
    },
    {
      label: "Projects",
      value: projectStore.projects.length,
      description: `${pendingCount} pending review`,
      descriptionIcon: "bi-folder-check",
      descriptionColorClass: "text-warning",
      icon: "bi bi-folder2-open",
      iconBgClass: "bg-orange-light",
      iconColorClass: "text-orange",
    },
    {
      label: "Moderated Threads",
      value: reportStore.threadReports.length,
      description: `${reportStore.lockedThreads.length} currently locked`,
      descriptionIcon: "bi-chat-dots",
      descriptionColorClass: "text-success",
      icon: "bi bi-chat-square-text",
      iconBgClass: "bg-teal-light",
      iconColorClass: "text-teal",
    },
    {
      label: "Reports",
      value: reportStore.pendingReports.length,
      description: `${reportStore.resolvedReports.length} resolved`,
      descriptionIcon: "bi-check2-circle",
      descriptionColorClass: "text-success",
      icon: "bi bi-flag",
      iconBgClass: "bg-red-light",
      iconColorClass: "text-red",
    },
  ];
});

const chartSets = computed(() => {
  const sets = {};

  const dayLabels = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthLabels = ["W1", "W2", "W3", "W4"];

  const dayData = dayLabels.map((day) => ({ day, discussions: 0, projects: 0, blogs: 0 }));
  const weekData = weekLabels.map((day) => ({ day, discussions: 0, projects: 0, blogs: 0 }));
  const monthData = monthLabels.map((day) => ({ day, discussions: 0, projects: 0, blogs: 0 }));

  const dayIndexMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const sixDaysAgo = new Date(currentYear, currentMonth, currentDate - 6);
  sixDaysAgo.setHours(0, 0, 0, 0);

  const getIndices = (rawDate) => {
    if (!rawDate) return { dIdx: null, wIdx: null, mIdx: null };
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return { dIdx: null, wIdx: null, mIdx: null };
    
    let dIdx = null;
    let wIdx = null;
    let mIdx = null;

    const dateNum = d.getDate();
    mIdx = 3;
    if (dateNum <= 7) mIdx = 0;
    else if (dateNum <= 14) mIdx = 1;
    else if (dateNum <= 21) mIdx = 2;

    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && dateNum === currentDate) {
      const h = d.getHours();
      dIdx = 5;
      if (h < 10) dIdx = 0;
      else if (h < 12) dIdx = 1;
      else if (h < 14) dIdx = 2;
      else if (h < 16) dIdx = 3;
      else if (h < 18) dIdx = 4;
    }

    if (d >= sixDaysAgo) {
      wIdx = dayIndexMap[d.getDay()];
    }

    return { dIdx, wIdx, mIdx };
  };

  forumStore.discussions.forEach((d) => {
    const rawDate = d.createdAt || d.created_at || d.timestamp;
    const { dIdx, wIdx, mIdx } = getIndices(rawDate);
    
    const increment = (targetData, idx) => {
      if (idx !== null) {
        targetData[idx].discussions += 1;
      }
    };

    increment(dayData, dIdx);
    increment(weekData, wIdx);
    increment(monthData, mIdx);
  });

  projectStore.projects.forEach((p) => {
    const rawDate = p.createdAt || p.created_at || p.timestamp;
    const { dIdx, wIdx, mIdx } = getIndices(rawDate);

    if (dIdx !== null) dayData[dIdx].projects += 1;
    if (wIdx !== null) weekData[wIdx].projects += 1;
    if (mIdx !== null) monthData[mIdx].projects += 1;
  });

  blogStore.blogs.forEach((b) => {
    const rawDate = b.createdAt || b.created_at || b.timestamp || b.publishedAt || b.published_at || b.date;
    const { dIdx, wIdx, mIdx } = getIndices(rawDate);

    if (dIdx !== null) dayData[dIdx].blogs += 1;
    if (wIdx !== null) weekData[wIdx].blogs += 1;
    if (mIdx !== null) monthData[mIdx].blogs += 1;
  });

  sets.Day = dayData;
  sets.Week = weekData;
  sets.Month = monthData;
  return sets;
});

const chartData = computed(() => chartSets.value[selectedPeriod.value]);

const activitySeries = [
  { key: "discussions", label: "Discussions" },
  { key: "projects", label: "Projects" },
  { key: "blogs", label: "Blogs" },
];

const activityTotals = computed(() =>
  activitySeries.map((series) => ({
    ...series,
    value: chartData.value.reduce((sum, item) => sum + item[series.key], 0),
  })),
);

const chartMaximum = computed(() => {
  const values = chartData.value.flatMap((item) =>
    activitySeries.map((series) => item[series.key]),
  );
  return Math.max(40, Math.ceil(Math.max(...values) / 40) * 40);
});

const chartScale = computed(() => [
  chartMaximum.value,
  chartMaximum.value * 0.75,
  chartMaximum.value * 0.5,
  chartMaximum.value * 0.25,
  0,
]);

const barHeight = (value) => Math.max(4, (value / chartMaximum.value) * 100);

const queueItems = computed(() =>
  [
    ...reportStore.pendingReports.slice(0, 2).map((item) => ({
      id: `report-${item.id}`,
      title: item.title,
      type: "Reported thread",
      owner: item.author,
      status: item.priority,
      statusClass: item.priority === "High" ? "danger" : "warning",
      icon: "bi-chat-left-text",
      iconClass: "danger",
      to: "/admin/reports",
    })),
    ...projectStore.projects
      .filter((p) => String(p.status || "").toLowerCase() === "in review")
      .slice(0, 2)
      .map((item) => ({
        id: `project-${item.id}`,
        title: item.title || "Untitled Project",
        type: "Project approval",
        owner: item.author?.name || "Unknown",
        status: "Pending",
        statusClass: "warning",
        icon: "bi-folder2",
        iconClass: "warning",
        to: "/admin/projects",
      })),
  ].slice(0, 4),
);

const quickActions = [
  {
    label: "Create User",
    description: "Add a new student or admin",
    icon: "bi-person-plus",
    colorClass: "blue",
    to: "/admin/users/create",
  },
  {
    label: "Review Reports",
    description: "Resolve flagged discussions",
    icon: "bi-flag",
    colorClass: "teal",
    to: "/admin/reports",
  },
  {
    label: "Edit Categories",
    description: "Organize content sections",
    icon: "bi-grid",
    colorClass: "orange",
    to: "/admin/categories",
  },
];

const healthItems = computed(() => [
  { label: "API Response", value: 94, colorClass: "bg-success" },
  { label: "Storage Usage", value: 68, colorClass: "bg-warning" },
  {
    label: "Moderation Load",
    value: Math.min(100, reportStore.pendingReports.length * 20),
    colorClass: "bg-info",
  },
]);
</script>

<style scoped>
.admin-dashboard-layout {
  min-height: 100vh;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-family-base);
}

.admin-main {
  background: transparent;
  min-width: 0;
}

.admin-content-wrapper {
  max-width: 1320px;
  padding: 28px 28px 48px;
}

.admin-hero,
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.admin-hero {
  padding: 0.25rem 0 0;
}

.section-kicker {
  color: var(--color-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-hero-actions,
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-hero-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-btn {
  min-height: 40px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
}

.dashboard-panel {
  padding: 1.25rem;
  border-radius: var(--radius-md) !important;
}

.period-tabs {
  padding: 0.2rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.period-tabs .btn {
  border: 0;
  border-radius: 7px;
  min-width: 56px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.period-tabs .btn-primary {
  background: var(--color-surface) !important;
  color: var(--color-primary) !important;
  box-shadow: var(--shadow-sm);
}

.activity-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.activity-total {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.75rem 0.85rem;
  background: color-mix(in srgb, var(--color-surface-hover) 78%, transparent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.activity-total div,
.activity-total small,
.activity-total strong {
  display: block;
}

.activity-total small {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.activity-total strong {
  margin-top: 0.05rem;
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1;
}

.activity-chart {
  display: grid;
  grid-template-columns: 32px minmax(560px, 1fr);
  gap: 0.7rem;
  height: 266px;
  margin-top: 1rem;
  padding: 1rem 1.1rem 0.75rem 0.8rem;
  overflow-x: auto;
  background: color-mix(in srgb, var(--color-input-bg) 88%, transparent);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.chart-scale {
  height: 212px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 24px;
  color: var(--color-text-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-align: right;
}

.chart-stage {
  min-width: 560px;
  height: 212px;
  position: relative;
}

.chart-grid {
  position: absolute;
  inset: 0 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-grid span {
  display: block;
  width: 100%;
  border-top: 1px dashed var(--color-border);
}

.bar-groups {
  height: 100%;
  display: grid;
  gap: 0.6rem;
  position: relative;
}

.bar-group {
  min-width: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 24px;
  gap: 0.45rem;
}

.bar-group > strong {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  text-align: center;
}

.bar-stack {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.3rem;
}

.activity-bar {
  width: clamp(8px, 18%, 16px);
  min-height: 4px;
  position: relative;
  border-radius: 4px 4px 2px 2px;
  opacity: 0.88;
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.activity-bar:hover {
  z-index: 1;
  opacity: 1;
  transform: scaleX(1.12);
}

.activity-bar small {
  position: absolute;
  bottom: calc(100% + 0.3rem);
  left: 50%;
  padding: 0.15rem 0.32rem;
  color: var(--color-text);
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
  pointer-events: none;
  opacity: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity var(--transition-base);
}

.activity-bar:hover small {
  opacity: 1;
}

.activity-bar.discussions,
.legend-dot.discussions {
  background: var(--color-primary);
}


.activity-bar.projects,
.legend-dot.projects {
  background: var(--color-warning);
}

.activity-bar.blogs,
.legend-dot.blogs {
  background: #9b59b6;
}

.chart-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-pill);
}

.admin-table {
  color: var(--color-text);
}

.admin-table th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-color: var(--color-border);
}

.admin-table td {
  border-color: var(--color-border);
}

.queue-icon,
.quick-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
}

.queue-icon {
  width: 42px;
  height: 42px;
}

.queue-icon.danger,
.status-pill.danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.queue-icon.warning,
.status-pill.warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.queue-icon.info,
.status-pill.info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.7rem;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
}

.quick-action-list,
.health-list {
  display: grid;
  gap: 0.75rem;
}

.quick-action {
  min-height: 68px;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  color: var(--color-text);
  text-decoration: none;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.quick-action:hover {
  color: var(--color-primary);
  border-color: rgba(84, 131, 179, 0.28);
}

.quick-action strong,
.quick-action small {
  display: block;
}

.quick-action small {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.quick-action-icon {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.quick-action-icon.blue {
  color: var(--color-blue);
  background: var(--color-blue-light);
}

.quick-action-icon.teal {
  color: var(--color-success);
  background: var(--color-success-light);
}

.quick-action-icon.orange {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.quick-action-icon.blue {
  color: var(--color-info);
  background: var(--color-info-light);
}

.health-item {
  padding: 0.8rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.health-progress {
  height: 8px;
  background-color: var(--color-border-soft);
  border-radius: var(--radius-pill);
}

.text-adaptive {
  color: var(--color-text) !important;
}

@media (max-width: 991.98px) {
  .admin-dashboard-layout {
    display: block !important;
  }

  .admin-hero,
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-hero-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 575.98px) {
  .activity-summary {
    grid-template-columns: 1fr;
  }

  .activity-chart {
    height: 250px;
  }

  .admin-hero,
  .dashboard-panel {
    padding: 1rem;
  }
}
</style>
