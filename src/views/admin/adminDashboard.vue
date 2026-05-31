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
              Track users, projects, blog content, and forum moderation from one clean sample dashboard.
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
          <div v-for="metric in metrics" :key="metric.label" class="col-sm-6 col-xl-3">
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
                  <h5 class="fw-bold text-adaptive mb-1">Weekly Activity</h5>
                  <p class="text-muted small mb-0">Sample data for discussions, replies, and projects</p>
                </div>
                <div class="btn-group btn-group-sm period-tabs" role="group" aria-label="Activity period">
                  <button
                    v-for="period in periods"
                    :key="period"
                    type="button"
                    :class="['btn', selectedPeriod === period ? 'btn-primary' : 'btn-light']"
                    @click="selectedPeriod = period"
                  >
                    {{ period }}
                  </button>
                </div>
              </div>

              <div class="activity-chart" aria-label="Weekly activity chart">
                <svg class="activity-svg" viewBox="0 0 680 260" role="img" aria-label="Activity trend">
                  <g class="grid-lines">
                    <line v-for="line in chartGrid" :key="line" x1="32" x2="652" :y1="line" :y2="line"></line>
                  </g>

                  <g v-for="series in chartSeries" :key="series.key" :class="['series', series.key]">
                    <polyline :points="series.points"></polyline>
                    <circle
                      v-for="dot in series.dots"
                      :key="`${series.key}-${dot.day}`"
                      :cx="dot.x"
                      :cy="dot.y"
                      r="4"
                    ></circle>
                  </g>
                </svg>

                <div class="chart-axis" :style="{ gridTemplateColumns: `repeat(${chartData.length}, 1fr)` }" aria-hidden="true">
                  <span v-for="item in chartData" :key="item.day">{{ item.day }}</span>
                </div>
              </div>

              <div class="chart-legend">
                <span><i class="legend-dot discussions"></i>Discussions</span>
                <span><i class="legend-dot replies"></i>Replies</span>
                <span><i class="legend-dot projects"></i>Projects</span>
              </div>
            </div>

            <div class="card border-0 shadow-sm dashboard-panel">
              <div class="panel-header">
                <div>
                  <h5 class="fw-bold text-adaptive mb-1">Moderation Queue</h5>
                  <p class="text-muted small mb-0">Items that need admin review</p>
                </div>
                <router-link class="btn btn-light btn-sm border" to="/admin/threads">
                  <i class="bi bi-arrow-up-right"></i>
                </router-link>
              </div>

              <div class="table-responsive">
                <table class="table align-middle admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Owner</th>
                      <th>Status</th>
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
                            <p class="fw-bold text-adaptive mb-0">{{ item.title }}</p>
                            <small class="text-muted">{{ item.type }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="text-muted small">{{ item.owner }}</td>
                      <td>
                        <span :class="['status-pill', item.statusClass]">{{ item.status }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-light btn-sm border" type="button" @click="toast.info(`Review ${item.title}`)">
                          Review
                        </button>
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

            <div class="card border-0 shadow-sm dashboard-panel">
              <div class="panel-header">
                <div>
                  <h5 class="fw-bold text-adaptive mb-1">System Health</h5>
                  <p class="text-muted small mb-0">Simple admin sample status</p>
                </div>
              </div>

              <div class="health-list">
                <div v-for="item in healthItems" :key="item.label" class="health-item">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-adaptive small">{{ item.label }}</span>
                    <span class="text-muted small">{{ item.value }}%</span>
                  </div>
                  <div class="progress health-progress">
                    <div
                      :class="['progress-bar', item.colorClass]"
                      :style="{ width: `${item.value}%` }"
                      role="progressbar"
                      :aria-valuenow="item.value"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import AdminTopbar from '../../components/admin/AdminTopbar.vue';
import StatCard from '../../components/admin/StatCard.vue';
import { useToast } from '../../composables/useToast.js';

const toast = useToast();

const selectedPeriod = ref('Week');
const periods = ['Day', 'Week', 'Month'];

const metrics = [
  {
    label: 'Total Users',
    value: 1284,
    description: '+12% this month',
    descriptionIcon: 'bi-arrow-up-right',
    descriptionColorClass: 'text-success',
    icon: 'bi bi-people',
    iconBgClass: 'bg-purple-light',
    iconColorClass: 'text-purple',
  },
  {
    label: 'Projects',
    value: 64,
    description: '8 pending review',
    descriptionIcon: 'bi-folder-check',
    descriptionColorClass: 'text-warning',
    icon: 'bi bi-folder2-open',
    iconBgClass: 'bg-orange-light',
    iconColorClass: 'text-orange',
  },
  {
    label: 'Threads',
    value: 348,
    description: '23 new today',
    descriptionIcon: 'bi-chat-dots',
    descriptionColorClass: 'text-success',
    icon: 'bi bi-chat-square-text',
    iconBgClass: 'bg-teal-light',
    iconColorClass: 'text-teal',
  },
  {
    label: 'Reports',
    value: 12,
    description: 'Needs action',
    descriptionIcon: 'bi-exclamation-triangle',
    descriptionColorClass: 'text-danger',
    icon: 'bi bi-flag',
    iconBgClass: 'bg-red-light',
    iconColorClass: 'text-red',
  },
];

const chartSets = {
  Day: [
    { day: '8AM', discussions: 24, replies: 36, projects: 18 },
    { day: '10AM', discussions: 44, replies: 52, projects: 26 },
    { day: '12PM', discussions: 62, replies: 70, projects: 34 },
    { day: '2PM', discussions: 74, replies: 82, projects: 42 },
    { day: '4PM', discussions: 58, replies: 64, projects: 30 },
    { day: '6PM', discussions: 42, replies: 50, projects: 24 },
  ],
  Week: [
    { day: 'Mon', discussions: 42, replies: 66, projects: 28 },
    { day: 'Tue', discussions: 54, replies: 72, projects: 34 },
    { day: 'Wed', discussions: 68, replies: 84, projects: 48 },
    { day: 'Thu', discussions: 76, replies: 90, projects: 56 },
    { day: 'Fri', discussions: 62, replies: 78, projects: 42 },
    { day: 'Sat', discussions: 46, replies: 58, projects: 32 },
    { day: 'Sun', discussions: 36, replies: 48, projects: 24 },
  ],
  Month: [
    { day: 'W1', discussions: 52, replies: 64, projects: 36 },
    { day: 'W2', discussions: 76, replies: 88, projects: 52 },
    { day: 'W3', discussions: 68, replies: 74, projects: 46 },
    { day: 'W4', discussions: 82, replies: 94, projects: 58 },
  ],
};

const chartData = computed(() => chartSets[selectedPeriod.value]);

const chartGrid = [36, 82, 128, 174, 220];

const seriesMeta = [
  { key: 'discussions' },
  { key: 'replies' },
  { key: 'projects' },
];

const chartSeries = computed(() => {
  const width = 620;
  const left = 32;
  const top = 24;
  const height = 204;
  const items = chartData.value;
  const divisor = Math.max(items.length - 1, 1);

  return seriesMeta.map((series) => {
    const dots = items.map((item, index) => {
      const x = left + (width / divisor) * index;
      const y = top + height - (height * item[series.key]) / 100;

      return {
        day: item.day,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
      };
    });

    return {
      ...series,
      dots,
      points: dots.map((dot) => `${dot.x},${dot.y}`).join(' '),
    };
  });
});

const queueItems = [
  {
    id: 1,
    title: 'Vue router guard issue',
    type: 'Flagged thread',
    owner: 'Dara Kim',
    status: 'Flagged',
    statusClass: 'danger',
    icon: 'bi-chat-left-text',
    iconClass: 'danger',
  },
  {
    id: 2,
    title: 'Portfolio showcase upload',
    type: 'Project approval',
    owner: 'Sophea V.',
    status: 'Pending',
    statusClass: 'warning',
    icon: 'bi-folder2',
    iconClass: 'warning',
  },
  {
    id: 3,
    title: 'ANT weekly release notes',
    type: 'Blog review',
    owner: 'Admin Team',
    status: 'Draft',
    statusClass: 'info',
    icon: 'bi-file-earmark-post',
    iconClass: 'info',
  },
];

const quickActions = [
  {
    label: 'Create User',
    description: 'Add a new student or admin',
    icon: 'bi-person-plus',
    colorClass: 'purple',
    to: '/admin/users/create',
  },
  {
    label: 'Manage Threads',
    description: 'Moderate forum discussions',
    icon: 'bi-chat-dots',
    colorClass: 'teal',
    to: '/admin/threads',
  },
  {
    label: 'Edit Categories',
    description: 'Organize content sections',
    icon: 'bi-grid',
    colorClass: 'orange',
    to: '/admin/categories',
  },
  {
    label: 'View Analytics',
    description: 'Check platform reports',
    icon: 'bi-bar-chart',
    colorClass: 'blue',
    to: '/admin/analytics',
  },
];

const healthItems = [
  { label: 'API Response', value: 94, colorClass: 'bg-success' },
  { label: 'Storage Usage', value: 68, colorClass: 'bg-warning' },
  { label: 'Moderation Load', value: 42, colorClass: 'bg-info' },
];
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

.activity-chart {
  height: 324px;
  margin-top: 1.5rem;
  padding: 1rem 1.1rem 0.9rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.activity-svg {
  width: 100%;
  min-width: 560px;
  height: 250px;
  display: block;
}

.grid-lines line {
  stroke: var(--color-border);
  stroke-width: 1;
  opacity: 0.75;
}

.series polyline {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.series circle {
  fill: var(--color-surface);
  stroke-width: 3;
}

.series.discussions polyline,
.series.discussions circle {
  stroke: var(--color-primary);
}

.series.replies polyline,
.series.replies circle {
  stroke: var(--color-success);
}

.series.projects polyline,
.series.projects circle {
  stroke: var(--color-warning);
}

.chart-axis {
  min-width: 560px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  padding: 0 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
}

.legend-dot.discussions {
  background: var(--color-primary);
}

.legend-dot.replies {
  background: var(--color-success);
}

.legend-dot.projects {
  background: var(--color-warning);
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
  border-color: rgba(99, 102, 241, 0.28);
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

.quick-action-icon.purple {
  color: var(--color-purple);
  background: var(--color-purple-light);
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
  .activity-chart {
    height: 292px;
  }

  .admin-hero,
  .dashboard-panel {
    padding: 1rem;
  }
}
</style>
