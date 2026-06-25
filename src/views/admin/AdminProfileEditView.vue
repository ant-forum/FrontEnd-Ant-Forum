<template>
  <AdminPageShell
    title="Edit Admin Profile"
    kicker="Official ANT Staff"
    subtitle="Update the administrator profile details shown across the admin suite."
    :breadcrumbs="[
      { label: 'Profile', to: '/admin/profile' },
      { label: 'Edit Profile' },
    ]"
  >
    <template #before-title>
      <router-link class="btn btn-light border back-link" to="/admin/profile">
        <i class="bi bi-arrow-left"></i>
        <span>Back to Profile</span>
      </router-link>
    </template>

    <form
      class="admin-panel admin-profile-edit-panel"
      @submit.prevent="saveProfile"
    >
      <header class="profile-edit-header">
        <div>
          <span class="section-kicker">Staff Profile</span>
          <h3>Edit Profile</h3>
          <p>
            Update your username, department, availability, and avatar picture.
          </p>
        </div>
        <div class="profile-edit-actions">
          <router-link class="btn btn-secondary px-3" to="/admin/profile"
            >Cancel</router-link
          >
          <button
            type="submit"
            class="btn btn-primary px-4"
            :disabled="isSaving || isAvatarUploading"
          >
            <span
              v-if="isSaving"
              class="spinner-border spinner-border-sm me-1"
              role="status"
            ></span>
            <i v-else class="bi bi-check2"></i>
            <span>{{ isSaving ? "Saving..." : "Save Changes" }}</span>
          </button>
        </div>
      </header>

      <div class="profile-edit-body">
        <div class="profile-edit-avatar">
          <button
            type="button"
            class="avatar-preview-large-btn"
            title="Choose image"
            :disabled="isSaving || isAvatarUploading"
            @click="openAvatarFilePicker"
          >
            <img
              v-if="editForm.avatar"
              :src="editForm.avatar"
              alt="Avatar preview"
            />
            <span v-else>{{ adminInitials }}</span>
            <div class="avatar-hover-overlay">
              <i class="bi bi-camera-fill fs-4 text-white"></i>
            </div>
          </button>

          <span class="profile-pic-label">Profile Picture</span>

          <button
            type="button"
            class="btn btn-sm btn-outline-primary px-3 choose-img-btn"
            :disabled="isSaving || isAvatarUploading"
            @click="openAvatarFilePicker"
          >
            Choose Image
          </button>
          <input
            ref="fileInput"
            type="file"
            class="d-none"
            accept="image/*"
            @change="handleAvatarFileChange"
          />
          <span class="file-limits-text">PNG, JPG up to 2MB</span>
        </div>

        <div class="profile-edit-fields">
          <div class="field-block">
            <label for="admin-name-input" class="themed-label"
              >Username *</label
            >
            <input
              id="admin-name-input"
              v-model.trim="editForm.name"
              class="form-control"
              type="text"
              required
            />
          </div>

          <div class="field-block">
            <label for="admin-dept-input" class="themed-label"
              >Department</label
            >
            <select
              id="admin-dept-input"
              v-model="editForm.department"
              class="form-select"
            >
              <option value="Forum Operations">Forum Operations</option>
              <option value="Technical Operations">Technical Operations</option>
              <option value="Community Management">Community Management</option>
              <option value="Security & Moderation">
                Security & Moderation
              </option>
            </select>
          </div>

          <div class="field-block">
            <label for="admin-hours-input" class="themed-label"
              >Office Hours / Availability</label
            >
            <input
              id="admin-hours-input"
              v-model.trim="editForm.officeHours"
              class="form-control"
              type="text"
              required
            />
          </div>

          <div class="field-block">
            <label for="admin-bio-input" class="themed-label"
              >Bio / Summary</label
            >
            <textarea
              id="admin-bio-input"
              v-model.trim="editForm.bio"
              class="form-control"
              rows="3"
              maxlength="200"
              required
            ></textarea>
            <small class="text-end text-muted mt-1"
              >{{ editForm.bio.length }}/200 characters</small
            >
          </div>
        </div>
      </div>
    </form>
  </AdminPageShell>

  <ImageCropModal
    v-if="isAvatarCropOpen"
    :source="avatarCropSource"
    @confirm="confirmAvatarCrop"
    @cancel="cancelAvatarCrop"
  />

  <BaseModal
    v-if="showAvatarConfirmModal"
    title="Change Profile Picture?"
    icon="bi bi-camera-fill"
    theme="primary"
    @closeModal="closeAvatarConfirmModal"
  >
    <div class="avatar-confirm-body">
      <img
        :src="pendingAvatarPreview"
        alt="Cropped profile picture preview"
        class="avatar-confirm-preview"
      />
      <p>Use this image as the admin profile picture?</p>
      <small>
        This uploads the avatar immediately. Other profile details still use
        Save Changes.
      </small>
    </div>

    <template #footer>
      <button
        type="button"
        class="btn btn-light border"
        :disabled="isAvatarUploading"
        @click="closeAvatarConfirmModal"
      >
        Choose Another
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="isAvatarUploading"
        @click="confirmAvatarUpload"
      >
        <span
          v-if="isAvatarUploading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-check2"></i>
        <span>{{
          isAvatarUploading ? "Updating..." : "Change Profile Picture"
        }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import ImageCropModal from "../../components/base/ImageCropModal.vue";
import { useAdminOperationsStore } from "../../stores/AdminOperationsStore";
import { useAuthStore } from "../../stores/AuthStore";
import { useUserProfilesStore } from "../../stores/UserProfilesStore";
import { useImageCropper } from "../../composables/useImageCropper";
import { useToast } from "../../composables/useToast";

const authStore = useAuthStore();
const adminStore = useAdminOperationsStore();
const userProfilesStore = useUserProfilesStore();
const router = useRouter();
const toast = useToast();

const isSaving = ref(false);
const isAvatarUploading = ref(false);
const fileInput = ref(null);
const pendingAvatarFile = ref(null);
const pendingAvatarPreview = ref("");
const showAvatarConfirmModal = ref(false);

const isTemporaryAvatarUrl = (value) =>
  typeof value === "string" && value.includes("blob:");
const usableAvatar = (value) =>
  value && !isTemporaryAvatarUrl(value) ? value : "";
const profileAvatarFrom = (profile = {}) =>
  usableAvatar(profile.profile_pic) ||
  usableAvatar(profile.avatar) ||
  usableAvatar(profile.avatarUrl);

const getStorageKey = () =>
  `ANT_AdminProfile:${authStore.user?.email || "admin@antforum.com"}`;

const getStoredProfile = () => {
  try {
    const storedProfile =
      JSON.parse(localStorage.getItem(getStorageKey())) || {};
    if (isTemporaryAvatarUrl(storedProfile.avatar)) {
      delete storedProfile.avatar;
      localStorage.setItem(getStorageKey(), JSON.stringify(storedProfile));
    }
    return storedProfile;
  } catch {
    return {};
  }
};

const localProfile = ref(getStoredProfile());

const adminName = computed(
  () =>
    localProfile.value.name ||
    authStore.user?.name ||
    authStore.user?.username ||
    "ANT Administrator",
);
const adminDepartment = computed(
  () =>
    localProfile.value.department ||
    authStore.user?.department ||
    "Forum Operations",
);
const adminAvatar = computed(
  () =>
    usableAvatar(localProfile.value.avatar) ||
    profileAvatarFrom(authStore.user),
);
const officeHours = computed(
  () =>
    localProfile.value.officeHours ||
    authStore.user?.officeHours ||
    "Mon - Fri, 8:00 AM - 5:00 PM",
);
const adminBio = computed(
  () =>
    localProfile.value.bio ||
    authStore.user?.bio ||
    "Responsible for keeping ANT Forum safe, organized, and useful for students, mentors, and project reviewers.",
);
const adminInitials = computed(() => {
  return (
    adminName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AD"
  );
});

const editForm = ref({
  name: "",
  bio: "",
  department: "",
  officeHours: "",
  avatar: "",
});

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

const resetEditForm = () => {
  editForm.value = {
    name: adminName.value,
    bio: adminBio.value,
    department: adminDepartment.value,
    officeHours: officeHours.value,
    avatar: adminAvatar.value || "",
  };
};

watch(
  () => authStore.user?.email,
  () => {
    localProfile.value = getStoredProfile();
    resetEditForm();
  },
  { immediate: true },
);

const syncToStore = () => {
  if (authStore.user) {
    authStore.user.name = localProfile.value.name || authStore.user.name;
    authStore.user.bio = localProfile.value.bio || authStore.user.bio;
    authStore.user.department =
      localProfile.value.department || authStore.user.department;
    authStore.user.officeHours =
      localProfile.value.officeHours || authStore.user.officeHours;
    authStore.user.avatar = localProfile.value.avatar || authStore.user.avatar;
  }
};

const revokePendingAvatarPreview = () => {
  if (pendingAvatarPreview.value?.startsWith("blob:")) {
    URL.revokeObjectURL(pendingAvatarPreview.value);
  }
  pendingAvatarPreview.value = "";
};

const openAvatarFilePicker = () => {
  if (isSaving.value || isAvatarUploading.value) return;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  fileInput.value?.click();
};

const handleAvatarFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only image files allowed");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error("Max size is 2MB");
    return;
  }

  if (fileInput.value) {
    fileInput.value.value = "";
  }

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
};

const confirmAvatarUpload = async () => {
  if (!pendingAvatarFile.value || isAvatarUploading.value) return;

  try {
    isAvatarUploading.value = true;
    const updatedProfile = await userProfilesStore.uploadAvatar(
      pendingAvatarFile.value,
    );
    const savedAvatar =
      profileAvatarFrom(updatedProfile) ||
      profileAvatarFrom(authStore.user) ||
      adminAvatar.value;

    editForm.value.avatar = savedAvatar;
    localProfile.value = {
      ...localProfile.value,
      avatar: savedAvatar,
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(localProfile.value));
    syncToStore();
    adminStore.recordProfileUpdate();

    toast.success("Profile picture updated.");
    showAvatarConfirmModal.value = false;
    pendingAvatarFile.value = null;
    revokePendingAvatarPreview();
  } catch (error) {
    console.error("Avatar upload failed:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to update profile picture.";
    toast.error(message);
  } finally {
    isAvatarUploading.value = false;
  }
};

const saveProfile = async () => {
  if (isSaving.value) return;

  try {
    isSaving.value = true;

    if (editForm.value.name !== adminName.value) {
      await userProfilesStore.updateProfile({
        username: editForm.value.name,
        gender: authStore.user?.gender || "male",
      });
    }

    localProfile.value = {
      name: editForm.value.name,
      bio: editForm.value.bio,
      department: editForm.value.department,
      officeHours: editForm.value.officeHours,
      avatar: editForm.value.avatar || adminAvatar.value,
    };

    localStorage.setItem(getStorageKey(), JSON.stringify(localProfile.value));

    syncToStore();
    adminStore.recordProfileUpdate();

    toast.success("Admin profile updated successfully.");
    router.push("/admin/profile");
  } catch (err) {
    console.error("Failed to update admin profile:", err);
    const message =
      err.response?.data?.message || err.message || "Unable to save profile.";
    toast.error(message);
  } finally {
    isSaving.value = false;
  }
};

onBeforeUnmount(() => {
  revokePendingAvatarPreview();
});
</script>

<style scoped>
.back-link,
.profile-edit-actions .btn,
.choose-img-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.admin-panel {
  background: color-mix(
    in srgb,
    var(--color-surface) 96%,
    var(--color-primary) 4%
  );
  border: 1px solid
    color-mix(in srgb, var(--color-border) 84%, var(--color-primary) 16%);
  border-radius: 18px;
  box-shadow: var(--shadow-sm);
}

.admin-profile-edit-panel {
  max-width: 980px;
  overflow: hidden;
  padding: 0;
}

.profile-edit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.45rem 1.65rem 1.2rem;
  border-bottom: 1px solid var(--color-border);
}

.section-kicker {
  display: inline-block;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.profile-edit-header h3 {
  color: var(--color-text);
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
}

.profile-edit-header p {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.5;
  margin: 0.25rem 0 0;
}

.profile-edit-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.profile-edit-actions .btn {
  min-height: 40px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 850;
  text-decoration: none;
}

.profile-edit-actions .btn-secondary {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}

.profile-edit-actions .btn-primary {
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  border: 0;
  box-shadow: 0 14px 30px -24px var(--color-primary);
}

.profile-edit-body {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 1.75rem;
  padding: 1.65rem;
}

.profile-edit-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 1px solid var(--color-border);
  padding-right: 1.75rem;
}

.profile-edit-fields {
  display: grid;
  gap: 1.1rem;
}

.avatar-preview-large-btn {
  width: 120px;
  height: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  border: 3px solid var(--color-border);
  border-radius: 50%;
  font-size: 2.2rem;
  font-weight: 900;
  padding: 0;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    border-color var(--transition-fast);
}

.avatar-preview-large-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.avatar-preview-large-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.avatar-preview-large-btn img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-hover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.avatar-preview-large-btn:hover .avatar-hover-overlay {
  opacity: 1;
}

.profile-pic-label {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  font-weight: 850;
  margin: 0.95rem 0 0.55rem;
}

.choose-img-btn {
  border-radius: var(--radius-pill) !important;
  font-size: 0.85rem;
  font-weight: 800;
}

.file-limits-text {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  margin-top: 0.55rem;
}

.field-block {
  display: flex;
  flex-direction: column;
}

.themed-label {
  color: var(--color-text) !important;
  font-size: 0.85rem;
  font-weight: 850;
  margin-bottom: 0.5rem;
}

.profile-edit-fields .form-control,
.profile-edit-fields .form-select {
  min-height: 48px;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-background) 82%, #000000 18%);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

.profile-edit-fields textarea.form-control {
  min-height: 112px;
  resize: vertical;
}

.avatar-confirm-body {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  text-align: center;
}

.avatar-confirm-preview {
  width: 132px;
  height: 132px;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 18px 40px -28px var(--color-primary);
}

.avatar-confirm-body p {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 850;
  margin: 0;
}

.avatar-confirm-body small {
  max-width: 360px;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.btn-primary,
.btn-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

@media (max-width: 767.98px) {
  .profile-edit-header {
    flex-direction: column;
  }

  .profile-edit-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .profile-edit-body {
    grid-template-columns: 1fr;
    gap: 1.35rem;
    padding: 1.25rem;
  }

  .profile-edit-avatar {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-right: 0;
    padding-bottom: 1.25rem;
  }

  .profile-edit-actions .btn {
    flex: 1 1 150px;
  }
}
</style>
