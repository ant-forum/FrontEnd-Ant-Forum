<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useForumStore } from "@/stores/ForumStore";
import { useToast } from "vue-toastification";
import { resolveMediaUrl } from "@/utils/mediaUrl";

const router = useRouter();
const toast = useToast();

function goToProfile(d) {
  if (!d) return;

  let identifier = d.user_id || d.author || "user";

  if (typeof identifier === "string") {
    identifier = identifier.replace("@", "").trim();
  }

  router.push(`/viewprofile/${identifier}`);
}

function getAuthorName(author) {
  if (typeof author === "object" && author !== null) {
    return author.username || author.name || "User";
  }
  return author || "User";
}

function getAuthorAvatar(d) {
  if (!d) return null;
  const author = d.author || d.user;
  let rawUrl = null;
  if (d.author_avatar || d.avatar) {
    rawUrl = d.author_avatar || d.avatar;
  } else if (typeof author === "object" && author !== null) {
    rawUrl = author.profile_pic || author.avatar || author.avatarUrl || null;
  }
  return resolveMediaUrl(rawUrl);
}

function getAuthorInitials(author) {
  return (
    getAuthorName(author).replace("@", "").trim().slice(0, 2).toUpperCase() ||
    "U"
  );
}

function getReplyCount(d) {
  return Array.isArray(d.replies)
    ? d.replies.length
    : typeof d.replies === "number"
      ? d.replies
      : Number(d.comment_count || 0);
}

function formatCreatedAt(d) {
  const raw = d.createdAt || d.created_at || d.timestamp;
  if (!raw) return "Just now";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

defineProps({
  discussions: { type: Array, required: true },
});

const forumStore = useForumStore();

const tagColorMap = {
  blue: { bg: "var(--color-tag-blue-bg)", color: "var(--color-tag-blue-text)" },
  orange: {
    bg: "var(--color-tag-pink-bg)",
    color: "var(--color-tag-pink-text)",
  }, // mapping orange to pink for now or adding more variables
  green: {
    bg: "var(--color-tag-cyan-bg)",
    color: "var(--color-tag-cyan-text)",
  },
  blue: {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  pink: { bg: "var(--color-tag-pink-bg)", color: "var(--color-tag-pink-text)" },
  teal: { bg: "var(--color-tag-cyan-bg)", color: "var(--color-tag-cyan-text)" },
  red: { bg: "var(--color-tag-red-bg)", color: "var(--color-tag-red-text)" },
  gray: { bg: "var(--color-surface-hover)", color: "var(--color-text-muted)" },
};

// Add standard categories as fallback colors
const tagStyles = {
  React: {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  Performance: {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  "System Design": {
    bg: "var(--color-tag-pink-bg)",
    color: "var(--color-tag-pink-text)",
  },
  Architecture: {
    bg: "var(--color-tag-cyan-bg)",
    color: "var(--color-tag-cyan-text)",
  },
  CSS: { bg: "var(--color-tag-pink-bg)", color: "var(--color-tag-pink-text)" },
  Tailwind: {
    bg: "var(--color-tag-cyan-bg)",
    color: "var(--color-tag-cyan-text)",
  },
  Docker: {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  "Node.js": {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  DevOps: {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  "Vue 3": {
    bg: "var(--color-tag-cyan-bg)",
    color: "var(--color-tag-cyan-text)",
  },
  "Composition API": {
    bg: "var(--color-tag-blue-bg)",
    color: "var(--color-tag-blue-text)",
  },
  GraphQL: {
    bg: "var(--color-tag-pink-bg)",
    color: "var(--color-tag-pink-text)",
  },
  API: { bg: "var(--color-tag-cyan-bg)", color: "var(--color-tag-cyan-text)" },
  Security: {
    bg: "var(--color-tag-red-bg)",
    color: "var(--color-tag-red-text)",
  },
  npm: { bg: "var(--color-tag-pink-bg)", color: "var(--color-tag-pink-text)" },
  Microservices: {
    bg: "var(--color-tag-cyan-bg)",
    color: "var(--color-tag-cyan-text)",
  },
  Monolith: {
    bg: "var(--color-surface-hover)",
    color: "var(--color-text-muted)",
  },
};

function getTagStyle(label, defaultColor) {
  if (tagStyles[label]) {
    return { background: tagStyles[label].bg, color: tagStyles[label].color };
  }
  const colorKey = defaultColor || "gray";
  const t = tagColorMap[colorKey] || tagColorMap.gray;
  return { background: t.bg, color: t.color };
}

const copiedId = ref(null);

async function shareThread(id) {
  const url = `${window.location.origin}/forum/${id}`;
  try {
    await navigator.clipboard.writeText(url);
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
}

function toggleSave(d) {
  const isNowSaved = !d.saved; // Since store will toggle it instantly

  if (isNowSaved) {
    toast.success("Discussion saved successfully!");
  } else {
    toast.success("Discussion removed from saved.");
  }

  forumStore.toggleSaveForum(d.id).catch((err) => {
    console.error("Failed to toggle save:", err);
    toast.error("Failed to save discussion.");
  });
}

async function handleVote(id, direction) {
  try {
    const res = await forumStore.toggleVoteDiscussion(id, direction);
    if (res && res.ignored) return;
    toast.success(direction === "up" ? "Upvoted!" : "Downvoted!");
  } catch (err) {
    console.error("Failed to vote:", err);
  }
}

const categoryGradients = [
  "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  "linear-gradient(135deg, #10b981, #047857)",
  "linear-gradient(135deg, #5483B3, #052659)",
  "linear-gradient(135deg, #f59e0b, #b45309)",
  "linear-gradient(135deg, #0d9488, #0f766e)",
  "linear-gradient(135deg, #ef4444, #b91c1c)",
];

function hashString(value = "") {
  return String(value)
    .split("")
    .reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function getCategoryIcon(label = "") {
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
}

function getCategoryMeta(d) {
  const label =
    d.categoryLabel || d.categoryMeta?.label || d.category || "Discussion";
  return {
    label,
    icon: d.categoryMeta?.icon || getCategoryIcon(label),
    gradient: categoryGradients[hashString(label) % categoryGradients.length],
  };
}

function selectTag(tagName) {
  const cleanTag = tagName.replace("#", "").trim();
  router.push({ path: "/forum", query: { tag: cleanTag } });
}
</script>

<template>
  <div class="thread-list">
    <div
      v-for="d in discussions"
      :key="d.id"
      class="thread-card"
      @click="$router.push(`/forum/${d.id}`)"
    >
      <!-- Vote Column (Exactly like screenshot) -->
      <div class="vote-col" @click.stop>
        <button
          class="vote-btn up"
          :class="{ active: d.voted === 'up' }"
          @click.stop="handleVote(d.id, 'up')"
        >
          <i class="bi bi-chevron-up"></i>
        </button>
        <span
          class="vote-num"
          :class="{
            'voted-up': d.voted === 'up',
            'voted-down': d.voted === 'down',
          }"
        >
          {{ d.votes }}
        </span>
        <button
          class="vote-btn down"
          :class="{ active: d.voted === 'down' }"
          @click.stop="handleVote(d.id, 'down')"
        >
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>

      <!-- Content Column -->
      <div class="thread-content">
        <div class="thread-header">
          <button
            class="author-chip"
            type="button"
            @click.stop="goToProfile(d)"
          >
            <span class="author-avatar">
              <img v-if="getAuthorAvatar(d)" :src="getAuthorAvatar(d)" alt="" />
              <span v-else>{{ getAuthorInitials(d.author) }}</span>
            </span>
            <span class="author-copy">
              <strong>@{{ getAuthorName(d.author).replace("@", "") }}</strong>
              <small>Created {{ formatCreatedAt(d) }}</small>
            </span>
          </button>

          <div class="thread-status">
            <!-- Category Badge -->
            <span
              v-if="d.category || d.categoryLabel || d.categoryMeta"
              class="category-badge"
              :style="{ background: getCategoryMeta(d).gradient }"
            >
              <i :class="['bi', getCategoryMeta(d).icon]"></i>
              {{ getCategoryMeta(d).label }}
            </span>

            <!-- Tag Badges -->
            <span
              v-for="tag in d.tags"
              :key="tag.label || tag.name || tag"
              class="tag-chip"
              :style="getTagStyle(tag.label || tag.name || tag, tag.color)"
              @click.stop="selectTag(tag.label || tag.name || tag)"
            >
              #{{ tag.label || tag.name || tag }}
            </span>
          </div>
        </div>

        <!-- Title -->
        <h3 class="thread-title">{{ d.title }}</h3>

        <!-- Excerpt -->
        <p class="thread-excerpt">{{ d.excerpt || d.description || d.body }}</p>

        <!-- Code Block (Card 2 / hasCode) -->
        <div v-if="d.hasCode && d.code" class="code-block" @click.stop>
          <div class="code-header">
            <span class="code-lang">Go snippet example</span>
            <div class="code-dots"><span></span><span></span><span></span></div>
          </div>
          <pre><code>{{ d.code }}</code></pre>
        </div>

        <!-- Footer Row -->
        <div class="thread-footer">
          <button
            class="foot-btn replies"
            @click.stop="$router.push(`/forum/${d.id}`)"
            title="Replies"
          >
            <i class="bi bi-chat-square-text"></i>
            <span>{{ getReplyCount(d) }}</span>
          </button>

          <button
            class="foot-btn bookmark"
            :class="{ 'is-saved': d.saved }"
            @click.stop="toggleSave(d)"
            :title="d.saved ? 'Saved' : 'Save'"
          >
            <i :class="[d.saved ? 'bi-bookmark-fill' : 'bi-bookmark']"></i>
          </button>

          <button
            class="foot-btn share"
            :class="{ 'is-copied': copiedId === d.id }"
            @click.stop="shareThread(d.id)"
            :title="copiedId === d.id ? 'Copied!' : 'Share'"
          >
            <i :class="[copiedId === d.id ? 'bi-check' : 'bi-share']"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thread-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thread-card {
  display: flex;
  background: var(--color-glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 18px;
  border: 1px solid var(--color-glass-border);
  box-shadow: var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.thread-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: 
   radial-gradient( var(--glow-hover-secondary) 0%, transparent 10%);
    /* radial-gradient(circle at top right, var(--glow-hover-primary) 0%, transparent 10%), 
    radial-gradient(circle at bottom left, var(--glow-hover-secondary) 0%, transparent 10%); */
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  pointer-events: none;
}

.thread-card:hover::before {
  opacity: 1;
}

.thread-card > * {
  position: relative;
  z-index: 1;
}

.thread-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md), inset 0 0 20px rgba(84, 131, 179,0.25);
  border-color: rgba(84, 131, 179, 0.5);
  z-index: 50;
}

/* Vote Column (Clean layout matching reference) */
.vote-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 8px 24px 24px;
  gap: 6px;
  min-width: 60px;
  user-select: none;
}

.vote-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

.vote-btn:hover {
  color: var(--color-primary);
  background: var(--color-surface-hover);
}

.vote-btn.up.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.vote-btn.down.active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.vote-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.vote-num.voted-up {
  color: var(--color-primary);
}

.vote-num.voted-down {
  color: var(--color-primary);
}

/* Thread Content Column */
.thread-content {
  flex: 1;
  padding: 22px 24px 22px 12px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Metadata Row */
.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.author-chip {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.author-avatar {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: hidden;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--color-blue),
    var(--color-primary)
  );
  border: 2px solid var(--color-border);
  border-radius: 50%;
  font-size: 0.78rem;
  font-weight: 900;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.author-copy strong {
  max-width: 220px;
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.author-copy small {
  color: var(--color-text-muted);
  font-size: 0.74rem;
  font-weight: 700;
}

.author-chip:hover .author-copy strong {
  color: var(--color-primary);
}

.thread-status {
  display: flex;
  align-items: center;
  gap: 8px;
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

.reply-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  color: var(--color-text-muted);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0 12px;
  font-size: 0.78rem;
  font-weight: 800;
}

.reply-pill i {
  color: var(--color-primary);
}

.thread-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-chip {
  padding: 4px 12px;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-chip:hover {
  filter: brightness(0.85);
  transform: translateY(-1px);
}

/* Title & Excerpt */
.thread-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  overflow-wrap: anywhere;
  transition: color 0.2s ease;
}

.thread-card:hover .thread-title {
  color: var(--color-primary);
}

.thread-excerpt {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Code block (Go style dark block inside card) */
.code-block {
  background: var(--color-bg);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin-top: 4px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
}

.code-lang {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.code-dots {
  display: flex;
  gap: 4px;
}

.code-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border);
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text);
}

/* Footer Action Buttons */
.thread-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.foot-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  background: var(--color-surface-hover);
  border: 1px solid transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 11px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.foot-btn i {
  font-size: 15px;
}

.foot-btn:hover {
  color: var(--color-text);
  border-color: color-mix(
    in srgb,
    var(--color-primary) 38%,
    var(--color-border)
  );
}

.foot-btn.bookmark.is-saved {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.foot-btn.share.is-copied {
  color: #16a34a;
}

@media (max-width: 640px) {
  .thread-card {
    flex-direction: column;
  }
  .vote-col {
    flex-direction: row;
    padding: 16px 16px 8px 16px;
    min-width: auto;
    gap: 12px;
  }
  .thread-content {
    padding: 8px 16px 16px 16px;
  }
}
</style>
