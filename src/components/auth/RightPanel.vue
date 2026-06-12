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
      <p>
        Join discussions, share code snippets, and<br />collaborate on
        open-source projects.
      </p>
    </div>
  </div>
</template>

<script setup>
import CodeCard from "./CodeCard.vue";
import PerfCard from "./PerfCard.vue";
</script>

<style scoped>
.right-panel {
  background: var(--color-surface-hover) !important;
  border-left: 1px solid var(--color-border) !important;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  position: relative;
  overflow: visible;
  border-radius: 0 24px 24px 0;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base);
}

[data-theme="dark"] .right-panel {
  background: rgba(31, 41, 55, 0.3) !important;
  backdrop-filter: blur(10px);
}

.right-panel::before {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    var(--color-purple-light) 0%,
    transparent 70%
  );
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
  background: var(--color-surface) !important;
  border-radius: 30px;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text) !important;
  box-shadow: 0 4px 14px var(--color-shadow);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border: 1px solid var(--color-border) !important;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.3);
  }
}

.right-bottom h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text) !important;
  text-align: center;
}

.right-bottom p {
  font-size: 0.82rem;
  color: var(--color-text-muted) !important;
  text-align: center;
  margin-top: 0.3rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .right-panel {
    display: none;
  }
}
</style>
