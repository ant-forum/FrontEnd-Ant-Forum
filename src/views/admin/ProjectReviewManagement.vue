<template>
  <AdminPageShell
    title="Project Management"
    kicker="Student Projects"
    subtitle="View student project submissions, likes, comments, and review status. Admins can review projects, not create them."
    :metrics="metrics"
  >
    <AdminProjectList />
  </AdminPageShell>
</template>

<script setup>
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminProjectList from '../../components/admin/AdminProjectList.vue';

const metrics = [
  { label: 'Student Projects', value: '76', change: '+9 this month', icon: 'bi-folder2', className: 'blue' },
  { label: 'In Review', value: '12', change: 'Needs action', icon: 'bi-hourglass-split', className: 'orange' },
  { label: 'Published', value: '48', change: '+6 this week', icon: 'bi-cloud-check', className: 'green' },
  { label: 'Total Likes', value: '2.4k', change: 'Across projects', icon: 'bi-heart', className: 'purple' },
];
</script>
