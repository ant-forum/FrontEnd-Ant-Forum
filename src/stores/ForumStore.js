import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";
import { useUsersStore } from "./UsersStore";
import { useAuthStore } from "./AuthStore";
import { useTagsStore } from "./TagsStore";
import { stripMarkdown } from "@/utils/markdown";

const getTagColor = (tag) => {
  if (!tag) return "gray";
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
    return "blue";
  if (lower.includes("html")) return "orange";
  if (lower.includes("mongo") || lower.includes("sql") || lower.includes("db"))
    return "pink";
  return "gray";
};

const normalizeTags = (...candidates) => {
  // Find the first valid, non-empty tags representation
  let tags = null;
  for (const c of candidates) {
    if (c) {
      if (Array.isArray(c) && c.length === 0) continue;
      tags = c;
      break;
    }
  }

  if (!tags) return [];
  let parsed = tags;
  if (typeof tags === "string") {
    try {
      parsed = JSON.parse(tags);
    } catch (e) {
      parsed = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map((t) => {
    if (typeof t === "string") {
      return { label: t, color: getTagColor(t) };
    }
    return {
      label: t.label || t.name || "",
      color: t.color || getTagColor(t.label || t.name || ""),
    };
  });
};

const unwrapDiscussionPayload = (raw) => {
  const payload = raw?.data ?? raw;
  if (Array.isArray(payload)) return payload[0] || null;
  if (!payload || typeof payload !== "object") return payload;

  return (
    payload.forum ||
    payload.discussion ||
    payload.thread ||
    payload.post ||
    payload.data ||
    payload
  );
};

const getDiscussionBody = (data = {}) => {
  return (
    data.description ||
    data.Description ||
    data.body ||
    data.Body ||
    data.content ||
    data.Content ||
    data.details ||
    data.detail ||
    data.message ||
    ""
  );
};

const slugifyCategory = (value = "") => {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "discussion"
  );
};

const getCategoryLabel = (category = {}) => {
  return (
    category.name || category.label || category.type || category.category || ""
  );
};

const resolveCategoryMeta = (item = {}, categoryList = []) => {
  const lookupId =
    item.category_id ||
    item.categoryId ||
    item.cat_id ||
    (Number(item.category) ? Number(item.category) : null);
  const rawCategory =
    item.category_name ||
    item.categoryName ||
    item.category_label ||
    item.categoryLabel ||
    item.category;
  const categoryObj = lookupId
    ? categoryList.find((category) => Number(category.id) === Number(lookupId))
    : categoryList.find((category) => {
        const raw = String(rawCategory || "").toLowerCase();
        return [category.id, category.name, category.label, category.type]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase())
          .includes(raw);
      });

  const label =
    getCategoryLabel(categoryObj || {}) || String(rawCategory || "Discussion");
  const id =
    lookupId ||
    categoryObj?.id ||
    item.category_id ||
    item.categoryId ||
    slugifyCategory(label);
  const slug = slugifyCategory(categoryObj?.type || label);

  return {
    id,
    slug,
    label,
    icon: categoryObj?.icon || null,
    color: categoryObj?.color || null,
    description: categoryObj?.description || "",
  };
};

const getLocalVote = (id) => {
  try {
    const currentUserId = useAuthStore().user?.id || "guest";
    const key = `forum_votes_${currentUserId}`;
    const votes = JSON.parse(localStorage.getItem(key) || "{}");
    return votes[id] || null;
  } catch {
    return null;
  }
};

const saveLocalVote = (id, voteType) => {
  try {
    const currentUserId = useAuthStore().user?.id || "guest";
    const key = `forum_votes_${currentUserId}`;
    const votes = JSON.parse(localStorage.getItem(key) || "{}");
    if (voteType) {
      votes[id] = voteType;
    } else {
      delete votes[id];
    }
    localStorage.setItem(key, JSON.stringify(votes));
  } catch (e) {}
};

export const useForumStore = defineStore("forum", () => {
  const discussions = ref([]);
  const discussion = ref(null);
  const comments = ref([]);
  const bookmarks = ref([]);
  const categories = ref([]);

  const tagsStore = useTagsStore();
  const tags = computed(() => tagsStore.tags);

  const isLoading = ref(false);
  const page = ref(1);
  const hasMore = ref(false);

  const allDiscussions = computed(() => discussions.value);

  const setDiscussions = (data) => {
    discussions.value = data;
  };

  const setDiscussion = (data) => {
    discussion.value = data;
  };

  const setComments = (data) => {
    comments.value = data;
  };

  const setBookmarks = (data) => {
    bookmarks.value = data;
  };

  const setCategories = (data) => {
    categories.value = data;
  };

  const setTags = (data) => {
    tagsStore.tags = data;
  };

  const fetchDiscussions = async () => {
    try {
      isLoading.value = true;

      // Parallel fetch discussions and bookmarks (gracefully handle guest users/unauthorized)
      const [discussionsRes, bookmarksRes] = await Promise.allSettled([
        api.get("/api/forums/getAllforum", {
          params: {
            page: page.value,
            limit: 6,
          },
        }),
        api.get("/api/saved/my-bookmarks"),
      ]);

      let discussionsData = [];
      if (discussionsRes.status === "fulfilled") {
        const raw = discussionsRes.value.data;
        if (Array.isArray(raw)) {
          discussionsData = raw;
        } else if (raw && Array.isArray(raw.data)) {
          discussionsData = raw.data;
        } else if (raw && raw.result && Array.isArray(raw.data)) {
          discussionsData = raw.data;
        }
      }

      let bookmarkedIds = new Set();
      if (bookmarksRes.status === "fulfilled") {
        const raw = bookmarksRes.value.data;
        let bookmarksData = [];
        if (Array.isArray(raw)) {
          bookmarksData = raw;
        } else if (raw && Array.isArray(raw.data)) {
          bookmarksData = raw.data;
        } else if (raw && raw.result && Array.isArray(raw.data)) {
          bookmarksData = raw.data;
        }
        setBookmarks(bookmarksData);
        bookmarksData.forEach((item) => {
          if (item.forum_id) bookmarkedIds.add(Number(item.forum_id));
          else if (item.forum && item.forum.id)
            bookmarkedIds.add(Number(item.forum.id));
          else if (item.id) bookmarkedIds.add(Number(item.id));
        });
      }

      // Load categories to resolve category names from ID
      if (categories.value.length === 0) {
        try {
          await fetchCategories();
        } catch (e) {
          console.error("Failed to fetch categories list in ForumStore:", e);
        }
      }

      // Map saved status, tags, and dynamic category metadata
      const mappedDiscussions = discussionsData.map((d) => {
        const categoryMeta = resolveCategoryMeta(d, categories.value);

        const likesCount =
          d.likes !== undefined
            ? d.likes
            : d.like_count !== undefined
              ? d.like_count
              : 0;
        const isLiked =
          d.likedByUser !== undefined
            ? d.likedByUser
            : d.liked !== undefined
              ? d.liked
              : d.isLiked !== undefined
                ? d.isLiked
                : false;
        const repliesVal =
          d.replies !== undefined
            ? d.replies
            : d.comment_count !== undefined
              ? Number(d.comment_count)
              : 0;
        const votedState = isLiked ? "up" : getLocalVote(d.id) || d.voted || null;
        return {
          ...d,
          category: categoryMeta.slug,
          category_id: d.category_id || d.categoryId || categoryMeta.id,
          categoryMeta,
          categoryLabel: categoryMeta.label,
          tags: normalizeTags(
            d.tags,
            d.Tags,
            d.tag_name,
            d.tag_names,
            d.tag,
          ).map((t, idx) => {
            if (idx === 0 && d.tag_id) return { ...t, id: d.tag_id };
            return t;
          }),
          saved: bookmarkedIds.has(Number(d.id)) || d.saved || false,
          likes: likesCount,
          likedByUser: isLiked,
          voted: votedState,
          votes: d.votes !== undefined ? d.votes : likesCount,
          replies: repliesVal,
          excerpt: d.excerpt || stripMarkdown(d.description || d.body || ""),
        };
      });

      setDiscussions(mappedDiscussions);

      if (discussionsRes.status === "fulfilled") {
        return discussionsRes.value.data;
      } else {
        throw discussionsRes.reason;
      }
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDiscussion = async (id) => {
    try {
      isLoading.value = true;

      const [discussionRes, bookmarksRes, commentsRes] =
        await Promise.allSettled([
          api.get(`/api/forums/getforumById/${id}`),
          api.get("/api/saved/my-bookmarks"),
          api.get(`/api/comments/forum/${id}`),
        ]);

      let discussionData = null;
      if (discussionRes.status === "fulfilled") {
        const raw = discussionRes.value.data;
        discussionData = unwrapDiscussionPayload(raw);
      }

      let isBookmarked = false;
      if (bookmarksRes.status === "fulfilled") {
        const raw = bookmarksRes.value.data;
        let bookmarksData = [];
        if (Array.isArray(raw)) {
          bookmarksData = raw;
        } else if (raw && Array.isArray(raw.data)) {
          bookmarksData = raw.data;
        } else if (raw && raw.result && Array.isArray(raw.data)) {
          bookmarksData = raw.data;
        }
        setBookmarks(bookmarksData);
        isBookmarked = bookmarksData.some(
          (item) =>
            Number(item.forum_id) === Number(id) ||
            (item.forum && Number(item.forum.id) === Number(id)) ||
            Number(item.id) === Number(id),
        );
      }

      let commentData = [];
      if (commentsRes.status === "fulfilled") {
        const raw = commentsRes.value.data;
        let rawComments = [];
        if (Array.isArray(raw)) {
          rawComments = raw;
        } else if (raw && Array.isArray(raw.data)) {
          rawComments = raw.data;
        } else if (raw && raw.result && Array.isArray(raw.data)) {
          rawComments = raw.data;
        }
        const usersStore = useUsersStore();
        const authStore = useAuthStore();
        if (usersStore.users.length === 0 && authStore.user?.role === "admin") {
          try {
            await usersStore.fetchUsers(true);
          } catch (e) {
            console.warn(
              "Failed to fetch users list in ForumStore:",
              e.message || e,
            );
          }
        }
        commentData = rawComments.map((c) => {
          const bodyContent = c.body || c.description || "";
          let authorObj = c.author;
          if (typeof authorObj === "string") {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic:
                c.author_avatar ||
                c.user_avatar ||
                c.profile_pic ||
                c.avatar ||
                null,
            };
          } else if (!authorObj) {
            const userObj = usersStore.users.find(
              (u) => Number(u.id) === Number(c.user_id),
            );
            if (userObj) {
              authorObj = {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null,
              };
            } else {
              authorObj = {
                username: `user_${c.user_id}`,
                name: `User ${c.user_id}`,
                profile_pic:
                  c.author_avatar ||
                  c.user_avatar ||
                  c.profile_pic ||
                  c.avatar ||
                  null,
              };
            }
          } else {
            authorObj = {
              ...authorObj,
              profile_pic:
                authorObj.profile_pic ||
                authorObj.avatar ||
                c.author_avatar ||
                c.user_avatar ||
                c.profile_pic ||
                c.avatar ||
                null,
            };
          }
          return {
            ...c,
            body: bodyContent,
            description: bodyContent,
            author: authorObj,
          };
        });
        setComments(commentData);
      }

      if (discussionData) {
        const bookmarkedIds = new Set();
        if (isBookmarked) {
          bookmarkedIds.add(Number(id));
        }
        if (categories.value.length === 0) {
          try {
            await fetchCategories();
          } catch (e) {
            console.error("Failed to fetch categories list in ForumStore:", e);
          }
        }
        const categoryMeta = resolveCategoryMeta(
          discussionData,
          categories.value,
        );

        discussionData.category = categoryMeta.slug;
        discussionData.category_id =
          discussionData.category_id ||
          discussionData.categoryId ||
          categoryMeta.id;
        discussionData.categoryMeta = categoryMeta;
        discussionData.categoryLabel = categoryMeta.label;
        discussionData.tags = normalizeTags(
          discussionData.tags,
          discussionData.Tags,
          discussionData.tag_name,
          discussionData.tag_names,
          discussionData.tag,
        ).map((t, idx) => {
          if (idx === 0 && discussionData.tag_id)
            return { ...t, id: discussionData.tag_id };
          return t;
        });
        discussionData.saved = isBookmarked || discussionData.saved || false;
        discussionData.replies = commentData;
        discussionData.description = getDiscussionBody(discussionData);
        discussionData.body = discussionData.body || discussionData.description;
        discussionData.code =
          discussionData.code ||
          discussionData.code_snippet ||
          discussionData.codeSnippet ||
          "";
        discussionData.hasCode = Boolean(
          discussionData.hasCode ||
          discussionData.has_code ||
          discussionData.code,
        );
        discussionData.excerpt =
          discussionData.excerpt ||
          stripMarkdown(
            discussionData.description || discussionData.body || "",
          );

        const likesCount =
          discussionData.likes !== undefined
            ? discussionData.likes
            : discussionData.like_count !== undefined
              ? discussionData.like_count
              : 0;
        const isLiked =
          discussionData.likedByUser !== undefined
            ? discussionData.likedByUser
            : discussionData.liked !== undefined
              ? discussionData.liked
              : discussionData.isLiked !== undefined
                ? discussionData.isLiked
                : false;
        discussionData.likes = likesCount;
        discussionData.likedByUser = isLiked;
        discussionData.voted = isLiked
          ? "up"
          : getLocalVote(discussionData.id) || discussionData.voted || null;
        discussionData.votes =
          discussionData.voted === "down" ? Math.max(0, likesCount - 1) : likesCount;

        setDiscussion(discussionData);
      }

      if (discussionRes.status === "fulfilled") {
        return discussionRes.value.data;
      } else {
        throw discussionRes.reason;
      }
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const createDiscussion = async (payload) => {
    try {
      let categoryName = "Discussion";
      const catVal = payload.category;
      if (catVal) {
        const standardCats = {
          question: "Question",
          discussion: "Discussion",
          tutorial: "Tutorial",
          idea: "Idea",
          showcase: "Showcase",
        };
        if (standardCats[String(catVal).toLowerCase()]) {
          categoryName = standardCats[String(catVal).toLowerCase()];
        } else {
          const catObj = categories.value.find(
            (c) =>
              Number(c.id) === Number(catVal) ||
              String(c.type || c.name).toLowerCase() ===
                String(catVal).toLowerCase(),
          );
          if (catObj) {
            categoryName = catObj.name || catObj.type || "Discussion";
          }
        }
      }

      let tagNameStr = "";
      let resolvedTagId = payload.tag_id || null;
      if (Array.isArray(payload.tags)) {
        if (!resolvedTagId && payload.tags.length > 0) {
          resolvedTagId = payload.tags[0].id || null;
        }
        const tagNames = payload.tags.map((t) =>
          typeof t === "string" ? t : t.label || t.name || "",
        );
        tagNameStr = tagNames.filter(Boolean).join(", ");
      } else if (typeof payload.tags === "string") {
        tagNameStr = payload.tags;
      }

      const formattedPayload = {
        title: payload.title,
        description: payload.description,
        body: payload.description,
        excerpt: payload.description,
        tag_id: resolvedTagId ? String(resolvedTagId) : null,
        tag_name: tagNameStr,
        tag: tagNameStr,
        tags: tagNameStr,
        category_name: categoryName,
        code: payload.code,
        code_snippet: payload.code,
        codeSnippet: payload.code,
        hasCode: payload.hasCode,
        has_code: payload.hasCode,
        category_id: payload.category_id,
      };
      const res = await api.post("/api/forums/create/forum", formattedPayload);

      if (res.data.result) {
        let savedData = res.data.data;
        if (savedData) {
          savedData.tags = normalizeTags(
            savedData.tags,
            savedData.Tags,
            savedData.tag_name,
            savedData.tag_names,
            savedData.tag,
          );
          savedData.description =
            savedData.description ||
            savedData.body ||
            savedData.Description ||
            payload.description ||
            "";
          savedData.body = savedData.body || savedData.description;
          savedData.code =
            savedData.code ||
            savedData.code_snippet ||
            savedData.codeSnippet ||
            payload.code ||
            "";
          savedData.hasCode = Boolean(
            savedData.hasCode || savedData.has_code || savedData.code,
          );
          const likesCount =
            savedData.likes !== undefined
              ? savedData.likes
              : savedData.like_count !== undefined
                ? savedData.like_count
                : 0;
          savedData.likes = likesCount;
          savedData.likedByUser = false;
          savedData.votes = likesCount;
          savedData.replies = 0;
          savedData.excerpt =
            savedData.excerpt ||
            stripMarkdown(savedData.description || savedData.body || "");
        }
        discussions.value.unshift(savedData);
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const updateDiscussion = async (id, payload) => {
    try {
      let categoryName = "Discussion";
      const catVal = payload.category;
      if (catVal) {
        const standardCats = {
          question: "Question",
          discussion: "Discussion",
          tutorial: "Tutorial",
          idea: "Idea",
          showcase: "Showcase",
        };
        if (standardCats[String(catVal).toLowerCase()]) {
          categoryName = standardCats[String(catVal).toLowerCase()];
        } else {
          const catObj = categories.value.find(
            (c) =>
              Number(c.id) === Number(catVal) ||
              String(c.type || c.name).toLowerCase() ===
                String(catVal).toLowerCase(),
          );
          if (catObj) {
            categoryName = catObj.name || catObj.type || "Discussion";
          }
        }
      }

      let tagNameStr = "";
      let resolvedTagId = payload.tag_id || null;
      if (Array.isArray(payload.tags)) {
        if (!resolvedTagId && payload.tags.length > 0) {
          resolvedTagId = payload.tags[0].id || null;
        }
        const tagNames = payload.tags.map((t) =>
          typeof t === "string" ? t : t.label || t.name || "",
        );
        tagNameStr = tagNames.filter(Boolean).join(", ");
      } else if (typeof payload.tags === "string") {
        tagNameStr = payload.tags;
      }

      const formattedPayload = {
        title: payload.title,
        description: payload.description,
        body: payload.description,
        excerpt: payload.description,
        tag_id: resolvedTagId ? String(resolvedTagId) : null,
        tag_name: tagNameStr,
        tag: tagNameStr,
        tags: tagNameStr,
        category_name: categoryName,
        code: payload.code,
        code_snippet: payload.code,
        codeSnippet: payload.code,
        hasCode: payload.hasCode,
        has_code: payload.hasCode,
        category_id: payload.category_id,
      };
      let res;
      try {
        res = await api.put(`/api/forums/updateforum/${id}`, formattedPayload);
      } catch (primaryErr) {
        const fallbackPayload = {
          title: payload.title,
          description: payload.description,
          category_id: payload.category_id,
          tag_id: resolvedTagId ? String(resolvedTagId) : null,
          tag_name: tagNameStr,
          category_name: categoryName,
        };
        res = await api.put(`/api/forums/updateforum/${id}`, fallbackPayload);
      }

      if (res.data.result) {
        let savedData = res.data.data;
        if (savedData) {
          savedData.tags = normalizeTags(
            savedData.tags,
            savedData.Tags,
            savedData.tag_name,
            savedData.tag_names,
            savedData.tag,
          );
          savedData.description =
            savedData.description ||
            savedData.body ||
            savedData.Description ||
            payload.description ||
            "";
          savedData.body = savedData.body || savedData.description;
          savedData.code =
            savedData.code ||
            savedData.code_snippet ||
            savedData.codeSnippet ||
            payload.code ||
            "";
          savedData.hasCode = Boolean(
            savedData.hasCode || savedData.has_code || savedData.code,
          );
          const likesCount =
            savedData.likes !== undefined
              ? savedData.likes
              : savedData.like_count !== undefined
                ? savedData.like_count
                : 0;
          const isLiked =
            savedData.likedByUser !== undefined
              ? savedData.likedByUser
              : savedData.liked !== undefined
                ? savedData.liked
                : savedData.isLiked !== undefined
                  ? savedData.isLiked
                  : false;
          savedData.likes = likesCount;
          savedData.likedByUser = isLiked;
          savedData.voted = isLiked
            ? "up"
            : getLocalVote(savedData.id) || savedData.voted || null;
          savedData.votes =
            savedData.voted === "down" ? Math.max(0, likesCount - 1) : likesCount;
          savedData.replies =
            savedData.replies !== undefined
              ? savedData.replies
              : savedData.comment_count !== undefined
                ? Number(savedData.comment_count)
                : 0;
          savedData.excerpt =
            savedData.excerpt ||
            stripMarkdown(savedData.description || savedData.body || "");
        }
        const index = discussions.value.findIndex(
          (item) => Number(item.id) === Number(id),
        );

        if (index !== -1) {
          discussions.value[index] = savedData;
        }

        if (discussion.value && Number(discussion.value.id) === Number(id)) {
          discussion.value = savedData;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const deleteDiscussion = async (id) => {
    try {
      const res = await api.delete(`/api/forums/deleteforum/${id}`);

      if (res.data.result) {
        discussions.value = discussions.value.filter((item) => item.id !== id);

        if (discussion.value?.id === id) {
          discussion.value = null;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const adminDeleteForum = async (id) => {
    try {
      const res = await api.delete(`/api/forums/adminDeleteForum/${id}`);

      if (res.data.result) {
        discussions.value = discussions.value.filter((item) => item.id !== id);

        if (discussion.value?.id === id) {
          discussion.value = null;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const fetchComments = async (forumId) => {
    try {
      const res = await api.get(`/api/comments/forum/${forumId}`);

      if (res.data.result) {
        const rawComments = res.data.data || [];
        const usersStore = useUsersStore();
        const authStore = useAuthStore();

        // Ensure users are loaded (only if admin)
        if (usersStore.users.length === 0 && authStore.user?.role === "admin") {
          try {
            await usersStore.fetchUsers(true);
          } catch (e) {
            console.warn(
              "Failed to fetch users list in ForumStore:",
              e.message || e,
            );
          }
        }

        const mappedComments = rawComments.map((c) => {
          const bodyContent = c.body || c.description || "";
          let authorObj = c.author;
          if (typeof authorObj === "string") {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic:
                c.author_avatar ||
                c.user_avatar ||
                c.profile_pic ||
                c.avatar ||
                null,
            };
          } else if (!authorObj) {
            const userObj = usersStore.users.find(
              (u) => Number(u.id) === Number(c.user_id),
            );
            if (userObj) {
              authorObj = {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null,
              };
            } else {
              authorObj = {
                username: `user_${c.user_id}`,
                name: `User ${c.user_id}`,
                profile_pic:
                  c.author_avatar ||
                  c.user_avatar ||
                  c.profile_pic ||
                  c.avatar ||
                  null,
              };
            }
          } else {
            authorObj = {
              ...authorObj,
              profile_pic:
                authorObj.profile_pic ||
                authorObj.avatar ||
                c.author_avatar ||
                c.user_avatar ||
                c.profile_pic ||
                c.avatar ||
                null,
            };
          }
          return {
            ...c,
            body: bodyContent,
            description: bodyContent,
            author: authorObj,
          };
        });

        setComments(mappedComments);
        if (
          discussion.value &&
          Number(discussion.value.id) === Number(forumId)
        ) {
          discussion.value.replies = mappedComments;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const fetchCommentById = async (id) => {
    try {
      const res = await api.get(`/api/comments/getCommentById/${id}`);
      if (res.data.result) {
        const c = res.data.data;
        const bodyContent = c.body || c.description || "";
        let authorObj = c.author;
        if (typeof authorObj === "string") {
          authorObj = {
            username: authorObj,
            name: authorObj,
            profile_pic:
              c.author_avatar ||
              c.user_avatar ||
              c.profile_pic ||
              c.avatar ||
              null,
          };
        } else if (!authorObj) {
          const usersStore = useUsersStore();
          const userObj = usersStore.users.find(
            (u) => Number(u.id) === Number(c.user_id),
          );
          if (userObj) {
            authorObj = {
              username: userObj.username,
              name: userObj.name || userObj.username,
              profile_pic: userObj.profile_pic || userObj.avatar || null,
            };
          } else {
            authorObj = {
              username: `user_${c.user_id}`,
              name: `User ${c.user_id}`,
              profile_pic:
                c.author_avatar ||
                c.user_avatar ||
                c.profile_pic ||
                c.avatar ||
                null,
            };
          }
        } else {
          authorObj = {
            ...authorObj,
            profile_pic:
              authorObj.profile_pic ||
              authorObj.avatar ||
              c.author_avatar ||
              c.user_avatar ||
              c.profile_pic ||
              c.avatar ||
              null,
          };
        }
        return {
          ...c,
          body: bodyContent,
          description: bodyContent,
          author: authorObj,
        };
      }
      return null;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const createComment = async (forumId, description) => {
    try {
      const res = await api.post(`/api/comments/create/${forumId}`, {
        description,
      });

      if (res.data.result) {
        let commentData = res.data.data;
        if (commentData) {
          const bodyContent = commentData.body || commentData.description || "";
          commentData.body = bodyContent;
          commentData.description = bodyContent;
        }
        const usersStore = useUsersStore();
        if (!commentData.author) {
          const userObj = usersStore.users.find(
            (u) => Number(u.id) === Number(commentData.user_id),
          );
          if (userObj) {
            commentData = {
              ...commentData,
              author: {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null,
              },
            };
          } else {
            const authStore = useAuthStore();
            if (authStore.user) {
              commentData = {
                ...commentData,
                author: {
                  username: authStore.user.username,
                  name: authStore.user.name || authStore.user.username,
                  profile_pic:
                    authStore.user.profile_pic || authStore.user.avatar || null,
                },
              };
            }
          }
        } else {
          let authorObj = commentData.author;
          if (typeof authorObj === "string") {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic:
                commentData.author_avatar ||
                commentData.user_avatar ||
                commentData.profile_pic ||
                commentData.avatar ||
                null,
            };
          } else {
            authorObj = {
              ...authorObj,
              profile_pic:
                authorObj.profile_pic ||
                authorObj.avatar ||
                commentData.author_avatar ||
                commentData.user_avatar ||
                null,
            };
          }
          commentData.author = authorObj;
        }

        comments.value.push(commentData);
        if (
          discussion.value &&
          Number(discussion.value.id) === Number(forumId)
        ) {
          if (!discussion.value.replies) {
            discussion.value.replies = [];
          }
          if (discussion.value.replies !== comments.value) {
            discussion.value.replies.push(commentData);
          }
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const postReply = async (forumId, payload) => {
    const description = payload.body || payload.description;
    return await createComment(forumId, description);
  };

  const deleteComment = async (id) => {
    try {
      const res = await api.delete(`/api/comments/delete/${id}`);

      if (res.data.result) {
        comments.value = comments.value.filter((item) => item.id !== id);
        if (discussion.value && Array.isArray(discussion.value.replies)) {
          discussion.value.replies = discussion.value.replies.filter(
            (item) => item.id !== id,
          );
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await api.get("/api/saved/my-bookmarks");

      const raw = res.data;
      let bookmarksData = [];
      if (Array.isArray(raw)) {
        bookmarksData = raw;
      } else if (raw && Array.isArray(raw.data)) {
        bookmarksData = raw.data;
      } else if (raw && raw.result && Array.isArray(raw.data)) {
        bookmarksData = raw.data;
      }

      setBookmarks(bookmarksData);

      if (categories.value.length === 0) {
        try {
          await fetchCategories();
        } catch (e) {
          console.error("Failed to fetch categories list in ForumStore:", e);
        }
      }

      // Resolve each bookmark item (nested, flat or fetched dynamically)
      const fetchPromises = bookmarksData.map(async (item) => {
        let forumObj = item.forum || item.Forum || item.discussion || item.post;
        const forumId = item.forum_id || item.forumId || item.id;

        if (forumObj) {
          return {
            ...forumObj,
            id: forumObj.id || forumId,
            saved: true,
          };
        }

        // If it's a flat discussion object directly (contains title/description)
        if (item.title || item.description) {
          return {
            ...item,
            id: forumId,
            saved: true,
          };
        }

        // If we already have this discussion loaded in our discussions.value list, use it
        const existing = discussions.value.find(
          (d) => Number(d.id) === Number(forumId),
        );
        if (existing) {
          return {
            ...existing,
            saved: true,
          };
        }

        // Otherwise, fetch details dynamically from the backend
        try {
          const detailRes = await api.get(
            `/api/forums/getforumById/${forumId}`,
          );
          const detailRaw = detailRes.data;
          const detailData =
            detailRaw && detailRaw.data ? detailRaw.data : detailRaw;
          if (
            detailData &&
            (detailData.title || detailData.description || detailData.id)
          ) {
            return {
              ...detailData,
              id: forumId,
              saved: true,
            };
          }
        } catch (e) {
          console.error(
            `Failed to fetch details for bookmarked forum ${forumId}:`,
            e,
          );
        }

        return null;
      });

      const resolvedDiscussions = await Promise.all(fetchPromises);
      const bookmarkedDiscussions = resolvedDiscussions.filter(
        (item) => item !== null && item.id,
      );

      // Map bookmarked discussions tags, category, likes, voted status
      const bookmarkedIds = new Set(
        bookmarksData
          .map((item) => {
            if (item.forum_id) return Number(item.forum_id);
            if (item.forum && item.forum.id) return Number(item.forum.id);
            if (item.id) return Number(item.id);
            return null;
          })
          .filter((id) => id !== null),
      );

      // Sync saved status on all discussions
      discussions.value.forEach((d) => {
        d.saved = bookmarkedIds.has(Number(d.id));
      });

      // Merge bookmarked discussions
      bookmarkedDiscussions.forEach((bd) => {
        let catStr = bd.category;
        const isKnownCategoryType = [
          "question",
          "discussion",
          "tutorial",
          "idea",
          "showcase",
        ].includes(String(catStr).toLowerCase());

        if (!isKnownCategoryType) {
          const lookupId =
            bd.category_id ||
            (Number(bd.category) ? Number(bd.category) : null);
          if (lookupId) {
            const catObj = categories.value.find(
              (c) => Number(c.id) === Number(lookupId),
            );
            if (catObj) {
              catStr = (catObj.type || catObj.name || "").toLowerCase();
            }
          }
        }

        if (
          !catStr ||
          !["question", "discussion", "tutorial", "idea", "showcase"].includes(
            catStr.toLowerCase(),
          )
        ) {
          catStr = "discussion";
        }

        bd.category = catStr;
        bd.tags = normalizeTags(bd.tags);
        const likesCount =
          bd.likes !== undefined
            ? bd.likes
            : bd.like_count !== undefined
              ? bd.like_count
              : 0;
        const isLiked =
          bd.likedByUser !== undefined
            ? bd.likedByUser
            : bd.liked !== undefined
              ? bd.liked
              : bd.isLiked !== undefined
                ? bd.isLiked
                : false;
        bd.likes = likesCount;
        bd.likedByUser = isLiked;
        bd.voted = isLiked ? "up" : getLocalVote(bd.id) || bd.voted || null;
        bd.votes = bd.voted === "down" ? Math.max(0, likesCount - 1) : likesCount;
        bd.replies =
          bd.replies !== undefined
            ? bd.replies
            : bd.comment_count !== undefined
              ? Number(bd.comment_count)
              : 0;
        bd.excerpt =
          bd.excerpt || stripMarkdown(bd.description || bd.body || "");

        const index = discussions.value.findIndex(
          (d) => Number(d.id) === Number(bd.id),
        );
        if (index === -1) {
          discussions.value.push(bd);
        } else {
          discussions.value[index] = {
            ...discussions.value[index],
            ...bd,
            saved: true,
          };
        }
      });

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const fetchCategories = async () => {
    try {
      isLoading.value = true;
      const res = await api.get("/api/categories/getAllCategories");
      if (res.data.result !== false) {
        const CATEGORY_COLORS = ["blue", "green", "blue", "orange"];
        const mapped = (res.data.data || []).map((item, index) => ({
          ...item,
          colorClass: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }));
        setCategories(mapped);
        return mapped;
      }
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTags = async () => {
    return await tagsStore.fetchTags();
  };

  const toggleBookmark = async (forumId) => {
    // Optimistic UI Update
    let found = discussions.value.find(
      (item) => Number(item.id) === Number(forumId),
    );
    if (found) {
      found.saved = !found.saved;
    }
    if (discussion.value && Number(discussion.value.id) === Number(forumId)) {
      discussion.value.saved = !discussion.value.saved;
    }

    try {
      const res = await api.post("/api/saved/toggle", {
        forumId,
        forum_id: forumId,
      });

      // Fetch bookmarks in background without blocking
      fetchBookmarks().catch((e) =>
        console.error("Background fetchBookmarks failed:", e),
      );

      return res.data;
    } catch (err) {
      // Revert on failure
      if (found) found.saved = !found.saved;
      if (discussion.value && Number(discussion.value.id) === Number(forumId)) {
        discussion.value.saved = !discussion.value.saved;
      }
      throw err.response?.data || err.message;
    }
  };

  const toggleSaveForum = toggleBookmark;

  const toggleVoteDiscussion = async (id, direction) => {
    const found = discussions.value.find((item) => Number(item.id) === Number(id));
    const target = (discussion.value && Number(discussion.value.id) === Number(id)) ? discussion.value : found;

    if (!target) return;

    const currentVoted = target.voted;
    const currentLikes = target.likes !== undefined ? target.likes : 0;

    let newVoted = null;
    let newLikes = currentLikes;
    let apiCall = null;

    if (direction === "up") {
      if (currentVoted === "up") {
        newVoted = null;
        newLikes = Math.max(0, currentLikes - 1);
        apiCall = "unlike";
      } else {
        newVoted = "up";
        newLikes = currentLikes + (currentVoted === "up" ? 0 : 1);
        apiCall = "like";
      }
    } else if (direction === "down") {
      if (currentVoted === "up") {
        newVoted = null;
        newLikes = Math.max(0, currentLikes - 1);
        apiCall = "unlike";
      } else {
        // If they click downvote (unvote) when not yet voted, DO NOTHING
        return { result: false, ignored: true };
      }
    }

    const newVotes = newVoted === "down" ? Math.max(0, newLikes - 1) : newLikes;

    try {
      let target = null;
      if (discussion.value && Number(discussion.value.id) === Number(id)) {
        target = discussion.value;
      }

      const found = discussions.value.find(
        (item) => Number(item.id) === Number(id),
      );

      const currentVoted = target ? target.voted : (found ? found.voted : null);
      
      let nextVoted = null;
      let diff = 0;
      let apiAction = "unlike";

      if (direction === "up") {
        if (currentVoted === "up") {
          nextVoted = null;
          diff = -1;
          apiAction = "unlike";
        } else if (currentVoted === "down") {
          nextVoted = "up";
          diff = 1;
          apiAction = "like";
        } else {
          nextVoted = "up";
          diff = 1;
          apiAction = "like";
        }
      } else if (direction === "down") {
        if (currentVoted === "down") {
          nextVoted = null;
          diff = 0;
          apiAction = "unlike";
        } else if (currentVoted === "up") {
          nextVoted = "down";
          diff = -1;
          apiAction = "unlike";
        } else {
          nextVoted = "down";
          diff = 0;
          apiAction = "unlike";
        }
      }

      let res;
      if (apiAction === "like") {
        res = await api.post(`/api/forumlike/like/${id}`);
      } else if (apiCall === "unlike") {
        res = await api.delete(`/api/forumlike/unlike/${id}`);
      }

      if (res.data.result) {
        if (target) {
          target.voted = nextVoted;
          target.votes = Math.max(0, (target.votes || 0) + diff);
          target.likedByUser = (nextVoted === "up");
          target.likes = target.votes;
        }

        if (found) {
          found.voted = nextVoted;
          found.votes = Math.max(0, (found.votes || 0) + diff);
          found.likedByUser = (nextVoted === "up");
          found.likes = found.votes;
        }

        saveLocalVote(id, nextVoted);
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const toggleLikeDiscussion = async (id) => {
    try {
      let isLikedCurrently = false;
      if (discussion.value && Number(discussion.value.id) === Number(id)) {
        isLikedCurrently = !!discussion.value.likedByUser;
      } else {
        const found = discussions.value.find(
          (item) => Number(item.id) === Number(id),
        );
        if (found) {
          isLikedCurrently = !!found.likedByUser;
        }
      }

      let res;
      if (!isLikedCurrently) {
        res = await api.post(`/api/forumlike/like/${id}`);
      } else {
        res = await api.delete(`/api/forumlike/unlike/${id}`);
      }

      if (res.data.result) {
        if (discussion.value && Number(discussion.value.id) === Number(id)) {
          discussion.value.likedByUser = !discussion.value.likedByUser;
          discussion.value.likes =
            (discussion.value.likes || 0) +
            (discussion.value.likedByUser ? 1 : -1);
          discussion.value.voted = discussion.value.likedByUser ? "up" : null;
          discussion.value.votes = discussion.value.likes;
        }

        const found = discussions.value.find(
          (item) => Number(item.id) === Number(id),
        );
        if (found) {
          found.likedByUser = !found.likedByUser;
          found.likes = (found.likes || 0) + (found.likedByUser ? 1 : -1);
          found.voted = found.likedByUser ? "up" : null;
          found.votes = found.likes;
        }

        const newVoteState = discussion.value
          ? discussion.value.voted
          : found
            ? found.voted
            : null;
        saveLocalVote(id, newVoteState);
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const toggleLikeComment = async (commentId) => {
    let reply = null;
    if (discussion.value && Array.isArray(discussion.value.replies)) {
      reply = discussion.value.replies.find(
        (r) => Number(r.id) === Number(commentId),
      );
      if (reply) {
        reply.likedByUser = !reply.likedByUser;
        reply.likes = (reply.likes || 0) + (reply.likedByUser ? 1 : -1);
      }
    }
    const comment = comments.value.find(
      (c) => Number(c.id) === Number(commentId),
    );
    if (comment && comment !== reply) {
      comment.likedByUser = !comment.likedByUser;
      comment.likes = (comment.likes || 0) + (comment.likedByUser ? 1 : -1);
    }

    const targetComment = reply || comment;
    if (!targetComment) return;

    try {
      if (targetComment.likedByUser) {
        await api.post(`/api/likescomment/like/${commentId}`);
      } else {
        await api.delete(`/api/likescomment/unlike/${commentId}`);
      }
    } catch (err) {
      console.error("Comment like/unlike API call failed:", err);
    }
  };

  const toggleLikeReply = async (discussionId, replyIndex) => {
    if (discussion.value && Array.isArray(discussion.value.replies)) {
      const reply = discussion.value.replies[replyIndex];
      if (reply) {
        reply.likedByUser = !reply.likedByUser;
        reply.likes = (reply.likes || 0) + (reply.likedByUser ? 1 : -1);
      }
    }
  };

  const fetchDiscussionsByTagName = async (tagName) => {
    try {
      isLoading.value = true;
      const res = await api.get(
        `/api/tags/getTagByName/${encodeURIComponent(tagName)}`,
      );

      if (res.data.result !== false) {
        const tagData = res.data.data;
        const forumsList = Array.isArray(tagData)
          ? tagData
          : tagData.forums ||
            tagData.Forums ||
            tagData.discussions ||
            tagData.Discussions ||
            [];

        if (categories.value.length === 0) {
          try {
            await fetchCategories();
          } catch (e) {
            console.error("Failed to fetch categories list in ForumStore:", e);
          }
        }

        let bookmarkedIds = new Set();
        try {
          const bookmarksRes = await api.get("/api/saved/my-bookmarks");
          const raw = bookmarksRes.data;
          let bookmarksData = [];
          if (Array.isArray(raw)) {
            bookmarksData = raw;
          } else if (raw && Array.isArray(raw.data)) {
            bookmarksData = raw.data;
          } else if (raw && raw.result && Array.isArray(raw.data)) {
            bookmarksData = raw.data;
          }
          bookmarksData.forEach((item) => {
            if (item.forum_id) bookmarkedIds.add(Number(item.forum_id));
            else if (item.forum && item.forum.id)
              bookmarkedIds.add(Number(item.forum.id));
            else if (item.id) bookmarkedIds.add(Number(item.id));
          });
        } catch (e) {}

        const mappedDiscussions = forumsList.map((d) => {
          let catStr = d.category;
          const isKnownCategoryType = [
            "question",
            "discussion",
            "tutorial",
            "idea",
            "showcase",
          ].includes(String(catStr).toLowerCase());

          if (!isKnownCategoryType) {
            const lookupId =
              d.category_id || (Number(d.category) ? Number(d.category) : null);
            if (lookupId) {
              const catObj = categories.value.find(
                (c) => Number(c.id) === Number(lookupId),
              );
              if (catObj) {
                catStr = (catObj.type || catObj.name || "").toLowerCase();
              }
            }
          }

          if (
            !catStr ||
            ![
              "question",
              "discussion",
              "tutorial",
              "idea",
              "showcase",
            ].includes(catStr.toLowerCase())
          ) {
            catStr = "discussion";
          }

          const likesCount =
            d.likes !== undefined
              ? d.likes
              : d.like_count !== undefined
                ? d.like_count
                : 0;
          const isLiked =
            d.likedByUser !== undefined
              ? d.likedByUser
              : d.liked !== undefined
                ? d.liked
                : d.isLiked !== undefined
                  ? d.isLiked
                  : false;
          const repliesVal =
            d.replies !== undefined
              ? d.replies
              : d.comment_count !== undefined
                ? Number(d.comment_count)
                : 0;
          return {
            ...d,
            category: catStr,
            tags: normalizeTags(
              d.tags,
              d.Tags,
              d.tag_name,
              d.tag_names,
              d.tag,
            ).map((t, idx) => {
              if (idx === 0 && d.tag_id) return { ...t, id: d.tag_id };
              return t;
            }),
            saved: bookmarkedIds.has(Number(d.id)) || d.saved || false,
            likes: likesCount,
            likedByUser: isLiked,
            voted: isLiked ? "up" : getLocalVote(d.id) || d.voted || null,
            votes: (isLiked ? "up" : getLocalVote(d.id) || d.voted || null) === "down" ? Math.max(0, likesCount - 1) : likesCount,
            replies: repliesVal,
            excerpt: d.excerpt || stripMarkdown(d.description || d.body || ""),
          };
        });

        setDiscussions(mappedDiscussions);
        return mappedDiscussions;
      }
      return [];
    } catch (err) {
      throw err.response?.data || err.message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    discussions,
    discussion,
    comments,
    bookmarks,
    categories,
    tags,
    isLoading,
    page,
    hasMore,
    allDiscussions,
    setDiscussions,
    setDiscussion,
    setComments,
    setBookmarks,
    setCategories,
    setTags,

    fetchDiscussions,
    fetchDiscussion,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    adminDeleteForum,

    fetchComments,
    fetchCommentById,
    createComment,
    postReply,
    deleteComment,

    fetchBookmarks,
    toggleBookmark,
    toggleSaveForum,
    toggleVoteDiscussion,
    toggleLikeDiscussion,
    toggleLikeComment,
    toggleLikeReply,
    fetchCategories,
    fetchTags,
    fetchDiscussionsByTagName,
  };
});
