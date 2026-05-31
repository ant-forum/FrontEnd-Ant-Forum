<template>
  <AdminPageShell
    title="Category Management"
    kicker="Forum Taxonomy"
    subtitle="Organize forum content with readable category cards."
    :metrics="metrics"
  >
    <AdminTaxonomyCards
      title="Categories"
      subtitle="Category structure for discussions and projects."
      icon="bi-grid"
      item-label="Category"
      :items="categories"
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

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
        <label>
          <span>Type</span>
          <input v-model.trim="mForm.data.type" class="form-control" type="text" maxlength="50" placeholder="Example: learning" required>
        </label>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeFormModal">Cancel</button>
          <button class="btn btn-primary" type="submit">
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
      kicker="Confirm Action"
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Delete <strong>{{ mDelete.item?.name }}</strong>? This removes it from the sample admin list.
      </p>
      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" type="button" @click="deleteCategory">
          <i class="bi bi-trash"></i>
          <span>Delete</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { reactive, ref } from 'vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import AdminTaxonomyCards from '../../components/admin/AdminTaxonomyCards.vue';
import BaseModal from '../../components/base/BaseModal.vue';

const metrics = [
  { label: 'Categories', value: '12', change: '4 active groups', icon: 'bi-grid', className: 'blue' },
  { label: 'Visible', value: '10', change: 'Public forum', icon: 'bi-eye', className: 'green' },
  { label: 'Hidden', value: '2', change: 'Admin only', icon: 'bi-eye-slash', className: 'purple' },
  { label: 'Empty', value: '1', change: 'Needs content', icon: 'bi-archive', className: 'orange' },
];

const categories = ref([
  { id: 1, name: 'Frontend', description: 'Vue, CSS, JavaScript, and UI questions.', type: 'Learning', items: 128, colorClass: 'blue' },
  { id: 2, name: 'Backend', description: 'API, database, authentication, and deployment.', type: 'Learning', items: 96, colorClass: 'green' },
  { id: 3, name: 'Showcase', description: 'Project launches, demos, and portfolio feedback.', type: 'Projects', items: 54, colorClass: 'purple' },
  { id: 4, name: 'Announcements', description: 'Official updates and class-wide notices.', type: 'Official', items: 22, colorClass: 'orange' },
]);

const categoryColors = ['blue', 'green', 'purple', 'orange'];

const mForm = reactive({
  isVisible: false,
  mode: 'create',
  item: null,
  data: {
    name: '',
    description: '',
    type: '',
  },
});

const mDelete = reactive({
  isVisible: false,
  item: null,
});

const openCreateModal = () => {
  mForm.mode = 'create';
  mForm.item = null;
  mForm.data = { name: '', description: '', type: '' };
  mForm.isVisible = true;
};

const openEditModal = (category) => {
  mForm.mode = 'edit';
  mForm.item = category;
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

const openDeleteModal = (category) => {
  mDelete.item = category;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const saveCategory = () => {
  if (mForm.mode === 'edit') {
    Object.assign(mForm.item, mForm.data);
  } else {
    const colorClass = categoryColors[categories.value.length % categoryColors.length];
    categories.value.push({ ...mForm.data, id: Date.now(), items: 0, colorClass });
  }
  closeFormModal();
};

const deleteCategory = () => {
  categories.value = categories.value.filter((category) => category.id !== mDelete.item?.id);
  closeDeleteModal();
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
