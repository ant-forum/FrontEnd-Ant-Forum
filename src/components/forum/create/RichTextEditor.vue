<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import BaseModal from "@/components/base/BaseModal.vue";
import ImageCropModal from "@/components/base/ImageCropModal.vue";
import { useImageCropper } from "@/composables/useImageCropper";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Start writing...",
  },
});

const emit = defineEmits(["update:modelValue", "focus", "blur"]);

const editor = ref(null);
const imageInputRef = ref(null);
const isFocused = ref(false);
const showTextMenu = ref(false);
const showLinkPopup = ref(false);
const showImageModal = ref(false);
const isDraggingImage = ref(false);
const linkUrl = ref("");
const linkText = ref("");
const editorStateTrigger = ref(0);

const isOptionActive = (name, attributes = {}) => {
  const _ = editorStateTrigger.value;
  return editor.value ? editor.value.isActive(name, attributes) : false;
};

const linkUrlInputRef = ref(null);
const linkTextInputRef = ref(null);

const {
  cropSource: blogImageCropSource,
  isCropModalOpen: isBlogImageCropOpen,
  openCropper: openBlogImageCropper,
  confirmCrop: confirmBlogImageCrop,
  cancelCrop: cancelBlogImageCrop,
} = useImageCropper({
  title: "Crop Blog Image",
  aspectRatio: "original",
  outputWidth: 1200,
  outputType: "image/jpeg",
  shape: "rect",
});

const wordCount = ref(0);
const charCount = ref(0);

const updateCounts = () => {
  if (!editor.value) return;
  const text = editor.value.getText() || "";
  charCount.value = text.length;
  const words = text.trim();
  wordCount.value = words ? words.split(/\s+/).length : 0;
};

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    onUpdate: () => {
      if (editor.value) {
        const html = editor.value.getHTML();
        emit("update:modelValue", html);
        updateCounts();
        editorStateTrigger.value++;
      }
    },
    onSelectionUpdate: () => {
      editorStateTrigger.value++;
    },
    onFocus: () => {
      isFocused.value = true;
      emit("focus");
      editorStateTrigger.value++;
    },
    onBlur: () => {
      isFocused.value = false;
      emit("blur");
      editorStateTrigger.value++;
    },
  });

  if (editor.value) {
    updateCounts();
  }
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const currentHtml = editor.value.getHTML();
    if (currentHtml !== value) {
      editor.value.commands.setContent(value);
    }
  },
);

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run();
const toggleCode = () => editor.value?.chain().focus().toggleCode().run();
const toggleCodeBlock = () =>
  editor.value?.chain().focus().toggleCodeBlock().run();
const toggleBlockquote = () =>
  editor.value?.chain().focus().toggleBlockquote().run();
const toggleHeading = (level) =>
  editor.value?.chain().focus().toggleHeading({ level }).run();
const toggleBulletList = () =>
  editor.value?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () =>
  editor.value?.chain().focus().toggleOrderedList().run();
const setHorizontalRule = () =>
  editor.value?.chain().focus().setHorizontalRule().run();
const undo = () => editor.value?.chain().focus().undo().run();
const redo = () => editor.value?.chain().focus().redo().run();

const openLinkPopup = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  linkUrl.value = previousUrl || "";

  if (editor.value) {
    const { from, to } = editor.value.state.selection;
    linkText.value = editor.value.state.doc.textBetween(from, to, " ") || "";
  } else {
    linkText.value = "";
  }

  showLinkPopup.value = true;
  nextTick(() => {
    if (linkText.value) {
      linkUrlInputRef.value?.focus();
    } else {
      linkTextInputRef.value?.focus();
    }
  });
};

const saveLink = () => {
  const url = linkUrl.value.trim();
  const text = linkText.value.trim();
  showLinkPopup.value = false;

  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const displayText = text || url;

  editor.value
    ?.chain()
    .focus()
    .insertContent({
      type: "text",
      text: displayText,
      marks: [
        {
          type: "link",
          attrs: { href: normalized },
        },
      ],
    })
    .run();
};

const removeLink = () => {
  showLinkPopup.value = false;
  editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
};

const insertImageFiles = async (files = []) => {
  const validFiles = Array.from(files)
    .filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    )
    .slice(0, 3);

  if (!validFiles.length) return;
  showImageModal.value = false;

  for (const file of validFiles) {
    const cropped = await openBlogImageCropper(file);
    if (cropped?.dataUrl) {
      editor.value
        ?.chain()
        .focus()
        .setImage({ src: cropped.dataUrl, alt: file.name })
        .run();
    }
  }
};

const openImageModal = () => {
  showImageModal.value = true;
};

const openImagePicker = () => {
  imageInputRef.value?.click();
};

const handleImageInput = (event) => {
  insertImageFiles(event.target.files || []);
  event.target.value = "";
};

const handleImageDrop = (event) => {
  isDraggingImage.value = false;
  insertImageFiles(event.dataTransfer?.files || []);
};
</script>

<template>
  <div class="rich-editor" :class="{ focused: isFocused }" v-bind="$attrs">
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="handleImageInput"
    />

    <div v-if="editor" class="rich-toolbar">
      <div class="toolbar-left">
        <button
          type="button"
          @mousedown.prevent="undo"
          :disabled="!editor.can().undo()"
          class="toolbar-btn"
          title="Undo"
        >
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="redo"
          :disabled="!editor.can().redo()"
          class="toolbar-btn"
          title="Redo"
        >
          <i class="bi bi-arrow-clockwise"></i>
        </button>

        <span class="toolbar-divider"></span>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn text-btn"
            :class="{ 'is-active': isOptionActive('heading') }"
            title="Heading"
            @mousedown.prevent="showTextMenu = !showTextMenu"
          >
            <span>H</span><i class="bi bi-chevron-down"></i>
          </button>
          <div v-if="showTextMenu" class="toolbar-dropdown">
            <button
              type="button"
              @mousedown.prevent="
                editor.chain().focus().setParagraph().run();
                showTextMenu = false;
              "
              :class="{ 'is-active': isOptionActive('paragraph') }"
            >
              <i class="bi bi-paragraph"></i> Paragraph
            </button>
            <button
              type="button"
              @mousedown.prevent="
                toggleHeading(1);
                showTextMenu = false;
              "
              :class="{ 'is-active': isOptionActive('heading', { level: 1 }) }"
            >
              <i class="bi bi-type-h1"></i> Heading 1
            </button>
            <button
              type="button"
              @mousedown.prevent="
                toggleHeading(2);
                showTextMenu = false;
              "
              :class="{ 'is-active': isOptionActive('heading', { level: 2 }) }"
            >
              <i class="bi bi-type-h2"></i> Heading 2
            </button>
            <button
              type="button"
              @mousedown.prevent="
                toggleHeading(3);
                showTextMenu = false;
              "
              :class="{ 'is-active': isOptionActive('heading', { level: 3 }) }"
            >
              <i class="bi bi-type-h3"></i> Heading 3
            </button>
          </div>
        </div>

        <button
          type="button"
          @mousedown.prevent="toggleBulletList"
          :class="{ 'is-active': isOptionActive('bulletList') }"
          class="toolbar-btn"
          title="Bullet List"
        >
          <i class="bi bi-list-ul"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="toggleOrderedList"
          :class="{ 'is-active': isOptionActive('orderedList') }"
          class="toolbar-btn"
          title="Numbered List"
        >
          <i class="bi bi-list-ol"></i>
        </button>

        <button
          type="button"
          @mousedown.prevent="toggleCodeBlock"
          :class="{ 'is-active': isOptionActive('codeBlock') }"
          class="toolbar-btn"
          title="Code Block"
        >
          <i class="bi bi-braces"></i>
        </button>

        <span class="toolbar-divider"></span>

        <button
          type="button"
          @mousedown.prevent="toggleBold"
          :class="{ 'is-active': isOptionActive('bold') }"
          class="toolbar-btn"
          title="Bold"
        >
          <i class="bi bi-type-bold"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="toggleItalic"
          :class="{ 'is-active': isOptionActive('italic') }"
          class="toolbar-btn"
          title="Italic"
        >
          <i class="bi bi-type-italic"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="toggleStrike"
          :class="{ 'is-active': isOptionActive('strike') }"
          class="toolbar-btn"
          title="Strikethrough"
        >
          <i class="bi bi-type-strikethrough"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="toggleCode"
          :class="{ 'is-active': isOptionActive('code') }"
          class="toolbar-btn"
          title="Inline Code"
        >
          <i class="bi bi-code-slash"></i>
        </button>

        <button
          type="button"
          @mousedown.prevent="openLinkPopup"
          :class="{ 'is-active': isOptionActive('link') }"
          class="toolbar-btn"
          title="Link"
        >
          <i class="bi bi-link-45deg"></i>
        </button>

        <span class="toolbar-divider"></span>

        <button
          type="button"
          @mousedown.prevent="setHorizontalRule"
          class="toolbar-btn"
          title="Divider"
        >
          <i class="bi bi-hr"></i>
        </button>
        <button
          type="button"
          @mousedown.prevent="toggleBlockquote"
          :class="{ 'is-active': isOptionActive('blockquote') }"
          class="toolbar-btn"
          title="Quote"
        >
          <i class="bi bi-quote"></i>
        </button>

        <span class="toolbar-divider"></span>

        <button
          type="button"
          class="toolbar-btn add-media-btn"
          title="Add image"
          @mousedown.prevent="openImageModal"
        >
          <i class="bi bi-image"></i>
          <span>Add</span>
        </button>
      </div>
    </div>



    <!-- TIPTAP WORKSPACE -->
    <div class="rich-editable-container">
      <editor-content :editor="editor" class="rich-editable" />
    </div>

    <div class="rich-status">
      <span
        ><i class="bi bi-file-earmark-text"></i
        ><strong>{{ wordCount }}</strong> words</span
      >
      <span
        ><strong>{{ charCount }}</strong> characters</span
      >
      <span class="live-note"><i class="bi bi-eye"></i> Live rich editing</span>
    </div>
  </div>

  <BaseModal
    v-if="showImageModal"
    title="Add Image"
    icon="bi bi-image"
    theme="primary"
    @closeModal="showImageModal = false"
  >
    <div
      class="image-dropzone"
      :class="{ dragging: isDraggingImage }"
      @click="openImagePicker"
      @dragover.prevent="isDraggingImage = true"
      @dragleave.prevent="isDraggingImage = false"
      @drop.prevent="handleImageDrop"
    >
      <div class="upload-file-icon">
        <i class="bi bi-file-earmark-image"></i>
        <span><i class="bi bi-cloud-arrow-up-fill"></i></span>
      </div>
      <p><u>Click to upload</u> or drag and drop</p>
      <strong>Maximum 3 files, 5MB each.</strong>
    </div>
  </BaseModal>

  <ImageCropModal
    v-if="isBlogImageCropOpen"
    :source="blogImageCropSource"
    @confirm="confirmBlogImageCrop"
    @cancel="cancelBlogImageCrop"
  />

  <BaseModal
    v-if="showLinkPopup"
    title="Insert Link"
    icon="bi bi-link-45deg"
    theme="primary"
    @closeModal="showLinkPopup = false"
  >
    <div class="link-modal-body">
      <div class="form-group mb-3">
        <label for="rich-link-text-input" class="form-label small fw-bold text-muted">Link Text</label>
        <input
          id="rich-link-text-input"
          ref="linkTextInputRef"
          v-model="linkText"
          type="text"
          class="form-control"
          placeholder="e.g. Google"
          @keydown.enter.prevent="saveLink"
        />
      </div>
      <div class="form-group mb-3">
        <label for="rich-link-url-input" class="form-label small fw-bold text-muted">URL</label>
        <input
          id="rich-link-url-input"
          ref="linkUrlInputRef"
          v-model="linkUrl"
          type="text"
          class="form-control"
          placeholder="https://example.com"
          @keydown.enter.prevent="saveLink"
        />
      </div>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          class="btn btn-light btn-sm fw-bold border"
          @click="showLinkPopup = false"
        >
          Cancel
        </button>
        <button
          v-if="editor?.getAttributes('link').href"
          type="button"
          class="btn btn-outline-danger btn-sm fw-bold"
          @click="removeLink"
        >
          Remove Link
        </button>
        <button
          type="button"
          class="btn btn-primary btn-sm fw-bold"
          @click="saveLink"
        >
          Insert
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.rich-editor {
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

[data-theme="dark"] .rich-editor {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.rich-editor.focused {
  border-color: var(--color-blue);
  box-shadow: var(--focus-ring);
}

.rich-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.45rem 1rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.toolbar-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.25rem;
  width: 100%;
}

.toolbar-btn {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 1rem;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.toolbar-btn:hover,
.toolbar-btn:focus-visible {
  color: var(--color-text);
  background: var(--color-surface-hover);
  outline: none;
}

.toolbar-btn.is-active {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-btn {
  width: auto;
  gap: 0.25rem;
  padding: 0 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
}

.mini-chevron {
  font-size: 0.6rem;
  margin-left: -0.1rem;
}

.add-media-btn {
  width: auto;
  padding: 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 750;
}

.add-media-btn span {
  font-size: 0.85rem;
}

.toolbar-divider {
  width: 1.5px;
  height: 18px;
  margin: 0 0.25rem;
  background: var(--color-border);
}

.toolbar-popover-wrapper {
  position: relative;
}

.toolbar-dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  min-width: 150px;
  padding: 0.35rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.toolbar-dropdown button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  text-align: left;
  transition: all 0.2s ease;
}

.toolbar-dropdown button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.toolbar-dropdown button.is-active {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.link-popup-panel {
  padding: 1rem;
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-popup-panel label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.link-row {
  display: flex;
  gap: 0.5rem;
}

.link-row input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.link-row input:focus {
  border-color: var(--color-primary);
}

.btn-save-link,
.btn-cancel-link {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-link {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-save-link:hover {
  filter: brightness(0.9);
}

.btn-cancel-link {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.btn-cancel-link:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Editor Styles */
.rich-editable-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.rich-editable {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

:deep(.tiptap) {
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
  min-height: 100%;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  color: var(--color-text-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.tiptap h1),
:deep(.tiptap h2),
:deep(.tiptap h3) {
  color: var(--color-text);
  font-weight: 700;
  margin: 1.5rem 0 0.5rem;
  line-height: 1.2;
}

:deep(.tiptap h1) {
  font-size: 1.75rem;
}
:deep(.tiptap h2) {
  font-size: 1.5rem;
}
:deep(.tiptap h3) {
  font-size: 1.25rem;
}

:deep(.tiptap p) {
  margin-bottom: 1rem;
}

:deep(.tiptap img) {
  display: block;
  max-width: 100%;
  max-height: 400px;
  margin: 1.5rem 0;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

:deep(.tiptap blockquote) {
  border-left: 4px solid var(--color-primary);
  padding: 0.5rem 1rem;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-text-muted);
  margin: 1.5rem 0;
  font-style: italic;
  border-radius: 0 8px 8px 0;
}

:deep(.tiptap code) {
  background: var(--color-surface-hover);
  color: var(--color-danger);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

:deep(.tiptap pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

:deep(.tiptap pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 0.9em;
}

:deep(.tiptap a) {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

:deep(.tiptap hr) {
  border: none;
  border-top: 2px dashed var(--color-border);
  margin: 2rem 0;
}

.rich-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-surface-hover);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.rich-status span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.rich-status strong {
  color: var(--color-text);
  font-weight: 700;
}

.live-note {
  margin-left: auto;
  color: var(--color-primary);
  font-weight: 600;
}

.image-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.image-dropzone.dragging,
.image-dropzone:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}

.upload-file-icon {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  position: relative;
}

.upload-file-icon span {
  position: absolute;
  bottom: 0;
  right: -10px;
  font-size: 1.5rem;
  color: var(--color-success);
  background: var(--color-surface);
  border-radius: 50%;
  padding: 2px;
}

.image-dropzone p {
  color: var(--color-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.image-dropzone strong {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
</style>
