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
      :items="categories"
      :is-loading="isLoading"
      show-view
      @create="openCreateModal"
      @view="openDetailModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <BaseModal
      v-if="mDetail.isVisible"
      title="Category Details"
      icon="bi bi-eye"
      kicker="Forum Taxonomy"
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
      </div>

      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDetailModal">Close</button>
        <button v-if="!mDetail.isLoading" class="btn btn-primary" type="button" @click="editFromDetail">
          <i class="bi bi-pencil"></i>
          <span>Edit Category</span>
        </button>
      </div>
    </BaseModal>

    <BaseModal
      v-if="mForm.isVisible"
      :title="mForm.mode === 'edit' ? 'Edit Category' : 'Create Category'"
      icon="bi bi-grid"
      kicker="Forum Taxonomy"
      @closeModal="closeFormModal"
    >
      <form class="taxonomy-form" @submit.prevent="saveCategory">
        <label>
          <span>Category Name</span>
          <input v-model.trim="mForm.data.name" class="form-control" type="text" maxlength="50" placeholder="Example: Frontend" required>
        </label>
        <label>
          <span>Description</span>
          <textarea v-model.trim="mForm.data.description" class="form-control" rows="3" placeholder="Explain what belongs in this category" required></textarea>
        </label>
        <div class="type-field">
          <span>Type</span>
          <div class="type-mode" role="group" aria-label="Category type source">
            <button
              class="type-mode-btn"
              :class="{ active: mForm.typeMode === 'existing' }"
              type="button"
              @click="selectTypeMode('existing')"
            >
              <i class="bi bi-list-check"></i>
              Existing Type
            </button>
            <button
              class="type-mode-btn"
              :class="{ active: mForm.typeMode === 'new' }"
              type="button"
              @click="selectTypeMode('new')"
            >
              <i class="bi bi-plus-lg"></i>
              New Type
            </button>
          </div>

          <select v-if="mForm.typeMode === 'existing'" v-model="mForm.typeOption" class="form-select" required>
            <option value="" disabled>Select an existing type</option>
            <option v-for="type in categoryTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <input
            v-else
            v-model.trim="mForm.data.type"
            class="form-control"
            type="text"
            maxlength="50"
            placeholder="Enter a new category type"
            required
          >
          <small>{{ mForm.typeMode === 'existing' ? 'Reuse a type to keep categories organized.' : 'Create a type only when the category needs a new group.' }}</small>
        </div>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeFormModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="mForm.isLoading">
            <span v-if="mForm.isLoading" class="spinner-border spinner-border-sm"></span>
            {{ mForm.mode === 'edit' ? 'Save Changes' : 'Create Category' }}
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
        Delete <strong>{{ mDelete.item?.name }}</strong>? This removes it from the sample admin list.
      </p>
      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" type="button" :disabled="mDelete.isLoading" @click="deleteCategory">
          <span v-if="mDelete.isLoading" class="spinner-border spinner-border-sm"></span>
          <i class="bi bi-trash"></i>
          <span>Delete</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminTaxonomyCards from '../../components/admin/AdminTaxonomyCards.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useToast } from '../../composables/useToast';
import { useCategoriesStore } from '../../stores/CategoriesStore';

const categoryStore = useCategoriesStore();
const { categories, isLoading } = storeToRefs(categoryStore);
const toast = useToast();

const categoryTypes = computed(() => {
  const apiTypes = categories.value.map((category) => category.type).filter(Boolean);
  return [...new Set(['forum', 'blog', 'project', ...apiTypes])];
});

const metrics = computed(() => [
  { label: 'Categories', value: categories.value.length, change: 'Loaded from API', icon: 'bi-grid', className: 'blue' },
  { label: 'Types', value: new Set(categories.value.map((category) => category.type).filter(Boolean)).size, change: 'Returned by API', icon: 'bi-layers', className: 'green' },
  { label: 'Described', value: categories.value.filter((category) => category.description).length, change: 'Ready to use', icon: 'bi-card-text', className: 'purple' },
  { label: 'Needs Copy', value: categories.value.filter((category) => !category.description).length, change: 'Missing description', icon: 'bi-pencil', className: 'orange' },
]);

const mForm = reactive({
  isVisible: false,
  mode: 'create',
  item: null,
  isLoading: false,
  typeMode: 'existing',
  typeOption: '',
  data: {
    name: '',
    description: '',
    type: '',
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
    await categoryStore.fetchCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
});

const openCreateModal = () => {
  mForm.mode = 'create';
  mForm.item = null;
  mForm.typeMode = 'existing';
  mForm.typeOption = categoryTypes.value[0] ?? '';
  mForm.data = { name: '', description: '', type: '' };
  mForm.isVisible = true;
};

const openEditModal = (category) => {
  mForm.mode = 'edit';
  mForm.item = category;
  mForm.typeMode = 'existing';
  mForm.typeOption = category.type;
  mForm.data = {
    name: category.name,
    description: category.description,
    type: category.type,
  };
  mForm.isVisible = true;
};

const closeFormModal = () => {
  mForm.isVisible = false;
  mForm.item = null;
};

const openDetailModal = async (category) => {
  mDetail.item = category;
  mDetail.isVisible = true;
  try {
    mDetail.isLoading = true;
    mDetail.item = await categoryStore.fetchCategoryById(category.id);
  } catch (error) {
    console.error('Failed to fetch category details:', error);
  } finally {
    mDetail.isLoading = false;
  }
};

const closeDetailModal = () => {
  mDetail.isVisible = false;
  mDetail.item = null;
};

const editFromDetail = () => {
  const category = mDetail.item;
  closeDetailModal();
  openEditModal(category);
};

const selectTypeMode = (mode) => {
  mForm.typeMode = mode;
  if (mode === 'existing') {
    mForm.typeOption = categoryTypes.value[0] ?? '';
  } else {
    mForm.data.type = '';
  }
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
  try {
    mForm.isLoading = true;
    const payload = {
      ...mForm.data,
      type: mForm.typeMode === 'new' ? mForm.data.type : mForm.typeOption,
    };
    if (mForm.mode === 'edit') {
      await categoryStore.updateCategory(mForm.item.id, payload);
      toast.success('Category updated successfully!');
    } else {
      await categoryStore.createCategory(payload);
      toast.success('Category created successfully!');
    }
    closeFormModal();
  } catch (error) {
    console.error('Failed to save category:', error);
  } finally {
    mForm.isLoading = false;
  }
};

const deleteCategory = async () => {
  try {
    mDelete.isLoading = true;
    await categoryStore.deleteCategory(mDelete.item.id);
    toast.success('Category deleted successfully!');
    closeDeleteModal();
  } catch (error) {
    console.error('Failed to delete category:', error);
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

.type-field {
  display: grid;
  gap: 0.55rem;
}

.type-field > span {
  color: var(--color-text);
  font-size: 0.84rem;
  font-weight: 800;
}

.type-field small {
  color: var(--color-text-muted);
  font-size: 0.74rem;
}

.type-mode {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  padding: 0.3rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.type-mode-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 38px;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 800;
}

.type-mode-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.type-mode-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
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

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
