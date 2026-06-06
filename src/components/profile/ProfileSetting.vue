<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount, defineProps, defineEmits } from "vue";
import BaseModal from "../base/BaseModal.vue";
import ImageCropModal from "../base/ImageCropModal.vue";
import { useUserProfilesStore } from "../../stores/UserProfilesStore";
import { useImageCropper } from "../../composables/useImageCropper";
import { useToast } from "../../composables/useToast";

const props = defineProps({
  user: { type: Object, required: true }
});

const emit = defineEmits(["saved", "cancel"]);

const userProfilesStore = useUserProfilesStore();
const toast = useToast();

const successMessage = ref("");
const errorMessage = ref("");
const isProfileSaving = ref(false);

// Form state
const form = reactive({
  username: "",
  gender: "male",
});

// Avatar
const fileInput = ref(null);
const avatarPreview = ref("");
const pendingAvatarFile = ref(null);
const pendingAvatarPreview = ref("");
const showAvatarConfirmModal = ref(false);
const isAvatarUploading = ref(false);
const {
  cropSource: avatarCropSource,
  isCropModalOpen: isAvatarCropOpen,
  openCropper: openAvatarCropper,
  confirmCrop: confirmAvatarCrop,
  cancelCrop: cancelAvatarCrop,
} = useImageCropper({
  title: "Crop Profile Picture",
  aspectRatio: 1,
  outputWidth: 512,
  outputHeight: 512,
  outputType: "image/jpeg",
  shape: "circle",
});

const revokePendingAvatarPreview = () => {
  if (pendingAvatarPreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(pendingAvatarPreview.value);
  }
  pendingAvatarPreview.value = "";
};

const clearAvatarInput = () => {
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const resetForm = () => {
  const u = userProfilesStore.profile || props.user || {};
  form.username = u.username || "";
  form.gender = u.gender || "male";
  avatarPreview.value = u.profile_pic || u.avatar || u.avatarUrl || "";
};

const handleCancel = () => {
  resetForm();
  emit("cancel");
};

onMounted(resetForm);
onBeforeUnmount(revokePendingAvatarPreview);

// Watch for store changes or prop updates
watch(() => userProfilesStore.profile, resetForm, { deep: true, immediate: true });

const openAvatarFilePicker = () => {
  if (isProfileSaving.value || isAvatarUploading.value) return;
  clearAvatarInput();
  fileInput.value?.click();
};

// Handle avatar selection
const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only image files allowed");
    clearAvatarInput();
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Max size is 2MB");
    clearAvatarInput();
    return;
  }

  clearAvatarInput();
  const cropped = await openAvatarCropper(file);
  if (!cropped) return;

  revokePendingAvatarPreview();
  pendingAvatarFile.value = cropped.file;
  pendingAvatarPreview.value = cropped.previewUrl;
  showAvatarConfirmModal.value = true;
};

const closeAvatarConfirmModal = () => {
  if (isAvatarUploading.value) return;

  showAvatarConfirmModal.value = false;
  pendingAvatarFile.value = null;
  revokePendingAvatarPreview();
  clearAvatarInput();
};

const confirmAvatarUpload = async () => {
  if (!pendingAvatarFile.value || isAvatarUploading.value) return;

  const usernameBeforeUpload = form.username;
  const genderBeforeUpload = form.gender;

  try {
    isAvatarUploading.value = true;
    await userProfilesStore.uploadAvatar(pendingAvatarFile.value);
    form.username = usernameBeforeUpload;
    form.gender = genderBeforeUpload;
    toast.success("Profile picture updated.");
    showAvatarConfirmModal.value = false;
    pendingAvatarFile.value = null;
    revokePendingAvatarPreview();
    clearAvatarInput();
  } catch (error) {
    console.error("Avatar upload failed:", error);
    const message = error.response?.data?.message || error.message || "Unable to update profile picture.";
    toast.error(message);
  } finally {
    isAvatarUploading.value = false;
  }
};

// Validation
const isValid = computed(() => {
  return !!form.username.trim() && !!form.gender;
});

// Submit
const handleSubmit = async () => {
  if (!isValid.value || isProfileSaving.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    isProfileSaving.value = true;
    await userProfilesStore.updateProfile({
      username: form.username,
      gender: form.gender,
    });

    successMessage.value = "Profile saved successfully.";
    toast.success("Profile saved successfully.");
    emit("saved");
    
    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Profile update failed:", error);
    errorMessage.value = error.response?.data?.message || error.message || "Unable to save profile. Please try again.";
    toast.error(errorMessage.value);
  } finally {
    isProfileSaving.value = false;
  }
};

</script>

<template>
  <div class="edit-profile-container">
    <div class="dashboard-card-modern p-4">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 class="mb-0 fw-bold header-title themed-text">Edit Profile</h4>
          <p class="text-muted small mb-0">Update your username, gender, and avatar picture.</p>
        </div>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-secondary px-4"
            @click="handleCancel"
            :disabled="isProfileSaving"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary px-4 d-flex align-items-center gap-2"
            :disabled="!isValid || isProfileSaving"
            @click="handleSubmit"
          >
            <span
              v-if="isProfileSaving"
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isProfileSaving ? "Saving..." : "Save Changes" }}
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
          <button
            type="button"
            class="mb-3 d-inline-block position-relative avatar-preview-container"
            :disabled="isProfileSaving || isAvatarUploading"
            aria-label="Choose profile picture"
            @click="openAvatarFilePicker"
          >
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
          </button>
          <div class="px-2 mt-2">
            <label class="form-label text-muted small fw-bold d-block mb-2">Profile Picture</label>
            <div class="custom-file-upload">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary px-3 rounded-pill"
                :disabled="isProfileSaving || isAvatarUploading"
                @click="openAvatarFilePicker"
              >
                Choose Image
              </button>
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept="image/*"
                @change="handleAvatarChange"
              />
            </div>
            <small class="text-muted d-block mt-2" style="font-size: 0.75rem;">PNG, JPG up to 2MB</small>
          </div>
        </div>

        <!-- Main Details Form -->
        <div class="col-md-8">
          <!-- Username -->
          <div class="mb-3">
            <label class="form-label fw-bold small themed-text">Username *</label>
            <input
              v-model="form.username"
              class="form-control"
              placeholder="Enter your username"
              required
            />
          </div>

          <!-- Gender -->
          <div class="mb-3">
            <label class="form-label fw-bold small themed-text">Gender *</label>
            <select v-model="form.gender" class="form-select">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="showAvatarConfirmModal"
      title="Use this profile picture?"
      icon="bi bi-camera-fill"
      theme="primary"
      @closeModal="closeAvatarConfirmModal"
    >
      <div class="avatar-confirm-body">
        <img
          :src="pendingAvatarPreview"
          alt="Selected profile picture preview"
          class="avatar-confirm-preview"
        >
        <p class="mb-1 fw-bold themed-text">Update your profile picture now?</p>
        <small class="text-muted">
          This uploads immediately after you confirm. You do not need to click Save Changes.
        </small>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary px-4"
          :disabled="isAvatarUploading"
          @click="closeAvatarConfirmModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
          :disabled="isAvatarUploading"
          @click="confirmAvatarUpload"
        >
          <span
            v-if="isAvatarUploading"
            class="spinner-border spinner-border-sm"
            aria-hidden="true"
          ></span>
          <span>{{ isAvatarUploading ? "Updating..." : "Confirm Picture" }}</span>
        </button>
      </template>
    </BaseModal>

    <ImageCropModal
      v-if="isAvatarCropOpen"
      :source="avatarCropSource"
      @confirm="confirmAvatarCrop"
      @cancel="cancelAvatarCrop"
    />
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

/* Avatar Experience */
.avatar-preview-container {
  cursor: pointer;
  background: transparent;
  border: 0;
  overflow: hidden;
  padding: 0;
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

.avatar-preview-container:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.avatar-confirm-body {
  text-align: center;
}

.avatar-confirm-preview {
  width: 168px;
  height: 168px;
  object-fit: cover;
  border: 3px solid var(--color-surface);
  border-radius: 50%;
  box-shadow: 0 16px 34px -18px var(--color-primary);
  margin-bottom: 1rem;
}

.cursor-pointer {
  cursor: pointer;
}

.custom-file-upload {
  display: inline-block;
}

/* Form Styles */
.form-control,
.form-select {
  background-color: var(--color-input-bg) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  font-size: 0.92rem;
  color: var(--color-text) !important;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--color-primary) !important;
  box-shadow: var(--focus-ring) !important;
  background-color: var(--color-input-bg) !important;
  color: var(--color-text) !important;
}

.form-control::placeholder {
  color: var(--color-text-muted) !important;
  opacity: 0.6;
}

/* Buttons */
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
