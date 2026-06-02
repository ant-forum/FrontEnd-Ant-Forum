<template>
  <section class="admin-panel">
    <div class="panel-title-row list-toolbar">
      <div>
        <h2>Moderation Queue</h2>
        <p>Review reports, record a decision, and control noisy discussions.</p>
      </div>
      <div class="toolbar-controls">
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="query" type="search" placeholder="Search threads">
        </label>
        <select v-model="statusFilter" class="form-select compact-select" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="Open">Open</option>
          <option value="Resolved">Resolved</option>
          <option value="Dismissed">Dismissed</option>
        </select>
        <select v-model="priorityFilter" class="form-select compact-select" aria-label="Filter by priority">
          <option value="all">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table clean-table align-middle mb-0">
        <thead>
          <tr>
            <th>Thread</th>
            <th>Author</th>
            <th>Priority</th>
            <th>Reports</th>
            <th>Status</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody v-if="visibleThreads.length">
          <tr v-for="thread in visibleThreads" :key="thread.id">
            <td>
              <div class="identity-cell">
                <span class="avatar-dot">{{ initials(thread.author) }}</span>
                <div>
                  <strong>{{ thread.title }}</strong>
                  <small>{{ thread.detail }}</small>
                </div>
              </div>
            </td>
            <td>{{ thread.author }}</td>
            <td><span :class="['status-pill', priorityClass(thread.priority)]">{{ thread.priority }}</span></td>
            <td>{{ thread.reports }}</td>
            <td>
              <span :class="['status-pill', statusClass(thread.status)]">{{ thread.status }}</span>
              <i v-if="thread.locked" class="bi bi-lock-fill lock-icon ms-2" title="Thread locked"></i>
            </td>
            <td class="text-end">
              <button class="btn btn-light btn-sm border review-btn" type="button" @click="openReview(thread)">
                <i class="bi bi-shield-check"></i>
                Review
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" class="empty-state">
              <i class="bi bi-check2-circle"></i>
              <span>No moderation items match these filters.</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <BaseModal
    v-if="selectedThread"
    title="Review Reported Thread"
    icon="bi bi-shield-exclamation"
    kicker=""
    @closeModal="closeReview"
  >
    <div class="review-content">
      <div class="review-heading">
        <div>
          <h3>{{ selectedThread.title }}</h3>
          <p>By {{ selectedThread.author }} · {{ selectedThread.detail }}</p>
        </div>
        <span :class="['status-pill', priorityClass(selectedThread.priority)]">{{ selectedThread.priority }}</span>
      </div>

      <div class="content-preview">{{ selectedThread.excerpt }}</div>

      <div class="detail-grid">
        <div>
          <small>Reports</small>
          <strong>{{ selectedThread.reports }}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong>{{ selectedThread.status }}</strong>
        </div>
        <div>
          <small>Thread State</small>
          <strong>{{ selectedThread.locked ? 'Locked' : 'Open' }}</strong>
        </div>
      </div>

      <div>
        <h4>Report Reasons</h4>
        <div class="reason-list">
          <span v-for="reason in selectedThread.reasons" :key="reason">{{ reason }}</span>
        </div>
      </div>

      <div v-if="selectedThread.notes.length">
        <h4>Admin Notes</h4>
        <div class="note-list">
          <p v-for="note in selectedThread.notes" :key="note.createdAt">
            {{ note.text }}
            <small>{{ formatDate(note.createdAt) }}</small>
          </p>
        </div>
      </div>

      <label class="note-field">
        <span>Decision note</span>
        <textarea v-model.trim="decisionNote" class="form-control" rows="3" placeholder="Record why you are taking this action"></textarea>
      </label>

      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="handleLock">
          <i :class="['bi', selectedThread.locked ? 'bi-unlock' : 'bi-lock']"></i>
          {{ selectedThread.locked ? 'Unlock' : 'Lock' }}
        </button>
        <button class="btn btn-outline-warning" type="button" @click="handleWarn">
          <i class="bi bi-exclamation-triangle"></i>
          Warn User
        </button>
        <button class="btn btn-outline-secondary" type="button" @click="handleDismiss">Dismiss</button>
        <button class="btn btn-success" type="button" @click="handleResolve">
          <i class="bi bi-check2-circle"></i>
          Resolve
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
const statusFilter = ref('Open');
const priorityFilter = ref('all');
const selectedId = ref(null);
const decisionNote = ref('');

const selectedThread = computed(() => adminStore.threadReports.find((item) => item.id === selectedId.value));
const visibleThreads = computed(() => {
  const needle = query.value.toLowerCase();
  return adminStore.threadReports.filter((thread) => {
    const matchesQuery = !needle || JSON.stringify(thread).toLowerCase().includes(needle);
    const matchesStatus = statusFilter.value === 'all' || thread.status === statusFilter.value;
    const matchesPriority = priorityFilter.value === 'all' || thread.priority === priorityFilter.value;
    return matchesQuery && matchesStatus && matchesPriority;
  });
});

const openReview = (thread) => {
  selectedId.value = thread.id;
  decisionNote.value = '';
};
const closeReview = () => {
  selectedId.value = null;
  decisionNote.value = '';
};
const requireNote = () => {
  if (!adminStore.settings.moderation.requireDecisionNotes) return true;
  if (decisionNote.value) return true;
  toast.warning('Add a short decision note before taking this action.');
  return false;
};
const handleResolve = () => {
  if (!requireNote()) return;
  adminStore.resolveReport(selectedThread.value.id, decisionNote.value);
  toast.success('Report resolved and recorded.');
  closeReview();
};
const handleDismiss = () => {
  if (!requireNote()) return;
  adminStore.dismissReport(selectedThread.value.id, decisionNote.value);
  toast.success('Report dismissed with an admin note.');
  closeReview();
};
const handleWarn = () => {
  if (!requireNote()) return;
  adminStore.warnThreadAuthor(selectedThread.value.id, decisionNote.value);
  toast.success('Warning recorded for the thread author.');
  decisionNote.value = '';
};
const handleLock = () => {
  adminStore.toggleThreadLock(selectedThread.value.id, decisionNote.value);
  toast.success(selectedThread.value.locked ? 'Thread locked.' : 'Thread unlocked.');
  decisionNote.value = '';
};

const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const priorityClass = (priority) => ({ High: 'danger', Medium: 'warning', Low: 'success' }[priority] || 'neutral');
const statusClass = (status) => ({ Open: 'warning', Resolved: 'success', Dismissed: 'neutral' }[status] || 'neutral');
const formatDate = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
</script>

<style scoped>
.admin-panel { padding: 1.25rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: var(--shadow-sm); }
.panel-title-row, .toolbar-controls, .identity-cell, .modal-actions { display: flex; align-items: center; gap: 0.75rem; }
.panel-title-row { justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.panel-title-row h2, .review-content h3, .review-content h4 { color: var(--color-text); font-size: 1rem; font-weight: 800; margin: 0 0 0.25rem; }
.panel-title-row p, .review-heading p { color: var(--color-text-muted); margin: 0; }
.toolbar-controls { flex-wrap: wrap; justify-content: flex-end; }
.search-box { min-width: min(260px, 50vw); height: 40px; display: flex; align-items: center; gap: 0.6rem; padding: 0 0.8rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; }
.search-box:focus-within { border-color: var(--color-primary); box-shadow: var(--focus-ring); }
.search-box input { width: 100%; color: var(--color-text); background: transparent; border: 0; outline: 0; }
.compact-select { width: auto; min-width: 140px; height: 40px; font-size: 0.82rem; }
.clean-table th { color: var(--color-text-muted); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.identity-cell { min-width: 260px; }
.identity-cell strong, .identity-cell small { display: block; }
.identity-cell small { color: var(--color-text-muted); }
.avatar-dot { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-primary); background: var(--color-primary-light); border-radius: 50%; font-size: 0.76rem; font-weight: 800; }
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
.status-pill.success { color: var(--color-success); background: var(--color-success-light); }
.status-pill.warning { color: var(--color-warning); background: var(--color-warning-light); }
.status-pill.danger { color: var(--color-danger); background: var(--color-danger-light); }
.status-pill.neutral { color: var(--color-text-muted); background: var(--color-surface-hover); }
.lock-icon { color: var(--color-primary); }
.review-btn { display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; }
.empty-state { padding: 2.5rem !important; color: var(--color-text-muted); text-align: center; }
.empty-state i { margin-right: 0.4rem; color: var(--color-success); }
.review-content { display: grid; gap: 1rem; }
.review-heading { display: flex; justify-content: space-between; gap: 1rem; }
.content-preview { padding: 0.85rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.88rem; }
.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.detail-grid div { padding: 0.65rem; background: var(--color-surface-hover); border-radius: 8px; }
.detail-grid small, .detail-grid strong { display: block; }
.detail-grid small { color: var(--color-text-muted); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.reason-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.reason-list span { padding: 0.3rem 0.55rem; color: var(--color-danger); background: var(--color-danger-light); border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.note-list { display: grid; gap: 0.45rem; }
.note-list p { padding: 0.6rem; margin: 0; color: var(--color-text); background: var(--color-input-bg); border-radius: 8px; font-size: 0.82rem; }
.note-list small { display: block; margin-top: 0.2rem; color: var(--color-text-muted); }
.note-field { display: grid; gap: 0.4rem; color: var(--color-text); font-size: 0.82rem; font-weight: 800; }
.modal-actions { justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 991.98px) { .panel-title-row { flex-direction: column; } .toolbar-controls, .search-box { width: 100%; } .compact-select { flex: 1; } }
</style>
