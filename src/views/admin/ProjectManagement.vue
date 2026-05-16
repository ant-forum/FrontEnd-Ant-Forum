<template>
  <div class="project-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <header class="d-flex justify-content-between align-items-start mb-5">
        <div>
          <h1 class="fw-bold mb-1">Projects</h1>
          <p class="text-muted mb-0">Manage and monitor ecosystem initiatives.</p>
        </div>
        <div class="d-flex gap-3">
          <div class="metric-mini p-3 bg-white rounded-4 border shadow-sm text-center" style="min-width: 140px;">
            <p class="text-muted small text-uppercase fw-bold mb-1">Total Projects</p>
            <h4 class="fw-bold mb-0">1,284 <small class="text-success fs-6">+12%</small></h4>
          </div>
          <div class="metric-mini p-3 bg-white rounded-4 border shadow-sm text-center" style="min-width: 140px;">
            <p class="text-muted small text-uppercase fw-bold mb-1">Pending Approval</p>
            <h4 class="fw-bold mb-0">42 <small class="text-warning fs-6" style="font-size: 0.7rem;">Priority</small></h4>
          </div>
          <div class="metric-mini p-3 bg-white rounded-4 border shadow-sm text-center" style="min-width: 140px;">
            <p class="text-muted small text-uppercase fw-bold mb-1">Trending (7D)</p>
            <h4 class="fw-bold mb-0">18 <small class="text-purple fs-6" style="font-size: 0.7rem;">Rising</small></h4>
          </div>
        </div>
      </header>

      <!-- Tabs and Filter -->
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <ul class="nav nav-tabs border-0">
          <li class="nav-item">
            <a class="nav-link active fw-bold border-0 px-0 me-4" href="#">ALL PROJECTS</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-muted fw-bold border-0 px-0 me-4" href="#">MY ASSIGNMENTS</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-muted fw-bold border-0 px-0" href="#">ARCHIVED</a>
          </li>
        </ul>
        <div class="d-flex align-items-center">
          <span class="text-muted small me-2">Sort by:</span>
          <div class="dropdown">
            <button class="btn btn-light btn-sm rounded-pill px-3 dropdown-toggle fw-bold" type="button">
              Latest
            </button>
          </div>
        </div>
      </div>

      <!-- Project Grid -->
      <div class="row g-4">
        <div v-for="project in projects" :key="project.id" class="col-md-6 col-lg-4">
          <ProjectCard v-bind="project" />
        </div>

        <!-- Submit New Proposal Placeholder -->
        <div class="col-md-6 col-lg-4">
          <div class="submit-proposal-card h-100 rounded-4 d-flex flex-column align-items-center justify-content-center p-4">
            <div class="icon-circle mb-3">
              <i class="bi bi-plus fs-2 text-muted"></i>
            </div>
            <h6 class="fw-bold mb-1">Submit New Proposal</h6>
            <p class="text-muted small text-center mb-0">Connect your repository to begin the vetting process.</p>
          </div>
        </div>
      </div>

      <!-- Floating Action Button -->
      <button class="fab-btn btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center">
        <i class="bi bi-plus-lg"></i>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ProjectCard from '../../components/admin/ProjectCard.vue';

const projects = ref([
  {
    id: 1,
    title: 'Neural Mesh API',
    description: 'Decentralized node infrastructure for high-throughput data processing and relay.',
    status: 'ACTIVE',
    icon: 'bi bi-cpu',
    iconBgClass: 'bg-light-purple text-purple',
    techStack: ['Node.js', 'GraphQL', 'Redis'],
    member: {
      name: 'Alex Rivera',
      role: 'LEAD DEV',
      avatar: 'https://i.pravatar.cc/150?u=alex'
    }
  },
  {
    id: 2,
    title: 'Crystal UI Kit',
    description: 'Universal component library focusing on glassmorphism and modern accessibility.',
    status: 'PENDING REVIEW',
    icon: 'bi bi-shield-lock',
    iconBgClass: 'bg-light-orange text-orange',
    techStack: ['React', 'Tailwind', 'Framer'],
    member: {
      name: 'Sarah Chen',
      role: 'UX ARCHITECT',
      avatar: 'https://i.pravatar.cc/150?u=sarahc'
    }
  },
  {
    id: 3,
    title: 'CryptoSettle V2',
    description: 'Automated liquidation protocol for cross-chain liquidity providers and AMMs.',
    status: 'FLAGGED',
    icon: 'bi bi-exclamation-octagon',
    iconBgClass: 'bg-light-red text-red',
    techStack: ['Rust', 'Solana', 'Web3'],
    member: {
      name: 'Marcus Thorne',
      role: 'PROTOCOL LEAD',
      avatar: 'https://i.pravatar.cc/150?u=marcus'
    }
  },
  {
    id: 4,
    title: 'StreamForge',
    description: 'Low-latency video encoding and streaming engine designed for edge computing.',
    status: 'ACTIVE',
    icon: 'bi bi-braces',
    iconBgClass: 'bg-light-blue text-blue',
    techStack: ['C++', 'WASM', 'Kafka'],
    member: {
      name: 'Elena Vance',
      role: 'SYSTEMS ENG',
      avatar: 'https://i.pravatar.cc/150?u=elena'
    }
  }
]);
</script>

<style scoped>
.project-management-layout {
  font-family: var(--font-family-base);
}

.text-purple { color: #8b5cf6; }
.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }

.text-orange { color: #f59e0b; }
.bg-light-orange { background-color: rgba(245, 158, 11, 0.1); }

.text-red { color: #ef4444; }
.bg-light-red { background-color: rgba(239, 68, 68, 0.1); }

.text-blue { color: #3b82f6; }
.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }

.nav-tabs .nav-link {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.nav-tabs .nav-link.active {
  background-color: transparent;
  color: var(--color-text) !important;
  border-bottom: 2px solid #8b5cf6 !important;
}

.submit-proposal-card {
  border: 2px dashed #e2e8f0;
  background-color: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.submit-proposal-card:hover {
  border-color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.02);
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  font-size: 1.5rem;
  z-index: 1000;
  background-color: #8b5cf6;
  border: none;
}

.bg-light {
  background-color: #f8fafc !important;
}
</style>
