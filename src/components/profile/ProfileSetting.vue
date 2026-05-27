<script setup>
import { reactive, ref, computed, watch, onMounted, defineProps, defineEmits } from "vue";
import api from "../../api/api";

const props = defineProps({
  user: { type: Object, required: true }
});

const emit = defineEmits(["saved"]);

const form = reactive({
  name: "",
  bio: "",
  github: "",
  linkedin: "",
});

const successMessage = ref("");
const errorMessage = ref("");
const isSaving = ref(false);

const avatarFile = ref(null);
const avatarPreview = ref("");
const savedAvatarPreview = ref("");

const skillInput = ref("");
const skills = ref([]);

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

watch(() => props.user, resetForm, { deep: true });

const isValidURL = (url) => {
  return /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.+)?$/.test(url);
};

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
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
      <div>
        <h4 class="mb-0 fw-bold header-title themed-text">Edit Profile</h4>
        <p class="text-muted small mb-0">Update your profile info, avatar, skills, and links.</p>
      </div>
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
      <div class="col-md-4 text-center border-end border-slate-subtle">
        <div class="mb-3 d-inline-block position-relative avatar-preview-container">
          <img
            :src="avatarPreview || 'https://via.placeholder.com/130'"
            class="rounded-circle"
            width="120"
            height="120"
            style="object-fit: cover;"
          />
          <div class="avatar-overlay d-flex align-items-center justify-content-center rounded-circle">
            <i class="bi bi-camera-fill text-white fs-4"></i>
          </div>
        </div>
        <div class="px-2 mt-2">
          <label class="form-label text-muted small fw-bold d-block mb-2">Profile Picture</label>
          <div class="custom-file-upload">
            <label class="btn btn-sm btn-outline-primary px-3 rounded-pill cursor-pointer">
              Choose Image
              <input
                type="file"
                class="d-none"
                accept="image/*"
                @change="handleAvatarChange"
              />
            </label>
          </div>
          <small class="text-muted d-block mt-2" style="font-size: 0.75rem;">PNG, JPG up to 2MB</small>
        </div>
      </div>

      <div class="col-md-8">
        <div class="mb-3">
          <label class="form-label fw-bold small themed-text">Full Name *</label>
          <input
            v-model="form.name"
            class="form-control"
            placeholder="Enter your name"
            :class="{ 'is-invalid': errors.name }"
          />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between">
            <label class="form-label fw-bold small themed-text">Biography</label>
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

        <div class="mb-4">
          <label class="form-label fw-bold small themed-text">Languages & Skills</label>
          <div class="d-flex mb-2">
            <input
              v-model="skillInput"
              @keyup.enter="addSkill"
              class="form-control me-2"
              placeholder="Add a technology (e.g. React, Go, Docker)"
            />
            <button class="btn btn-outline-primary px-3 fw-bold" @click="addSkill">
              Add
            </button>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <span
              v-for="(skill, index) in skills"
              :key="index"
              class="skill-badge-premium"
            >
              {{ skill }}
              <span class="remove-skill-trigger" @click="removeSkill(index)">✕</span>
            </span>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-sm-6">
            <label class="form-label fw-bold small themed-text">GitHub URL</label>
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
          <div class="col-sm-6">
            <label class="form-label fw-bold small themed-text">LinkedIn URL</label>
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
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-slow), border-color var(--transition-slow);
}

.header-title {
  color: var(--color-text) !important;
  letter-spacing: -0.5px;
}

.themed-text {
  color: var(--color-text) !important;
}

.border-slate-subtle {
  border-color: var(--color-border) !important;
}

.avatar-preview-container {
  cursor: pointer;
  overflow: hidden;
}

.avatar-preview-container img {
  border: 3px solid var(--color-surface) !important;
  box-shadow: 0 8px 20px -6px var(--color-purple-light);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  right: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-preview-container:hover img {
  transform: scale(1.03);
}

.avatar-preview-container:hover .avatar-overlay {
  opacity: 1;
}

.cursor-pointer {
  cursor: pointer;
}

.custom-file-upload {
  display: inline-block;
}

.form-control {
  background-color: var(--color-input-bg) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  font-size: 0.92rem;
  color: var(--color-text) !important;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--color-primary) !important;
  box-shadow: var(--focus-ring) !important;
  background-color: var(--color-input-bg) !important;
  color: var(--color-text) !important;
}

.form-control::placeholder {
  color: var(--color-text-muted) !important;
  opacity: 0.6;
}

.input-group-text {
  background-color: var(--color-surface-hover) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text-muted) !important;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.input-group:focus-within .input-group-text {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.skill-badge-premium {
  background: var(--color-purple-light);
  color: var(--color-purple);
  border: 1px solid var(--color-purple-light);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.skill-badge-premium:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.remove-skill-trigger {
  cursor: pointer;
  opacity: 0.6;
  font-weight: bold;
  transition: opacity 0.2s;
}

.remove-skill-trigger:hover {
  opacity: 1;
  color: var(--color-danger);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  box-shadow: 0 4px 12px -2px var(--color-primary-light);
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-purple-hover, #6d28d9) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -2px var(--color-primary-light);
}

.btn-secondary {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
  color: var(--color-text);
}

.btn-outline-primary {
  color: var(--color-primary);
  border-color: var(--color-primary-light);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  background: transparent;
}

.btn-outline-primary:hover {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
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
