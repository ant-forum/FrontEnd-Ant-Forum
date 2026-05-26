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
        <span class="status-value">
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
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f5f3ff;
  border-radius: 6px;
  color: #7c3aed;
  flex-shrink: 0;
}

.status-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.status-label {
  font-size: 13.5px;
  color: #64748b;
  font-weight: 500;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  display: inline-block;
}
</style>
