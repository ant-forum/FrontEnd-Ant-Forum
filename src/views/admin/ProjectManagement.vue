<template>
  <div class="project-management-layout d-flex bg-light min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="flex-grow-1 p-4 p-lg-5">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="fw-bold mb-1">Project Ecosystem</h2>
          <p class="text-muted small mb-0">Monitor, approve, and manage platform initiatives</p>
        </div>
      </div>

      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div 
            :class="['metric-card p-4 rounded-4 border bg-white shadow-sm h-100 d-flex justify-content-between align-items-center cursor-pointer transition-all', statusFilter === 'ALL' ? 'active-metric' : '']"
            @click="statusFilter = 'ALL'"
          >
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Total Projects</p>
              <h2 class="fw-bold mb-1">{{ totalProjects }}</h2>
              <div class="d-flex align-items-center text-success small">
                <i class="bi bi-arrow-up-right me-1"></i>
                <span class="fw-bold">Active initiatives</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-purple p-3">
              <i class="bi bi-folder text-purple fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            :class="['metric-card p-4 rounded-4 border bg-white shadow-sm h-100 d-flex justify-content-between align-items-center cursor-pointer transition-all', statusFilter === 'PENDING REVIEW' ? 'active-metric' : '']"
            @click="statusFilter = 'PENDING REVIEW'"
          >
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Pending</p>
              <h2 class="fw-bold mb-1">{{ pendingProjects }}</h2>
              <div class="d-flex align-items-center text-warning small">
                <i class="bi bi-clock-history me-1"></i>
                <span class="fw-bold">Awaiting approval</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-orange p-3">
              <i class="bi bi-clock-history text-orange fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            :class="['metric-card p-4 rounded-4 border bg-white shadow-sm h-100 d-flex justify-content-between align-items-center cursor-pointer transition-all', statusFilter === 'ACTIVE' ? 'active-metric' : '']"
            @click="statusFilter = 'ACTIVE'"
          >
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Live</p>
              <h2 class="fw-bold mb-1">{{ activeProjects }}</h2>
              <div class="d-flex align-items-center text-green small">
                <i class="bi bi-lightning-charge me-1"></i>
                <span class="fw-bold">In production</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-green p-3">
              <i class="bi bi-lightning-charge text-green fs-4"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div 
            :class="['metric-card p-4 rounded-4 border bg-white shadow-sm h-100 d-flex justify-content-between align-items-center cursor-pointer transition-all', statusFilter === 'FLAGGED' ? 'active-metric' : '']"
            @click="statusFilter = 'FLAGGED'"
          >
            <div>
              <p class="text-muted text-uppercase fw-bold small mb-1" style="letter-spacing: 0.5px;">Alerts</p>
              <h2 class="fw-bold mb-1">{{ projects.filter(p => p.status === 'FLAGGED').length }}</h2>
              <div class="d-flex align-items-center text-red small">
                <i class="bi bi-exclamation-triangle me-1"></i>
                <span class="fw-bold">Requires attention</span>
              </div>
            </div>
            <div class="icon-box rounded-circle bg-light-red p-3">
              <i class="bi bi-exclamation-triangle text-red fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Row -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-4">
        <!-- Tabs -->
        <ul class="nav nav-pills custom-pills bg-white p-1 rounded-pill shadow-sm">
          <li class="nav-item">
            <button 
              :class="['nav-link rounded-pill px-4 fw-bold', currentTab === 'all' ? 'active' : '']"
              @click="currentTab = 'all'"
            >All</button>
          </li>
          <li class="nav-item">
            <button 
              :class="['nav-link rounded-pill px-4 fw-bold', currentTab === 'assignments' ? 'active' : '']"
              @click="currentTab = 'assignments'"
            >Assignments</button>
          </li>
          <li class="nav-item">
            <button 
              :class="['nav-link rounded-pill px-4 fw-bold', currentTab === 'archived' ? 'active' : '']"
              @click="currentTab = 'archived'"
            >Archived</button>
          </li>
        </ul>

        <!-- Search & Filters -->
        <div class="d-flex gap-3 flex-grow-1 justify-content-md-end">
          <div class="input-group search-group shadow-sm rounded-pill overflow-hidden border bg-white">
            <span class="input-group-text bg-transparent border-0 ps-3">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-0 py-2 small" 
              placeholder="Search projects..."
              style="font-size: 0.9rem;"
            >
          </div>
          <select v-model="statusFilter" class="form-select rounded-pill border-0 shadow-sm px-4 bg-white fw-bold small" style="width: auto; font-size: 0.85rem;">
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING REVIEW">Review</option>
            <option value="FLAGGED">Flagged</option>
          </select>
        </div>
      </div>

      <!-- Project Grid -->
      <div v-if="filteredProjects.length > 0" class="row g-4">
        <div v-for="project in filteredProjects" :key="project.id" class="col-md-6 col-lg-4">
          <ProjectCard 
            v-bind="project" 
            @approve="handleApprove"
            @reject="handleReject"
            @delete="handleDelete"
            @view="handleViewProject"
          />
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
    </main>

    <!-- Project Detail Modal -->
    <ProjectDetailModal 
      v-if="selectedProject"
      :show="showDetailModal"
      :project="selectedProject"
      @close="closeDetailModal"
      @save="handleSaveProject"
      @delete="handleDeleteProjectFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import ProjectCard from '../../components/admin/ProjectCard.vue';
import ProjectDetailModal from '../../components/admin/ProjectDetailModal.vue';

const searchQuery = ref('');
const statusFilter = ref('ALL');
const sortBy = ref('newest');
const currentTab = ref('all');

const showDetailModal = ref(false);
const selectedProject = ref(null);

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

const handleViewProject = (id) => {
  const project = projects.value.find(p => p.id === id);
  if (project) {
    selectedProject.value = project;
    showDetailModal.value = true;
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  setTimeout(() => {
    selectedProject.value = null;
  }, 200);
};

const handleSaveProject = (updatedProject) => {
  const index = projects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    projects.value[index] = updatedProject;
  }
  closeDetailModal();
};

const handleDeleteProjectFromModal = (id) => {
  handleDelete(id);
  closeDetailModal();
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

.icon-box {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-purple { background-color: rgba(139, 92, 246, 0.1); }
.text-purple { color: #8b5cf6; }

.bg-light-orange { background-color: rgba(245, 158, 11, 0.1); }
.text-orange { color: #f59e0b; }

.bg-light-red { background-color: rgba(239, 68, 68, 0.1); }
.text-red { color: #ef4444; }

.bg-light-green { background-color: rgba(16, 185, 129, 0.1); }
.text-green { color: #10b981; }

.bg-light-blue { background-color: rgba(59, 130, 246, 0.1); }
.text-blue { color: #3b82f6; }

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
  border-color: #8b5cf6 !important;
}

.active-metric {
  border-color: #8b5cf6 !important;
  background-color: rgba(139, 92, 246, 0.02) !important;
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.1) !important;
}

.custom-pills {
  border: 1px solid #f1f5f9;
}

.custom-pills .nav-link {
  color: #64748b;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.custom-pills .nav-link.active {
  background-color: #8b5cf6;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
}

.search-group {
  max-width: 300px;
}

.submit-proposal-card {
  border: 2px dashed #cbd5e1;
  background-color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.submit-proposal-card:hover {
  border-color: #8b5cf6;
  background-color: rgba(139, 92, 246, 0.02);
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05) !important;
}

.icon-circle-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.submit-proposal-card:hover .icon-circle-large {
  transform: scale(1.1) rotate(90deg);
  background-color: rgba(139, 92, 246, 0.1);
}

.bg-light-purple-soft {
  background-color: #f8faff;
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
