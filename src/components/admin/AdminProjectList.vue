<template>
  <section class="admin-panel">
    <div class="panel-title-row list-toolbar">
      <div>
        <h2>Student Project Review</h2>
        <p>Preview submissions, publish strong work, or send clear feedback to students.</p>
      </div>
      <label class="search-box">
        <i class="bi bi-search"></i>
        <input v-model.trim="query" type="search" placeholder="Search projects">
      </label>
    </div>

    <div class="project-sort-tabs" role="group" aria-label="Project filters">
      <button v-for="option in sortOptions" :key="option.value" type="button" :class="{ active: selectedSort === option.value }" @click="selectedSort = option.value">
        <i :class="['bi', option.icon]"></i>
        <span>{{ option.label }}</span>
        <small v-if="option.count !== null">{{ option.count }}</small>
      </button>
    </div>

    <div v-if="activeFilterChips.length" class="active-filters" aria-label="Active project filters">
      <span>Filtered by</span>
      <button v-for="chip in activeFilterChips" :key="chip.key" type="button" class="filter-chip" @click="removeFilter(chip.key)">
        {{ chip.label }}
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div class="project-list">
      <article v-for="project in visibleProjects" :key="project.id" class="project-list-item">
        <div class="project-main">
          <span class="project-icon"><i class="bi bi-folder2-open"></i></span>
          <div>
            <div class="project-title-row">
              <h3>{{ project.name }}</h3>
              <span :class="['status-pill', statusClass(project.status)]">{{ project.status }}</span>
            </div>
            <p>{{ project.description }}</p>
            <div class="project-meta">
              <span><i class="bi bi-person"></i>{{ project.author }}</span>
              <span><i class="bi bi-tag"></i>{{ project.category }}</span>
              <span><i class="bi bi-clock"></i>{{ project.updated }}</span>
            </div>
          </div>
        </div>

        <div class="project-stats">
          <span><i class="bi bi-heart-fill"></i>{{ project.likes }} likes</span>
          <span><i class="bi bi-chat-dots"></i>{{ project.comments }} comments</span>
          <button class="btn btn-light border btn-sm" type="button" @click="openReview(project)">
            <i class="bi bi-eye"></i>
            <span>Review</span>
          </button>
        </div>
      </article>

      <div v-if="visibleProjects.length === 0" class="empty-projects">
        <i class="bi bi-search"></i>
        <strong>{{ emptyStateTitle }}</strong>
        <span>{{ emptyStateMessage }}</span>
        <button v-if="hasActiveFilters" class="btn btn-light btn-sm border empty-action" type="button" @click="clearFilters">
          <i class="bi bi-x-circle"></i>
          Clear Filters
        </button>
      </div>
    </div>
  </section>

  <BaseModal
    v-if="selectedProject"
    title="Review Student Project"
    icon="bi bi-folder-check"
    kicker="Project Approval"
    @closeModal="closeReview"
  >
    <div class="review-content">
      <div class="project-review-heading">
        <div>
          <h3>{{ selectedProject.name }}</h3>
          <p>{{ selectedProject.description }}</p>
        </div>
        <span :class="['status-pill', statusClass(selectedProject.status)]">{{ selectedProject.status }}</span>
      </div>

      <div class="detail-grid">
        <div><small>Student</small><strong>{{ selectedProject.author }}</strong></div>
        <div><small>Category</small><strong>{{ selectedProject.category }}</strong></div>
        <div><small>Engagement</small><strong>{{ selectedProject.likes }} likes</strong></div>
      </div>

      <div v-if="selectedProject.reviewedAt" class="previous-review">
        <strong>Latest review</strong>
        <p>{{ selectedProject.feedback || 'Approved without additional feedback.' }}</p>
        <small>{{ selectedProject.reviewedBy }} · {{ formatDate(selectedProject.reviewedAt) }}</small>
      </div>

      <label class="feedback-field">
        <span>Feedback for student</span>
        <textarea v-model.trim="feedback" class="form-control" rows="4" placeholder="Required when rejecting or requesting changes"></textarea>
      </label>

      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeReview">Cancel</button>
        <button class="btn btn-outline-warning" type="button" @click="submitReview('Changes Requested')">Request Changes</button>
        <button class="btn btn-outline-danger" type="button" @click="submitReview('Rejected')">Reject</button>
        <button class="btn btn-success" type="button" @click="submitReview('Published')">
          <i class="bi bi-check2-circle"></i>
          Approve
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref } from 'vue';
import BaseModal from '../base/BaseModal.vue';
import { useToast } from '../../composables/useToast';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const adminStore = useAdminOperationsStore();
const toast = useToast();
const query = ref('');
const selectedSort = ref('review');
const selectedId = ref(null);
const feedback = ref('');

const selectedProject = computed(() => adminStore.projects.find((project) => project.id === selectedId.value));
const sortOptions = computed(() => [
  { label: 'In Review', value: 'review', icon: 'bi-hourglass-split', count: adminStore.pendingProjects.length },
  { label: 'Recent', value: 'recent', icon: 'bi-clock-history', count: null },
  { label: 'Most Liked', value: 'likes', icon: 'bi-heart', count: null },
  { label: 'Published', value: 'published', icon: 'bi-check2-circle', count: adminStore.publishedProjects.length },
  { label: 'Needs Changes', value: 'changes', icon: 'bi-pencil-square', count: adminStore.projects.filter((item) => item.status === 'Changes Requested').length },
  { label: 'Rejected', value: 'rejected', icon: 'bi-x-circle', count: adminStore.rejectedProjects.length },
]);

const visibleProjects = computed(() => {
  const needle = query.value.toLowerCase();
  let results = adminStore.projects.filter((project) => !needle || JSON.stringify(project).toLowerCase().includes(needle));
  if (selectedSort.value === 'likes') return [...results].sort((a, b) => b.likes - a.likes);
  if (selectedSort.value === 'review') return results.filter((project) => project.status === 'In Review');
  if (selectedSort.value === 'published') return results.filter((project) => project.status === 'Published');
  if (selectedSort.value === 'changes') return results.filter((project) => project.status === 'Changes Requested');
  if (selectedSort.value === 'rejected') return results.filter((project) => project.status === 'Rejected');
  return [...results].sort((a, b) => b.dateOrder - a.dateOrder);
});
const hasActiveFilters = computed(() => Boolean(query.value) || selectedSort.value !== 'recent');
const sortLabels = Object.fromEntries(sortOptions.value.map((option) => [option.value, option.label]));
const activeFilterChips = computed(() => [
  ...(query.value ? [{ key: 'query', label: `Search: ${query.value}` }] : []),
  ...(selectedSort.value !== 'recent' ? [{ key: 'sort', label: `View: ${sortLabels[selectedSort.value]}` }] : []),
]);
const emptyStateTitle = computed(() => adminStore.projects.length ? 'No projects match this filter' : 'No student projects yet');
const emptyStateMessage = computed(() => adminStore.projects.length ? 'Clear the filter or try a different search phrase.' : 'Student showcase submissions will appear here for review.');
const clearFilters = () => {
  query.value = '';
  selectedSort.value = 'recent';
};
const removeFilter = (key) => {
  if (key === 'query') query.value = '';
  if (key === 'sort') selectedSort.value = 'recent';
};

const openReview = (project) => {
  selectedId.value = project.id;
  feedback.value = project.feedback || '';
};
const closeReview = () => {
  selectedId.value = null;
  feedback.value = '';
};
const submitReview = (status) => {
  if (status !== 'Published' && !feedback.value) {
    toast.warning('Add feedback so the student knows what to improve.');
    return;
  }
  adminStore.reviewProject(selectedProject.value.id, status, feedback.value);
  toast.success(status === 'Published' ? 'Project approved and published.' : `Project marked as ${status.toLowerCase()}.`);
  closeReview();
};
const statusClass = (status) => ({ Published: 'success', 'In Review': 'warning', 'Changes Requested': 'info', Rejected: 'danger' }[status] || 'neutral');
const formatDate = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
</script>

<style scoped>
.admin-panel { padding: 1.25rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: var(--shadow-sm); }
.panel-title-row, .project-meta, .project-stats, .modal-actions { display: flex; align-items: center; gap: 0.75rem; }
.panel-title-row { justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.panel-title-row h2, .project-review-heading h3 { color: var(--color-text); font-size: 1rem; font-weight: 800; margin: 0 0 0.25rem; }
.panel-title-row p, .project-review-heading p { color: var(--color-text-muted); margin: 0; }
.search-box { min-width: min(320px, 55vw); height: 40px; display: flex; align-items: center; gap: 0.6rem; padding: 0 0.8rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; }
.search-box:focus-within { border-color: var(--color-primary); box-shadow: var(--focus-ring); }
.search-box input { width: 100%; color: var(--color-text); background: transparent; border: 0; outline: 0; }
.project-sort-tabs { display: flex; flex-wrap: wrap; gap: 0.35rem; width: fit-content; padding: 0.25rem; margin-bottom: 0.75rem; background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; }
.project-sort-tabs button { min-height: 34px; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0 0.7rem; color: var(--color-text-muted); background: transparent; border: 1px solid transparent; border-radius: 7px; font-size: 0.82rem; font-weight: 800; transition: color var(--transition-base), background-color var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-base); }
.project-sort-tabs button:hover { color: var(--color-text); background: var(--color-surface-hover); }
.project-sort-tabs button.active { color: var(--color-primary-hover); background: var(--color-primary-light); border-color: rgba(99, 102, 241, 0.38); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.08); }
.project-sort-tabs small { min-width: 18px; padding: 0.1rem 0.3rem; color: var(--color-primary); background: var(--color-primary-light); border-radius: 999px; text-align: center; }
.project-sort-tabs button.active small { color: #fff; background: var(--color-primary); }
.active-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.75rem; color: var(--color-text-muted); font-size: 0.75rem; font-weight: 700; }
.filter-chip { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; color: var(--color-primary); background: var(--color-primary-light); border: 1px solid rgba(99, 102, 241, 0.22); border-radius: 999px; font-size: 0.75rem; font-weight: 800; }
.filter-chip:hover { border-color: var(--color-primary); }
.project-list { display: grid; gap: 0.75rem; }
.project-list-item { display: flex; justify-content: space-between; align-items: center; gap: 0.9rem; padding: 0.85rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; }
.project-main { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.8rem; }
.project-icon { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-info); background: var(--color-info-light); border-radius: 8px; }
.project-title-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.55rem; margin-bottom: 0.25rem; }
.project-title-row h3 { color: var(--color-text); font-size: 1.05rem; font-weight: 800; margin: 0; }
.project-list-item p { margin-bottom: 0.55rem; color: var(--color-text-muted); font-size: 0.86rem; }
.project-meta { flex-wrap: wrap; color: var(--color-text-muted); font-size: 0.82rem; }
.project-meta span, .project-stats span, .project-stats .btn { display: inline-flex; align-items: center; gap: 0.4rem; }
.project-stats { justify-content: flex-end; color: var(--color-text-muted); font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
.project-stats .bi-heart-fill { color: var(--color-danger); }
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
.status-pill.success { color: var(--color-success); background: var(--color-success-light); }
.status-pill.warning { color: var(--color-warning); background: var(--color-warning-light); }
.status-pill.info { color: var(--color-info); background: var(--color-info-light); }
.status-pill.danger { color: var(--color-danger); background: var(--color-danger-light); }
.empty-projects { min-height: 150px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 0.35rem; padding: 1rem; color: var(--color-text-muted); border: 1px dashed var(--color-border); border-radius: 8px; text-align: center; }
.empty-projects > i { color: var(--color-primary); font-size: 1.45rem; }
.empty-projects strong { color: var(--color-text); }
.empty-action { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.5rem; font-weight: 700; }
.review-content { display: grid; gap: 1rem; }
.project-review-heading { display: flex; justify-content: space-between; gap: 1rem; }
.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.detail-grid div, .previous-review { padding: 0.7rem; background: var(--color-surface-hover); border-radius: 8px; }
.detail-grid small, .detail-grid strong { display: block; }
.detail-grid small { color: var(--color-text-muted); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.previous-review p { margin: 0.25rem 0; color: var(--color-text); font-size: 0.84rem; }
.previous-review small { color: var(--color-text-muted); }
.feedback-field { display: grid; gap: 0.4rem; color: var(--color-text); font-size: 0.82rem; font-weight: 800; }
.modal-actions { justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 767.98px) { .panel-title-row, .project-list-item { align-items: stretch; flex-direction: column; } .search-box { width: 100%; } .project-stats { justify-content: flex-start; flex-wrap: wrap; } }
</style>
