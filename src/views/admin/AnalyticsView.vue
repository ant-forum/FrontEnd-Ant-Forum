<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import StatCard from '../../components/admin/StatCard.vue';

const isExporting = ref(false);
const activityChartRef = ref(null);
const sourceChartRef = ref(null);
let activityChartInstance = null;
let sourceChartInstance = null;

const exportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    alert('Report generated and downloaded successfully!');
  }, 2000);
};

onMounted(() => {
  // User Engagement Chart
  if (activityChartRef.value) {
    activityChartInstance = new Chart(activityChartRef.value, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Active Sessions',
          data: [450, 590, 800, 810, 560, 550, 940],
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#7c3aed',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1b4b',
            titleFont: { family: 'Sora', weight: 'bold' },
            bodyFont: { family: 'Sora' },
            padding: 12,
            cornerRadius: 10,
            displayColors: false
          }
        },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { font: { size: 10, family: 'Sora' } }
          },
          x: { 
            grid: { display: false },
            ticks: { font: { size: 10, family: 'Sora' } }
          }
        }
      }
    });
  }

  // Traffic Sources Chart
  if (sourceChartRef.value) {
    sourceChartInstance = new Chart(sourceChartRef.value, {
      type: 'doughnut',
      data: {
        labels: ['Direct', 'Social', 'Search'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: ['#7c3aed', '#0ea5e9', '#f59e0b'],
          borderWidth: 0,
          cutout: '75%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1b4b',
            padding: 12,
            cornerRadius: 10,
            displayColors: true
          }
        }
      }
    });
  }
});

onUnmounted(() => {
  if (activityChartInstance) activityChartInstance.destroy();
  if (sourceChartInstance) sourceChartInstance.destroy();
});

const kpis = [
  { label: 'Active Sessions', value: '1,284', trend: '12', trendUp: true, icon: 'bi-people-fill', bgClass: 'bg-purple-subtle', textClass: 'text-purple' },
  { label: 'Platform Revenue', value: '$24,500', trend: '8', trendUp: true, icon: 'bi-currency-dollar', bgClass: 'bg-success-subtle', textClass: 'text-success' },
  { label: 'New Projects', value: '432', trend: '5', trendUp: false, icon: 'bi-folder-fill', bgClass: 'bg-info-subtle', textClass: 'text-info' },
  { label: 'Retention Rate', value: '78.4%', trend: '3', trendUp: true, icon: 'bi-graph-up-arrow', bgClass: 'bg-warning-subtle', textClass: 'text-warning' }
];

const recentEvents = [
  { 
    id: 1, 
    title: 'New Project Submitted', 
    description: 'Nexus Dashboard by @alex', 
    user: 'Alex Rivera', 
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'PENDING', 
    statusClass: 'bg-warning-subtle text-warning',
    time: '2 mins ago',
    icon: 'bi-file-earmark-plus',
    bgClass: 'bg-info-subtle',
    textClass: 'text-info'
  },
  { 
    id: 2, 
    title: 'Security Alert', 
    description: 'Multiple failed login attempts', 
    user: 'System Bot', 
    userAvatar: 'https://i.pravatar.cc/150?u=bot',
    status: 'RESOLVED', 
    statusClass: 'bg-success-subtle text-success',
    time: '15 mins ago',
    icon: 'bi-shield-exclamation',
    bgClass: 'bg-danger-subtle',
    textClass: 'text-danger'
  },
  { 
    id: 3, 
    title: 'Payout Processed', 
    description: '$1,200 to @sarah', 
    user: 'Sarah Jenkins', 
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    status: 'COMPLETED', 
    statusClass: 'bg-purple-subtle text-purple',
    time: '1 hour ago',
    icon: 'bi-bank',
    bgClass: 'bg-success-subtle',
    textClass: 'text-success'
  }
];
</script>

<template>
  <div class="analytics-layout d-flex min-vh-100 bg-light">
    <AdminSidebar activePage="analytics" />
    
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
        <!-- Header -->
        <header class="analytics-header mb-5">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 class="fw-bold mb-1">Advanced Analytics</h2>
              <p class="text-muted small mb-0 d-flex align-items-center gap-2">
                <span class="live-dot-sm"></span>
                Real-time platform performance and user behavior insights
              </p>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button 
                class="btn btn-white border shadow-sm rounded-pill px-4 py-2 fw-bold small d-flex align-items-center gap-2 transition-all hover-bg-light"
                @click="exportReport"
                :disabled="isExporting"
              >
                <span v-if="isExporting" class="spinner-border spinner-border-sm" role="status"></span>
                <i v-else class="bi bi-file-earmark-pdf"></i>
                {{ isExporting ? 'Generating...' : 'Export PDF' }}
              </button>
              <div class="dropdown">
                <button class="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-brand dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                  <i class="bi bi-calendar3"></i> Last 30 Days
                </button>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-4 p-2 mt-2">
                  <li><a class="dropdown-item rounded-3 small py-2" href="#"><i class="bi bi-clock-history me-2"></i> Last 7 Days</a></li>
                  <li><a class="dropdown-item rounded-3 small py-2 active bg-purple" href="#"><i class="bi bi-calendar-check me-2"></i> Last 30 Days</a></li>
                  <li><a class="dropdown-item rounded-3 small py-2" href="#"><i class="bi bi-calendar-range me-2"></i> Last 90 Days</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item rounded-3 small py-2 text-purple fw-bold" href="#"><i class="bi bi-plus-circle me-2"></i> Custom Range</a></li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        <!-- Key Performance Indicators -->
        <div class="row g-4 mb-5">
          <div v-for="kpi in kpis" :key="kpi.label" class="col-md-6 col-xl-3">
            <StatCard
              :label="kpi.label"
              :value="kpi.value"
              :icon="kpi.icon"
              :icon-color-class="kpi.textClass"
              :icon-bg-class="kpi.bgClass"
            >
              <template #footer>
                <div :class="['badge rounded-pill px-2 py-1 x-small fw-bold d-flex align-items-center gap-1', kpi.trendUp ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger']">
                  <i :class="['bi', kpi.trendUp ? 'bi-arrow-up-short' : 'bi-arrow-down-short']"></i>
                  {{ kpi.trend }}%
                </div>
              </template>
            </StatCard>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row g-4 mb-5">
          <!-- User Activity Chart -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-5 p-4 h-100 chart-card-modern position-relative overflow-hidden bg-white">
              <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1">
                <div>
                  <h5 class="fw-bold mb-1">User Engagement</h5>
                  <p class="text-muted xx-small mb-0">Active sessions and interaction volume</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-light btn-sm rounded-pill px-3 active">Daily</button>
                  <button class="btn btn-light btn-sm rounded-pill px-3">Weekly</button>
                </div>
              </div>
              <div class="chart-container" style="height: 320px;">
                <canvas ref="activityChartRef"></canvas>
              </div>
              <div class="chart-abstract-pattern"></div>
            </div>
          </div>
          
          <!-- Distribution Chart -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm rounded-5 p-4 h-100 chart-card-modern bg-white">
              <h5 class="fw-bold mb-1">Traffic Sources</h5>
              <p class="text-muted xx-small mb-4">Device and channel distribution</p>
              <div class="chart-container d-flex align-items-center justify-content-center" style="height: 280px;">
                <canvas ref="sourceChartRef"></canvas>
              </div>
              <div class="mt-4 pt-3 border-top">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="font-xs text-muted d-flex align-items-center gap-2"><span class="dot bg-purple"></span> Direct</span>
                  <span class="font-xs fw-bold">45%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="font-xs text-muted d-flex align-items-center gap-2"><span class="dot bg-info"></span> Social</span>
                  <span class="font-xs fw-bold">30%</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="font-xs text-muted d-flex align-items-center gap-2"><span class="dot bg-warning"></span> Search</span>
                  <span class="font-xs fw-bold">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Activity Table -->
        <div class="card border-0 shadow-sm rounded-5 p-4 bg-white">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 class="fw-bold mb-1">Live Events Feed</h5>
              <p class="text-muted xx-small mb-0">Recent interactions and system activities</p>
            </div>
            <button class="btn btn-light-purple btn-sm rounded-pill px-3 fw-bold font-xs text-purple">View All Events</button>
          </div>
          
          <div class="table-responsive">
            <table class="table table-hover align-middle border-0">
              <thead class="bg-light-purple">
                <tr>
                  <th class="border-0 rounded-start-4 py-3 font-xs text-muted text-uppercase tracking-wider">Event Type</th>
                  <th class="border-0 py-3 font-xs text-muted text-uppercase tracking-wider">Initiated By</th>
                  <th class="border-0 py-3 font-xs text-muted text-uppercase tracking-wider">Status</th>
                  <th class="border-0 py-3 font-xs text-muted text-uppercase tracking-wider">Timestamp</th>
                  <th class="border-0 rounded-end-4 py-3 font-xs text-muted text-uppercase tracking-wider text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in recentEvents" :key="event.id" class="transition-all hover-bg-light">
                  <td class="py-4 border-0">
                    <div class="d-flex align-items-center gap-3">
                      <div :class="['icon-box-sm rounded-circle d-flex align-items-center justify-content-center', event.bgClass]">
                        <i :class="['bi', event.icon, event.textClass]"></i>
                      </div>
                      <div>
                        <div class="fw-bold small">{{ event.title }}</div>
                        <div class="xx-small text-muted">{{ event.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 border-0">
                    <div class="d-flex align-items-center gap-2">
                      <img :src="event.userAvatar" class="rounded-circle" width="24" height="24">
                      <span class="small fw-medium">{{ event.user }}</span>
                    </div>
                  </td>
                  <td class="py-4 border-0">
                    <span :class="['badge rounded-pill px-3 py-1 font-xxs fw-bold', event.statusClass]">
                      {{ event.status }}
                    </span>
                  </td>
                  <td class="py-4 border-0 font-xs text-muted">{{ event.time }}</td>
                  <td class="py-4 border-0 text-end">
                    <button class="btn btn-icon-sm rounded-circle bg-light transition-all hover-bg-purple hover-text-white">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.live-dot-sm {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.hover-bg-light:hover { background-color: #f8fafc !important; }

.fw-black { font-weight: 900; }

.transition-up {
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.transition-up:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1) !important;
}

.m-n3 { margin: -1rem !important; }

.chart-card-modern {
  border: 1px solid #f1f5f9 !important;
}

.chart-abstract-pattern {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 150px;
  height: 150px;
  background-image: radial-gradient(#7c3aed 0.5px, transparent 0.5px);
  background-size: 15px 15px;
  opacity: 0.05;
  pointer-events: none;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.bg-purple { background-color: #7c3aed; }
.bg-info { background-color: #0ea5e9; }
.bg-warning { background-color: #f59e0b; }

.font-xxs { font-size: 0.65rem; }

.analytics-layout {
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box-sm {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-purple-subtle { background-color: #f5f3ff; }
.bg-success-subtle { background-color: #f0fdf4; }
.bg-info-subtle { background-color: #f0f9ff; }
.bg-warning-subtle { background-color: #fffbeb; }
.bg-danger-subtle { background-color: #fef2f2; }

.text-purple { color: #7c3aed; }
.text-success { color: #10b981; }
.text-info { color: #0ea5e9; }
.text-warning { color: #f59e0b; }
.text-danger { color: #ef4444; }

.bg-light-purple { background-color: #f8f7ff; }

.btn-white {
  background-color: white;
  color: #1e293b;
}

.shadow-brand {
  box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
}

.x-small { font-size: 0.7rem; }
.xx-small { font-size: 0.65rem; }
.font-xs { font-size: 0.75rem; }

.last-child-border-0:last-child {
  border-bottom: 0 !important;
}

.hover-text-white:hover i {
  color: white !important;
}

.rounded-start-4 { border-top-left-radius: 1rem !important; border-bottom-left-radius: 1rem !important; }
.rounded-end-4 { border-top-right-radius: 1rem !important; border-bottom-right-radius: 1rem !important; }
</style>
