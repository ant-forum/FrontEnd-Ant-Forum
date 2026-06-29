<template>
  <div class="edit-profile-container">
    <div class="dashboard-card-modern p-4">
      <div class="mb-4">
        <div>
          <h4 class="mb-0 fw-bold header-title themed-text">Edit Profile</h4>
          <p class="text-muted small mb-0">
            Update your username, gender, bio, skills, and avatar picture.
          </p>
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
              :src="
                avatarPreview ||
                'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4,c0aede,d1d4f9'
              "
              class="rounded-circle"
              width="120"
              height="120"
              style="object-fit: cover"
            />
            <div
              class="avatar-overlay d-flex align-items-center justify-content-center rounded-circle"
            >
              <i class="bi bi-camera-fill text-white fs-4"></i>
            </div>
          </button>
          <div class="px-2 mt-2">
            <label class="form-label text-muted small fw-bold d-block mb-2"
              >Profile Picture</label
            >
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
            <small class="text-muted d-block mt-2" style="font-size: 0.75rem"
              >PNG, JPG up to 5MB</small
            >
          </div>
        </div>

        <!-- Main Details Form -->
        <div class="col-md-8">
          <!-- Full Name -->
          <div class="mb-3">
            <label class="form-label fw-bold small themed-text"
              >Full Name *</label
            >
            <input
              v-model="form.fullname"
              class="form-control"
              placeholder="Enter your full name"
              required
            />
          </div>

          <!-- Username -->
          <div class="mb-3">
            <label class="form-label fw-bold small themed-text"
              >Username *</label
            >
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

          <!-- Bio -->
          <div class="mb-3">
            <label class="form-label fw-bold small themed-text">Bio</label>
            <textarea
              v-model="form.bio"
              class="form-control profile-textarea"
              rows="4"
              maxlength="300"
              placeholder="Share your background, interests, or what you are building."
            ></textarea>
            <small class="text-muted d-block text-end mt-1"
              >{{ form.bio.length }}/300</small
            >
          </div>

          <!-- Skills from Admin Tags -->
          <div class="mb-0">
            <label class="form-label fw-bold small themed-text">Skills</label>
            <div class="skill-picker">
              <div v-if="tagsStore.isLoading" class="skill-picker-loading">
                <span
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                <span>Loading skill tags...</span>
              </div>

              <div v-else-if="availableSkillTags.length" class="skill-tag-grid">
                <button
                  v-for="tag in availableSkillTags"
                  :key="tag.id || tag.name"
                  type="button"
                  :class="[
                    'skill-tag-option',
                    { active: isSkillSelected(tag.name) },
                  ]"
                  :title="tag.description || tag.name"
                  @click="toggleSkill(tag.name)"
                >
                  <i
                    :class="[
                      'bi',
                      isSkillSelected(tag.name)
                        ? 'bi-check2-circle'
                        : 'bi-plus-circle',
                    ]"
                  ></i>
                  <span>{{ tag.name }}</span>
                </button>
              </div>

              <div v-else class="skill-picker-empty">
                <i class="bi bi-tags"></i>
                <span>No admin-created tags available yet.</span>
              </div>
            </div>

            <div
              v-if="selectedSkills.length"
              class="selected-skills-row"
              aria-label="Selected skills"
            >
              <span
                v-for="skill in selectedSkills"
                :key="skill"
                class="selected-skill-chip"
              >
                {{ skill }}
                <button
                  type="button"
                  title="Remove skill"
                  @click="toggleSkill(skill)"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>
            </div>
            <small class="text-muted d-block mt-2"
              >Skills are selected from tags created by admins.</small
            >
          </div>
        </div>
      </div>

      <hr class="border-slate my-4" />

      <!-- Social Links Section -->
      <div class="mb-4">
        <h5 class="fw-bold header-title themed-text mb-3">Social Links</h5>

        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <select v-model="newSocialPlatform" class="form-select">
              <option value="" disabled>Select Platform</option>
              <option value="Github">Github</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter/X">Twitter/X</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="Discord">Discord</option>
              <option value="TikTok">TikTok</option>
              <option value="Website">Website (Other)</option>
            </select>
          </div>
          <div class="col-md-6">
            <input
              v-model="newSocialUrl"
              type="text"
              class="form-control"
              placeholder="URL (https://...)"
            />
          </div>
          <div class="col-md-2">
            <button
              class="btn btn-outline-primary w-100"
              :disabled="!newSocialPlatform || !newSocialUrl || isAddingSocial"
              @click="handleAddSocialLink"
            >
              {{ isAddingSocial ? "Adding..." : "Add Link" }}
            </button>
          </div>
        </div>

        <div
          v-if="userProfilesStore.socialLinks.length === 0"
          class="card-empty-state p-3 text-center rounded"
        >
          <i class="bi bi-link-45deg text-muted fs-4 d-block mb-2"></i>
          <span class="text-muted small">No social links added yet.</span>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <div
            v-for="link in userProfilesStore.socialLinks"
            :key="link.id"
            class="d-flex align-items-center justify-content-between p-3 border rounded bg-surface"
          >
            <div class="d-flex align-items-center gap-3">
              <i
                :class="getPlatformIcon(link.platform)"
                class="fs-4 text-primary-blue"
              ></i>
              <div>
                <strong class="d-block themed-text">{{ link.platform }}</strong>
                <a
                  :href="link.url"
                  target="_blank"
                  class="small text-muted text-decoration-none"
                  >{{ link.url }}</a
                >
              </div>
            </div>
            <button
              class="btn btn-sm btn-outline-danger"
              title="Delete Link"
              @click="handleDeleteSocialLink(link.id)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="profile-form-actions">
        <button
          type="button"
          class="btn btn-secondary px-4"
          @click="handleCancel"
          :disabled="isProfileSaving"
        >
          Cancel
        </button>
        <button
          type="button"
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

    <ImageCropModal
      v-if="isAvatarCropOpen"
      :source="avatarCropSource"
      @confirm="handleAvatarCropConfirm"
      @cancel="cancelAvatarCrop"
    />
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
        />
        <p class="mb-1 fw-bold themed-text">Update your profile picture now?</p>
        <small class="text-muted">
          This uploads immediately after you confirm. You do not need to click
          Save Changes.
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
            role="status"
            aria-hidden="true"
          ></span>
          <span>{{
            isAvatarUploading ? "Updating..." : "Confirm Picture"
          }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Social Link Delete Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Social Link"
      theme="danger"
      icon="bi bi-trash3"
      @closeModal="mDelete.isVisible = false"
    >
      <div class="d-grid gap-3">
        <div>
          <p class="fw-semibold mb-2">
            Are you sure you want to delete this social link?
          </p>
          <span class="text-muted"> This action cannot be undone.</span>
        </div>

        <div class="d-flex justify-content-end align-items-center gap-3">
          <button
            class="btn btn-outline-secondary"
            @click="mDelete.isVisible = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger"
            @click="deleteSocialLinkConfirm"
            :disabled="mDelete.isLoading"
          >
            {{ mDelete.isLoading ? "Deleting..." : "Yes, I'm sure" }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineProps,
  defineEmits,
} from "vue";
import BaseModal from "../base/BaseModal.vue";
import ImageCropModal from "../base/ImageCropModal.vue";
import { useUserProfilesStore } from "../../stores/UserProfilesStore";
import { useTagsStore } from "../../stores/TagsStore";
import { useImageCropper } from "../../composables/useImageCropper";
import { useToast } from "../../composables/useToast";
import { normalizeSkills, skillsToText } from "../../utils/profileFields";
import { resolveMediaUrl } from "@/utils/mediaUrl";

const props = defineProps({
  user: { type: Object, required: true },
});

const emit = defineEmits(["saved", "cancel"]);

const userProfilesStore = useUserProfilesStore();
const tagsStore = useTagsStore();
const toast = useToast();

const successMessage = ref("");
const errorMessage = ref("");
const isProfileSaving = ref(false);

// Form state
const form = reactive({
  fullname: "",
  username: "",
  gender: "male",
  bio: "",
});

const selectedSkills = ref([]);

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
  form.fullname = u.name || u.fullname || "";
  form.username = u.username || "";
  form.gender = u.gender || "male";
  form.bio = u.bio || "";
  selectedSkills.value = normalizeSkills(u.skills);
  avatarPreview.value = u.profile_pic ? resolveMediaUrl(u.profile_pic) : "";
};

const availableSkillTags = computed(() => {
  const seen = new Set();
  return tagsStore.tags
    .map((tag) => ({
      id: tag.id,
      name: String(tag.name || "").trim(),
      description: tag.description || "",
    }))
    .filter((tag) => {
      const key = tag.name.toLowerCase();
      if (!tag.name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
});

const selectedSkillSet = computed(
  () => new Set(selectedSkills.value.map((skill) => skill.toLowerCase())),
);

const isSkillSelected = (skillName) =>
  selectedSkillSet.value.has(String(skillName || "").toLowerCase());

const toggleSkill = (skillName) => {
  const cleanName = String(skillName || "").trim();
  if (!cleanName) return;

  if (isSkillSelected(cleanName)) {
    selectedSkills.value = selectedSkills.value.filter(
      (skill) => skill.toLowerCase() !== cleanName.toLowerCase(),
    );
    return;
  }

  selectedSkills.value = [...selectedSkills.value, cleanName];
};

const handleCancel = () => {
  resetForm();
  emit("cancel");
};

onMounted(async () => {
  resetForm();
  if (tagsStore.tags.length === 0) {
    try {
      await tagsStore.fetchTags();
    } catch (error) {
      console.error("Failed to load skill tags:", error);
      toast.warning("Could not load admin-created skill tags.");
    }
  }
});
onBeforeUnmount(revokePendingAvatarPreview);

// Watch for store changes or prop updates
watch(() => userProfilesStore.profile, resetForm, {
  deep: true,
  immediate: true,
});

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

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Max size is 5MB");
    clearAvatarInput();
    return;
  }

  clearAvatarInput();
  await openAvatarCropper(file);
};

const handleAvatarCropConfirm = (result) => {
  if (!result) return;
  revokePendingAvatarPreview();
  pendingAvatarFile.value = result.file;
  pendingAvatarPreview.value = result.previewUrl;
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

  const fullnameBeforeUpload = form.fullname;
  const usernameBeforeUpload = form.username;
  const genderBeforeUpload = form.gender;
  const bioBeforeUpload = form.bio;
  const skillsBeforeUpload = [...selectedSkills.value];

  try {
    isAvatarUploading.value = true;
    await userProfilesStore.uploadAvatar(pendingAvatarFile.value);
    form.fullname = fullnameBeforeUpload;
    form.username = usernameBeforeUpload;
    form.gender = genderBeforeUpload;
    form.bio = bioBeforeUpload;
    selectedSkills.value = skillsBeforeUpload;
    toast.success("Profile picture updated.");
    showAvatarConfirmModal.value = false;
    pendingAvatarFile.value = null;
    revokePendingAvatarPreview();
    clearAvatarInput();
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

// Validation
const isValid = computed(() => {
  return !!form.username.trim() && !!form.fullname.trim() && !!form.gender;
});

// Submit
const handleSubmit = async () => {
  if (!isValid.value || isProfileSaving.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    isProfileSaving.value = true;
    await userProfilesStore.updateProfile({
      fullname: form.fullname,
      username: form.username,
      gender: form.gender,
      bio: form.bio.trim() || null,
      skills: skillsToText(selectedSkills.value) || null,
    });

    successMessage.value = "Profile saved successfully.";
    toast.success("Profile saved successfully.");
    emit("saved");

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Profile update failed:", error);
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Unable to save profile. Please try again.";
    toast.error(errorMessage.value);
  } finally {
    isProfileSaving.value = false;
  }
};

// Social Links State and Handlers
const newSocialPlatform = ref("");
const newSocialUrl = ref("");
const isAddingSocial = ref(false);

const handleAddSocialLink = async () => {
  if (!newSocialPlatform.value || !newSocialUrl.value) return;
  isAddingSocial.value = true;
  try {
    await userProfilesStore.addSocialLink(
      newSocialPlatform.value,
      newSocialUrl.value,
    );
    toast.success("Social link added");
    newSocialPlatform.value = "";
    newSocialUrl.value = "";
  } catch (error) {
    console.error("Failed to add social link:", error);
    toast.error("Failed to add social link");
  } finally {
    isAddingSocial.value = false;
  }
};

const mDelete = reactive({
  isVisible: false,
  isLoading: false,
  id: null,
});

const handleDeleteSocialLink = (id) => {
  mDelete.isVisible = true;
  mDelete.id = id;
};

const deleteSocialLinkConfirm = async () => {
  if (!mDelete.id) return;
  mDelete.isLoading = true;
  try {
    await userProfilesStore.deleteSocialLink(mDelete.id);
    toast.success("Social link deleted");
  } catch (error) {
    console.error("Failed to delete social link:", error);
    toast.error("Failed to delete social link");
  } finally {
    mDelete.isLoading = false;
    mDelete.isVisible = false;
    mDelete.id = null;
  }
};

const getPlatformIcon = (platformStr) => {
  const p = (platformStr || "").toLowerCase();
  if (p.includes("linkedin")) return "bi-linkedin";
  if (p.includes("github")) return "bi-github";
  if (p.includes("twitter") || p.includes("x")) return "bi-twitter-x";
  if (p.includes("facebook")) return "bi-facebook";
  if (p.includes("instagram")) return "bi-instagram";
  if (p.includes("youtube")) return "bi-youtube";
  if (p.includes("discord")) return "bi-discord";
  if (p.includes("tiktok")) return "bi-tiktok";
  return "bi-link-45deg";
};
</script>

<style scoped>
.dashboard-card-modern {
  background: var(--color-surface) !important;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition:
    background-color var(--transition-slow),
    border-color var(--transition-slow);
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

.profile-textarea {
  min-height: 112px;
  resize: vertical;
}

.skill-picker {
  min-height: 54px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 0.7rem;
}

.skill-tag-grid,
.selected-skills-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag-option {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 0 0.78rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.skill-tag-option:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.skill-tag-option.active {
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  border-color: transparent;
  box-shadow: 0 10px 22px -18px var(--color-primary);
}

.skill-picker-loading,
.skill-picker-empty {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  font-weight: 750;
  text-align: center;
}

.selected-skills-row {
  margin-top: 0.65rem;
}

.selected-skill-chip {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #5b21b6;
  background: #ede9fe;
  border: 1px solid #C1E8FF;
  border-radius: var(--radius-pill);
  padding: 0 0.42rem 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 900;
  box-shadow: 0 8px 18px -18px #052659;
}

.selected-skill-chip button {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #052659;
  background: #ffffff;
  border: 1px solid #ddd6fe;
  border-radius: 50%;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.selected-skill-chip button:hover {
  color: #ffffff;
  background: var(--color-primary);
  border-color: var(--color-primary);
}

[data-theme="dark"] .selected-skill-chip {
  color: #eff6ff;
  background: color-mix(in srgb, var(--color-blue) 72%, #111827);
  border-color: color-mix(in srgb, var(--color-blue) 72%, #ffffff);
  box-shadow: 0 8px 18px -16px var(--color-blue);
}

[data-theme="dark"] .selected-skill-chip button {
  color: #ffffff;
  background: color-mix(in srgb, var(--color-surface) 78%, #000000);
  border-color: color-mix(in srgb, #ffffff 34%, transparent);
}

[data-theme="dark"] .selected-skill-chip button:hover {
  color: #ffffff;
  background: var(--color-primary);
  border-color: color-mix(in srgb, #ffffff 54%, transparent);
}

.profile-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  margin-top: 1.25rem;
  border-top: 1px solid var(--color-border);
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
  box-shadow: 0 8px 20px -6px var(--color-blue-light);
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
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-blue) 100%
  );
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  box-shadow: 0 4px 12px -2px var(--color-primary-light);
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--color-primary-hover) 0%,
    var(--color-blue-hover, #052659) 100%
  );
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

  .profile-form-actions {
    flex-direction: column-reverse;
  }

  .profile-form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
