<template>
  <AdminPageShell
    title="Analytics"
    kicker="System Analytics"
    subtitle="Read platform health, content volume, and moderation activity."
    :metrics="metrics"
  >
    <section class="analytics-grid">
      <div class="admin-panel chart-panel">
        <div class="panel-title-row">
          <div>
            <h2>Traffic Overview</h2>
            <p>Weekly activity by section.</p>
          </div>
          <span class="soft-badge">Last 7 days</span>
        </div>

        <div class="bar-chart" aria-label="Traffic bar chart">
          <div v-for="item in chartData" :key="item.day" class="bar-column">
            <span class="bar-track">
              <span class="bar-fill" :style="{ height: `${item.value}%` }"></span>
            </span>
            <span>{{ item.day }}</span>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <h2>Top Signals</h2>
        <div class="signal-list">
          <div v-for="signal in signals" :key="signal.label" class="signal-item">
            <span :class="['signal-dot', signal.className]"></span>
            <div>
              <strong>{{ signal.label }}</strong>
              <small>{{ signal.detail }}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const metrics = [
  { label: 'Visits', value: '18.4k', change: '+14% this week', icon: 'bi-graph-up-arrow', className: 'green' },
  { label: 'Posts', value: '612', change: '+37 new', icon: 'bi-chat-square-text', className: 'blue' },
  { label: 'Avg. Response', value: '2.3h', change: 'Faster by 18%', icon: 'bi-stopwatch', className: 'purple' },
  { label: 'Reports', value: '7', change: 'Needs review', icon: 'bi-flag', className: 'orange' },
];

const chartData = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 74 },
  { day: 'Thu', value: 63 },
  { day: 'Fri', value: 86 },
  { day: 'Sat', value: 69 },
  { day: 'Sun', value: 52 },
];

const signals = [
  { label: 'User growth is stable', detail: 'New signups are trending upward from class activity.', className: 'green' },
  { label: 'Moderation queue is light', detail: 'Only three high priority items need admin review.', className: 'orange' },
  { label: 'Projects are active', detail: 'Review submissions increased after showcase updates.', className: 'blue' },
];
</script>

<style scoped>
.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);
  gap: 1rem;
}

.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.admin-panel h2,
.panel-title-row h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-title-row p {
  color: var(--color-text-muted);
  margin: 0;
}

.soft-badge {
  border-radius: 999px;
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
}

.bar-chart {
  height: 280px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
  align-items: end;
  margin-top: 1.5rem;
}

.bar-column {
  display: grid;
  gap: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  text-align: center;
}

.bar-track {
  height: 220px;
  border-radius: 8px;
  background: var(--color-surface-hover);
  display: flex;
  align-items: end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  min-height: 18%;
  background: linear-gradient(180deg, var(--color-info), var(--color-primary));
  border-radius: 8px 8px 0 0;
}

.signal-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.signal-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.signal-item strong,
.signal-item small {
  display: block;
}

.signal-item small {
  color: var(--color-text-muted);
}

.signal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.35rem;
}

.signal-dot.blue {
  background: var(--color-info);
}

.signal-dot.green {
  background: var(--color-success);
}

.signal-dot.orange {
  background: var(--color-warning);
}

@media (max-width: 991.98px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
