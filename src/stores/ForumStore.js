import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";

export const useForumStore = defineStore("forum", () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const discussions = ref([]);
  const discussion = ref(null);
  const isLoading = ref(false);
  const comments = ref([]);
  const bookmarks = ref([]);

  const allDiscussions = computed(() => discussions.value);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const getStatusClass = (status) => {
    const classes = {
      ACTIVE: "status-active",
      PINNED: "status-pinned",
      FLAGGED: "status-flagged",
      LOCKED: "status-locked",
    };
    return classes[status] || "status-active";
  };

  const getTagColor = (tag) => {
    if (!tag) return "gray";
    const lower = tag.toLowerCase().trim();
    if (lower.includes("vue") || lower.includes("pinia")) return "green";
    if (lower.includes("react") || lower.includes("native")) return "blue";
    if (lower.includes("css") || lower.includes("tailwind")) return "teal";
    if (lower.includes("js") || lower.includes("javascript") || lower.includes("node")) return "yellow";
    if (lower.includes("design") || lower.includes("architecture") || lower.includes("system")) return "purple";
    if (lower.includes("html")) return "orange";
    if (lower.includes("mongo") || lower.includes("sql") || lower.includes("db")) return "pink";
    return "gray";
  };

  /**
   * Normalise a single forum object from the API into a consistent shape.
   */
  const normalizeForum = (item) => {
    if (!item) return null;

    // Author
    let author = item.author;
    if (!author && item.user) {
      author = {
        name: item.user.username || item.user.name || "Unknown",
        avatar:
          item.user.profile_pic ||
          item.user.avatar ||
          "https://i.pravatar.cc/150?u=default",
        username: item.user.username ? `@${item.user.username}` : "@unknown",
      };
    }
    if (!author) {
      author = {
        name: "Unknown",
        avatar: "https://i.pravatar.cc/150?u=default",
        username: "@unknown",
      };
    }

    // Relative timestamp
    let timestamp = item.timestamp || "";
    if (!timestamp && (item.created_at || item.createdAt)) {
      const d = new Date(item.created_at || item.createdAt);
      if (!isNaN(d.getTime())) {
        const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
        if (diffH < 1) timestamp = "Just now";
        else if (diffH < 24) timestamp = `${diffH} hours ago`;
        else timestamp = `${Math.floor(diffH / 24)} days ago`;
      }
    }

    return {
      ...item,
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      excerpt: item.excerpt || item.description || "",
      body: item.body || item.description || "",
      category: item.category || item.category_id || "discussion",
      category_id: item.category_id,
      author,
      replies: Array.isArray(item.replies) ? item.replies : [],
      views: item.views || 0,
      votes: item.votes || 0,
      status: item.status || "ACTIVE",
      statusClass: getStatusClass(item.status || "ACTIVE"),
      reports: item.reports || 0,
      timestamp,
      created_at: item.created_at || item.createdAt || new Date().toISOString(),
      tags: (() => {
        if (Array.isArray(item.tags)) {
          return item.tags.map(t => {
            if (typeof t === 'string') {
              return { label: t, color: getTagColor(t) };
            }
            const label = t.label || t.name || '';
            return {
              id: t.id,
              label,
              color: t.color || getTagColor(label),
            };
          });
        }
        if (item.tag && item.tag !== 'null') {
          return [{
            id: item.tag_id && item.tag_id !== 'null' ? Number(item.tag_id) : undefined,
            label: item.tag,
            color: getTagColor(item.tag),
          }];
        }
        return [];
      })(),
      hasCode: item.hasCode || false,
      code: item.code || "",
    };
  };

  /**
   * Normalise a single comment object from the API into a consistent shape.
   */
  const normalizeComment = (item) => {
    if (!item) return null;
    let author = item.user || item.author;
    if (author) {
      author = {
        name: author.username || author.name || "Unknown",
        avatar:
          author.profile_pic ||
          author.avatar ||
          "https://i.pravatar.cc/150?u=default",
        username: author.username ? `@${author.username}` : "@unknown",
      };
    } else {
      author = {
        name: "Unknown",
        avatar: "https://i.pravatar.cc/150?u=default",
        username: "@unknown",
      };
    }

    let timestamp = item.timestamp || "";
    if (!timestamp && (item.created_at || item.createdAt)) {
      const d = new Date(item.created_at || item.createdAt);
      if (!isNaN(d.getTime())) {
        const diffH = Math.floor((Date.now() - d.getTime()) / 3600000);
        if (diffH < 1) timestamp = "Just now";
        else if (diffH < 24) timestamp = `${diffH} hours ago`;
        else timestamp = `${Math.floor(diffH / 24)} days ago`;
      }
    }

    return {
      ...item,
      id: item.id,
      body: item.description || item.body || "",
      description: item.description || "",
      author,
      likes: item.likes_count ?? (Array.isArray(item.likes) ? item.likes.length : (item.likes || 0)),
      likedByUser: item.isLiked ?? item.likedByUser ?? false,
      timestamp,
      created_at: item.created_at || item.createdAt || new Date().toISOString(),
    };
  };

  /**
   * Extract an array from various API response shapes.
   */
  const extractList = (responseData) => {
    if (!responseData) return [];
    const d = responseData.data !== undefined ? responseData.data : responseData;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && Array.isArray(d.items)) return d.items;
    return [];
  };

  // ---------------------------------------------------------------------------
  //  CRUD — api/forums/
  // ---------------------------------------------------------------------------

  /**
   * GET  /api/forums/
   * Fetch all forums.
   */
  const fetchDiscussions = async (force = false) => {
    if (!force && discussions.value.length > 0) return;

    isLoading.value = true;
    try {
      const res = await api.get("/api/forums/");
      const list = extractList(res.data);
      if (list.length > 0) {
        discussions.value = list.map(normalizeForum);
        await fetchBookmarks();
      } else {
        discussions.value = [];
      }
    } catch (err) {
      console.error("[ForumStore] GET /api/forums/ failed:", err.response?.status, err.response?.data || err.message);
      if (discussions.value.length === 0) discussions.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * GET  /api/forums/:id
   * Fetch a single forum by ID.
   */
  const fetchDiscussion = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/forums/${id}`);
      const raw = res.data?.data || res.data;
      discussion.value = normalizeForum(raw);
      await fetchCommentsByForumId(id);
      return discussion.value;
    } catch (err) {
      console.error(`[ForumStore] GET /api/forums/${id} failed:`, err.response?.status, err.response?.data || err.message);
      // Fallback: look inside the already-fetched list
      if (discussions.value.length === 0) await fetchDiscussions();
      discussion.value = discussions.value.find((d) => d.id == id) || null;
      if (discussion.value) {
        await fetchCommentsByForumId(id);
      }
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * POST  /api/forums/
   * Body: { title, description, category_id }
   *
   * Sends ONLY the three fields the API expects.
   * Extra display fields (tags, code, etc.) are merged locally.
   */
  const createDiscussion = async (data) => {
    isLoading.value = true;
    try {
      // Build exactly the payload the API expects
      const payload = {
        title: data.title,
        description: data.description || data.excerpt || "",
        category_id: Number(data.category_id) || 1,
        tags: Array.isArray(data.tags) ? data.tags.map(t => typeof t === 'string' ? t : (t.label || t.name)) : [],
      };

      console.log("[ForumStore] Creating forum with payload:", payload);
      const res = await api.post("/api/forums/", payload);
      console.log("[ForumStore] Create response:", res.data);

      const created = res.data?.data || res.data;
      const normalised = normalizeForum({ ...data, ...created });
      discussions.value.unshift(normalised);
      return normalised;
    } catch (err) {
      console.error("[ForumStore] POST /api/forums/ failed:", err.response?.status, err.response?.data || err.message);

      // Local-only fallback so the UI doesn't break
      const fallback = normalizeForum({
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString(),
      });
      discussions.value.unshift(fallback);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * PUT  /api/forums/:id
   * Body: { title, description }
   */
  const updateDiscussion = async (id, data) => {
    isLoading.value = true;
    try {
      const payload = {
        title: data.title,
        description: data.description || data.excerpt || "",
        tags: Array.isArray(data.tags) ? data.tags.map(t => typeof t === 'string' ? t : (t.label || t.name)) : [],
      };

      const res = await api.put(`/api/forums/${id}`, payload);
      const updated = res.data?.data || res.data;
      const normalised = normalizeForum(updated);

      // Patch local list
      const idx = discussions.value.findIndex((d) => d.id == id);
      if (idx !== -1) {
        discussions.value[idx] = { ...discussions.value[idx], ...normalised };
      }
      if (discussion.value && discussion.value.id == id) {
        discussion.value = { ...discussion.value, ...normalised };
      }
      return normalised;
    } catch (err) {
      console.error(`[ForumStore] PUT /api/forums/${id} failed:`, err.response?.status, err.response?.data || err.message);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * DELETE  /api/forums/:id
   */
  const deleteDiscussion = async (id) => {
    isLoading.value = true;
    try {
      await api.delete(`/api/forums/${id}`);
    } catch (err) {
      console.error(`[ForumStore] DELETE /api/forums/${id} failed:`, err.response?.status, err.response?.data || err.message);
      throw err;
    } finally {
      isLoading.value = false;
    }
    // Remove from local state regardless
    discussions.value = discussions.value.filter((d) => d.id != id);
    if (discussion.value && discussion.value.id == id) {
      discussion.value = null;
    }
  };

  // ---------------------------------------------------------------------------
  //  Interactive Actions (pin, lock, reply, vote, like)
  // ---------------------------------------------------------------------------

  const togglePin = async (id) => {
    const d = discussions.value.find((x) => x.id == id);
    if (!d) return;
    const newStatus = d.status === "PINNED" ? "ACTIVE" : "PINNED";
    try {
      await api.patch(`/api/forums/${id}`, { status: newStatus });
    } catch (e) {
      console.error(`[ForumStore] togglePin ${id} failed:`, e.message);
    }
    d.status = newStatus;
    d.statusClass = getStatusClass(newStatus);
    if (discussion.value?.id == id) {
      discussion.value.status = newStatus;
      discussion.value.statusClass = getStatusClass(newStatus);
    }
  };

  const toggleLock = async (id) => {
    const d = discussions.value.find((x) => x.id == id);
    if (!d) return;
    const newStatus = d.status === "LOCKED" ? "ACTIVE" : "LOCKED";
    try {
      await api.patch(`/api/forums/${id}`, { status: newStatus });
    } catch (e) {
      console.error(`[ForumStore] toggleLock ${id} failed:`, e.message);
    }
    d.status = newStatus;
    d.statusClass = getStatusClass(newStatus);
    if (discussion.value?.id == id) {
      discussion.value.status = newStatus;
      discussion.value.statusClass = getStatusClass(newStatus);
    }
  };

  const postReply = async (discussionId, replyData) => {
    try {
      return await createComment(discussionId, replyData.body || replyData.description || replyData);
    } catch (e) {
      console.error(`[ForumStore] postReply ${discussionId} failed:`, e.message);
    }
  };

  const toggleVoteDiscussion = async (id, direction) => {
    const found = discussions.value.find((d) => d.id == id);
    if (!found) return;

    let newVotes = found.votes || 0;
    let newVoted = direction;

    if (direction === "up") {
      if (found.voted === "up") { newVotes--; newVoted = null; }
      else { if (found.voted === "down") newVotes += 2; else newVotes++; newVoted = "up"; }
    } else if (direction === "down") {
      if (found.voted === "down") { newVotes++; newVoted = null; }
      else { if (found.voted === "up") newVotes -= 2; else newVotes--; newVoted = "down"; }
    }

    try {
      await api.post(`/api/forums/${id}/vote`, { direction });
    } catch (e) {
      console.error(`[ForumStore] vote ${id} failed:`, e.message);
    }

    found.votes = newVotes;
    found.voted = newVoted;
    if (discussion.value?.id == id) {
      discussion.value.votes = newVotes;
      discussion.value.voted = newVoted;
    }
  };

  const toggleLikeReply = async (discussionId, replyIndex) => {
    const found = discussions.value.find((d) => d.id == discussionId);
    if (!found?.replies?.[replyIndex]) return;

    const reply = found.replies[replyIndex];
    if (reply.id) {
      await toggleLikeComment(reply.id);
    } else {
      reply.likedByUser = !reply.likedByUser;
      reply.likes = reply.likedByUser ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1);
    }
  };

  // ---------------------------------------------------------------------------
  // Comments API
  // ---------------------------------------------------------------------------
  const fetchCommentsByForumId = async (forumId) => {
    try {
      const res = await api.get(`/api/comments/forum/${forumId}`);
      if (res.data && res.data.result !== false) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        comments.value = list.map(normalizeComment);
        if (discussion.value && discussion.value.id == forumId) {
          discussion.value.replies = comments.value;
        }
        return comments.value;
      }
    } catch (err) {
      console.error(`[ForumStore] fetchCommentsByForumId ${forumId} failed:`, err);
    }
  };

  const createComment = async (forumId, description) => {
    try {
      const payload = { forum_id: Number(forumId), description };
      const res = await api.post('/api/comments/', payload);
      const created = res.data?.data || res.data;
      const normalized = normalizeComment(created);
      comments.value.push(normalized);
      if (discussion.value && discussion.value.id == forumId) {
        if (!Array.isArray(discussion.value.replies)) {
          discussion.value.replies = [];
        }
        discussion.value.replies.push(normalized);
      }
      return normalized;
    } catch (err) {
      console.error('[ForumStore] createComment failed:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      comments.value = comments.value.filter(c => c.id != commentId);
      if (discussion.value && Array.isArray(discussion.value.replies)) {
        discussion.value.replies = discussion.value.replies.filter(c => c.id != commentId);
      }
    } catch (err) {
      console.error(`[ForumStore] deleteComment ${commentId} failed:`, err);
      throw err;
    }
  };

  // ---------------------------------------------------------------------------
  // Bookmarks / Saved API
  // ---------------------------------------------------------------------------
  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/api/saved/my-bookmarks');
      if (res.data && res.data.result !== false) {
        bookmarks.value = res.data.data;
        const bookmarkedIds = bookmarks.value.map(b => Number(b.forum_id || b.itemId || b.item_id));
        discussions.value.forEach(d => {
          d.saved = bookmarkedIds.includes(Number(d.id));
        });
        if (discussion.value) {
          discussion.value.saved = bookmarkedIds.includes(Number(discussion.value.id));
        }
        return bookmarks.value;
      }
    } catch (err) {
      console.error('[ForumStore] fetchBookmarks failed:', err);
    }
  };

  const toggleSaveForum = async (forumId) => {
    const d = discussions.value.find(x => x.id == forumId);
    if (d) d.saved = !d.saved;
    if (discussion.value && discussion.value.id == forumId) {
      discussion.value.saved = !discussion.value.saved;
    }
    try {
      await api.post('/api/saved/toggle', { forumId: Number(forumId) });
      await fetchBookmarks();
    } catch (err) {
      console.error('[ForumStore] toggleSaveForum failed:', err);
      if (d) d.saved = !d.saved;
      if (discussion.value && discussion.value.id == forumId) {
        discussion.value.saved = !discussion.value.saved;
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Likes API
  // ---------------------------------------------------------------------------
  const toggleLikeComment = async (commentId) => {
    let reply = null;
    if (discussion.value && Array.isArray(discussion.value.replies)) {
      reply = discussion.value.replies.find(r => r.id == commentId);
    }
    if (reply) {
      reply.likedByUser = !reply.likedByUser;
      reply.likes = reply.likedByUser ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1);
    }
    try {
      await api.post('/api/likes/toggle', { commentId: Number(commentId) });
    } catch (err) {
      console.error('[ForumStore] toggleLikeComment failed:', err);
      if (reply) {
        reply.likedByUser = !reply.likedByUser;
        reply.likes = reply.likedByUser ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 1) - 1);
      }
    }
  };

  // ---------------------------------------------------------------------------
  //  Public API
  // ---------------------------------------------------------------------------
  return {
    // state
    discussions,
    discussion,
    isLoading,
    allDiscussions,
    comments,
    bookmarks,

    // helpers
    getStatusClass,
    normalizeForum,
    normalizeComment,

    // CRUD
    fetchDiscussions,
    fetchDiscussion,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,

    // interactive actions
    togglePin,
    toggleLock,
    postReply,
    toggleVoteDiscussion,
    toggleLikeReply,

    // comments API
    fetchCommentsByForumId,
    createComment,
    deleteComment,

    // bookmarks / saved API
    fetchBookmarks,
    toggleSaveForum,

    // likes API
    toggleLikeComment,
  };
});
