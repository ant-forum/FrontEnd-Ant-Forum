<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { useToast } from "@/composables/useToast.js";
import BaseModal from "@/components/base/BaseModal.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default:
      "Write details of your discussion, question, or tutorial here. Markdown and keyboard shortcuts are supported...",
  },
  isDraftSaved: {
    type: Boolean,
    default: false,
  },
  lastSavedTime: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "focus", "blur"]);
const toast = useToast();

const editor = ref(null);
const isEditorFocused = ref(false);
const wordCount = ref(0);
const charCount = ref(0);
const editorStateTrigger = ref(0);

const isOptionActive = (name, attributes = {}) => {
  const _ = editorStateTrigger.value;
  return editor.value ? editor.value.isActive(name, attributes) : false;
};

const updateWordAndCharCount = (text) => {
  const plainText = text || "";
  charCount.value = plainText.length;
  const words = plainText.trim();
  wordCount.value = words ? words.split(/\s+/).length : 0;
};

const getMarkdown = () => editor.value?.storage.markdown.getMarkdown() || "";

const createTextContent = (text = "") => {
  const lines = String(text || "").split("\n");
  const content = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      content.push({ type: "hardBreak" });
    }
    if (line) {
      content.push({ type: "text", text: line });
    }
  });

  return content;
};

const appendMarkdownTextNodes = (nodes, markdown = "") => {
  String(markdown || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .forEach((block) => {
      if (block.startsWith("### ")) {
        nodes.push({
          type: "heading",
          attrs: { level: 3 },
          content: createTextContent(block.slice(4)),
        });
        return;
      }

      if (block.startsWith("## ")) {
        nodes.push({
          type: "heading",
          attrs: { level: 2 },
          content: createTextContent(block.slice(3)),
        });
        return;
      }

      if (block.startsWith("# ")) {
        nodes.push({
          type: "heading",
          attrs: { level: 1 },
          content: createTextContent(block.slice(2)),
        });
        return;
      }

      nodes.push({
        type: "paragraph",
        content: createTextContent(block),
      });
    });
};

const markdownWithCodeToDoc = (markdown = "") => {
  const source = String(markdown || "");
  const nodes = [];
  const fencePattern = /```([^\n`]*)\n?([\s\S]*?)(?:```|$)/g;
  let cursor = 0;
  let match;

  while ((match = fencePattern.exec(source)) !== null) {
    appendMarkdownTextNodes(nodes, source.slice(cursor, match.index));

    const language = String(match[1] || "").trim();
    const code = String(match[2] || "").replace(/\n$/, "");
    nodes.push({
      type: "codeBlock",
      attrs: { language: language || null },
      content: code ? [{ type: "text", text: code }] : [],
    });

    cursor = match.index + match[0].length;
  }

  appendMarkdownTextNodes(nodes, source.slice(cursor));

  return {
    type: "doc",
    content: nodes.length ? nodes : [{ type: "paragraph" }],
  };
};

const setMarkdown = (markdown = "", options = {}) => {
  if (!editor.value) return;

  const content = String(markdown || "");
  try {
    // Try using the editor's standard markdown parsing command first
    editor.value.commands.setContent(content, { emitUpdate: false });
  } catch (error) {
    console.warn(
      "[MarkdownEditor] Failed parsing markdown with standard parser, trying fallback:",
      error,
    );
    try {
      editor.value.commands.setContent(markdownWithCodeToDoc(content), {
        emitUpdate: false,
      });
    } catch (fallbackError) {
      console.error("[MarkdownEditor] Fallback markdown parsing failed:", fallbackError);
    }
  }

  updateWordAndCharCount(editor.value.getText() || content);

  if (options.emit) {
    emit("update:modelValue", getMarkdown() || content);
  }
};

onMounted(() => {
  editor.value = new Editor({
    content: "",
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
      Markdown,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editorProps: {
      attributes: {
        class: "forum-markdown-content",
      },
    },
    onUpdate: () => {
      const markdown = getMarkdown();
      emit("update:modelValue", markdown);
      updateWordAndCharCount(editor.value?.getText() || "");
      editorStateTrigger.value++;
    },
    onSelectionUpdate: () => {
      editorStateTrigger.value++;
    },
    onFocus: () => {
      isEditorFocused.value = true;
      emit("focus");
      editorStateTrigger.value++;
    },
    onBlur: () => {
      isEditorFocused.value = false;
      emit("blur");
      editorStateTrigger.value++;
    },
  });

  setMarkdown(props.modelValue || "");
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    if ((value || "") !== getMarkdown()) {
      setMarkdown(value || "");
    }
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

defineExpose({
  setMarkdown,
});

const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run();
const toggleCode = () => editor.value?.chain().focus().toggleCode().run();
const toggleCodeBlock = () => {
  if (!editor.value) return;

  const { empty } = editor.value.state.selection;
  editor.value.chain().focus().toggleCodeBlock().run();

  if (
    empty &&
    editor.value.isActive("codeBlock") &&
    !editor.value.getText().includes("// paste code here")
  ) {
    editor.value.chain().focus().insertContent("// paste code here").run();
  }
};
const toggleBlockquote = () =>
  editor.value?.chain().focus().toggleBlockquote().run();
const toggleHeading = (level) =>
  editor.value?.chain().focus().toggleHeading({ level }).run();
const setParagraph = () => editor.value?.chain().focus().setParagraph().run();
const toggleBulletList = () =>
  editor.value?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () =>
  editor.value?.chain().focus().toggleOrderedList().run();
const setHorizontalRule = () =>
  editor.value?.chain().focus().setHorizontalRule().run();
const undo = () => editor.value?.chain().focus().undo().run();
const redo = () => editor.value?.chain().focus().redo().run();

const showLinkModal = ref(false);
const linkUrl = ref("");
const linkText = ref("");
const linkUrlInputRef = ref(null);
const linkTextInputRef = ref(null);

const openLinkModal = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  linkUrl.value = previousUrl || "";

  if (editor.value) {
    const { from, to } = editor.value.state.selection;
    linkText.value = editor.value.state.doc.textBetween(from, to, " ") || "";
  } else {
    linkText.value = "";
  }

  showLinkModal.value = true;
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
  showLinkModal.value = false;

  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
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
          attrs: { href: normalizedUrl },
        },
      ],
    })
    .run();
};

const removeLink = () => {
  showLinkModal.value = false;
  editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
};

const showTextMenu = ref(false);

// Image Upload Logic
const showImageModal = ref(false);
const isDraggingImage = ref(false);
const imageInputRef = ref(null);
const uploadProgress = ref({});

const openImageModal = () => {
  showImageModal.value = true;
  uploadProgress.value = {};
};

const openImagePicker = () => {
  imageInputRef.value?.click();
};

const uploadImageFile = (file) => {
  const fileId = Math.random().toString(36).substring(7);
  uploadProgress.value[fileId] = {
    name: file.name,
    size: file.size,
    percent: 0,
    status: "uploading",
  };

  let currentPercent = 0;
  const interval = setInterval(() => {
    currentPercent += 10;
    if (uploadProgress.value[fileId]) {
      uploadProgress.value[fileId].percent = currentPercent;
    }

    if (currentPercent >= 100) {
      clearInterval(interval);
      if (uploadProgress.value[fileId]) {
        uploadProgress.value[fileId].status = "success";
      }

      // Convert local file to a temporary object URL so it displays in the editor body immediately
      const imageUrl = URL.createObjectURL(file);

      // Insert image in the Tiptap editor
      editor.value
        ?.chain()
        .focus()
        .setImage({ src: imageUrl, alt: file.name })
        .run();

      // Auto close modal after a brief delay if all successful
      setTimeout(() => {
        if (
          showImageModal.value &&
          Object.values(uploadProgress.value).every(
            (p) => p.status === "success"
          )
        ) {
          showImageModal.value = false;
        }
      }, 1500);
    }
  }, 150);
};

const handleImageFiles = (files) => {
  const imageFiles = Array.from(files).filter(
    (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
  );

  if (imageFiles.length === 0) {
    toast.error("Please select valid image files under 5MB.");
    return;
  }

  imageFiles.forEach(uploadImageFile);
};

const handleImageInput = (event) => {
  if (event.target.files) {
    handleImageFiles(event.target.files);
  }
  event.target.value = "";
};

const handleImageDrop = (event) => {
  isDraggingImage.value = false;
  if (event.dataTransfer?.files) {
    handleImageFiles(event.dataTransfer.files);
  }
};
</script>

<template>
  <div class="editor-container" :class="{ focused: isEditorFocused }">
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="handleImageInput"
    />

    <div v-if="editor" class="editor-toolbar">
      <div class="toolbar-left">
        <!-- Text Type Dropdown -->
        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn text-icon"
            :class="{ 'is-active': isOptionActive('heading') }"
            title="Text Formatting"
            @mousedown.prevent="showTextMenu = !showTextMenu"
          >
            <i class="bi bi-type"></i>
            <i class="bi bi-chevron-down small-chevron"></i>
          </button>

          <div v-if="showTextMenu" class="toolbar-dropdown">
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
            <button
              type="button"
              @mousedown.prevent="
                setParagraph();
                showTextMenu = false;
              "
              :class="{ 'is-active': isOptionActive('paragraph') }"
            >
              <i class="bi bi-paragraph"></i> Paragraph
            </button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Inline formatting -->
        <div class="toolbar-group">
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
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            @mousedown.prevent="toggleCode"
            :class="{ 'is-active': isOptionActive('code') }"
            class="toolbar-btn"
            title="Inline code"
          >
            <i class="bi bi-code-slash"></i>
          </button>
          <button
            type="button"
            @mousedown.prevent="toggleCodeBlock"
            :class="{ 'is-active': isOptionActive('codeBlock') }"
            class="toolbar-btn"
            title="Code block"
          >
            <i class="bi bi-braces"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Link, Quote, Image -->
        <div class="toolbar-group">
          <button
            type="button"
            @mousedown.prevent="openLinkModal"
            :class="{ 'is-active': isOptionActive('link') }"
            class="toolbar-btn"
            title="Link"
          >
            <i class="bi bi-link-45deg"></i>
          </button>
          <button
            type="button"
            @mousedown.prevent="toggleBlockquote"
            :class="{ 'is-active': isOptionActive('blockquote') }"
            class="toolbar-btn"
            title="Blockquote"
          >
            <i class="bi bi-quote"></i>
          </button>
          <button
            type="button"
            @mousedown.prevent="openImageModal"
            class="toolbar-btn"
            title="Add Image"
          >
            <i class="bi bi-image"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Lists -->
        <div class="toolbar-group">
          <button
            type="button"
            @mousedown.prevent="toggleOrderedList"
            :class="{ 'is-active': isOptionActive('orderedList') }"
            class="toolbar-btn"
            title="Numbered list"
          >
            <i class="bi bi-list-ol"></i>
          </button>
          <button
            type="button"
            @mousedown.prevent="toggleBulletList"
            :class="{ 'is-active': isOptionActive('bulletList') }"
            class="toolbar-btn"
            title="Bulleted list"
          >
            <i class="bi bi-list-ul"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
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
        </div>
      </div>
    </div>

    <!-- MARKDOWN EDITOR CONTENT -->
    <div class="editor-workspace">
      <editor-content :editor="editor" class="editor-textarea" />
    </div>

    <!-- EDITOR BOTTOM STATUS BAR -->
    <div class="editor-status-bar">
      <div class="status-left">
        <span class="status-counter">
          <i class="bi bi-chat-left-text"></i>
          <strong>{{ wordCount }}</strong> words
        </span>
        <span class="status-divider"></span>
        <span class="status-counter">
          <strong>{{ charCount }}</strong> characters
        </span>
      </div>

      <div class="status-right">
        <transition name="fade">
          <span v-if="props.isDraftSaved" class="autosave-status saved">
            <i class="bi bi-cloud-check-fill"></i> Draft autosaved
            {{ props.lastSavedTime ? "(" + props.lastSavedTime + ")" : "" }}
          </span>
          <span v-else class="autosave-status saving">
            <i class="bi bi-cloud-arrow-up"></i> Idle (Auto-saving enabled)
          </span>
        </transition>
      </div>
    </div>
  </div>

  <BaseModal
    v-if="showLinkModal"
    title="Insert Link"
    icon="bi bi-link-45deg"
    theme="primary"
    @closeModal="showLinkModal = false"
  >
    <div class="link-modal-body">
      <div class="form-group mb-3">
        <label for="link-text-input" class="form-label small fw-bold text-muted">Link Text</label>
        <input
          id="link-text-input"
          ref="linkTextInputRef"
          v-model="linkText"
          type="text"
          class="form-control"
          placeholder="e.g. Google"
          @keydown.enter.prevent="saveLink"
        />
      </div>
      <div class="form-group mb-3">
        <label for="link-url-input" class="form-label small fw-bold text-muted">URL</label>
        <input
          id="link-url-input"
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
          @click="showLinkModal = false"
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
      <strong>Maximum 5MB image files.</strong>
    </div>

    <!-- Upload progress list -->
    <div v-if="Object.keys(uploadProgress).length > 0" class="upload-progress-list mt-3">
      <div v-for="(file, id) in uploadProgress" :key="id" class="upload-progress-item">
        <div class="file-info">
          <i class="bi bi-file-earmark-image-fill file-icon"></i>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size" v-if="file.size">{{ (file.size / 1024).toFixed(1) }} KB</span>
          </div>
          <span class="progress-percent" :class="file.status">{{ file.percent }}%</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill" 
            :class="file.status" 
            :style="{ width: file.percent + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
/* Color variables fallback if not loaded */
:root {
  --brand: var(--color-blue);
  --brand-light: var(--color-blue-light);
  --brand-hover: var(--color-blue);
  --text-dark: var(--color-text);
  --shadow-lg: var(--shadow-lg);
}

.editor-container {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  background: var(--color-surface);
}

.editor-container.focused {
  border-color: var(--color-blue);
  box-shadow: var(--focus-ring);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.toolbar-divider {
  width: 1.5px;
  height: 20px;
  background: var(--color-border);
  margin: 0 6px;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: var(--color-border-soft);
  color: var(--color-text);
}

.toolbar-btn.is-active {
  background: var(--color-blue-light);
  color: var(--color-blue);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.25);
}

[data-theme="dark"] .toolbar-btn.is-active {
  background: rgba(125, 160, 202, 0.18);
  color: var(--color-blue);
  box-shadow: inset 0 0 0 1px rgba(125, 160, 202, 0.35);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.text-icon {
  width: auto;
  padding: 0 8px;
  font-size: 13.5px;
  font-weight: 600;
  gap: 4px;
}

.small-chevron {
  font-size: 10px;
}

.toolbar-popover-wrapper {
  position: relative;
}

.toolbar-dropdown {
  position: absolute;
  top: 38px;
  left: 0;
  min-width: 170px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 100;
}

.toolbar-dropdown button {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  font-size: 13px;
  color: var(--color-text-muted);
  border-radius: 8px;
  cursor: pointer;
}

.toolbar-dropdown button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.toolbar-dropdown button.is-active {
  background: var(--color-blue-light);
  color: var(--color-blue);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.25);
}

[data-theme="dark"] .toolbar-dropdown button.is-active {
  background: rgba(125, 160, 202, 0.18);
  color: var(--color-blue);
  box-shadow: inset 0 0 0 1px rgba(125, 160, 202, 0.35);
}

/* Workspace panes */
.editor-workspace {
  display: flex;
  min-height: 400px;
  background: var(--color-surface);
}

.editor-textarea {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 600px;
}

/* Tiptap specific styling */
:deep(.tiptap) {
  outline: none;
  min-height: 360px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
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
  font-family: inherit;
  color: var(--color-text);
  font-weight: 800;
  margin: 20px 0 10px;
  letter-spacing: -0.3px;
}

:deep(.tiptap h1) {
  font-size: 24px;
}
:deep(.tiptap h2) {
  font-size: 20px;
}
:deep(.tiptap h3) {
  font-size: 16px;
}

:deep(.tiptap p) {
  margin-bottom: 12px;
}

:deep(.tiptap img) {
  display: block;
  max-width: 100%;
  max-height: 360px;
  margin: 14px 0;
  object-fit: contain;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

:deep(.tiptap blockquote) {
  border-left: 4px solid var(--color-blue);
  padding: 8px 16px;
  background: var(--color-blue-light);
  color: var(--color-text-muted);
  border-radius: 0 8px 8px 0;
  margin: 16px 0;
  font-style: italic;
}

:deep(.tiptap code) {
  background: var(--color-surface-hover);
  color: var(--color-danger);
  padding: 3px 6px;
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
}

:deep(.tiptap pre) {
  background: color-mix(in srgb, #050816 92%, var(--color-surface) 8%);
  color: #f4efff;
  padding: 18px 22px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-blue) 54%, transparent);
  overflow-x: auto;
  margin: 16px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

:deep(.tiptap pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 15px;
  line-height: 1.6;
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}

:deep(.tiptap a) {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1.5px solid var(--color-blue-light);
  cursor: pointer;
}

:deep(.tiptap a:hover) {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

:deep(.tiptap hr) {
  border: none;
  border-top: 1.5px dashed var(--color-border);
  margin: 24px 0;
}

/* Status Bar */
.editor-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--color-surface-hover);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 12px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-counter i {
  margin-right: 4px;
}

.status-divider {
  width: 1px;
  height: 14px;
  background: var(--color-border);
}

.autosave-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.autosave-status.saved {
  color: var(--color-success);
}

.autosave-status.saving {
  color: var(--color-text-muted);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Image Dropzone styles */
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

/* Upload Progress styles */
.upload-progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.upload-progress-item {
  background: var(--color-surface-hover);
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.file-icon {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.file-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.progress-percent {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-primary);
}

.progress-percent.success {
  color: var(--color-success);
}

.progress-percent.error {
  color: var(--color-danger);
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  width: 0%;
  background: var(--color-primary);
  transition: width 0.2s ease;
  border-radius: 99px;
}

.progress-bar-fill.success {
  background: var(--color-success);
}

.progress-bar-fill.error {
  background: var(--color-danger);
}

/* Editor content image styles */
:deep(.tiptap img) {
  display: block;
  max-width: 100%;
  max-height: 400px;
  margin: 1.5rem 0;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
</style>
