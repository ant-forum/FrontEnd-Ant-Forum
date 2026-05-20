<template>
  <div class="metric-card p-4 rounded-4 border bg-white shadow-sm h-100">
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div :class="['icon-wrapper rounded-3 p-2 d-flex align-items-center justify-content-center', iconBgClass]">
        <i :class="[icon, 'text-primary']" style="font-size: 1.2rem;"></i>
      </div>
      <div :class="['trend-badge d-flex align-items-center px-2 py-1 rounded-pill', trendClass]">
        <i :class="['bi', trendIcon, 'me-1']" style="font-size: 0.7rem;"></i>
        <span class="fw-bold" style="font-size: 0.75rem;">{{ trend }}%</span>
      </div>
    </div>
    <div class="metric-content">
      <h3 class="fw-bold mb-1">{{ value }}</h3>
      <p class="text-muted text-uppercase fw-semibold mb-0" style="font-size: 0.7rem; letter-spacing: 0.5px;">{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  value: String,
  trend: String,
  trendType: {
    type: String,
    default: 'up' // 'up' or 'down'
  },
  icon: String,
  iconBgClass: {
    type: String,
    default: 'bg-light-primary'
  }
});

const trendClass = computed(() => {
  return props.trendType === 'up' ? 'trend-up' : 'trend-down';
});

const trendIcon = computed(() => {
  return props.trendType === 'up' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
});
</script>

<style scoped>
.metric-card {
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  cursor: default;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md) !important;
}

.icon-wrapper {
  width: 42px;
  height: 42px;
}

.bg-light-primary {
  background-color: rgba(109, 40, 217, 0.08);
}

.trend-up {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.trend-down {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.metric-content h3 {
  font-size: 1.75rem;
  letter-spacing: -0.5px;
}
</style>
