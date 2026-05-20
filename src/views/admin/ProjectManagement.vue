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
            <h4 class="fw-bold mb-0">{{ totalProjects }}</h4>
          </div>
          <div class="metric-mini p-3 bg-white rounded-4 border shadow-sm text-center" style="min-width: 140px;">
            <p class="text-muted small text-uppercase fw-bold mb-1">Pending Approval</p>
            <h4 class="fw-bold mb-0">{{ pendingProjects }}</h4>
          </div>
          <div class="metric-mini p-3 bg-white rounded-4 border shadow-sm text-center" style="min-width: 140px;">
            <p class="text-muted small text-uppercase fw-bold mb-1">Active</p>
            <h4 class="fw-bold mb-0">{{ activeProjects }}</h4>
          </div>
        </div>
      </header>

      <!-- Search and Filters -->
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="input-group search-group shadow-sm rounded-pill overflow-hidden border">
            <span class="input-group-text bg-white border-0 ps-3">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-0 py-2" 
              placeholder="Search projects, stack, or leads..."
            >
          </div>
        </div>
        <div class="col-md-6 d-flex justify-content-md-end gap-2">
          <select v-model="statusFilter" class="form-select rounded-pill border shadow-sm px-4" style="width: auto;">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged</option>
          </select>
          <select v-model="sortBy" class="form-select rounded-pill border shadow-sm px-4" style="width: auto;">
            <option value="newest">Newest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      <!-- Tabs and Filter -->
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <ul class="nav nav-tabs border-0">
          <li class="nav-item">
            <button 
              class="nav-link fw-bold border-0 px-0 me-4" 
              :class="{ active: currentTab === 'all' }"
              @click="currentTab = 'all'"
            >ALL PROJECTS</button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link text-muted fw-bold border-0 px-0 me-4" 
              :class="{ active: currentTab === 'assignments' }"
              @click="currentTab = 'assignments'"
            >MY ASSIGNMENTS</button>
          </li>
          <li class="nav-item">
            <button 
              class="nav-link text-muted fw-bold border-0 px-0" 
              :class="{ active: currentTab === 'archived' }"
              @click="currentTab = 'archived'"
            >ARCHIVED</button>
          </li>
        </ul>
      </div>

      <!-- Project Grid -->
      <div v-if="filteredProjects.length > 0" class="row g-4">
        <div v-for="project in filteredProjects" :key="project.id" class="col-md-6 col-lg-4">
          <ProjectCard 
            v-bind="project" 
            @approve="handleApprove"
            @reject="handleReject"
            @delete="handleDelete"
          />
        </div>

        <!-- Submit New Proposal Placeholder -->
        <div class="col-md-6 col-lg-4">
          <router-link to="/admin/projects/create" class="text-decoration-none">
            <div class="submit-proposal-card h-100 rounded-4 d-flex flex-column align-items-center justify-content-center p-4">
              <div class="icon-circle mb-3">
                <i class="bi bi-plus fs-2 text-muted"></i>
              </div>
              <h6 class="fw-bold mb-1 text-dark">Submit New Proposal</h6>
              <p class="text-muted small text-center mb-0">Connect your repository to begin the vetting process.</p>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5">
        <div class="mb-3">
          <i class="bi bi-folder2-open fs-1 text-muted opacity-50"></i>
        </div>
        <h5 class="fw-bold">No projects found</h5>
        <p class="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
        <button class="btn btn-outline-primary rounded-pill px-4 mt-2" @click="resetFilters">
          Clear All Filters
        </button>
      </div>

      <!-- Floating Action Button -->
      <router-link to="/admin/projects/create" class="fab-btn btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center">
        <i class="bi bi-plus-lg"></i>
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ProjectCard from '../../components/admin/ProjectCard.vue';

const searchQuery = ref('');
const statusFilter = ref('ALL');
const sortBy = ref('newest');
const currentTab = ref('all');

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

// Metrics
const totalProjects = computed(() => projects.value.length);
const pendingProjects = computed(() => projects.value.filter(p => p.status === 'PENDING REVIEW').length);
const activeProjects = computed(() => projects.value.filter(p => p.status === 'ACTIVE').length);

// Filtering and Sorting
const filteredProjects = computed(() => {
  let result = [...projects.value];

  // Tab filter (Mock assignments and archived)
  if (currentTab.value === 'assignments') {
    result = result.filter(p => p.id % 2 === 0);
  } else if (currentTab.value === 'archived') {
    result = []; // Mock empty archived
  }

  // Status filter
  if (statusFilter.value !== 'ALL') {
    result = result.filter(p => p.status === statusFilter.value);
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.techStack.some(t => t.toLowerCase().includes(query)) ||
      p.member.name.toLowerCase().includes(query)
    );
  }

  // Sort
  if (sortBy.value === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    result.sort((a, b) => b.id - a.id); // Newest first
  }

  return result;
});

// Actions
const handleApprove = (id) => {
  const project = projects.value.find(p => p.id === id);
  if (project) project.status = 'ACTIVE';
};

const handleReject = (id) => {
  const project = projects.value.find(p => p.id === id);
  if (project) project.status = 'FLAGGED';
};

const handleDelete = (id) => {
  projects.value = projects.value.filter(p => p.id !== id);
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
  sortBy.value = 'newest';
  currentTab.value = 'all';
};
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
  background: transparent;
}

.nav-tabs .nav-link.active {
  color: #1e293b !important;
  border-bottom: 2px solid #8b5cf6 !important;
}

.search-group input:focus {
  box-shadow: none;
}

.search-group:focus-within {
  border-color: #8b5cf6 !important;
}

.form-select:focus {
  box-shadow: none;
  border-color: #8b5cf6;
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
