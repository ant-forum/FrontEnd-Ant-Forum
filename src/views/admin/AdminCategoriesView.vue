<template>
  <AdminPageShell
    title="Category Management"
    kicker=""
    subtitle="Organize forum content with readable category cards."
    :metrics="metrics"
  >
    <AdminTaxonomyCards
      title="Categories"
      subtitle="Category structure for discussions and projects."
      icon="bi-grid"
      item-label="Category"
      :items="categoriesWithCount"
      :is-loading="isLoading"
      show-view
      show-search
      clickable
      @create="openCreateModal"
      @view="openDetailModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @click-item="handleCategoryClick"
    />

    <BaseModal
      v-if="mDetail.isVisible"
      title="Category Details"
      icon="bi bi-eye"
      kicker=""
      @closeModal="closeDetailModal"
    >
      <div v-if="mDetail.isLoading" class="detail-loading">
        <span class="spinner-border spinner-border-sm"></span>
        <span>Loading category details...</span>
      </div>

      <div v-else class="detail-list">
        <div>
          <span>Name</span>
          <strong>{{ mDetail.item?.name }}</strong>
        </div>
        <div v-if="mDetail.item?.type">
          <span>Type</span>
          <strong>{{ mDetail.item.type }}</strong>
        </div>
        <div>
          <span>Description</span>
          <p>{{ mDetail.item?.description }}</p>
        </div>

        <!-- Dynamic Category Blogs List -->
        <div class="category-blogs-section mt-3">
          <span class="blogs-label"
            >Blogs in Category ({{ mDetail.blogs.length }})</span
          >
          <div
            v-if="mDetail.blogs.length === 0"
            class="no-blogs border rounded p-3 text-center text-muted"
          >
            <i class="bi bi-journal-x fs-5 d-block mb-1"></i>
            <span>No articles are currently assigned to this category.</span>
          </div>
          <div
            v-else
            class="modal-blogs-scroll border rounded p-2 d-flex flex-column gap-2"
          >
            <div
              v-for="b in mDetail.blogs"
              :key="b.id"
              class="modal-blog-item d-flex align-items-center gap-3 p-2 rounded border bg-surface"
            >
              <img
                :src="b.image"
                class="rounded object-fit-cover"
                width="40"
                height="40"
                @error.once="handleImgError"
              />
              <div class="flex-grow-1 min-width-0">
                <h6
                  class="m-0 fw-bold text-adaptive text-truncate"
                  style="font-size: 0.84rem"
                >
                  {{ b.title }}
                </h6>
                <small
                  class="text-muted d-block text-truncate"
                  style="font-size: 0.72rem"
                  >By {{ b.author }} • {{ b.date }}</small
                >
              </div>
              <router-link
                :to="'/blog/' + b.id"
                target="_blank"
                class="btn btn-sm btn-link p-0 text-decoration-none text-blue fw-bold flex-shrink-0"
                style="font-size: 0.76rem"
                @click="closeDetailModal"
              >
                View
              </router-link>
            </div>
          </div>
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
          <span>Edit Category</span>
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-if="mForm.isVisible"
      :title="mForm.mode === 'edit' ? 'Edit Category' : 'Create Category'"
      icon="bi bi-grid"
      kicker=""
      @closeModal="closeFormModal"
    >
      <form class="taxonomy-form" @submit.prevent="saveCategory">
        <label>
          <span>Category Name <span class="text-danger">*</span></span>
          <input
            v-model.trim="mForm.data.name"
            class="form-control"
            :class="{ 'is-invalid': errors.categoryName }"
            type="text"
            maxlength="50"
            placeholder="Example: Frontend"
            @input="handleFormInput('categoryName')"
          />
          <small v-if="errors.categoryName" class="field-error">{{
            errors.categoryName
          }}</small>
        </label>
        <label>
          <span>Description <span class="text-danger">*</span></span>
          <textarea
            v-model.trim="mForm.data.description"
            class="form-control"
            :class="{ 'is-invalid': errors.categoryDescription }"
            rows="3"
            placeholder="Explain what belongs in this category"
            @input="handleFormInput('categoryDescription')"
          ></textarea>
          <small v-if="errors.categoryDescription" class="field-error">{{
            errors.categoryDescription
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
            {{ mForm.mode === "edit" ? "Save Changes" : "Create Category" }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Category?"
      icon="bi bi-trash"
      theme="danger"
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Delete <strong>{{ mDelete.item?.name }}</strong
        >? This removes it from the sample admin list.
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
          @click="deleteCategory"
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
import { useRouter } from "vue-router";
import AdminPageShell from "../../components/admin/AdminPageShell.vue";
import AdminTaxonomyCards from "../../components/admin/AdminTaxonomyCards.vue";
import BaseModal from "../../components/base/BaseModal.vue";
import { useToast } from "../../composables/useToast";
import { useRequiredValidator } from "../../composables/useRequiredValidator";
import { useCategoriesStore } from "../../stores/CategoriesStore";
import { useBlogStore } from "../../stores/BlogStore";

const categoryStore = useCategoriesStore();
const { categories, isLoading } = storeToRefs(categoryStore);
const blogStore = useBlogStore();
const router = useRouter();
const toast = useToast();
const { errors, clearError, validateField } = useRequiredValidator();
const DEFAULT_CATEGORY_TYPE = "forum";

const categoriesWithCount = computed(() => {
  const allBlogs = blogStore.ownBlogs || [];
  return categories.value.map((cat) => {
    const count = allBlogs.filter(
      (b) => String(b.category_id) === String(cat.id),
    ).length;
    return {
      ...cat,
      items: count,
    };
  });
});

const metrics = computed(() => [
  {
    label: "Categories",
    value: categories.value.length,
    change: "Loaded from API",
    icon: "bi-grid",
    className: "blue",
  },
  {
    label: "Types",
    value: new Set(
      categories.value.map((category) => category.type).filter(Boolean),
    ).size,
    change: "Returned by API",
    icon: "bi-layers",
    className: "green",
  },
  {
    label: "Described",
    value: categories.value.filter((category) => category.description).length,
    change: "Ready to use",
    icon: "bi-card-text",
    className: "blue",
  },
  {
    label: "Needs Copy",
    value: categories.value.filter((category) => !category.description).length,
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
    type: "",
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
  blogs: [],
});

const handleImgError = (e) => {
  e.target.src =
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800";
};

onMounted(async () => {
  try {
    await categoryStore.fetchCategories();
    await blogStore.fetchAllBlogs();
  } catch (error) {
    console.error("Failed to fetch categories or blogs:", error);
  }
});

const openCreateModal = () => {
  mForm.mode = "create";
  mForm.item = null;
  mForm.editId = null;
  mForm.errorMessage = "";
  clearError("categoryName");
  clearError("categoryDescription");
  mForm.data = { name: "", description: "", type: DEFAULT_CATEGORY_TYPE };
  mForm.isVisible = true;
};

const openEditModal = (category) => {
  if (!category) return;
  mForm.mode = "edit";
  mForm.item = category;
  mForm.editId = category.id;
  mForm.errorMessage = "";
  clearError("categoryName");
  clearError("categoryDescription");
  mForm.data = {
    name: category.name || "",
    description: category.description || "",
    type: category.type || DEFAULT_CATEGORY_TYPE,
  };
  mForm.isVisible = true;
};

const closeFormModal = () => {
  mForm.isVisible = false;
  mForm.item = null;
  mForm.editId = null;
  mForm.errorMessage = "";
  clearError("categoryName");
  clearError("categoryDescription");
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
    "Category request failed.";

  if (String(message).toLowerCase().includes("already")) {
    return "This category name already exists. Please choose a different name.";
  }

  return message;
};

const isCategoryNameTaken = () => {
  const formName = mForm.data.name.trim().toLowerCase();

  return categories.value.some((category) => {
    const sameName =
      String(category.name || "")
        .trim()
        .toLowerCase() === formName;
    const sameCategory = String(category.id) === String(mForm.editId);

    return sameName && !sameCategory;
  });
};

const openDetailModal = async (category) => {
  mDetail.item = category;
  mDetail.blogs = [];
  mDetail.isVisible = true;
  try {
    mDetail.isLoading = true;
    mDetail.item = await categoryStore.fetchCategoryById(category.id);
    mDetail.blogs = await blogStore.fetchBlogsByCategory(category.id);
  } catch (error) {
    console.error("Failed to fetch category details or blogs:", error);
  } finally {
    mDetail.isLoading = false;
  }
};

const closeDetailModal = () => {
  mDetail.isVisible = false;
  mDetail.item = null;
  mDetail.blogs = [];
};

const editFromDetail = () => {
  const category = mDetail.item;
  closeDetailModal();
  openEditModal(category);
};

const openDeleteModal = (category) => {
  mDelete.item = category;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const saveCategory = async () => {
  let successMessage = "";

  try {
    mForm.isLoading = true;
    mForm.errorMessage = "";

    const isNameValid = validateField(
      "categoryName",
      mForm.data.name,
      "Category name is required.",
    );
    const isDescriptionValid = validateField(
      "categoryDescription",
      mForm.data.description,
      "Description is required.",
    );

    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    if (isCategoryNameTaken()) {
      mForm.errorMessage =
        "This category name already exists. Please choose a different name.";
      return;
    }

    if (mForm.mode === "edit") {
      if (!mForm.editId) {
        mForm.errorMessage = "Please select a category to edit again.";
        return;
      }

      const updatePayload = {
        name: mForm.data.name.trim(),
        description: mForm.data.description,
        type: mForm.data.type || DEFAULT_CATEGORY_TYPE,
      };

      await categoryStore.updateCategory(mForm.editId, updatePayload);
      successMessage = "Category updated successfully!";
    } else {
      await categoryStore.createCategory({
        ...mForm.data,
        type: mForm.data.type || DEFAULT_CATEGORY_TYPE,
      });
      successMessage = "Category created successfully!";
    }
  } catch (error) {
    console.error("Failed to save category:", error);
    mForm.errorMessage = getErrorMessage(error);
    return;
  } finally {
    mForm.isLoading = false;
  }

  closeFormModal();
  toast.success(successMessage);

  try {
    await categoryStore.fetchCategories();
  } catch (error) {
    console.error("Failed to refresh categories:", error);
    toast.warning("Saved, but could not refresh categories.");
  }
};

const deleteCategory = async () => {
  try {
    mDelete.isLoading = true;
    await categoryStore.deleteCategory(mDelete.item.id);
    closeDeleteModal();
    toast.success("Category deleted successfully!");

    try {
      await categoryStore.fetchCategories();
    } catch (error) {
      console.error("Failed to refresh categories:", error);
      toast.warning("Deleted, but could not refresh categories.");
    }
  } catch (error) {
    console.error("Failed to delete category:", error);
    const message = error.response?.data?.message || error.message || "Failed to delete category.";
    toast.error(message);
    closeDeleteModal();
  } finally {
    mDelete.isLoading = false;
  }
};

const handleCategoryClick = (category) => {
  router.push(`/admin/categories/${category.id}`);
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
  font-size: 0.88rem;
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

.category-blogs-section {
  display: grid;
  gap: 0.45rem;
}

.blogs-label {
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.no-blogs {
  background: var(--color-input-bg);
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.modal-blogs-scroll {
  max-height: 240px;
  overflow-y: auto;
  background: var(--color-input-bg);
}

.modal-blog-item {
  transition: all var(--transition-fast);
}

.modal-blog-item:hover {
  border-color: var(--color-blue) !important;
  transform: translateY(-1px);
}
</style>
