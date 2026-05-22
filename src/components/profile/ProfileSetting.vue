<script setup>
import { reactive, ref, computed, watch, onMounted, defineProps, defineEmits } from "vue";
import api from "../../api/api";

const props = defineProps({
  user: { type: Object, required: true }
});

const emit = defineEmits(["saved"]);

// Form state
const form = reactive({
  name: "",
  bio: "",
  github: "",
  linkedin: "",
});

const successMessage = ref("");
const errorMessage = ref("");
const isSaving = ref(false);

// Avatar
const avatarFile = ref(null);
const avatarPreview = ref("");
const savedAvatarPreview = ref("");

// Skills
const skillInput = ref("");
const skills = ref([]);

// Errors
const errors = reactive({
  name: "",
  bio: "",
  github: "",
  linkedin: "",
});

const resetForm = () => {
  const u = props.user || {};
  form.name = u.name || "";
  form.bio = u.bio || "";
  form.github = u.github || "";
  form.linkedin = u.linkedin || "";
  skills.value = Array.isArray(u.skills) ? [...u.skills] : [];
  avatarFile.value = null;
  avatarPreview.value = u.avatar || u.avatarUrl || "";
  savedAvatarPreview.value = avatarPreview.value;
};

onMounted(resetForm);

// Watch for prop updates (e.g. if parent finishes loading user asynchronously)
watch(() => props.user, resetForm, { deep: true });

// URL validation
const isValidURL = (url) => {
  return /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.+)?$/.test(url);
};

// Handle avatar upload
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Only image files allowed");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Max size is 2MB");
    return;
  }

  if (avatarPreview.value && avatarPreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

// Skills
const addSkill = () => {
  const value = skillInput.value.trim();
  if (value && !skills.value.includes(value)) {
    skills.value.push(value);
  }
  skillInput.value = "";
};

const removeSkill = (index) => {
  skills.value.splice(index, 1);
};

// Validation
watch(
  form,
  () => {
    errors.name = form.name ? "" : "Name is required";
    errors.bio =
      (form.bio || "").length > 200 ? "Bio must be under 200 characters" : "";
    errors.github =
      form.github && !isValidURL(form.github) ? "Invalid GitHub URL" : "";
    errors.linkedin =
      form.linkedin && !isValidURL(form.linkedin) ? "Invalid LinkedIn URL" : "";
  },
  { deep: true },
);

const isValid = computed(() => {
  return !errors.name && !errors.bio && !errors.github && !errors.linkedin;
});

// Submit
const handleSubmit = async () => {
  if (!isValid.value || isSaving.value) return;

  const payload = new FormData();
  payload.append("name", form.name);
  payload.append("bio", form.bio);
  payload.append("github", form.github);
  payload.append("linkedin", form.linkedin);

  skills.value.forEach((skill, i) => {
    payload.append(`skills[${i}]`, skill);
  });

  if (avatarFile.value) {
    payload.append("avatar", avatarFile.value);
  }

  isSaving.value = true;
  errorMessage.value = "";

  try {
    const response = await api.put("/api/users/me", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const updatedUser = response.data?.user ?? response.data ?? {};
    successMessage.value = "Profile saved successfully.";
    emit("saved", {
      ...updatedUser,
      // fallback in case backend only responds with partial updates
      name: updatedUser.name ?? form.name,
      bio: updatedUser.bio ?? form.bio,
      github: updatedUser.github ?? form.github,
      linkedin: updatedUser.linkedin ?? form.linkedin,
      skills: updatedUser.skills ?? [...skills.value],
      avatar: updatedUser.avatar ?? updatedUser.avatarUrl ?? avatarPreview.value,
    });
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Profile update failed:", error);
    errorMessage.value = "Unable to save profile. Please try again.";
    setTimeout(() => {
      errorMessage.value = "";
    }, 5000);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="dashboard-card-modern p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0 fw-bold">Edit Profile</h4>
      <div class="d-flex gap-2">
        <button
          class="btn btn-secondary px-4"
          @click="resetForm"
          :disabled="isSaving"
        >
          Reset
        </button>
        <button
          class="btn btn-primary px-4 d-flex align-items-center gap-2"
          :disabled="!isValid || isSaving"
          @click="handleSubmit"
        >
          <span
            v-if="isSaving"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          {{ isSaving ? "Saving..." : "Save Changes" }}
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success mt-2" role="alert">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert alert-danger mt-2" role="alert">
      {{ errorMessage }}
    </div>

    <div class="row g-4 mt-2">
      <!-- Avatar Upload -->
      <div class="col-md-4 text-center border-end border-slate-subtle">
        <div class="mb-3 d-inline-block position-relative">
          <img
            :src="avatarPreview || 'https://via.placeholder.com/130'"
            class="rounded-circle border border-4 border-white shadow"
            width="130"
            height="130"
            style="object-fit: cover;"
          />
        </div>
        <div class="px-3">
          <label class="form-label text-muted small fw-bold">Upload New Avatar</label>
          <input
            type="file"
            class="form-control form-control-sm"
            accept="image/*"
            @change="handleAvatarChange"
          />
          <small class="text-muted d-block mt-1">PNG, JPG up to 2MB</small>
        </div>
      </div>

      <!-- Main Details Form -->
      <div class="col-md-8">
        <!-- Name -->
        <div class="mb-3">
          <label class="form-label">Full Name *</label>
          <input
            v-model="form.name"
            class="form-control"
            placeholder="Enter your name"
            :class="{ 'is-invalid': errors.name }"
          />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <!-- Bio -->
        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <label class="form-label">Biography</label>
            <span class="text-muted small">{{ form.bio ? form.bio.length : 0 }}/200</span>
          </div>
          <textarea
            v-model="form.bio"
            class="form-control"
            rows="4"
            placeholder="Tell us about yourself..."
            :class="{ 'is-invalid': errors.bio }"
          ></textarea>
          <div class="invalid-feedback">{{ errors.bio }}</div>
        </div>

        <!-- Skills -->
        <div class="mb-4">
          <label class="form-label">Languages & Skills</label>
          <div class="d-flex mb-2">
            <input
              v-model="skillInput"
              @keyup.enter="addSkill"
              class="form-control me-2"
              placeholder="Add a technology (e.g. React, Go, Docker)"
            />
            <button class="btn btn-outline-primary px-3" @click="addSkill">
              Add
            </button>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <span
              v-for="(skill, index) in skills"
              :key="index"
              class="badge bg-primary-purple-subtle text-primary-purple d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
            >
              {{ skill }}
              <span class="cursor-pointer font-bold" @click="removeSkill(index)">✕</span>
            </span>
          </div>
        </div>

        <!-- Social Links Row -->
        <div class="row g-3">
          <!-- GitHub -->
          <div class="col-sm-6">
            <label class="form-label">GitHub URL</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-github"></i></span>
              <input
                v-model="form.github"
                class="form-control"
                placeholder="https://github.com/..."
                :class="{ 'is-invalid': errors.github }"
              />
              <div class="invalid-feedback">{{ errors.github }}</div>
            </div>
          </div>
          <!-- LinkedIn -->
          <div class="col-sm-6">
            <label class="form-label">LinkedIn URL</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-linkedin"></i></span>
              <input
                v-model="form.linkedin"
                class="form-control"
                placeholder="https://linkedin.com/in/..."
                :class="{ 'is-invalid': errors.linkedin }"
              />
              <div class="invalid-feedback">{{ errors.linkedin }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card-modern {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.border-slate-subtle {
  border-color: #f1f5f9 !important;
}

.bg-primary-purple-subtle {
  background-color: #f5f3ff;
}

.text-primary-purple {
  color: #7c3aed;
}

@media (max-width: 768px) {
  .border-end {
    border-end: none !important;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
  }
}
</style>
