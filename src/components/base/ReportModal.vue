<script setup>
import { ref } from "vue";
import BaseModal from "./BaseModal.vue";
import { useToast } from "@/composables/useToast";
import { useReportStore } from "@/stores/ReportStore";

const props = defineProps({
  type: {
    type: String,
    required: true, // "forum" or "project"
  },
  targetId: {
    type: [String, Number],
    required: true,
  },
  title: {
    type: String,
    default: "Report Content",
  },
});

const emit = defineEmits(["closeModal", "success"]);

const toast = useToast();
const reportStore = useReportStore();

const reasonText = ref("");
const imageFile = ref(null);
const imagePreviewUrl = ref(null);
const submitting = ref(false);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) {
    imageFile.value = null;
    imagePreviewUrl.value = null;
    return;
  }

  // Validate file size (e.g. 5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image file is too large. Max size is 5MB.");
    e.target.value = "";
    return;
  }

  imageFile.value = file;
  imagePreviewUrl.value = URL.createObjectURL(file);
};

const removeImage = () => {
  imageFile.value = null;
  imagePreviewUrl.value = null;
};

const submitReport = async () => {
  const fullReason = reasonText.value.trim();
  if (!fullReason) {
    toast.error("Please enter a reason for reporting.");
    return;
  }

  submitting.value = true;
  try {
    if (props.type === "forum") {
      await reportStore.createForumReport(
        props.targetId,
        fullReason,
        imageFile.value,
      );
    } else if (props.type === "project") {
      await reportStore.createProjectReport(
        props.targetId,
        fullReason,
        imageFile.value,
      );
    }
    toast.success("Content reported successfully. A moderator will review it.");
    emit("success");
    emit("closeModal");
  } catch (err) {
    console.error("Failed to submit report:", err);
    const errorMsg = err?.message || err?.msg || (typeof err === "string" ? err : "Failed to submit report. Please try again.");
    toast.error(errorMsg);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <BaseModal
    :title="title"
    icon="bi bi-flag-fill"
    theme="danger"
    @closeModal="$emit('closeModal')"
  >
    <form @submit.prevent="submitReport" class="report-form">
      <div class="mb-3">
        <label for="report-reason-text" class="form-label fw-bold"
          >Reason for reporting</label
        >
        <textarea
          id="report-reason-text"
          v-model="reasonText"
          class="form-control"
          rows="4"
          placeholder="Please explain why you are reporting this content..."
          required
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="form-label fw-bold"
          >Attach Screenshot / Evidence (Optional)</label
        >
        <div v-if="!imagePreviewUrl" class="upload-area">
          <label for="report-screenshot-upload" class="upload-label">
            <i class="bi bi-cloud-arrow-up fs-3 text-muted mb-2"></i>
            <span class="upload-text">Click to upload screenshot</span>
            <span class="upload-subtext">PNG, JPG, or WEBP up to 5MB</span>
          </label>
          <input
            id="report-screenshot-upload"
            type="file"
            accept="image/*"
            class="d-none"
            @change="handleFileChange"
          />
        </div>
        <div
          v-else
          class="preview-area border rounded p-2 d-flex align-items-center justify-content-between"
        >
          <div class="d-flex align-items-center gap-2 overflow-hidden">
            <img
              :src="imagePreviewUrl"
              alt="Screenshot preview"
              class="preview-thumbnail rounded object-cover"
            />
            <span class="file-name text-truncate small text-muted">{{
              imageFile?.name
            }}</span>
          </div>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm rounded-circle px-2 py-1"
            @click="removeImage"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 border-top pt-3">
        <button
          type="button"
          class="btn btn-light border"
          :disabled="submitting"
          @click="$emit('closeModal')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-danger d-flex align-items-center gap-2"
          :disabled="submitting"
        >
          <span
            v-if="submitting"
            class="spinner-border spinner-border-sm"
            role="status"
          ></span>
          <i v-else class="bi bi-send"></i>
          <span>Submit Report</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.report-form {
  font-size: 0.9rem;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg, var(--color-surface-hover));
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: var(--color-danger);
  background: rgba(239, 68, 68, 0.04);
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  cursor: pointer;
  width: 100%;
}

.upload-text {
  font-weight: 700;
  color: var(--color-text);
}

.upload-subtext {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.preview-thumbnail {
  width: 50px;
  height: 50px;
}

.file-name {
  max-width: 200px;
}
</style>
