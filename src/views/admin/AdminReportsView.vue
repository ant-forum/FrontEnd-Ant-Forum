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
          <p>
            Cases are stored locally until the moderation endpoints are ready.
          </p>
        </div>

        <div class="toolbar-controls">
          <label class="search-box">
            <i class="bi bi-search"></i>
            <input
              v-model.trim="query"
              type="search"
              placeholder="Search reports"
            />
          </label>
          <select
            v-model="statusFilter"
            class="form-select compact-select"
            aria-label="Filter reports by status"
          >
            <option value="Open">All Report</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      <div
        class="status-tabs"
        role="group"
        aria-label="Report status shortcuts"
      >
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

      <div
        v-if="activeFilterChips.length"
        class="active-filters"
        aria-label="Active report filters"
      >
        <span>Filtered by</span>
        <button
          v-for="chip in activeFilterChips"
          :key="chip.key"
          type="button"
          class="filter-chip"
          @click="removeFilter(chip.key)"
        >
          {{ chip.label }}
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="table-responsive">
        <table class="table clean-table align-middle mb-0">
          <thead>
            <tr>
              <th>Report No.</th>
              <th>Reported Content</th>
              <th>Reporters</th>
              <th>Submitted</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody v-if="visibleReports.length">
            <tr v-for="report in visibleReports" :key="report.id">
              <td>
                <strong class="case-number">#{{ paddedId(report.id) }}</strong>
              </td>
              <td>
                <div class="content-cell">
                  <span class="content-icon"
                    ><i class="bi bi-chat-left-text"></i
                  ></span>
                  <div>
                    <strong>{{ report.title }}</strong>
                    <small>{{ report.detail }} · by {{ report.author }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="report-count">
                  <i class="bi bi-people"></i>
                  {{ report.reports }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(report.createdAt) }}</td>
              <td class="text-end">
                <button
                  class="btn btn-light btn-sm border review-btn"
                  type="button"
                  @click="openReport(report)"
                >
                  Review
                  <i class="bi bi-arrow-up-right"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5" class="empty-state">
                <i class="bi bi-inbox"></i>
                <strong>{{ emptyStateTitle }}</strong>
                <span>{{ emptyStateMessage }}</span>
                <button
                  v-if="hasActiveFilters"
                  class="btn btn-light btn-sm border empty-action"
                  type="button"
                  @click="clearFilters"
                >
                  <i class="bi bi-x-circle"></i>
                  Clear Filters
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="reports-footer">
        <span>Showing {{ visibleReports.length }} of
          {{ reportStore.threadReports.length }} cases</span>
        <span><i class="bi bi-device-ssd"></i> Local preview data</span>
      </footer>
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
          <span class="case-number"
            >Report #{{ paddedId(selectedReport.id) }}</span
          >
          <h3>{{ selectedReport.title }}</h3>
          <p>{{ selectedReport.detail }} · by {{ selectedReport.author }}</p>
        </div>
      </div>
      <div class="detail-grid">
        <div>
          <small>Reports</small><strong>{{ sameForumReportsCount }}</strong>
        </div>
      </div>

      <div>
        <h4>{{ selectedReport.reasons.length === 1 ? 'Report Reason' : 'Report Reasons' }}</h4>
        <div class="reason-list">
          <span v-for="reason in selectedReport.reasons" :key="reason">{{
            reason
          }}</span>
        </div>
      </div>

      <div>
        <h4>Reported By</h4>
        <div class="reporter-list">
          <span
            v-for="reporter in reporterNames(selectedReport)"
            :key="reporter"
          >
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
        <textarea
          v-model.trim="decisionNote"
          class="form-control"
          rows="3"
          placeholder="Explain the decision or warning for the audit trail"
        ></textarea>
      </label>

      <div class="modal-actions">
        <button
          class="btn btn-outline-secondary"
          type="button"
          @click="handleDismiss"
        >
          Dismiss
        </button>
        <button
          v-if="selectedReport.status !== 'Open'"
          class="btn btn-outline-danger"
          type="button"
          @click="requestDelete"
        >
          <i class="bi bi-trash"></i>
          Delete
        </button>
        <button class="btn btn-success" type="button" @click="handleResolve">
          <i class="bi bi-check2-circle"></i>
          Resolve
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- Confirm Delete Modal -->
  <BaseModal
    v-if="showDeleteConfirm"
    title="Confirm Delete"
    icon="bi bi-exclamation-triangle"
    theme="danger"
    @closeModal="showDeleteConfirm = false"
  >
    <div class="p-2">
      <p class="mb-4 text-adaptive fs-6">Are you sure you want to permanently delete this report case? This action cannot be undone.</p>
      <div class="d-flex justify-content-end gap-3 mt-3">
        <button class="btn btn-light border px-4 rounded-pill fw-bold" type="button" @click="showDeleteConfirm = false">
          Cancel
        </button>
        <button class="btn btn-danger px-4 rounded-pill fw-bold" type="button" @click="confirmDelete">
          <i class="bi bi-trash me-1"></i> Confirm Delete
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useToast } from "../../composables/useToast";
import { useAdminOperationsStore } from "../../stores/AdminOperationsStore";
import { useReportStore } from "../../stores/ReportStore";

const adminStore = useAdminOperationsStore();
const reportStore = useReportStore();
const toast = useToast();
const query = ref("");
const statusFilter = ref("Open");
const selectedId = ref(null);
const decisionNote = ref("");
const showDeleteConfirm = ref(false);

onMounted(async () => {
  await reportStore.fetchAllReports();
});

const selectedReport = computed(() =>
  reportStore.threadReports.find((report) => report.id === selectedId.value),
);

const reportsForSameForum = computed(() => {
  if (!selectedReport.value) return [];
  const current = selectedReport.value;
  return reportStore.threadReports.filter((r) => {
    if (current.threadId && r.threadId === current.threadId) return true;
    if (current.projectId && r.projectId === current.projectId) return true;
    return r.id === current.id;
  });
});

const sameForumReportsCount = computed(() => {
  return reportsForSameForum.value.reduce((total, r) => total + (r.reports || 1), 0);
});

const totalReporterCount = computed(() =>
  reportStore.threadReports.reduce((total, report) => total + report.reports, 0),
);
const metrics = computed(() => [
  {
    label: "Cases Report",
    value: String(reportStore.pendingReports.length),
    change: "Needs a decision",
    icon: "bi-inbox",
    className: "orange",
  },
  {
    label: "Member Reports",
    value: String(totalReporterCount.value),
    change: "Across all cases",
    icon: "bi-flag",
    className: "blue",
  },

  {
    label: "Closed Cases",
    value: String(reportStore.resolvedReports.length),
    change: "Resolved or dismissed",
    icon: "bi-check2-circle",
    className: "green",
  },
]);
const statusTabs = computed(() => [
  { label: "All Report", value: "Open", count: reportStore.pendingReports.length },
  {
    label: "Resolved",
    value: "Resolved",
    count: reportStore.threadReports.filter((item) => item.status === "Resolved")
      .length,
  },
  {
    label: "Dismissed",
    value: "Dismissed",
    count: reportStore.threadReports.filter(
      (item) => item.status === "Dismissed",
    ).length,
  },
]);
const visibleReports = computed(() => {
  const needle = query.value.toLowerCase();
  return reportStore.threadReports.filter((report) => {
    const matchesQuery =
      !needle || JSON.stringify(report).toLowerCase().includes(needle);
    const matchesStatus = report.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  });
});
const hasActiveFilters = computed(
  () =>
    Boolean(query.value) ||
    statusFilter.value !== "Open",
);
const activeFilterChips = computed(() => [
  ...(query.value ? [{ key: "query", label: `Search: ${query.value}` }] : []),
  ...(statusFilter.value !== "Open"
    ? [{ key: "status", label: `Status: ${statusFilter.value}` }]
    : []),
]);
const emptyStateTitle = computed(() =>
  reportStore.threadReports.length
    ? "No reports match these filters"
    : "No reports received yet",
);
const emptyStateMessage = computed(() =>
  reportStore.threadReports.length
    ? "Clear the filters or try a different search phrase."
    : "New member reports will appear here when they need review.",
);
const clearFilters = () => {
  query.value = "";
  statusFilter.value = "Open";
};
const removeFilter = (key) => {
  if (key === "query") query.value = "";
  if (key === "status") statusFilter.value = "Open";
};

const openReport = (report) => {
  selectedId.value = report.id;
  decisionNote.value = "";
};
const closeReport = () => {
  selectedId.value = null;
  decisionNote.value = "";
};
const requireNote = () => {
  if (!adminStore.settings.moderation.requireDecisionNotes) return true;
  if (decisionNote.value) return true;
  toast.warning("Add a short decision note before taking this action.");
  return false;
};
const handleResolve = async () => {
  if (!requireNote()) return;
  try {
    for (const r of reportsForSameForum.value) {
      await reportStore.resolveReport(r.id, decisionNote.value);
    }
    toast.success("Report case resolved and recorded.");
    closeReport();
  } catch (err) {
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to resolve report.");
    toast.error(errorMsg);
  }
};
const handleDismiss = async () => {
  if (!requireNote()) return;
  try {
    for (const r of reportsForSameForum.value) {
      await reportStore.dismissReport(r.id, decisionNote.value);
    }
    toast.success("Report case dismissed with an admin note.");
    closeReport();
  } catch (err) {
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to dismiss report.");
    toast.error(errorMsg);
  }
};
const handleWarn = async () => {
  if (!requireNote()) return;
  try {
    for (const r of reportsForSameForum.value) {
      await reportStore.warnThreadAuthor(r.id, decisionNote.value);
    }
    toast.success("Warning recorded for the thread author.");
    decisionNote.value = "";
  } catch (err) {
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to record warning.");
    toast.error(errorMsg);
  }
};
const handleLock = async () => {
  try {
    const targetLockState = !selectedReport.value.locked;
    for (const r of reportsForSameForum.value) {
      await reportStore.toggleThreadLock(r.id, decisionNote.value);
      r.locked = targetLockState;
    }
    toast.success(
      targetLockState ? "Thread locked." : "Thread unlocked.",
    );
    decisionNote.value = "";
  } catch (err) {
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to lock/unlock thread.");
    toast.error(errorMsg);
  }
};
const requestDelete = () => {
  showDeleteConfirm.value = true;
};
const confirmDelete = async () => {
  showDeleteConfirm.value = false;
  try {
    for (const r of reportsForSameForum.value) {
      await reportStore.deleteReport(r.id);
    }
    toast.success("Report deleted successfully.");
    closeReport();
  } catch (err) {
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to delete report.");
    toast.error(errorMsg);
  }
};

const paddedId = (id) => String(id).padStart(4, "0");
const reporterNames = (report) =>
  report.reportedBy?.length
    ? report.reportedBy
    : [`${report.reports} forum member${report.reports === 1 ? "" : "s"}`];
const priorityClass = (priority) =>
  ({ High: "danger", Medium: "warning", Low: "success" })[priority] ||
  "neutral";
const statusClass = (status) =>
  ({ Open: "warning", Resolved: "success", Dismissed: "neutral" })[status] ||
  "neutral";
const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
const formatDateTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
</script>

<style scoped>
.reports-panel,
.insight-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}
.reports-panel {
  overflow: hidden;
}
.reports-toolbar,
.toolbar-controls,
.content-cell,
.modal-actions,
.insight-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.reports-toolbar {
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
}
.reports-toolbar h2,
.review-content h3,
.review-content h4 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}
.reports-toolbar p,
.case-heading p {
  color: var(--color-text-muted);
  margin: 0;
}
.toolbar-controls {
  flex-wrap: wrap;
  justify-content: flex-end;
}
.search-box {
  min-width: min(250px, 48vw);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.8rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
.search-box input {
  width: 100%;
  color: var(--color-text);
  background: transparent;
  border: 0;
  outline: 0;
}
.compact-select {
  width: auto;
  min-width: 140px;
  height: 40px;
  font-size: 0.82rem;
}
.status-tabs {
  display: flex;
  gap: 0.35rem;
  padding: 0 1.25rem 1rem;
  overflow-x: auto;
}
.status-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}
.status-tabs button.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}
.status-tabs small {
  min-width: 19px;
  padding: 0.05rem 0.3rem;
  color: inherit;
  background: var(--color-surface);
  border-radius: 999px;
  text-align: center;
}
.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 1.25rem 1rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}
.filter-chip:hover {
  border-color: var(--color-primary);
}
.clean-table thead th {
  padding: 0.8rem 0.75rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border-color: var(--color-border);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap;
}
.clean-table tbody td {
  padding: 0.85rem 0.75rem;
  border-color: var(--color-border);
}
.content-cell {
  min-width: 280px;
}
.content-cell strong,
.content-cell small {
  display: block;
}
.content-cell small,
.date-cell {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}
.content-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 8px;
}
.case-number {
  color: var(--color-primary);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}
.status-pill.success {
  color: var(--color-success);
  background: var(--color-success-light);
}
.status-pill.warning {
  color: var(--color-warning);
  background: var(--color-warning-light);
}
.status-pill.danger {
  color: var(--color-danger);
  background: var(--color-danger-light);
}
.status-pill.neutral {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
}
.report-count,
.review-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}
.report-count {
  color: var(--color-text-muted);
}
.lock-icon {
  color: var(--color-primary);
}
.empty-state {
  padding: 3rem !important;
  color: var(--color-text-muted);
  text-align: center;
}
.empty-state > i,
.empty-state strong,
.empty-state span {
  display: block;
}
.empty-state i {
  margin-bottom: 0.5rem;
  color: var(--color-primary);
  font-size: 1.7rem;
}
.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.85rem;
  font-weight: 700;
}
.empty-action i {
  margin: 0;
  color: inherit;
  font-size: inherit;
}
.reports-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  font-size: 0.78rem;
  font-weight: 700;
}
.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.insight-card {
  padding: 1rem;
}
.insight-card strong {
  color: var(--color-text);
}
.insight-card p {
  margin: 0.2rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.84rem;
}
.insight-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
}
.insight-icon.orange {
  color: var(--color-warning);
  background: var(--color-warning-light);
}
.insight-icon.purple {
  color: var(--color-purple);
  background: var(--color-purple-light);
}
.review-content {
  display: grid;
  gap: 1rem;
}
.case-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.case-heading h3 {
  margin-top: 0.35rem;
}
.content-preview {
  padding: 0.85rem;
  color: var(--color-text-muted);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.detail-grid div {
  padding: 0.65rem;
  background: var(--color-surface-hover);
  border-radius: 8px;
}
.detail-grid small,
.detail-grid strong {
  display: block;
}
.detail-grid small {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}
.reason-list,
.reporter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.reason-list span,
.reporter-list span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.reason-list span {
  color: var(--color-danger);
  background: var(--color-danger-light);
}
.reporter-list span {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.note-list {
  display: grid;
  gap: 0.45rem;
}
.note-list p {
  padding: 0.6rem;
  margin: 0;
  color: var(--color-text);
  background: var(--color-input-bg);
  border-radius: 8px;
  font-size: 0.82rem;
}
.note-list small {
  display: block;
  margin-top: 0.2rem;
  color: var(--color-text-muted);
}
.note-field {
  display: grid;
  gap: 0.4rem;
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 800;
}
.modal-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}
@media (max-width: 1199.98px) {
  .reports-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .toolbar-controls {
    justify-content: flex-start;
    width: 100%;
  }
}
@media (max-width: 767.98px) {
  .search-box {
    width: 100%;
  }
  .compact-select {
    flex: 1;
  }
  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>
