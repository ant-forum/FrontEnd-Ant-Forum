<template>
  <div class="page-404">
    <!-- Animated background shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    
    <div class="content-wrapper">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Oops! You've lost your way</h2>
      <p class="error-desc">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <router-link to="/" class="home-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="home-icon"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
// 404 Page Component
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.page-404 {
  font-family: 'Inter', sans-serif;
  position: relative;
  min-height: calc(100vh - 150px); /* Adjust based on your header/footer height */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  overflow: hidden;
  padding: 2rem;
}

/* Background decorative blobs */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
}

.shape-1 {
  top: 5%;
  left: 15%;
  width: 400px;
  height: 400px;
  background: #d8b4fe; /* Light Purple */
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  bottom: 10%;
  right: 15%;
  width: 350px;
  height: 350px;
  background: #bfdbfe; /* Light Blue */
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(20px) scale(1.05);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 550px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 4rem 3rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

.error-code {
  font-size: 8rem;
  font-weight: 800;
  line-height: 1;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #9333ea, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -4px;
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.error-desc {
  font-size: 1.05rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #9333ea, #7e22ce);
  color: white;
  text-decoration: none;
  padding: 0.875rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(147, 51, 234, 0.2);
}

.home-icon {
  transition: transform 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px rgba(147, 51, 234, 0.3);
}

.home-btn:hover .home-icon {
  transform: translateY(-1px);
}

.home-btn:active {
  transform: translateY(0);
  box-shadow: 0 5px 10px rgba(147, 51, 234, 0.2);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-code {
    font-size: 6rem;
  }
  .error-title {
    font-size: 1.5rem;
  }
  .content-wrapper {
    padding: 3rem 2rem;
  }
  .shape-1, .shape-2 {
    width: 250px;
    height: 250px;
  }
}
</style>
