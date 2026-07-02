<template>
  <div class="admin-page-layout d-flex min-vh-100">
    <AdminSidebar />

    <main class="admin-main flex-grow-1">
      <AdminTopbar :current-title="title" :breadcrumbs="breadcrumbs" />

      <div class="admin-content-wrapper admin-page-content">
        

        <AdminMetricGrid v-if="metrics.length" :metrics="metrics" />
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import AdminMetricGrid from "./AdminMetricGrid.vue";
import AdminSidebar from "./AdminSidebar.vue";
import AdminTopbar from "./AdminTopbar.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  kicker: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  metrics: {
    type: Array,
    default: () => [],
  },
  breadcrumbs: {
    type: Array,
    default: null,
  },
});
</script>

<style scoped>
.admin-page-layout,
.admin-main {
  background: transparent;
}

.admin-page-content {
  max-width: 1320px;
  padding: 28px 28px 48px;
}

.admin-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.admin-kicker {
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-page-header h1 {
  color: var(--color-text);
  font-size: clamp(1.7rem, 2vw, 2.4rem);
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 0.5rem;
}

.admin-page-header p {
  max-width: 760px;
  color: var(--color-text-muted);
  margin-bottom: 0;
}

@media (max-width: 991.98px) {
  .admin-page-layout {
    display: block !important;
  }
}

@media (max-width: 767.98px) {
  .admin-page-content {
    padding: 22px 16px 44px;
  }

  .admin-page-header {
    flex-direction: column;
  }
}
</style>
