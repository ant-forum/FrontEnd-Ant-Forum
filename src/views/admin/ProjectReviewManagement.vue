<template>
  <AdminPageShell
    title="Project Management"
    kicker="Student Projects"
    subtitle="Review and manage student project submissions, status, and details."
    :metrics="metrics"
  >
    <AdminListPanel
      title="All Projects"
      subtitle="A clean table for managing project submissions."
      placeholder="Search projects"
      item-label="projects"
      empty-title="No projects yet"
      empty-description="Student project showcase submissions will appear here."
      :columns="columns"
      :rows="mappedProjects"
      :is-loading="isPageLoading"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Edit Modal -->
    <BaseModal
      v-if="mEdit.isVisible"
      title="Edit Project"
      icon="bi bi-pencil"
      kicker=""
      @closeModal="closeEditModal"
    >
      <form class="edit-project-form" @submit.prevent="handleUpdateProject" novalidate>
        <div class="field-block">
          <label>Project Title</label>
          <input 
            v-model="mEdit.data.title" 
            class="form-control" 
            :class="{ 'is-invalid': errors.title }" 
            type="text" 
            placeholder="Enter project title"
            @input="handleEditInput('title')"
          >
          <div v-if="errors.title" class="invalid-feedback d-block">{{ errors.title }}</div>
        </div>

        <div class="field-block">
          <label>Description</label>
          <textarea 
            v-model="mEdit.data.description" 
            class="form-control" 
            :class="{ 'is-invalid': errors.description }" 
            rows="4"
            placeholder="Enter project description"
            @input="handleEditInput('description')"
          ></textarea>
          <div v-if="errors.description" class="invalid-feedback d-block">{{ errors.description }}</div>
        </div>

        <div class="field-block">
          <label>Live Demo URL</label>
          <input 
            v-model="mEdit.data.link" 
            class="form-control" 
            type="text" 
            placeholder="https://example.com"
          >
        </div>

        <div class="field-block">
          <label class="mb-2 fw-bold text-adaptive">Project Tags</label>
          <div class="tags-checkbox-grid">
            <div v-for="tag in tagsStore.tags" :key="tag.id || tag.tag_id" class="form-check-custom">
              <input 
                type="checkbox" 
                :id="'tag-' + (tag.id || tag.tag_id)" 
                :value="tag.id || tag.tag_id" 
                v-model="mEdit.data.tag_ids" 
                class="form-check-input"
              >
              <label class="form-check-label ms-2 cursor-pointer" :for="'tag-' + (tag.id || tag.tag_id)">
                {{ tag.name || tag.tag_name }}
              </label>
            </div>
          </div>
        </div>

        <div class="field-block">
          <label class="mb-2 fw-bold text-adaptive">Project Status</label>
          <select 
            v-model="mEdit.data.status" 
            class="form-select"
          >
            <option value="In Review">In Review</option>
            <option value="Published">Published</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="btn btn-light border" type="button" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="projectStore.isLoading || isSaveDisabled">
            <span v-if="projectStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-check-lg me-1"></i>
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Modal -->
    <BaseModal
      v-if="mDelete.isVisible"
      title="Delete Project"
      icon="bi bi-trash"
      theme="danger"
      kicker=""
      @closeModal="closeDeleteModal"
    >
      <p class="delete-message">
        Are you sure you want to delete the project <strong>{{ mDelete.item?.name }}</strong>?
        This action will permanently delete this project submission and all associated details from the system.
      </p>
      <div class="modal-actions">
        <button class="btn btn-light border" type="button" @click="closeDeleteModal">Cancel</button>
        <button class="btn btn-danger" type="button" :disabled="projectStore.isLoading" @click="handleDeleteProject">
          <span v-if="projectStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <i class="bi bi-trash me-1"></i>
          <span>Confirm Delete</span>
        </button>
      </div>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import AdminListPanel from '../../components/admin/AdminListPanel.vue';
import AdminPageShell from '../../components/admin/AdminPageShell.vue';
import BaseModal from '../../components/base/BaseModal.vue';
import { useProjectStore } from '../../stores/ProjectStore';
import { useTagsStore } from '../../stores/TagsStore';
import { useToast } from '../../composables/useToast';
import { useRequiredValidator } from '../../composables/useRequiredValidator';

const projectStore = useProjectStore();
const tagsStore = useTagsStore();
const toast = useToast();
const isEditSubmitted = ref(false);
const isPageLoading = ref(true);
const {
  errors,
  clearError,
  validateField
} = useRequiredValidator();

const handleEditInput = (field) => {
  if (isEditSubmitted.value) {
    if (field === 'title') validateField('title', mEdit.data.title, 'Project title is required.');
    if (field === 'description') validateField('description', mEdit.data.description, 'Description is required.');
  } else {
    clearError(field);
  }
};

const columns = [
  { key: 'name', label: 'Project Title' },
  { key: 'authorName', label: 'Author' },
  { key: 'tags', label: 'Tags' },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'created', label: 'Submitted' },
];

const formatJoinedDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const mappedProjects = computed(() => {
  return (projectStore.projects || []).map((p) => {
    const tagListStr = Array.isArray(p.tags) ? p.tags.join(', ') : '';
    let displayStatus = p.status || 'In Review';
    if (String(displayStatus).toLowerCase() === 'active') {
      displayStatus = 'Published';
    }
    return {
      id: p.id,
      name: p.title || 'Untitled Project',
      detail: p.description || 'No description',
      authorName: p.author?.name || 'Unknown',
      tags: tagListStr || 'None',
      status: displayStatus,
      created: formatJoinedDate(p.createdAt || p.created_at),
      avatar: p.thumbnail || p.image || '',
      rawTags: p.tag || p.tagsList || [],
      rawLink: p.link || '',
      rawDescription: p.description || '',
    };
  });
});

const metrics = computed(() => {
  const allProjects = projectStore.projects || [];
  const total = allProjects.length;
  const published = allProjects.filter(p => {
    const s = String(p.status || '').toLowerCase();
    return s === 'published' || s === 'active';
  }).length;

  return [
    { label: 'Student Projects', value: String(total), change: 'Total submissions', icon: 'bi-folder2', className: 'blue' },
    { label: 'Published', value: String(published), change: 'Approved work', icon: 'bi-cloud-check', className: 'green' }
  ];
});

onMounted(async () => {
  try {
    isPageLoading.value = true;
    await projectStore.fetchProjects();
    await tagsStore.fetchTags();
  } catch (error) {
    console.error('Failed to load projects:', error);
    toast.error('Could not load student projects from the server.');
  } finally {
    isPageLoading.value = false;
  }
});

// Edit Logic
const mEdit = reactive({
  isVisible: false,
  item: null,
  data: {
    title: '',
    description: '',
    link: '',
    tag_ids: [],
    status: 'In Review',
  },
});

const isSaveDisabled = computed(() => {
  if (!mEdit.item) return true;

  const currentTitle = (mEdit.data.title || '').trim();
  const currentDescription = (mEdit.data.description || '').trim();
  const currentLink = (mEdit.data.link || '').trim();
  const currentTags = [...mEdit.data.tag_ids].sort().join(',');
  const currentStatus = mEdit.data.status || 'In Review';

  if (!currentTitle || !currentDescription) {
    return true;
  }

  const originalTagsList = Array.isArray(mEdit.item.rawTags) ? mEdit.item.rawTags : [];
  const originalTagIds = originalTagsList.map(t => t.id !== undefined && t.id !== null ? t.id : t.tag_id).filter(Boolean);
  const originalTagsStr = originalTagIds.sort().join(',');

  const originalTitle = (mEdit.item.name || '').trim();
  const originalDescription = (mEdit.item.rawDescription || '').trim();
  const originalLink = (mEdit.item.rawLink || '').trim();
  const originalStatus = mEdit.item.status || 'In Review';

  const isUnchanged =
    currentTitle === originalTitle &&
    currentDescription === originalDescription &&
    currentLink === originalLink &&
    currentTags === originalTagsStr &&
    currentStatus === originalStatus;

  return isUnchanged;
});

const openEditModal = async (mappedProject) => {
  isEditSubmitted.value = false;
  clearError('title');
  clearError('description');
  mEdit.item = mappedProject;
  
  const tagsList = Array.isArray(mappedProject.rawTags) ? mappedProject.rawTags : [];
  const tagIds = tagsList.map(t => t.id !== undefined && t.id !== null ? t.id : t.tag_id).filter(Boolean);

  // Pre-populate using mapped user data first
  mEdit.data = {
    title: mappedProject.name,
    description: mappedProject.rawDescription,
    link: mappedProject.rawLink,
    tag_ids: tagIds,
    status: mappedProject.status || 'In Review',
  };
  mEdit.isVisible = true;

  try {
    const freshProject = await projectStore.fetchProject(mappedProject.id);
    if (freshProject) {
      // Re-map tags if it exists, matching structural details
      const rawTags = Array.isArray(freshProject.tag) ? freshProject.tag : [];
      const freshTagIds = rawTags.map(t => t.id !== undefined && t.id !== null ? t.id : t.tag_id).filter(Boolean);
      
      let displayStatus = freshProject.status || 'In Review';
      if (String(displayStatus).toLowerCase() === 'active') {
        displayStatus = 'Published';
      }
      
      mEdit.data.title = freshProject.title || '';
      mEdit.data.description = freshProject.description || '';
      mEdit.data.link = freshProject.link || '';
      mEdit.data.tag_ids = freshTagIds;
      mEdit.data.status = displayStatus;

      mEdit.item = {
        ...mEdit.item,
        name: freshProject.title || '',
        rawDescription: freshProject.description || '',
        rawLink: freshProject.link || '',
        rawTags: rawTags,
        status: displayStatus
      };
    }
  } catch (error) {
    console.error('Failed to load project details:', error);
    toast.error('Failed to load project details from the server.');
  }
};

const closeEditModal = () => {
  mEdit.isVisible = false;
  mEdit.item = null;
};

const handleUpdateProject = async () => {
  isEditSubmitted.value = true;

  const isTitleValid = validateField('title', mEdit.data.title, 'Project title is required.');
  const isDescriptionValid = validateField('description', mEdit.data.description, 'Description is required.');

  if (!isTitleValid || !isDescriptionValid) {
    toast.error('Please fix the validation errors before saving.');
    return;
  }

  let finalStatus = mEdit.data.status;
  if (finalStatus === 'Published') {
    finalStatus = 'Active';
  }

  try {
    await projectStore.updateProject(mEdit.item.id, {
      title: mEdit.data.title,
      description: mEdit.data.description,
      link: mEdit.data.link,
      tag_ids: mEdit.data.tag_ids,
      status: finalStatus,
    });
    toast.success('Project updated successfully!');
    closeEditModal();
    isPageLoading.value = true;
    await projectStore.fetchProjects();
  } catch (error) {
    console.error('Failed to update project:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while updating the project.';
    toast.error(errorMsg);
  } finally {
    isPageLoading.value = false;
  }
};

// Delete Logic
const mDelete = reactive({
  isVisible: false,
  item: null,
});

const openDeleteModal = (mappedProject) => {
  mDelete.item = mappedProject;
  mDelete.isVisible = true;
};

const closeDeleteModal = () => {
  mDelete.isVisible = false;
  mDelete.item = null;
};

const handleDeleteProject = async () => {
  try {
    await projectStore.deleteProject(mDelete.item.id);
    toast.success('Project deleted successfully!');
    closeDeleteModal();
    isPageLoading.value = true;
    await projectStore.fetchProjects();
  } catch (error) {
    console.error('Failed to delete project:', error);
    const errorMsg = error.message || error.msg || 'An error occurred while deleting the project.';
    toast.error(errorMsg);
  } finally {
    isPageLoading.value = false;
  }
};
</script>

<style scoped>
.edit-project-form {
  display: grid;
  gap: 0.85rem;
}

.field-block {
  display: grid;
  gap: 0.4rem;
}

.field-block label {
  color: var(--color-text);
  font-size: 0.88rem;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1rem;
}

.delete-message {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin: 0 0 1.25rem;
  line-height: 1.5;
}

.delete-message strong {
  color: var(--color-text);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* Remove Bootstrap's default validation background icons */
.form-control.is-invalid {
  background-image: none !important;
  border-color: var(--color-danger) !important;
  padding-right: 0.75rem !important;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  border-color: var(--color-danger) !important;
}

/* Reduce spacing between input and validation error message */
.invalid-feedback {
  margin-top: -0.3rem !important;
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 700;
}

.tags-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg);
}

.form-check-custom {
  display: flex;
  align-items: center;
}

.text-adaptive {
  color: var(--color-text) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
