<template>
  <section class="admin-panel">
    <div class="panel-title-row">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>

      <div class="panel-toolbar">
        <label v-if="showSearch" class="search-field">
          <span class="visually-hidden">Search {{ title.toLowerCase() }}</span>
          <i class="bi bi-search"></i>
          <input
            v-model.trim="searchQuery"
            type="search"
            :placeholder="`Search ${title.toLowerCase()}...`"
          >
          <button
            v-if="searchQuery"
            type="button"
            aria-label="Clear search"
            title="Clear search"
            @click="searchQuery = ''"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </label>

        <BaseButton class="create-btn" type="button" @click="$emit('create')">
          <i class="bi bi-plus-lg"></i>
          <span>Add {{ itemLabel }}</span>
        </BaseButton>
      </div>
    </div>

    <div v-if="isLoading" class="taxonomy-grid" aria-live="polite" aria-busy="true">
      <span class="visually-hidden">Loading {{ title.toLowerCase() }}...</span>
      <article
        v-for="item in 6"
        :key="item"
        class="taxonomy-card taxonomy-card-skeleton"
        aria-hidden="true"
      >
        <span class="taxonomy-skeleton-icon shimmer"></span>
        <div class="taxonomy-content">
          <span class="taxonomy-skeleton-line taxonomy-skeleton-title shimmer"></span>
          <span class="taxonomy-skeleton-line shimmer"></span>
          <span class="taxonomy-skeleton-line taxonomy-skeleton-description shimmer"></span>
          <span class="taxonomy-skeleton-line taxonomy-skeleton-meta shimmer"></span>
        </div>
        <span class="taxonomy-skeleton-menu shimmer"></span>
      </article>
    </div>

    <template v-else-if="filteredItems.length">
      <div class="taxonomy-grid">
        <article
          v-for="item in paginatedItems"
          :key="item.id ?? item.name"
          class="taxonomy-card"
          :class="{ 'taxonomy-card-clickable': clickable }"
          :role="clickable ? 'link' : undefined"
          :tabindex="clickable ? 0 : undefined"
          @click="handleCardClick(item)"
          @keydown.enter.self="handleCardClick(item)"
        >
          <span :class="['taxonomy-icon', item.colorClass]">
            <i :class="['bi', icon]"></i>
          </span>
          <div class="taxonomy-content">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="taxonomy-meta">
              <span v-if="item.items !== undefined">{{ item.items }} items</span>
              <span v-if="item.type" class="taxonomy-type">
                <i class="bi bi-layers"></i>
                {{ item.type }}
              </span>
              <span v-else-if="item.owner" class="taxonomy-type">
                <i class="bi bi-layers"></i>
                {{ item.owner }}
              </span>
            </div>
          </div>
          <div class="taxonomy-menu">
            <button
              class="icon-btn"
              type="button"
              :title="`Actions for ${item.name}`"
              aria-label="Open actions menu"
              @click.stop="toggleMenu(item)"
            >
              <i class="bi bi-three-dots"></i>
            </button>

            <div v-if="activeMenuId === item.id" class="taxonomy-menu-dropdown">
              <button type="button" @click.stop="selectAction('edit', item)">
                <i class="bi bi-pencil"></i>
                <span>Edit</span>
              </button>
              <button class="delete-btn" type="button" @click.stop="selectAction('delete', item)">
                <i class="bi bi-trash"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <footer class="pagination-footer mt-4">
        <p>
          Showing <strong>{{ firstVisibleRow }}-{{ lastVisibleRow }}</strong>
          of <strong>{{ filteredItems.length }}</strong> {{ itemLabel.toLowerCase() }}s
        </p>

        <nav v-if="totalPages > 1" class="pagination-controls" :aria-label="`${itemLabel} list pagination`">
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
    </template>

    <div v-else-if="searchQuery" class="taxonomy-empty">
      <i class="bi bi-search"></i>
      <span>No {{ title.toLowerCase() }} match "{{ searchQuery }}".</span>
    </div>

    <div v-else class="taxonomy-empty">
      <i class="bi bi-inbox"></i>
      <span>No {{ title.toLowerCase() }} found.</span>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import BaseButton from '../base/BaseButton.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  itemLabel: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  showView: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['create', 'view', 'edit', 'delete', 'click-item']);
const activeMenuId = ref(null);
const searchQuery = ref('');

const filteredItems = computed(() => {
  const needle = searchQuery.value.toLowerCase();
  if (!needle) return props.items;

  return props.items.filter((item) => {
    return [item.name, item.description, item.type, item.owner]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });
});

const currentPage = ref(1);
const pageSize = 8;

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize)));
const firstVisibleRow = computed(() => (currentPage.value - 1) * pageSize + 1);
const lastVisibleRow = computed(() => Math.min(currentPage.value * pageSize, filteredItems.value.length));
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1));
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredItems.value.slice(start, start + pageSize);
});

watch(filteredItems, () => {
  currentPage.value = 1;
});

const closeMenu = () => {
  activeMenuId.value = null;
};

const toggleMenu = (item) => {
  activeMenuId.value = activeMenuId.value === item.id ? null : item.id;
};

const selectAction = (action, item) => {
  closeMenu();
  emit(action, item);
};

const handleCardClick = (item) => {
  if (!props.clickable) return;
  selectAction('click-item', item);
};

onMounted(() => {
  document.addEventListener('click', closeMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu);
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-title-row h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-title-row p,
.taxonomy-card p,
.taxonomy-meta {
  color: var(--color-text-muted);
}

.panel-title-row p {
  margin-bottom: 0;
}

.panel-toolbar {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

.search-field {
  position: relative;
  width: min(320px, 55vw);
}

.search-field > i {
  position: absolute;
  top: 50%;
  left: 0.85rem;
  color: var(--color-text-muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.search-field input {
  width: 100%;
  height: 40px;
  padding: 0 2.45rem 0 2.35rem;
  color: var(--color-text);
  font-size: 0.86rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  outline: 0;
  transition: all var(--transition-base);
}

.search-field input:focus {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.search-field button {
  position: absolute;
  top: 50%;
  right: 0.45rem;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  transform: translateY(-50%);
}

.search-field button:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.taxonomy-empty {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.taxonomy-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: start;
  padding: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all var(--transition-base);
}

.taxonomy-card-skeleton {
  pointer-events: none;
}

.taxonomy-skeleton-icon,
.taxonomy-skeleton-menu,
.taxonomy-skeleton-line {
  display: block;
  background: var(--color-border-soft, rgba(0, 0, 0, 0.08));
}

.taxonomy-skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.taxonomy-skeleton-menu {
  width: 34px;
  height: 34px;
  border-radius: 8px;
}

.taxonomy-skeleton-line {
  width: 100%;
  height: 10px;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.taxonomy-skeleton-title {
  width: 42%;
  height: 14px;
  margin-bottom: 0.75rem;
}

.taxonomy-skeleton-description {
  width: 72%;
  margin-bottom: 0.85rem;
}

.taxonomy-skeleton-meta {
  width: 32%;
  margin-bottom: 0;
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-border-soft, rgba(0, 0, 0, 0.08)) 25%,
    var(--color-surface-hover, rgba(0, 0, 0, 0.04)) 37%,
    var(--color-border-soft, rgba(0, 0, 0, 0.08)) 63%
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

.taxonomy-card-clickable {
  cursor: pointer;
}

.taxonomy-card-clickable:hover,
.taxonomy-card-clickable:focus-visible {
  transform: translateY(-2px);
  border-color: var(--color-primary) !important;
  box-shadow: var(--shadow-sm);
}

.taxonomy-card-clickable:focus-visible {
  outline: 3px solid var(--color-primary-light);
}

.create-btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
}

.create-btn {
  gap: 0.45rem;
  white-space: nowrap;
}

.icon-btn {
  width: 34px;
  height: 34px;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid transparent;
  border-radius: 8px;
}

.icon-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border);
}

.taxonomy-menu {
  position: relative;
}

.taxonomy-menu-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 5;
  width: 150px;
  padding: 0.35rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
}

.taxonomy-menu-dropdown button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.65rem;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  font-weight: 700;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.taxonomy-menu-dropdown button:hover {
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.taxonomy-menu-dropdown .delete-btn:hover {
  color: var(--color-danger);
}

.taxonomy-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.taxonomy-icon.blue {
  background: var(--color-info-light);
  color: var(--color-info);
}

.taxonomy-icon.green {
  background: var(--color-success-light);
  color: var(--color-success);
}

.taxonomy-icon.orange {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.taxonomy-icon.purple {
  background: var(--color-purple-light);
  color: var(--color-purple);
}

.taxonomy-card h3 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.taxonomy-card p {
  font-size: 0.88rem;
  margin-bottom: 0.8rem;
}

.taxonomy-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
}

.taxonomy-type {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-primary);
}

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
  }

  .panel-toolbar {
    width: 100%;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .taxonomy-grid {
    grid-template-columns: 1fr;
  }
}

/* Pagination Footer Styles */
.pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.pagination-footer p {
  color: var(--color-text-muted) !important;
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
  transition: all var(--transition-base);
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
</style>
