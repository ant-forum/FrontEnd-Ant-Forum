<script setup>
const avatars = [
  { initials: 'AM', color: '#a78bfa' },
  { initials: 'SK', color: '#f472b6' },
  { initials: 'JL', color: '#34d399' }
];
const memberCount = 42;
</script>

<template>
  <!-- <div class="featured-section">
    <div class="featured-content">
      <span class="featured-badge">
        <span class="badge-dot"></span>
        Weekly Challenge
      </span>

      <h1 class="featured-title">
        Optimize React Server Components for<br>High-Traffic Dashboards
      </h1>

      <p class="featured-description">
        Join the core engineering team in dissecting the latest patterns for data
        fetching and streaming in next-gen web applications. Share your
        benchmarks and earn ecosystem reputation points.
      </p>

      <div class="featured-actions">
        <button class="join-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Join Discussion
        </button>

        <div class="participants">
          <div class="avatars">
            <span
              v-for="(avatar, index) in avatars"
              :key="index"
              class="avatar"
              :style="{ background: avatar.color }"
            >{{ avatar.initials }}</span>
          </div>
          <span class="more-count">+{{ memberCount }} members</span>
        </div>
      </div>
    </div>

    <div class="featured-deco" aria-hidden="true">
      <svg viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#c4b5fd" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#e9d5ff" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ddd6fe" stop-opacity="0.75"/>
            <stop offset="100%" stop-color="#f5f3ff" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#ede9fe" stop-opacity="0.1"/>
          </linearGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8"/>
          </filter>
        </defs>
        <path d="M 80,300 Q 200,80 440,160 L 440,300 Z" fill="url(#g1)"/>
        <path d="M 0,220 Q 160,40 380,180 L 440,200 L 440,300 L 0,300 Z" fill="url(#g2)"/>
        <path d="M 100,300 Q 220,130 440,220 L 440,300 Z" fill="url(#g3)"/>
        <circle cx="330" cy="80" r="64" fill="#c4b5fd" opacity="0.18" filter="url(#blur1)"/>
        <circle cx="390" cy="48" r="32" fill="#a78bfa" opacity="0.22" filter="url(#blur1)"/>
        <circle cx="270" cy="120" r="20" fill="#ddd6fe" opacity="0.5"/>
      </svg>
    </div>
  </div> -->
</template>

<style scoped>
.featured-section {
  display: grid;
  grid-template-columns: 1fr 360px;
  align-items: center;
  background: linear-gradient(135deg, #faf9ff 0%, #f4f0ff 55%, #ede9fe 100%);
  border-radius: 20px;
  overflow: hidden;
  min-height: 256px;
  box-shadow: 0 4px 24px rgba(109, 40, 217, 0.07);
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 48px 40px 48px 48px;
  position: relative;
  z-index: 1;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  background: rgba(109, 40, 217, 0.1);
  color: #6d28d9;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  width: fit-content;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #7c3aed;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.featured-title {
  margin: 0;
  font-size: 27px;
  font-weight: 800;
  line-height: 1.3;
  color: #0f0a1e;
  letter-spacing: -0.5px;
}

.featured-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #6b7280;
  max-width: 460px;
}

.featured-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 4px;
}

.join-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(109, 40, 217, 0.35);
}

.join-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.45);
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.join-btn:active {
  transform: translateY(0);
}

.participants {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatars {
  display: flex;
  align-items: center;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 2.5px solid white;
  border-radius: 50%;
  font-size: 9.5px;
  font-weight: 800;
  color: white;
  margin-right: -8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  letter-spacing: 0;
}

.more-count {
  font-size: 12.5px;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 14px;
}

/* Decorative SVG panel */
.featured-deco {
  width: 360px;
  height: 100%;
  min-height: 256px;
  position: relative;
  overflow: hidden;
}

.featured-deco svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 900px) {
  .featured-section { grid-template-columns: 1fr; }
  .featured-deco { display: none; }
  .featured-content { padding: 36px 28px; }
  .featured-title { font-size: 22px; }
}

@media (max-width: 540px) {
  .featured-content { padding: 28px 20px; }
  .featured-title { font-size: 19px; }
  .featured-actions { flex-wrap: wrap; gap: 14px; }
}
</style>