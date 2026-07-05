<template>
  <AdminPageShell
    title="Tag Management"
    kicker="Forum Taxonomy"
    subtitle="Keep labels clean and reusable so posts are easier to find."
    :metrics="metrics"
  >
    <AdminTaxonomyCards
      title="Tags"
      subtitle="Reusable labels for admin maintenance."
      icon="bi-tag"
      item-label="Tag"
      :items="tags"
      :is-loading="isLoading"
      show-view
      show-search
      @create="openCreateModal"
      @view="openDetailModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <BaseModal
      v-if="mDetail.isVisible"
      title="Tag Details"
      icon="bi bi-eye"
      kicker="Forum Taxonomy"
      @closeModal="closeDetailModal"
    >
      <div v-if="mDetail.isLoading" class="detail-loading">
        <span class="spinner-border spinner-border-sm"></span>
        <span>Loading tag details...</span>
      </div>

      <div v-else class="detail-list">
        <div>
          <span>Name</span>
          <strong>{{ mDetail.item?.name }}</strong>
        </div>
        <div>
          <span>Description</span>
          <p>{{ mDetail.item?.description }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <button
          class="btn btn-light border"
          type="button"
          @click="closeDetailModal"
        >
          Close
        </button>
        <button
          v-if="!mDetail.isLoading"
          class="btn btn-primary"
          type="button"
          @click="editFromDetail"
        >
          <i class="bi bi-pencil"></i>
          <span>Edit Tag</span>
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-if="mForm.isVisible"
      :title="mForm.mode === 'edit' ? 'Edit Tag' : 'Create Tag'"
      icon="bi bi-tag"
      kicker=""
      @closeModal="closeFormModal"
    >
      <form class="taxonomy-form" @submit.prevent="saveTag">
        <label>
          <span>Tag Name <span class="text-danger">*</span></span>
          <input
            v-model.trim="mForm.data.name"
            class="form-control"
            :class="{ 'is-invalid': errors.tagName }"
            type="text"
            maxlength="40"
            placeholder="Example: Vue"
            @input="handleFormInput('tagName')"
          />
          <small v-if="errors.tagName" class="field-error">{{
            errors.tagName
          }}</small>
        </label>
        <label>
          <span>Description <span class="text-danger">*</span></span>
          <textarea
            v-model.trim="mForm.data.description"
            class="form-control"
            :class="{ 'is-invalid': errors.tagDescription }"
            rows="3"
            placeholder="Explain when this tag should be used"
            @input="handleFormInput('tagDescription')"
          ></textarea>
          <small v-if="errors.tagDescription" class="field-error">{{
            errors.tagDescription
          }}</small>
        </label>
        <div v-if="mForm.errorMessage" class="form-error-message">
          <i class="bi bi-exclamation-circle"></i>
          <span>{{ mForm.errorMessage }}</span>
        </div>
        <div class="modal-actions">
          <button
            class="btn btn-light border"
            type="button"
            @click="closeFormModal"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="mForm.isLoading"
          >
            <span
              v-if="mForm.isLoading"
              class="spinner-border spinner-border-sm"
            ></span>
            {{ mForm.mode === "edit" ? "Save Changes" : "Create Tag" }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Tag?"
      icon="bi bi-trash"
      theme="danger"
      kicker=""
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Delete <strong>{{ mDelete.item?.name }}</strong
        >? This action cannot be undone.
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
          class="btn btn-danger"
          type="button"
          :disabled="mDelete.isLoading"
          @click="deleteTag"
        >
          <span
            v-if="mDelete.isLoading"
            class="spinner-border spinner-border-sm"
          ></span>
          <i class="bi bi-trash"></i>
          <span>Delete</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import AdminTaxonomyCards from "../../components/admin/AdminTaxonomyCards.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useToast } from "../../composables/useToast";
import { useRequiredValidator } from "../../composables/useRequiredValidator";
import { useTagsStore } from "../../stores/TagsStore";

const tagStore = useTagsStore();
const { tags, isLoading } = storeToRefs(tagStore);
const toast = useToast();
const { errors, clearError, validateField } = useRequiredValidator();

const metrics = computed(() => [
  {
    label: "Tags",
    value: tags.value.length,
    change: "Loaded from API",
    icon: "bi-tags",
    className: "blue",
  },
  {
    label: "Active Tags",
    value: tags.value.filter((tag) => tag.items > 0).length,
    change: "Currently in use",
    icon: "bi-activity",
    className: "green",
  },
  {
    label: "Total Usages",
    value: tags.value.reduce((acc, tag) => acc + (tag.items || 0), 0),
    change: "Forums & Projects",
    icon: "bi-bar-chart",
    className: "blue",
  },
  {
    label: "Needs Copy",
    value: tags.value.filter((tag) => !tag.description).length,
    change: "Missing description",
    icon: "bi-pencil",
    className: "orange",
  },
]);

const mForm = reactive({
  isVisible: false,
  mode: "create",
  item: null,
  editId: null,
  isLoading: false,
  errorMessage: "",
  data: {
    name: "",
    description: "",
  },
});

const mDelete = reactive({
  isVisible: false,
  isLoading: false,
  item: null,
});

const mDetail = reactive({
  isVisible: false,
  isLoading: false,
  item: null,
});

onMounted(async () => {
  try {
    await tagStore.fetchTags();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
  }
});

const openCreateModal = () => {
  mForm.mode = "create";
  mForm.item = null;
  mForm.editId = null;
  mForm.errorMessage = "";
  clearError("tagName");
  clearError("tagDescription");
  mForm.data = { name: "", description: "" };
  mForm.isVisible = true;
};

const openEditModal = (tag) => {
  if (!tag) return;
  mForm.mode = "edit";
  mForm.item = tag;
  mForm.editId = tag.id;
  mForm.errorMessage = "";
  clearError("tagName");
  clearError("tagDescription");
  mForm.data = {
    name: tag.name || "",
    description: tag.description || "",
  };
  mForm.isVisible = true;
};

const closeFormModal = () => {
  mForm.isVisible = false;
  mForm.item = null;
  mForm.editId = null;
  mForm.errorMessage = "";
  clearError("tagName");
  clearError("tagDescription");
};

const clearFormError = () => {
  mForm.errorMessage = "";
};

const handleFormInput = (field) => {
  clearFormError();
  clearError(field);
};

const getErrorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Tag request failed.";

  if (String(message).toLowerCase().includes("already")) {
    return "This tag name already exists. Please choose a different name.";
  }

  return message;
};

const isTagNameTaken = () => {
  const formName = mForm.data.name.trim().toLowerCase();

  return tags.value.some((tag) => {
    const sameName =
      String(tag.name || "")
        .trim()
        .toLowerCase() === formName;
    const sameTag = String(tag.id) === String(mForm.editId);

    return sameName && !sameTag;
  });
};

const openDetailModal = async (tag) => {
  mDetail.item = tag;
  mDetail.isVisible = true;
  try {
    mDetail.isLoading = true;
    mDetail.item = await tagStore.fetchTagById(tag.id);
  } catch (error) {
    console.error("Failed to fetch tag details:", error);
  } finally {
    mDetail.isLoading = false;
  }
};

const closeDetailModal = () => {
  mDetail.isVisible = false;
  mDetail.item = null;
};

const editFromDetail = () => {
  const tag = mDetail.item;
  closeDetailModal();
  openEditModal(tag);
};

const openDeleteModal = (tag) => {
  mDelete.item = tag;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const saveTag = async () => {
  let successMessage = "";

  try {
    mForm.isLoading = true;
    mForm.errorMessage = "";

    const isNameValid = validateField(
      "tagName",
      mForm.data.name,
      "Tag name is required.",
    );
    const isDescriptionValid = validateField(
      "tagDescription",
      mForm.data.description,
      "Description is required.",
    );

    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    if (isTagNameTaken()) {
      mForm.errorMessage =
        "This tag name already exists. Please choose a different name.";
      return;
    }

    if (mForm.mode === "edit") {
      if (!mForm.editId) {
        mForm.errorMessage = "Please select a tag to edit again.";
        return;
      }

      const updatePayload = {
        name: mForm.data.name.trim(),
        description: mForm.data.description,
      };

      await tagStore.updateTag(mForm.editId, updatePayload);
      successMessage = "Tag updated successfully!";
    } else {
      await tagStore.createTag(mForm.data);
      successMessage = "Tag created successfully!";
    }
  } catch (error) {
    console.error("Failed to save tag:", error);
    mForm.errorMessage = getErrorMessage(error);
    return;
  } finally {
    mForm.isLoading = false;
  }

  closeFormModal();
  toast.success(successMessage);

  try {
    await tagStore.fetchTags();
  } catch (error) {
    console.error("Failed to refresh tags:", error);
    toast.warning("Saved, but could not refresh tags.");
  }
};

const deleteTag = async () => {
  try {
    mDelete.isLoading = true;
    await tagStore.deleteTag(mDelete.item.id);
    closeDeleteModal();
    toast.success("Tag deleted successfully!");

    try {
      await tagStore.fetchTags();
    } catch (error) {
      console.error("Failed to refresh tags:", error);
      toast.warning("Deleted, but could not refresh tags.");
    }
  } catch (error) {
    console.error("Failed to delete tag:", error);
    const message = error.response?.data?.message || error.message || "Failed to delete tag.";
    toast.error(message);
    closeDeleteModal();
  } finally {
    mDelete.isLoading = false;
  }
};
</script>

<style scoped>
.taxonomy-form,
.taxonomy-form label {
  display: grid;
  gap: 0.55rem;
}

.taxonomy-form {
  gap: 0.9rem;
}

.taxonomy-form span {
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 0.35rem;
}

.detail-loading {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.detail-list {
  display: grid;
  gap: 0.7rem;
}

.detail-list div {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.detail-list span {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.detail-list strong,
.detail-list p {
  color: var(--color-text);
  font-size: 0.9rem;
  margin: 0;
}

.delete-message {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.delete-message strong {
  color: var(--color-text);
}

.form-error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding: 0.65rem 0.75rem;
  color: var(--color-danger);
  background: var(--color-danger-light);
  border: 1px solid
    color-mix(in srgb, var(--color-danger) 24%, var(--color-border));
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
}

.field-error {
  color: var(--color-danger) !important;
  font-size: 0.78rem !important;
  font-weight: 700 !important;
}

.taxonomy-form .form-control.is-invalid {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 0.2rem
    color-mix(in srgb, var(--color-danger) 18%, transparent);
}

.taxonomy-form .form-control.is-invalid:focus {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 0.22rem
    color-mix(in srgb, var(--color-danger) 24%, transparent);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
