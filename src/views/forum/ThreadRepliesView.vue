<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/layouts/header.vue";
import LeftSidebar from "@/components/forum/LeftSidebar.vue";
import { useForumStore } from "@/stores/ForumStore";
import { useAuthStore } from "@/stores/AuthStore";
import MarkdownEditor from "@/components/forum/create/MarkdownEditor.vue";
import { stripMarkdown } from "@/utils/markdown";
import { renderStoredContent } from "@/utils/richContent";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import BaseModal from "@/components/base/BaseModal.vue";
import { useToast } from "vue-toastification";
import ReportModal from "@/components/base/ReportModal.vue";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";


const showReportModal = ref(false);
const showMoreActionsDropdown = ref(false);

const closeDropdown = (e) => {
  if (!e.target.closest(".more-actions-container")) {
    showMoreActionsDropdown.value = false;
  }
};

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const isPostingReply = ref(false);
const newReplyText = ref("");
const repliesEnd = ref(null);

const categoryGradients = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #10b981, #047857)",
  "linear-gradient(135deg, #5483B3, #052659)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #0d9488, #0f766e)",
  "linear-gradient(135deg, #ef4444, #b91c1c)",
];

const hashString = (value = "") =>
  String(value)
    .split("")
    .reduce((hash, char) => hash + char.charCodeAt(0), 0);

const getCategoryIcon = (label = "") => {
  const lower = label.toLowerCase();
  if (lower.includes("question") || lower.includes("answer"))
    return "bi-question-circle-fill";
  if (lower.includes("tutorial") || lower.includes("guide"))
    return "bi-book-half";
  if (lower.includes("showcase") || lower.includes("project"))
    return "bi-rocket-takeoff-fill";
  if (lower.includes("announce") || lower.includes("news"))
    return "bi-megaphone-fill";
  if (lower.includes("resource") || lower.includes("link"))
    return "bi-link-45deg";
  if (lower.includes("idea") || lower.includes("feature"))
    return "bi-lightbulb-fill";
  return "bi-chat-left-text-fill";
};

const getCategoryMeta = (item) => {
  const label =
    item?.categoryLabel || item?.categoryMeta?.label || item?.category || "";
  if (!label) return null;

  return {
    label,
    icon: item?.categoryMeta?.icon || getCategoryIcon(label),
    gradient: categoryGradients[hashString(label) % categoryGradients.length],
  };
};

// We'll try to fetch the discussion using the ID.
const mockDiscussion = ref(null);

const discussion = computed(() => {
  return forumStore.discussion || mockDiscussion.value;
});

const formatDateTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getCreatedAt = (item) => {
  return formatDateTime(
    item?.created_at || item?.createdAt || item?.updated_at || item?.timestamp,
  );
};

const normalizePlain = (value) =>
  stripMarkdown(String(value || ""))
    .trim()
    .toLowerCase();

const attachedCodeSnippetRegex =
  /\n{0,2}### Code Snippet\s*\n```[^\n`]*\n([\s\S]*?)\n```\s*$/i;

const extractedCodeData = computed(() => {
  if (!discussion.value) return { body: "", code: "" };
  
  const candidates = [
    discussion.value.body,
    discussion.value.description,
    discussion.value.excerpt,
  ].filter(Boolean);

  const titlePlain = normalizePlain(discussion.value.title);
  const rawBody = candidates.find(
    (candidate) => normalizePlain(candidate) !== titlePlain,
  ) || "";

  const match = rawBody.match(attachedCodeSnippetRegex);
  if (match) {
    return {
      body: rawBody.replace(attachedCodeSnippetRegex, "").trim(),
      code: match[1].trimEnd()
    };
  }

  return {
    body: rawBody,
    code: discussion.value.hasCode || discussion.value.code ? discussion.value.code : ""
  };
});

const discussionBody = computed(() => extractedCodeData.value.body);
const separateThreadCode = computed(() => extractedCodeData.value.code);

const replyCount = computed(() => {
  return Array.isArray(discussion.value?.replies)
    ? discussion.value.replies.length
    : 0;
});

const sortedReplies = computed(() => {
  if (!Array.isArray(discussion.value?.replies)) return [];
  return [...discussion.value.replies].sort((a, b) => {
    const likeDiff = Number(b.likes || 0) - Number(a.likes || 0);
    if (likeDiff !== 0) return likeDiff;
    return (
      new Date(a.created_at || a.createdAt || a.timestamp || 0) -
      new Date(b.created_at || b.createdAt || b.timestamp || 0)
    );
  });
});

const topReplyId = computed(() => {
  const first = sortedReplies.value[0];
  return first && Number(first.likes || 0) > 0 ? first.id : null;
});

const loadDiscussion = async (id) => {
  loading.value = true;

  // Start fetching and add a minimum 700ms delay to make the premium shimmer skeleton loader visible
  const fetchPromise = forumStore.fetchDiscussion(id);
  const delayPromise = new Promise((resolve) => setTimeout(resolve, 750));

  await Promise.all([fetchPromise, delayPromise]);

  // Mock data fallback if the API call didn't populate discussion
  if (!forumStore.discussion) {
    mockDiscussion.value = {
      id: id,
      title: "Optimizing IntersectionObserver composite layers for heavy lists",
      author: "@performance_dev",
      timestamp: "Posted 3h ago",
      category: "question",
      voted: null,
      votes: 14,
      excerpt:
        "Hey guys! I have been creating a modular viewport renderer. The issue is that composite layer sizing expands beyond viewport boundaries. Any ideas on how to constrain observer viewport bounds dynamically?",
      tags: [
        { label: "Vue.js", color: "green" },
        { label: "Performance", color: "orange" },
      ],
      replies: [
        {
          author: "@another_dev",
          timestamp: "1 hour ago",
          body: "This is a great question! Make sure to set custom rootMargin thresholds. By default, it uses standard viewport metrics which causes early rendering of hidden layers.",
          likes: 3,
          likedByUser: false,
        },
        {
          author: "@frontend_wizard",
          timestamp: "30 mins ago",
          body: "I highly recommend wrapping layer components with defensive CSS `contain-intrinsic-size` or `content-visibility: auto`. It mitigates thread lockup significantly.",
          likes: 8,
          likedByUser: false,
        },
      ],
    };
  }

  loading.value = false;
  setupCopyButtons();
};

onMounted(() => {
  loadDiscussion(route.params.id);
  document.addEventListener("click", closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdown);
});

// Utility to handle scrolling to a hash comment
const scrollToHash = () => {
  if (route.hash && route.hash.startsWith("#comment-")) {
    nextTick(() => {
      // Add a slight delay to ensure DOM layout is complete
      setTimeout(() => {
        const el = document.querySelector(route.hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Optional: Add a highlight effect
          el.style.transition = "background-color 1s ease";
          el.style.backgroundColor = "var(--bs-primary-bg-subtle, rgba(13, 110, 253, 0.15))";
          setTimeout(() => {
            el.style.backgroundColor = "";
          }, 2000);
        }
      }, 300);
    });
  }
};

// Watch for route ID changes to correctly trigger skeleton on page transitions
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadDiscussion(newId);
    }
  },
);

// Watch for discussion changes and setup copy code buttons
watch(
  () => forumStore.discussion,
  () => {
    setupCopyButtons();
    scrollToHash();
  },
  { deep: true },
);

const goBack = () => {
  router.push("/forum");
};

const selectTag = (tagName) => {
  const cleanTag = tagName.replace("#", "").trim();
  router.push({ path: "/forum", query: { tag: cleanTag } });
};

const handleVote = (direction) => {
  if (discussion.value) {
    forumStore.toggleVoteDiscussion(discussion.value.id, direction);
    toast.success(
      direction === "up" ? "Discussion upvoted!" : "Discussion downvoted!",
    );
  }
};

const toggleSaveDiscussion = () => {
  if (discussion.value) {
    const isNowSaved = !discussion.value.saved;

    if (isNowSaved) {
      toast.success("Discussion saved successfully!");
    } else {
      toast.success("Discussion removed from saved.");
    }

    forumStore.toggleSaveForum(discussion.value.id).catch((err) => {
      console.error("Failed to toggle save:", err);
      toast.error("Failed to save discussion.");
    });
  }
};

const handleLikeReply = (reply) => {
  if (!reply) return;
  if (reply.id) {
    forumStore.toggleLikeComment(reply.id);
    toast.success("Reply liked!");
    return;
  }

  const originalIndex = discussion.value?.replies?.indexOf(reply);
  if (originalIndex >= 0) {
    forumStore.toggleLikeReply(discussion.value.id, originalIndex);
    toast.success("Reply liked!");
  }
};

const postReply = async () => {
  if (!newReplyText.value.trim() || isPostingReply.value) return;

  isPostingReply.value = true;
  const replyData = {
    body: newReplyText.value.trim(),
  };

  try {
    await forumStore.postReply(discussion.value.id, replyData);
    newReplyText.value = "";
    toast.success("Reply posted successfully!");

    // Trigger smooth scroll to bottom and reload copy actions
    nextTick(() => {
      scrollToBottom();
      setupCopyButtons();
    });
  } catch (err) {
    console.error("Failed to post reply:", err);
    toast.error("Failed to post reply.");
  } finally {
    isPostingReply.value = false;
  }
};

const canDeleteDiscussion = computed(() => {
  if (!discussion.value || !authStore.user) return false;

  if (String(authStore.user.role || "").toLowerCase() === "admin") return true;

  const currentUserId = authStore.user.id;
  const discussionUserId = discussion.value.user_id || discussion.value.userId;
  if (currentUserId && discussionUserId && currentUserId == discussionUserId)
    return true;

  const currentUsername = authStore.user.username;
  const authorUsername =
    discussion.value.author?.username || discussion.value.author;
  if (currentUsername && authorUsername) {
    const cleanCurrent = currentUsername.replace("@", "").toLowerCase().trim();
    const cleanAuthor =
      typeof authorUsername === "string"
        ? authorUsername.replace("@", "").toLowerCase().trim()
        : (authorUsername.username || "").replace("@", "").toLowerCase().trim();
    if (cleanCurrent === cleanAuthor) return true;
  }

  return false;
});

const canDeleteReply = (reply) => {
  if (!authStore.user) return false;

  const currentUserId = authStore.user.id;
  const replyUserId = reply.user_id || reply.userId;
  if (currentUserId && replyUserId && currentUserId == replyUserId) return true;

  const currentUsername = authStore.user.username;
  const replyUsername = reply.author?.username || reply.author;
  if (currentUsername && replyUsername) {
    const cleanCurrent = currentUsername.replace("@", "").toLowerCase().trim();
    const cleanReply =
      typeof replyUsername === "string"
        ? replyUsername.replace("@", "").toLowerCase().trim()
        : (replyUsername.username || "").replace("@", "").toLowerCase().trim();
    if (cleanCurrent === cleanReply) return true;
  }

  return false;
};

const discussionAuthor = computed(() => {
  if (!discussion.value) return null;
  if (discussion.value.user && typeof discussion.value.user === "object") {
    return discussion.value.user;
  }
  if (discussion.value.author && typeof discussion.value.author === "object") {
    return discussion.value.author;
  }

  // Create a proper author object from flat fields if the backend didn't nest them
  return {
    name: discussion.value.author || discussion.value.user || "Unknown User",
    profile_pic:
      discussion.value.author_avatar || discussion.value.avatar || null,
  };
});

const showDeleteDiscModal = ref(false);
const showDeleteReplyModal = ref(false);
const replyToDeleteId = ref(null);

const editDiscussion = () => {
  router.push(`/forum/edit/${discussion.value.id}`);
};

const confirmDeleteDiscussion = () => {
  showDeleteDiscModal.value = true;
};

const performDeleteDiscussion = async () => {
  showDeleteDiscModal.value = false;
  try {
    await forumStore.deleteDiscussion(discussion.value.id);
    toast.success("Discussion deleted successfully!");
    router.push("/forum");
  } catch (err) {
    console.error("Failed to delete discussion:", err);
    toast.error("Failed to delete discussion.");
  }
};

const deleteReply = (replyId) => {
  if (!replyId) return;
  replyToDeleteId.value = replyId;
  showDeleteReplyModal.value = true;
};

const performDeleteReply = async () => {
  if (!replyToDeleteId.value) return;
  showDeleteReplyModal.value = false;
  try {
    await forumStore.deleteComment(replyToDeleteId.value);
    toast.success("Reply deleted successfully!");
    replyToDeleteId.value = null;
  } catch (err) {
    console.error("Failed to delete comment:", err);
    toast.error("Failed to delete reply.");
  }
};

const scrollToBottom = () => {
  repliesEnd.value?.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

function getAvatarName(author) {
  if (!author) return "User";
  if (typeof author === "object") {
    return author.name || author.username || "User";
  }
  return author;
}

function getAvatarInitials(author) {
  const name = getAvatarName(author);
  const clean = name.replace("@", "").trim();
  return clean ? clean.charAt(0).toUpperCase() : "U";
}

// Generates sleek deterministically-colored avatars based on username
function getAvatarStyle(author) {
  if (!author) return {};
  const name = getAvatarName(author);
  const clean = name.replace("@", "");
  const gradients = [
    "linear-gradient(135deg, #3b82f6, #2563eb)", // Blue
    "linear-gradient(135deg, #10b981, #059669)", // Emerald
    "linear-gradient(135deg, #f59e0b, #d97706)", // Amber
    "linear-gradient(135deg, #ef4444, #b91c1c)", // Red
    "linear-gradient(135deg, #5483B3, #052659)", // blue
    "linear-gradient(135deg, #06b6d4, #0891b2)", // Cyan
  ];
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    sum += clean.charCodeAt(i);
  }
  const grad = gradients[sum % gradients.length];
  return { background: grad };
}

function goToProfile(item) {
  if (!item) return;

  let identifier = item.user_id || item.author || item;

  if (typeof identifier === "string") {
    identifier = identifier.replace("@", "").trim();
  }

  router.push(`/viewprofile/${identifier}`);
}

// Search and inject copy buttons in pre tags dynamically
const setupCopyButtons = () => {
  nextTick(() => {
    // 1. Syntax highlight using highlight.js
    const codeBlocks = document.querySelectorAll(
      ".thread-body pre code, .reply-body pre code, .thread-code-block code"
    );
    codeBlocks.forEach((block) => {
      // Avoid highlighting already highlighted elements if any
      if (!block.classList.contains("hljs")) {
        hljs.highlightElement(block);
      }
    });

    // 2. Add copy buttons to all pre elements
    const preBlocks = document.querySelectorAll(
      ".thread-body pre, .reply-body pre, .thread-code-block pre",
    );
    preBlocks.forEach((pre) => {
      if (pre.querySelector(".copy-code-btn")) return;

      pre.style.position = "relative";
      const codeText = pre.querySelector("code")?.innerText || pre.innerText;

      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
            btn.classList.remove("copied");
          }, 2000);
        } catch (err) {
          console.error("Failed to copy code: ", err);
        }
      });
      pre.appendChild(btn);
    });
  });
};

function getAvatarUrl(author) {
  if (!author || typeof author !== "object") return null;
  const pic = author.profile_pic || author.avatar || author.avatarUrl;
  return resolveMediaUrl(pic);
}
</script>

<template>
  <div class="thread-replies-page">
    <Navbar />

    <div class="replies-page-grid-layout">
      <LeftSidebar active-tab="questions" class="replies-left-sidebar" />

      <div class="replies-wrapper">
        <button @click="goBack" class="back-btn">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Discussions
        </button>

        <!-- Premium Animated Skeleton Loader -->
        <div v-if="loading" class="skeleton-thread-container">
          <!-- Main Thread Skeleton Card -->
          <div class="skeleton-card main-thread-skeleton">
            <div class="skeleton-meta-row">
              <div class="skeleton-bar badge skeleton-shimmer"></div>
              <div class="skeleton-bar badge skeleton-shimmer"></div>
            </div>

            <div class="skeleton-title skeleton-shimmer"></div>
            <div class="skeleton-title short skeleton-shimmer"></div>

            <div class="skeleton-author-row">
              <div class="skeleton-avatar skeleton-shimmer"></div>
              <div class="skeleton-author-meta">
                <div class="skeleton-bar name skeleton-shimmer"></div>
                <div class="skeleton-bar time skeleton-shimmer"></div>
              </div>
            </div>

            <div class="skeleton-body">
              <div class="skeleton-bar text-line skeleton-shimmer"></div>
              <div class="skeleton-bar text-line skeleton-shimmer"></div>
              <div
                class="skeleton-bar text-line three-quarters skeleton-shimmer"
              ></div>
            </div>

            <div class="skeleton-tags">
              <div class="skeleton-bar tag skeleton-shimmer"></div>
              <div class="skeleton-bar tag skeleton-shimmer"></div>
            </div>

            <div class="skeleton-footer">
              <div class="skeleton-bar action skeleton-shimmer"></div>
              <div class="skeleton-bar action skeleton-shimmer"></div>
            </div>
          </div>

          <!-- Replies Section Skeleton -->
          <div class="skeleton-replies-section">
            <div class="skeleton-bar replies-title skeleton-shimmer"></div>

            <div class="skeleton-replies-list">
              <div v-for="i in 2" :key="i" class="skeleton-card reply-skeleton">
                <div class="skeleton-author-row">
                  <div class="skeleton-avatar small skeleton-shimmer"></div>
                  <div class="skeleton-author-meta">
                    <div class="skeleton-bar name skeleton-shimmer"></div>
                    <div class="skeleton-bar time skeleton-shimmer"></div>
                  </div>
                </div>
                <div class="skeleton-body small">
                  <div class="skeleton-bar text-line skeleton-shimmer"></div>
                  <div
                    class="skeleton-bar text-line half skeleton-shimmer"
                  ></div>
                </div>
                <div class="skeleton-footer small">
                  <div class="skeleton-bar action skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="discussion" class="thread-container">
          <!-- Main Thread Card -->
          <div class="main-thread">
            <div class="thread-header">
              <!-- Profile Info -->
              <div class="thread-meta">
                <div
                  class="thread-avatar"
                  :style="getAvatarStyle(discussionAuthor)"
                  @click="goToProfile(discussion)"
                >
                  <img
                    v-if="getAvatarUrl(discussionAuthor)"
                    :src="getAvatarUrl(discussionAuthor)"
                    alt="avatar"
                    class="avatar-img"
                  />
                  <span v-else>{{ getAvatarInitials(discussionAuthor) }}</span>
                </div>
                <div class="thread-user-info">
                  <span class="author" @click="goToProfile(discussion)">{{
                    getAvatarName(discussionAuthor)
                  }}</span>
                  <span class="time"
                    >Created {{ getCreatedAt(discussion) }}</span
                  >
                </div>
              </div>

              <!-- Title -->
              <h1 class="thread-title">{{ discussion.title }}</h1>

              <!-- Badges under title in the same row -->
              <div class="thread-meta-right">
                <!-- Styled Category badge -->
                <span
                  v-if="getCategoryMeta(discussion)"
                  class="category-badge"
                  :style="{
                    background: getCategoryMeta(discussion).gradient,
                    margin: 0
                  }"
                >
                  <i :class="['bi', getCategoryMeta(discussion).icon]"></i>
                  {{ getCategoryMeta(discussion).label }}
                </span>

                <!-- Custom tags section -->
                <div
                  v-if="discussion.tags && discussion.tags.length > 0"
                  class="thread-tags-box"
                  style="margin: 0; display: flex; flex-wrap: wrap; gap: 4px;"
                >
                  <span
                    v-for="t in discussion.tags"
                    :key="t.label"
                    class="tag-badge"
                    @click="selectTag(t.label)"
                    style="cursor: pointer; margin: 0;"
                  >
                    #{{ t.label }}
                  </span>
                </div>

                <!-- Code indicator -->
                <span
                  v-if="discussion.hasCode || separateThreadCode"
                  class="snippet-badge"
                  style="margin: 0;"
                >
                  <i class="bi bi-code-slash"></i> Snippet
                </span>
              </div>
            </div>

            <div
              class="thread-body"
              v-html="
                renderStoredContent(discussionBody || 'No description provided.')
              "
            ></div>

            <!-- Codeblock if present -->
            <div v-if="separateThreadCode" class="thread-code-block">
              <div class="code-header">
                <span class="code-lang">Code Block</span>
                <div class="code-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <pre><code>{{ separateThreadCode }}</code></pre>
            </div>

            <div class="thread-actions">
              <!-- Active Votes column in action bar -->
              <div class="vote-actions">
                <button
                  class="vote-action-btn up"
                  :class="{ active: discussion.voted === 'up' }"
                  @click="handleVote('up')"
                >
                  <i class="bi bi-arrow-up-circle-fill"></i>
                  Upvote
                </button>
                <span
                  class="vote-count-num"
                  :class="{
                    'voted-up': discussion.voted === 'up',
                    'voted-down': discussion.voted === 'down',
                  }"
                >
                  {{ discussion.votes }}
                </span>
                <button
                  class="vote-action-btn down"
                  :class="{ active: discussion.voted === 'down' }"
                  @click="handleVote('down')"
                >
                  <i class="bi bi-arrow-down-circle-fill"></i>
                  Downvote
                </button>
              </div>

              <div class="right-actions">
                <button
                  class="action-btn bookmark-btn"
                  :class="{ 'is-saved': discussion.saved }"
                  @click="toggleSaveDiscussion"
                >
                  <i
                    :class="[
                      discussion.saved ? 'bi-bookmark-fill' : 'bi-bookmark',
                    ]"
                  ></i>
                  <!-- <span>{{ discussion.saved ? "Saved" : "Save" }}</span> -->
                </button>

                <!-- More Actions Dropdown -->
                <div class="more-actions-container">
                  <button
                    class="action-btn more-btn"
                    @click.stop="showMoreActionsDropdown = !showMoreActionsDropdown"
                    title="More actions"
                  >
                    <i class="bi bi-three-dots"></i>
                  </button>

                  <transition name="fade">
                    <div
                      v-if="showMoreActionsDropdown"
                      class="more-dropdown-menu"
                    >
                      <button
                        v-if="canDeleteDiscussion"
                        class="dropdown-item edit-item"
                        @click="
                          editDiscussion();
                          showMoreActionsDropdown = false;
                        "
                      >
                        <i class="bi bi-pencil-square"></i>
                        <span>Edit</span>
                      </button>
                      <button
                        v-if="canDeleteDiscussion"
                        class="dropdown-item delete-item text-danger"
                        @click="
                          confirmDeleteDiscussion();
                          showMoreActionsDropdown = false;
                        "
                      >
                        <i class="bi bi-trash"></i>
                        <span>Delete</span>
                      </button>
                      <button
                        class="dropdown-item report-item text-danger"
                        @click="
                          showReportModal = true;
                          showMoreActionsDropdown = false;
                        "
                      >
                        <i class="bi bi-flag"></i>
                        <span>Report</span>
                      </button>
                    </div>
                  </transition>
                </div>

                <button class="action-btn" @click="scrollToBottom">
                  <i class="bi bi-chat-square-text"></i>
                  {{ replyCount }}
                </button>
              </div>
            </div>
          </div>

          <!-- Replies Section -->
          <div class="replies-section">
            <h2>Discussion Replies ({{ replyCount }})</h2>

            <div class="reply-list-container">
              <!-- Sleek Timeline Connector lines -->
              <div class="timeline-line"></div>

              <div class="reply-list">
                <div class="no-replies" v-if="replyCount === 0">
                  No replies yet. Be the first to share your thoughts!
                </div>

                <div
                  v-else
                  v-for="reply in sortedReplies"
                  :key="
                    reply.id ||
                    `${getAvatarName(reply.author)}-${getCreatedAt(reply)}`
                  "
                  :id="reply.id ? `comment-${reply.id}` : undefined"
                  :class="[
                    'reply-card',
                    { 'top-reply': topReplyId && reply.id === topReplyId },
                  ]"
                >
                  <div class="reply-vote-col" @click.stop>
                    <button
                      class="reply-vote-btn up"
                      :class="{ active: reply.likedByUser }"
                      @click="handleLikeReply(reply)"
                      title="Upvote reply"
                    >
                      <i class="bi bi-chevron-up"></i>
                    </button>
                    <span
                      class="reply-vote-num"
                      :class="{ active: reply.likedByUser }"
                      >{{ reply.likes || 0 }}</span
                    >
                    <button
                      class="reply-vote-btn down"
                      disabled
                      title="Downvote unavailable"
                    >
                      <i class="bi bi-chevron-down"></i>
                    </button>
                  </div>

                  <div class="reply-content">
                    <div class="reply-header">
                      <div class="reply-author-block">
                        <div
                          class="reply-avatar"
                          :style="getAvatarStyle(reply.author)"
                          @click="goToProfile(reply)"
                        >
                          <img
                            v-if="getAvatarUrl(reply.author)"
                            :src="getAvatarUrl(reply.author)"
                            alt="avatar"
                            class="avatar-img"
                          />
                          <span v-else>{{
                            getAvatarInitials(reply.author)
                          }}</span>
                        </div>
                        <div class="reply-user-info">
                          <span
                            class="reply-author"
                            @click="goToProfile(reply)"
                            >{{ getAvatarName(reply.author) }}</span
                          >
                          <span class="reply-time">{{
                            getCreatedAt(reply)
                          }}</span>
                        </div>
                      </div>

                      <span
                        v-if="topReplyId && reply.id === topReplyId"
                        class="top-reply-badge"
                      >
                        <i class="bi bi-stars"></i>
                        Top comment
                      </span>
                    </div>
                    <div
                      class="reply-body"
                      v-html="renderStoredContent(reply.body || '')"
                    ></div>

                    <div v-if="canDeleteReply(reply)" class="reply-actions">
                      <button
                        class="delete-reply-btn"
                        @click="deleteReply(reply.id)"
                      >
                        <i class="bi bi-trash"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Element to target smooth scroll -->
            <div ref="repliesEnd" class="scroll-anchor"></div>

            <!-- Reply Input Box Overhaul -->
            <div class="reply-input-wrapper">
              <div class="input-header">
                <div
                  class="reply-avatar current-user"
                  :style="getAvatarStyle(authStore.user || '@current_user')"
                >
                  <img
                    v-if="getAvatarUrl(authStore.user)"
                    :src="getAvatarUrl(authStore.user)"
                    alt="avatar"
                    class="avatar-img"
                  />
                  <span v-else>{{
                    getAvatarInitials(authStore.user || "@current_user")
                  }}</span>
                </div>
                <span class="input-prompt">Add to the discussion</span>
              </div>

              <MarkdownEditor
                v-model="newReplyText"
                placeholder="Write a constructive, formatted reply... Markdown is supported."
              />

              <div class="reply-footer">
                <button
                  class="post-btn"
                  :disabled="!newReplyText.trim() || isPostingReply"
                  @click="postReply"
                >
                  <span v-if="isPostingReply" class="spinner-border spinner-border-sm" style="margin-right: 8px;" role="status" aria-hidden="true"></span>
                  {{ isPostingReply ? 'Posting...' : 'Post Reply' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="error-state">
          Thread not found or could not be loaded.
        </div>
      </div>
    </div>

    <!-- Delete Discussion Modal -->
    <BaseModal
      v-if="showDeleteDiscModal"
      title="Delete Discussion"
      theme="danger"
      @closeModal="showDeleteDiscModal = false"
    >
      <p>
        Are you sure you want to delete this discussion? This action cannot be
        undone.
      </p>
      <template #footer>
        <button
          class="btn btn-light border"
          @click="showDeleteDiscModal = false"
        >
          Cancel
        </button>
        <button class="btn btn-danger" @click="performDeleteDiscussion">
          Delete
        </button>
      </template>
    </BaseModal>

    <!-- Delete Reply Modal -->
    <BaseModal
      v-if="showDeleteReplyModal"
      title="Delete Reply"
      theme="danger"
      @closeModal="showDeleteReplyModal = false"
    >
      <p>Are you sure you want to delete this reply?</p>
      <template #footer>
        <button
          class="btn btn-light border"
          @click="showDeleteReplyModal = false"
        >
          Cancel
        </button>
        <button class="btn btn-danger" @click="performDeleteReply">
          Delete
        </button>
      </template>
    </BaseModal>

    <!-- Report Modal -->
    <ReportModal
      v-if="showReportModal"
      type="forum"
      :target-id="discussion.id"
      title="Report Discussion Thread"
      @closeModal="showReportModal = false"
    />
  </div>
</template>

<style scoped>
.thread-replies-page {
  min-height: 100vh;
}

.replies-page-grid-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  max-width: 1280px;
  margin: 0 auto;
  gap: 28px;
  padding: 32px 24px 60px;
}

.replies-left-sidebar {
  padding-top: 0px;
}

@media (max-width: 1024px) {
  .replies-page-grid-layout {
    grid-template-columns: 1fr;
    padding: 24px;
  }
}

.replies-wrapper {
  max-width: 900px;
  margin: 0;
  width: 100%;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-weight: 800;
  font-size: 13.5px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.back-btn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-primary);
  transform: translateX(-2px);
}

.thread-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.main-thread {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface) 96%, var(--color-blue) 4%),
    var(--color-surface)
  );
  border-radius: 18px;
  padding: 34px;
  border: 1px solid
    color-mix(in srgb, var(--color-border) 86%, var(--color-blue) 14%);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: visible;
}

.thread-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  color: white;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.snippet-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--color-blue-light);
  color: var(--color-blue);
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  border: 1px solid var(--color-blue-light);
}

.thread-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}

.thread-title {
  font-size: clamp(1.4rem, 3.2vw, 2.0rem);
  font-weight: 800;
  color: var(--color-text);
  margin: 4px 0 0 0;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.thread-meta-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.thread-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.thread-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--color-surface);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.thread-avatar:hover {
  transform: scale(1.05);
}

.thread-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.thread-meta .author {
  font-weight: 850;
  color: var(--color-text);
  font-size: 13.5px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.thread-meta .author:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.thread-meta .time {
  font-size: 11.5px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.thread-body {
  font-size: 16px;
  color: var(--color-text);
  line-height: 1.75;
  margin-bottom: 24px;
  overflow-wrap: anywhere;
}

.thread-body :deep(p:last-child),
.reply-body :deep(p:last-child) {
  margin-bottom: 0;
}

/* Monospaced code snippets styling */
.thread-body :deep(code),
.reply-body :deep(code),
.thread-body :deep(font[face="monospace"]),
.reply-body :deep(font[face="monospace"]),
.thread-body :deep(span[style*="monospace"]),
.reply-body :deep(span[style*="monospace"]) {
  background-color: var(--color-surface-hover) !important;
  padding: 3px 6px !important;
  border-radius: 6px !important;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-size: 13.5px !important;
  color: var(--color-danger) !important;
  border: 1px solid var(--color-border) !important;
}

.thread-body :deep(pre),
.reply-body :deep(pre) {
  position: relative !important;
  background: #1e1e24 !important;
  border-radius: 12px !important;
  margin: 18px 0;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(84, 131, 179, 0.15);
  padding: 0 !important;
}

.thread-body :deep(pre code),
.reply-body :deep(pre code) {
  display: block !important;
  background: transparent !important;
  color: #abb2bf !important;
  padding: 16px 20px !important;
  padding-right: 90px !important;
  border-radius: 12px !important;
  border: none !important;
  font-size: 13.5px !important;
  line-height: 1.6 !important;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  overflow-x: auto !important;
  white-space: pre !important;
  word-break: normal !important;
  overflow-wrap: normal !important;
}

/* Floating copy code buttons inside pre blocks */
:deep(pre .copy-code-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-blue);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

:deep(pre .copy-code-btn:hover) {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  transform: translateY(-1px);
}

:deep(pre .copy-code-btn.copied) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.thread-body :deep(blockquote),
.reply-body :deep(blockquote) {
  border-left: 4px solid var(--color-blue) !important;
  background: var(--color-blue-light);
  margin: 18px 0 !important;
  padding: 10px 18px !important;
  border-radius: 0 10px 10px 0;
  color: var(--color-text-muted) !important;
}

/* Premium embedded table styling */
.thread-body :deep(table),
.reply-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 18px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.thread-body :deep(th),
.thread-body :deep(td),
.reply-body :deep(th),
.reply-body :deep(td) {
  border-bottom: 1px solid var(--color-border);
  padding: 12px 16px;
  text-align: left;
  color: var(--color-text);
}

.thread-body :deep(th),
.reply-body :deep(th) {
  background-color: var(--color-surface-hover);
  font-weight: 700;
  color: var(--color-text);
}

.thread-code-block {
  background: #1e1e24;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(84, 131, 179, 0.15);
  margin-bottom: 24px;
}

.thread-code-block pre {
  margin: 0;
  padding: 0 !important;
  position: relative !important;
}

.thread-code-block code {
  display: block !important;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 13.5px;
  line-height: 1.6;
  color: #abb2bf;
  padding: 16px 20px !important;
  padding-right: 90px !important;
  overflow-x: auto !important;
  white-space: pre !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(84, 131, 179, 0.1);
}

.code-lang {
  font-size: 11px;
  font-weight: 700;
  color: #5483B3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-dots {
  display: flex;
  gap: 6px;
}

.code-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.code-dots span:nth-child(1) { background: #ef4444; }
.code-dots span:nth-child(2) { background: #f59e0b; }
.code-dots span:nth-child(3) { background: #10b981; }


.thread-tags-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tag-badge {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-blue);
  background: var(--color-blue-light);
  padding: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-badge:hover {
  background: var(--color-blue);
  color: white;
  transform: translateY(-1px);
}

.thread-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border);
  gap: 16px;
  flex-wrap: wrap;
}

.vote-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.vote-action-btn i {
  font-size: 14px;
  transition: color 0.2s ease;
}

.vote-action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-primary);
}

.vote-action-btn.up.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.vote-action-btn.up.active i {
  color: var(--color-primary);
}

.vote-action-btn.down.active {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.vote-action-btn.down.active i {
  color: var(--color-danger);
}

.vote-count-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text);
  min-width: 24px;
  text-align: center;
}

.vote-count-num.voted-up {
  color: var(--color-primary);
}

.vote-count-num.voted-down {
  color: var(--color-danger);
}

.right-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn.bookmark-btn.is-saved {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.action-btn.edit-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.action-btn.delete-btn:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: var(--color-danger-light);
}

/* Replies section */
.replies-section {
  margin-top: 24px;
}

.replies-section h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 20px;
  letter-spacing: -0.3px;
}

.reply-list-container {
  position: relative;
  padding-left: 20px;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border-soft);
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-card {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-surface) 97%, var(--color-blue) 3%),
    var(--color-surface)
  );
  border-radius: 16px;
  padding: 22px 26px 22px 18px;
  border: 1px solid color-mix(in srgb, var(--color-border) 88%, transparent);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 18px;
  transition: all 0.2s ease;
  animation: slide-up-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reply-card:hover {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 48%,
    var(--color-border)
  );
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.reply-card.top-reply {
  border-color: color-mix(
    in srgb,
    var(--color-primary) 64%,
    var(--color-border)
  );
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 26%, transparent),
    var(--shadow-md);
}

.reply-vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 2px;
  user-select: none;
}

.reply-vote-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reply-vote-btn i {
  font-size: 18px;
  line-height: 1;
}

.reply-vote-btn:hover:not(:disabled),
.reply-vote-btn.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.reply-vote-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.reply-vote-num {
  color: var(--color-text);
  font-size: 1.15rem;
  font-weight: 900;
  line-height: 1;
}

.reply-vote-num.active {
  color: var(--color-primary);
}

.reply-content {
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.reply-author-block {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1.5px solid var(--color-surface);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.reply-avatar:hover {
  transform: scale(1.08);
}

.reply-user-info {
  display: flex;
  flex-direction: column;
}

.reply-author {
  font-weight: 700;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.reply-author:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.reply-time {
  font-size: 11.5px;
  color: var(--color-text-muted);
}

.top-reply-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  border-radius: 999px;
  padding: 0 10px;
  font-size: 0.74rem;
  font-weight: 850;
  white-space: nowrap;
}

.reply-body {
  font-size: 14.5px;
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 14px;
  overflow-wrap: anywhere;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.delete-reply-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.delete-reply-btn:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.delete-reply-btn i {
  font-size: 14px;
}

/* Reply Input Box */
.reply-input-wrapper {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 28px;
  margin-top: 10px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.reply-input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.reply-input-wrapper :deep(.editor-container) {
  border: 1px solid var(--color-border);
  box-shadow: none;
  border-radius: 12px;
  background: var(--color-bg);
}

.reply-input-wrapper :deep(.editor-workspace) {
  min-height: 180px;
}

.reply-input-wrapper :deep(.editor-textarea) {
  min-height: 180px;
  background: transparent;
  color: var(--color-text);
}

.reply-input-wrapper :deep(.preview-pane) {
  max-height: 250px;
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reply-avatar.current-user {
  width: 36px;
  height: 36px;
}

.input-prompt {
  font-weight: 700;
  color: var(--color-text);
  font-size: 15px;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.post-btn {
  background: var(--color-text);
  color: var(--color-bg);
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-replies {
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  color: var(--color-text-muted);
  font-weight: 500;
}

.scroll-anchor {
  height: 1px;
}

@media (max-width: 640px) {
  .main-thread {
    padding: 24px 20px;
  }

  .thread-actions,
  .right-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .vote-actions {
    justify-content: space-between;
  }

  .reply-list-container {
    padding-left: 0;
  }

  .timeline-line {
    display: none;
  }

  .reply-card {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 18px;
  }

  .reply-vote-col {
    flex-direction: row;
    justify-content: flex-start;
    padding-top: 0;
  }

  .reply-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .reply-input-wrapper {
    padding: 20px;
  }
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 600;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-surface-hover);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* High-Fidelity Animated Skeleton Shimmer Styles */
.skeleton-thread-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fade-in 0.3s ease;
}

.skeleton-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.reply-skeleton {
  padding: 24px 28px;
  margin-bottom: 16px;
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-hover) 25%,
    var(--color-border-soft) 37%,
    var(--color-surface-hover) 63%
  );
  background-size: 200% 100%;
  animation: shimmer-animation 1.5s infinite linear;
}

@keyframes shimmer-animation {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-bar {
  border-radius: 6px;
  height: 14px;
  background: var(--color-surface-hover);
}

.skeleton-meta-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.skeleton-bar.badge {
  width: 80px;
  height: 20px;
  border-radius: 100px;
}

.skeleton-title {
  height: 28px;
  width: 90%;
  margin-bottom: 10px;
  border-radius: 8px;
}

.skeleton-title.short {
  width: 50%;
  margin-bottom: 24px;
}

.skeleton-author-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-surface-hover);
}

.skeleton-avatar.small {
  width: 32px;
  height: 32px;
}

.skeleton-author-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 120px;
}

.skeleton-bar.name {
  width: 100%;
  height: 12px;
}

.skeleton-bar.time {
  width: 60%;
  height: 10px;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.skeleton-body.small {
  margin-bottom: 14px;
}

.skeleton-bar.text-line {
  width: 100%;
  height: 14px;
}

.skeleton-bar.text-line.three-quarters {
  width: 75%;
}

.skeleton-bar.text-line.half {
  width: 50%;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.skeleton-bar.tag {
  width: 70px;
  height: 22px;
  border-radius: 8px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px dashed var(--color-border);
}

.skeleton-footer.small {
  border-top: none;
  padding-top: 0;
}

.skeleton-bar.action {
  width: 90px;
  height: 32px;
  border-radius: 8px;
}

.skeleton-replies-section {
  margin-top: 12px;
}

.skeleton-bar.replies-title {
  width: 180px;
  height: 20px;
  margin-bottom: 20px;
  border-radius: 6px;
}

.skeleton-replies-list {
  display: flex;
  flex-direction: column;
  padding-left: 20px;
  border-left: 2px solid var(--color-border-soft);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.reply-avatar,
.thread-avatar {
  overflow: hidden;
}

/* More Actions Dropdown Styling */
.more-actions-container {
  position: relative;
  display: inline-block;
}

.more-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 140px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 6px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.dropdown-item i {
  font-size: 14px;
}

.dropdown-item.delete-item:hover,
.dropdown-item.report-item:hover {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.more-btn {
  padding: 8px 12px;
}
</style>
