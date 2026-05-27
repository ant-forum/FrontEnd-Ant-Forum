<template>
  <div class="project-management-layout d-flex min-vh-100">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <main class="admin-main flex-grow-1">
      <div class="admin-content-wrapper">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="fw-bold mb-1 text-adaptive">Project Ecosystem</h2>
          <p class="text-muted small mb-0">Monitor, approve, and manage platform initiatives</p>
        </div>
      </div>

      <!-- Metrics Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-6 col-lg-3">
          <StatCard
            label="Total Projects"
            :value="totalProjects"
            description="Active initiatives"
            descriptionIcon="bi-arrow-up-right"
            descriptionColorClass="text-success"
            icon="bi bi-folder"
            iconBgClass="bg-purple-light"
            iconColorClass="text-purple"
            :active="statusFilter === 'ALL'"
            class="cursor-pointer"
            @click="statusFilter = 'ALL'"
          />
        </div>
        <div class="col-md-6 col-lg-3">
          <StatCard
            label="Pending"
            :value="pendingProjects"
            description="Awaiting approval"
            descriptionIcon="bi-clock"
            descriptionColorClass="text-warning"
            icon="bi bi-clock"
            iconBgClass="bg-orange-light"
            iconColorClass="text-orange"
            :active="statusFilter === 'PENDING REVIEW'"
            class="cursor-pointer"
            @click="statusFilter = 'PENDING REVIEW'"
          />
        </div>
        <div class="col-md-6 col-lg-3">
          <StatCard
            label="Live"
            :value="activeProjects"
            description="In production"
            descriptionIcon="bi-lightning-charge"
            descriptionColorClass="text-teal"
            icon="bi bi-lightning"
            iconBgClass="bg-teal-light"
            iconColorClass="text-teal"
            :active="statusFilter === 'ACTIVE'"
            class="cursor-pointer"
            @click="statusFilter = 'ACTIVE'"
          />
        </div>
        <div class="col-md-6 col-lg-3">
          <StatCard
            label="Alerts"
            :value="flaggedProjects"
            description="Requires attention"
            descriptionIcon="bi-exclamation-triangle"
            descriptionColorClass="text-danger"
            icon="bi bi-exclamation-triangle"
            iconBgClass="bg-red-light"
            iconColorClass="text-red"
            :active="statusFilter === 'FLAGGED'"
            class="cursor-pointer"
            @click="statusFilter = 'FLAGGED'"
          />
        </div>
      </div>

      <!-- Controls Row -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mb-4">
        <!-- Tabs -->
        <ul class="nav nav-pills custom-pills bg-surface p-1 rounded-pill shadow-sm border">
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
          <div class="input-group search-group shadow-sm rounded-pill overflow-hidden border bg-surface">
            <span class="input-group-text bg-transparent border-0 ps-3">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control border-0 py-2 small bg-transparent" 
              placeholder="Search projects..."
              style="font-size: 0.9rem;"
            >
          </div>
          <select v-model="statusFilter" class="form-select rounded-pill border-0 shadow-sm px-4 bg-surface fw-bold small text-adaptive" style="width: auto; font-size: 0.85rem;">
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
import StatCard from '../../components/admin/StatCard.vue';
import ProjectCard from '../../components/admin/ProjectCard.vue';
import ProjectDetailModal from '../../components/admin/ProjectDetailModal.vue';

const searchQuery = ref('');
const statusFilter = ref('ALL');
const sortBy = ref('newest');
const currentTab = ref('all');

const showDetailModal = ref(false);
const selectedProject = ref(null);

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
const flaggedProjects = computed(() => projects.value.filter(p => p.status === 'FLAGGED').length);

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
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-family-base);
  color: var(--color-text);
}

.admin-main {
  background-color: var(--color-bg);
}

.icon-box {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-purple { background-color: var(--color-purple-light); }
.text-purple { color: var(--color-purple); }

.bg-light-orange { background-color: var(--color-warning-light); }
.text-orange { color: var(--color-warning); }

.bg-light-red { background-color: var(--color-danger-light); }
.text-red { color: var(--color-danger); }

.bg-light-green { background-color: var(--color-success-light); }
.text-green { color: var(--color-success); }

.bg-light-blue { background-color: var(--color-info-light); }
.text-blue { color: var(--color-info); }

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg) !important;
  border-color: var(--color-purple) !important;
}

.active-metric {
  border-color: var(--color-purple) !important;
  background-color: var(--color-purple-light) !important;
  box-shadow: var(--shadow-md) !important;
}

.custom-pills {
  border: 1px solid var(--color-border);
}

.custom-pills .nav-link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.custom-pills .nav-link.active {
  background-color: var(--color-purple);
  color: white;
  box-shadow: 0 4px 6px -1px var(--color-purple-light);
}

.search-group {
  max-width: 300px;
}

.submit-proposal-card {
  border: 2px dashed var(--color-border);
  background-color: var(--color-surface);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.submit-proposal-card:hover {
  border-color: var(--color-purple);
  background-color: var(--color-surface-hover);
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg) !important;
}

.icon-circle-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.submit-proposal-card:hover .icon-circle-large {
  transform: scale(1.1) rotate(90deg);
  background-color: var(--color-purple-light);
}

.bg-light-purple-soft {
  background-color: var(--color-bg);
}

.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  font-size: 1.5rem;
  z-index: 1000;
  background-color: var(--color-purple);
  border: none;
}

.bg-surface { background-color: var(--color-surface) !important; }
.text-adaptive { color: var(--color-text) !important; }
</style>
