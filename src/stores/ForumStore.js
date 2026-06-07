import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";
import { useUsersStore } from "./UsersStore";
import { useAuthStore } from "./AuthStore";
import { useTagsStore } from "./TagsStore";

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

const normalizeTags = (tags) => {
  if (!tags) return [];
  let parsed = tags;
  if (typeof tags === 'string') {
    try {
      parsed = JSON.parse(tags);
    } catch (e) {
      parsed = tags.split(',').map(t => t.trim());
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.map(t => {
    if (typeof t === 'string') {
      return { label: t, color: getTagColor(t) };
    }
    return {
      label: t.label || t.name || '',
      color: t.color || getTagColor(t.label || t.name || '')
    };
  });
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
        api.get("/api/saved/my-bookmarks")
      ]);

      let discussionsData = [];
      if (discussionsRes.status === 'fulfilled') {
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
      if (bookmarksRes.status === 'fulfilled') {
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
        bookmarksData.forEach(item => {
          if (item.forum_id) bookmarkedIds.add(Number(item.forum_id));
          else if (item.forum && item.forum.id) bookmarkedIds.add(Number(item.forum.id));
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

      // Map saved status, tags, and category types
      const mappedDiscussions = discussionsData.map(d => {
        let catStr = d.category;
        const isKnownCategoryType = ['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(String(catStr).toLowerCase());
        
        if (!isKnownCategoryType) {
          const lookupId = d.category_id || (Number(d.category) ? Number(d.category) : null);
          if (lookupId) {
            const catObj = categories.value.find(c => Number(c.id) === Number(lookupId));
            if (catObj) {
              catStr = (catObj.type || catObj.name || '').toLowerCase();
            }
          }
        }
        
        if (!catStr || !['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(catStr.toLowerCase())) {
          catStr = 'discussion';
        }

        const likesCount = d.likes !== undefined ? d.likes : (d.like_count !== undefined ? d.like_count : 0);
        const isLiked = d.likedByUser !== undefined ? d.likedByUser : (d.liked !== undefined ? d.liked : (d.isLiked !== undefined ? d.isLiked : false));
        const repliesVal = d.replies !== undefined ? d.replies : (d.comment_count !== undefined ? Number(d.comment_count) : 0);
        return {
          ...d,
          category: catStr,
          tags: normalizeTags(d.tags || d.Tags || d.tag_name || d.tag_names),
          saved: bookmarkedIds.has(Number(d.id)) || d.saved || false,
          likes: likesCount,
          likedByUser: isLiked,
          voted: isLiked ? 'up' : (d.voted || null),
          votes: d.votes !== undefined ? d.votes : likesCount,
          replies: repliesVal
        };
      });

      setDiscussions(mappedDiscussions);

      if (discussionsRes.status === 'fulfilled') {
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

      const [discussionRes, bookmarksRes, commentsRes] = await Promise.allSettled([
        api.get(`/api/forums/getforumById/${id}`),
        api.get("/api/saved/my-bookmarks"),
        api.get(`/api/comments/forum/${id}`)
      ]);

      let discussionData = null;
      if (discussionRes.status === 'fulfilled') {
        const raw = discussionRes.value.data;
        console.log("[ForumStore] getforumById response raw data:", raw);
        discussionData = (raw && raw.data) ? raw.data : raw;
      }

      let isBookmarked = false;
      if (bookmarksRes.status === 'fulfilled') {
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
        isBookmarked = bookmarksData.some(item =>
          Number(item.forum_id) === Number(id) ||
          (item.forum && Number(item.forum.id) === Number(id)) ||
          Number(item.id) === Number(id)
        );
      }

      let commentData = [];
      if (commentsRes.status === 'fulfilled') {
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
        if (usersStore.users.length === 0 && authStore.user?.role === 'admin') {
          try {
            await usersStore.fetchUsers(true);
          } catch (e) {
            console.warn("Failed to fetch users list in ForumStore:", e.message || e);
          }
        }
        commentData = rawComments.map(c => {
          const bodyContent = c.body || c.description || "";
          let authorObj = c.author;
          if (typeof authorObj === 'string') {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic: c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
            };
          } else if (!authorObj) {
            const userObj = usersStore.users.find(u => Number(u.id) === Number(c.user_id));
            if (userObj) {
              authorObj = {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null
              };
            } else {
              authorObj = {
                username: `user_${c.user_id}`,
                name: `User ${c.user_id}`,
                profile_pic: c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
              };
            }
          } else {
            authorObj = {
              ...authorObj,
              profile_pic: authorObj.profile_pic || authorObj.avatar || c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
            };
          }
          return {
            ...c,
            body: bodyContent,
            description: bodyContent,
            author: authorObj
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
        let catStr = discussionData.category;
        const isKnownCategoryType = ['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(String(catStr).toLowerCase());
        
        if (!isKnownCategoryType) {
          const lookupId = discussionData.category_id || (Number(discussionData.category) ? Number(discussionData.category) : null);
          if (lookupId) {
            if (categories.value.length === 0) {
              try {
                await fetchCategories();
              } catch (e) {
                console.error("Failed to fetch categories list in ForumStore:", e);
              }
            }
            const catObj = categories.value.find(c => Number(c.id) === Number(lookupId));
            if (catObj) {
              catStr = (catObj.type || catObj.name || '').toLowerCase();
            }
          }
        }

        if (!catStr || !['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(catStr.toLowerCase())) {
          catStr = 'discussion';
        }

        discussionData.category = catStr;
        discussionData.tags = normalizeTags(discussionData.tags || discussionData.Tags || discussionData.tag_name || discussionData.tag_names);
        discussionData.saved = isBookmarked || discussionData.saved || false;
        discussionData.replies = commentData;
        
        const likesCount = discussionData.likes !== undefined ? discussionData.likes : (discussionData.like_count !== undefined ? discussionData.like_count : 0);
        const isLiked = discussionData.likedByUser !== undefined ? discussionData.likedByUser : (discussionData.liked !== undefined ? discussionData.liked : (discussionData.isLiked !== undefined ? discussionData.isLiked : false));
        discussionData.likes = likesCount;
        discussionData.likedByUser = isLiked;
        discussionData.voted = isLiked ? 'up' : (discussionData.voted || null);
        discussionData.votes = discussionData.votes !== undefined ? discussionData.votes : likesCount;

        setDiscussion(discussionData);
      }

      if (discussionRes.status === 'fulfilled') {
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
          showcase: "Showcase"
        };
        if (standardCats[String(catVal).toLowerCase()]) {
          categoryName = standardCats[String(catVal).toLowerCase()];
        } else {
          const catObj = categories.value.find(c => Number(c.id) === Number(catVal) || String(c.type || c.name).toLowerCase() === String(catVal).toLowerCase());
          if (catObj) {
            categoryName = catObj.name || catObj.type || "Discussion";
          }
        }
      }

      let tagNameStr = "";
      if (Array.isArray(payload.tags)) {
        const tagNames = payload.tags.map(t => typeof t === 'string' ? t : (t.label || t.name || ''));
        tagNameStr = tagNames.filter(Boolean).join(', ');
      } else if (typeof payload.tags === 'string') {
        tagNameStr = payload.tags;
      }

      const formattedPayload = {
        title: payload.title,
        description: payload.description,
        tag_name: tagNameStr,
        category_name: categoryName,
        code: payload.code,
        hasCode: payload.hasCode,
        category_id: payload.category_id
      };
      const res = await api.post("/api/forums/create/forum", formattedPayload);

      if (res.data.result) {
        let savedData = res.data.data;
        if (savedData) {
          savedData.tags = normalizeTags(savedData.tags || savedData.Tags || savedData.tag_name || savedData.tag_names);
          const likesCount = savedData.likes !== undefined ? savedData.likes : (savedData.like_count !== undefined ? savedData.like_count : 0);
          savedData.likes = likesCount;
          savedData.likedByUser = false;
          savedData.votes = likesCount;
          savedData.replies = 0;
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
          showcase: "Showcase"
        };
        if (standardCats[String(catVal).toLowerCase()]) {
          categoryName = standardCats[String(catVal).toLowerCase()];
        } else {
          const catObj = categories.value.find(c => Number(c.id) === Number(catVal) || String(c.type || c.name).toLowerCase() === String(catVal).toLowerCase());
          if (catObj) {
            categoryName = catObj.name || catObj.type || "Discussion";
          }
        }
      }

      let tagNameStr = "";
      if (Array.isArray(payload.tags)) {
        const tagNames = payload.tags.map(t => typeof t === 'string' ? t : (t.label || t.name || ''));
        tagNameStr = tagNames.filter(Boolean).join(', ');
      } else if (typeof payload.tags === 'string') {
        tagNameStr = payload.tags;
      }

      const formattedPayload = {
        title: payload.title,
        description: payload.description,
        tag_name: tagNameStr,
        category_name: categoryName,
        code: payload.code,
        hasCode: payload.hasCode,
        category_id: payload.category_id
      };
      const res = await api.put(`/api/forums/updateforum/${id}`, formattedPayload);

      if (res.data.result) {
        let savedData = res.data.data;
        if (savedData) {
          savedData.tags = normalizeTags(savedData.tags || savedData.Tags || savedData.tag_name || savedData.tag_names);
          const likesCount = savedData.likes !== undefined ? savedData.likes : (savedData.like_count !== undefined ? savedData.like_count : 0);
          const isLiked = savedData.likedByUser !== undefined ? savedData.likedByUser : (savedData.liked !== undefined ? savedData.liked : (savedData.isLiked !== undefined ? savedData.isLiked : false));
          savedData.likes = likesCount;
          savedData.likedByUser = isLiked;
          savedData.voted = isLiked ? 'up' : (savedData.voted || null);
          savedData.votes = savedData.votes !== undefined ? savedData.votes : likesCount;
          savedData.replies = savedData.replies !== undefined ? savedData.replies : (savedData.comment_count !== undefined ? Number(savedData.comment_count) : 0);
        }
        const index = discussions.value.findIndex(
          (item) => Number(item.id) === Number(id)
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
        discussions.value = discussions.value.filter(
          (item) => item.id !== id
        );

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
        if (usersStore.users.length === 0 && authStore.user?.role === 'admin') {
          try {
            await usersStore.fetchUsers(true);
          } catch (e) {
            console.warn("Failed to fetch users list in ForumStore:", e.message || e);
          }
        }

        const mappedComments = rawComments.map(c => {
          const bodyContent = c.body || c.description || "";
          let authorObj = c.author;
          if (typeof authorObj === 'string') {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic: c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
            };
          } else if (!authorObj) {
            const userObj = usersStore.users.find(u => Number(u.id) === Number(c.user_id));
            if (userObj) {
              authorObj = {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null
              };
            } else {
              authorObj = {
                username: `user_${c.user_id}`,
                name: `User ${c.user_id}`,
                profile_pic: c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
              };
            }
          } else {
            authorObj = {
              ...authorObj,
              profile_pic: authorObj.profile_pic || authorObj.avatar || c.author_avatar || c.user_avatar || c.profile_pic || c.avatar || null
            };
          }
          return {
            ...c,
            body: bodyContent,
            description: bodyContent,
            author: authorObj
          };
        });

        setComments(mappedComments);
        if (discussion.value && Number(discussion.value.id) === Number(forumId)) {
          discussion.value.replies = mappedComments;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const createComment = async (forumId, description) => {
    try {
      console.log("createComment called with forumId:", forumId, "description:", description);
      const res = await api.post(`/api/comments/create/${forumId}`, {
        description,
      });

      console.log("createComment API response:", res.data);

      if (res.data.result) {
        let commentData = res.data.data;
        if (commentData) {
          const bodyContent = commentData.body || commentData.description || "";
          commentData.body = bodyContent;
          commentData.description = bodyContent;
        }
        const usersStore = useUsersStore();
        if (!commentData.author) {
          const userObj = usersStore.users.find(u => Number(u.id) === Number(commentData.user_id));
          if (userObj) {
            commentData = {
              ...commentData,
              author: {
                username: userObj.username,
                name: userObj.name || userObj.username,
                profile_pic: userObj.profile_pic || userObj.avatar || null
              }
            };
          } else {
            const authStore = useAuthStore();
            if (authStore.user) {
              commentData = {
                ...commentData,
                author: {
                  username: authStore.user.username,
                  name: authStore.user.name || authStore.user.username,
                  profile_pic: authStore.user.profile_pic || authStore.user.avatar || null
                }
              };
            }
          }
        } else {
          let authorObj = commentData.author;
          if (typeof authorObj === 'string') {
            authorObj = {
              username: authorObj,
              name: authorObj,
              profile_pic: commentData.author_avatar || commentData.user_avatar || commentData.profile_pic || commentData.avatar || null
            };
          } else {
            authorObj = {
              ...authorObj,
              profile_pic: authorObj.profile_pic || authorObj.avatar || commentData.author_avatar || commentData.user_avatar || null
            };
          }
          commentData.author = authorObj;
        }

        comments.value.push(commentData);
        if (discussion.value && Number(discussion.value.id) === Number(forumId)) {
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
      const res = await api.delete(`/api/comments/forum/${id}`);

      if (res.data.result) {
        comments.value = comments.value.filter(
          (item) => item.id !== id
        );
        if (discussion.value && Array.isArray(discussion.value.replies)) {
          discussion.value.replies = discussion.value.replies.filter(
            (item) => item.id !== id
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
            saved: true
          };
        }

        // If it's a flat discussion object directly (contains title/description)
        if (item.title || item.description) {
          return {
            ...item,
            id: forumId,
            saved: true
          };
        }

        // If we already have this discussion loaded in our discussions.value list, use it
        const existing = discussions.value.find(d => Number(d.id) === Number(forumId));
        if (existing) {
          return {
            ...existing,
            saved: true
          };
        }

        // Otherwise, fetch details dynamically from the backend
        try {
          const detailRes = await api.get(`/api/forums/getforumById/${forumId}`);
          const detailRaw = detailRes.data;
          const detailData = (detailRaw && detailRaw.data) ? detailRaw.data : detailRaw;
          if (detailData && (detailData.title || detailData.description || detailData.id)) {
            return {
              ...detailData,
              id: forumId,
              saved: true
            };
          }
        } catch (e) {
          console.error(`Failed to fetch details for bookmarked forum ${forumId}:`, e);
        }

        return null;
      });

      const resolvedDiscussions = await Promise.all(fetchPromises);
      const bookmarkedDiscussions = resolvedDiscussions.filter(item => item !== null && item.id);

      // Map bookmarked discussions tags, category, likes, voted status
      const bookmarkedIds = new Set(bookmarksData.map(item => {
        if (item.forum_id) return Number(item.forum_id);
        if (item.forum && item.forum.id) return Number(item.forum.id);
        if (item.id) return Number(item.id);
        return null;
      }).filter(id => id !== null));

      // Sync saved status on all discussions
      discussions.value.forEach(d => {
        d.saved = bookmarkedIds.has(Number(d.id));
      });

      // Merge bookmarked discussions
      bookmarkedDiscussions.forEach(bd => {
        let catStr = bd.category;
        const isKnownCategoryType = ['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(String(catStr).toLowerCase());
        
        if (!isKnownCategoryType) {
          const lookupId = bd.category_id || (Number(bd.category) ? Number(bd.category) : null);
          if (lookupId) {
            const catObj = categories.value.find(c => Number(c.id) === Number(lookupId));
            if (catObj) {
              catStr = (catObj.type || catObj.name || '').toLowerCase();
            }
          }
        }

        if (!catStr || !['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(catStr.toLowerCase())) {
          catStr = 'discussion';
        }

        bd.category = catStr;
        bd.tags = normalizeTags(bd.tags);
        const likesCount = bd.likes !== undefined ? bd.likes : (bd.like_count !== undefined ? bd.like_count : 0);
        const isLiked = bd.likedByUser !== undefined ? bd.likedByUser : (bd.liked !== undefined ? bd.liked : (bd.isLiked !== undefined ? bd.isLiked : false));
        bd.likes = likesCount;
        bd.likedByUser = isLiked;
        bd.voted = isLiked ? 'up' : (bd.voted || null);
        bd.votes = bd.votes !== undefined ? bd.votes : likesCount;
        bd.replies = bd.replies !== undefined ? bd.replies : (bd.comment_count !== undefined ? Number(bd.comment_count) : 0);

        const index = discussions.value.findIndex(d => Number(d.id) === Number(bd.id));
        if (index === -1) {
          discussions.value.push(bd);
        } else {
          discussions.value[index] = {
            ...discussions.value[index],
            ...bd,
            saved: true
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
      const res = await api.get('/api/categories/getAllCategories');
      if (res.data.result !== false) {
        const CATEGORY_COLORS = ['blue', 'green', 'purple', 'orange'];
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
    try {
      const res = await api.post("/api/saved/toggle", {
        forumId,
        forum_id: forumId,
      });

      await fetchBookmarks();

      if (discussion.value && Number(discussion.value.id) === Number(forumId)) {
        discussion.value.saved = !discussion.value.saved;
      }

      const found = discussions.value.find(item => Number(item.id) === Number(forumId));
      if (found) {
        found.saved = !found.saved;
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const toggleSaveForum = toggleBookmark;

  const toggleVoteDiscussion = async (id, direction) => {
    try {
      let res;
      if (direction === 'up') {
        res = await api.post(`/api/forumlike/like/${id}`);
      } else {
        res = await api.delete(`/api/forumlike/unlike/${id}`);
      }

      if (res.data.result) {
        if (discussion.value && Number(discussion.value.id) === Number(id)) {
          if (direction === 'up') {
            if (discussion.value.voted !== 'up') {
              discussion.value.votes = (discussion.value.votes || 0) + (discussion.value.voted === 'down' ? 2 : 1);
              discussion.value.voted = 'up';
              discussion.value.likedByUser = true;
              discussion.value.likes = discussion.value.votes;
            } else {
              await api.delete(`/api/forumlike/unlike/${id}`);
              discussion.value.votes = Math.max(0, (discussion.value.votes || 0) - 1);
              discussion.value.voted = null;
              discussion.value.likedByUser = false;
              discussion.value.likes = discussion.value.votes;
            }
          } else {
            if (discussion.value.voted !== 'down') {
              discussion.value.votes = Math.max(0, (discussion.value.votes || 0) - (discussion.value.voted === 'up' ? 2 : 1));
              discussion.value.voted = 'down';
              discussion.value.likedByUser = false;
              discussion.value.likes = discussion.value.votes;
            } else {
              await api.post(`/api/forumlike/like/${id}`);
              discussion.value.votes = (discussion.value.votes || 0) + 1;
              discussion.value.voted = null;
              discussion.value.likedByUser = true;
              discussion.value.likes = discussion.value.votes;
            }
          }
        }

        const found = discussions.value.find(item => Number(item.id) === Number(id));
        if (found) {
          if (direction === 'up') {
            if (found.voted !== 'up') {
              found.votes = (found.votes || 0) + (found.voted === 'down' ? 2 : 1);
              found.voted = 'up';
              found.likedByUser = true;
              found.likes = found.votes;
            } else {
              await api.delete(`/api/forumlike/unlike/${id}`);
              found.votes = Math.max(0, (found.votes || 0) - 1);
              found.voted = null;
              found.likedByUser = false;
              found.likes = found.votes;
            }
          } else {
            if (found.voted !== 'down') {
              found.votes = Math.max(0, (found.votes || 0) - (found.voted === 'up' ? 2 : 1));
              found.voted = 'down';
              found.likedByUser = false;
              found.likes = found.votes;
            } else {
              await api.post(`/api/forumlike/like/${id}`);
              found.votes = (found.votes || 0) + 1;
              found.voted = null;
              found.likedByUser = true;
              found.likes = found.votes;
            }
          }
        }
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
        const found = discussions.value.find(item => Number(item.id) === Number(id));
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
          discussion.value.likes = (discussion.value.likes || 0) + (discussion.value.likedByUser ? 1 : -1);
          discussion.value.voted = discussion.value.likedByUser ? 'up' : null;
          discussion.value.votes = discussion.value.likes;
        }

        const found = discussions.value.find(item => Number(item.id) === Number(id));
        if (found) {
          found.likedByUser = !found.likedByUser;
          found.likes = (found.likes || 0) + (found.likedByUser ? 1 : -1);
          found.voted = found.likedByUser ? 'up' : null;
          found.votes = found.likes;
        }
      }

      return res.data;
    } catch (err) {
      throw err.response?.data || err.message;
    }
  };

  const toggleLikeComment = async (commentId) => {
    let reply = null;
    if (discussion.value && Array.isArray(discussion.value.replies)) {
      reply = discussion.value.replies.find(r => Number(r.id) === Number(commentId));
      if (reply) {
        reply.likedByUser = !reply.likedByUser;
        reply.likes = (reply.likes || 0) + (reply.likedByUser ? 1 : -1);
      }
    }
    const comment = comments.value.find(c => Number(c.id) === Number(commentId));
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
      const res = await api.get(`/api/tags/getTagByName/${encodeURIComponent(tagName)}`);

      if (res.data.result !== false) {
        const tagData = res.data.data;
        const forumsList = Array.isArray(tagData)
          ? tagData
          : (tagData.forums || tagData.Forums || tagData.discussions || tagData.Discussions || []);

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
          bookmarksData.forEach(item => {
            if (item.forum_id) bookmarkedIds.add(Number(item.forum_id));
            else if (item.forum && item.forum.id) bookmarkedIds.add(Number(item.forum.id));
            else if (item.id) bookmarkedIds.add(Number(item.id));
          });
        } catch (e) {}

        const mappedDiscussions = forumsList.map(d => {
          let catStr = d.category;
          const isKnownCategoryType = ['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(String(catStr).toLowerCase());
          
          if (!isKnownCategoryType) {
            const lookupId = d.category_id || (Number(d.category) ? Number(d.category) : null);
            if (lookupId) {
              const catObj = categories.value.find(c => Number(c.id) === Number(lookupId));
              if (catObj) {
                catStr = (catObj.type || catObj.name || '').toLowerCase();
              }
            }
          }
          
          if (!catStr || !['question', 'discussion', 'tutorial', 'idea', 'showcase'].includes(catStr.toLowerCase())) {
            catStr = 'discussion';
          }

          const likesCount = d.likes !== undefined ? d.likes : (d.like_count !== undefined ? d.like_count : 0);
          const isLiked = d.likedByUser !== undefined ? d.likedByUser : (d.liked !== undefined ? d.liked : (d.isLiked !== undefined ? d.isLiked : false));
          const repliesVal = d.replies !== undefined ? d.replies : (d.comment_count !== undefined ? Number(d.comment_count) : 0);
          return {
            ...d,
            category: catStr,
            tags: normalizeTags(d.tags || d.Tags || d.tag_name || d.tag_names),
            saved: bookmarkedIds.has(Number(d.id)) || d.saved || false,
            likes: likesCount,
            likedByUser: isLiked,
            voted: isLiked ? 'up' : (d.voted || null),
            votes: d.votes !== undefined ? d.votes : likesCount,
            replies: repliesVal
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
    discussions, discussion, comments, bookmarks, categories, tags, isLoading, page, hasMore, allDiscussions,
    setDiscussions, setDiscussion, setComments, setBookmarks, setCategories, setTags,

    fetchDiscussions, fetchDiscussion, createDiscussion, updateDiscussion, deleteDiscussion,

    fetchComments, createComment, postReply, deleteComment,

    fetchBookmarks, toggleBookmark, toggleSaveForum, toggleVoteDiscussion, toggleLikeDiscussion, toggleLikeComment, toggleLikeReply,
    fetchCategories, fetchTags, fetchDiscussionsByTagName,
  };
});