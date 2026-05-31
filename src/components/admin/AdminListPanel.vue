<template>
  <section class="admin-panel">
    <div class="panel-title-row">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>

      <label class="search-box">
        <i class="bi bi-search"></i>
        <input v-model.trim="search" type="search" :placeholder="placeholder">
      </label>
    </div>

    <div class="table-responsive">
      <table class="table clean-table align-middle mb-0">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
            <th v-if="showActions" class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td v-for="column in columns" :key="column.key">
              <div v-if="column.key === 'name'" class="identity-skeleton d-flex align-items-center gap-3">
                <div class="skeleton-circle shimmer"></div>
                <div class="d-flex flex-column gap-2 flex-grow-1">
                  <div class="skeleton-line w-75 shimmer"></div>
                  <div class="skeleton-line w-50 shimmer"></div>
                </div>
              </div>
              <div v-else-if="column.type === 'status'" class="skeleton-badge shimmer"></div>
              <div v-else class="skeleton-line w-75 shimmer"></div>
            </td>
            <td v-if="showActions" class="text-end">
              <div class="skeleton-actions d-flex justify-content-end gap-2">
                <div class="skeleton-btn shimmer"></div>
                <div class="skeleton-btn shimmer"></div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="row in visibleRows" :key="row.name">
            <td v-for="column in columns" :key="column.key">
              <div v-if="column.key === 'name'" class="identity-cell">
                <span class="avatar-dot">{{ initials(row.name) }}</span>
                <div>
                  <strong>{{ row.name }}</strong>
                  <small>{{ row.detail }}</small>
                </div>
              </div>
              <span v-else-if="column.type === 'status'" :class="['status-pill', statusClass(row[column.key])]">
                {{ row[column.key] }}
              </span>
              <span v-else>{{ row[column.key] }}</span>
            </td>
            <td v-if="showActions" class="text-end">
              <button class="icon-btn small me-1" type="button" title="Edit" @click="$emit('edit', row)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="icon-btn small text-danger" type="button" title="Delete" @click="$emit('delete', row)">
                <i class="bi bi-trash"></i>
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

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Search records',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const search = ref('');

const visibleRows = computed(() => {
  const needle = search.value.toLowerCase();
  if (!needle) return props.rows;

  return props.rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
});

const initials = (name) => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

const statusClass = (status) => {
  const value = String(status || '').toLowerCase();

  if (value.includes('active') || value.includes('published')) return 'success';
  if (value.includes('pending') || value.includes('draft') || value.includes('scheduled')) return 'warning';
  if (value.includes('suspended')) return 'danger';
  return 'neutral';
};

defineEmits(['edit', 'delete']);
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

.clean-table thead th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.identity-cell {
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.status-pill.neutral {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: 0;
  }
}

/* Shimmer Skeleton Styles */
.skeleton-row td {
  padding: 1.15rem 0.8rem;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-line {
  height: 12px;
  background: var(--color-border-soft);
  border-radius: 4px;
}

[data-theme='dark'] .skeleton-line {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-border-soft);
  flex-shrink: 0;
}

[data-theme='dark'] .skeleton-circle {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-badge {
  width: 64px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border-soft);
}

[data-theme='dark'] .skeleton-badge {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--color-border-soft);
}

[data-theme='dark'] .skeleton-btn {
  background: rgba(255, 255, 255, 0.05);
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-border-soft) 25%,
    var(--color-surface-hover) 37%,
    var(--color-border-soft) 63%
  );
  background-size: 400% 100%;
  animation: shimmer-animation 1.4s ease infinite;
}

[data-theme='dark'] .shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.08) 37%,
    rgba(255, 255, 255, 0.04) 63%
  );
  background-size: 400% 100%;
}

@keyframes shimmer-animation {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
