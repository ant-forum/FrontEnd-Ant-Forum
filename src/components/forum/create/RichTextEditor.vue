<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import ImageCropModal from "@/components/base/ImageCropModal.vue";
import { useImageCropper } from "@/composables/useImageCropper";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { htmlToPlainText, renderStoredContent } from "@/utils/richContent";

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

const editorRef = ref(null);
const imageInputRef = ref(null);
const isFocused = ref(false);
const showTextMenu = ref(false);
const showTableMenu = ref(false);
const showListMenu = ref(false);
const showAlignMenu = ref(false);
const showLinkPopup = ref(false);
const showImageModal = ref(false);
const isDraggingImage = ref(false);
const linkUrl = ref("");
const lastEmitted = ref("");
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

const plainText = computed(() => htmlToPlainText(props.modelValue));
const wordCount = computed(() => {
  const text = plainText.value.trim();
  return text ? text.split(/\s+/).length : 0;
});
const charCount = computed(() => plainText.value.length);

const setEditorHtml = (html) => {
  if (!editorRef.value) return;
  const nextHtml = renderStoredContent(html);
  if (editorRef.value.innerHTML !== nextHtml) {
    editorRef.value.innerHTML = nextHtml;
  }
};

const cleanEditorHtml = () => {
  const html = editorRef.value?.innerHTML || "";
  const cleaned = sanitizeHtml(html).replace(/^<p><br><\/p>$/, "");
  return cleaned === "<br>" ? "" : cleaned;
};

const emitContent = () => {
  const html = cleanEditorHtml();
  lastEmitted.value = html;
  emit("update:modelValue", html);
};

const focusEditor = async () => {
  await nextTick();
  editorRef.value?.focus();
};

const runCommand = async (command, value = null) => {
  await focusEditor();
  document.execCommand(command, false, value);
  emitContent();
};

const closeMenus = () => {
  showTextMenu.value = false;
  showTableMenu.value = false;
  showListMenu.value = false;
  showAlignMenu.value = false;
};

const toggleMenu = (menuName) => {
  const nextState = {
    text: false,
    table: false,
    list: false,
    align: false,
  };

  if (menuName === "text") nextState.text = !showTextMenu.value;
  if (menuName === "table") nextState.table = !showTableMenu.value;
  if (menuName === "list") nextState.list = !showListMenu.value;
  if (menuName === "align") nextState.align = !showAlignMenu.value;

  showTextMenu.value = nextState.text;
  showTableMenu.value = nextState.table;
  showListMenu.value = nextState.list;
  showAlignMenu.value = nextState.align;
};

const formatBlock = async (tag) => {
  closeMenus();
  await runCommand("formatBlock", tag);
};

const insertHtml = async (html) => {
  await focusEditor();
  document.execCommand("insertHTML", false, html);
  emitContent();
};

const insertTable = (rows = 3, cols = 2) => {
  closeMenus();
  const body = Array.from({ length: rows }, (_, rowIndex) => {
    const cells = Array.from({ length: cols }, (_, colIndex) => {
      const tag = rowIndex === 0 ? "th" : "td";
      const label = rowIndex === 0 ? `Column ${colIndex + 1}` : "Text";
      return `<${tag}>${label}</${tag}>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  insertHtml(`<table><tbody>${body}</tbody></table><p><br></p>`);
};

const openLinkPopup = async () => {
  await focusEditor();
  closeMenus();
  linkUrl.value = "";
  showLinkPopup.value = true;
};

const saveLink = async () => {
  const url = linkUrl.value.trim();
  if (!url) return;
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  showLinkPopup.value = false;
  await runCommand("createLink", normalized);
};

const insertImageFiles = async (files = []) => {
  const validFiles = Array.from(files)
    .filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    )
    .slice(0, 3);

  if (!validFiles.length) return;

  showImageModal.value = false;

  const imageBlocks = [];
  for (const file of validFiles) {
    const cropped = await openBlogImageCropper(file);
    if (cropped?.dataUrl) {
      imageBlocks.push(
        `<img src="${cropped.dataUrl}" alt="${escapeHtml(file.name)}">`,
      );
    }
  }

  if (!imageBlocks.length) return;

  await insertHtml(`${imageBlocks.join("")}<p><br></p>`);
};

const openImageModal = () => {
  closeMenus();
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

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const handlePaste = (event) => {
  event.preventDefault();
  const html = event.clipboardData?.getData("text/html");
  const text = event.clipboardData?.getData("text/plain");

  if (html) {
    insertHtml(sanitizeHtml(html));
    return;
  }

  if (text) {
    insertHtml(
      text
        .split(/\n{2,}/)
        .map(
          (paragraph) =>
            `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`,
        )
        .join(""),
    );
  }
};

const handleFocus = () => {
  isFocused.value = true;
  emit("focus");
};

const handleBlur = () => {
  isFocused.value = false;
  emit("blur");
  emitContent();
};

watch(
  () => props.modelValue,
  (value) => {
    if (value === lastEmitted.value || isFocused.value) return;
    setEditorHtml(value);
  },
);

onMounted(() => {
  setEditorHtml(props.modelValue);
});
</script>

<template>
  <div class="rich-editor" :class="{ focused: isFocused }">
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="handleImageInput"
    />

    <div class="rich-toolbar">
      <div class="toolbar-left">
        <button
          type="button"
          class="toolbar-btn"
          title="Undo"
          @mousedown.prevent="runCommand('undo')"
        >
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Redo"
          @mousedown.prevent="runCommand('redo')"
        >
          <i class="bi bi-arrow-clockwise"></i>
        </button>

        <span class="toolbar-divider"></span>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn text-btn"
            title="Heading"
            @mousedown.prevent="toggleMenu('text')"
          >
            <span>H</span><i class="bi bi-chevron-down"></i>
          </button>
          <div v-if="showTextMenu" class="toolbar-dropdown">
            <button type="button" @mousedown.prevent="formatBlock('p')">
              <i class="bi bi-paragraph"></i> Paragraph
            </button>
            <button type="button" @mousedown.prevent="formatBlock('h1')">
              <i class="bi bi-type-h1"></i> Heading 1
            </button>
            <button type="button" @mousedown.prevent="formatBlock('h2')">
              <i class="bi bi-type-h2"></i> Heading 2
            </button>
            <button type="button" @mousedown.prevent="formatBlock('h3')">
              <i class="bi bi-type-h3"></i> Heading 3
            </button>
          </div>
        </div>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn split-btn"
            title="Lists"
            @mousedown.prevent="toggleMenu('list')"
          >
            <i class="bi bi-list-ul"></i
            ><i class="bi bi-chevron-down mini-chevron"></i>
          </button>
          <div v-if="showListMenu" class="toolbar-dropdown">
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('insertUnorderedList');
              "
            >
              <i class="bi bi-list-ul"></i> Bullet list
            </button>
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('insertOrderedList');
              "
            >
              <i class="bi bi-list-ol"></i> Numbered list
            </button>
          </div>
        </div>

        <button
          type="button"
          class="toolbar-btn"
          title="Indent"
          @mousedown.prevent="runCommand('indent')"
        >
          <i class="bi bi-text-indent-left"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Outdent"
          @mousedown.prevent="runCommand('outdent')"
        >
          <i class="bi bi-text-indent-right"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Code block"
          @mousedown.prevent="formatBlock('pre')"
        >
          <i class="bi bi-braces"></i>
        </button>

        <span class="toolbar-divider"></span>

        <button
          type="button"
          class="toolbar-btn"
          title="Bold"
          @mousedown.prevent="runCommand('bold')"
        >
          <i class="bi bi-type-bold"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Italic"
          @mousedown.prevent="runCommand('italic')"
        >
          <i class="bi bi-type-italic"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Strikethrough"
          @mousedown.prevent="runCommand('strikeThrough')"
        >
          <i class="bi bi-type-strikethrough"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Inline code"
          @mousedown.prevent="runCommand('fontName', 'monospace')"
        >
          <i class="bi bi-code-slash"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Underline"
          @mousedown.prevent="runCommand('underline')"
        >
          <i class="bi bi-type-underline"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Highlight"
          @mousedown.prevent="runCommand('backColor', '#facc15')"
        >
          <i class="bi bi-highlighter"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Link"
          @mousedown.prevent="openLinkPopup"
        >
          <i class="bi bi-link-45deg"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn math-btn"
          title="Superscript"
          @mousedown.prevent="runCommand('superscript')"
        >
          x²
        </button>
        <button
          type="button"
          class="toolbar-btn math-btn"
          title="Subscript"
          @mousedown.prevent="runCommand('subscript')"
        >
          x₂
        </button>

        <span class="toolbar-divider"></span>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn split-btn"
            title="Alignment"
            @mousedown.prevent="toggleMenu('align')"
          >
            <i class="bi bi-text-left"></i
            ><i class="bi bi-chevron-down mini-chevron"></i>
          </button>
          <div v-if="showAlignMenu" class="toolbar-dropdown">
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('justifyLeft');
              "
            >
              <i class="bi bi-text-left"></i> Left
            </button>
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('justifyCenter');
              "
            >
              <i class="bi bi-text-center"></i> Center
            </button>
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('justifyRight');
              "
            >
              <i class="bi bi-text-right"></i> Right
            </button>
            <button
              type="button"
              @mousedown.prevent="
                closeMenus();
                runCommand('justifyFull');
              "
            >
              <i class="bi bi-justify"></i> Justify
            </button>
          </div>
        </div>

        <button
          type="button"
          class="toolbar-btn"
          title="Divider"
          @mousedown.prevent="runCommand('insertHorizontalRule')"
        >
          <i class="bi bi-hr"></i>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Quote"
          @mousedown.prevent="formatBlock('blockquote')"
        >
          <i class="bi bi-quote"></i>
        </button>

        <span class="toolbar-divider"></span>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn"
            title="Table"
            @mousedown.prevent="toggleMenu('table')"
          >
            <i class="bi bi-table"></i>
          </button>
          <div v-if="showTableMenu" class="toolbar-dropdown table-dropdown">
            <button type="button" @mousedown.prevent="insertTable(3, 2)">
              2 columns
            </button>
            <button type="button" @mousedown.prevent="insertTable(3, 3)">
              3 columns
            </button>
          </div>
        </div>
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

      <button type="button" class="toolbar-btn theme-btn" title="Theme">
        <i class="bi bi-moon-stars"></i>
      </button>
    </div>

    <div v-if="showLinkPopup" class="link-popup-panel">
      <label for="rich-link-url">Link URL</label>
      <div class="link-row">
        <input
          id="rich-link-url"
          v-model="linkUrl"
          type="text"
          placeholder="https://example.com"
          @keydown.enter.prevent="saveLink"
        />
        <button
          type="button"
          class="btn-save-link"
          @mousedown.prevent="saveLink"
        >
          Apply
        </button>
        <button
          type="button"
          class="btn-cancel-link"
          @mousedown.prevent="showLinkPopup = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <div
      ref="editorRef"
      class="rich-editable"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="emitContent"
      @focus="handleFocus"
      @blur="handleBlur"
      @paste="handlePaste"
    ></div>

    <div class="rich-status">
      <span
        ><i class="bi bi-file-earmark-text"></i>
        <strong>{{ wordCount }}</strong> words</span
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
</template>

<style scoped>
.rich-editor {
  overflow: hidden;
  background: #111113;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.rich-editor.focused {
  border-color: var(--color-purple);
  box-shadow: var(--focus-ring);
}

.rich-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 58px;
  padding: 0.55rem 1.15rem;
  background: #111113;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.toolbar-left {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.18rem;
  width: 100%;
}

.toolbar-btn {
  min-width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.32rem;
  color: #a1a1aa;
  background: transparent;
  border: 0;
  border-radius: 9px;
  font-size: 1.18rem;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.toolbar-btn:hover,
.toolbar-btn:focus-visible {
  color: #f4f4f5;
  background: rgba(255, 255, 255, 0.075);
  outline: none;
}

.text-btn {
  width: auto;
  gap: 0.35rem;
  padding: 0 0.55rem;
  font-size: 1.15rem;
  font-weight: 650;
}

.split-btn {
  padding: 0 0.35rem;
}

.mini-chevron {
  font-size: 0.68rem;
  margin-left: -0.15rem;
}

.math-btn {
  font-size: 0.93rem;
  font-weight: 800;
}

.add-media-btn {
  width: auto;
  padding: 0 0.65rem;
  font-size: 1rem;
  font-weight: 750;
}

.add-media-btn span {
  font-size: 0.95rem;
}

.theme-btn {
  flex: 0 0 auto;
}

.toolbar-divider {
  width: 1px;
  height: 31px;
  margin: 0 0.45rem;
  background: rgba(255, 255, 255, 0.1);
}

.toolbar-popover-wrapper {
  position: relative;
}

.toolbar-dropdown {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  min-width: 160px;
  padding: 0.45rem;
  background: #18181b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.42);
}

.toolbar-dropdown button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.65rem;
  color: #e4e4e7;
  background: transparent;
  border: 0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: left;
}

.toolbar-dropdown button:hover {
  background: rgba(255, 255, 255, 0.075);
}

.table-dropdown {
  min-width: 130px;
}

.link-popup-panel {
  padding: 0.85rem 1rem;
  background: #111113;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.link-popup-panel label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.link-row {
  display: flex;
  gap: 0.5rem;
}

.link-row input {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
  background: var(--color-input-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
}

.btn-save-link,
.btn-cancel-link {
  border: 0;
  border-radius: 8px;
  padding: 0 0.8rem;
  font-weight: 800;
}

.btn-save-link {
  color: #fff;
  background: var(--color-primary);
}

.btn-cancel-link {
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
}

.rich-editable {
  min-height: 520px;
  padding: 2.35rem;
  color: #f4f4f5;
  background: #111113;
  outline: none;
  overflow-x: auto;
  font-size: 1rem;
  line-height: 1.8;
}

.rich-editable:empty::before {
  content: attr(data-placeholder);
  color: #71717a;
  pointer-events: none;
}

.rich-editable :deep(h1),
.rich-editable :deep(h2),
.rich-editable :deep(h3) {
  color: var(--color-text);
  font-weight: 850;
  line-height: 1.25;
}

.rich-editable :deep(h1) {
  font-size: 2rem;
  margin: 0 0 1rem;
  color: #fff;
}
.rich-editable :deep(h2) {
  font-size: 1.55rem;
  margin: 1.6rem 0 0.8rem;
}
.rich-editable :deep(h3) {
  font-size: 1.25rem;
  margin: 1.3rem 0 0.65rem;
}
.rich-editable :deep(p) {
  margin: 0 0 1rem;
}
.rich-editable :deep(a) {
  color: var(--color-primary);
  font-weight: 700;
}
.rich-editable :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 10px 10px 0;
}

.rich-editable :deep(pre) {
  padding: 1rem;
  color: #e5e7eb;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  overflow-x: auto;
  line-height: 1.6;
}

.rich-editable :deep(code) {
  color: #e879f9;
  background: rgba(139, 92, 246, 0.14);
  border-radius: 5px;
  padding: 0.08rem 0.25rem;
}

.rich-editable :deep(pre code) {
  color: inherit;
  background: transparent;
  padding: 0;
}

.rich-editable :deep(ul),
.rich-editable :deep(ol) {
  padding-left: 1.45rem;
  margin: 0 0 1rem;
}

.rich-editable :deep(li) {
  margin-bottom: 0.35rem;
}

.rich-editable :deep(table) {
  width: 100%;
  margin: 1rem 0;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.rich-editable :deep(th),
.rich-editable :deep(td) {
  min-width: 120px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  vertical-align: top;
}

.rich-editable :deep(th) {
  background: var(--color-surface-hover);
  font-weight: 850;
}

.rich-editable :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.rich-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  color: var(--color-text-muted);
  background: #111113;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.82rem;
  font-weight: 700;
}

.live-note {
  margin-left: auto;
  color: var(--color-primary);
}

.image-dropzone {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 2rem;
  color: var(--color-text-muted);
  background: color-mix(in srgb, var(--color-bg) 88%, #000 12%);
  border: 2px dashed color-mix(in srgb, var(--color-border) 75%, #fff 25%);
  border-radius: 16px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.image-dropzone:hover,
.image-dropzone.dragging {
  background: color-mix(in srgb, var(--color-primary-light) 24%, transparent);
  border-color: var(--color-primary);
}

.upload-file-icon {
  position: relative;
  width: 74px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 3.8rem;
}

.upload-file-icon span {
  position: absolute;
  right: 4px;
  bottom: 6px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--color-primary);
  border-radius: 50%;
  font-size: 1.15rem;
}

.image-dropzone p {
  margin: 0;
  color: var(--color-text);
  font-size: 1.02rem;
  font-weight: 700;
}

.image-dropzone strong {
  color: var(--color-text-muted);
  font-size: 0.86rem;
}

@media (max-width: 767.98px) {
  .rich-editable {
    min-height: 420px;
    padding: 1.25rem;
  }

  .link-row {
    flex-direction: column;
  }

  .live-note {
    margin-left: 0;
  }
}
</style>
