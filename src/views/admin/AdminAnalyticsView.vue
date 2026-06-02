<template>
  <AdminPageShell
    title="Analytics"
    kicker="System Analytics"
    subtitle="Understand forum activity, review queues, and moderation workload from one operational view."
    :metrics="metrics"
  >
    <section class="analytics-toolbar">
      <div>
        <strong>Reporting range</strong>
        <small><i class="bi bi-database"></i> Local preview data · Updated {{ lastUpdated }}</small>
      </div>

      <div class="toolbar-actions">
        <div class="period-tabs" role="group" aria-label="Analytics period">
          <button
            v-for="period in periods"
            :key="period"
            type="button"
            :class="{ active: selectedPeriod === period }"
            @click="selectedPeriod = period"
          >
            {{ period }}
          </button>
        </div>
        <button class="btn btn-light border export-btn" type="button" :disabled="!hasExportData" @click="exportCsv">
          <i class="bi bi-download"></i>
          Export CSV
        </button>
      </div>
    </section>

    <section class="analytics-grid">
      <div class="admin-panel chart-panel">
        <div class="panel-title-row">
          <div>
            <h2>Activity Overview</h2>
            <p>Compare incoming reports, project reviews, and admin actions.</p>
          </div>
          <span class="soft-badge">{{ selectedPeriod }}</span>
        </div>

        <div class="chart-summary">
          <div v-for="series in chartTotals" :key="series.key" class="chart-summary-item">
            <span :class="['series-dot', series.className]"></span>
            <div>
              <small>{{ series.label }}</small>
              <strong>{{ series.value }}</strong>
            </div>
          </div>
        </div>

        <div class="bar-chart" :aria-label="`${selectedPeriod} activity comparison chart`" role="img">
          <div class="chart-grid" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div
            class="bar-columns"
            :style="{ gridTemplateColumns: `repeat(${chartData.length}, minmax(56px, 1fr))` }"
          >
            <div v-for="item in chartData" :key="item.day" class="bar-column">
              <div class="bar-cluster">
                <span
                  v-for="series in chartSeries"
                  :key="series.key"
                  :class="['bar-fill', series.className]"
                  :style="{ height: `${barHeight(item[series.key])}%` }"
                  :title="`${series.label}: ${item[series.key]}`"
                >
                  <small>{{ item[series.key] }}</small>
                </span>
              </div>
              <strong>{{ item.day }}</strong>
            </div>
          </div>
        </div>

        <div class="chart-legend">
          <span v-for="series in chartSeries" :key="series.key">
            <i :class="['series-dot', series.className]"></i>{{ series.label }}
          </span>
        </div>
      </div>

      <div class="admin-panel attention-panel">
        <div class="panel-title-row">
          <div>
            <h2>Needs Attention</h2>
            <p>Queues that may need an admin decision.</p>
          </div>
          <span :class="['count-badge', { clear: attentionCount === 0 }]">{{ attentionCount }}</span>
        </div>

        <div class="signal-list">
          <article v-for="signal in signals" :key="signal.label" class="signal-item">
            <span :class="['signal-icon', signal.className]"><i :class="['bi', signal.icon]"></i></span>
            <div>
              <strong>{{ signal.label }}</strong>
              <small>{{ signal.detail }}</small>
              <router-link v-if="!signal.disabled" :to="signal.to" class="signal-action">
                {{ signal.action }} <i class="bi bi-arrow-right"></i>
              </router-link>
              <button v-else type="button" class="signal-action disabled" disabled>No action needed</button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="lower-grid">
      <div class="admin-panel">
        <div class="panel-title-row">
          <div>
            <h2>Workflow Breakdown</h2>
            <p>Current records by operational state.</p>
          </div>
        </div>

        <div class="breakdown-list">
          <div v-for="item in breakdown" :key="item.label" class="breakdown-row">
            <div class="breakdown-heading">
              <span :class="['breakdown-dot', item.className]"></span>
              <strong>{{ item.label }}</strong>
              <span>{{ item.value }}</span>
            </div>
            <div class="breakdown-track">
              <span :class="['breakdown-fill', item.className]" :style="{ width: `${breakdownWidth(item.value)}%` }"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="panel-title-row">
          <div>
            <h2>Recent Admin Activity</h2>
            <p>Latest moderation, project, and settings actions.</p>
          </div>
          <span class="soft-badge">{{ adminStore.activityLog.length }} records</span>
        </div>

        <div v-if="recentActivity.length" class="activity-list">
          <div v-for="item in recentActivity" :key="item.id" class="activity-row">
            <span :class="['activity-icon', item.type]"><i :class="['bi', activityIcon(item.type)]"></i></span>
            <div>
              <strong>{{ item.action }}</strong>
              <small>{{ item.target }} · {{ formatDate(item.createdAt) }}</small>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="bi bi-activity"></i>
          <strong>No admin activity yet</strong>
          <small>Moderation and settings actions will appear here.</small>
        </div>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import { useToast } from '../../composables/useToast';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const adminStore = useAdminOperationsStore();
const toast = useToast();
const periods = ['7 Days', '30 Days', '90 Days'];
const selectedPeriod = ref('7 Days');

const percentage = (value, total) => total ? Math.round((value / total) * 100) : 0;

const metrics = computed(() => [
  { label: 'Open Reports', value: String(adminStore.pendingReports.length), change: `${adminStore.highPriorityReports.length} high priority`, icon: 'bi-flag', className: 'orange' },
  { label: 'Pending Projects', value: String(adminStore.pendingProjects.length), change: 'Waiting for review', icon: 'bi-hourglass-split', className: 'blue' },
  { label: 'Published', value: String(adminStore.publishedProjects.length), change: `${percentage(adminStore.publishedProjects.length, adminStore.projects.length)}% of projects`, icon: 'bi-cloud-check', className: 'green' },
  { label: 'Admin Actions', value: String(adminStore.activityLog.length), change: 'Recorded locally', icon: 'bi-activity', className: 'purple' },
]);

const chartSeries = [
  { key: 'reports', label: 'Reports', className: 'orange' },
  { key: 'projects', label: 'Project reviews', className: 'blue' },
  { key: 'actions', label: 'Admin actions', className: 'purple' },
];

const chartSets = {
  '7 Days': [
    { day: 'Mon', reports: 4, projects: 3, actions: 5 },
    { day: 'Tue', reports: 6, projects: 4, actions: 7 },
    { day: 'Wed', reports: 5, projects: 6, actions: 8 },
    { day: 'Thu', reports: 8, projects: 5, actions: 10 },
    { day: 'Fri', reports: 7, projects: 7, actions: 9 },
    { day: 'Sat', reports: 3, projects: 4, actions: 5 },
    { day: 'Sun', reports: 2, projects: 3, actions: 4 },
  ],
  '30 Days': [
    { day: 'W1', reports: 22, projects: 14, actions: 28 },
    { day: 'W2', reports: 18, projects: 19, actions: 31 },
    { day: 'W3', reports: 26, projects: 17, actions: 35 },
    { day: 'W4', reports: 20, projects: 22, actions: 38 },
  ],
  '90 Days': [
    { day: 'Apr', reports: 62, projects: 48, actions: 92 },
    { day: 'May', reports: 74, projects: 56, actions: 108 },
    { day: 'Jun', reports: 58, projects: 42, actions: 84 },
  ],
};

const chartData = computed(() => chartSets[selectedPeriod.value]);
const chartMaximum = computed(() => {
  const values = chartData.value.flatMap((item) => chartSeries.map((series) => item[series.key]));
  return Math.max(10, Math.ceil(Math.max(...values) / 10) * 10);
});
const chartTotals = computed(() => chartSeries.map((series) => ({
  ...series,
  value: chartData.value.reduce((total, item) => total + item[series.key], 0),
})));
const barHeight = (value) => Math.max(5, (value / chartMaximum.value) * 100);

const signals = computed(() => [
  {
    label: `${adminStore.pendingReports.length} reports need a decision`,
    detail: `${adminStore.highPriorityReports.length} marked high priority.`,
    className: adminStore.pendingReports.length ? 'orange' : 'green',
    icon: 'bi-flag',
    to: '/admin/reports',
    action: 'Review reports',
    disabled: adminStore.pendingReports.length === 0,
  },
  {
    label: `${adminStore.pendingProjects.length} projects await review`,
    detail: 'Approve, reject, or request student changes.',
    className: adminStore.pendingProjects.length ? 'blue' : 'green',
    icon: 'bi-folder2-open',
    to: '/admin/projects',
    action: 'Review projects',
    disabled: adminStore.pendingProjects.length === 0,
  },
  {
    label: `${adminStore.lockedThreads.length} threads are locked`,
    detail: 'Check whether locked discussions need follow-up.',
    className: adminStore.lockedThreads.length ? 'purple' : 'green',
    icon: 'bi-lock',
    to: '/admin/threads',
    action: 'View threads',
    disabled: adminStore.lockedThreads.length === 0,
  },
]);

const attentionCount = computed(() => adminStore.pendingReports.length + adminStore.pendingProjects.length + adminStore.lockedThreads.length);
const breakdown = computed(() => [
  { label: 'Open Reports', value: adminStore.pendingReports.length, className: 'orange' },
  { label: 'Resolved Reports', value: adminStore.resolvedReports.length, className: 'green' },
  { label: 'Projects In Review', value: adminStore.pendingProjects.length, className: 'blue' },
  { label: 'Published Projects', value: adminStore.publishedProjects.length, className: 'purple' },
]);
const breakdownMaximum = computed(() => Math.max(1, ...breakdown.value.map((item) => item.value)));
const breakdownWidth = (value) => value ? Math.max(8, (value / breakdownMaximum.value) * 100) : 0;
const recentActivity = computed(() => adminStore.activityLog.slice(0, 5));
const hasExportData = computed(() => Boolean(adminStore.threadReports.length || adminStore.projects.length || adminStore.activityLog.length));
const lastUpdated = computed(() => adminStore.activityLog.length ? formatDate(adminStore.activityLog[0].createdAt) : 'Not available');

const activityIcon = (type) => ({ moderation: 'bi-shield-check', project: 'bi-folder-check', settings: 'bi-gear' }[type] || 'bi-activity');
const formatDate = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const exportCsv = () => {
  if (!hasExportData.value) return;

  const rows = [
    ['ANT Forum Admin Analytics', selectedPeriod.value],
    [],
    ['Metric', 'Value'],
    ...metrics.value.map((item) => [item.label, item.value]),
    [],
    ['Period', ...chartSeries.map((item) => item.label)],
    ...chartData.value.map((item) => [item.day, ...chartSeries.map((series) => item[series.key])]),
    [],
    ['Recent Action', 'Target', 'Date'],
    ...adminStore.activityLog.map((item) => [item.action, item.target, item.createdAt]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ant-forum-admin-analytics.csv';
  link.click();
  URL.revokeObjectURL(url);
  toast.success('Analytics CSV exported.');
};
</script>

<style scoped>
.analytics-toolbar,
.toolbar-actions,
.panel-title-row,
.chart-summary,
.chart-summary-item,
.chart-legend,
.chart-legend span,
.signal-item,
.breakdown-heading,
.activity-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.analytics-toolbar {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.analytics-toolbar strong,
.analytics-toolbar small {
  display: block;
}

.analytics-toolbar strong {
  color: var(--color-text);
  font-size: 0.86rem;
}

.analytics-toolbar small {
  margin-top: 0.18rem;
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

.analytics-toolbar small i {
  margin-right: 0.25rem;
}

.period-tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0.25rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.period-tabs button {
  padding: 0.4rem 0.75rem;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 800;
}

.period-tabs button:hover,
.period-tabs button.active {
  color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 38px;
  font-weight: 700;
}

.export-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.analytics-grid,
.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.85fr);
  gap: 1rem;
}

.lower-grid {
  grid-template-columns: minmax(300px, 0.85fr) minmax(0, 1.65fr);
  margin-top: 1rem;
}

.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-title-row {
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.admin-panel h2,
.panel-title-row h2 {
  margin: 0 0 0.25rem;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
}

.panel-title-row p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}

.soft-badge,
.count-badge {
  padding: 0.3rem 0.65rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

.count-badge {
  min-width: 28px;
  color: var(--color-warning);
  background: var(--color-warning-light);
  text-align: center;
}

.count-badge.clear {
  color: var(--color-success);
  background: var(--color-success-light);
}

.chart-summary {
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.chart-summary-item {
  min-width: 130px;
  padding: 0.6rem 0.7rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.chart-summary-item small,
.chart-summary-item strong {
  display: block;
}

.chart-summary-item small {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}

.chart-summary-item strong {
  color: var(--color-text);
  font-size: 1.05rem;
}

.bar-chart {
  height: 235px;
  position: relative;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
}

.chart-grid {
  position: absolute;
  inset: 0 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-grid span {
  border-top: 1px dashed var(--color-border);
}

.bar-columns {
  min-width: 560px;
  height: 100%;
  display: grid;
  gap: 0.7rem;
  position: relative;
}

.bar-column {
  min-width: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 24px;
  gap: 0.4rem;
}

.bar-column > strong {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  text-align: center;
}

.bar-cluster {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.25rem;
}

.bar-fill {
  width: clamp(8px, 18%, 16px);
  min-height: 5%;
  position: relative;
  border-radius: 4px 4px 0 0;
  opacity: 0.9;
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.bar-fill:hover {
  z-index: 1;
  opacity: 1;
  transform: scaleX(1.12);
}

.bar-fill small {
  position: absolute;
  bottom: calc(100% + 0.3rem);
  left: 50%;
  padding: 0.15rem 0.28rem;
  color: var(--color-text);
  font-size: 0.62rem;
  font-weight: 800;
  pointer-events: none;
  opacity: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  transform: translateX(-50%);
  transition: opacity var(--transition-base);
}

.bar-fill:hover small {
  opacity: 1;
}

.chart-legend {
  flex-wrap: wrap;
  margin-top: 0.85rem;
  color: var(--color-text-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.series-dot,
.breakdown-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 50%;
}

.bar-fill.orange,
.series-dot.orange,
.breakdown-fill.orange,
.breakdown-dot.orange {
  background: var(--color-warning);
}

.bar-fill.blue,
.series-dot.blue,
.breakdown-fill.blue,
.breakdown-dot.blue {
  background: var(--color-info);
}

.bar-fill.purple,
.series-dot.purple,
.breakdown-fill.purple,
.breakdown-dot.purple {
  background: var(--color-purple);
}

.series-dot.green,
.breakdown-fill.green,
.breakdown-dot.green {
  background: var(--color-success);
}

.signal-list,
.breakdown-list,
.activity-list {
  display: grid;
  gap: 0.8rem;
}

.signal-item {
  align-items: flex-start;
  padding: 0.8rem;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.signal-icon,
.activity-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
}

.signal-icon.orange {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.signal-icon.blue {
  color: var(--color-info);
  background: var(--color-info-light);
}

.signal-icon.purple {
  color: var(--color-purple);
  background: var(--color-purple-light);
}

.signal-icon.green {
  color: var(--color-success);
  background: var(--color-success-light);
}

.signal-item strong,
.signal-item small,
.activity-row strong,
.activity-row small {
  display: block;
}

.signal-item strong,
.activity-row strong {
  color: var(--color-text);
  font-size: 0.82rem;
}

.signal-item small,
.activity-row small {
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

.signal-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.45rem;
  padding: 0;
  color: var(--color-primary);
  background: transparent;
  border: 0;
  font-size: 0.74rem;
  font-weight: 800;
  text-decoration: none;
}

.signal-action.disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.breakdown-row {
  display: grid;
  gap: 0.45rem;
}

.breakdown-heading span:last-child {
  margin-left: auto;
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 800;
}

.breakdown-heading strong {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.breakdown-track {
  height: 7px;
  overflow: hidden;
  background: var(--color-surface-hover);
  border-radius: 999px;
}

.breakdown-fill {
  height: 100%;
  display: block;
  border-radius: inherit;
}

.activity-row {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.activity-icon {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.activity-icon.project {
  color: var(--color-success);
  background: var(--color-success-light);
}

.activity-icon.settings {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.empty-state {
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3rem;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-state i {
  font-size: 1.5rem;
}

.empty-state small {
  max-width: 260px;
}

@media (max-width: 991.98px) {
  .analytics-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .analytics-toolbar,
  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .period-tabs {
    justify-content: space-between;
  }

  .export-btn {
    justify-content: center;
  }
}
</style>
