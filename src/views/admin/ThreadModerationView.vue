<template>
  <AdminPageShell
    title="Thread Management"
    kicker="Forum Moderation"
    subtitle="Review reported threads, lock noisy discussions, and keep forum content healthy."
    :metrics="metrics"
  >
    <AdminThreadQueue />
  </AdminPageShell>
</template>

<script setup>
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminThreadQueue from '../../components/admin/AdminThreadQueue.vue';

const metrics = [
  { label: 'Open Threads', value: '342', change: '+18 today', icon: 'bi-chat-dots', className: 'blue' },
  { label: 'Reports', value: '7', change: '3 high priority', icon: 'bi-flag', className: 'orange' },
  { label: 'Locked', value: '11', change: 'This month', icon: 'bi-lock', className: 'purple' },
  { label: 'Resolved', value: '96%', change: 'Response rate', icon: 'bi-check2-circle', className: 'green' },
];
</script>
