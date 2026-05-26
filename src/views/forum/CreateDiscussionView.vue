<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useForumStore } from "../../stores/ForumStore";
import Navbar from "../../components/layouts/header.vue";
import MarkdownEditor from "../../components/forum/create/MarkdownEditor.vue";
import LeftSidebar from "../../components/forum/LeftSidebar.vue";
import { useToast } from "vue-toastification";

const router = useRouter();
const forumStore = useForumStore();
const toast = useToast();

const isEditorFocused = ref(false);
const isSubmitting = ref(false);

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

                <MarkdownEditor
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
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: 80px;
}

.create-page-grid-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  max-width: 1440px;
  margin: 0 auto;
  gap: 28px;
  padding: 0 24px;
}

@media (max-width: 1024px) {
  .create-page-grid-layout {
    grid-template-columns: 1fr;
    padding: 0;
  }
  .left-sidebar-navigation {
    display: none !important;
  }
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
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
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
  color: var(--color-text-muted);
  border: none;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
}

.btn-discard:hover {
  background: var(--color-surface-hover);
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
  background: var(--color-surface);
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
  background: linear-gradient(90deg, var(--color-primary), var(--color-success), var(--color-info));
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
  margin: 4px 0 12px 34px;
  font-size: 13.5px;
  color: var(--color-text-muted);
  line-height: 1.4;
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
  padding: 14px 18px;
  padding-right: 110px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-size: 14.5px;
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.form-input:focus {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
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
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
  margin-left: 34px;
}

.category-card {
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-hover);
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
  background: var(--color-surface);
  border-color: var(--color-primary);
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
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
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
