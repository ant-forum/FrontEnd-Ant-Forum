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
      clickable-rows
      @edit="openEditModal"
      @delete="openDeleteModal"
      @row-click="handleProjectClick"
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

        <!-- Gallery & Media -->
        <div class="field-block">
          <label class="form-label-custom">Gallery & Media</label>
          <p class="text-muted x-small mb-2">Upload a high-quality thumbnail image (max 5 MB) to represent your project.</p>
          <div 
            class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 py-4 position-relative overflow-hidden cursor-pointer"
            :class="{ 'dragging': isEditDragging }"
            @click="triggerEditLogoUpload"
            @dragover.prevent="handleEditDragOver"
            @dragleave="handleEditDragLeave"
            @drop.prevent="handleEditDrop"
            style="min-height: 160px;"
          >
            <div v-if="editLogoPreviewUrl" class="w-100 h-100 position-absolute top-0 start-0 d-flex align-items-center justify-content-center bg-dark">
              <img :src="editLogoPreviewUrl" class="w-100 h-100 object-fit-cover" style="max-height: 100%;" />
              <button
                type="button"
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
                style="width: 24px; height: 24px; z-index: 10;"
                @click.stop="removeEditLogo"
                title="Remove Image"
              >
                <i class="bi bi-x" style="font-size: 1rem;"></i>
              </button>
            </div>
            <div v-else class="d-flex flex-column align-items-center justify-content-center">
              <div class="drop-icon-animated mb-2">
                <i class="bi bi-cloud-arrow-up-fill text-primary" style="font-size: 2rem;"></i>
              </div>
              <h6 class="fw-bold mb-1 text-adaptive small">Drag & Drop Thumbnail Image</h6>
              <p class="text-muted x-small mb-2">PNG, JPG, or WEBP up to 5MB</p>
              <button type="button" class="btn btn-outline-primary rounded-pill px-3 py-1 fw-bold x-small">
                Browse Files
              </button>
            </div>
            <input 
              type="file" 
              ref="editLogoInput" 
              class="d-none" 
              accept="image/*" 
              @change="handleEditLogoChange" 
            />
          </div>
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

    <!-- Create Modal -->
    <BaseModal
      v-if="mCreate.isVisible"
      title="Create New Project"
      icon="bi bi-rocket-takeoff"
      kicker=""
      @closeModal="closeCreateModal"
    >
      <form class="create-project-form" @submit.prevent="handleCreateProject" novalidate>
        <!-- Project Name -->
        <div class="field-block">
          <label class="form-label-custom">Project Name <span class="required text-danger">*</span></label>
          <input 
            v-model="mCreate.data.projectName" 
            class="form-control-modern" 
            type="text" 
            placeholder="e.g., Nexus Core Engine"
            required
          >
        </div>

        <!-- Full Description -->
        <div class="field-block">
          <label class="form-label-custom">Full Description <span class="required text-danger">*</span></label>
          <textarea 
            v-model="mCreate.data.description" 
            class="form-control-modern" 
            rows="5"
            placeholder="Detail the problem it solves and its main features..."
            required
          ></textarea>
        </div>

        <!-- Select Tags -->
        <div class="field-block">
          <label class="form-label-custom">Select Tags <span class="required text-danger">*</span></label>
          <div class="tags-input-container p-2 mb-2">
            <div class="tags-list d-flex flex-wrap gap-2">
              <span
                v-for="(tag, idx) in mCreate.data.tagsList"
                :key="(tag.id || tag.tag_id) + '-' + idx"
                class="badge badge-tag-pill p-2 rounded-3 d-inline-flex align-items-center gap-2"
              >
                {{ tag.name || tag.tag_name }}
                <button
                  type="button"
                  class="btn-close btn-close-white"
                  style="font-size: 0.65rem;"
                  @click="removeCreateTag(idx)"
                ></button>
              </span>
              <span v-if="mCreate.data.tagsList.length === 0" class="text-muted small">
                Please choose one or more tags for your project.
              </span>
            </div>
          </div>
          
          <div class="tag-suggestions d-flex flex-wrap gap-2">
            <button
              v-for="tag in tagsStore.tags"
              :key="tag.id || tag.tag_id"
              type="button"
              class="btn btn-sm tag-btn-pill rounded-pill"
              :disabled="mCreate.data.tag_ids.includes(tag.id || tag.tag_id)"
              @click="addCreateTag(tag)"
            >
              + {{ tag.name || tag.tag_name }}
            </button>
          </div>
        </div>

        <!-- Live Demo URL -->
        <div class="field-block">
          <label class="form-label-custom">Live Demo URL</label>
          <div class="input-group-modern">
            <span class="prefix">https://</span>
            <input 
              v-model="mCreate.data.liveDemoUrl" 
              class="form-control-modern" 
              type="text" 
              placeholder="yourproject.com"
            >
          </div>
        </div>

        <!-- Gallery & Media -->
        <div class="field-block">
          <label class="form-label-custom">Gallery & Media</label>
          <p class="text-muted x-small mb-2">Upload a high-quality thumbnail image (max 5 MB) to represent your project.</p>
          <div 
            class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 py-4 position-relative overflow-hidden cursor-pointer"
            :class="{ 'dragging': isDragging }"
            @click="triggerLogoUpload"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            style="min-height: 160px;"
          >
            <div v-if="logoPreviewUrl" class="w-100 h-100 position-absolute top-0 start-0 d-flex align-items-center justify-content-center bg-dark">
              <img :src="logoPreviewUrl" class="w-100 h-100 object-fit-cover" style="max-height: 100%;" />
              <button
                type="button"
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
                style="width: 24px; height: 24px; z-index: 10;"
                @click.stop="removeLogo"
                title="Remove Image"
              >
                <i class="bi bi-x" style="font-size: 1rem;"></i>
              </button>
            </div>
            <div v-else class="d-flex flex-column align-items-center justify-content-center">
              <div class="drop-icon-animated mb-2">
                <i class="bi bi-cloud-arrow-up-fill text-primary" style="font-size: 2rem;"></i>
              </div>
              <h6 class="fw-bold mb-1 text-adaptive small">Drag & Drop Thumbnail Image</h6>
              <p class="text-muted x-small mb-2">PNG, JPG, or WEBP up to 5MB</p>
              <button type="button" class="btn btn-outline-primary rounded-pill px-3 py-1 fw-bold x-small">
                Browse Files
              </button>
            </div>
            <input 
              type="file" 
              ref="logoInput" 
              class="d-none" 
              accept="image/*" 
              @change="handleLogoChange" 
            />
          </div>
        </div>

        <!-- Submission Agreement Checkbox -->
        <div class="agreement-card-modern p-3 rounded-4 border mb-2" :class="{ 'agreed': agreeToTerms }">
          <div class="form-check d-flex gap-3 align-items-center">
            <input class="form-check-input custom-checkbox" type="checkbox" v-model="agreeToTerms" id="termsCheck" required>
            <label class="form-check-label small text-muted fw-medium lh-sm cursor-pointer" for="termsCheck">
              I confirm that I am the owner of this project and agree to the 
              <router-link to="/terms-of-service" class="text-primary text-decoration-none fw-bold" @click.stop>Developer Terms</router-link>.
            </label>
          </div>
        </div>

        <!-- Publish button -->
        <div class="modal-actions border-top-theme pt-3">
          <button class="btn btn-light border" type="button" @click="closeCreateModal">Cancel</button>
          <button class="btn btn-primary" type="submit" :disabled="!agreeToTerms || isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-rocket-takeoff me-1"></i>
            <span>Publish Project</span>
          </button>
        </div>
      </form>
    </BaseModal>
  </AdminPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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
const router = useRouter();
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
  const pending = allProjects.filter(p => {
    const s = String(p.status || '').toLowerCase();
    return s === 'in review' || s === 'pending';
  }).length;

  return [
    { 
      label: 'Student Projects', 
      value: String(total), 
      change: 'Total submissions', 
      icon: 'bi-folder2', 
      className: 'blue',
      onClick: () => {
        router.push('/showcase');
      }
    },
    { 
      label: 'Published', 
      value: String(published), 
      change: 'Submit Successed', 
      icon: 'bi-cloud-check', 
      className: 'green',
      onClick: () => {
        router.push('/showcase');
      }
    },
    { 
      label: 'Post Project', 
      icon: 'bi-plus-circle', 
      className: 'orange',
      underIconText: 'Create Project',
      hideValue: true,
      onClick: () => {
        mCreate.isVisible = true;
      }
    }
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

const handleProjectClick = (project) => {
  if (project && project.id) {
    router.push(`/showcase/${project.id}`);
  }
};

// Create Logic
const mCreate = reactive({
  isVisible: false,
  data: {
    projectName: '',
    description: '',
    tag_ids: [],
    tagsList: [],
    liveDemoUrl: '',
    thumbnail: null,
    thumbnailUrl: '',
  },
});
const agreeToTerms = ref(false);
const isSubmitting = ref(false);
const logoInput = ref(null);
const isDragging = ref(false);

const addCreateTag = (tag) => {
  const id = tag.id !== undefined && tag.id !== null ? tag.id : tag.tag_id;
  if (id !== undefined && id !== null && !mCreate.data.tag_ids.includes(id)) {
    mCreate.data.tag_ids.push(id);
    mCreate.data.tagsList.push(tag);
  }
};

const removeCreateTag = (index) => {
  mCreate.data.tag_ids.splice(index, 1);
  mCreate.data.tagsList.splice(index, 1);
};

const logoPreviewUrl = computed(() => {
  return mCreate.data.thumbnailUrl || '';
});

const triggerLogoUpload = () => {
  logoInput.value?.click();
};

const handleLogoChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mCreate.data.thumbnail = file;
    mCreate.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mCreate.data.thumbnail = file;
    mCreate.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const removeLogo = () => {
  mCreate.data.thumbnail = null;
  mCreate.data.thumbnailUrl = '';
  if (logoInput.value) {
    logoInput.value.value = '';
  }
};

const closeCreateModal = () => {
  mCreate.isVisible = false;
  mCreate.data = {
    projectName: '',
    description: '',
    tag_ids: [],
    tagsList: [],
    liveDemoUrl: '',
    thumbnail: null,
    thumbnailUrl: '',
  };
  agreeToTerms.value = false;
  if (logoInput.value) {
    logoInput.value.value = '';
  }
};

const handleCreateProject = async () => {
  if (!mCreate.data.projectName || !mCreate.data.description) {
    toast.error("Project name and description are required.");
    return;
  }
  if (mCreate.data.tag_ids.length === 0) {
    toast.error("Please select at least one tag.");
    return;
  }
  if (!agreeToTerms.value) {
    toast.error("Please confirm ownership and agree to the Developer Terms.");
    return;
  }

  isSubmitting.value = true;
  try {
    if (!mCreate.data.thumbnail) {
      try {
        const response = await fetch("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600");
        const blob = await response.blob();
        mCreate.data.thumbnail = new File([blob], "default-thumbnail.jpg", { type: "image/jpeg" });
      } catch (err) {
        const byteString = atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const placeholderBlob = new Blob([ab], { type: "image/png" });
        mCreate.data.thumbnail = new File([placeholderBlob], "default-thumbnail.png", { type: "image/png" });
      }
    }

    await projectStore.createProject({
      projectName: mCreate.data.projectName,
      description: mCreate.data.description,
      liveDemoUrl: mCreate.data.liveDemoUrl,
      tag_ids: mCreate.data.tag_ids,
      thumbnail: mCreate.data.thumbnail,
      status: 'Active',
    });
    
    toast.success("Project published successfully!");
    closeCreateModal();
    isPageLoading.value = true;
    await projectStore.fetchProjects();
  } catch (error) {
    console.error("Failed to create project:", error);
    const errorMsg = error.message || error.msg || 'An error occurred while publishing the project.';
    toast.error(errorMsg);
  } finally {
    isSubmitting.value = false;
    isPageLoading.value = false;
  }
};

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
    thumbnail: null,
    thumbnailUrl: '',
  },
});

const isSaveDisabled = computed(() => {
  if (!mEdit.item) return true;

  const currentTitle = (mEdit.data.title || '').trim();
  const currentDescription = (mEdit.data.description || '').trim();
  const currentLink = (mEdit.data.link || '').trim();
  const currentTags = [...mEdit.data.tag_ids].sort().join(',');

  if (!currentTitle || !currentDescription) {
    return true;
  }

  const originalTagsList = Array.isArray(mEdit.item.rawTags) ? mEdit.item.rawTags : [];
  const originalTagIds = originalTagsList.map(t => t.id !== undefined && t.id !== null ? t.id : t.tag_id).filter(Boolean);
  const originalTagsStr = originalTagIds.sort().join(',');

  const originalTitle = (mEdit.item.name || '').trim();
  const originalDescription = (mEdit.item.rawDescription || '').trim();
  const originalLink = (mEdit.item.rawLink || '').trim();

  const isUnchanged =
    currentTitle === originalTitle &&
    currentDescription === originalDescription &&
    currentLink === originalLink &&
    currentTags === originalTagsStr &&
    !mEdit.data.thumbnail;

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
    thumbnail: null,
    thumbnailUrl: mappedProject.avatar || '',
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
      mEdit.data.thumbnail = null;
      mEdit.data.thumbnailUrl = freshProject.thumbnail || freshProject.image || '';

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

const editLogoInput = ref(null);
const isEditDragging = ref(false);

const editLogoPreviewUrl = computed(() => {
  return mEdit.data.thumbnailUrl || '';
});

const triggerEditLogoUpload = () => {
  editLogoInput.value?.click();
};

const handleEditLogoChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mEdit.data.thumbnail = file;
    mEdit.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const handleEditDragOver = () => {
  isEditDragging.value = true;
};

const handleEditDragLeave = () => {
  isEditDragging.value = false;
};

const handleEditDrop = (event) => {
  isEditDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }
    mEdit.data.thumbnail = file;
    mEdit.data.thumbnailUrl = URL.createObjectURL(file);
  }
};

const removeEditLogo = () => {
  mEdit.data.thumbnail = null;
  mEdit.data.thumbnailUrl = '';
  if (editLogoInput.value) {
    editLogoInput.value.value = '';
  }
};

const closeEditModal = () => {
  mEdit.isVisible = false;
  mEdit.item = null;
  mEdit.data = {
    title: '',
    description: '',
    link: '',
    tag_ids: [],
    status: 'In Review',
    thumbnail: null,
    thumbnailUrl: '',
  };
  if (editLogoInput.value) {
    editLogoInput.value.value = '';
  }
};

const handleUpdateProject = async () => {
  isEditSubmitted.value = true;

  const isTitleValid = validateField('title', mEdit.data.title, 'Project title is required.');
  const isDescriptionValid = validateField('description', mEdit.data.description, 'Description is required.');

  if (!isTitleValid || !isDescriptionValid) {
    toast.error('Please fix the validation errors before saving.');
    return;
  }

  try {
    await projectStore.updateProject(mEdit.item.id, {
      title: mEdit.data.title,
      description: mEdit.data.description,
      link: mEdit.data.link,
      tag_ids: mEdit.data.tag_ids,
      thumbnail: mEdit.data.thumbnail,
      status: 'Active',
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

/* Scoped deep modal styling */
:deep(.modal-dialog) {
  max-width: 650px;
}

.create-project-form {
  display: grid;
  gap: 1.1rem;
}

.form-label-custom {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 6px;
  display: block;
}

.form-control-modern {
  width: 100%;
  padding: 10px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.form-control-modern:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.input-group-modern {
  display: flex;
  align-items: center;
}

.input-group-modern .prefix {
  padding: 10px 14px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 10px 0 0 10px;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.input-group-modern .form-control-modern {
  border-radius: 0 10px 10px 0;
}

.tags-input-container {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  min-height: 48px;
}

.badge-tag-pill {
  font-size: 0.78rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  color: #fff !important;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}

.tag-btn-pill {
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.tag-btn-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

/* Upload Elements Modern */
.screenshot-dropzone-modern {
  border: 2px dashed var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg);
}

.screenshot-dropzone-modern:hover {
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.screenshot-dropzone-modern.dragging {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary-light) !important;
}

.drop-icon-animated {
  animation: float-modal 3s ease-in-out infinite;
}

@keyframes float-modal {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.border-dashed-modern {
  border-style: dashed !important;
}

/* Agreement Card */
.agreement-card-modern {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.agreement-card-modern.agreed {
  background: var(--color-primary-light);
  border-color: var(--color-primary) !important;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
}

.border-top-theme {
  border-top: 1px solid var(--color-border);
}

.x-small {
  font-size: 0.82rem;
}
</style>
