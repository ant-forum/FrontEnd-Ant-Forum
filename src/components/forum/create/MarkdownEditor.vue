<script setup>
import { ref, computed, nextTick } from "vue";
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

const textareaRef = ref(null);
const imageInputRef = ref(null);

const isEditorFocused = ref(false);

const showTextMenu = ref(false);
const showMoreMenu = ref(false);
const showLinkPopup = ref(false);

// Editor Modes: 'edit', 'preview', 'split'
const editorMode = ref("edit");

const linkForm = ref({
  url: "",
  text: "",
});

let savedSelection = null;

// Writable computed for standard Vue 3 v-model binding
const content = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

// Word and character counts
const wordCount = computed(() => {
  const text = props.modelValue.trim();
  return text === "" ? 0 : text.split(/\s+/).length;
});
const charCount = computed(() => props.modelValue.length);

// Selection and Focus Utils
const focusTextarea = async () => {
  await nextTick();
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
};

const getSelection = () => {
  const textarea = textareaRef.value;
  if (!textarea) {
    return { start: 0, end: 0, selected: "" };
  }
  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
    selected: props.modelValue.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    ),
  };
};

const replaceSelection = async (text, cursorOffset = null) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  content.value =
    props.modelValue.substring(0, start) +
    text +
    props.modelValue.substring(end);

  await nextTick();
  textarea.focus();

  const cursorPosition =
    cursorOffset === null ? start + text.length : start + cursorOffset;

  textarea.selectionStart = cursorPosition;
  textarea.selectionEnd = cursorPosition;
};

const wrapSelection = async (before, after, placeholder = "text") => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = props.modelValue.substring(start, end);
  const selectedContent = selected || placeholder;

  const inserted = `${before}${selectedContent}${after}`;

  content.value =
    props.modelValue.substring(0, start) +
    inserted +
    props.modelValue.substring(end);

  await nextTick();
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selectedContent.length;
};

const prefixSelectedLines = async (prefix, fallbackText) => {
  const { selected } = getSelection();
  const selectedContent = selected || fallbackText;
  const changed = selectedContent
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");

  await replaceSelection(changed);
};

const applyTextStyle = async (style) => {
  showTextMenu.value = false;

  if (style === "h1") {
    await replaceSelection("\n# Heading 1\n");
  } else if (style === "h2") {
    await replaceSelection("\n## Heading 2\n");
  } else if (style === "h3") {
    await replaceSelection("\n### Heading 3\n");
  } else if (style === "paragraph") {
    await focusTextarea();
  }
};

const openLinkPopup = async () => {
  await focusTextarea();

  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = props.modelValue.substring(start, end);

  savedSelection = { start, end };
  linkForm.value.url = "";
  linkForm.value.text = selected || "";

  showLinkPopup.value = true;
  showTextMenu.value = false;
  showMoreMenu.value = false;
};

const saveLink = async () => {
  if (!linkForm.value.url.trim()) return;

  const url = linkForm.value.url.trim();
  const text = linkForm.value.text.trim() || url;
  const inserted = `[${text}](${url})`;

  if (savedSelection) {
    const start = savedSelection.start;
    const end = savedSelection.end;

    content.value =
      props.modelValue.substring(0, start) +
      inserted +
      props.modelValue.substring(end);

    await nextTick();
    textareaRef.value.focus();
    textareaRef.value.selectionStart = start + inserted.length;
    textareaRef.value.selectionEnd = start + inserted.length;
  }

  showLinkPopup.value = false;
  savedSelection = null;
  toast.success("Link inserted!");
};

const cancelLink = () => {
  showLinkPopup.value = false;
  savedSelection = null;
};

const insertFormat = async (command) => {
  showTextMenu.value = false;
  showMoreMenu.value = false;

  if (command === "bold") {
    await wrapSelection("**", "**", "bold text");
  } else if (command === "italic") {
    await wrapSelection("*", "*", "italic text");
  } else if (command === "strikeThrough") {
    await wrapSelection("~~", "~~", "strike text");
  } else if (command === "code") {
    await wrapSelection("`", "`", "code");
  } else if (command === "pre") {
    const { selected } = getSelection();
    const code = selected || "code here";
    await replaceSelection(`\n\`\`\`\n${code}\n\`\`\`\n`);
  } else if (command === "blockquote") {
    await prefixSelectedLines("> ", "quote text");
  } else if (command === "insertOrderedList") {
    const { selected } = getSelection();
    if (selected) {
      const lines = selected
        .split("\n")
        .map((line, index) => `${index + 1}. ${line}`)
        .join("\n");
      await replaceSelection(lines);
    } else {
      await replaceSelection("\n1. item one\n2. item two\n");
    }
  } else if (command === "insertUnorderedList") {
    const { selected } = getSelection();
    if (selected) {
      const lines = selected
        .split("\n")
        .map((line) => `- ${line}`)
        .join("\n");
      await replaceSelection(lines);
    } else {
      await replaceSelection("\n- item one\n- item two\n");
    }
  } else if (command === "insertHorizontalRule") {
    await replaceSelection("\n\n---\n\n");
  } else if (command === "table") {
    await replaceSelection(
      "\n| Column 1 | Column 2 |\n| --- | --- |\n| Text | Text |\n"
    );
  } else if (command === "createLink") {
    await openLinkPopup();
  } else if (command === "undo") {
    textareaRef.value?.focus();
    document.execCommand("undo");
  } else if (command === "redo") {
    textareaRef.value?.focus();
    document.execCommand("redo");
  }
};

const clearFormatting = async () => {
  showMoreMenu.value = false;

  content.value = props.modelValue
    .replaceAll("**", "")
    .replaceAll("~~", "")
    .replaceAll("`", "")
    .replace(/^\s*#+\s/gm, "")
    .replace(/^\s*>\s/gm, "")
    .replace(/^\s*-\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "");

  await focusTextarea();
  toast.success("Formattings cleared.");
};

const triggerImageUpload = async () => {
  await focusTextarea();
  imageInputRef.value?.click();
};

const uploadImageToServer = async (file) => {
  return URL.createObjectURL(file);
};

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const imageUrl = await uploadImageToServer(file);
  const imageLink = `[${file.name}](${imageUrl})`;

  await replaceSelection(`\n${imageLink}\n`);
  event.target.value = "";
  toast.success("Image reference inserted!");
};

// Editor Hotkeys Down Listener
const handleEditorKeydown = (e) => {
  const isMeta = e.ctrlKey || e.metaKey;

  if (isMeta && e.key === "b") {
    e.preventDefault();
    insertFormat("bold");
  } else if (isMeta && e.key === "i") {
    e.preventDefault();
    insertFormat("italic");
  } else if (isMeta && e.key === "k") {
    e.preventDefault();
    insertFormat("createLink");
  } else if (isMeta && e.key === "/") {
    e.preventDefault();
    if (editorMode.value === "edit") editorMode.value = "preview";
    else if (editorMode.value === "preview") editorMode.value = "split";
    else editorMode.value = "edit";
  }
};

// Markdown Rendering Methods
const escapeHtml = (text = "") => {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const renderInlineMarkdown = (text = "") => {
  let html = escapeHtml(text);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const label = alt || url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  return html;
};

const splitTableRow = (line = "") => {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
};

const isTableSeparator = (line = "") => {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
};

const isSpecialMarkdownLine = (line = "", nextLine = "") => {
  const trimmed = line.trim();

  return (
    trimmed.startsWith("```") ||
    trimmed.startsWith("# ") ||
    trimmed.startsWith("## ") ||
    trimmed.startsWith("### ") ||
    trimmed.startsWith("> ") ||
    trimmed.startsWith("- ") ||
    /^\d+\.\s+/.test(trimmed) ||
    trimmed === "---" ||
    (line.includes("|") && isTableSeparator(nextLine))
  );
};

const markdownToHtml = (markdown = "") => {
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const output = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1] || "";

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      i++;

      const codeLines = [];

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }

      output.push(
        `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
      );
      continue;
    }

    if (trimmed === "---") {
      output.push("<hr>");
      i++;
      continue;
    }

    if (line.includes("|") && isTableSeparator(nextLine)) {
      const headers = splitTableRow(line);
      i += 2;

      const rows = [];

      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }

      const headerHtml = headers
        .map((header) => `<th>${renderInlineMarkdown(header)}</th>`)
        .join("");

      const rowsHtml = rows
        .map((row) => {
          const cellsHtml = row
            .map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`)
            .join("");

          return `<tr>${cellsHtml}</tr>`;
        })
        .join("");

      output.push(`
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `);

      continue;
    }

    if (trimmed.startsWith("### ")) {
      output.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      output.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      output.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines = [];

      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }

      output.push(
        `<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items = [];

      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().replace(/^-\s?/, ""));
        i++;
      }

      output.push(
        `<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];

      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }

      output.push(
        `<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`
      );
      continue;
    }

    const paragraphLines = [];

    while (
      i < lines.length &&
      lines[i].trim() &&
      !isSpecialMarkdownLine(lines[i], lines[i + 1] || "")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    output.push(
      `<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`
    );
  }

  return output.join("\n");
};

const previewContent = computed(() => {
  return markdownToHtml(props.modelValue || "");
});

const handleFocus = () => {
  isEditorFocused.value = true;
  emit("focus");
};

const handleBlur = () => {
  isEditorFocused.value = false;
  emit("blur");
};
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

    <!-- EDITOR TOOLBAR WITH SELECTION SHORTCUTS -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <!-- Text dropdown -->
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
              @mousedown.prevent="applyTextStyle('h1')"
            >
              <i class="bi bi-type-h1"></i> Heading 1
            </button>
            <button
              type="button"
              @mousedown.prevent="applyTextStyle('h2')"
            >
              <i class="bi bi-type-h2"></i> Heading 2
            </button>
            <button
              type="button"
              @mousedown.prevent="applyTextStyle('h3')"
            >
              <i class="bi bi-type-h3"></i> Heading 3
            </button>
            <button
              type="button"
              @mousedown.prevent="applyTextStyle('paragraph')"
            >
              <i class="bi bi-paragraph"></i> Paragraph
            </button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Bold"
            @mousedown.prevent="insertFormat('bold')"
          >
            <i class="bi bi-type-bold"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Italic"
            @mousedown.prevent="insertFormat('italic')"
          >
            <i class="bi bi-type-italic"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Strikethrough"
            @mousedown.prevent="insertFormat('strikeThrough')"
          >
            <i class="bi bi-type-strikethrough"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Inline code"
            @mousedown.prevent="insertFormat('code')"
          >
            <i class="bi bi-code-slash"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Code block"
            @mousedown.prevent="insertFormat('pre')"
          >
            <i class="bi bi-braces"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Link"
            @mousedown.prevent="insertFormat('createLink')"
          >
            <i class="bi bi-link-45deg"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Blockquote"
            @mousedown.prevent="insertFormat('blockquote')"
          >
            <i class="bi bi-quote"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Upload Image"
            @mousedown.prevent="triggerImageUpload"
          >
            <i class="bi bi-card-image"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Table"
            @mousedown.prevent="insertFormat('table')"
          >
            <i class="bi bi-table"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            title="Numbered list"
            @mousedown.prevent="insertFormat('insertOrderedList')"
          >
            <i class="bi bi-list-ol"></i>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Bulleted list"
            @mousedown.prevent="insertFormat('insertUnorderedList')"
          >
            <i class="bi bi-list-ul"></i>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-popover-wrapper">
          <button
            type="button"
            class="toolbar-btn"
            title="More Options"
            @mousedown.prevent="showMoreMenu = !showMoreMenu"
          >
            <i class="bi bi-three-dots"></i>
          </button>

          <div v-if="showMoreMenu" class="toolbar-dropdown more-dropdown">
            <button
              type="button"
              @mousedown.prevent="insertFormat('insertHorizontalRule')"
            >
              <i class="bi bi-hr"></i> Insert Divider
            </button>
            <button
              type="button"
              @mousedown.prevent="clearFormatting"
            >
              <i class="bi bi-eraser"></i> Clear Formatting
            </button>
            <button
              type="button"
              @mousedown.prevent="insertFormat('undo')"
            >
              <i class="bi bi-arrow-counterclockwise"></i> Undo
            </button>
            <button
              type="button"
              @mousedown.prevent="insertFormat('redo')"
            >
              <i class="bi bi-arrow-clockwise"></i> Redo
            </button>
          </div>
        </div>
      </div>

      <!-- EDITOR VIEW MODE TABS -->
      <div class="toolbar-right">
        <div class="editor-tabs-group">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: editorMode === 'edit' }"
            @click="editorMode = 'edit'"
          >
            <i class="bi bi-pencil-fill"></i>
            <span>Edit</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: editorMode === 'preview' }"
            @click="editorMode = 'preview'"
          >
            <i class="bi bi-eye-fill"></i>
            <span>Preview</span>
          </button>
          <button
            type="button"
            class="tab-btn d-none d-lg-inline-flex"
            :class="{ active: editorMode === 'split' }"
            @click="editorMode = 'split'"
          >
            <i class="bi bi-columns-gap"></i>
            <span>Split</span>
          </button>
        </div>
      </div>
    </div>

    <!-- LINK POPUP DIALOG -->
    <div v-if="showLinkPopup" class="link-popup-panel">
      <div class="popup-title">Insert Link</div>
      <div class="popup-fields-row">
        <div class="popup-field">
          <label>Link URL</label>
          <input
            v-model="linkForm.url"
            type="text"
            class="popup-input"
            placeholder="https://example.com"
          />
        </div>

        <div class="popup-field">
          <label>Link text</label>
          <input
            v-model="linkForm.text"
            type="text"
            class="popup-input"
            placeholder="Link text"
          />
        </div>
      </div>

      <div class="popup-actions">
        <button type="button" class="btn-save" @click="saveLink">
          Save Link
        </button>
        <button type="button" class="btn-cancel-link" @click="cancelLink">
          Cancel
        </button>
      </div>
    </div>

    <!-- CORE EDITOR INPUT AREA (FLEXIBLE OR SPLIT) -->
    <div
      class="editor-workspace"
      :class="{ 'split-layout': editorMode === 'split' }"
    >
      <!-- Text Area Pane -->
      <div
        v-show="editorMode === 'edit' || editorMode === 'split'"
        class="editor-pane textarea-pane"
      >
        <textarea
          ref="textareaRef"
          v-model="content"
          class="editor-textarea"
          :placeholder="placeholder"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleEditorKeydown"
        ></textarea>
      </div>

      <!-- Rendered HTML Preview Pane -->
      <div
        v-show="editorMode === 'preview' || editorMode === 'split'"
        class="editor-pane preview-pane"
      >
        <div
          v-if="props.modelValue.trim()"
          class="preview-body markdown-rendered"
          v-html="previewContent"
        ></div>
        <div v-else class="preview-empty">
          <i class="bi bi-file-earmark-text"></i>
          <p>
            Your beautiful rendered preview will appear here in real-time.
          </p>
        </div>
      </div>
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

.toolbar-right {
  display: flex;
  align-items: center;
}

/* Tabs modes in Editor */
.editor-tabs-group {
  display: flex;
  background: var(--color-border);
  padding: 3px;
  border-radius: 10px;
  gap: 2px;
}

.editor-tabs-group .tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editor-tabs-group .tab-btn:hover {
  color: var(--color-text);
}

.editor-tabs-group .tab-btn.active {
  background: var(--color-surface);
  color: var(--color-purple);
  box-shadow: var(--shadow-sm);
}

/* Editor Link popup styling */
.link-popup-panel {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.popup-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-purple);
  margin-bottom: 12px;
}

.popup-fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.popup-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popup-field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.popup-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s ease;
}

.popup-input:focus {
  border-color: var(--color-purple);
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-save {
  padding: 8px 16px;
  background: var(--color-purple);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover {
  filter: brightness(0.9);
}

.btn-cancel-link {
  padding: 8px 16px;
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

/* Workspace panes */
.editor-workspace {
  display: flex;
  height: 500px;
  background: var(--color-surface);
}

.editor-pane {
  flex: 1;
  overflow-y: auto;
}

.split-layout .editor-pane:first-child {
  border-right: 1.5px solid var(--color-border);
}

.editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  padding: 20px;
  font-family: "JetBrains Mono", "Menlo", monospace;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--color-text);
  background: transparent;
  outline: none;
}

/* Live Preview Panel */
.preview-pane {
  border-left: 1px solid var(--color-border);
  padding: 20px 24px;
  background: var(--color-bg);
  overflow-y: auto;
  max-height: 600px;
}

.preview-body {
  line-height: 1.7;
  color: var(--color-text);
  font-size: 14.5px;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3) {
  font-family: inherit;
  color: var(--color-text);
  font-weight: 800;
  margin: 20px 0 10px;
  letter-spacing: -0.3px;
}

.preview-body :deep(h1) {
  font-size: 22px;
}
.preview-body :deep(h2) {
  font-size: 18px;
}
.preview-body :deep(h3) {
  font-size: 15.5px;
}

.preview-body :deep(p) {
  margin-bottom: 12px;
}

.preview-body :deep(blockquote) {
  border-left: 4px solid var(--color-purple);
  padding: 8px 16px;
  background: var(--color-purple-light);
  color: var(--color-text-muted);
  border-radius: 0 8px 8px 0;
  margin: 16px 0;
  font-style: italic;
}

.preview-body :deep(code) {
  background: var(--color-surface-hover);
  color: var(--color-danger);
  padding: 3px 6px;
  border-radius: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 12.5px;
}

.preview-body :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

.preview-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 13px;
  line-height: 1.6;
}

.preview-body :deep(a) {
  color: var(--color-purple);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1.5px solid var(--color-purple-light);
}

.preview-body :deep(a:hover) {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.preview-body :deep(hr) {
  border: none;
  border-top: 1.5px dashed var(--color-border);
  margin: 24px 0;
}

.preview-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  border: 1px solid var(--color-border);
}

.preview-body :deep(th),
.preview-body :deep(td) {
  border: 1px solid var(--color-border);
  padding: 10px 12px;
  font-size: 13px;
  color: var(--color-text);
}

.preview-body :deep(th) {
  background: var(--color-surface-hover);
  font-weight: 700;
  color: var(--color-text);
}

.preview-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  text-align: center;
  padding: 40px 0;
}

.preview-empty i {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.preview-empty p {
  font-size: 13.5px;
  font-style: italic;
  max-width: 240px;
  margin: 0;
}

/* Split screen layout */
.editor-workspace.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.editor-workspace.split-layout .preview-pane {
  max-height: none;
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
