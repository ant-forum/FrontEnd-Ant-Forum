<template>
  <AdminPageShell
    title="Blog Management"
    kicker="Admin Publishing"
    subtitle="Manage official posts. Only admins can create and publish blog content."
    :metrics="metrics"
  >
    <template #actions>
      <router-link class="btn btn-primary create-btn" to="/admin/blogs/create">
        <i class="bi bi-plus-lg"></i>
        <span>Create Blog</span>
      </router-link>
    </template>

    <section class="admin-panel posts-panel">
      <div class="panel-heading">
        <div>
          <h2>Recent Blog Posts</h2>
          <p>Track admin-created blog content and publishing status.</p>
        </div>
        <label class="search-box">
          <i class="bi bi-search"></i>
          <input v-model.trim="search" type="search" placeholder="Search posts">
        </label>
      </div>

      <div class="post-list">
        <article v-for="post in visiblePosts" :key="post.title" class="post-row">
          <span class="post-thumb">
            <i class="bi bi-file-earmark-post"></i>
          </span>
          <div>
            <h3>{{ post.title }}</h3>
            <p>{{ post.description }}</p>
            <div class="post-meta">
              <span>category_id: {{ post.category_id }}</span>
              <span>{{ post.thumbnail }}</span>
              <span>{{ post.updated }}</span>
            </div>
          </div>
          <span :class="['status-pill', post.status]">{{ post.status }}</span>
        </article>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const search = ref('');

const metrics = [
  { label: 'Admin Posts', value: '42', change: 'Only admins publish', icon: 'bi-file-earmark-text', className: 'blue' },
  { label: 'Published', value: '29', change: 'Live content', icon: 'bi-send-check', className: 'green' },
  { label: 'Drafts', value: '9', change: 'Needs editing', icon: 'bi-pencil', className: 'purple' },
  { label: 'Scheduled', value: '4', change: 'This week', icon: 'bi-calendar-event', className: 'orange' },
];

const posts = [
  { title: 'Welcome to ANT Forum', description: 'Official announcement for the student developer community.', category_id: 1, thumbnail: 'welcome-cover.jpg', status: 'published', updated: 'May 29, 2026' },
  { title: 'How to submit a project', description: 'Step-by-step guide for preparing a showcase submission.', category_id: 2, thumbnail: 'submit-guide.jpg', status: 'draft', updated: 'May 27, 2026' },
  { title: 'Forum rules refresh', description: 'Updated policy notes for healthier forum discussion.', category_id: 3, thumbnail: 'policy-cover.jpg', status: 'scheduled', updated: 'May 26, 2026' },
];

const visiblePosts = computed(() => {
  const needle = search.value.toLowerCase();
  if (!needle) return posts;

  return posts.filter((post) => JSON.stringify(post).toLowerCase().includes(needle));
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

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-heading h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.panel-heading p {
  color: var(--color-text-muted);
  font-size: 0.88rem;
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
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
}

.post-list {
  display: grid;
  gap: 0.75rem;
}

.post-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.post-thumb {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-info);
  background: var(--color-info-light);
  border-radius: 8px;
}

.post-row h3 {
  color: var(--color-text);
  font-size: 0.98rem;
  font-weight: 800;
  margin: 0 0 0.2rem;
}

.post-row p {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.post-meta {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.6rem;
}

.status-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
  text-transform: capitalize;
}

.status-pill.published {
  color: var(--color-success);
  background: var(--color-success-light);
}

.status-pill.draft {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.status-pill.scheduled {
  color: var(--color-info);
  background: var(--color-info-light);
}

@media (max-width: 767.98px) {
  .panel-heading,
  .post-row {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
    min-width: 0;
  }
}
</style>
