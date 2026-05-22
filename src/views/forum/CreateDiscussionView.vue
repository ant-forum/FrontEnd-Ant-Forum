<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useForumStore } from "../../stores/ForumStore";
import Navbar from "../../components/layouts/header.vue";
import { useToast } from "vue-toastification";

const router = useRouter();
const forumStore = useForumStore();
const toast = useToast();

const textareaRef = ref(null);
const imageInputRef = ref(null);

const isEditorFocused = ref(false);
const isSubmitting = ref(false);

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

// Form State
const form = ref({
  title: "",
  excerpt: "",
  category: "question",
  code: "",
  hasCode: false,
});

// Interactive Tag system
const tagsList = ref([]);
const tagInput = ref("");
const suggestedTags = [
  "Vue.js",
  "React",
  "Pinia",
  "TailwindCSS",
  "CSS",
  "JavaScript",
  "Node.js",
  "System Design",
  "HTML",
  "MongoDB",
];

const getTagColor = (tag) => {
  const lower = tag.toLowerCase().trim();
  if (lower.includes("vue") || lower.includes("pinia")) return "green";
  if (lower.includes("react") || lower.includes("native")) return "blue";
  if (lower.includes("css") || lower.includes("tailwind")) return "teal";
  if (
    lower.includes("js") ||
    lower.includes("javascript") ||
    lower.includes("node")
  )
    return "yellow";
  if (
    lower.includes("design") ||
    lower.includes("architecture") ||
    lower.includes("system")
  )
    return "purple";
  if (lower.includes("html")) return "orange";
  if (lower.includes("mongo") || lower.includes("sql") || lower.includes("db"))
    return "pink";
  return ["blue", "purple", "green", "orange", "pink", "teal"][
    Math.floor(Math.random() * 6)
  ];
};

const tagColorMap = {
  blue: { bg: "#dbeafe", color: "#1d4ed8" },
  orange: { bg: "#ffedd5", color: "#c2410c" },
  green: { bg: "#dcfce7", color: "#15803d" },
  purple: { bg: "#ede9fe", color: "#7c3aed" },
  pink: { bg: "#fce7f3", color: "#be185d" },
  teal: { bg: "#ccfbf1", color: "#0f766e" },
  red: { bg: "#fee2e2", color: "#dc2626" },
  gray: { bg: "#f3f4f6", color: "#374151" },
  yellow: { bg: "#fef9c3", color: "#854d0e" },
};

const getTagChipStyle = (color) => {
  const t = tagColorMap[color] || tagColorMap.gray;
  return { background: t.bg, color: t.color };
};

const addTag = (tagText) => {
  if (!tagText) return;
  const clean = tagText.trim();
  if (!clean) return;

  if (
    tagsList.value.some((t) => t.label.toLowerCase() === clean.toLowerCase())
  ) {
    toast.warning(`Tag "${clean}" has already been added.`);
    tagInput.value = "";
    return;
  }

  if (tagsList.value.length >= 5) {
    toast.warning("A maximum of 5 tags is allowed.");
    return;
  }

  tagsList.value.push({
    label: clean,
    color: getTagColor(clean),
  });

  tagInput.value = "";
};

const removeTag = (index) => {
  tagsList.value.splice(index, 1);
};

const handleTagKeydown = (e) => {
  if (e.key === " " || e.key === "," || e.key === "Enter") {
    e.preventDefault();
    addTag(tagInput.value);
  } else if (
    e.key === "Backspace" &&
    !tagInput.value &&
    tagsList.value.length > 0
  ) {
    removeTag(tagsList.value.length - 1);
  }
};

// Categories and templates
const categories = [
  {
    id: "question",
    label: "Question",
    icon: "bi-question-circle",
    color: "blue",
    desc: "Get help with a technical problem",
  },
  {
    id: "discussion",
    label: "Discussion",
    icon: "bi-chat-dots",
    color: "purple",
    desc: "Share ideas, ask open questions, or debate",
  },
  {
    id: "showcase",
    label: "Show & Tell",
    icon: "bi-stars",
    color: "green",
    desc: "Show off something you built",
  },
  {
    id: "tutorial",
    label: "Tutorial",
    icon: "bi-book",
    color: "orange",
    desc: "Share a guide, walkthrough, or article",
  },
  {
    id: "idea",
    label: "Idea / Proposal",
    icon: "bi-lightbulb",
    color: "pink",
    desc: "Propose a new feature or design",
  },
];

const templates = {
  question: `### Context
Describe the background of your issue (e.g., what framework you are using, what you were trying to achieve).

### What I'm Trying to Do
Explain what you want to happen.

### Error or Unexpected Behavior
\`\`\`
Paste error messages, logs, or describe the unexpected behavior here...
\`\`\`

### Code or Steps Taken
Provide the relevant code snippet or describe the steps to reproduce the issue.`,
  discussion: `### Topic Overview
Introduce the subject you want to discuss with the community.

### My Perspective
Share your thoughts, experiences, or viewpoint on this topic.

### Points for Discussion
- What do you think about X?
- How has your team solved Y?
- What are the trade-offs of Z?`,
  showcase: `### Project Description
What did you build? What problem does it solve, and who is it for?

### Tech Stack
Briefly list the technologies you used:
- **Frontend**: e.g., Vue 3, Pinia, TailwindCSS
- **Backend**: e.g., Node.js, Express
- **Database**: e.g., PostgreSQL

### Key Features
- High-level overview of the main features.
- What was the most challenging part of this build?

### Links & Demos
[Optional] Link to your live site, GitHub repository, or add screenshots.`,
  tutorial: `### What You'll Learn
A quick summary of the skills or concepts covered in this guide.

### Prerequisites
What background knowledge or tools are needed before starting?

### Step-by-Step Guide

#### Step 1: Initial Setup
Explain what needs to be configured or run.

#### Step 2: Implementation
Detail the core logic with code snippets.

### Summary & Next Steps
Wrap up the tutorial and suggest related concepts to explore.`,
  idea: `### The Core Idea
Explain your feature request, design concept, or open proposal in a few sentences.

### Problem Solved
What problem does this idea address, and who benefits from it?

### Technical Details & Scope
[Optional] How could this be implemented? What are the potential challenges or dependencies?

### Request for Feedback
What specific questions do you want to ask the community for review?`,
};

const selectCategory = (categoryId) => {
  form.value.category = categoryId;

  if (!form.value.excerpt.trim()) {
    form.value.excerpt = templates[categoryId] || "";
    toast.info(
      `Loaded template for "${categories.find((c) => c.id === categoryId)?.label}"`,
    );
  } else {
    toast.info(
      `Category changed to "${categories.find((c) => c.id === categoryId)?.label}"`,
    );
  }
};

// Draft Autosave & Recovery
const hasDraft = ref(false);
const draftTimestamp = ref("");
let loadedDraft = null;
const isDraftSaved = ref(false);
const lastSavedTime = ref("");

const saveDraft = () => {
  const draft = {
    title: form.value.title,
    excerpt: form.value.excerpt,
    tagsList: tagsList.value,
    category: form.value.category,
    hasCode: form.value.hasCode,
    code: form.value.code,
    timestamp: new Date().toLocaleString(),
  };
  localStorage.setItem("ant_forum_discussion_draft", JSON.stringify(draft));
  isDraftSaved.value = true;
  lastSavedTime.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  setTimeout(() => {
    isDraftSaved.value = false;
  }, 2000);
};

let autosaveTimeout = null;
watch(
  [form, tagsList],
  () => {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    autosaveTimeout = setTimeout(() => {
      if (form.value.title.trim() || form.value.excerpt.trim()) {
        saveDraft();
      }
    }, 1200);
  },
  { deep: true },
);

const checkDraft = () => {
  const saved = localStorage.getItem("ant_forum_discussion_draft");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.title.trim() || parsed.excerpt.trim()) {
        loadedDraft = parsed;
        draftTimestamp.value = parsed.timestamp;
        hasDraft.value = true;
      }
    } catch (e) {
      console.error("Failed to parse draft", e);
    }
  }
};

const applyDraft = () => {
  if (loadedDraft) {
    form.value.title = loadedDraft.title || "";
    form.value.excerpt = loadedDraft.excerpt || "";
    form.value.category = loadedDraft.category || "question";
    tagsList.value = loadedDraft.tagsList || [];
    form.value.hasCode = loadedDraft.hasCode || false;
    form.value.code = loadedDraft.code || "";

    hasDraft.value = false;
    toast.success("Your draft was recovered successfully!");
  }
};

const discardDraft = () => {
  localStorage.removeItem("ant_forum_discussion_draft");
  hasDraft.value = false;
  toast.info("Draft discarded.");
};

// Word and character counts
const wordCount = computed(() => {
  const text = form.value.excerpt.trim();
  return text === "" ? 0 : text.split(/\s+/).length;
});
const charCount = computed(() => form.value.excerpt.length);

// Interactive checklist
const isTitleValid = computed(() => form.value.title.trim().length >= 12);
const isBodyValid = computed(() => form.value.excerpt.trim().length >= 25);
const isCategoryValid = computed(() => !!form.value.category);
const hasTags = computed(() => tagsList.value.length > 0);
const hasCodeBlock = computed(() => {
  return (
    form.value.hasCode ||
    form.value.excerpt.includes("```") ||
    form.value.excerpt.includes("`")
  );
});

const checklistProgress = computed(() => {
  let progress = 0;
  if (isTitleValid.value) progress += 25;
  if (isBodyValid.value) progress += 25;
  if (isCategoryValid.value) progress += 25;
  if (hasTags.value) progress += 25;
  return progress;
});

const isFormReady = computed(() => {
  return (
    isTitleValid.value &&
    isBodyValid.value &&
    isCategoryValid.value &&
    hasTags.value
  );
});

onMounted(() => {
  checkDraft();
  if (!form.value.title) {
    nextTick(() => {
      const titleInput = document.querySelector(".form-input");
      if (titleInput) titleInput.focus();
    });
  }
});

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
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
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
        `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
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
        `<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`,
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
        `<ul>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`,
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
        `<ol>${items.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`,
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
      `<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`,
    );
  }

  return output.join("\n");
};

const previewContent = computed(() => {
  return markdownToHtml(form.value.excerpt || "");
});

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
    selected: form.value.excerpt.substring(
      textarea.selectionStart,
      textarea.selectionEnd,
    ),
  };
};

const replaceSelection = async (text, cursorOffset = null) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  form.value.excerpt =
    form.value.excerpt.substring(0, start) +
    text +
    form.value.excerpt.substring(end);

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
  const selected = form.value.excerpt.substring(start, end);
  const content = selected || placeholder;

  const inserted = `${before}${content}${after}`;

  form.value.excerpt =
    form.value.excerpt.substring(0, start) +
    inserted +
    form.value.excerpt.substring(end);

  await nextTick();
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + content.length;
};

const prefixSelectedLines = async (prefix, fallbackText) => {
  const { selected } = getSelection();
  const content = selected || fallbackText;
  const changed = content
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
  const selected = form.value.excerpt.substring(start, end);

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

    form.value.excerpt =
      form.value.excerpt.substring(0, start) +
      inserted +
      form.value.excerpt.substring(end);

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
      "\n| Column 1 | Column 2 |\n| --- | --- |\n| Text | Text |\n",
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

  form.value.excerpt = form.value.excerpt
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

const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.excerpt.trim()) {
    toast.error("Title and body details are required.");
    return;
  }

  if (!form.value.category) {
    toast.error("Please select a category for your post.");
    return;
  }

  if (tagsList.value.length === 0) {
    toast.error("Please add at least one tag to categorise your post.");
    return;
  }

  isSubmitting.value = true;

  const newDiscussion = {
    title: form.value.title,
    excerpt: form.value.excerpt,
    category: form.value.category,
    tags: tagsList.value,
    code: form.value.hasCode ? form.value.code : null,
    hasCode: form.value.hasCode,
    votes: 0,
    replies: 0,
    author: "@current_user",
    timestamp: "Just now",
    createdAt: new Date().toISOString(),
    saved: false,
  };

  await new Promise((resolve) => setTimeout(resolve, 800));

  forumStore.discussions.unshift({
    ...newDiscussion,
    id: Date.now(),
  });

  // Clean Autosaved Draft
  localStorage.removeItem("ant_forum_discussion_draft");

  isSubmitting.value = false;
  toast.success("Discussion posted successfully!");
  router.push("/forum");
};
</script>

<template>
  <div class="create-page">
    <Navbar />

    <div class="create-wrapper">
      <!-- Back Link & Title Area -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/forum')">
          <i class="bi bi-arrow-left"></i>
          Back to Forum
        </button>

        <div class="header-content-wrapper">
          <div class="header-main">
            <h1>Create a New Discussion</h1>
            <p>
              Share your ideas, ask questions, or write a tutorial to help the
              Ant Forum community grow.
            </p>
          </div>
          <div class="header-badge">
            <span class="badge-icon"><i class="bi bi-pencil-square"></i></span>
          </div>
        </div>
      </div>

      <!-- Autosave Draft Recovery Banner -->
      <transition name="slide-fade">
        <div v-if="hasDraft" class="draft-banner">
          <div class="draft-banner-content">
            <div class="draft-icon">
              <i class="bi bi-arrow-counterclockwise"></i>
            </div>
            <div class="draft-text">
              <strong>Unsaved Draft Found</strong>
              <p>
                We saved your progress from {{ draftTimestamp }}. Would you like
                to restore it?
              </p>
            </div>
          </div>
          <div class="draft-banner-actions">
            <button type="button" class="btn-restore" @click="applyDraft">
              Restore Draft
            </button>
            <button type="button" class="btn-discard" @click="discardDraft">
              Discard
            </button>
          </div>
        </div>
      </transition>

      <!-- Main Columns Grid Layout -->
      <div class="create-layout-grid">
        <!-- Left Column: The Form Card -->
        <div class="form-column">
          <div class="form-card">
            <form class="create-form" @submit.prevent="handleSubmit">
              <!-- 1. CATEGORY GRID SELECTOR -->
              <div class="form-group">
                <label class="section-title">
                  <span class="num-badge">1</span>
                  Select a Category <span class="required">*</span>
                </label>
                <p class="section-desc">
                  Choose the context of your post. Selecting a category loads a
                  helper outline in the editor.
                </p>

                <div class="category-grid">
                  <div
                    v-for="cat in categories"
                    :key="cat.id"
                    class="category-card"
                    :class="{
                      active: form.category === cat.id,
                      [cat.id]: true,
                    }"
                    @click="selectCategory(cat.id)"
                  >
                    <div class="category-icon-wrapper">
                      <i :class="cat.icon"></i>
                    </div>
                    <div class="category-meta">
                      <strong>{{ cat.label }}</strong>
                      <span>{{ cat.desc }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. TITLE INPUT -->
              <div class="form-group">
                <label class="section-title">
                  <span class="num-badge">2</span>
                  Title <span class="required">*</span>
                </label>
                <p class="section-desc">
                  Be specific and concise. Imagine you are explaining your post
                  in a single sentence.
                </p>

                <div class="input-glow-container">
                  <input
                    v-model="form.title"
                    type="text"
                    required
                    class="form-input"
                    :placeholder="
                      form.category === 'question'
                        ? 'e.g. How to manage component state cleanly in Vue 3?'
                        : 'e.g. A Deep Dive into Reactive Primitives in modern web development'
                    "
                  />
                  <span class="char-indicator" :class="{ valid: isTitleValid }">
                    {{ form.title.trim().length }}/12+ chars
                  </span>
                </div>
              </div>

              <!-- 3. INTERACTIVE TAG INPUT -->
              <div class="form-group">
                <label class="section-title">
                  <span class="num-badge">3</span>
                  Tags <span class="required">*</span>
                </label>
                <p class="section-desc">
                  Add up to 5 descriptive tags. Press space, comma, or enter to
                  register a tag.
                </p>

                <div
                  class="tags-input-container"
                  :class="{ focused: isEditorFocused }"
                >
                  <div class="tags-list">
                    <span
                      v-for="(tag, idx) in tagsList"
                      :key="idx"
                      class="tag-pill"
                      :style="getTagChipStyle(tag.color)"
                    >
                      {{ tag.label }}
                      <button
                        type="button"
                        class="btn-remove-tag"
                        @click="removeTag(idx)"
                      >
                        <i class="bi bi-x"></i>
                      </button>
                    </span>
                    <input
                      v-model="tagInput"
                      type="text"
                      class="tag-text-input"
                      placeholder="Add tag..."
                      @keydown="handleTagKeydown"
                      @focus="isEditorFocused = true"
                      @blur="isEditorFocused = false"
                    />
                  </div>
                </div>

                <!-- SUGGESTED TAGS PILLS -->
                <div class="tag-suggestions">
                  <span class="suggestion-title">Suggestions:</span>
                  <button
                    v-for="sTag in suggestedTags"
                    :key="sTag"
                    type="button"
                    class="suggestion-pill"
                    @click="addTag(sTag)"
                  >
                    + {{ sTag }}
                  </button>
                </div>
              </div>

              <!-- 4. EDITOR WORKSPACE -->
              <div class="form-group">
                <label class="section-title">
                  <span class="num-badge">4</span>
                  Description / Body <span class="required">*</span>
                </label>
                <p class="section-desc">
                  Include all context, code snippets, and explanations. Markdown
                  is fully supported.
                </p>

                <div
                  class="editor-container"
                  :class="{ focused: isEditorFocused }"
                >
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
                          @mousedown.prevent="
                            insertFormat('insertUnorderedList')
                          "
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

                        <div
                          v-if="showMoreMenu"
                          class="toolbar-dropdown more-dropdown"
                        >
                          <button
                            type="button"
                            @mousedown.prevent="
                              insertFormat('insertHorizontalRule')
                            "
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
                      <button
                        type="button"
                        class="btn-cancel-link"
                        @click="cancelLink"
                      >
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
                        v-model="form.excerpt"
                        class="editor-textarea"
                        placeholder="Write details of your discussion, question, or tutorial here. Markdown and keyboard shortcuts are supported..."
                        @focus="isEditorFocused = true"
                        @blur="isEditorFocused = false"
                        @keydown="handleEditorKeydown"
                      ></textarea>
                    </div>

                    <!-- Rendered HTML Preview Pane -->
                    <div
                      v-show="
                        editorMode === 'preview' || editorMode === 'split'
                      "
                      class="editor-pane preview-pane"
                    >
                      <div
                        v-if="form.excerpt.trim()"
                        class="preview-body markdown-rendered"
                        v-html="previewContent"
                      ></div>
                      <div v-else class="preview-empty">
                        <i class="bi bi-file-earmark-text"></i>
                        <p>
                          Your beautiful rendered preview will appear here in
                          real-time.
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
                        <span v-if="isDraftSaved" class="autosave-status saved">
                          <i class="bi bi-cloud-check-fill"></i> Draft autosaved
                          ({{ lastSavedTime }})
                        </span>
                        <span v-else class="autosave-status saving">
                          <i class="bi bi-cloud-arrow-up"></i> Idle (Auto-saving
                          enabled)
                        </span>
                      </transition>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. CODE ATTACHMENT ACCORDION -->
              <div class="form-group code-toggle-group">
                <label class="toggle-label">
                  <input type="checkbox" v-model="form.hasCode" />
                  <span class="custom-checkbox"></span>
                  <span class="toggle-text">
                    <strong>Attach a separate full code snippet</strong>
                    <p class="toggle-sub">
                      Useful for complex debug files, build scripts, or large
                      config sheets
                    </p>
                  </span>
                </label>
              </div>

              <transition name="slide-fade">
                <div v-if="form.hasCode" class="form-group code-editor-card">
                  <div class="code-editor-header">
                    <i class="bi bi-braces"></i>
                    <span>Code Snippet Editor</span>
                  </div>
                  <textarea
                    v-model="form.code"
                    rows="8"
                    class="form-textarea code-font"
                    placeholder="// Paste your full code snippet here (e.g. JavaScript, Python, Go)..."
                  ></textarea>
                </div>
              </transition>

              <!-- FORM FOOTER ACTIONS -->
              <div class="form-actions">
                <button
                  type="button"
                  class="btn-cancel"
                  @click="router.push('/forum')"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="btn-submit"
                  :disabled="isSubmitting || !isFormReady"
                >
                  <span v-if="isSubmitting" class="btn-spinner"></span>
                  <i v-else class="bi bi-send-fill"></i>
                  {{ isSubmitting ? "Posting..." : "Publish Discussion" }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Column: Interactive Sidebar Checklist -->
        <div class="sidebar-column">
          <!-- Checklist Card -->
          <div
            class="sidebar-card checklist-card"
            :class="{ completed: isFormReady }"
          >
            <div class="checklist-header">
              <i class="bi bi-clipboard-check"></i>
              <h3>Post Readiness</h3>
            </div>

            <div class="checklist-progress">
              <div class="progress-info">
                <span>Completed Tasks</span>
                <strong>{{ checklistProgress }}%</strong>
              </div>
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: checklistProgress + '%' }"
                ></div>
              </div>
            </div>

            <div class="checklist-items">
              <div class="checklist-item" :class="{ ticked: isTitleValid }">
                <span class="checkbox-circle">
                  <i v-if="isTitleValid" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                <span class="item-text">Descriptive Title (12+ chars)</span>
              </div>

              <div class="checklist-item" :class="{ ticked: isBodyValid }">
                <span class="checkbox-circle">
                  <i v-if="isBodyValid" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                <span class="item-text">Detailed Description (25+ chars)</span>
              </div>

              <div class="checklist-item" :class="{ ticked: isCategoryValid }">
                <span class="checkbox-circle">
                  <i v-if="isCategoryValid" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                <span class="item-text">Select Category</span>
              </div>

              <div class="checklist-item" :class="{ ticked: hasTags }">
                <span class="checkbox-circle">
                  <i v-if="hasTags" class="bi bi-check-circle-fill"></i>
                  <i v-else class="bi bi-circle"></i>
                </span>
                <span class="item-text">Add at least one tag</span>
              </div>
            </div>

            <!-- Congratulatory message -->
            <transition name="fade">
              <div v-if="isFormReady" class="checklist-complete-message">
                <i class="bi bi-stars"></i>
                <span
                  >Your post is ready! Press "Publish Discussion" to share
                  it.</span
                >
              </div>
            </transition>
          </div>

          <!-- Pro Tips helper card -->
          <div class="sidebar-card tips-card">
            <div class="tips-header">
              <i class="bi bi-lightning-charge"></i>
              <h3>Pro Writing Tips</h3>
            </div>
            <ul class="tips-list">
              <li>
                <strong>Provide Context</strong>
                <p>
                  Describe your environment, system config, frameworks, and
                  versions.
                </p>
              </li>
              <li>
                <strong>Format Code blocks</strong>
                <p>
                  Surround snippets with <code>```</code> to highlight your code
                  dynamically.
                </p>
              </li>
              <li>
                <strong>Add descriptive tags</strong>
                <p>
                  Tags like <code>Vue.js</code> or
                  <code>System Design</code> help people find your post.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.create-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Header styling */
.page-header {
  margin-bottom: 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: var(--brand);
  background: #f1f5f9;
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: white;
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.header-main h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.header-main p {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  line-height: 1.5;
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(
    135deg,
    rgba(109, 40, 217, 0.1),
    rgba(124, 58, 237, 0.2)
  );
  color: var(--brand-light);
  border-radius: 16px;
  font-size: 24px;
}

/* Draft banner recovery card */
.draft-banner {
  background: rgba(253, 244, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(240, 171, 252, 0.6);
  border-left: 5px solid #d946ef;
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 18px rgba(217, 70, 239, 0.08);
}

.draft-banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.draft-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fdf2ff;
  color: #d946ef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.draft-text strong {
  display: block;
  font-size: 14px;
  color: #701a75;
}

.draft-text p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #86198f;
}

.draft-banner-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-restore {
  background: #d946ef;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(217, 70, 239, 0.2);
}

.btn-restore:hover {
  background: #c084fc;
}

.btn-discard {
  background: transparent;
  color: #701a75;
  border: none;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
}

.btn-discard:hover {
  background: rgba(240, 171, 252, 0.2);
}

/* 2-Column Grid Layout */
.create-layout-grid {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 28px;
  align-items: start;
}

.form-column {
  min-width: 0;
}

.form-card {
  background: white;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: 36px;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--brand-light), #10b981, #3b82f6);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Section styling inside form */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
}

.num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-light), var(--brand));
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.section-desc {
  margin: 4px 0 12px 34px;
  font-size: 13.5px;
  color: #64748b;
  line-height: 1.4;
}

.required {
  color: #ef4444;
}

/* Input Fields styling */
.input-glow-container {
  position: relative;
  margin-left: 34px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  padding-right: 110px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14.5px;
  background: #f8fafc;
  color: var(--text-dark);
}

.form-input:focus {
  background: white;
  border-color: var(--brand-light);
  box-shadow: var(--focus-ring);
  outline: none;
}

.char-indicator {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
  pointer-events: none;
  background: white;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.char-indicator.valid {
  color: #10b981;
  background: #ecfdf5;
}

/* Category grid selector styling */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  margin-left: 34px;
}

.category-card {
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover {
  background: white;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.category-icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.category-meta strong {
  display: block;
  font-size: 13px;
  color: var(--text-dark);
  font-weight: 700;
  margin-bottom: 2px;
}

.category-meta span {
  display: block;
  font-size: 10.5px;
  color: #94a3b8;
  line-height: 1.25;
}

/* Category specific colors and active states */
.category-card.active {
  background: white;
  transform: translateY(-2px);
}

.category-card.active.question {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.12),
    0 4px 12px rgba(59, 130, 246, 0.08);
}
.category-card.active.question .category-icon-wrapper {
  background: #eff6ff;
  color: #3b82f6;
}

.category-card.active.discussion {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.12),
    0 4px 12px rgba(139, 92, 246, 0.08);
}
.category-card.active.discussion .category-icon-wrapper {
  background: #f5f3ff;
  color: #8b5cf6;
}

.category-card.active.showcase {
  border-color: #10b981;
  box-shadow:
    0 0 0 3px rgba(16, 185, 129, 0.12),
    0 4px 12px rgba(16, 185, 129, 0.08);
}
.category-card.active.showcase .category-icon-wrapper {
  background: #ecfdf5;
  color: #10b981;
}

.category-card.active.tutorial {
  border-color: #f97316;
  box-shadow:
    0 0 0 3px rgba(249, 115, 22, 0.12),
    0 4px 12px rgba(249, 115, 22, 0.08);
}
.category-card.active.tutorial .category-icon-wrapper {
  background: #fff7ed;
  color: #f97316;
}

.category-card.active.idea {
  border-color: #ec4899;
  box-shadow:
    0 0 0 3px rgba(236, 72, 153, 0.12),
    0 4px 12px rgba(236, 72, 153, 0.08);
}
.category-card.active.idea .category-icon-wrapper {
  background: #fdf2f8;
  color: #ec4899;
}

/* Tag input section */
.tags-input-container {
  margin-left: 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  padding: 8px 12px;
  min-height: 52px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.tags-input-container.focused {
  background: white;
  border-color: var(--brand-light);
  box-shadow: var(--focus-ring);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 100px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.btn-remove-tag {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-remove-tag:hover {
  opacity: 1;
}

.tag-text-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13.5px;
  color: var(--text-dark);
  min-width: 100px;
  padding: 4px 0;
}

/* Suggested Tags */
.tag-suggestions {
  margin-left: 34px;
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.suggestion-title {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.suggestion-pill {
  border: 1px solid #cbd5e1;
  background: white;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.suggestion-pill:hover {
  background: #f1f5f9;
  color: var(--brand);
  border-color: var(--brand-light);
}

/* Editor container styling */
.editor-container {
  margin-left: 34px;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.editor-container.focused {
  border-color: var(--brand-light);
  box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.1);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
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
  background: #cbd5e1;
  margin: 0 6px;
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
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: #e2e8f0;
  color: var(--text-dark);
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
  background: white;
  border: 1px solid #cbd5e1;
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
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
}

.toolbar-dropdown button:hover {
  background: #f1f5f9;
  color: var(--text-dark);
}

/* Tabs modes in Editor */
.editor-tabs-group {
  display: flex;
  background: #e2e8f0;
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
  color: #475569;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.editor-tabs-group .tab-btn:hover {
  color: var(--text-dark);
}

.editor-tabs-group .tab-btn.active {
  background: white;
  color: var(--brand);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Editor Link popup styling */
.link-popup-panel {
  background: #fdfdfd;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.popup-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand);
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
  color: #475569;
}

.popup-input {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
}

.popup-input:focus {
  outline: none;
  border-color: var(--brand-light);
  box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.1);
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-save {
  background: var(--brand);
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(109, 40, 217, 0.15);
}

.btn-save:hover {
  background: var(--brand-hover);
}

.btn-cancel-link {
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel-link:hover {
  color: var(--text-dark);
  background: #f1f5f9;
}

/* Core Editor Workspace styling */
.editor-workspace {
  min-height: 380px;
  display: flex;
  background: white;
}

.editor-pane {
  flex: 1;
  min-width: 0;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  min-height: 380px;
  border: none;
  outline: none;
  resize: vertical;
  padding: 20px;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-dark);
}

/* Live Preview Panel */
.preview-pane {
  border-left: 1px solid #e2e8f0;
  padding: 20px 24px;
  background: #fafafc;
  overflow-y: auto;
  max-height: 600px;
}

.preview-body {
  line-height: 1.7;
  color: #334155;
  font-size: 14.5px;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3) {
  font-family: var(--font-family-display);
  color: var(--text-dark);
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
  border-left: 4px solid var(--brand-light);
  padding: 8px 16px;
  background: #f5f3ff;
  color: #5b21b6;
  border-radius: 0 8px 8px 0;
  margin: 16px 0;
  font-style: italic;
}

.preview-body :deep(code) {
  background: #f1f5f9;
  color: #b02a37;
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
  color: var(--brand-light);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1.5px solid rgba(124, 58, 237, 0.2);
}

.preview-body :deep(a:hover) {
  color: var(--brand-hover);
  border-bottom-color: var(--brand-hover);
}

.preview-body :deep(hr) {
  border: none;
  border-top: 1.5px dashed #cbd5e1;
  margin: 24px 0;
}

.preview-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.preview-body :deep(th),
.preview-body :deep(td) {
  border: 1px solid #cbd5e1;
  padding: 10px 12px;
  font-size: 13px;
}

.preview-body :deep(th) {
  background: #f1f5f9;
  font-weight: 700;
  color: var(--text-dark);
}

.preview-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
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

/* Bottom Editor status bar */
.editor-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-counter i {
  margin-right: 4px;
}

.status-divider {
  width: 1px;
  height: 12px;
  background: #cbd5e1;
}

.status-counter strong {
  color: var(--text-dark);
}

.autosave-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.autosave-status.saved {
  color: #10b981;
}

.autosave-status.saving {
  color: #94a3b8;
}

/* Checklist and Protips column right side */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.checklist-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.checklist-card.completed {
  border-color: #10b981;
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.08);
}

.checklist-card.completed::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #10b981;
}

.checklist-header,
.tips-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.checklist-header i,
.tips-header i {
  font-size: 20px;
}

.checklist-header i {
  color: var(--brand-light);
}
.checklist-card.completed .checklist-header i {
  color: #10b981;
}

.tips-header i {
  color: #f59e0b;
}

.checklist-header h3,
.tips-header h3 {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-dark);
  margin: 0;
}

/* Progress bar inside checklist */
.checklist-progress {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: #64748b;
  margin-bottom: 6px;
}

.progress-info strong {
  color: var(--text-dark);
  font-weight: 700;
}

.progress-bar-bg {
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-light), #10b981);
  border-radius: 10px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.checklist-item.ticked {
  color: var(--text-dark);
  font-weight: 600;
}

.checkbox-circle {
  font-size: 16px;
  color: #cbd5e1;
  display: flex;
  align-items: center;
}

.checklist-item.ticked .checkbox-circle {
  color: #10b981;
}

.checklist-complete-message {
  margin-top: 20px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #15803d;
  font-size: 12px;
}

.checklist-complete-message i {
  font-size: 15px;
  color: #22c55e;
}

/* Pro tips styling */
.tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tips-list li strong {
  display: block;
  font-size: 13px;
  color: var(--text-dark);
  font-weight: 700;
  margin-bottom: 2px;
}

.tips-list li p {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.tips-list li code {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 11px;
  color: var(--brand-light);
}

/* Separate code editor attachment styling */
.code-toggle-group {
  margin-left: 34px;
  margin-top: -12px;
}

.toggle-label {
  display: inline-flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.2s ease;
  margin-top: 2px;
}

.toggle-label input[type="checkbox"]:checked + .custom-checkbox {
  background: var(--brand);
  border-color: var(--brand);
}

.toggle-label input[type="checkbox"]:checked + .custom-checkbox::before {
  content: "\F272";
  font-family: "bootstrap-icons";
  font-size: 12px;
  color: white;
  font-weight: 900;
}

.toggle-text strong {
  display: block;
  font-size: 14px;
  color: var(--text-dark);
}

.toggle-sub {
  font-size: 12.5px;
  color: #64748b;
  margin: 2px 0 0;
}

.code-editor-card {
  margin-left: 34px;
  background: #1e1e2e;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.code-editor-header {
  background: #181825;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #cdd6f4;
  border-bottom: 1px solid #11111b;
}

.code-editor-header i {
  color: #fab387;
  font-size: 14px;
}

.code-font {
  width: 100%;
  border: none;
  background: #1e1e2e;
  color: #cdd6f4;
  font-family: "JetBrains Mono", monospace;
  font-size: 13.5px;
  padding: 16px;
  resize: vertical;
  line-height: 1.6;
}

.code-font:focus {
  outline: none;
  background: #1e1e2e;
}

/* Form Actions Footer */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  padding-top: 32px;
  border-top: 1px solid #f1f5f9;
  margin-left: 34px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 28px;
  font-size: 14.5px;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.btn-cancel {
  background: transparent;
  border: 1.5px solid #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: var(--text-dark);
  border-color: #94a3b8;
}

.btn-submit {
  background: linear-gradient(135deg, var(--brand-light), var(--brand));
  border: none;
  color: white;
  box-shadow: 0 4px 18px rgba(109, 40, 217, 0.2);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.35);
}

.btn-submit:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-16px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive breakdowns */
@media (max-width: 1024px) {
  .create-layout-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .sidebar-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .create-wrapper {
    padding: 20px 16px;
  }

  .form-card {
    padding: 24px 16px;
  }

  .header-content-wrapper {
    padding: 16px 20px;
  }

  .header-main h1 {
    font-size: 20px;
  }

  .header-badge {
    display: none;
  }

  .category-grid,
  .input-glow-container,
  .tags-input-container,
  .tag-suggestions,
  .editor-container,
  .code-toggle-group,
  .code-editor-card,
  .form-actions {
    margin-left: 0;
  }

  .sidebar-column {
    grid-template-columns: 1fr;
  }
}
</style>
