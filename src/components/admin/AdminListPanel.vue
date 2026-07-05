<template>
  <section class="admin-panel">
    <div class="panel-title-row">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>

        <!-- Filter Tabs -->
        <div v-if="showTabs" class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="emit('update:activeTab', tab.value)"
            :class="['tab-btn', { active: activeTab === tab.value }]"
            type="button"
          >
            <span class="tab-label">{{ tab.label }}</span>
            <span class="tab-badge">{{ getTabCount(tab.value) }}</span>
          </button>
        </div>
      </div>

      <div class="panel-right-col">
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="search" type="search" :placeholder="placeholder" />
        </label>
        <slot name="panel-actions"></slot>
      </div>
    </div>

    <div v-if="search" class="active-filters" aria-label="Active table filters">
      <span>Filtered by</span>
      <button class="filter-chip" type="button" @click="search = ''">
        Search: {{ search }}
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div class="table-responsive">
      <table class="table clean-table align-middle mb-0">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.label }}
            </th>
            <th v-if="showActions" class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr v-for="i in 5" :key="i" class="skeleton-row">
            <td v-for="column in columns" :key="column.key">
              <div
                v-if="column.key === 'name'"
                class="identity-skeleton d-flex align-items-center gap-3"
              >
                <div class="skeleton-circle shimmer"></div>
                <div class="d-flex flex-column gap-2 flex-grow-1">
                  <div class="skeleton-line w-75 shimmer"></div>
                  <div class="skeleton-line w-50 shimmer"></div>
                </div>
              </div>
              <div
                v-else-if="column.type === 'status'"
                class="skeleton-badge shimmer"
              ></div>
              <div v-else class="skeleton-line w-75 shimmer"></div>
            </td>
            <td v-if="showActions" class="text-end">
              <div class="skeleton-actions d-flex justify-content-end">
                <div class="skeleton-btn shimmer"></div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="filteredRows.length">
          <tr
            v-for="row in paginatedRows"
            :key="row.id ?? row.name"
            :class="{ 'clickable-row': clickableRows }"
            @click="handleRowClick(row, $event)"
          >
            <td v-for="column in columns" :key="column.key">
              <div v-if="column.key === 'name'" class="identity-cell">
                <img
                  v-if="row.avatar && !failedAvatars.has(row.id ?? row.name)"
                  :src="row.avatar"
                  :alt="`${row.name} profile picture`"
                  class="avatar-image"
                  @error="handleAvatarError(row)"
                />
                <span v-else class="avatar-dot">{{ initials(row.name) }}</span>
                <div>
                  <strong>{{ row.name }}</strong>
                  <small>{{ row.detail }}</small>
                </div>
              </div>
              <span
                v-else-if="column.type === 'status'"
                :class="['status-pill', statusClass(row[column.key])]"
              >
                {{ row[column.key] }}
              </span>
              <span v-else>{{ row[column.key] }}</span>
            </td>
            <td v-if="showActions" class="text-end">
              <div class="actions-dropdown-container">
                <button
                  class="btn-action-dots"
                  type="button"
                  title="Actions"
                  @click.stop="toggleMenu(row.id ?? row.name)"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>

                <div
                  v-if="activeMenuId === (row.id ?? row.name)"
                  class="actions-dropdown-menu"
                >
                  <button
                    type="button"
                    @click.stop="handleEdit(row)"
                    class="dropdown-item"
                  >
                    <i class="bi bi-pencil-fill text-primary"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    v-if="
                      itemLabel === 'users' &&
                      ['Active', 'Suspended'].includes(row.status)
                    "
                    type="button"
                    @click.stop="handleDelete(row)"
                    class="dropdown-item"
                    :class="{ delete: row.status === 'Active' }"
                  >
                    <i
                      :class="[
                        'bi',
                        row.status === 'Active'
                          ? 'bi-person-x-fill text-danger'
                          : 'bi-person-check-fill text-success',
                      ]"
                    ></i>
                    <span
                      :class="
                        row.status === 'Active' ? 'text-danger' : 'text-success'
                      "
                      >{{
                        row.status === "Active" ? "Suspend" : "Reactivate"
                      }}</span
                    >
                  </button>
                  <button
                    v-else
                    type="button"
                    @click.stop="handleDelete(row)"
                    class="dropdown-item delete"
                  >
                    <i class="bi bi-trash-fill text-danger"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td
              class="empty-table-state"
              :colspan="columns.length + (showActions ? 1 : 0)"
            >
              <i class="bi bi-search"></i>
              <strong>{{ emptyStateTitle }}</strong>
              <span>{{ emptyStateMessage }}</span>
              <button
                v-if="search"
                class="btn btn-light btn-sm border empty-action"
                type="button"
                @click="search = ''"
              >
                <i class="bi bi-x-circle"></i>
                Clear Search
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="!isLoading && filteredRows.length" class="pagination-footer">
      <p>
        Showing <strong>{{ firstVisibleRow }}-{{ lastVisibleRow }}</strong> of
        <strong>{{ filteredRows.length }}</strong> {{ itemLabel }}
      </p>

      <nav
        v-if="totalPages > 1"
        class="pagination-controls"
        :aria-label="`${itemLabel} list pagination`"
      >
        <button
          class="pagination-btn"
          type="button"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          title="Previous page"
          @click="currentPage -= 1"
        >
          <i class="bi bi-chevron-left"></i>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          class="pagination-btn"
          :class="{ active: currentPage === page }"
          type="button"
          :aria-current="currentPage === page ? 'page' : undefined"
          :aria-label="`Page ${page}`"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          class="pagination-btn"
          type="button"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          title="Next page"
          @click="currentPage += 1"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </nav>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";

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
    default: "Search records",
  },
  itemLabel: {
    type: String,
    default: "records",
  },
  emptyTitle: {
    type: String,
    default: "",
  },
  emptyDescription: {
    type: String,
    default: "",
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  clickableRows: {
    type: Boolean,
    default: false,
  },
  showTabs: {
    type: Boolean,
    default: false,
  },
  tabs: {
    type: Array,
    default: () => [],
  },
  activeTab: {
    type: String,
    default: "",
  },
  getTabCount: {
    type: Function,
    default: () => 0,
  },
});

const search = ref("");
const currentPage = ref(1);
const failedAvatars = ref(new Set());

const filteredRows = computed(() => {
  const needle = search.value.toLowerCase();
  if (!needle) return props.rows;

  return props.rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(needle),
  );
});
const emptyStateTitle = computed(() =>
  search.value
    ? `No ${props.itemLabel} match your search`
    : props.emptyTitle || `No ${props.itemLabel} yet`,
);
const emptyStateMessage = computed(() =>
  search.value
    ? "Clear the search or try a different phrase."
    : props.emptyDescription ||
      `New ${props.itemLabel} will appear here when available.`,
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / props.pageSize)),
);
const firstVisibleRow = computed(
  () => (currentPage.value - 1) * props.pageSize + 1,
);
const lastVisibleRow = computed(() =>
  Math.min(currentPage.value * props.pageSize, filteredRows.value.length),
);
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return filteredRows.value.slice(start, start + props.pageSize);
});

watch(search, () => {
  currentPage.value = 1;
});

watch(totalPages, (pageCount) => {
  if (currentPage.value > pageCount) {
    currentPage.value = pageCount;
  }
});

const handleAvatarError = (row) => {
  failedAvatars.value = new Set([...failedAvatars.value, row.id ?? row.name]);
};

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (value.includes("suspended")) return "danger";
  if (value.includes("active") || value.includes("published")) return "success";
  if (
    value.includes("pending") ||
    value.includes("draft") ||
    value.includes("scheduled")
  )
    return "warning";
  if (value.includes("deactivated") || value.includes("inactive"))
    return "neutral";
  return "neutral";
};

const emit = defineEmits(["edit", "delete", "row-click", "update:activeTab"]);

const handleRowClick = (row, event) => {
  if (!props.clickableRows) return;
  if (
    event.target.closest(".actions-dropdown-container") ||
    event.target.closest(".btn-action-dots")
  ) {
    return;
  }
  emit("row-click", row);
};

const activeMenuId = ref(null);

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const closeMenu = () => {
  activeMenuId.value = null;
};

const handleEdit = (row) => {
  closeMenu();
  emit("edit", row);
};

const handleDelete = (row) => {
  closeMenu();
  emit("delete", row);
};

onMounted(() => {
  document.addEventListener("click", closeMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeMenu);
});
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

.panel-right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
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
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
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

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
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
  border: 1px solid rgba(84, 131, 179, 0.22);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.clean-table thead th {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  white-space: nowrap !important;
}

.clean-table td {
  white-space: nowrap !important;
}

.identity-cell {
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: normal !important;
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

.avatar-image {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 50%;
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

/* Premium Actions Dropdown */
.actions-dropdown-container {
  position: relative;
  display: inline-block;
}

.btn-action-dots {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.btn-action-dots:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.actions-dropdown-menu {
  position: absolute;
  right: 0;
  top: 110%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 0.35rem;
  z-index: 100;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  animation: dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdown-enter {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.4rem 0.65rem;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.dropdown-item i {
  font-size: 0.9rem;
}

.dropdown-item.delete {
  color: var(--color-danger, #ef4444);
}

.dropdown-item.delete:hover {
  background: var(--color-danger-light, rgba(239, 68, 68, 0.12));
  color: var(--color-danger, #ef4444);
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

.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.pagination-footer p {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  margin: 0;
}

.pagination-footer strong {
  color: var(--color-text);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pagination-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 800;
}

.pagination-btn:hover:not(:disabled) {
  color: var(--color-primary);
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
}

.pagination-btn.active {
  color: #fff;
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.empty-table-state {
  padding: 2.75rem 1rem !important;
  color: var(--color-text-muted) !important;
  font-size: 0.88rem;
  text-align: center;
}

.empty-table-state i {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 1.25rem;
}

.empty-table-state strong,
.empty-table-state span {
  display: block;
}

.empty-table-state strong {
  color: var(--color-text);
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  font-weight: 700;
}

.empty-action i {
  display: inline;
  margin: 0;
  font-size: inherit;
}

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: 0;
  }

  .pagination-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagination-controls {
    flex-wrap: wrap;
  }
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clickable-row:hover {
  background-color: var(--color-surface-hover) !important;
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

[data-theme="dark"] .skeleton-line {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-border-soft);
  flex-shrink: 0;
}

[data-theme="dark"] .skeleton-circle {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-badge {
  width: 64px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border-soft);
}

[data-theme="dark"] .skeleton-badge {
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--color-border-soft);
}

[data-theme="dark"] .skeleton-btn {
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

[data-theme="dark"] .shimmer {
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

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  width: fit-content;
  margin-top: 1rem;
  padding: 0.25rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.tab-btn {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.7rem;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  text-transform: capitalize;
  transition:
    color var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.tab-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.tab-btn.active {
  background: var(--color-primary-light);
  border-color: rgba(84, 131, 179, 0.38);
  color: var(--color-primary-hover);
  box-shadow: 0 0 0 2px rgba(84, 131, 179, 0.08);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 0.1rem 0.3rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 999px;
  text-align: center;
}

.tab-btn.active .tab-badge {
  background: var(--color-primary);
  color: #fff;
}
</style>
