<template>
  <section class="admin-panel">
    <div class="panel-title-row">
      <div>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>
      <button class="btn btn-primary create-btn" type="button" @click="$emit('create')">
        <i class="bi bi-plus-lg"></i>
        <span>Add {{ itemLabel }}</span>
      </button>
    </div>

    <div class="taxonomy-grid">
      <article v-for="item in items" :key="item.id || item.name" class="taxonomy-card">
        <span :class="['taxonomy-icon', item.colorClass]">
          <i :class="['bi', icon]"></i>
        </span>
        <div class="taxonomy-content">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <div class="taxonomy-meta">
            <span>{{ item.items }} items</span>
            <span>{{ item.type || item.owner }}</span>
          </div>
        </div>
        <div class="taxonomy-actions">
          <button class="icon-btn" type="button" :title="`Edit ${item.name}`" @click="$emit('edit', item)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="icon-btn delete-btn" type="button" :title="`Delete ${item.name}`" @click="$emit('delete', item)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
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
});

defineEmits(['create', 'edit', 'delete']);
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

.taxonomy-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
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
}

.create-btn,
.taxonomy-actions,
.icon-btn {
  display: inline-flex;
  align-items: center;
}

.create-btn {
  gap: 0.45rem;
  white-space: nowrap;
}

.taxonomy-actions {
  gap: 0.35rem;
}

.icon-btn {
  width: 34px;
  height: 34px;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.icon-btn:hover {
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.delete-btn:hover {
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

@media (max-width: 767.98px) {
  .panel-title-row {
    flex-direction: column;
  }

  .taxonomy-grid {
    grid-template-columns: 1fr;
  }
}
</style>
