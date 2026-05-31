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
      :rows="mappedUsers"
      :is-loading="usersStore.isLoading"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Edit Modal -->
    <BaseModal
      v-if="mEdit.isVisible"
      title="Edit User"
      icon="bi bi-pencil"
      kicker=""
      @closeModal="closeEditModal"
    >
      <form class="edit-user-form" @submit.prevent="handleUpdateUser">
        <div class="field-block">
          <label>Username</label>
          <input v-model="mEdit.data.username" class="form-control" type="text" placeholder="Enter username" required>
        </div>

        <div class="field-block">
          <label>Email Address</label>
          <input v-model="mEdit.data.email" class="form-control" type="email" placeholder="name@example.com" required>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Role</label>
            <select v-model="mEdit.data.role" class="form-select" required>
              <option value="user">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div class="field-block">
            <label>Gender</label>
            <select v-model="mEdit.data.gender" class="form-select" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="usersStore.isLoading">
            <span v-if="usersStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete User Account"
      icon="bi bi-trash"
      theme="danger"
      kicker=""
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Are you sure you want to delete the user <strong>{{ mDelete.item?.name }}</strong>?
        This action will permanently delete their account and all associated profile details from the system.
      </p>
      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" type="button" :disabled="usersStore.isLoading" @click="handleDeleteUser">
          <span v-if="usersStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i class="bi bi-trash me-1"></i>
          <span>Confirm Delete</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue';
import AdminListPanel from '../../components/admin/AdminListPanel.vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useUsersStore } from '../../stores/UsersStore';
import { useToast } from '../../composables/useToast';

const usersStore = useUsersStore();
const toast = useToast();

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'joined', label: 'Joined' },
];

const mappedUsers = computed(() => {
  return (usersStore.users || []).map((u) => ({
    id: u.id || u._id,
    name: u.username || 'No Username',
    detail: u.email || 'No email',
    role: u.role === 'user' ? 'Student' : (u.role === 'mentor' ? 'Mentor' : (u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student')),
    status: u.status || 'Active',
    joined: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'May 31, 2026',
    gender: u.gender || 'male',
    rawRole: u.role || 'user',
  }));
});

const metrics = computed(() => {
  const allUsers = usersStore.users || [];
  const total = allUsers.length;
  const mentors = allUsers.filter((u) => u.role === 'mentor').length;
  const students = allUsers.filter((u) => u.role === 'user' || u.role === 'student').length;
  const others = total - mentors - students;

  return [
    { label: 'Total Users', value: String(total), change: 'Registered accounts', icon: 'bi-people', className: 'blue' },
    { label: 'Students', value: String(students), change: 'Enrolled students', icon: 'bi-mortarboard', className: 'green' },
    { label: 'Mentors', value: String(mentors), change: 'Active mentors', icon: 'bi-person-badge', className: 'purple' },
    { label: 'Others', value: String(others), change: 'Other roles', icon: 'bi-shield-check', className: 'orange' },
  ];
});

onMounted(async () => {
  try {
    await usersStore.fetchUsers();
  } catch (error) {
    console.error('Failed to load users:', error);
    toast.error('Could not load user accounts from the server.');
  }
});

// Edit Logic
const mEdit = reactive({
  isVisible: false,
  item: null,
  data: {
    username: '',
    email: '',
    role: 'user',
    gender: 'male',
  },
});

const openEditModal = (mappedUser) => {
  mEdit.item = mappedUser;
  mEdit.data = {
    username: mappedUser.name,
    email: mappedUser.detail,
    role: mappedUser.rawRole,
    gender: mappedUser.gender,
  };
  mEdit.isVisible = true;
};

const closeEditModal = () => {
  mEdit.isVisible = false;
  mEdit.item = null;
};

const handleUpdateUser = async () => {
  try {
    await usersStore.updateUser(mEdit.item.id, {
      username: mEdit.data.username,
      email: mEdit.data.email,
      role: mEdit.data.role,
      gender: mEdit.data.gender,
    });
    toast.success('User updated successfully!');
    closeEditModal();
    // Refresh the table
    await usersStore.fetchUsers();
  } catch (error) {
    console.error('Failed to update user:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while updating the user account.';
    toast.error(errorMsg);
  }
};

// Delete Logic
const mDelete = reactive({
  isVisible: false,
  item: null,
});

const openDeleteModal = (mappedUser) => {
  mDelete.item = mappedUser;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const handleDeleteUser = async () => {
  try {
    await usersStore.deleteUser(mDelete.item.id);
    toast.success('User account deleted successfully!');
    closeDeleteModal();
    // Refresh the table
    await usersStore.fetchUsers();
  } catch (error) {
    console.error('Failed to delete user:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while deleting the user account.';
    toast.error(errorMsg);
  }
};
</script>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-user-form {
  display: grid;
  gap: 0.85rem;
}

.field-block {
  display: grid;
  gap: 0.4rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1rem;
}

.delete-message {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.delete-message strong {
  color: var(--color-text);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
