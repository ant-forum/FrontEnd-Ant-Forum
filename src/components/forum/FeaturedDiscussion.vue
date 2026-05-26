<script setup>
const avatars = [
  { initials: 'AM', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
  { initials: 'SK', color: '#ec4899', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { initials: 'JL', color: '#10b981', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' }
];
const memberCount = 42;
</script>

<template>
  <div class="featured-section">
    <div class="featured-content">
      <span class="featured-badge">
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
          Join Discussion
        </button>

        <div class="participants">
          <div class="avatars">
            <div
              v-for="(avatar, index) in avatars"
              :key="index"
              class="avatar"
            >
              <img :src="avatar.image" :alt="avatar.initials">
            </div>
            <!-- +42 bubble exactly like screenshot -->
            <div class="avatar more-bubble">
              +{{ memberCount }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="featured-deco" aria-hidden="true">
      <svg viewBox="0 0 440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#c4b5fd" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#e9d5ff" stop-opacity="0.1"/>
          </linearGradient>
          <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ddd6fe" stop-opacity="0.5"/>
            <stop offset="100%" stop-color="#f5f3ff" stop-opacity="0.1"/>
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#ede9fe" stop-opacity="0.05"/>
          </linearGradient>
          <filter id="blur1">
            <feGaussianBlur stdDeviation="8"/>
          </filter>
        </defs>
        <path d="M 80,300 Q 200,80 440,160 L 440,300 Z" fill="url(#g1)"/>
        <path d="M 0,220 Q 160,40 380,180 L 440,200 L 440,300 L 0,300 Z" fill="url(#g2)"/>
        <path d="M 100,300 Q 220,130 440,220 L 440,300 Z" fill="url(#g3)"/>
        <circle cx="330" cy="80" r="64" fill="#c4b5fd" opacity="0.1" filter="url(#blur1)"/>
        <circle cx="390" cy="48" r="32" fill="#a78bfa" opacity="0.15" filter="url(#blur1)"/>
        <circle cx="270" cy="120" r="20" fill="#ddd6fe" opacity="0.3"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.featured-section {
  display: grid;
  grid-template-columns: 1fr 340px;
  align-items: center;
  background: linear-gradient(135deg, #fdfbfe 0%, #f9f6ff 60%, #f1ebff 100%);
  border-radius: 20px;
  overflow: hidden;
  min-height: 240px;
  border: 1px solid #ede9fe;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  background: #ede9fe;
  color: #7c3aed;
  font-size: 11px;
  font-weight: 700;
  border-radius: 99px;
  width: fit-content;
}

.featured-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.featured-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
  max-width: 520px;
}

.featured-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
}

.join-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.join-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.participants {
  display: flex;
  align-items: center;
}

.avatars {
  display: flex;
  align-items: center;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 2px solid white;
  border-radius: 50%;
  margin-right: -6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-bubble {
  background: #ede9fe;
  color: #7c3aed;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding-right: 0;
  margin-left: 0;
  width: 28px;
  height: 28px;
}

/* Decorative SVG panel */
.featured-deco {
  width: 340px;
  height: 100%;
  min-height: 240px;
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
  .featured-content { padding: 32px 24px; }
  .featured-title { font-size: 22px; }
}

@media (max-width: 540px) {
  .featured-content { padding: 24px 16px; }
  .featured-title { font-size: 19px; }
  .featured-actions { flex-wrap: wrap; gap: 12px; }
}
</style>