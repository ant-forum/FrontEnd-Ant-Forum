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

        <button class="btn btn-primary create-btn" type="button" @click="$emit('create')">
          <i class="bi bi-plus-lg"></i>
          <span>Add {{ itemLabel }}</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="taxonomy-empty">
      <span class="spinner-border spinner-border-sm"></span>
      <span>Loading {{ title.toLowerCase() }}...</span>
    </div>

    <div v-else-if="filteredItems.length" class="taxonomy-grid">
      <article
        v-for="item in filteredItems"
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

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
</style>
