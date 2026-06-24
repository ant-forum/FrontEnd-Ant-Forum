<template>
  <div class="page-404-layout">
    <Navbar />

    <div class="page-404-container">
      <!-- Animated background shapes that adapt to theme -->
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>

      <div class="content-wrapper">
        <div class="error-illustration">
          <h1 class="error-code">404</h1>
          <div class="glow-ring"></div>
        </div>

        <h2 class="error-title">Oops! You've lost your way</h2>
        <p class="error-desc">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable. Let's get you back on track!
        </p>

        <div class="button-group">
          <router-link to="/" class="home-btn">
            <i class="bi bi-house-door-fill"></i>
            <span>Back to Home</span>
          </router-link>

          <button class="back-btn-modern" @click="$router.back()">
            <i class="bi bi-arrow-left"></i>
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from "./header.vue";
import Footer from "./footer.vue";
</script>

<style scoped>
.page-404-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
  transition: background-color var(--transition-base);
}

.page-404-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 80px 24px;
}

/* Background decorative blobs using dynamic theme values */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.6;
  pointer-events: none;
  transition: all var(--transition-slow);
}

.shape-1 {
  top: 15%;
  left: 20%;
  width: 380px;
  height: 380px;
  background: var(--color-primary-light);
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  bottom: 15%;
  right: 20%;
  width: 320px;
  height: 320px;
  background: var(--color-blue-light);
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(24px) scale(1.08);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 580px;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  padding: 60px 40px;
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
  backdrop-filter: blur(16px);
}

.error-illustration {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-blue) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -4px;
  z-index: 2;
  filter: drop-shadow(0 4px 12px var(--color-primary-light));
}

.glow-ring {
  position: absolute;
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    var(--color-primary-light) 0%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: 1;
  animation: pulse-ring 3s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}

.error-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
  font-family: var(--font-family-display);
}

.error-desc {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 36px;
  max-width: 460px;
  margin-left: auto;
  margin-right: auto;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  color: white;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.95rem;
  transition: all var(--transition-base);
  box-shadow: 0 4px 18px var(--color-primary-light);
  border: none;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(84, 131, 179, 0.35);
  color: white;
}

.home-btn:active {
  transform: translateY(0);
}

.back-btn-modern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  color: var(--color-text);
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.95rem;
  transition: all var(--transition-base);
  cursor: pointer;
}

.back-btn-modern:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
}

.back-btn-modern:active {
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-code {
    font-size: 5.5rem;
  }
  .error-title {
    font-size: 1.5rem;
  }
  .content-wrapper {
    padding: 40px 20px;
  }
  .shape-1,
  .shape-2 {
    width: 200px;
    height: 200px;
  }
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  .home-btn,
  .back-btn-modern {
    width: 100%;
  }
}
</style>
