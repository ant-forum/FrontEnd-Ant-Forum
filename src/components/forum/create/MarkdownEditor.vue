<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import { useToast } from "@/composables/useToast.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Write details of your discussion, question, or tutorial here. Markdown and keyboard shortcuts are supported...",
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
const imageInputRef = ref(null);
const isEditorFocused = ref(false);

const wordCount = ref(0);
const charCount = ref(0);

const updateWordAndCharCount = (text) => {
  const plainText = text || '';
  charCount.value = plainText.length;
  const words = plainText.trim();
  wordCount.value = words ? words.split(/\s+/).length : 0;
};

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit,
      Markdown,
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
        types: ['heading', 'paragraph'],
      }),
    ],
    onUpdate: () => {
      if (editor.value) {
        const markdown = editor.value.storage.markdown.getMarkdown();
        emit("update:modelValue", markdown);
        updateWordAndCharCount(editor.value.getText());
      }
    },
    onFocus: () => {
      isEditorFocused.value = true;
      emit("focus");
    },
    onBlur: () => {
      isEditorFocused.value = false;
      emit("blur");
    },
  });
  
  if (editor.value) {
     updateWordAndCharCount(editor.value.getText());
  }
});

watch(() => props.modelValue, (value) => {
  if (!editor.value) return;
  const currentMarkdown = editor.value.storage.markdown.getMarkdown();
  if (currentMarkdown !== value) {
    editor.value.commands.setContent(value);
  }
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});

const toggleBold = () => editor.value?.chain().focus().toggleBold().run();
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run();
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run();
const toggleCode = () => editor.value?.chain().focus().toggleCode().run();
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run();
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run();
const toggleHeading = (level) => editor.value?.chain().focus().toggleHeading({ level }).run();
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run();
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run();
const setHorizontalRule = () => editor.value?.chain().focus().setHorizontalRule().run();
const undo = () => editor.value?.chain().focus().undo().run();
const redo = () => editor.value?.chain().focus().redo().run();

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  
  editor.value?.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
  
  event.target.value = "";
  toast.success("Image reference inserted!");
};

const setLink = () => {
  const previousUrl = editor.value?.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // update link
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

const showTextMenu = ref(false);
</script>

<template>
  <div class="editor-container" :class="{ focused: isEditorFocused }">
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      hidden
      @change="handleImageUpload"
    />

    <div v-if="editor" class="editor-toolbar">
      <div class="toolbar-left">
        <!-- Text Type Dropdown -->
        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn text-icon"
            title="Text Formatting"
            @mousedown.prevent="showTextMenu = !showTextMenu"
          >
            <i class="bi bi-type"></i>
            <i class="bi bi-chevron-down small-chevron"></i>
          </button>

          <div v-if="showTextMenu" class="toolbar-dropdown">
             <button
              type="button"
              @mousedown.prevent="toggleHeading(1); showTextMenu = false"
              :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            >
              <i class="bi bi-type-h1"></i> Heading 1
            </button>
            <button
              type="button"
              @mousedown.prevent="toggleHeading(2); showTextMenu = false"
              :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            >
              <i class="bi bi-type-h2"></i> Heading 2
            </button>
            <button
              type="button"
              @mousedown.prevent="toggleHeading(3); showTextMenu = false"
              :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
            >
              <i class="bi bi-type-h3"></i> Heading 3
            </button>
            <button
              type="button"
              @mousedown.prevent="editor.chain().focus().setParagraph().run(); showTextMenu = false"
              :class="{ 'is-active': editor.isActive('paragraph') }"
            >
              <i class="bi bi-paragraph"></i> Paragraph
            </button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Inline formatting -->
        <div class="toolbar-group">
          <button @mousedown.prevent="toggleBold" :class="{ 'is-active': editor.isActive('bold') }" class="toolbar-btn" title="Bold">
            <i class="bi bi-type-bold"></i>
          </button>
          <button @mousedown.prevent="toggleItalic" :class="{ 'is-active': editor.isActive('italic') }" class="toolbar-btn" title="Italic">
            <i class="bi bi-type-italic"></i>
          </button>
          <button @mousedown.prevent="toggleStrike" :class="{ 'is-active': editor.isActive('strike') }" class="toolbar-btn" title="Strikethrough">
            <i class="bi bi-type-strikethrough"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @mousedown.prevent="toggleCode" :class="{ 'is-active': editor.isActive('code') }" class="toolbar-btn" title="Inline code">
            <i class="bi bi-code-slash"></i>
          </button>
          <button @mousedown.prevent="toggleCodeBlock" :class="{ 'is-active': editor.isActive('codeBlock') }" class="toolbar-btn" title="Code block">
            <i class="bi bi-braces"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Link, Quote, Image -->
        <div class="toolbar-group">
          <button @mousedown.prevent="setLink" :class="{ 'is-active': editor.isActive('link') }" class="toolbar-btn" title="Link">
            <i class="bi bi-link-45deg"></i>
          </button>
          <button @mousedown.prevent="toggleBlockquote" :class="{ 'is-active': editor.isActive('blockquote') }" class="toolbar-btn" title="Blockquote">
            <i class="bi bi-quote"></i>
          </button>
          <button @mousedown.prevent="triggerImageUpload" class="toolbar-btn" title="Upload Image">
            <i class="bi bi-card-image"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Lists -->
        <div class="toolbar-group">
          <button @mousedown.prevent="toggleOrderedList" :class="{ 'is-active': editor.isActive('orderedList') }" class="toolbar-btn" title="Numbered list">
            <i class="bi bi-list-ol"></i>
          </button>
          <button @mousedown.prevent="toggleBulletList" :class="{ 'is-active': editor.isActive('bulletList') }" class="toolbar-btn" title="Bulleted list">
            <i class="bi bi-list-ul"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
           <button @mousedown.prevent="setHorizontalRule" class="toolbar-btn" title="Divider">
            <i class="bi bi-hr"></i>
          </button>
          <button @mousedown.prevent="undo" :disabled="!editor.can().undo()" class="toolbar-btn" title="Undo">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button @mousedown.prevent="redo" :disabled="!editor.can().redo()" class="toolbar-btn" title="Redo">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- TIPTAP EDITOR CONTENT -->
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
            {{ props.lastSavedTime ? '(' + props.lastSavedTime + ')' : '' }}
          </span>
          <span v-else class="autosave-status saving">
            <i class="bi bi-cloud-arrow-up"></i> Idle (Auto-saving enabled)
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Color variables fallback if not loaded */
:root {
  --brand: var(--color-purple);
  --brand-light: var(--color-purple-light);
  --brand-hover: var(--color-purple);
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
  border-color: var(--color-purple);
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
  background: var(--color-purple-light);
  color: var(--color-purple);
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
  background: var(--color-purple-light);
  color: var(--color-purple);
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

:deep(.tiptap h1) { font-size: 24px; }
:deep(.tiptap h2) { font-size: 20px; }
:deep(.tiptap h3) { font-size: 16px; }

:deep(.tiptap p) { margin-bottom: 12px; }

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
  border-left: 4px solid var(--color-purple);
  padding: 8px 16px;
  background: var(--color-purple-light);
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
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

:deep(.tiptap pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 13px;
  line-height: 1.6;
}

:deep(.tiptap a) {
  color: var(--color-purple);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1.5px solid var(--color-purple-light);
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
</style>
