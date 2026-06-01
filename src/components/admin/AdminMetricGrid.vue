<template>
  <section class="metric-grid mb-4" aria-label="Admin page metrics">
    <article v-for="metric in metrics" :key="metric.label" class="metric-tile">
      <span :class="['metric-icon', metric.className]">
        <i :class="['bi', metric.icon]"></i>
      </span>
      <div>
        <p class="metric-label mb-1">{{ metric.label }}</p>
        <h2 class="metric-value mb-1">{{ metric.value }}</h2>
        <small class="metric-change">{{ metric.change }}</small>
      </div>
    </article>
  </section>
</template>

<script setup>
defineProps({
  metrics: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.metric-tile {
  min-height: 104px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon.blue {
  background: var(--color-info-light);
  color: var(--color-info);
}

.metric-icon.green {
  background: var(--color-success-light);
  color: var(--color-success);
}

.metric-icon.orange {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.metric-icon.purple {
  background: var(--color-purple-light);
  color: var(--color-purple);
}

.metric-label {
  color: var(--color-text-muted);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
}

.metric-value {
  color: var(--color-text);
  font-size: 1.45rem;
  font-weight: 800;
}

.metric-change {
  color: var(--color-text-muted);
}

@media (max-width: 1199.98px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
