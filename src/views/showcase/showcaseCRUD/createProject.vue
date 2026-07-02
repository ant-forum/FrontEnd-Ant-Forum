<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import Navbar from "../../../components/layouts/header.vue";
import Footer from "../../../components/layouts/footer.vue";
import { useProjectStore } from "../../../stores/ProjectStore.js";
import { useTagsStore } from "../../../stores/TagsStore.js";
import { useToast } from "../../../composables/useToast.js";

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const tagsStore = useTagsStore();
const toast = useToast();
const { createForm: form } = storeToRefs(projectStore);

const logoInput = ref(null);
const isDragging = ref(false);
const agreeToTerms = ref(false);
const isSubmitting = ref(false);

const isEditMode = computed(() => route.name === "EditProject");

const guidelines = [
  {
    title: "Technical Accuracy",
    desc: "Ensure all repository and demo links are functional and public.",
    icon: "bi-check-circle",
  },
  {
    title: "Clear Description",
    desc: "A well-written description helps other developers and teachers understand your work.",
    icon: "bi-file-text",
  },
  {
    title: "Visual Representation",
    desc: "Upload a clear, high-quality logo or screenshot as your project thumbnail.",
    icon: "bi-image",
  },
];

onMounted(async () => {
  if (tagsStore.tags.length === 0) {
    await tagsStore.fetchTags();
  }

  if (isEditMode.value) {
    const projectId = route.params.id;
    await projectStore.fetchProject(projectId);
    const p = projectStore.project;
    if (p) {
      form.value.projectName = p.title || p.projectName || "";
      form.value.description = p.description || "";
      form.value.liveDemoUrl = p.link || p.liveDemoUrl || "";
      form.value.thumbnailUrl = p.thumbnail || p.image || "";

      // Map tags
      if (p.tag && Array.isArray(p.tag)) {
        form.value.tag_ids = p.tag
          .map((t) => (t.id !== undefined && t.id !== null ? t.id : t.tag_id))
          .filter(Boolean);
        form.value.tagsList = p.tag.map((t) => ({
          id: t.id !== undefined && t.id !== null ? t.id : t.tag_id,
          name: t.name || t.tag_name,
          tag_name: t.name || t.tag_name,
        }));
      } else if (p.tags && Array.isArray(p.tags)) {
        form.value.tagsList = p.tags.map((tagName) => {
          const matchedTag = tagsStore.tags.find(
            (t) => (t.name || t.tag_name) === tagName,
          );
          return matchedTag || { id: null, name: tagName };
        });
        form.value.tag_ids = form.value.tagsList
          .map((t) => t.id)
          .filter(Boolean);
      }
    }
  } else {
    projectStore.resetCreateForm();
  }
});

const addTag = (tag) => {
  const id = tag.id !== undefined && tag.id !== null ? tag.id : tag.tag_id;
  if (id !== undefined && id !== null && !form.value.tag_ids.includes(id)) {
    form.value.tag_ids.push(id);
    form.value.tagsList.push(tag);
  }
};

const removeTag = (index) => {
  form.value.tag_ids.splice(index, 1);
  form.value.tagsList.splice(index, 1);
};

const logoPreviewUrl = computed(() => {
  return form.value.thumbnailUrl || "";
});

const triggerLogoUpload = () => {
  logoInput.value?.click();
};

const handleLogoChange = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5 MB.");
      return;
    }
    form.value.thumbnail = file;
    form.value.thumbnailUrl = URL.createObjectURL(file);
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
      alert("Image file size must be less than 5 MB.");
      return;
    }
    form.value.thumbnail = file;
    form.value.thumbnailUrl = URL.createObjectURL(file);
  }
};

const removeLogo = () => {
  form.value.thumbnail = null;
  form.value.thumbnailUrl = "";
  if (logoInput.value) {
    logoInput.value.value = "";
  }
};

const handleCancel = () => {
  projectStore.resetCreateForm();
  router.push("/showcase");
};

const handleSubmit = async () => {
  if (!form.value.projectName || !form.value.description) {
    alert("Project name and description are required.");
    return;
  }
  if (form.value.tag_ids.length === 0) {
    alert("Please select at least one tag.");
    return;
  }
  if (!agreeToTerms.value) {
    alert("Please agree to the developer terms and conditions.");
    return;
  }

  isSubmitting.value = true;
  try {
    if (!isEditMode.value && !form.value.thumbnail) {
      try {
        // Fetch default placeholder image and assign it as the thumbnail file
        const response = await fetch(
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
        );
        const blob = await response.blob();
        form.value.thumbnail = new File([blob], "default-thumbnail.jpg", {
          type: "image/jpeg",
        });
      } catch (err) {
        // Safe offline fallback: generate a tiny 1x1 transparent PNG file
        const byteString = atob(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        );
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const placeholderBlob = new Blob([ab], { type: "image/png" });
        form.value.thumbnail = new File(
          [placeholderBlob],
          "default-thumbnail.png",
          { type: "image/png" },
        );
      }
    }

    if (isEditMode.value) {
      await projectStore.updateProject(route.params.id, form.value);
      toast.success("Project updated successfully!");
    } else {
      await projectStore.createProject(form.value);
      toast.success("Project submitted successfully!");
    }
    projectStore.resetCreateForm();
    router.push("/showcase");
  } catch (error) {
    console.error("[CreateProject] handleSubmit error:", error);
    toast.error("Failed to submit project. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="create-project-page min-vh-100 d-flex flex-column">
    <!-- Decorative Background Orbs -->
    <div class="orb-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <Navbar />

    <main class="container py-4 flex-grow-1 create-container">
      <div class="row g-4">
        <div class="col-12">
          <!-- Back Link -->
          <nav aria-label="breadcrumb" class="mb-3">
            <router-link
              to="/showcase"
              class="back-link d-inline-flex align-items-center gap-2"
            >
              <i class="bi bi-arrow-left"></i> Back to Showcase
            </router-link>
          </nav>
          <div class="mb-4">
            <h1 class="fw-bold h2 mb-2 text-adaptive">
              {{ isEditMode ? "Edit Project" : "Create New Project" }}
            </h1>
            <p class="text-muted">
              {{
                isEditMode
                  ? "Update your project showcase details below."
                  : "Submit your work to the ANT-Forum ecosystem. Ensure all technical details are accurate."
              }}
            </p>
          </div>
        </div>

        <!-- Form Section -->
        <div class="col-lg-8">
          <div class="glass-card p-4 p-lg-5 mb-4">
            <form @submit.prevent="handleSubmit">
              <!-- Basic Information -->
              <section class="mb-5">
                <div
                  class="section-header d-flex align-items-center gap-3 mb-4"
                >
                  <div class="section-icon bg-primary-light text-primary">
                    <i class="bi bi-info-circle"></i>
                  </div>
                  <h5 class="fw-bold mb-0 text-adaptive">Basic Information</h5>
                </div>

                <div class="form-group-custom mb-4">
                  <label class="form-label-custom"
                    >Project Name
                    <span class="required text-danger">*</span></label
                  >
                  <div class="input-wrapper">
                    <i class="bi bi-rocket-takeoff input-icon"></i>
                    <input
                      type="text"
                      v-model="form.projectName"
                      class="form-control-modern"
                      placeholder="e.g., Nexus Core Engine"
                      required
                    />
                  </div>
                  <div class="form-text small opacity-75 mt-2 text-muted">
                    A unique and memorable name for your project.
                  </div>
                </div>

                <div class="form-group-custom mb-4">
                  <label class="form-label-custom"
                    >Full Description
                    <span class="required text-danger">*</span></label
                  >
                  <textarea
                    v-model="form.description"
                    class="form-control-modern py-3"
                    rows="6"
                    placeholder="Detail the problem it solves and its main features..."
                    required
                  ></textarea>
                  <div class="d-flex justify-content-between mt-2">
                    <div class="form-text small opacity-75 text-muted">
                      Markdown is supported.
                    </div>
                    <div class="form-text small opacity-75 text-muted">
                      {{ form.description?.length || 0 }} / 2000
                    </div>
                  </div>
                </div>

                <div class="form-group-custom mb-4">
                  <label class="form-label-custom"
                    >Select Tags
                    <span class="required text-danger">*</span></label
                  >
                  <div class="tags-input-container p-3 mb-2">
                    <div class="tags-list d-flex flex-wrap gap-2">
                      <span
                        v-for="(tag, idx) in form.tagsList"
                        :key="(tag.id || tag.tag_id) + '-' + idx"
                        class="badge badge-tag-pill p-2 rounded-3 d-inline-flex align-items-center gap-2"
                      >
                        {{ tag.name || tag.tag_name }}
                        <button
                          type="button"
                          class="btn-close btn-close-white"
                          style="font-size: 0.65rem"
                          @click="removeTag(idx)"
                        ></button>
                      </span>
                      <span
                        v-if="form.tagsList.length === 0"
                        class="text-muted small"
                      >
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
                      :disabled="form.tag_ids.includes(tag.id || tag.tag_id)"
                      @click="addTag(tag)"
                    >
                      + {{ tag.name || tag.tag_name }}
                    </button>
                  </div>
                </div>
              </section>

              <!-- Repository Integration -->
              <section class="mb-5">
                <div
                  class="section-header d-flex align-items-center gap-3 mb-4"
                >
                  <div class="section-icon bg-blue-light text-blue">
                    <i class="bi bi-code-slash"></i>
                  </div>
                  <h5 class="fw-bold mb-0 text-adaptive">Links & Resources</h5>
                </div>

                <div class="row g-4">
                  <div class="col-12">
                    <div class="form-group-custom">
                      <label class="form-label-custom">Live Demo URL</label>
                      <div class="input-group-modern">
                        <span class="prefix">https://</span>
                        <input
                          type="text"
                          v-model="form.liveDemoUrl"
                          class="form-control-modern"
                          placeholder="yourproject.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Gallery & Media -->
              <section class="mb-5">
                <div
                  class="section-header d-flex align-items-center gap-3 mb-4"
                >
                  <div class="section-icon bg-primary-light text-primary">
                    <i class="bi bi-image"></i>
                  </div>
                  <h5 class="fw-bold mb-0 text-adaptive">Gallery & Media</h5>
                </div>
                <p class="text-muted x-small mb-4">
                  Upload a high-quality thumbnail image (max 5 MB) to represent
                  your project.
                </p>

                <div
                  class="screenshot-dropzone-modern d-flex flex-column align-items-center justify-content-center border-dashed-modern rounded-4 py-5 position-relative overflow-hidden cursor-pointer"
                  :class="{ dragging: isDragging }"
                  @click="triggerLogoUpload"
                  @dragover.prevent="handleDragOver"
                  @dragleave="handleDragLeave"
                  @drop.prevent="handleDrop"
                  style="min-height: 220px"
                >
                  <div
                    v-if="logoPreviewUrl"
                    class="w-100 h-100 position-absolute top-0 start-0 d-flex align-items-center justify-content-center bg-dark"
                  >
                    <img
                      :src="logoPreviewUrl"
                      class="w-100 h-100 object-fit-cover"
                      style="max-height: 100%"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0 m-3 rounded-circle p-0 d-flex align-items-center justify-content-center"
                      style="width: 28px; height: 28px; z-index: 10"
                      @click.stop="removeLogo"
                      title="Remove Image"
                    >
                      <i class="bi bi-x" style="font-size: 1.25rem"></i>
                    </button>
                  </div>
                  <div
                    v-else
                    class="d-flex flex-column align-items-center justify-content-center"
                  >
                    <div class="drop-icon-animated mb-3">
                      <i
                        class="bi bi-cloud-arrow-up-fill text-primary"
                        style="font-size: 2.5rem"
                      ></i>
                    </div>
                    <h6 class="fw-bold mb-1 text-adaptive">
                      Drag & Drop Thumbnail Image
                    </h6>
                    <p class="text-muted x-small mb-4">
                      Support for PNG, JPG and WEBP up to 5MB
                    </p>
                    <button
                      type="button"
                      class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold small"
                    >
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
              </section>

              <!-- Submission Agreement -->
              <div
                class="agreement-card-modern p-4 rounded-4 border mb-4"
                :class="{ agreed: agreeToTerms }"
              >
                <div class="form-check d-flex gap-3 align-items-center">
                  <input
                    class="form-check-input custom-checkbox"
                    type="checkbox"
                    v-model="agreeToTerms"
                    id="termsCheck"
                    required
                  />
                  <label
                    class="form-check-label small text-muted fw-medium lh-sm cursor-pointer"
                    for="termsCheck"
                  >
                    I confirm that I am the owner of this project and agree to
                    the
                    <router-link
                      to="/terms-of-service"
                      class="text-primary text-decoration-none fw-bold"
                      >Developer Terms</router-link
                    >.
                  </label>
                </div>
              </div>

              <!-- Form Actions -->
              <div
                class="d-flex justify-content-end align-items-center gap-4 mt-5 pt-4 border-top-theme"
              >
                <button
                  type="button"
                  @click="handleCancel"
                  class="btn btn-link text-decoration-none fw-bold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!agreeToTerms || isSubmitting"
                  class="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  <span v-else
                    >{{ isEditMode ? "Save Changes" : "Publish Project" }}
                    <i
                      class="bi"
                      :class="
                        isEditMode ? 'bi-save-fill' : 'bi-rocket-takeoff-fill'
                      "
                    ></i
                  ></span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="col-lg-4">
          <div class="glass-card p-4 sticky-sidebar">
            <div class="d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-shield-check text-primary"></i>
              <h6 class="fw-bold mb-0 text-adaptive">Submission Guidelines</h6>
            </div>

            <div class="guidelines-list d-flex flex-column gap-4">
              <div
                v-for="item in guidelines"
                :key="item.title"
                class="guideline-item d-flex gap-3"
              >
                <div class="check-icon text-primary">
                  <i :class="['bi', item.icon]"></i>
                </div>
                <div>
                  <div class="fw-bold small mb-1 text-adaptive">
                    {{ item.title }}
                  </div>
                  <p class="text-muted x-small mb-0">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-top-theme">
              <p class="text-muted small mb-0">
                Need help?
                <router-link
                  to="/help"
                  class="text-primary text-decoration-none fw-semibold"
                  >Read the docs</router-link
                >
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-3px);
}

.create-project-page {
  min-height: 100vh;
  background: transparent;
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.orb-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.6;
  transition: all 0.5s ease;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(84, 131, 179, 0.15),
    transparent 70%
  );
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle,
    rgba(84, 131, 179, 0.12),
    transparent 70%
  );
  bottom: -80px;
  right: -50px;
}

.create-container {
  position: relative;
  z-index: 1;
}

.glass-card {
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-glass-border);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: var(--shadow-lg);
}

.sticky-sidebar {
  position: sticky;
  top: 100px;
}

/* Modern Form Elements */
.section-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(84, 131, 179, 0.1);
}

.form-label-custom {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 10px;
  display: block;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 1.1rem;
  pointer-events: none;
  transition: color 0.2s;
}

.form-control-modern {
  width: 100%;
  padding: 14px 18px;
  padding-left: 52px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: all 0.2s ease;
}

textarea.form-control-modern {
  padding-left: 18px;
}

.form-control-modern:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.form-control-modern:focus + .input-icon {
  color: var(--color-primary);
}

.input-group-modern {
  display: flex;
  align-items: center;
}

.input-group-modern .prefix {
  padding: 14px 18px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 14px 0 0 14px;
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.9rem;
}

.input-group-modern .form-control-modern {
  border-radius: 0 14px 14px 0;
  padding-left: 18px;
}

.tags-input-container {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  min-height: 56px;
}

.badge-tag-pill {
  font-size: 0.78rem;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-blue)
  );
  box-shadow: 0 4px 10px rgba(84, 131, 179, 0.2);
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
  font-size: 2.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
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

.cursor-pointer {
  cursor: pointer;
}

.border-top-theme {
  border-top: 1px solid var(--color-border);
}

.text-adaptive {
  color: var(--color-text) !important;
}

.x-small {
  font-size: 0.85rem;
}

.xx-small {
  font-size: 0.65rem;
}
</style>
