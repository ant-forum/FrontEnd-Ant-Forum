<script setup>
const contributors = [
  { id: 1, name: 'Elena Rostova', badge: 'Core Team', rep: '14.2k', initials: 'ER', color: '#a78bfa', isTop: true },
  { id: 2, name: 'David Chen',    badge: 'Mentor',    rep: '8.9k',  initials: 'DC', color: '#60a5fa', isTop: false },
  { id: 3, name: 'Samira Al-Fayed', badge: 'Pro',     rep: '6.1k',  initials: 'SA', color: '#f472b6', isTop: false },
];
</script>

<template>
  <div class="contributors-section">
    <h3 class="section-title">
      <span class="title-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </span>
      Top Contributors
    </h3>

    <div class="contributors-list">
      <div v-for="c in contributors" :key="c.id" class="contributor-row">
        <div class="c-avatar" :style="{ background: `${c.color}22` }">
          <span :style="{ color: c.color }">{{ c.initials }}</span>
        </div>

        <div class="c-info">
          <div class="c-name">{{ c.name }}</div>
          <div class="c-sub">
            <span class="c-rep">{{ c.rep }} Rep</span>
            <span class="c-dot">·</span>
            <span class="c-badge">{{ c.badge }}</span>
          </div>
        </div>

        <div v-if="c.isTop" class="c-star">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contributors-section {
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
  color: var(--color-text);
  margin: 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--color-warning-light);
  border-radius: 8px;
  color: var(--color-warning);
  flex-shrink: 0;
}

.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contributor-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--color-surface-hover);
  transition: all 0.22s ease;
  cursor: pointer;
}

.contributor-row:hover {
  background: var(--color-border-soft);
  transform: translateX(3px);
}

.c-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.c-avatar span {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.c-info {
  flex: 1;
  min-width: 0;
}

.c-name {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 1px;
}

.c-rep {
  font-size: 11.5px;
  color: #9ca3af;
  font-weight: 500;
}

.c-dot {
  color: #d1d5db;
  font-size: 12px;
}

.c-badge {
  font-size: 11.5px;
  color: #9ca3af;
  font-weight: 500;
}

.c-star {
  width: 26px;
  height: 26px;
  background: #fef3c7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>