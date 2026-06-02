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
import { computed } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminThreadQueue from '../../components/admin/AdminThreadQueue.vue';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const adminStore = useAdminOperationsStore();
const metrics = computed(() => [
  { label: 'Open Reports', value: String(adminStore.pendingReports.length), change: 'Needs admin decision', icon: 'bi-chat-dots', className: 'blue' },
  { label: 'High Priority', value: String(adminStore.highPriorityReports.length), change: 'Review these first', icon: 'bi-flag', className: 'orange' },
  { label: 'Locked', value: String(adminStore.lockedThreads.length), change: 'Current thread state', icon: 'bi-lock', className: 'purple' },
  { label: 'Resolved', value: String(adminStore.resolvedReports.length), change: 'Recorded decisions', icon: 'bi-check2-circle', className: 'green' },
]);
</script>
