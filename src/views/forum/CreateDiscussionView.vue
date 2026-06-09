<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";
import { useTagsStore } from "@/stores/TagsStore";
import Navbar from "@/components/layouts/header.vue";
import MarkdownEditor from "@/components/forum/create/MarkdownEditor.vue";
import LeftSidebar from "@/components/forum/LeftSidebar.vue";
import { useToast } from "@/composables/useToast.js";

const router = useRouter();
const route = useRoute();
const forumStore = useForumStore();
const tagsStore = useTagsStore();
const toast = useToast();

const isEditMode = computed(() => route.name === "EditDiscussion");
const isFetchingData = ref(route.name === "EditDiscussion");

// Backend categories (fetched on mount)
const backendCategories = ref([]);

const isEditorFocused = ref(false);
const isSubmitting = ref(false);
const descriptionEditorRef = ref(null);
const CODE_SNIPPET_HEADING = "### Code Snippet";
const attachedCodeSnippetRegex = /\n{0,2}### Code Snippet\s*\n```[^\n`]*\n([\s\S]*?)\n```\s*$/i;

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
const staticSuggestedTags = [
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

const suggestedTags = computed(() => {
  if (tagsStore.tags && tagsStore.tags.length > 0) {
    // Return full objects including id
    return tagsStore.tags;
  }
  return staticSuggestedTags.map((name) => ({ id: null, name }));
});

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
  blue:   { bg: 'var(--color-tag-blue-bg)', color: 'var(--color-tag-blue-text)' },
  orange: { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  green:  { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  purple: { bg: 'var(--color-tag-purple-bg)', color: 'var(--color-tag-purple-text)' },
  pink:   { bg: 'var(--color-tag-pink-bg)', color: 'var(--color-tag-pink-text)' },
  teal:   { bg: 'var(--color-tag-cyan-bg)', color: 'var(--color-tag-cyan-text)' },
  red:    { bg: 'var(--color-tag-red-bg)', color: 'var(--color-tag-red-text)' },
  gray:   { bg: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' },
  yellow: { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' },
};

const getTagChipStyle = (color) => {
  const t = (color && Object.prototype.hasOwnProperty.call(tagColorMap, color)) ? tagColorMap[color] : tagColorMap.gray;
  return { background: t.bg, color: t.color };
};

const extractAttachedCodeSnippet = (body = "") => {
  const text = String(body || "");
  const match = text.match(attachedCodeSnippetRegex);

  if (!match) {
    return {
      body: text,
      code: "",
    };
  }

  return {
    body: text.replace(attachedCodeSnippetRegex, "").trim(),
    code: match[1].trimEnd(),
  };
};

const getDiscussionDescription = (disc = {}) => {
  return disc.description ||
    disc.Description ||
    disc.body ||
    disc.Body ||
    disc.content ||
    disc.Content ||
    disc.details ||
    disc.detail ||
    disc.excerpt ||
    "";
};

const buildDescriptionPayload = () => {
  const { body } = extractAttachedCodeSnippet(form.value.excerpt);
  const cleanBody = body.trim();
  const cleanCode = form.value.hasCode ? form.value.code.trim() : "";

  if (!cleanCode) {
    return cleanBody;
  }

  return `${cleanBody}\n\n${CODE_SNIPPET_HEADING}\n\`\`\`\n${cleanCode}\n\`\`\``;
};

const addTag = (tagInputObj) => {
  if (!tagInputObj) return;
  const label = typeof tagInputObj === 'string' ? tagInputObj : (tagInputObj.name || tagInputObj.label || tagInputObj.tag_name);
  const tagId = typeof tagInputObj === 'string' ? null : tagInputObj.id;
  const clean = label ? label.trim() : '';
  if (!clean) return;

  if (
    tagsList.value.some((t) => t.label.toLowerCase() === clean.toLowerCase())
  ) {
    toast.warning(`Tag "${clean}" has already been added.`);
    tagInput.value = "";
    return;
  }

  const newTag = {
    id: tagId,
    label: clean,
    color: getTagColor(clean),
  };

  if (tagsList.value.length >= 1) {
    // Replace the existing tag since backend only supports 1 tag
    tagsList.value = [newTag];
  } else {
    tagsList.value.push(newTag);
  }

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
  question: "### Context\nDescribe the background of your issue (e.g., what framework you are using, what you were trying to achieve).\n\n### What I'm Trying to Do\nExplain what you want to happen.\n\n### Error or Unexpected Behavior\n```\nPaste error messages, logs, or describe the unexpected behavior here...\n```\n\n### Code or Steps Taken\nProvide the relevant code snippet or describe the steps to reproduce the issue.",
  discussion: "### Topic Overview\nIntroduce the subject you want to discuss with the community.\n\n### My Perspective\nShare your thoughts, experiences, or viewpoint on this topic.\n\n### Points for Discussion\n- What do you think about X?\n- How has your team solved Y?\n- What are the trade-offs of Z?",
  showcase: "### Project Description\nWhat did you build? What problem does it solve, and who is it for?\n\n### Tech Stack\nBriefly list the technologies you used:\n- **Frontend**: e.g., Vue 3, Pinia, TailwindCSS\n- **Backend**: e.g., Node.js, Express\n- **Database**: e.g., PostgreSQL\n\n### Key Features\n- High-level overview of the main features.\n- What was the most challenging part of this build?\n\n### Links & Demos\n[Optional] Link to your live site, GitHub repository, or add screenshots.",
  tutorial: "### What You'll Learn\nA quick summary of the skills or concepts covered in this guide.\n\n### Prerequisites\nWhat background knowledge or tools are needed before starting?\n\n### Step-by-Step Guide\n\n#### Step 1: Initial Setup\nExplain what needs to be configured or run.\n\n#### Step 2: Implementation\nDetail the core logic with code snippets.\n\n### Summary & Next Steps\nWrap up the tutorial and suggest related concepts to explore.",
  idea: "### The Core Idea\nExplain your feature request, design concept, or open proposal in a few sentences.\n\n### Problem Solved\nWhat problem does this idea address, and who benefits from it?\n\n### Technical Details & Scope\n[Optional] How could this be implemented? What are the potential challenges or dependencies?\n\n### Request for Feedback\nWhat specific questions do you want to ask the community for review?"
};

const getTemplate = (catId) => {
  if (catId && Object.prototype.hasOwnProperty.call(templates, catId)) {
    return templates[catId];
  }
  return "";
};

const staticCategoryMeta = {
  question: { icon: "bi-question-circle", color: "blue", desc: "Get help with a technical problem" },
  discussion: { icon: "bi-chat-dots", color: "purple", desc: "Share ideas, ask open questions, or debate" },
  tutorial: { icon: "bi-book", color: "orange", desc: "Share a guide, walkthrough, or article" },
  idea: { icon: "bi-lightbulb", color: "pink", desc: "Propose a new feature or design" },
  showcase: { icon: "bi-rocket-takeoff", color: "purple", desc: "Show off your cool projects" }
};

const getCategoryMeta = (type) => {
  const t = (type || "discussion").toLowerCase();
  
  if (t.includes('question') || t.includes('q&a') || t.includes('help')) {
    return { idType: 'question', icon: "bi-question-circle", color: "blue", desc: "Get help with a technical problem" };
  } else if (t.includes('showcase') || t.includes('project')) {
    return { idType: 'showcase', icon: "bi-rocket-takeoff", color: "purple", desc: "Show off your cool projects" };
  } else if (t.includes('tutorial') || t.includes('guide')) {
    return { idType: 'tutorial', icon: "bi-book", color: "orange", desc: "Share a guide, walkthrough, or article" };
  } else if (t.includes('announcement') || t.includes('news')) {
    return { idType: 'announcement', icon: "bi-megaphone", color: "red", desc: "Important announcements and news" };
  } else if (t.includes('resource') || t.includes('link')) {
    return { idType: 'resource', icon: "bi-link-45deg", color: "green", desc: "Useful resources and links" };
  } else if (t.includes('idea') || t.includes('feature')) {
    return { idType: 'idea', icon: "bi-lightbulb", color: "pink", desc: "Propose a new feature or design" };
  }
  
  return { idType: 'discussion', icon: "bi-chat-dots", color: "purple", desc: "General forum discussions" };
};

const displayedCategories = computed(() => {
  if (backendCategories.value.length === 0) {
    return categories;
  }
  return backendCategories.value.map(cat => {
    const type = (cat.type || cat.name || "discussion").toLowerCase();
    const meta = getCategoryMeta(type);
    return {
      id: cat.id,
      type: meta.idType,
      label: cat.name || cat.type || "Topic",
      icon: meta.icon,
      color: meta.color,
      desc: cat.description || meta.desc
    };
  });
});

const selectCategory = (cat) => {
  form.value.category = cat.id;

  if (!form.value.excerpt.trim()) {
    form.value.excerpt = getTemplate(cat.type);
  }
};

// Draft Autosave & Recovery
const hasDraft = ref(false);
const draftTimestamp = ref("");
let loadedDraft = null;
const isDraftSaved = ref(false);
const lastSavedTime = ref("");

const saveDraft = () => {
  if (isEditMode.value) return;

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
    if (isEditMode.value) return;

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
    (isEditMode.value || hasTags.value)
  );
});

onMounted(async () => {
  if (!isEditMode.value) {
    checkDraft();
  }

  // Fetch real categories from backend so we can resolve numeric IDs
  try {
    const fetched = await forumStore.fetchCategories();
    if (fetched && fetched.length > 0) {
      backendCategories.value = fetched;
      if (!isEditMode.value) {
        form.value.category = fetched[0].id; // Default category ID
      }
    }
  } catch (err) {
    console.warn('Could not fetch backend categories, will use fallback ID:', err);
  }

  // Fetch real tags from backend for suggestion pills
  try {
    await tagsStore.fetchTags();
  } catch (err) {
    console.warn('Could not fetch backend tags:', err);
  }

  if (isEditMode.value) {
    isFetchingData.value = true;
    try {
      const discId = route.params.id;
      await forumStore.fetchDiscussion(discId);
      const disc = forumStore.discussion;
      if (disc) {
        const rawBody = getDiscussionDescription(disc);
        const attachedSnippet = extractAttachedCodeSnippet(rawBody);
        form.value.title = disc.title || "";
        form.value.excerpt = attachedSnippet.body;
        form.value.code = disc.code || attachedSnippet.code || "";
        form.value.hasCode = Boolean(disc.hasCode || disc.code || attachedSnippet.code);

        // Match category ID directly
        if (disc.category_id) {
          form.value.category = Number(disc.category_id);
        } else if (disc.category) {
          const matchedCategory = backendCategories.value.find((cat) => {
            const candidates = [cat.id, cat.name, cat.type]
              .filter(Boolean)
              .map((value) => String(value).toLowerCase());

            return candidates.includes(String(disc.category).toLowerCase());
          });
          form.value.category = matchedCategory?.id || form.value.category || 1;
        } else {
          form.value.category = 1;
        }

        // Tags
        if (disc.tags && Array.isArray(disc.tags)) {
          tagsList.value = disc.tags.map(t => typeof t === "string" ? { label: t, color: getTagColor(t), id: null } : { label: t.label || t.name, color: t.color || getTagColor(t.label || t.name), id: t.id || null });
        } else if (disc.tags && typeof disc.tags === 'string') {
          tagsList.value = disc.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => ({
            label: t,
            color: getTagColor(t),
            id: disc.tag_id || null
          }));
        } else if (disc.tag_name || disc.tag || disc.tag_names) {
          const tagName = disc.tag_name || disc.tag || disc.tag_names;
          tagsList.value = String(tagName)
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
            .map(t => ({
              label: t,
              color: getTagColor(t),
              id: disc.tag_id || null
            }));
        }
      }
    } catch (err) {
      toast.error("Failed to load discussion details for editing.");
    } finally {
      isFetchingData.value = false;
      await nextTick();
      descriptionEditorRef.value?.setMarkdown(form.value.excerpt);
    }
  } else {
    if (!form.value.title) {
      nextTick(() => {
        const titleInput = document.querySelector(".form-input");
        if (titleInput) titleInput.focus();
      });
    }
  }
});

const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.excerpt.trim()) {
    toast.error("Title and body details are required.");
    return;
  }

  if (!form.value.category) {
    toast.error("Please select a category for your post.");
    return;
  }

  if (!isEditMode.value && tagsList.value.length === 0) {
    toast.error("Please add at least one tag to categorise your post.");
    return;
  }

  isSubmitting.value = true;

  try {
    let resolvedCategoryId = Number(form.value.category) || 1;
    const descriptionPayload = buildDescriptionPayload();
    const codePayload = form.value.hasCode && form.value.code.trim()
      ? form.value.code.trim()
      : null;

    if (isEditMode.value) {
      await forumStore.updateDiscussion(route.params.id, {
        title: form.value.title,
        description: descriptionPayload,
        category_id: resolvedCategoryId,
        excerpt: descriptionPayload,
        category: form.value.category,
        tags: tagsList.value,
        code: codePayload,
        hasCode: Boolean(codePayload),
      });
      localStorage.removeItem("ant_forum_discussion_draft");
      toast.success("Discussion updated successfully!");
      router.push(`/forum/${route.params.id}`);
    } else {
      await forumStore.createDiscussion({
        title: form.value.title,
        description: descriptionPayload,
        category_id: resolvedCategoryId,
        excerpt: descriptionPayload,
        category: form.value.category,
        tags: tagsList.value,
        code: codePayload,
        hasCode: Boolean(codePayload),
      });
      localStorage.removeItem("ant_forum_discussion_draft");
      toast.success("Discussion posted successfully!");
      router.push("/forum");
    }
  } catch (error) {
    console.error("[CreateDiscussion] Submit error:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Failed to save discussion. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="create-page">
    <Navbar />

    <div class="create-page-grid-layout">
      <LeftSidebar active-tab="questions" />

      <div class="create-wrapper">
      <!-- Back Link & Title Area -->
      <div class="page-header">
        <button class="back-btn" @click="router.push('/forum')">
          <i class="bi bi-arrow-left"></i>
          Back to Forum
        </button>
        <div class="header-content-wrapper">
          <div class="header-main">
            <h1>{{ isEditMode ? 'Edit Discussion' : 'Create a New Discussion' }}</h1>
            <p>
              {{ isEditMode ? 'Update your discussion details below.' : 'Share your ideas, ask questions, or write a tutorial to help the Ant Forum community grow.' }}
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
        <div class="form-column">
          <div class="form-card">
            <form v-if="!isFetchingData" class="create-form" @submit.prevent="handleSubmit">

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
                  v-for="cat in displayedCategories"
                  :key="cat.id"
                  class="category-card"
                  :class="{
                    active: form.category === cat.id,
                    [cat.type]: true,
                  }"
                  @click="selectCategory(cat)"
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
                Select a descriptive tag. Click on the suggestions below to add it.
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
                  <span v-if="tagsList.length === 0" class="empty-tags-placeholder">
                    Select tags from the suggestions below...
                  </span>
                </div>
              </div>

              <!-- SUGGESTED TAGS PILLS -->
              <div class="tag-suggestions">
                <span class="suggestion-title">Suggestions:</span>
                <button
                  v-for="(sTag, idx) in suggestedTags"
                  :key="sTag.id || idx"
                  type="button"
                  class="suggestion-pill"
                  @click="addTag(sTag)"
                >
                  + {{ sTag.name || sTag.label || sTag.tag_name || sTag }}
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

              <MarkdownEditor
                ref="descriptionEditorRef"
                v-model="form.excerpt"
                :is-draft-saved="isDraftSaved"
                :last-saved-time="lastSavedTime"
              />
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
                {{ isSubmitting ? (isEditMode ? "Saving..." : "Posting...") : (isEditMode ? "Save Changes" : "Publish Discussion") }}
              </button>
            </div>
          </form>

            <div v-else class="form-skeleton">
              <div class="skeleton-section">
                <div class="skeleton-title"></div>
                <div class="skeleton-desc"></div>
                <div class="skeleton-grid">
                  <div class="skeleton-box"></div>
                  <div class="skeleton-box"></div>
                  <div class="skeleton-box"></div>
                </div>
              </div>
              
              <div class="skeleton-section">
                <div class="skeleton-title"></div>
                <div class="skeleton-input"></div>
              </div>

              <div class="skeleton-section">
                <div class="skeleton-title"></div>
                <div class="skeleton-textarea"></div>
              </div>
            </div>
        </div>
      </div>

      <!-- Right Sidebar for Helpers -->
      <div class="sidebar-column">
        <!-- Sleek Readiness Widget -->
        <div class="readiness-widget" :class="{ completed: isFormReady }">
          <div class="widget-header">
            <i class="bi bi-stars text-gradient-purple"></i>
            <strong>Post Readiness</strong>
          </div>
          <div class="readiness-progress-wrapper">
            <div class="readiness-progress-bar-bg">
              <div class="readiness-progress-bar-fill" :style="{ width: checklistProgress + '%' }"></div>
            </div>
            <span class="readiness-percentage">{{ checklistProgress }}%</span>
          </div>

          <div class="readiness-checklist-vertical">
            <div class="readiness-check-item" :class="{ active: isTitleValid }">
              <i class="bi" :class="isTitleValid ? 'bi-check-circle-fill' : 'bi-circle'"></i>
              <span>Title (12+ chars)</span>
            </div>
            <div class="readiness-check-item" :class="{ active: isBodyValid }">
              <i class="bi" :class="isBodyValid ? 'bi-check-circle-fill' : 'bi-circle'"></i>
              <span>Description (25+ chars)</span>
            </div>
            <div class="readiness-check-item" :class="{ active: isCategoryValid }">
              <i class="bi" :class="isCategoryValid ? 'bi-check-circle-fill' : 'bi-circle'"></i>
              <span>Select Category</span>
            </div>
            <div class="readiness-check-item" :class="{ active: hasTags }">
              <i class="bi" :class="hasTags ? 'bi-check-circle-fill' : 'bi-circle'"></i>
              <span>Add at least 1 Tag</span>
            </div>
          </div>
        </div>

        <!-- Pro Writing Tips Widget -->
        <div class="tips-widget">
          <div class="widget-header">
            <i class="bi bi-lightning-charge-fill text-warning"></i>
            <strong>Pro Writing Tips</strong>
          </div>
          <div class="tips-vertical-list">
            <div class="tip-box">
              <span class="tip-box-title">Provide Context</span>
              <p>Describe your environment, system config, frameworks, and versions.</p>
            </div>
            <div class="tip-box">
              <span class="tip-box-title">Format Code Blocks</span>
              <p>Surround snippets with <code>```</code> to highlight your code dynamically.</p>
            </div>
            <div class="tip-box">
              <span class="tip-box-title">Add Descriptive Tags</span>
              <p>Tags like <code>Vue.js</code> help developers easily discover your thread.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  background-image: 
    linear-gradient(to right, rgba(128, 128, 128, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(128, 128, 128, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  padding-bottom: 80px;
}

.create-page-grid-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  max-width: 1280px;
  margin: 0 auto;
  gap: 28px;
  padding: 32px 24px 60px;
}

@media (max-width: 1024px) {
  .create-page-grid-layout {
    grid-template-columns: 1fr;
    padding: 20px 16px 40px;
  }
  .left-sidebar-navigation {
    display: none !important;
  }
}

.create-wrapper {
  min-width: 0;
  display: flex;
  flex-direction: column;
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
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: var(--color-surface);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  padding: 32px 40px;
}

.header-main h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.header-main p {
  color: var(--color-text-muted);
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
  background: var(--color-purple-light);
  color: var(--color-purple);
  border-radius: 16px;
  font-size: 24px;
}

/* Draft banner recovery card */
.draft-banner {
  background: var(--color-purple-light);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-purple);
  border-left: 5px solid var(--color-purple);
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
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
  background: var(--color-surface);
  color: var(--color-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.draft-text strong {
  display: block;
  font-size: 14px;
  color: var(--color-text);
}

.draft-text p {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.draft-banner-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-restore {
  background: var(--color-purple);
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.btn-restore:hover {
  filter: brightness(0.9);
}

.btn-discard {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-discard:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-text-muted);
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
  position: relative;
  background: var(--color-surface);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  padding: 40px;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

/* Section styling inside form */
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.section-desc {
  margin: 4px 0 16px 34px;
  font-size: 13.5px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.required {
  color: var(--color-danger);
}

/* Input Fields styling */
.input-glow-container {
  position: relative;
  margin-left: 34px;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  padding-right: 110px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  font-size: 14.5px;
  background: var(--color-surface-hover);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.form-input:focus {
  background: var(--color-surface);
  border-color: var(--color-purple, var(--color-primary));
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), 0 0 16px rgba(139, 92, 246, 0.1);
  outline: none;
}

.char-indicator {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11.5px;
  color: var(--color-text-muted);
  font-weight: 600;
  pointer-events: none;
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.char-indicator.valid {
  color: var(--color-success);
  background: var(--color-success-light);
}

/* Category grid selector styling */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-left: 34px;
}

.category-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface-hover);
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.category-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.category-meta strong {
  display: block;
  font-size: 13px;
  color: var(--color-text);
  font-weight: 700;
  margin-bottom: 2px;
}

.category-meta span {
  display: block;
  font-size: 10.5px;
  color: var(--color-text-muted);
  line-height: 1.25;
}

/* Category specific colors and active states */
.category-card.active {
  background: var(--color-surface);
  transform: translateY(-2px);
}

.category-card.active.question {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}
.category-card.active.question .category-icon-wrapper {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.category-card.active.discussion {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.12),
    0 4px 12px rgba(139, 92, 246, 0.08);
}
.category-card.active.discussion .category-icon-wrapper {
  background: var(--color-purple-light);
  color: var(--color-purple);
}

.category-card.active.showcase {
  border-color: #10b981;
  box-shadow:
    0 0 0 3px rgba(16, 185, 129, 0.12),
    0 4px 12px rgba(16, 185, 129, 0.08);
}
.category-card.active.showcase .category-icon-wrapper {
  background: var(--color-success-light);
  color: var(--color-success);
}

.category-card.active.tutorial {
  border-color: #f97316;
  box-shadow:
    0 0 0 3px rgba(249, 115, 22, 0.12),
    0 4px 12px rgba(249, 115, 22, 0.08);
}
.category-card.active.tutorial .category-icon-wrapper {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.category-card.active.idea {
  border-color: #ec4899;
  box-shadow:
    0 0 0 3px rgba(236, 72, 153, 0.12),
    0 4px 12px rgba(236, 72, 153, 0.08);
}
.category-card.active.idea .category-icon-wrapper {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.category-card.active.resource {
  border-color: #14b8a6;
  box-shadow:
    0 0 0 3px rgba(20, 184, 166, 0.12),
    0 4px 12px rgba(20, 184, 166, 0.08);
}
.category-card.active.resource .category-icon-wrapper {
  background: rgba(20, 184, 166, 0.15);
  color: #14b8a6;
}

.category-card.active.announcement {
  border-color: #ef4444;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.12),
    0 4px 12px rgba(239, 68, 68, 0.08);
}
.category-card.active.announcement .category-icon-wrapper {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Tag input section */
.tags-input-container {
  margin-left: 34px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface-hover);
  padding: 10px 16px;
  min-height: 54px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.tags-input-container.focused {
  background: var(--color-surface);
  border-color: var(--color-purple, var(--color-primary));
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), 0 0 16px rgba(139, 92, 246, 0.1);
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

.empty-tags-placeholder {
  color: var(--color-text-muted);
  font-size: 13.5px;
  padding: 4px 0;
  user-select: none;
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
  color: var(--color-text-muted);
  font-weight: 600;
}

.suggestion-pill {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 4px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-pill:hover {
  background: rgba(139, 92, 246, 0.08);
  color: var(--color-purple, var(--color-primary));
  border-color: var(--color-purple, var(--color-primary));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
}

/* Editor container alignment styling */
.editor-container {
  margin-left: 34px;
}

/* Checklist and Protips column right side */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  color: var(--color-text) !important;
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
  color: var(--color-primary);
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
  color: var(--color-text);
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
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.progress-info strong {
  color: var(--text-dark);
  font-weight: 700;
}

.progress-bar-bg {
  height: 6px;
  background: var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #10b981);
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
  color: var(--color-text-muted);
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
  color: var(--color-text-muted);
  opacity: 0.8;
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
  color: var(--color-text-muted);
  line-height: 1.4;
  margin: 0;
}

.tips-list li code {
  background: var(--color-surface-hover);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
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
  border: 2px solid var(--color-border);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-input-bg);
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
  color: var(--color-text-muted);
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
  border-top: 1px solid var(--color-border);
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
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
}

.btn-cancel:hover {
  background: var(--color-surface-hover);
  color: var(--text-dark);
  border-color: var(--color-text-muted);
}

.btn-submit {
  background: linear-gradient(135deg, var(--color-primary), var(--color-purple));
  border: none;
  color: white;
  box-shadow: 0 4px 18px rgba(109, 40, 217, 0.2);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.35);
}

.btn-submit:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
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

/* Sidebar column & Widgets */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 100px;
}

.readiness-widget, .tips-widget {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.readiness-widget.completed {
  border-color: var(--color-success);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.widget-header i {
  font-size: 18px;
}

.readiness-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.readiness-progress-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--color-surface-hover);
  border-radius: 4px;
  overflow: hidden;
}

.readiness-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-purple, #8b5cf6), var(--color-primary));
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.readiness-percentage {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primary);
  width: 40px;
  text-align: right;
}

.readiness-checklist-vertical {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.readiness-check-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.readiness-check-item i {
  font-size: 16px;
  color: var(--color-border);
}

.readiness-check-item.active {
  color: var(--color-text);
  font-weight: 600;
}

.readiness-check-item.active i {
  color: var(--color-success);
}

.tips-vertical-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-box {
  background: var(--color-surface-hover);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.tip-box:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.tip-box-title {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 6px;
}

.tip-box p {
  font-size: 12.5px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}

.tip-box code {
  background: var(--color-surface);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

@media (max-width: 1024px) {
  .sidebar-column {
    display: none;
  }
}
/* Loading Skeleton */
.form-skeleton {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding: 12px 0;
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-title, .skeleton-desc, .skeleton-box, .skeleton-input, .skeleton-textarea {
  background: var(--color-surface-hover);
  border-radius: 8px;
  animation: pulse-skeleton 1.5s infinite ease-in-out;
}

.skeleton-title {
  width: 30%;
  height: 24px;
}

.skeleton-desc {
  width: 60%;
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.skeleton-box {
  height: 80px;
}

.skeleton-input {
  height: 48px;
  width: 100%;
}

.skeleton-textarea {
  height: 240px;
  width: 100%;
}

@keyframes pulse-skeleton {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

</style>
