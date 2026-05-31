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
      @create="openCreateModal"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <BaseModal
      v-if="mForm.isVisible"
      :title="mForm.mode === 'edit' ? 'Edit Tag' : 'Create Tag'"
      icon="bi bi-tag"
      kicker="Forum Taxonomy"
      @closeModal="closeFormModal"
    >
      <form class="taxonomy-form" @submit.prevent="saveTag">
        <label>
          <span>Tag Name</span>
          <input v-model.trim="mForm.data.name" class="form-control" type="text" maxlength="40" placeholder="Example: Vue" required>
        </label>
        <label>
          <span>Description</span>
          <textarea v-model.trim="mForm.data.description" class="form-control" rows="3" placeholder="Explain when this tag should be used" required></textarea>
        </label>
        <label>
          <span>Group</span>
          <input v-model.trim="mForm.data.owner" class="form-control" type="text" maxlength="50" placeholder="Example: Frontend" required>
        </label>
        <label>
          <span>Color</span>
          <select v-model="mForm.data.colorClass" class="form-select">
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
          </select>
        </label>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeFormModal">Cancel</button>
          <button class="btn btn-primary" type="submit">
            {{ mForm.mode === 'edit' ? 'Save Changes' : 'Create Tag' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Tag?"
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
        <button class="btn btn-danger" type="button" @click="deleteTag">
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
  { label: 'Tags', value: '38', change: 'Healthy library', icon: 'bi-tags', className: 'blue' },
  { label: 'Popular', value: '11', change: 'Used weekly', icon: 'bi-star', className: 'green' },
  { label: 'Unused', value: '5', change: 'Review soon', icon: 'bi-inbox', className: 'orange' },
  { label: 'Merged', value: '3', change: 'This month', icon: 'bi-intersect', className: 'purple' },
];

const tags = ref([
  { id: 1, name: 'Vue', description: 'Component, routing, and state management topics.', items: 74, owner: 'Frontend', colorClass: 'green' },
  { id: 2, name: 'Laravel', description: 'API, controller, and backend integration topics.', items: 61, owner: 'Backend', colorClass: 'blue' },
  { id: 3, name: 'Bug Fix', description: 'Reports and troubleshooting discussions.', items: 43, owner: 'Moderation', colorClass: 'orange' },
  { id: 4, name: 'Portfolio', description: 'Student showcase and career-ready posts.', items: 27, owner: 'Showcase', colorClass: 'purple' },
]);

const mForm = reactive({
  isVisible: false,
  mode: 'create',
  item: null,
  data: {
    name: '',
    description: '',
    owner: '',
    colorClass: 'blue',
  },
});

const mDelete = reactive({
  isVisible: false,
  item: null,
});

const openCreateModal = () => {
  mForm.mode = 'create';
  mForm.item = null;
  mForm.data = { name: '', description: '', owner: '', colorClass: 'blue' };
  mForm.isVisible = true;
};

const openEditModal = (tag) => {
  mForm.mode = 'edit';
  mForm.item = tag;
  mForm.data = { ...tag };
  mForm.isVisible = true;
};

const closeFormModal = () => {
  mForm.isVisible = false;
  mForm.item = null;
};

const openDeleteModal = (tag) => {
  mDelete.item = tag;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const saveTag = () => {
  if (mForm.mode === 'edit') {
    Object.assign(mForm.item, mForm.data);
  } else {
    tags.value.push({ ...mForm.data, id: Date.now(), items: 0 });
  }
  closeFormModal();
};

const deleteTag = () => {
  tags.value = tags.value.filter((tag) => tag.id !== mDelete.item?.id);
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
