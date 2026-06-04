<template>
  <div :class="['metric-card p-4 rounded-4 border bg-surface shadow-sm d-flex justify-content-between align-items-start h-100 transition-all', active ? 'border-purple active-card' : '']">
    <div class="d-flex flex-column justify-content-between h-100">
      <div>
        <p class="text-muted-color text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">{{ label }}</p>
        <h2 class="fw-bold mb-1 value-text text-color">{{ displayValue }}</h2>
      </div>
      <div class="d-flex align-items-center small mt-2" :class="footerClass || descriptionColorClass">
        <slot name="footer">
          <i v-if="footerIcon || descriptionIcon" :class="['bi', footerIcon || descriptionIcon, 'me-1']"></i>
          <span class="fw-bold">{{ footerText || description }}</span>
        </slot>
      </div>
    </div>
    <div class="stat-card-icon-wrap d-flex align-items-center ms-3">
      <div :class="['icon-box rounded-circle p-3', bgClass || iconBgClass]">
        <i :class="['bi', mainIcon || icon, iconClass || iconColorClass, 'fs-4']"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  // Original StatCard props
  footerIcon: { type: String, default: '' },
  footerText: { type: String, default: '' },
  footerClass: { type: String, default: '' },
  mainIcon: { type: String, default: '' },
  iconClass: { type: String, default: '' },
  bgClass: { type: String, default: '' },
  // MetricCard compatibility props
  description: { type: String, default: '' },
  descriptionIcon: { type: String, default: '' },
  descriptionColorClass: { type: String, default: 'text-muted' },
  icon: { type: String, default: '' },
  iconBgClass: { type: String, default: '' },
  iconColorClass: { type: String, default: '' },
  active: { type: Boolean, default: false },
  animate: { type: Boolean, default: true }
});

const displayValue = ref('0');

const animateValue = () => {
  const finalValue = props.value;
  if (finalValue === undefined || finalValue === null) return;

  if (!props.animate) {
    displayValue.value = finalValue;
    return;
  }

  let current = 0;
  const isK = finalValue.toString().includes('k');
  const hasCurrency = finalValue.toString().startsWith('$');
  const hasPercent = finalValue.toString().endsWith('%');
  
  let numericStr = finalValue.toString().replace(/[^0-9.]/g, '');
  const target = parseFloat(numericStr);
  
  if (isNaN(target)) {
    displayValue.value = finalValue;
    return;
  }

  const duration = 800;
  const steps = 25;
  const increment = target / steps;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      displayValue.value = finalValue;
      clearInterval(timer);
    } else {
      let val = current.toFixed(target % 1 === 0 ? 0 : 1);
      if (hasCurrency) val = '$' + val;
      if (isK) val += 'k';
      if (hasPercent) val += '%';
      displayValue.value = val;
    }
  }, duration / steps);
};

onMounted(animateValue);
watch(() => props.value, animateValue);
</script>

<style scoped>
.metric-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  min-height: 140px;
  background-color: var(--color-surface);
  border-color: var(--color-border) !important;
}

.stat-card-icon-wrap {
  align-self: flex-start;
  margin-top: 0.25rem;
}

.bg-surface {
  background-color: var(--color-surface) !important;
}

.text-color {
  color: var(--color-text) !important;
}

.text-muted-color {
  color: var(--color-muted) !important;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md) !important;
}

.active-card {
  background-color: var(--admin-active-card-bg) !important;
  border-color: var(--admin-active-card-border) !important;
  box-shadow: var(--shadow-md) !important;
}

.value-text {
  font-size: 2rem;
  letter-spacing: -1px;
  color: var(--color-text);
}

.icon-box {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Shared utility classes for the stat cards */
:deep(.bg-light-purple), :deep(.bg-purple-light) { background-color: var(--color-purple-light); }
:deep(.text-purple) { color: var(--color-purple); }

:deep(.bg-light-orange), :deep(.bg-orange-light) { background-color: var(--color-warning-light); }
:deep(.text-orange) { color: var(--color-warning); }

:deep(.bg-light-green), :deep(.bg-teal-light) { background-color: var(--color-success-light); }
:deep(.text-green), :deep(.text-teal) { color: var(--color-success); }

:deep(.bg-red-light) { background-color: var(--color-danger-light); }
:deep(.text-red) { color: var(--color-danger); }

:deep(.mini-chart .bar) {
  width: 3px;
  background-color: var(--color-border);
  border-radius: 1px;
}

:deep(.mini-chart .bar.active) {
  background-color: var(--color-purple);
}

:deep(.text-purple-light) {
  color: var(--color-purple);
  opacity: 0.8;
}

:deep(.text-success) { color: var(--color-success) !important; }
:deep(.text-warning) { color: var(--color-warning) !important; }
:deep(.text-danger) { color: var(--color-danger) !important; }
</style>
