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
      item-label="users"
      :columns="columns"
      :rows="mappedUsers"
      :is-loading="isPageLoading"
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
      <form class="edit-user-form" @submit.prevent="handleUpdateUser" novalidate>
        <div class="field-block">
          <label>Username</label>
          <input 
            v-model="mEdit.data.username" 
            class="form-control" 
            :class="{ 'is-invalid': errors.username }" 
            type="text" 
            placeholder="Enter username"
            @input="handleEditInput('username')"
          >
          <div v-if="errors.username" class="invalid-feedback d-block">{{ errors.username }}</div>
        </div>

        <div class="field-block">
          <label>Email Address</label>
          <input 
            v-model="mEdit.data.email" 
            class="form-control" 
            :class="{ 'is-invalid': errors.email }" 
            type="email" 
            placeholder="name@example.com"
            @input="handleEditInput('email')"
          >
          <div v-if="errors.email" class="invalid-feedback d-block">{{ errors.email }}</div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Role</label>
            <select 
              v-model="mEdit.data.role" 
              class="form-select"
              :class="{ 'is-invalid': errors.role }"
              @change="handleEditInput('role')"
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
            <div v-if="errors.role" class="invalid-feedback d-block">{{ errors.role }}</div>
          </div>

          <div class="field-block">
            <label>Gender</label>
            <select 
              v-model="mEdit.data.gender" 
              class="form-select"
              :class="{ 'is-invalid': errors.gender }"
              @change="handleEditInput('gender')"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div v-if="errors.gender" class="invalid-feedback d-block">{{ errors.gender }}</div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="usersStore.isLoading || isSaveDisabled">
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
import { computed, onMounted, reactive, ref } from 'vue';
import AdminListPanel from '../../components/admin/AdminListPanel.vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useUsersStore } from '../../stores/UsersStore';
import { useToast } from '../../composables/useToast';
import { useRequiredValidator } from '../../composables/useRequiredValidator';

const usersStore = useUsersStore();
const toast = useToast();
const isEditSubmitted = ref(false);
const isPageLoading = ref(true);
const {
  errors,
  clearError,
  validateUsername,
  validateEmail,
  validateField
} = useRequiredValidator();

const handleEditInput = (field) => {
  if (isEditSubmitted.value) {
    if (field === 'username') validateUsername(mEdit.data.username);
    if (field === 'email') validateEmail(mEdit.data.email);
    if (field === 'role') validateField('role', mEdit.data.role, 'Role is required.');
    if (field === 'gender') validateField('gender', mEdit.data.gender, 'Gender is required.');
  } else {
    clearError(field);
  }
};

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
    role: (u.role === 'user' || u.role === 'student') ? 'Student' : (u.role === 'mentor' ? 'Mentor' : (u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Student')),
    status: u.status || 'Active',
    joined: u.createdAt
      ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'May 31, 2026',
    avatar: u.profile_pic || u.avatar || u.avatarUrl || '',
    gender: u.gender || 'male',
    rawRole: u.role || 'student',
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
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error('Failed to load users:', error);
    toast.error('Could not load user accounts from the server.');
  } finally {
    isPageLoading.value = false;
  }
});

// Edit Logic
const mEdit = reactive({
  isVisible: false,
  item: null,
  data: {
    username: '',
    email: '',
    role: 'student',
    gender: 'male',
  },
});

const isSaveDisabled = computed(() => {
  if (!mEdit.item) return true;

  const currentUsername = (mEdit.data.username || '').trim();
  const currentEmail = (mEdit.data.email || '').trim();
  const currentRole = mEdit.data.role;
  const currentGender = mEdit.data.gender;

  // Disable if any required fields are empty
  if (!currentUsername || !currentEmail || !currentRole || !currentGender) {
    return true;
  }

  // Disable if fields are completely unmodified from their original states
  const originalUsername = (mEdit.item.name || '').trim();
  const originalEmail = (mEdit.item.detail || '').trim();
  const originalRole = mEdit.item.rawRole || '';
  const originalGender = mEdit.item.gender || '';

  const isUnchanged =
    currentUsername === originalUsername &&
    currentEmail === originalEmail &&
    currentRole === originalRole &&
    currentGender === originalGender;

  return isUnchanged;
});

const openEditModal = (mappedUser) => {
  isEditSubmitted.value = false;
  clearError('username');
  clearError('email');
  clearError('role');
  clearError('gender');
  mEdit.item = mappedUser;
  mEdit.data = {
    username: mappedUser.name,
    email: mappedUser.detail,
    role: mappedUser.rawRole || '',
    gender: mappedUser.gender || '',
  };
  mEdit.isVisible = true;
};

const closeEditModal = () => {
  mEdit.isVisible = false;
  mEdit.item = null;
};

const handleUpdateUser = async () => {
  isEditSubmitted.value = true;

  const isUsernameValid = validateUsername(mEdit.data.username);
  const isEmailValid = validateEmail(mEdit.data.email);
  const isRoleValid = validateField('role', mEdit.data.role, 'Role is required.');
  const isGenderValid = validateField('gender', mEdit.data.gender, 'Gender is required.');

  if (!isUsernameValid || !isEmailValid || !isRoleValid || !isGenderValid) {
    toast.error('Please fix the validation errors before saving.');
    return;
  }

  try {
    await usersStore.updateUser(mEdit.item.id, {
      username: mEdit.data.username,
      email: mEdit.data.email,
      role: mEdit.data.role,
      gender: mEdit.data.gender,
    });
    toast.success('User updated successfully!');
    closeEditModal();
    // Show skeleton while loading the refreshed user list
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error('Failed to update user:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while updating the user account.';
    toast.error(errorMsg);
  } finally {
    isPageLoading.value = false;
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
    // Show skeleton while loading the refreshed user list
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error('Failed to delete user:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while deleting the user account.';
    toast.error(errorMsg);
  } finally {
    isPageLoading.value = false;
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
  align-items: start;
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

/* Remove Bootstrap's default validation background icons */
.form-control.is-invalid,
.form-select.is-invalid {
  background-image: none !important;
  border-color: var(--color-danger) !important;
  padding-right: 0.75rem !important;
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  border-color: var(--color-danger) !important;
}

/* Reduce spacing between input and validation error message */
.invalid-feedback {
  margin-top: -0.3rem !important;
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 700;
}
</style>
