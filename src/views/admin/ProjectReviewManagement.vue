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
import { computed } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminProjectList from '../../components/admin/AdminProjectList.vue';
import { useAdminOperationsStore } from '../../stores/AdminOperationsStore';

const adminStore = useAdminOperationsStore();
const metrics = computed(() => [
  { label: 'Student Projects', value: String(adminStore.projects.length), change: 'Frontend review dataset', icon: 'bi-folder2', className: 'blue' },
  { label: 'In Review', value: String(adminStore.pendingProjects.length), change: 'Needs action', icon: 'bi-hourglass-split', className: 'orange' },
  { label: 'Published', value: String(adminStore.publishedProjects.length), change: 'Approved work', icon: 'bi-cloud-check', className: 'green' },
  { label: 'Total Likes', value: String(adminStore.totalProjectLikes), change: 'Across projects', icon: 'bi-heart', className: 'purple' },
]);
</script>
