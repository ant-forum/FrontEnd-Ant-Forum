<template>
  <div class="thread-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Threads</p>
              <h2 class="fw-bold mb-1">842</h2>
              <div class="d-flex align-items-center text-success small">
                <i class="bi bi-graph-up me-1"></i>
                <span class="fw-bold">+5.2% this week</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-purple p-3">
              <i class="bi bi-chat-dots text-purple fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Comments</p>
              <h2 class="fw-bold mb-1">12.5k</h2>
              <div class="d-flex align-items-center text-primary small">
                <i class="bi bi-activity me-1"></i>
                <span class="fw-bold">Trending high</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-blue p-3">
              <i class="bi bi-chat-left-text text-blue fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Flagged Content</p>
              <h2 class="fw-bold mb-1">14</h2>
              <div class="d-flex align-items-center text-danger small">
                <i class="bi bi-exclamation-circle-fill me-1"></i>
                <span class="fw-bold">Needs attention</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-red p-3">
              <i class="bi bi-flag text-red fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Directory and Details -->
      <div class="row g-4">
        <div class="col-xl-8">
          <ThreadTable @select-thread="selectedThread = $event" />
        </div>
        <div class="col-xl-4">
          <ThreadDetailCard :thread="selectedThread" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ThreadTable from '../../components/admin/ThreadTable.vue';
import ThreadDetailCard from '../../components/admin/ThreadDetailCard.vue';

const selectedThread = ref({
  id: 1,
  title: 'How to optimize Docker images for Node.js?',
  status: 'ACTIVE',
  statusClass: 'status-active',
  author: { name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=david' },
  replies: 24,
  reports: 0
});
</script>

<style scoped>
.thread-management-layout {
  font-family: var(--font-family-base);
}

.icon-box {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.text-purple { color: #8b5cf6; }

.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }
.text-blue { color: #3b82f6; }

.bg-light-red { background-color: rgba(239, 68, 68, 0.1); }
.text-red { color: #ef4444; }

.bg-light {
  background-color: #f8fafc !important;
}
</style>
