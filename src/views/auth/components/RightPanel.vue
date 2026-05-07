<template>
  <div class="right-panel">
    <div class="mockup-stack">
      <!-- Status pill -->
      <div class="status-pill">
        <div class="status-dot"></div>
        Systems Online
      </div>

      <CodeCard />
      <PerfCard />
    </div>

    <div class="right-bottom">
      <h3>Connect with developers worldwide</h3>
      <p>Join discussions, share code snippets, and<br/>collaborate on open-source projects.</p>
    </div>
  </div>
</template>

<script setup>
import CodeCard from './CodeCard.vue'
import PerfCard from './PerfCard.vue'
</script>

<style scoped>
.right-panel {
  background: #f8f7fc;
  border-left: 1px solid #ede9f6;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  position: relative;
  overflow: visible;
  border-radius: 0 24px 24px 0;
}

.right-panel::before {
  content: '';
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(109,40,217,.12) 0%, transparent 70%);
  top: -60px;
  right: -60px;
  border-radius: 50%;
  pointer-events: none;
}

.mockup-stack {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 280px;
}

/* Status pill */
.status-pill {
  position: absolute;
  top: -14px;
  right: -10px;
  z-index: 10;
  background: #fff;
  border-radius: 30px;
  padding: 6px 14px;
  font-size: .75rem;
  font-weight: 600;
  color: #111;
  box-shadow: 0 4px 14px rgba(0,0,0,.13);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .6; transform: scale(1.3); }
}

.right-bottom h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
}

.right-bottom p {
  font-size: .82rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: .3rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .right-panel { display: none; }
}
</style>
