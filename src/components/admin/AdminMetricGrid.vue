<template>
  <section :class="['metric-grid mb-4', `cols-${metrics.length}`]" aria-label="Admin page metrics">
    <article 
      v-for="metric in metrics" 
      :key="metric.label" 
      :class="['metric-tile', { 'clickable-tile': !!metric.onClick }]"
      @click="metric.onClick && metric.onClick()"
    >
      <div class="metric-left-col">
        <span :class="['metric-icon', metric.className]">
          <i :class="['bi', metric.icon]"></i>
        </span>
        <span v-if="metric.underIconText" class="metric-under-icon">{{ metric.underIconText }}</span>
      </div>
      <div>
        <p class="metric-label mb-1">{{ metric.label }}</p>
        <template v-if="!metric.hideValue">
          <h2 class="metric-value mb-1">{{ metric.value }}</h2>
          <small class="metric-change">{{ metric.change }}</small>
        </template>
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
  gap: 1rem;
}

.metric-grid.cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-grid.cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-grid.cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.metric-left-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.metric-under-icon {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-align: center;
  white-space: nowrap;
}

.clickable-tile:hover .metric-under-icon {
  color: var(--color-primary);
}

.clickable-tile {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.clickable-tile:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
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
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 767.98px) {
  .metric-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
