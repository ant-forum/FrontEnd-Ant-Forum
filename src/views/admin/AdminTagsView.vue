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
        <button class="btn btn-light border" type="button" @click="closeDetailModal">Close</button>
        <button v-if="!mDetail.isLoading" class="btn btn-primary" type="button" @click="editFromDetail">
          <i class="bi bi-pencil"></i>
          <span>Edit Tag</span>
        </button>
      </div>
    </BaseModal>

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
        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeFormModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="mForm.isLoading">
            <span v-if="mForm.isLoading" class="spinner-border spinner-border-sm"></span>
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
        Delete <strong>{{ mDelete.item?.name }}</strong>? This action cannot be undone.
      </p>
      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" type="button" :disabled="mDelete.isLoading" @click="deleteTag">
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
import { useTagsStore } from '../../stores/TagsStore';

const tagStore = useTagsStore();
const { tags, isLoading } = storeToRefs(tagStore);
const toast = useToast();

const metrics = computed(() => [
  { label: 'Tags', value: tags.value.length, change: 'Loaded from API', icon: 'bi-tags', className: 'blue' },
  { label: 'Described', value: tags.value.filter((tag) => tag.description).length, change: 'Ready to use', icon: 'bi-card-text', className: 'green' },
  { label: 'Needs Copy', value: tags.value.filter((tag) => !tag.description).length, change: 'Missing description', icon: 'bi-pencil', className: 'orange' },
  { label: 'Source', value: 'API', change: 'Live tag records', icon: 'bi-cloud-check', className: 'purple' },
]);

const mForm = reactive({
  isVisible: false,
  mode: 'create',
  item: null,
  isLoading: false,
  data: {
    name: '',
    description: '',
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
    console.error('Failed to fetch tags:', error);
  }
});

const openCreateModal = () => {
  mForm.mode = 'create';
  mForm.item = null;
  mForm.data = { name: '', description: '' };
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

const openDetailModal = async (tag) => {
  mDetail.item = tag;
  mDetail.isVisible = true;
  try {
    mDetail.isLoading = true;
    mDetail.item = await tagStore.fetchTagById(tag.id);
  } catch (error) {
    console.error('Failed to fetch tag details:', error);
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
  try {
    mForm.isLoading = true;
    if (mForm.mode === 'edit') {
      await tagStore.updateTag(mForm.item.id, mForm.data);
      toast.success('Tag updated successfully!');
    } else {
      await tagStore.createTag(mForm.data);
      toast.success('Tag created successfully!');
    }
    closeFormModal();
  } catch (error) {
    console.error('Failed to save tag:', error);
  } finally {
    mForm.isLoading = false;
  }
};

const deleteTag = async () => {
  try {
    mDelete.isLoading = true;
    await tagStore.deleteTag(mDelete.item.id);
    toast.success('Tag deleted successfully!');
    closeDeleteModal();
  } catch (error) {
    console.error('Failed to delete tag:', error);
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

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
