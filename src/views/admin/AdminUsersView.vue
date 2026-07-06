<template>
  <AdminPageShell
    title="User Management"
    kicker="Admin Users"
    subtitle="Review accounts, roles, status, and recent user activity."
    :metrics="metrics"
  >
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
      @delete="openStatusModal"
    >
      <template #panel-actions>
        <button
          class="btn btn-primary action-btn"
          type="button"
          @click="openCreateModal"
        >
          <i class="bi bi-person-plus"></i>
          <span>New User</span>
        </button>
      </template>
    </AdminListPanel>

    <!-- Edit Modal -->
    <!-- Create/Edit Modal -->
    <BaseModal
      v-if="mEdit.isVisible"
      :title="isCreateMode ? 'Create User' : 'Edit User'"
      :icon="isCreateMode ? 'bi bi-person-plus' : 'bi bi-pencil'"
      kicker=""
      @closeModal="closeEditModal"
    >
      <form
        class="edit-user-form"
        @submit.prevent="handleSubmitForm"
        novalidate
      >
        <div class="field-block">
          <label>Full Name <span class="text-danger">*</span></label>
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
          <label>Username <span class="text-danger">*</span></label>
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
          <label>Email Address <span class="text-danger">*</span></label>
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

        <!-- Password Field - only visible in Create Mode -->
        <div v-if="isCreateMode" class="field-block">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="mb-0">Password <span class="text-danger">*</span></label>
            <button
              type="button"
              class="btn btn-link btn-sm p-0 text-decoration-none text-primary"
              @click="generatePassword"
              style="font-size: 0.8rem; font-weight: 600;"
            >
              <i class="bi bi-shield-lock-fill me-1"></i>Generate Password
            </button>
          </div>
          <div class="password-wrapper">
            <input
              v-model="mEdit.data.password"
              class="form-control password-input"
              :class="{ 'is-invalid': errors.password }"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password (min 8 chars)"
              autocomplete="new-password"
              @input="handleEditInput('password')"
            />
            <button
              type="button"
              class="eye-toggle"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <i
                class="bi"
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
              ></i>
            </button>
          </div>
          <div v-if="errors.password" class="invalid-feedback d-block">
            {{ errors.password }}
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Role <span class="text-danger">*</span></label>
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
            <label>Gender <span class="text-danger">*</span></label>
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
            <span>{{ isCreateMode ? 'Create User' : 'Save Changes' }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Toggle Status Modal (Suspend/Reactivate) -->
    <BaseModal
      v-if="statusModal.isVisible"
      :title="
        statusModal.item?.status === 'Active'
          ? 'Suspend User Account'
          : 'Reactivate User Account'
      "
      :icon="
        statusModal.item?.status === 'Active'
          ? 'bi bi-person-x'
          : 'bi bi-person-check'
      "
      :theme="statusModal.item?.status === 'Active' ? 'danger' : 'success'"
      kicker=""
      @closeModal="closeStatusModal"
    >
      <p class="delete-message">
        Are you sure you want to
        {{ statusModal.item?.status === "Active" ? "suspend" : "reactivate" }}
        the user <strong>{{ statusModal.item?.name }}</strong
        >?
        <span v-if="statusModal.item?.status === 'Active'">
          Suspending this user will block their account access until
          reactivated.
        </span>
        <span v-else>
          Reactivating this user will restore their full account access.
        </span>
      </p>
      <div class="modal-actions">
        <button
          class="btn btn-light border"
          type="button"
          @click="closeStatusModal"
        >
          Cancel
        </button>
        <button
          :class="[
            'btn',
            statusModal.item?.status === 'Active'
              ? 'btn-danger'
              : 'btn-success',
          ]"
          type="button"
          :disabled="usersStore.isLoading"
          @click="handleStatusChange"
        >
          <span
            v-if="usersStore.isLoading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i
            :class="[
              'bi',
              statusModal.item?.status === 'Active'
                ? 'bi-person-x-fill'
                : 'bi-person-check-fill',
              'me-1',
            ]"
          ></i>
          <span>{{
            statusModal.item?.status === "Active" ? "Suspend" : "Reactivate"
          }}</span>
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
import { resolveMediaUrl } from "../../utils/mediaUrl";

const usersStore = useUsersStore();
const toast = useToast();
const isCreateMode = ref(false);
const showPassword = ref(false);
const { errors, clearError, validateUsername, validateEmail, validatePassword, validateField } =
  useRequiredValidator();

const isEditSubmitted = ref(false);
const isPageLoading = ref(true);

const handleEditInput = (field) => {
  if (isEditSubmitted.value) {
    if (field === "username") validateUsername(mEdit.data.username);
    if (field === "fullname")
      validateField("fullname", mEdit.data.fullname, "Full name is required.");
    if (field === "email") validateEmail(mEdit.data.email);
    if (field === "password" && isCreateMode.value) validatePassword(mEdit.data.password);
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
  return (usersStore.users || []).map((u) => {
    const rawStatus = String(u.status || "active").toLowerCase();
    const status =
      rawStatus === "inactive" || rawStatus === "suspended"
        ? "Suspended"
        : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

    return {
      id: u.id || u._id,
      name: u.fullname || u.username || "No Username",
      detail:
        (u.fullname && u.username ? "@" + u.username + " · " : "") + u.email,
      role:
        u.role === "user" || u.role === "student"
          ? "Student"
          : u.role === "mentor"
            ? "Mentor"
            : u.role
              ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
              : "Student",
      status,
      joined: formatJoinedDate(u.createdAt || u.created_at),
      avatar: resolveMediaUrl(u.profile_pic || u.avatar || u.avatarUrl || ""),
      gender: u.gender || "male",
      rawRole: u.role || "student",
      rawUsername: u.username || "",
      rawFullname: u.fullname || "",
      rawEmail: u.email || "",
    };
  });
});

const activeTab = ref("all");

const userTabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
];

const filteredUsers = computed(() => {
  const list = mappedUsers.value;
  if (activeTab.value === "active") {
    return list.filter((u) => u.status === "Active");
  }
  if (activeTab.value === "suspended") {
    return list.filter((u) => u.status === "Suspended");
  }
  if (activeTab.value === "pending") {
    return list.filter((u) => u.status === "Pending");
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
  if (tabName === "pending") {
    return list.filter((u) => u.status === "Pending").length;
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
      change: "Teacher accounts",
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
    password: "",
    role: "student",
    gender: "male",
  },
});

const isSaveDisabled = computed(() => {
  if (isCreateMode.value) {
    const currentUsername = (mEdit.data.username || "").trim();
    const currentFullname = (mEdit.data.fullname || "").trim();
    const currentEmail = (mEdit.data.email || "").trim();
    const currentPassword = mEdit.data.password || "";
    const currentRole = mEdit.data.role;
    const currentGender = mEdit.data.gender;

    return (
      !currentUsername ||
      !currentFullname ||
      !currentEmail ||
      !currentPassword ||
      currentPassword.length < 8 ||
      !currentRole ||
      !currentGender
    );
  }

  if (!mEdit.item) return true;

  const currentUsername = (mEdit.data.username || "").trim();
  const currentFullname = (mEdit.data.fullname || "").trim();
  const currentEmail = (mEdit.data.email || "").trim();
  const currentRole = mEdit.data.role;
  const currentGender = mEdit.data.gender;

  // Disable if any required fields are empty
  if (
    !currentUsername ||
    !currentFullname ||
    !currentEmail ||
    !currentRole ||
    !currentGender
  ) {
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

const generatePassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specials = "@$!%*?&_";
  
  let password = "";
  // Ensure at least one character from each required set
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];
  
  const allChars = uppercase + lowercase + numbers + specials;
  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle to randomize positions
  const shuffled = password.split('').sort(() => 0.5 - Math.random()).join('');
  
  mEdit.data.password = shuffled;
  
  // Clear any existing password errors
  clearError("password");
  
  // Show the password to make it copyable
  showPassword.value = true;
};

const openCreateModal = () => {
  isCreateMode.value = true;
  isEditSubmitted.value = false;
  showPassword.value = false;
  clearError("username");
  clearError("fullname");
  clearError("email");
  clearError("password");
  clearError("role");
  clearError("gender");
  mEdit.item = null;
  mEdit.data = {
    username: "",
    fullname: "",
    email: "",
    password: "",
    role: "student",
    gender: "male",
  };
  mEdit.isVisible = true;
};

const openEditModal = (mappedUser) => {
  isCreateMode.value = false;
  isEditSubmitted.value = false;
  showPassword.value = false;
  clearError("username");
  clearError("fullname");
  clearError("email");
  clearError("password");
  clearError("role");
  clearError("gender");
  mEdit.item = mappedUser;
  mEdit.data = {
    username: mappedUser.rawUsername,
    fullname: mappedUser.rawFullname,
    email: mappedUser.rawEmail,
    password: "",
    role: mappedUser.rawRole || "",
    gender: mappedUser.gender || "",
  };
  mEdit.isVisible = true;
};

const closeEditModal = () => {
  mEdit.isVisible = false;
  mEdit.item = null;
};

const handleSubmitForm = async () => {
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
  const isPasswordValid = isCreateMode.value
    ? validatePassword(mEdit.data.password)
    : true;

  if (
    !isUsernameValid ||
    !isFullnameValid ||
    !isEmailValid ||
    !isRoleValid ||
    !isGenderValid ||
    !isPasswordValid
  ) {
    toast.error("Please fix the validation errors before saving.");
    return;
  }

  try {
    isPageLoading.value = true;
    if (isCreateMode.value) {
      await usersStore.createUser({
        username: mEdit.data.username,
        fullname: mEdit.data.fullname,
        email: mEdit.data.email,
        password: mEdit.data.password,
        role: mEdit.data.role,
        gender: mEdit.data.gender,
      });
      toast.success("User created successfully!");
    } else {
      await usersStore.updateUser(mEdit.item.id, {
        username: mEdit.data.username,
        fullname: mEdit.data.fullname,
        email: mEdit.data.email,
        role: mEdit.data.role,
        gender: mEdit.data.gender,
      });
      toast.success("User updated successfully!");
    }
    closeEditModal();
    // Refresh user list
    await usersStore.fetchUsers(true);
  } catch (error) {
    console.error("Failed to save user:", error);
    const serverMessage = error.response?.data?.message || error.response?.data?.msg || (typeof error.response?.data === 'string' ? error.response.data : '');
    const errorMsg =
      serverMessage ||
      error.message ||
      error.msg ||
      "An error occurred while saving the user account.";
    toast.error(errorMsg);
  } finally {
    isPageLoading.value = false;
  }
};

const statusModal = reactive({
  isVisible: false,
  item: null,
});

const openStatusModal = (mappedUser) => {
  statusModal.item = mappedUser;
  statusModal.isVisible = true;
};

const closeStatusModal = () => {
  statusModal.isVisible = false;
  statusModal.item = null;
};

const handleStatusChange = async () => {
  try {
    const isCurrentlyActive = statusModal.item?.status === "Active";
    const nextStatus = isCurrentlyActive ? "suspended" : "active";
    const response = await usersStore.setUserStatus(
      statusModal.item.id,
      nextStatus,
    );
    const actionLabel = isCurrentlyActive ? "suspended" : "reactivated";
    toast.success(
      response?.message || `User account ${actionLabel} successfully!`,
    );
    closeStatusModal();
  } catch (error) {
    console.error("Failed to update user status:", error);
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      error.msg ||
      "An error occurred while updating the user account status.";
    toast.error(errorMsg);
    closeStatusModal();
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
.password-wrapper {
  position: relative;
  width: 100%;
}

.password-input {
  padding-right: 40px !important;
}

.eye-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  transition: color 0.2s;
}

.eye-toggle:hover {
  color: var(--color-primary);
}

.password-input.is-invalid {
  padding-right: 40px !important;
}
</style>
