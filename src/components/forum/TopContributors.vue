<script setup>
const contributors = [
  { id: 1, name: 'Elena Rostova', badge: 'Core Team', rep: '14.2k', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', isTop: true },
  { id: 2, name: 'David Chen',    badge: 'Mentor',    rep: '8.5k',  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120', isTop: false },
  { id: 3, name: 'Samira Al-Fayed', badge: 'Pro',     rep: '8.1k',  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', isTop: false },
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
        <div class="c-avatar">
          <img :src="c.avatar" :alt="c.name">
        </div>

        <div class="c-info">
          <div class="c-name">{{ c.name }}</div>
          <div class="c-sub">
            <span class="c-rep">{{ c.rep }} Rep</span>
            <span class="c-dot">•</span>
            <span class="c-badge">{{ c.badge }}</span>
          </div>
        </div>

        <div v-if="c.isTop" class="c-star">
          <i class="bi bi-star"></i>
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
  background: #fffbeb;
  border-radius: 6px;
  color: #d97706;
  flex-shrink: 0;
}

.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contributor-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.c-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.c-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.c-info {
  flex: 1;
  min-width: 0;
}

.c-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
}

.c-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.c-rep {
  font-weight: 500;
}

.c-badge {
  font-weight: 500;
}

.c-dot {
  color: #cbd5e1;
}

.c-star {
  color: #ca8a04;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>