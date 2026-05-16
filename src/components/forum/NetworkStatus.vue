<script setup>
const networkStatus = [
  { id: 1, label: 'Active Topics', value: '1,482' },
  { id: 2, label: 'Online Devs',   value: '8,945', online: true },
  { id: 3, label: 'System Load',   value: '42%' },
];
</script>

<template>
  <div class="status-section">
    <h3 class="section-title">
      <span class="title-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </span>
      Network Status
    </h3>

    <div class="status-rows">
      <div v-for="item in networkStatus" :key="item.id" class="status-row">
        <span class="status-label">{{ item.label }}</span>
        <span class="status-value" :class="{ online: item.online }">
          <span v-if="item.online" class="live-dot"></span>
          {{ item.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: 0.1px;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border-radius: 8px;
  color: #7c3aed;
  flex-shrink: 0;
}

.status-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #faf9ff;
  border-radius: 10px;
  transition: background 0.18s ease;
}

.status-row:hover {
  background: #f3f0ff;
}

.status-label {
  font-size: 12.5px;
  color: #9ca3af;
  font-weight: 500;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #111827;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
  50% { box-shadow: 0 0 0 5px rgba(34,197,94,0.08); }
}
</style>
