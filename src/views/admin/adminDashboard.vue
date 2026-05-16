<template>
  <div class="admin-dashboard-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <header class="dashboard-header mb-5">
        <h2 class="fw-bold mb-1">Platform Overview</h2>
        <p class="text-muted mb-0">Real-time metrics and system health monitoring</p>
      </header>

      <div class="row g-4">
        <!-- Center Column -->
        <div class="col-xl-8">
          <!-- Metrics Row -->
          <div class="row g-4 mb-4">
            <div class="col-md-6 col-lg-3">
              <MetricCard 
                label="Total Developers" 
                value="42.5k" 
                trend="12.4" 
                trendType="up"
                icon="bi bi-people-fill"
              />
            </div>
            <div class="col-md-6 col-lg-3">
              <MetricCard 
                label="Active Repositories" 
                value="12.8k" 
                trend="8.1" 
                trendType="up"
                icon="bi bi-journal-bookmark-fill"
              />
            </div>
            <div class="col-md-6 col-lg-3">
              <MetricCard 
                label="Community Contributions" 
                value="8.2k" 
                trend="24.5" 
                trendType="up"
                icon="bi bi-heart-fill"
              />
            </div>
            <div class="col-md-6 col-lg-3">
              <MetricCard 
                label="Expert Blogs" 
                value="3.4k" 
                trend="1.2" 
                trendType="down"
                icon="bi bi-rss-fill"
              />
            </div>
          </div>

          <!-- Platform Engagement Chart -->
          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h6 class="fw-bold mb-1">Platform Engagement</h6>
                <p class="text-muted small mb-0">User interactions and platform growth trends</p>
              </div>
              <div class="dropdown">
                <button class="btn btn-light btn-sm rounded-pill px-3 dropdown-toggle" type="button">
                  Last 12 Months
                </button>
              </div>
            </div>
            <div class="chart-container rounded-4 bg-dark d-flex align-items-center justify-content-center" style="height: 300px; overflow: hidden;">
              <!-- Placeholder for Chart -->
              <div class="w-100 h-100 position-relative">
                <div class="engagement-grid w-100 h-100 position-absolute"></div>
                <div class="engagement-line"></div>
                <span class="position-absolute top-0 end-0 m-3 text-white-50 small">160</span>
              </div>
            </div>
          </div>

          <!-- Network Topology -->
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h6 class="fw-bold mb-1">Network Topology</h6>
                <div class="d-flex gap-3 mt-1">
                  <small class="text-primary fw-bold" style="font-size: 0.65rem;">1,204 ACTIVE NODES</small>
                  <small class="text-success fw-bold" style="font-size: 0.65rem;">24ms LATENCY</small>
                </div>
              </div>
              <a href="#" class="text-primary small text-decoration-none fw-bold">View Map</a>
            </div>
            <div class="topology-map rounded-4 d-flex align-items-center justify-content-center position-relative" style="height: 350px; background: #f1f5f9;">
              <!-- Map Visualization Placeholder -->
              <div class="map-overlay position-absolute top-0 end-0 m-4 p-3 bg-white rounded-3 shadow-sm border" style="z-index: 2;">
                <ul class="list-unstyled mb-0" style="font-size: 0.65rem;">
                  <li class="mb-2 d-flex align-items-center">
                    <span class="dot rounded-circle bg-success me-2" style="width: 6px; height: 6px;"></span>
                    <span class="text-muted fw-bold">US-EAST: NORMAL</span>
                  </li>
                  <li class="mb-2 d-flex align-items-center">
                    <span class="dot rounded-circle bg-success me-2" style="width: 6px; height: 6px;"></span>
                    <span class="text-muted fw-bold">EU-WEST: NORMAL</span>
                  </li>
                  <li class="d-flex align-items-center">
                    <span class="dot rounded-circle bg-warning me-2" style="width: 6px; height: 6px;"></span>
                    <span class="text-muted fw-bold">AS-SOUTH: BUSY</span>
                  </li>
                </ul>
              </div>
              <div class="topology-grid w-100 h-100"></div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col-xl-4">
          <SystemEvents />
          <ActiveSessions />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import MetricCard from '../../components/admin/MetricCard.vue';
import SystemEvents from '../../components/admin/SystemEvents.vue';
import ActiveSessions from '../../components/admin/ActiveSessions.vue';
</script>

<style scoped>
.admin-dashboard-layout {
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.chart-container {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
}

.engagement-grid {
  background-image: 
    linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.engagement-line {
  position: absolute;
  bottom: 20%;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%);
  clip-path: polygon(0% 100%, 10% 80%, 20% 90%, 30% 60%, 40% 70%, 50% 30%, 60% 50%, 70% 20%, 80% 40%, 90% 10%, 100% 30%, 100% 100%);
  border-top: 2px solid #a78bfa;
}

.topology-map {
  background-image: radial-gradient(circle at center, #cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
}

.topology-grid {
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
}

.bg-light {
  background-color: #f8fafc !important;
}
</style>
