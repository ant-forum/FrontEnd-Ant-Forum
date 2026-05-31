<template>
  <section class="admin-panel">
    <div class="panel-title-row list-toolbar">
      <div>
        <h2>All Student Projects</h2>
        <p>Sort student submissions by recent posts, likes, review status, or published work.</p>
      </div>
      <div class="toolbar-controls">
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="query" type="search" placeholder="Search projects">
        </label>
      </div>
    </div>

    <div class="project-sort-tabs" role="group" aria-label="Project sort options">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        type="button"
        :class="{ active: selectedSort === option.value }"
        @click="selectedSort = option.value"
      >
        <i :class="['bi', option.icon]"></i>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <div class="project-list">
      <article v-for="project in visibleProjects" :key="project.name" class="project-list-item">
        <div class="project-main">
          <span class="project-icon">
            <i class="bi bi-folder2-open"></i>
          </span>
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
          <button class="btn btn-light border btn-sm" type="button">
            <i class="bi bi-eye"></i>
            <span>View</span>
          </button>
        </div>
      </article>

      <div v-if="visibleProjects.length === 0" class="empty-projects">
        <i class="bi bi-search"></i>
        <span>No student projects found.</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const query = ref('');
const selectedSort = ref('recent');

const sortOptions = [
  { label: 'Recent Post', value: 'recent', icon: 'bi-clock-history' },
  { label: 'Most Liked', value: 'likes', icon: 'bi-heart' },
  { label: 'In Review', value: 'review', icon: 'bi-hourglass-split' },
  { label: 'Published', value: 'published', icon: 'bi-check2-circle' },
];

const projects = [
  { name: 'ANT Forum Redesign', description: 'Student forum interface and moderation experience.', status: 'In Review', author: 'Sopanha Voeun', category: 'Web App', updated: 'Today', dateOrder: 6, likes: 184, comments: 32 },
  { name: 'Portfolio Showcase', description: 'Public project gallery with profile and publishing flow.', status: 'Published', author: 'Mony Rath', category: 'Showcase', updated: 'Yesterday', dateOrder: 5, likes: 241, comments: 44 },
  { name: 'Learning Tracker', description: 'Dashboard for assignments, tasks, and class progress.', status: 'Published', author: 'Dara Kim', category: 'Education', updated: 'May 24', dateOrder: 4, likes: 163, comments: 18 },
  { name: 'Dormitory Helper', description: 'Student utility app for room reports and maintenance requests.', status: 'In Review', author: 'Lina Sok', category: 'Mobile App', updated: 'May 21', dateOrder: 3, likes: 98, comments: 11 },
  { name: 'Code Snippet Library', description: 'Reusable snippets with tags, copy actions, and search.', status: 'Published', author: 'Rithy Heng', category: 'Developer Tool', updated: 'May 18', dateOrder: 2, likes: 207, comments: 29 },
];

const visibleProjects = computed(() => {
  const needle = query.value.toLowerCase();
  let results = projects;

  if (needle) {
    results = results.filter((project) => JSON.stringify(project).toLowerCase().includes(needle));
  }

  if (selectedSort.value === 'likes') {
    return [...results].sort((a, b) => b.likes - a.likes);
  }

  if (selectedSort.value === 'review') {
    return results.filter((project) => project.status === 'In Review');
  }

  if (selectedSort.value === 'published') {
    return results.filter((project) => project.status === 'Published');
  }

  return [...results].sort((a, b) => b.dateOrder - a.dateOrder);
});

const statusClass = (status) => (status === 'Published' ? 'success' : 'warning');
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
.project-meta,
.project-stats {
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

.project-sort-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding: 0.25rem;
  margin-bottom: 0.75rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: fit-content;
}

.project-sort-tabs button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.7rem;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  font-weight: 800;
}

.project-sort-tabs button.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.project-list {
  display: grid;
  gap: 0.75rem;
}

.project-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.project-main {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.8rem;
}

.project-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--color-info-light);
  color: var(--color-info);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.25rem;
}

.project-title-row h3 {
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
  margin: 0;
}

.project-list-item p {
  color: var(--color-text-muted);
  font-size: 0.86rem;
  line-height: 1.45;
  margin-bottom: 0.55rem;
}

.project-meta {
  color: var(--color-text-muted);
  flex-wrap: wrap;
  font-size: 0.82rem;
}

.project-stats {
  justify-content: flex-end;
  gap: 0.65rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.project-stats span,
.project-stats .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.project-stats .btn {
  min-height: 32px;
  padding: 0.25rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.project-stats .bi-heart-fill {
  color: var(--color-danger);
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

.empty-projects {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
}

@media (max-width: 767.98px) {
  .panel-title-row,
  .project-list-item,
  .project-stats {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-box,
  .project-stats {
    width: 100%;
  }
}
</style>
