<template>
  <AdminPageShell
    title="Create User"
    kicker="Admin Users"
    subtitle="Add a student or mentor, assign their role, and create their account."
    :breadcrumbs="[
      { label: 'Users', to: '/admin/users' },
      { label: 'Create User' },
    ]"
  >
    <div class="mb-3">
      <router-link class="btn btn-light border back-link" to="/admin/users">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Users</span>
      </router-link>
    </div>

    <section class="create-user-grid">
      <form
        class="admin-panel clean-form"
        @submit.prevent="handleCreateUser"
        novalidate
      >
        <div class="form-heading">
          <span class="panel-icon">
            <i class="bi bi-person-plus"></i>
          </span>
          <div>
            <h2>Account Details</h2>
            <p>Ensure all information matches the API schema requirements.</p>
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Username</label>
            <input
              v-model="form.username"
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
              type="text"
              placeholder="Enter username"
              autocomplete="username"
              @input="handleInput('username')"
            />
            <div v-if="errors.username" class="invalid-feedback d-block">
              {{ errors.username }}
            </div>
          </div>

          <div class="field-block">
            <label>Email Address</label>
            <input
              v-model="form.email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              @input="handleInput('email')"
            />
            <div v-if="errors.email" class="invalid-feedback d-block">
              {{ errors.email }}
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Password</label>
            <div class="password-wrapper">
              <input
                v-model="form.password"
                class="form-control password-input"
                :class="{ 'is-invalid': errors.password }"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password (min 8 chars)"
                autocomplete="new-password"
                @input="handleInput('password')"
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

          <div class="field-block">
            <label>Role</label>
            <select v-model="form.role" class="form-select">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="field-block">
            <label>Gender</label>
            <select v-model="form.gender" class="form-select">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="usersStore.isLoading"
          >
            <span
              v-if="usersStore.isLoading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            <i v-else class="bi bi-check2"></i>
            <span>{{
              usersStore.isLoading ? "Creating..." : "Create User"
            }}</span>
          </button>
        </div>
      </form>

      <aside class="side-stack">
        <div class="admin-panel preview-panel">
          <div class="preview-avatar">{{ initials }}</div>
          <h2>{{ form.username || "New User" }}</h2>
          <p>{{ form.email || "No email added" }}</p>
          <div class="preview-meta">
            <span class="text-capitalize">{{
              form.role === "user" || form.role === "student"
                ? "Student"
                : form.role
            }}</span>
            <span class="text-capitalize">{{ form.gender }}</span>
          </div>
        </div>

        <div class="admin-panel checklist">
          <h2>Before Saving</h2>
          <ul>
            <li><i class="bi bi-check-circle"></i>Use a real email address</li>
            <li>
              <i class="bi bi-check-circle"></i>Provide a password of at least 8
              characters
            </li>
            <li>
              <i class="bi bi-check-circle"></i>Confirm the selected role is
              appropriate
            </li>
            <li>
              <i class="bi bi-check-circle"></i>Select correct gender identity
            </li>
          </ul>
        </div>
      </aside>
    </section>
  </AdminPageShell>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import { useUsersStore } from "../../stores/UsersStore";
import { useToast } from "../../composables/useToast";
import { useRequiredValidator } from "../../composables/useRequiredValidator";

const showPassword = ref(false);
const isSubmitted = ref(false);
const usersStore = useUsersStore();
const router = useRouter();
const toast = useToast();
const {
  errors,
  clearError,
  validateUsername,
  validateEmail,
  validatePassword,
} = useRequiredValidator();

const handleInput = (field) => {
  if (isSubmitted.value) {
    if (field === "username") validateUsername(form.username);
    if (field === "email") validateEmail(form.email);
    if (field === "password") validatePassword(form.password);
  } else {
    clearError(field);
  }
};

const form = reactive({
  username: "",
  email: "",
  password: "",
  role: "student",
  gender: "male",
});

const initials = computed(() => {
  const username = form.username.trim();
  if (!username) return "NU";

  return username
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
});

const handleCreateUser = async () => {
  isSubmitted.value = true;

  const isUsernameValid = validateUsername(form.username);
  const isEmailValid = validateEmail(form.email);
  const isPasswordValid = validatePassword(form.password);

  if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
    toast.error("Please fix the form errors before submitting.");
    return;
  }

  try {
    const res = await usersStore.createUser({
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      gender: form.gender,
    });

    toast.success("User created successfully!");

    // Redirect to User Management page
    router.push("/admin/users");
  } catch (error) {
    console.error("Failed to create user:", error);
    const errorMsg =
      error.message || error.msg || "An error occurred while creating user.";
    toast.error(errorMsg);
  }
};
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
  align-items: start;
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
  transition: color var(--transition-fast, 0.2s);
}

.eye-toggle:hover {
  color: var(--color-primary);
}

/* Remove Bootstrap's default validation background icons */
.form-control.is-invalid,
.form-select.is-invalid {
  background-image: none !important;
  border-color: var(--color-danger) !important;
  padding-right: 0.75rem !important;
}

.password-input.is-invalid {
  padding-right: 40px !important;
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
