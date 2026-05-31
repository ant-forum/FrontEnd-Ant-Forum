<template>
  <AdminPageShell
    title="Create User"
    kicker="Admin Users"
    subtitle="Add a user, choose access, and send the invite after review."
  >
    <template #actions>
      <router-link class="btn btn-light border back-link" to="/admin/users">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Users</span>
      </router-link>
    </template>

    <section class="create-user-grid">
      <form class="admin-panel clean-form" @submit.prevent="saved = true">
        <div class="form-heading">
          <span class="panel-icon">
            <i class="bi bi-person-plus"></i>
          </span>
          <div>
            <h2>Account Details</h2>
            <p>Keep the profile clear and assign the smallest role needed.</p>
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Full Name</label>
            <input v-model="form.name" class="form-control" type="text" placeholder="Enter full name">
          </div>

          <div class="field-block">
            <label>Email Address</label>
            <input v-model="form.email" class="form-control" type="email" placeholder="name@example.com">
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Role</label>
            <select v-model="form.role" class="form-select">
              <option>Student</option>
              <option>Moderator</option>
              <option>Admin</option>
            </select>
          </div>

          <div class="field-block">
            <label>Status</label>
            <select v-model="form.status" class="form-select">
              <option>Invite Pending</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>

        <div class="field-block">
          <label>Notes</label>
          <textarea v-model="form.notes" class="form-control" rows="4" placeholder="Optional admin notes"></textarea>
        </div>

        <label class="invite-toggle">
          <span>
            <strong>Send invite email</strong>
            <small>User receives setup instructions after saving.</small>
          </span>
          <input v-model="form.sendInvite" class="form-check-input" type="checkbox">
        </label>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">
            <i class="bi bi-check2"></i>
            <span>{{ saved ? 'Saved' : 'Create User' }}</span>
          </button>
        </div>
      </form>

      <aside class="side-stack">
        <div class="admin-panel preview-panel">
          <div class="preview-avatar">{{ initials }}</div>
          <h2>{{ form.name || 'New User' }}</h2>
          <p>{{ form.email || 'No email added' }}</p>
          <div class="preview-meta">
            <span>{{ form.role }}</span>
            <span>{{ form.status }}</span>
          </div>
        </div>

        <div class="admin-panel checklist">
          <h2>Before Saving</h2>
          <ul>
            <li><i class="bi bi-check-circle"></i>Use a real email address</li>
            <li><i class="bi bi-check-circle"></i>Pick the smallest role needed</li>
            <li><i class="bi bi-check-circle"></i>Review invite status</li>
            <li><i class="bi bi-check-circle"></i>Record notes when needed</li>
          </ul>
        </div>
      </aside>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const saved = ref(false);
const form = reactive({
  name: '',
  email: '',
  role: 'Student',
  status: 'Invite Pending',
  notes: '',
  sendInvite: true,
});

const initials = computed(() => {
  const name = form.name.trim();
  if (!name) return 'NU';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
});
</script>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.create-user-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
  gap: 1rem;
  align-items: start;
}

.admin-panel {
  padding: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.clean-form,
.field-block {
  display: grid;
  gap: 0.7rem;
}

.form-heading {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.form-heading h2,
.preview-panel h2,
.checklist h2 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.form-heading p,
.preview-panel p {
  color: var(--color-text-muted);
  font-size: 0.88rem;
  margin: 0;
}

.panel-icon,
.preview-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-icon {
  width: 40px;
  height: 40px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.form-control,
.form-select {
  min-height: 42px;
  border-radius: 8px !important;
  font-size: 0.9rem;
}

.invite-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.invite-toggle strong,
.invite-toggle small {
  display: block;
}

.invite-toggle strong {
  color: var(--color-text);
  font-size: 0.9rem;
}

.invite-toggle small {
  color: var(--color-text-muted);
  font-size: 0.78rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.side-stack {
  display: grid;
  gap: 1rem;
}

.preview-panel {
  text-align: center;
}

.preview-avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 0.9rem;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 800;
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.preview-meta span {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 0.3rem 0.65rem;
}

.checklist ul {
  list-style: none;
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
}

.checklist li {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.88rem;
}

.checklist i {
  color: var(--color-success);
}

@media (max-width: 991.98px) {
  .create-user-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
