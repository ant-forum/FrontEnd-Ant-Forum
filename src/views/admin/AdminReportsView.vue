<template>
  <AdminPageShell
    title="Reports Inbox"
    kicker="Trust & Safety"
    subtitle="Review member reports, inspect context, and record moderation decisions from one queue."
    :metrics="metrics"
  >
    <section class="reports-panel">
      <div class="reports-toolbar">
        <div>
          <h2>Reported Content</h2>
          <p>Cases are stored locally until the moderation endpoints are ready.</p>
        </div>

        <div class="toolbar-controls">
          <label class="search-box">
            <i class="bi bi-search"></i>
            <input v-model.trim="query" type="search" placeholder="Search reports">
          </label>
          <select v-model="statusFilter" class="form-select compact-select" aria-label="Filter reports by status">
            <option value="all">All statuses</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
          <select v-model="priorityFilter" class="form-select compact-select" aria-label="Filter reports by priority">
            <option value="all">All priorities</option>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>
        </div>
      </div>

      <div class="status-tabs" role="group" aria-label="Report status shortcuts">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          :class="{ active: statusFilter === tab.value }"
          @click="statusFilter = tab.value"
        >
          <span>{{ tab.label }}</span>
          <small>{{ tab.count }}</small>
        </button>
      </div>

      <div class="table-responsive">
        <table class="table clean-table align-middle mb-0">
          <thead>
            <tr>
              <th>Case</th>
              <th>Reported Content</th>
              <th>Priority</th>
              <th>Reporters</th>
              <th>Status</th>
              <th>Submitted</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody v-if="visibleReports.length">
            <tr v-for="report in visibleReports" :key="report.id">
              <td><strong class="case-number">#{{ paddedId(report.id) }}</strong></td>
              <td>
                <div class="content-cell">
                  <span class="content-icon"><i class="bi bi-chat-left-text"></i></span>
                  <div>
                    <strong>{{ report.title }}</strong>
                    <small>{{ report.detail }} · by {{ report.author }}</small>
                  </div>
                </div>
              </td>
              <td><span :class="['status-pill', priorityClass(report.priority)]">{{ report.priority }}</span></td>
              <td>
                <span class="report-count">
                  <i class="bi bi-people"></i>
                  {{ report.reports }}
                </span>
              </td>
              <td>
                <span :class="['status-pill', statusClass(report.status)]">{{ report.status }}</span>
                <i v-if="report.locked" class="bi bi-lock-fill lock-icon ms-2" title="Thread locked"></i>
              </td>
              <td class="date-cell">{{ formatDate(report.createdAt) }}</td>
              <td class="text-end">
                <button class="btn btn-light btn-sm border review-btn" type="button" @click="openReport(report)">
                  Review
                  <i class="bi bi-arrow-up-right"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="empty-state">
                <i class="bi bi-inbox"></i>
                <strong>No reports found</strong>
                <span>Try another filter or search phrase.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="reports-footer">
        <span>Showing {{ visibleReports.length }} of {{ adminStore.threadReports.length }} cases</span>
        <span><i class="bi bi-device-ssd"></i> Local preview data</span>
      </footer>
    </section>

    <section class="insight-grid">
      <article class="insight-card">
        <span class="insight-icon orange"><i class="bi bi-exclamation-triangle"></i></span>
        <div>
          <strong>Review high-priority cases first</strong>
          <p>{{ adminStore.highPriorityReports.length }} open case requires immediate attention.</p>
        </div>
      </article>
      <article class="insight-card">
        <span class="insight-icon purple"><i class="bi bi-journal-check"></i></span>
        <div>
          <strong>Document each decision</strong>
          <p>Resolve and dismiss actions require an admin note for a clearer future audit log.</p>
        </div>
      </article>
    </section>
  </AdminPageShell>

  <BaseModal
    v-if="selectedReport"
    title="Report Case Details"
    icon="bi bi-flag"
    kicker="Trust & Safety"
    @closeModal="closeReport"
  >
    <div class="review-content">
      <div class="case-heading">
        <div>
          <span class="case-number">CASE #{{ paddedId(selectedReport.id) }}</span>
          <h3>{{ selectedReport.title }}</h3>
          <p>{{ selectedReport.detail }} · by {{ selectedReport.author }}</p>
        </div>
        <span :class="['status-pill', priorityClass(selectedReport.priority)]">{{ selectedReport.priority }}</span>
      </div>

      <div class="content-preview">{{ selectedReport.excerpt }}</div>

      <div class="detail-grid">
        <div><small>Reports</small><strong>{{ selectedReport.reports }}</strong></div>
        <div><small>Status</small><strong>{{ selectedReport.status }}</strong></div>
        <div><small>Thread State</small><strong>{{ selectedReport.locked ? 'Locked' : 'Open' }}</strong></div>
      </div>

      <div>
        <h4>Report Reasons</h4>
        <div class="reason-list">
          <span v-for="reason in selectedReport.reasons" :key="reason">{{ reason }}</span>
        </div>
      </div>

      <div>
        <h4>Reported By</h4>
        <div class="reporter-list">
          <span v-for="reporter in reporterNames(selectedReport)" :key="reporter">
            <i class="bi bi-person-circle"></i>
            {{ reporter }}
          </span>
        </div>
      </div>

      <div v-if="selectedReport.notes.length">
        <h4>Admin Notes</h4>
        <div class="note-list">
          <p v-for="note in selectedReport.notes" :key="note.createdAt">
            {{ note.text }}
            <small>{{ formatDateTime(note.createdAt) }}</small>
          </p>
        </div>
      </div>

      <label class="note-field">
        <span>Decision note</span>
        <textarea v-model.trim="decisionNote" class="form-control" rows="3" placeholder="Explain the decision or warning for the audit trail"></textarea>
      </label>

      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="handleLock">
          <i :class="['bi', selectedReport.locked ? 'bi-unlock' : 'bi-lock']"></i>
          {{ selectedReport.locked ? 'Unlock' : 'Lock' }}
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
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useToast } from '../../composables/useToast';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const adminStore = useAdminOperationsStore();
const toast = useToast();
const query = ref('');
const statusFilter = ref('Open');
const priorityFilter = ref('all');
const selectedId = ref(null);
const decisionNote = ref('');

const selectedReport = computed(() => adminStore.threadReports.find((report) => report.id === selectedId.value));
const totalReporterCount = computed(() => adminStore.threadReports.reduce((total, report) => total + report.reports, 0));
const metrics = computed(() => [
  { label: 'Open Cases', value: String(adminStore.pendingReports.length), change: 'Needs a decision', icon: 'bi-inbox', className: 'orange' },
  { label: 'Member Reports', value: String(totalReporterCount.value), change: 'Across all cases', icon: 'bi-flag', className: 'blue' },
  { label: 'High Priority', value: String(adminStore.highPriorityReports.length), change: 'Review first', icon: 'bi-exclamation-triangle', className: 'purple' },
  { label: 'Closed Cases', value: String(adminStore.resolvedReports.length), change: 'Resolved or dismissed', icon: 'bi-check2-circle', className: 'green' },
]);
const statusTabs = computed(() => [
  { label: 'All Cases', value: 'all', count: adminStore.threadReports.length },
  { label: 'Open', value: 'Open', count: adminStore.pendingReports.length },
  { label: 'Resolved', value: 'Resolved', count: adminStore.threadReports.filter((item) => item.status === 'Resolved').length },
  { label: 'Dismissed', value: 'Dismissed', count: adminStore.threadReports.filter((item) => item.status === 'Dismissed').length },
]);
const visibleReports = computed(() => {
  const needle = query.value.toLowerCase();
  return adminStore.threadReports.filter((report) => {
    const matchesQuery = !needle || JSON.stringify(report).toLowerCase().includes(needle);
    const matchesStatus = statusFilter.value === 'all' || report.status === statusFilter.value;
    const matchesPriority = priorityFilter.value === 'all' || report.priority === priorityFilter.value;
    return matchesQuery && matchesStatus && matchesPriority;
  });
});

const openReport = (report) => {
  selectedId.value = report.id;
  decisionNote.value = '';
};
const closeReport = () => {
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
  adminStore.resolveReport(selectedReport.value.id, decisionNote.value);
  toast.success('Report case resolved and recorded.');
  closeReport();
};
const handleDismiss = () => {
  if (!requireNote()) return;
  adminStore.dismissReport(selectedReport.value.id, decisionNote.value);
  toast.success('Report case dismissed with an admin note.');
  closeReport();
};
const handleWarn = () => {
  if (!requireNote()) return;
  adminStore.warnThreadAuthor(selectedReport.value.id, decisionNote.value);
  toast.success('Warning recorded for the thread author.');
  decisionNote.value = '';
};
const handleLock = () => {
  adminStore.toggleThreadLock(selectedReport.value.id, decisionNote.value);
  toast.success(selectedReport.value.locked ? 'Thread locked.' : 'Thread unlocked.');
  decisionNote.value = '';
};

const paddedId = (id) => String(id).padStart(4, '0');
const reporterNames = (report) => report.reportedBy?.length ? report.reportedBy : [`${report.reports} forum member${report.reports === 1 ? '' : 's'}`];
const priorityClass = (priority) => ({ High: 'danger', Medium: 'warning', Low: 'success' }[priority] || 'neutral');
const statusClass = (status) => ({ Open: 'warning', Resolved: 'success', Dismissed: 'neutral' }[status] || 'neutral');
const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const formatDateTime = (date) => new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
</script>

<style scoped>
.reports-panel, .insight-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: var(--shadow-sm); }
.reports-panel { overflow: hidden; }
.reports-toolbar, .toolbar-controls, .content-cell, .modal-actions, .insight-card { display: flex; align-items: center; gap: 0.75rem; }
.reports-toolbar { justify-content: space-between; gap: 1rem; padding: 1.25rem; }
.reports-toolbar h2, .review-content h3, .review-content h4 { color: var(--color-text); font-size: 1rem; font-weight: 800; margin: 0 0 0.25rem; }
.reports-toolbar p, .case-heading p { color: var(--color-text-muted); margin: 0; }
.toolbar-controls { flex-wrap: wrap; justify-content: flex-end; }
.search-box { min-width: min(250px, 48vw); height: 40px; display: flex; align-items: center; gap: 0.6rem; padding: 0 0.8rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; }
.search-box:focus-within { border-color: var(--color-primary); box-shadow: var(--focus-ring); }
.search-box input { width: 100%; color: var(--color-text); background: transparent; border: 0; outline: 0; }
.compact-select { width: auto; min-width: 140px; height: 40px; font-size: 0.82rem; }
.status-tabs { display: flex; gap: 0.35rem; padding: 0 1.25rem 1rem; overflow-x: auto; }
.status-tabs button { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.75rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 999px; font-size: 0.8rem; font-weight: 800; white-space: nowrap; }
.status-tabs button.active { color: var(--color-primary); background: var(--color-primary-light); border-color: var(--color-primary); }
.status-tabs small { min-width: 19px; padding: 0.05rem 0.3rem; color: inherit; background: var(--color-surface); border-radius: 999px; text-align: center; }
.clean-table thead th { padding: 0.8rem 0.75rem; color: var(--color-text-muted); background: var(--color-surface-hover); border-color: var(--color-border); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
.clean-table tbody td { padding: 0.85rem 0.75rem; border-color: var(--color-border); }
.content-cell { min-width: 280px; }
.content-cell strong, .content-cell small { display: block; }
.content-cell small, .date-cell { color: var(--color-text-muted); font-size: 0.8rem; }
.content-icon { width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-primary); background: var(--color-primary-light); border-radius: 8px; }
.case-number { color: var(--color-primary); font-size: 0.75rem; letter-spacing: 0.04em; }
.status-pill { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
.status-pill.success { color: var(--color-success); background: var(--color-success-light); }
.status-pill.warning { color: var(--color-warning); background: var(--color-warning-light); }
.status-pill.danger { color: var(--color-danger); background: var(--color-danger-light); }
.status-pill.neutral { color: var(--color-text-muted); background: var(--color-surface-hover); }
.report-count, .review-btn { display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; }
.report-count { color: var(--color-text-muted); }
.lock-icon { color: var(--color-primary); }
.empty-state { padding: 3rem !important; color: var(--color-text-muted); text-align: center; }
.empty-state i, .empty-state strong, .empty-state span { display: block; }
.empty-state i { margin-bottom: 0.5rem; color: var(--color-primary); font-size: 1.7rem; }
.reports-footer { display: flex; justify-content: space-between; gap: 1rem; padding: 0.75rem 1.25rem; color: var(--color-text-muted); background: var(--color-surface-hover); font-size: 0.78rem; font-weight: 700; }
.insight-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
.insight-card { padding: 1rem; }
.insight-card strong { color: var(--color-text); }
.insight-card p { margin: 0.2rem 0 0; color: var(--color-text-muted); font-size: 0.84rem; }
.insight-icon { width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 8px; }
.insight-icon.orange { color: var(--color-warning); background: var(--color-warning-light); }
.insight-icon.purple { color: var(--color-purple); background: var(--color-purple-light); }
.review-content { display: grid; gap: 1rem; }
.case-heading { display: flex; justify-content: space-between; gap: 1rem; }
.case-heading h3 { margin-top: 0.35rem; }
.content-preview { padding: 0.85rem; color: var(--color-text-muted); background: var(--color-input-bg); border: 1px solid var(--color-border); border-radius: 8px; font-size: 0.88rem; }
.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.detail-grid div { padding: 0.65rem; background: var(--color-surface-hover); border-radius: 8px; }
.detail-grid small, .detail-grid strong { display: block; }
.detail-grid small { color: var(--color-text-muted); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.reason-list, .reporter-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.reason-list span, .reporter-list span { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.reason-list span { color: var(--color-danger); background: var(--color-danger-light); }
.reporter-list span { color: var(--color-primary); background: var(--color-primary-light); }
.note-list { display: grid; gap: 0.45rem; }
.note-list p { padding: 0.6rem; margin: 0; color: var(--color-text); background: var(--color-input-bg); border-radius: 8px; font-size: 0.82rem; }
.note-list small { display: block; margin-top: 0.2rem; color: var(--color-text-muted); }
.note-field { display: grid; gap: 0.4rem; color: var(--color-text); font-size: 0.82rem; font-weight: 800; }
.modal-actions { justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 1199.98px) { .reports-toolbar { align-items: flex-start; flex-direction: column; } .toolbar-controls { justify-content: flex-start; width: 100%; } }
@media (max-width: 767.98px) { .search-box { width: 100%; } .compact-select { flex: 1; } .insight-grid { grid-template-columns: 1fr; } }
</style>
