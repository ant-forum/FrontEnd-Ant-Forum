<template>
  <AdminPageShell
    title="Settings"
    kicker="System Settings"
    subtitle="Manage common forum configuration and moderation controls."
    :metrics="metrics"
  >
    <section class="settings-grid">
      <form class="admin-panel clean-form" @submit.prevent="saved = true">
        <h2>General Settings</h2>

        <div class="field-block">
          <label>Forum Name</label>
          <input class="form-control" type="text" placeholder="ANT Forum">
        </div>

        <div class="field-block">
          <label>Support Email</label>
          <input class="form-control" type="email" placeholder="support@ant.dev">
        </div>

        <div class="field-block">
          <label>Default Reply Window</label>
          <input class="form-control" type="text" placeholder="48 hours">
        </div>

        <button class="btn btn-primary settings-save" type="submit">
          <i class="bi bi-check2"></i>
          <span>{{ saved ? 'Saved' : 'Save Settings' }}</span>
        </button>
      </form>

      <div class="admin-panel">
        <h2>Admin Controls</h2>
        <div class="toggle-list">
          <label v-for="control in controls" :key="control.label" class="toggle-row">
            <span>
              <strong>{{ control.label }}</strong>
              <small>{{ control.detail }}</small>
            </span>
            <input class="form-check-input" type="checkbox" :checked="control.enabled">
          </label>
        </div>
      </div>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { ref } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const saved = ref(false);

const metrics = [
  { label: 'System', value: 'Online', change: 'All services ready', icon: 'bi-check-circle', className: 'green' },
  { label: 'Theme', value: 'Auto', change: 'User preference', icon: 'bi-palette', className: 'purple' },
  { label: 'Security', value: 'Strong', change: '2FA ready', icon: 'bi-shield-lock', className: 'blue' },
  { label: 'Backups', value: 'Daily', change: 'Last run today', icon: 'bi-database-check', className: 'orange' },
];

const controls = [
  { label: 'Require review for first post', detail: 'New users need moderator approval once.', enabled: true },
  { label: 'Allow project showcase submissions', detail: 'Students can submit portfolio projects.', enabled: true },
  { label: 'Enable weekly digest email', detail: 'Send forum highlights to members.', enabled: false },
];
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 1rem;
}

.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.admin-panel h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.clean-form,
.field-block,
.toggle-list {
  display: grid;
  gap: 1rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.settings-save {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.toggle-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.toggle-row strong,
.toggle-row small {
  display: block;
}

.toggle-row small {
  color: var(--color-text-muted);
}

@media (max-width: 991.98px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
