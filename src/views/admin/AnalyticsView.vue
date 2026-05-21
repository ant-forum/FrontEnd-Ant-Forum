<template>
  <div class="analytics-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Header -->
      <header class="analytics-header mb-5">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold mb-1">Advanced Analytics</h2>
            <p class="text-muted small mb-0">In-depth platform performance and user behavior insights</p>
          </div>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-white border shadow-sm rounded-pill px-4 py-2 fw-bold small d-flex align-items-center gap-2"
              @click="exportReport"
              :disabled="isExporting"
            >
              <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-download"></i>
              {{ isExporting ? 'Exporting...' : 'Export Report' }}
            </button>
            <div class="dropdown">
              <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-brand dropdown-toggle" data-bs-toggle="dropdown">
                Last 30 Days
              </button>
              <ul class="dropdown-menu border-0 shadow-sm rounded-3">
                <li><a class="dropdown-item small" href="#">Last 7 Days</a></li>
                <li><a class="dropdown-item small" href="#">Last 30 Days</a></li>
                <li><a class="dropdown-item small" href="#">Last 90 Days</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item small" href="#">Custom Range</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <!-- Key Performance Indicators -->
      <div class="row g-4 mb-5">
        <div v-for="kpi in kpis" :key="kpi.label" class="col-md-3">
          <div class="kpi-card p-4 rounded-4 border bg-white shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div :class="['icon-box rounded-circle p-3', kpi.bgClass]">
                <i :class="[kpi.icon, kpi.textClass, 'fs-4']"></i>
              </div>
              <span :class="['badge rounded-pill', kpi.trendUp ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                {{ kpi.trendUp ? '+' : '-' }}{{ kpi.trend }}%
              </span>
            </div>
            <p class="text-muted text-uppercase fw-bold xx-small mb-1" style="letter-spacing: 0.5px;">{{ kpi.label }}</p>
            <h3 class="fw-bold mb-0">{{ kpi.value }}</h3>
            <p class="text-muted xx-small mb-0 mt-2">vs. last period</p>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Main Growth Chart -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h6 class="fw-bold mb-0">Platform Growth & Retention</h6>
              <div class="btn-group btn-group-sm rounded-pill p-1 bg-light">
                <button 
                  v-for="t in ['Views', 'Users', 'Revenue']" 
                  :key="t"
                  @click="activeMetric = t"
                  :class="['btn rounded-pill px-3 transition-all', activeMetric === t ? 'btn-white shadow-sm active' : 'btn-transparent text-muted']"
                >
                  {{ t }}
                </button>
              </div>
            </div>
            
            <div class="chart-area rounded-4 bg-light p-4 position-relative" style="height: 350px;">
              <svg class="w-100 h-100" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(139, 92, 246, 0.3)" />
                    <stop offset="100%" style="stop-color:rgba(139, 92, 246, 0)" />
                  </linearGradient>
                </defs>
                <path 
                  :d="growthPaths[activeMetric]" 
                  fill="url(#growthGradient)" 
                  class="chart-anim"
                />
                <path 
                  :d="growthPaths[activeMetric]" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  stroke-width="3" 
                  class="stroke-anim"
                />
                <!-- Interactive Data Points -->
                <g class="chart-points">
                  <circle 
                    v-for="(point, index) in chartPoints[activeMetric]" 
                    :key="index"
                    :cx="point.x" 
                    :cy="point.y" 
                    r="5" 
                    fill="#8b5cf6" 
                    stroke="white" 
                    stroke-width="2"
                    class="chart-point transition-all"
                    @mouseenter="hoveredPoint = { ...point, metric: activeMetric }"
                    @mouseleave="hoveredPoint = null"
                  />
                </g>
              </svg>

              <!-- Tooltip -->
              <div 
                v-if="hoveredPoint" 
                class="chart-tooltip animate__animated animate__fadeIn animate__faster position-absolute bg-dark text-white p-2 rounded shadow-lg small"
                :style="{ left: (hoveredPoint.x / 10) + '%', top: (hoveredPoint.y / 3) + '%' }"
              >
                <div class="fw-bold">{{ hoveredPoint.label }}</div>
                <div class="xx-small">{{ hoveredPoint.metric }}: {{ hoveredPoint.value }}</div>
              </div>
              <!-- X-Axis Labels -->
              <div class="d-flex justify-content-between mt-3 text-muted xx-small fw-bold">
                <span>WEEK 1</span>
                <span>WEEK 2</span>
                <span>WEEK 3</span>
                <span>WEEK 4</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribution Chart -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 class="fw-bold mb-4">Device Distribution</h6>
            <div class="d-flex flex-column gap-4 justify-content-center h-100">
              <div v-for="device in devices" :key="device.name">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <i :class="['bi', device.icon, 'text-muted']"></i>
                    <span class="small fw-bold">{{ device.name }}</span>
                  </div>
                  <span class="small text-muted">{{ device.percent }}%</span>
                </div>
                <div class="progress rounded-pill" style="height: 8px;">
                  <div 
                    class="progress-bar rounded-pill" 
                    :class="device.colorClass"
                    :style="{ width: device.percent + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-top">
                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <div class="fw-bold small">Mobile First</div>
                    <div class="text-muted xx-small">+12% growth in mobile users</div>
                  </div>
                  <i class="bi bi-phone-vibrate text-purple fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Projects, Geo Distribution & User Activity -->
      <div class="row g-4 mt-1">
        <div class="col-lg-12">
          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h6 class="fw-bold mb-0">Geographic Distribution</h6>
              <span class="text-muted xx-small fw-bold text-uppercase">Top 5 Regions</span>
            </div>
            <div class="row g-4">
              <div v-for="region in geoDistribution" :key="region.name" class="col-md-2-4">
                <div class="p-3 rounded-4 bg-light border text-center transition-all h-100 d-flex flex-column justify-content-center">
                  <div class="fw-bold small text-dark mb-1">{{ region.name }}</div>
                  <div class="text-purple fw-bold fs-5 mb-1">{{ region.percent }}%</div>
                  <div class="progress rounded-pill" style="height: 4px;">
                    <div class="progress-bar bg-purple rounded-pill" :style="{ width: region.percent + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h6 class="fw-bold mb-0">Top Performing Projects</h6>
              <button class="btn btn-link text-purple p-0 small fw-bold text-decoration-none">View All</button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle border-0">
                <thead>
                  <tr class="text-muted xx-small text-uppercase tracking-wider">
                    <th class="border-0 ps-0">Project</th>
                    <th class="border-0">Engagement</th>
                    <th class="border-0">Growth</th>
                    <th class="border-0 text-end pe-0">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="project in topProjects" :key="project.name">
                    <td class="border-0 ps-0 py-3">
                      <div class="d-flex align-items-center gap-3">
                        <div :class="['icon-box-sm rounded-3 d-flex align-items-center justify-content-center', project.bg]">
                          <i :class="[project.icon, 'small']"></i>
                        </div>
                        <div>
                          <div class="fw-bold small">{{ project.name }}</div>
                          <div class="text-muted xx-small">{{ project.category }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="border-0">
                      <div class="small fw-medium">{{ project.engagement }}k views</div>
                    </td>
                    <td class="border-0">
                      <div class="d-flex align-items-center text-success small">
                        <i class="bi bi-graph-up-arrow me-1"></i>
                        <span class="fw-bold">{{ project.growth }}%</span>
                      </div>
                    </td>
                    <td class="border-0 text-end pe-0">
                      <button class="btn btn-light-purple-sm rounded-pill px-3 py-1 xx-small fw-bold">Review</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 class="fw-bold mb-4">Real-time Activity</h6>
            <div class="activity-feed">
              <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item d-flex gap-3 mb-4 last-child-mb-0">
                <div class="activity-icon-container position-relative">
                  <div :class="['activity-icon rounded-circle d-flex align-items-center justify-content-center shadow-sm', activity.bg]">
                    <i :class="[activity.icon, 'text-white small']"></i>
                  </div>
                  <div v-if="index !== recentActivity.length - 1" class="activity-line"></div>
                </div>
                <div>
                  <div class="small mb-1">
                    <span class="fw-bold text-dark">{{ activity.user }}</span> 
                    <span class="text-muted"> {{ activity.action }} </span>
                    <span class="fw-bold text-purple">{{ activity.target }}</span>
                  </div>
                  <div class="text-muted xx-small fw-bold text-uppercase">{{ activity.time }}</div>
                </div>
              </div>
            </div>
            <button class="btn btn-light w-100 rounded-pill py-2 mt-auto small fw-bold">Load More Activity</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';

const activeMetric = ref('Views');
const hoveredPoint = ref(null);
const isExporting = ref(false);

const exportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
  }, 2000);
};

const kpis = [
  { label: 'Page Views', value: '1.2M', trend: '12.5', trendUp: true, icon: 'bi bi-eye', bgClass: 'bg-light-purple', textClass: 'text-purple' },
  { label: 'Bounce Rate', value: '42.3%', trend: '2.1', trendUp: false, icon: 'bi bi-arrow-repeat', bgClass: 'bg-light-blue', textClass: 'text-blue' },
  { label: 'Avg. Session', value: '4m 32s', trend: '8.4', trendUp: true, icon: 'bi bi-clock', bgClass: 'bg-light-orange', textClass: 'text-orange' },
  { label: 'Conversions', value: '8.2%', trend: '1.2', trendUp: true, icon: 'bi bi-cart-check', bgClass: 'bg-light-green', textClass: 'text-green' }
];

const growthPaths = {
  Views: "M0,200 Q100,150 200,180 T400,100 T600,150 T800,80 T1000,120 L1000,300 L0,300 Z",
  Users: "M0,250 Q150,220 300,240 T500,180 T700,200 T1000,150 L1000,300 L0,300 Z",
  Revenue: "M0,180 Q200,200 400,150 T700,100 T1000,50 L1000,300 L0,300 Z"
};

const chartPoints = {
  Views: [
    { x: 0, y: 200, label: 'Week 1', value: '250k' },
    { x: 250, y: 180, label: 'Week 2', value: '420k' },
    { x: 500, y: 120, label: 'Week 3', value: '890k' },
    { x: 750, y: 90, label: 'Week 4', value: '1.2M' },
    { x: 1000, y: 120, label: 'Current', value: '1.1M' }
  ],
  Users: [
    { x: 0, y: 250, label: 'Week 1', value: '12k' },
    { x: 250, y: 240, label: 'Week 2', value: '18k' },
    { x: 500, y: 190, label: 'Week 3', value: '45k' },
    { x: 750, y: 160, label: 'Week 4', value: '62k' },
    { x: 1000, y: 150, label: 'Current', value: '68k' }
  ],
  Revenue: [
    { x: 0, y: 180, label: 'Week 1', value: '$45k' },
    { x: 250, y: 170, label: 'Week 2', value: '$52k' },
    { x: 500, y: 130, label: 'Week 3', value: '$84k' },
    { x: 750, y: 80, label: 'Week 4', value: '$125k' },
    { x: 1000, y: 50, label: 'Current', value: '$142k' }
  ]
};

const devices = [
  { name: 'Desktop', percent: 58, icon: 'bi-display', colorClass: 'bg-purple' },
  { name: 'Mobile', percent: 34, icon: 'bi-phone', colorClass: 'bg-blue' },
  { name: 'Tablet', percent: 8, icon: 'bi-tablet', colorClass: 'bg-orange' }
];

const geoDistribution = [
  { name: 'United States', percent: 42 },
  { name: 'United Kingdom', percent: 18 },
  { name: 'Germany', percent: 12 },
  { name: 'India', percent: 10 },
  { name: 'Japan', percent: 8 }
];

const topProjects = [
  { name: 'E-Learning Portal', category: 'Education', engagement: 42.5, growth: 18.2, icon: 'bi-book', bg: 'bg-light-purple-soft' },
  { name: 'Crypto Wallet', category: 'Finance', engagement: 38.2, growth: 24.5, icon: 'bi-wallet2', bg: 'bg-light-blue-soft' },
  { name: 'Health Tracker', category: 'Medical', engagement: 29.8, growth: 12.4, icon: 'bi-heart-pulse', bg: 'bg-light-green-soft' },
  { name: 'AI Chatbot', category: 'Tech', engagement: 25.4, growth: 32.1, icon: 'bi-cpu', bg: 'bg-light-orange-soft' }
];

const recentActivity = [
  { user: 'Sarah Chen', action: 'approved project', target: 'Eco-Smart Home', time: '12 MIN AGO', icon: 'bi-check-lg', bg: 'bg-success' },
  { user: 'Marcus Wright', action: 'flagged discussion', target: 'Docker Optimization', time: '45 MIN AGO', icon: 'bi-flag-fill', bg: 'bg-danger' },
  { user: 'Elena Vance', action: 'updated system config', target: 'Auth Provider', time: '2 HOURS AGO', icon: 'bi-gear-fill', bg: 'bg-primary' },
  { user: 'David Smith', action: 'submitted proposal', target: 'AR Navigation', time: '5 HOURS AGO', icon: 'bi-plus-lg', bg: 'bg-purple' }
];
</script>

<style scoped>
.analytics-layout {
  font-family: var(--font-family-base);
}

.icon-box {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box-sm {
  width: 36px;
  height: 36px;
}

.col-md-2-4 {
  flex: 0 0 auto;
  width: 20%;
}

@media (max-width: 992px) {
  .col-md-2-4 {
    width: 33.33%;
  }
}

@media (max-width: 768px) {
  .col-md-2-4 {
    width: 50%;
  }
}

.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.bg-light-purple-soft { background-color: rgba(139, 92, 246, 0.05); color: #8b5cf6; }
.btn-light-purple-sm { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: none; }
.btn-light-purple-sm:hover { background-color: #8b5cf6; color: white; }

.text-purple { color: #8b5cf6; }
.bg-purple { background-color: #8b5cf6; }

.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }
.bg-light-blue-soft { background-color: rgba(59, 130, 246, 0.05); color: #3b82f6; }
.text-blue { color: #3b82f6; }
.bg-blue { background-color: #3b82f6; }

.bg-light-orange { background-color: rgba(245, 158, 11, 0.1); }
.bg-light-orange-soft { background-color: rgba(245, 158, 11, 0.05); color: #f59e0b; }
.text-orange { color: #f59e0b; }
.bg-orange { background-color: #f59e0b; }

.bg-light-green { background-color: rgba(16, 185, 129, 0.1); }
.bg-light-green-soft { background-color: rgba(16, 185, 129, 0.05); color: #10b981; }
.text-green { color: #10b981; }

.xx-small { font-size: 0.65rem; }

.tracking-wider { letter-spacing: 0.05em; }

.shadow-brand {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.chart-anim {
  animation: chart-fade-in 0.8s ease-out;
}

.stroke-anim {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: stroke-draw 1.5s ease-out forwards;
}

@keyframes chart-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes stroke-draw {
  to { stroke-dashoffset: 0; }
}

.btn-white.active {
  background-color: white !important;
  color: #8b5cf6 !important;
}

.bg-success-subtle { background-color: rgba(16, 185, 129, 0.1); }
.bg-danger-subtle { background-color: rgba(239, 68, 68, 0.1); }

.transition-all {
  transition: all 0.2s ease;
}

.btn-transparent {
  background: transparent;
  border: none;
}

.chart-point {
  cursor: pointer;
}

.chart-point:hover {
  r: 8;
  filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.5));
}

.chart-tooltip {
  pointer-events: none;
  z-index: 100;
  transform: translate(-50%, -120%);
  min-width: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  background: rgba(30, 41, 59, 0.95) !important;
}

.activity-feed {
  padding-left: 5px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  z-index: 2;
  position: relative;
}

.activity-line {
  position: absolute;
  top: 32px;
  left: 15px;
  bottom: -24px;
  width: 2px;
  background-color: #f1f5f9;
  z-index: 1;
}

.last-child-mb-0:last-child {
  margin-bottom: 0 !important;
}
</style>
