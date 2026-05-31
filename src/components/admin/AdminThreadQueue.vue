<template>
  <section class="admin-panel">
    <div class="panel-title-row list-toolbar">
      <div>
        <h2>Moderation Queue</h2>
        <p>Reported and active discussions that need admin attention.</p>
      </div>
      <div class="toolbar-controls">
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="query" type="search" placeholder="Search threads">
        </label>
        <button class="icon-btn" type="button" title="Filter">
          <i class="bi bi-sliders"></i>
        </button>
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
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="thread in visibleThreads" :key="thread.name">
            <td>
              <div class="identity-cell">
                <span class="avatar-dot">{{ initials(thread.name) }}</span>
                <div>
                  <strong>{{ thread.name }}</strong>
                  <small>{{ thread.detail }}</small>
                </div>
              </div>
            </td>
            <td>{{ thread.author }}</td>
            <td>
              <span :class="['status-pill', priorityClass(thread.priority)]">{{ thread.priority }}</span>
            </td>
            <td>{{ thread.reports }}</td>
            <td class="text-end">
              <button class="icon-btn small" type="button" title="Review">
                <i class="bi bi-pencil"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const query = ref('');

const threads = [
  { name: 'Cannot deploy final project', detail: 'Deployment help request', author: 'Dara Kim', priority: 'High', reports: '3 reports' },
  { name: 'Best Vue folder structure?', detail: 'General discussion', author: 'Mony Rath', priority: 'Medium', reports: '1 report' },
  { name: 'Showcase feedback thread', detail: 'Peer review', author: 'Lina Sok', priority: 'Low', reports: '0 reports' },
];

const visibleThreads = computed(() => {
  const needle = query.value.toLowerCase();
  if (!needle) return threads;

  return threads.filter((thread) => JSON.stringify(thread).toLowerCase().includes(needle));
});

const initials = (name) => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

const priorityClass = (priority) => {
  const normalized = String(priority || '').toLowerCase();

  if (normalized === 'high') return 'danger';
  if (normalized === 'medium') return 'warning';
  return 'success';
};
</script>

<style scoped>
.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-title-row h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-title-row p {
  color: var(--color-text-muted);
  margin: 0;
}

.toolbar-controls,
.identity-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-box {
  min-width: min(320px, 55vw);
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.8rem;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), background-color var(--transition-base);
}

.search-box:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  background: var(--color-surface);
}

.search-box input {
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  width: 100%;
}

.search-box input:focus,
.search-box input:focus-visible {
  outline: none;
  box-shadow: none !important;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn.small {
  width: 34px;
  height: 34px;
}

.clean-table thead th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.identity-cell {
  min-width: 220px;
}

.identity-cell strong,
.identity-cell small {
  display: block;
}

.identity-cell small {
  color: var(--color-text-muted);
}

.avatar-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  flex-shrink: 0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
}

.status-pill.success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-pill.warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-pill.danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
  }

  .toolbar-controls,
  .search-box {
    width: 100%;
  }
}
</style>
