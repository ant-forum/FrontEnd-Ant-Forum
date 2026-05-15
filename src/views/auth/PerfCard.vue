<template>
  <div class="perf-card">
    <div class="perf-header">
      <span class="perf-title">System Performance</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#7c3aed"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
        />
      </svg>
    </div>

    <div class="perf-stats">
      <div>
        <div class="stat-label">Response Time</div>
        <div class="stat-value">42 <span>ms</span></div>
      </div>
      <div>
        <div class="stat-label">Uptime</div>
        <div class="stat-value green">99.9 <span>%</span></div>
      </div>
    </div>

    <div class="bar-chart">
      <div
        v-for="bar in bars"
        :key="bar.id"
        class="bar"
        :class="{ active: bar.active }"
        :style="{ height: bar.height + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
const bars = [
  { id: 1, height: 55, active: false },
  { id: 2, height: 80, active: true },
  { id: 3, height: 45, active: false },
  { id: 4, height: 60, active: false },
  { id: 5, height: 70, active: true },
  { id: 6, height: 35, active: false },
  { id: 7, height: 50, active: false },
  { id: 8, height: 100, active: true },
];
</script>

<style scoped>
.perf-card {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 72%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.14);
  padding: 1.1rem 1.2rem;
  animation: floatB 6s ease-in-out infinite;
  animation-delay: -3s;
}

@keyframes floatB {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.perf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.perf-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-dark);
}

.perf-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-dark);
}
.stat-value span {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 2px;
}
.stat-value.green {
  color: var(--accent);
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 36px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: #ede9f6;
}
.bar.active {
  background: var(--brand);
}
</style>
