<template>
  <AdminPageShell
    title="User Management"
    kicker="Admin Users"
    subtitle="Review accounts, roles, status, and recent user activity."
    :metrics="metrics"
  >
    <template #actions>
      <router-link class="btn btn-primary action-btn" to="/admin/users/create">
        <i class="bi bi-person-plus"></i>
        <span>New User</span>
      </router-link>
    </template>

    <AdminListPanel
      title="All Users"
      subtitle="A clean table for managing forum members."
      placeholder="Search users"
      :columns="columns"
      :rows="users"
    />
  </AdminPageShell>
</template>

<script setup>
import AdminListPanel from '../../components/admin/AdminListPanel.vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';

const metrics = [
  { label: 'Total Users', value: '1,284', change: '+42 this week', icon: 'bi-people', className: 'blue' },
  { label: 'Admins', value: '8', change: '2 active now', icon: 'bi-shield-check', className: 'green' },
  { label: 'Suspended', value: '16', change: '-4 this month', icon: 'bi-person-dash', className: 'orange' },
  { label: 'New Requests', value: '24', change: 'Needs review', icon: 'bi-inbox', className: 'purple' },
];

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'joined', label: 'Joined' },
];

const users = [
  { name: 'Sopanha Voeun', detail: 'sopanha@ant.dev', role: 'Admin', status: 'Active', joined: 'May 28, 2026' },
  { name: 'Mony Rath', detail: 'mony@student.ant', role: 'Moderator', status: 'Active', joined: 'May 21, 2026' },
  { name: 'Dara Kim', detail: 'dara@student.ant', role: 'Student', status: 'Pending', joined: 'May 19, 2026' },
  { name: 'Lina Sok', detail: 'lina@student.ant', role: 'Student', status: 'Suspended', joined: 'Apr 30, 2026' },
];
</script>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
