import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { createPlainTextExcerpt, htmlToPlainText } from "@/utils/richContent";
import { resolveMediaUrl, rewriteHtmlMediaUrls } from "@/utils/mediaUrl";
import { useAuthStore } from "@/stores/AuthStore";
import { useUsersStore } from "@/stores/UsersStore";

const ensureSuccess = (response) => {
  if (response.data && response.data.result === false) {
    throw new Error(response.data.message ?? "Blog request failed.");
  }
};

const LIST_CACHE_MS = 1500;
const CATEGORY_CACHE_MS = 5 * 60 * 1000;

export const useBlogStore = defineStore("blog", () => {
  const authStore = useAuthStore();
  const usersStore = useUsersStore();

  const blogs = ref([]);
  const ownBlogs = ref([]);
  const blog = ref(null);

  const isLoading = ref(false);
  const page = ref(1);
  const hasMore = ref(false);

  // Fallback lists
  const drafts = ref([]); // internal helper for admin drafts
  const categories = ref([]);
  let allBlogsRequest = null;
  let categoriesRequest = null;
  let authorProfilesRequest = null;
  let lastAllBlogsFetchedAt = 0;
  let lastCategoriesFetchedAt = 0;

  const ensureAuthorProfiles = async () => {
    if (String(authStore.user?.role || "").toLowerCase() !== "admin") return;
    if (usersStore.users.length > 0) return;

    if (!authorProfilesRequest) {
      authorProfilesRequest = usersStore
        .fetchUsers(true)
        .catch((err) => {
          console.warn("Could not load admin author profiles for blogs:", err);
          return [];
        })
        .finally(() => {
          authorProfilesRequest = null;
        });
    }

    await authorProfilesRequest;
  };

  // Helper to normalize blog image paths, dates, authors, categories
  const normalizeBlog = (item) => {
    if (!item) return null;

    const image = resolveMediaUrl(item.thumbnail || item.image);

    let categoryName = "General";
    if (item.category) {
      categoryName =
        typeof item.category === "object"
          ? item.category.name || item.category.title
          : item.category;
    } else if (item.category_id) {
      // Look up from dynamically fetched categories first
      const found = categories.value.find((c) => c.id == item.category_id);
      if (found) {
        categoryName = found.name || found.title || "General";
      }
    }

    let authorName = "Unknown";
    let authorAvatar = null;
    if (item.user) {
      authorName = item.user.username || item.user.name || authorName;
      authorAvatar = resolveMediaUrl(
        item.user.profile_pic || item.user.avatar,
        authorAvatar,
      );
    } else if (item.author) {
      authorName =
        typeof item.author === "object"
          ? item.author.name || item.author.username
          : item.author;
      authorAvatar = resolveMediaUrl(item.author_avatar, authorAvatar);
    } else if (item.admin) {
      authorName = item.admin.username || item.admin.name || authorName;
      authorAvatar = resolveMediaUrl(
        item.admin.profile_pic || item.admin.avatar,
        authorAvatar,
      );
    } else if (item.created_by) {
      authorName =
        item.created_by.username || item.created_by.name || authorName;
      authorAvatar = resolveMediaUrl(
        item.created_by.profile_pic || item.created_by.avatar,
        authorAvatar,
      );
    } else if (item.createdBy) {
      authorName = item.createdBy.username || item.createdBy.name || authorName;
      authorAvatar = resolveMediaUrl(
        item.createdBy.profile_pic || item.createdBy.avatar,
        authorAvatar,
      );
    } else {
      authorName =
        item.username ||
        item.admin_username ||
        item.created_by_username ||
        item.createdByUsername ||
        item.publisher_username ||
        item.user_name ||
        item.name ||
        authorName;
      authorAvatar = resolveMediaUrl(
        item.profile_pic || item.avatar || item.author_avatar,
        authorAvatar,
      );
    }

    const applyAuthorProfile = (profile) => {
      if (!profile) return;
      authorName = profile.username || profile.name || authorName;
      authorAvatar = resolveMediaUrl(
        profile.profile_pic || profile.avatar || profile.avatarUrl,
        authorAvatar,
      );
    };

    const blogUserId =
      item.user_id ||
      item.userId ||
      item.author_id ||
      item.authorId ||
      item.admin_id ||
      item.adminId ||
      item.created_by_id ||
      item.createdById;
    const loadedUser = blogUserId
      ? usersStore.users.find(
          (u) =>
            String(u.id) === String(blogUserId) ||
            String(u.user_id) === String(blogUserId),
        )
      : null;
    applyAuthorProfile(loadedUser);

    const currentUser = authStore.user;
    const matchesCurrentUser =
      currentUser &&
      ((blogUserId &&
        (String(currentUser.id) === String(blogUserId) ||
          String(currentUser.user_id) === String(blogUserId))) ||
        (item.email &&
          currentUser.email &&
          String(currentUser.email).toLowerCase() ===
            String(item.email).toLowerCase()) ||
        (item.username &&
          currentUser.username &&
          String(currentUser.username).toLowerCase() ===
            String(item.username).toLowerCase()));
    if (matchesCurrentUser) {
      applyAuthorProfile(currentUser);
    }

    if (authorName === "Unknown") {
      authorName = "Admin_Nha";
    }

    let dateStr = "Recent";
    let postedAt = "Recent";
    const rawDate =
      item.created_at ||
      item.createdAt ||
      item.published_at ||
      item.publishedAt ||
      item.date;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
        postedAt = d.toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      } else {
        dateStr = rawDate;
        postedAt = rawDate;
      }
    }

    const rawContent = item.content || item.description || "";
    const content = rewriteHtmlMediaUrls(rawContent);
    const plainDescription = htmlToPlainText(content);

    // Final fallback for missing avatar
    if (!authorAvatar || authorAvatar.includes("ui-avatars.com")) {
      if (
        authorName.toLowerCase() === "admin_nha" ||
        authorName.toLowerCase() === "admin"
      ) {
        authorAvatar = "/charles_leclerc.png";
      } else {
        authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=5483B3&color=fff&rounded=true&bold=true`;
      }
    }

    return {
      ...item,
      id: item.id,
      title: item.title || "",
      description: item.description || createPlainTextExcerpt(content),
      content,
      excerpt: createPlainTextExcerpt(item.description || content),
      category: categoryName,
      category_id: item.category_id,
      image:
        image ||
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      date: dateStr,
      postedAt,
      author: authorName,
      author_avatar: authorAvatar,
      readTime:
        item.readTime ||
        `${Math.max(3, Math.ceil(plainDescription.split(" ").length / 200))} min`,
      views: item.views !== undefined ? item.views : (item.view_count || 0),
      view_count: item.view_count !== undefined ? item.view_count : (item.views || 0),
      likes: item.likes || 0,
      status: item.status || "published",
      tags: Array.isArray(item.tags)
        ? item.tags
        : item.tags
          ? item.tags.split(",").map((t) => t.trim())
          : ["Tech"],
    };
  };

  const getNormalizedList = (res) => {
    if (!res) return [];
    const data = res.data !== undefined ? res.data : res;
    let list = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.data)) {
      list = data.data;
    } else if (data && Array.isArray(data.items)) {
      list = data.items;
    }
    return list.map(normalizeBlog);
  };

  const safeExtractMeta = (res) => {
    if (!res) return { hasNextPage: false };
    const data = res.data !== undefined ? res.data : res;
    const meta = data?.meta;
    if (meta) return meta;

    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : data?.items || [];
    return { hasNextPage: items.length === 6 };
  };

  // --- ACTIONS ---

  // 1. Fetch public articles / blogs
  const fetchBlogs = async (isLoadMore = false) => {
    if (isLoading.value && !isLoadMore) return;
    isLoading.value = true;
    try {
      await ensureAuthorProfiles();
      const response = await api.get("/api/blog/getAllBlogsPublished", {
        params: {
          sortBy: "created_at",
          sortDir: "desc",
          _per_page: 6,
          _page: page.value,
        },
      });
      ensureSuccess(response);

      const normalized = getNormalizedList(response.data).filter(
        (b) => b.status === "published",
      );
      const meta = safeExtractMeta(response);

      if (isLoadMore) {
        const newBlogs = normalized.filter((b) => !blogs.value.some((existing) => existing.id === b.id));
        blogs.value.push(...newBlogs);
        if (newBlogs.length === 0) {
          hasMore.value = false;
          return;
        }
      } else {
        page.value = 1;
        blogs.value = normalized;
      }

      hasMore.value =
        meta.hasNextPage || meta.hasNext || normalized.length === 6;
    } catch (err) {
      console.error("Error fetching published blogs:", err);
      if (!isLoadMore) {
        blogs.value = [];
        hasMore.value = false;
      }
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const pollLatestBlogs = async () => {
    if (isLoading.value) return;
    try {
      await ensureAuthorProfiles();
      const response = await api.get("/api/blog/getAllBlogsPublished", {
        params: { sortBy: "created_at", sortDir: "desc", _per_page: 10, _page: 1 },
      });
      const normalized = getNormalizedList(response.data).filter(b => b.status === "published");
      
      const currentList = [...blogs.value];
      for (const item of normalized) {
        const existingIndex = currentList.findIndex(b => String(b.id) === String(item.id));
        if (existingIndex !== -1) {
          currentList[existingIndex] = { ...currentList[existingIndex], ...item };
        } else {
          currentList.unshift(item);
        }
      }
      currentList.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
      blogs.value = currentList;
    } catch (err) {
      console.error("Poll latest blogs failed:", err);
    }
  };

  // 2. Load more articles / blogs
  const loadMore = async () => {
    if (!hasMore.value) return;
    page.value++;
    await fetchBlogs(true);
  };

  // 3. Single article preview / detail
  const fetchBlogPreview = async (id) => {
    try {
      isLoading.value = true;
      await ensureAuthorProfiles();
      const response = await api.get(`/api/blog/getBlogbyIDPublished/${id}`);
      ensureSuccess(response);
      const raw = response.data?.data || response.data;
      blog.value = normalizeBlog(raw);
      return blog.value;
    } finally {
      isLoading.value = false;
    }
  };

  const incrementBlogView = async (id) => {
    try {
      const response = await api.post(`/api/blog/counter-view-post/${id}`, {}, { skipGlobalToast: true });
      ensureSuccess(response);
      if (blog.value && String(blog.value.id) === String(id)) {
        const resData = response.data?.data || response.data;
        if (resData && resData.view_count !== undefined) {
          blog.value.views = Number(resData.view_count);
          blog.value.view_count = Number(resData.view_count);
        } else if (resData && resData.views !== undefined) {
          blog.value.views = Number(resData.views);
          blog.value.view_count = Number(resData.views);
        } else {
          blog.value.views = (blog.value.views || 0) + 1;
          blog.value.view_count = (blog.value.view_count || 0) + 1;
        }
      }
      return response.data;
    } catch (err) {
      console.warn(`[BlogStore] incrementBlogView ${id} failed (silent):`, err);
    }
  };

  // 4. Own articles / blogs
  const fetchOwnBlogs = async (params = {}) => {
    try {
      isLoading.value = true;
      const response = await api.get("/api/blog/getBlogbyIDUserPublished", {
        params,
      });
      ensureSuccess(response);

      const normalized = getNormalizedList(response.data);
      ownBlogs.value = normalized;
      return response.data?.data || response.data;
    } catch (err) {
      ownBlogs.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 5. Delete own article / blog
  const deleteOwnBlog = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.delete(`/api/blog/deletedBlog/${id}`);
      ensureSuccess(response);

      blogs.value = blogs.value.filter((b) => String(b.id) !== String(id));
      ownBlogs.value = ownBlogs.value.filter(
        (b) => String(b.id) !== String(id),
      );
      drafts.value = drafts.value.filter((b) => String(b.id) !== String(id));
      lastAllBlogsFetchedAt = 0;
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  // --- ADMIN SPECIFIC METHODS ---

  const createBlog = async (payload) => {
    try {
      isLoading.value = true;
      let body = payload;
      if (!(payload instanceof FormData)) {
        body = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            body.append(key, payload[key]);
          }
        });
      }

      const response = await api.post("/api/blog/createBlog", body);
      ensureSuccess(response);
      lastAllBlogsFetchedAt = 0;
      
      let newBlog = response.data?.data || response.data;
      if (newBlog) {
        newBlog = normalizeBlog(newBlog);
        if (newBlog.status === 'published') {
          blogs.value.unshift(newBlog);
        } else {
          drafts.value.unshift(newBlog);
        }
        ownBlogs.value.unshift(newBlog);
      }
      
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllBlogs = async ({ force = false } = {}) => {
    if (allBlogsRequest) {
      return allBlogsRequest;
    }

    const hasCachedList = ownBlogs.value.length > 0;
    const isFresh = Date.now() - lastAllBlogsFetchedAt < LIST_CACHE_MS;
    if (!force && hasCachedList && isFresh) {
      return ownBlogs.value;
    }

    try {
      isLoading.value = true;
      allBlogsRequest = (async () => {
        await ensureAuthorProfiles();
        const response = await api.get("/api/blog/getAllBlogs");
        ensureSuccess(response);

        const normalized = getNormalizedList(response.data);
        blogs.value = normalized.filter((b) => b.status === "published");
        drafts.value = normalized.filter((b) => b.status === "draft");
        ownBlogs.value = normalized;
        lastAllBlogsFetchedAt = Date.now();
        return ownBlogs.value;
      })();

      return await allBlogsRequest;
    } catch (err) {
      blogs.value = [];
      drafts.value = [];
      ownBlogs.value = [];
      throw err;
    } finally {
      isLoading.value = false;
      allBlogsRequest = null;
    }
  };

  const fetchDraftBlogs = async () => {
    try {
      isLoading.value = true;
      await ensureAuthorProfiles();
      const response = await api.get("/api/blog/getAllBlogsDraft");
      ensureSuccess(response);
      drafts.value = getNormalizedList(response.data);
    } catch (err) {
      drafts.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBlogById = async (id) => {
    try {
      isLoading.value = true;
      await ensureAuthorProfiles();
      const response = await api.get(`/api/blog/getBlogbyID/${id}`);
      ensureSuccess(response);
      const raw = response.data?.data || response.data;
      blog.value = normalizeBlog(raw);
      return blog.value;
    } finally {
      isLoading.value = false;
    }
  };

  const updateBlog = async (id, payload) => {
    try {
      isLoading.value = true;
      let body = payload;
      if (!(payload instanceof FormData)) {
        body = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            body.append(key, payload[key]);
          }
        });
      }

      const response = await api.put(`/api/blog/updateBlog/${id}`, body);
      ensureSuccess(response);
      lastAllBlogsFetchedAt = 0;
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCategories = async () => {
    if (categoriesRequest) {
      return categoriesRequest;
    }

    const hasCachedCategories = categories.value.length > 0;
    const isFresh = Date.now() - lastCategoriesFetchedAt < CATEGORY_CACHE_MS;
    if (hasCachedCategories && isFresh) {
      return categories.value;
    }

    try {
      isLoading.value = true;
      categoriesRequest = (async () => {
        const response = await api.get("/api/categories/getAllCategories", {
          skipGlobalToast: true,
        });
        ensureSuccess(response);

        const rawData = response.data || response;
        let list = [];
        if (Array.isArray(rawData)) {
          list = rawData;
        } else if (Array.isArray(rawData.data)) {
          list = rawData.data;
        } else if (rawData.data && Array.isArray(rawData.data.data)) {
          list = rawData.data.data;
        }
        categories.value = list;
        lastCategoriesFetchedAt = Date.now();
        return list;
      })();

      return await categoriesRequest;
    } catch (err) {
      categories.value = [];
      throw err;
    } finally {
      isLoading.value = false;
      categoriesRequest = null;
    }
  };

  const fetchBlogsByCategory = async (categoryId) => {
    try {
      isLoading.value = true;
      const response = await api.get(
        `/api/blog/getBlogsByCategory/${categoryId}`,
      );
      ensureSuccess(response);
      return getNormalizedList(response.data);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // state
    blogs,
    ownBlogs,
    blog,
    isLoading,
    page,
    hasMore,
    drafts,
    categories,

    // actions
    fetchBlogs,
    pollLatestBlogs,
    loadMore,
    fetchBlogPreview,
    incrementBlogView,
    fetchOwnBlogs,
    deleteOwnBlog,
    fetchCategories,
    fetchBlogsByCategory,

    // admin specific actions
    createBlog,
    fetchAllBlogs,
    fetchDraftBlogs,
    fetchBlogById,
    updateBlog,
  };
});
