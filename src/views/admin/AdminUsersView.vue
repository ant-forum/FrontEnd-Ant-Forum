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
      empty-title="No user accounts yet"
      empty-description="New forum accounts will appear here after registration."
      :columns="columns"
      :rows="filteredUsers"
      :is-loading="isPageLoading"
      showTabs
      :tabs="userTabs"
      v-model:activeTab="activeTab"
      :getTabCount="getTabCount"
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
      <form
        class="edit-user-form"
        @submit.prevent="handleUpdateUser"
        novalidate
      >
        <div class="field-block">
          <label>Full Name</label>
          <input
            v-model="mEdit.data.fullname"
            class="form-control"
            :class="{ 'is-invalid': errors.fullname }"
            type="text"
            placeholder="Enter full name"
            @input="handleEditInput('fullname')"
          />
          <div v-if="errors.fullname" class="invalid-feedback d-block">
            {{ errors.fullname }}
          </div>
        </div>

        <div class="field-block">
          <label>Username</label>
          <input
            v-model="mEdit.data.username"
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
            type="text"
            placeholder="Enter username"
            @input="handleEditInput('username')"
          />
          <div v-if="errors.username" class="invalid-feedback d-block">
            {{ errors.username }}
          </div>
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
          />
          <div v-if="errors.email" class="invalid-feedback d-block">
            {{ errors.email }}
          </div>
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
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <div v-if="errors.role" class="invalid-feedback d-block">
              {{ errors.role }}
            </div>
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
            <div v-if="errors.gender" class="invalid-feedback d-block">
              {{ errors.gender }}
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button
            class="btn btn-light border"
            type="button"
            @click="closeEditModal"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="usersStore.isLoading || isSaveDisabled"
          >
            <span
              v-if="usersStore.isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Toggle Status Modal (Suspend/Reactivate) -->
    <BaseModal
      v-if="mDelete.isVisible"
      :title="mDelete.item?.status === 'Active' ? 'Suspend User Account' : 'Reactivate User Account'"
      :icon="mDelete.item?.status === 'Active' ? 'bi bi-person-x' : 'bi bi-person-check'"
      :theme="mDelete.item?.status === 'Active' ? 'danger' : 'success'"
      kicker=""
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Are you sure you want to {{ mDelete.item?.status === 'Active' ? 'suspend' : 'reactivate' }} the user
        <strong>{{ mDelete.item?.name }}</strong>?
        <span v-if="mDelete.item?.status === 'Active'">
          Suspending this user will block their account access until reactivated.
        </span>
        <span v-else>
          Reactivating this user will restore their full account access.
        </span>
      </p>
      <div class="modal-actions">
        <button
          class="btn btn-light border"
          type="button"
          @click="closeDeleteModal"
        >
          Cancel
        </button>
        <button
          :class="['btn', mDelete.item?.status === 'Active' ? 'btn-danger' : 'btn-success']"
          type="button"
          :disabled="usersStore.isLoading"
          @click="handleDeleteUser"
        >
          <span
            v-if="usersStore.isLoading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i :class="['bi', mDelete.item?.status === 'Active' ? 'bi-person-x-fill' : 'bi-person-check-fill', 'me-1']"></i>
          <span>{{ mDelete.item?.status === 'Active' ? 'Suspend' : 'Reactivate' }}</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import AdminListPanel from "../../components/admin/AdminListPanel.vue";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useUsersStore } from "../../stores/UsersStore";
import { useToast } from "../../composables/useToast";
import { useRequiredValidator } from "../../composables/useRequiredValidator";

const usersStore = useUsersStore();
const toast = useToast();
const isEditSubmitted = ref(false);
const isPageLoading = ref(true);
const { errors, clearError, validateUsername, validateEmail, validateField } =
  useRequiredValidator();

const handleEditInput = (field) => {
  if (isEditSubmitted.value) {
    if (field === "username") validateUsername(mEdit.data.username);
    if (field === "fullname")
      validateField("fullname", mEdit.data.fullname, "Full name is required.");
    if (field === "email") validateEmail(mEdit.data.email);
    if (field === "role")
      validateField("role", mEdit.data.role, "Role is required.");
    if (field === "gender")
      validateField("gender", mEdit.data.gender, "Gender is required.");
  } else {
    clearError(field);
  }
};

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status", type: "status" },
  { key: "joined", label: "Joined" },
];

const formatJoinedDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mappedUsers = computed(() => {
  return (usersStore.users || []).map((u) => ({
    id: u.id || u._id,
    name: u.fullname || u.username || "No Username",
    detail: (u.fullname && u.username ? '@' + u.username + ' · ' : '') + u.email,
    role:
      u.role === "user" || u.role === "student"
        ? "Student"
        : u.role === "mentor"
          ? "Mentor"
          : u.role
            ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
            : "Student",
    status: u.status
      ? u.status.charAt(0).toUpperCase() + u.status.slice(1).toLowerCase()
      : "Active",
    joined: formatJoinedDate(u.createdAt || u.created_at),
    avatar: u.profile_pic || u.avatar || u.avatarUrl || "",
    gender: u.gender || "male",
    rawRole: u.role || "student",
    rawUsername: u.username || "",
    rawFullname: u.fullname || "",
    rawEmail: u.email || "",
  }));
});

const activeTab = ref("all");

const userTabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const filteredUsers = computed(() => {
  const list = mappedUsers.value;
  if (activeTab.value === "active") {
    return list.filter((u) => u.status === "Active");
  }
  if (activeTab.value === "suspended") {
    return list.filter((u) => u.status === "Suspended");
  }
  return list;
});

const getTabCount = (tabName) => {
  const list = mappedUsers.value;
  if (tabName === "active") {
    return list.filter((u) => u.status === "Active").length;
  }
  if (tabName === "suspended") {
    return list.filter((u) => u.status === "Suspended").length;
  }
  return list.length;
};

const metrics = computed(() => {
  const allUsers = usersStore.users || [];
  const total = allUsers.length;
  const students = allUsers.filter(
    (u) => u.role === "user" || u.role === "student",
  ).length;
  const teachers = allUsers.filter((u) => u.role === "teacher").length;
  const admins = allUsers.filter((u) => u.role === "admin").length;

  return [
    {
      label: "Total Users",
      value: String(total),
      change: "Registered accounts",
      icon: "bi-people",
      className: "blue",
    },
    {
      label: "Students",
      value: String(students),
      change: "Enrolled students",
      icon: "bi-mortarboard",
      className: "green",
    },
    {
      label: "Teachers",
      value: String(teachers),
      change: "Active teachers",
      icon: "bi-person-badge",
      className: "blue",
    },
    {
      label: "Admins",
      value: String(admins),
      change: "Platform administrators",
      icon: "bi-shield-check",
      className: "orange",
    },
  ];
});

onMounted(async () => {
  try {
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error("Failed to load users:", error);
    toast.error("Could not load user accounts from the server.");
  } finally {
    isPageLoading.value = false;
  }
});

// Edit Logic
const mEdit = reactive({
  isVisible: false,
  item: null,
  data: {
    username: "",
    fullname: "",
    email: "",
    role: "student",
    gender: "male",
  },
});

const isSaveDisabled = computed(() => {
  if (!mEdit.item) return true;

  const currentUsername = (mEdit.data.username || "").trim();
  const currentFullname = (mEdit.data.fullname || "").trim();
  const currentEmail = (mEdit.data.email || "").trim();
  const currentRole = mEdit.data.role;
  const currentGender = mEdit.data.gender;

  // Disable if any required fields are empty
  if (!currentUsername || !currentFullname || !currentEmail || !currentRole || !currentGender) {
    return true;
  }

  // Disable if fields are completely unmodified from their original states
  const originalUsername = (mEdit.item.rawUsername || "").trim();
  const originalFullname = (mEdit.item.rawFullname || "").trim();
  const originalEmail = (mEdit.item.rawEmail || "").trim();
  const originalRole = mEdit.item.rawRole || "";
  const originalGender = mEdit.item.gender || "";

  const isUnchanged =
    currentUsername === originalUsername &&
    currentFullname === originalFullname &&
    currentEmail === originalEmail &&
    currentRole === originalRole &&
    currentGender === originalGender;

  return isUnchanged;
});

const openEditModal = (mappedUser) => {
  isEditSubmitted.value = false;
  clearError("username");
  clearError("fullname");
  clearError("email");
  clearError("role");
  clearError("gender");
  mEdit.item = mappedUser;
  mEdit.data = {
    username: mappedUser.rawUsername,
    fullname: mappedUser.rawFullname,
    email: mappedUser.rawEmail,
    role: mappedUser.rawRole || "",
    gender: mappedUser.gender || "",
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
  const isFullnameValid = validateField(
    "fullname",
    mEdit.data.fullname,
    "Full name is required.",
  );
  const isEmailValid = validateEmail(mEdit.data.email);
  const isRoleValid = validateField(
    "role",
    mEdit.data.role,
    "Role is required.",
  );
  const isGenderValid = validateField(
    "gender",
    mEdit.data.gender,
    "Gender is required.",
  );

  if (!isUsernameValid || !isFullnameValid || !isEmailValid || !isRoleValid || !isGenderValid) {
    toast.error("Please fix the validation errors before saving.");
    return;
  }

  try {
    await usersStore.updateUser(mEdit.item.id, {
      username: mEdit.data.username,
      fullname: mEdit.data.fullname,
      email: mEdit.data.email,
      role: mEdit.data.role,
      gender: mEdit.data.gender,
    });
    toast.success("User updated successfully!");
    closeEditModal();
    // Show skeleton while loading the refreshed user list
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error("Failed to update user:", error);
    const errorMsg =
      error.message ||
      error.msg ||
      "An error occurred while updating the user account.";
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
    const isCurrentlyActive = mDelete.item?.status === "Active";
    const response = await usersStore.deleteUser(mDelete.item.id);
    const actionLabel = isCurrentlyActive ? "suspended" : "reactivated";
    toast.success(response?.message || `User account ${actionLabel} successfully!`);
    closeDeleteModal();
    // Show skeleton while loading the refreshed user list
    isPageLoading.value = true;
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error("Failed to update user status:", error);
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      error.msg ||
      "An error occurred while updating the user account status.";
    toast.error(errorMsg);
    closeDeleteModal();
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
