<template>
  <div class="admin-dashboard-layout d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
        <header class="dashboard-header mb-5">
          <h2 class="fw-bold mb-1 text-adaptive">Platform Overview</h2>
          <p class="text-muted mb-0">Real-time metrics and system health monitoring</p>
        </header>

        <div class="row g-4">
          <!-- Center Column -->
          <div class="col-xl-8">
            <!-- Metrics Row -->
            <div class="row g-4 mb-4">
              <div class="col-md-6 col-lg-4">
                <StatCard 
                  label="Total Projects" 
                  value="4" 
                  description="Active initiatives"
                  descriptionIcon="bi-arrow-up-right"
                  descriptionColorClass="text-success"
                  icon="bi bi-folder"
                  iconBgClass="bg-purple-light"
                  iconColorClass="text-purple"
                  active
                />
              </div>
              <div class="col-md-6 col-lg-4">
                <StatCard 
                  label="Pending" 
                  value="1" 
                  description="Awaiting approval"
                  descriptionIcon="bi-clock"
                  descriptionColorClass="text-warning"
                  icon="bi bi-clock"
                  iconBgClass="bg-orange-light"
                  iconColorClass="text-orange"
                />
              </div>
              <div class="col-md-6 col-lg-4">
                <StatCard 
                  label="Live" 
                  value="2" 
                  description="In production"
                  descriptionIcon="bi-lightning-charge"
                  descriptionColorClass="text-teal"
                  icon="bi bi-lightning"
                  iconBgClass="bg-teal-light"
                  iconColorClass="text-teal"
                />
              </div>
            </div>

            <!-- Platform Engagement Chart -->
            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 engagement-card bg-surface border">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h6 class="fw-bold mb-1 text-adaptive">Platform Engagement</h6>
                  <div class="d-flex align-items-center gap-3">
                    <p class="text-muted small mb-0 d-flex align-items-center">
                      <span class="live-dot me-2"></span>
                      Real-time Activity
                    </p>
                    <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill x-small fw-bold">
                      <i class="bi bi-arrow-up-short"></i> +12.5%
                    </span>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <div class="btn-group btn-group-sm rounded-pill p-1 bg-surface-hover border">
                    <button 
                      v-for="t in ['Year', 'Month', 'Week']" 
                      :key="t"
                      @click="activeTimeframe = t"
                      :class="['btn rounded-pill px-3 transition-all', activeTimeframe === t ? 'btn-white shadow-sm active' : 'btn-transparent text-muted']"
                    >
                      {{ t }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="chart-container rounded-4 bg-dark position-relative" style="height: 300px; overflow: hidden;">
                <!-- Interactive Chart -->
                <div class="w-100 h-100 position-relative p-4">
                  <div class="engagement-grid w-100 h-100 position-absolute top-0 start-0"></div>
                  
                  <!-- Data Tooltip (Dynamic) -->
                  <div class="chart-info-overlay position-absolute top-0 start-0 m-4 z-index-5">
                    <div class="d-flex flex-column">
                      <span class="text-white-50 xx-small fw-bold text-uppercase">Peak Interaction</span>
                      <span class="text-white fw-bold h4 mb-0">{{ activeTimeframe === 'Year' ? '12.8k' : activeTimeframe === 'Month' ? '1.2k' : '342' }}</span>
                    </div>
                  </div>

                  <svg class="chart-svg w-100 h-100" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:rgba(139, 92, 246, 0.4)" />
                        <stop offset="100%" style="stop-color:rgba(139, 92, 246, 0)" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <!-- Background Area -->
                    <path 
                      :key="'area-' + activeTimeframe"
                      class="chart-line-anim" 
                      :d="chartPaths[activeTimeframe].area" 
                      fill="url(#chartGradient)"
                    />
                    
                    <!-- Glowing Line -->
                    <path 
                      :key="'line-' + activeTimeframe"
                      class="chart-stroke-anim" 
                      :d="chartPaths[activeTimeframe].line" 
                      fill="none" 
                      stroke="#a78bfa" 
                      stroke-width="3"
                      filter="url(#glow)"
                    />

                    <!-- Interactive Hover Points -->
                    <g class="chart-points">
                      <circle 
                        v-for="(p, i) in chartPaths[activeTimeframe].points" 
                        :key="i"
                        :cx="p.x" :cy="p.y" r="4" 
                        fill="#fff" 
                        class="pulsing-point-white" 
                      />
                    </g>
                  </svg>
                  
                  <!-- X-Axis Labels -->
                  <div class="d-flex justify-content-between text-white-50 xx-small fw-bold mt-2 px-2">
                    <span v-for="label in chartPaths[activeTimeframe].labels" :key="label">{{ label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-xl-4">
            <ActiveSessions />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import StatCard from '../../components/admin/StatCard.vue';
import ActiveSessions from '../../components/admin/ActiveSessions.vue';

const activeTimeframe = ref('Year');

const chartPaths = {
  Year: {
    line: "M0,250 Q100,220 200,240 T400,180 T600,200 T800,120 T1000,150",
    area: "M0,250 Q100,220 200,240 T400,180 T600,200 T800,120 T1000,150 L1000,300 L0,300 Z",
    points: [{x: 200, y: 240}, {x: 400, y: 180}, {x: 600, y: 200}, {x: 800, y: 120}],
    labels: ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV']
  },
  Month: {
    line: "M0,280 Q150,250 300,200 T500,220 T700,150 T1000,100",
    area: "M0,280 Q150,250 300,200 T500,220 T700,150 T1000,100 L1000,300 L0,300 Z",
    points: [{x: 300, y: 200}, {x: 500, y: 220}, {x: 700, y: 150}],
    labels: ['WK1', 'WK2', 'WK3', 'WK4']
  },
  Week: {
    line: "M0,200 Q200,250 400,150 T700,180 T1000,220",
    area: "M0,200 Q200,250 400,150 T700,180 T1000,220 L1000,300 L0,300 Z",
    points: [{x: 400, y: 150}, {x: 700, y: 180}],
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  }
};
</script>

<style scoped>
.admin-dashboard-layout {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.admin-main {
  background-color: var(--color-bg);
}

.chart-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
}

[data-theme='dark'] .chart-container {
  background: linear-gradient(135deg, #030712 0%, #111827 100%) !important;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.engagement-grid {
  background-image: 
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.chart-line-anim {
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
  animation: chart-reveal 1.2s ease-out;
}

.chart-stroke-anim {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: line-draw 1.8s ease-out forwards;
}

@keyframes line-draw {
  to { stroke-dashoffset: 0; }
}

@keyframes chart-reveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pulsing-point-white {
  animation: pulse-point-white 2s infinite;
  box-shadow: 0 0 10px #fff;
}

@keyframes pulse-point-white {
  0% { r: 3; opacity: 0.5; }
  50% { r: 5; opacity: 1; }
  100% { r: 3; opacity: 0.5; }
}

.z-index-5 { z-index: 5; }

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-white.active {
  background-color: white !important;
  color: #6366f1 !important;
}

[data-theme='dark'] .btn-white.active {
  background-color: var(--color-surface-elevated) !important;
  color: var(--color-primary) !important;
}

.bg-success-subtle { background-color: rgba(16, 185, 129, 0.1); }
.border-success-subtle { border-color: rgba(16, 185, 129, 0.2) !important; }

/* Utilities */
.fw-black { font-weight: 900; }
.x-small { font-size: 0.7rem; }
.xx-small { font-size: 0.65rem; }
.text-adaptive { color: var(--color-text) !important; }
.bg-surface { background-color: var(--color-surface) !important; }
.bg-surface-hover { background-color: var(--color-surface-hover) !important; }
</style>
