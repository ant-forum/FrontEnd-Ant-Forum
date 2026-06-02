import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";
import { useCategoriesStore } from "./CategoriesStore";

export const useBlogStore = defineStore("blog", () => {
  const blogs = ref([]);
  const ownBlogs = ref([]);
  const blog = ref(null);

  const isLoading = ref(false);
  const page = ref(1);
  const hasMore = ref(false);

  // Fallback lists
  const drafts = ref([]); // internal helper for admin drafts
  
  const categoriesStore = useCategoriesStore();

  // Helper to normalize blog image paths, dates, authors, categories
  const normalizeBlog = (item) => {
    if (!item) return null;

    let image = item.thumbnail || item.image;
    if (image) {
      // 1. Remove host/protocol parts if they belong to backend to make it relative
      if (image.includes("localhost:3000")) {
        image = image.replace(/https?:\/\/localhost:3000/, "");
      }
      const base = import.meta.env.VITE_API_BASE_URL || "";
      if (base) {
        const cleanBase = base.replace(/https?:\/\//, "").replace(/\/$/, "");
        const baseRegex = new RegExp(`https?:\\/\\/${cleanBase}`, "i");
        image = image.replace(baseRegex, "");
      }
      
      // 2. Strip any /public/ or public/ prefixes
      if (image.includes("/public/")) {
        image = image.replace("/public/", "/");
      } else if (image.startsWith("public/")) {
        image = image.replace("public/", "");
      }

      // 3. Ensure local paths start with a leading slash to be root-relative
      if (!image.startsWith("http") && !image.startsWith("data:")) {
        if (!image.startsWith("/")) {
          image = `/${image}`;
        }
      }
    }

    let categoryName = "General";
    if (item.category) {
      categoryName = typeof item.category === "object" ? (item.category.name || item.category.title) : item.category;
    } else if (item.category_id) {
      // Look up from dynamically fetched categories first in categoriesStore
      const found = categoriesStore.categories.find(c => c.id == item.category_id);
      if (found) {
        categoryName = found.name || found.title || "General";
      }
    }

    let authorName = "System Admin";
    let authorAvatar = "https://i.pravatar.cc/150?u=admin";
    if (item.user) {
      authorName = item.user.username || item.user.name || authorName;
      authorAvatar = item.user.profile_pic || item.user.avatar || authorAvatar;
    } else if (item.author) {
      authorName = typeof item.author === "object" ? (item.author.name || item.author.username) : item.author;
      authorAvatar = item.author_avatar || authorAvatar;
    }

    let dateStr = "Recent";
    if (item.created_at || item.createdAt) {
      const d = new Date(item.created_at || item.createdAt);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }
    } else if (item.date) {
      dateStr = item.date;
    }

    return {
      ...item,
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      category: categoryName,
      category_id: item.category_id,
      image: image || "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
      date: dateStr,
      author: authorName,
      author_avatar: authorAvatar,
      readTime: item.readTime || `${Math.max(3, Math.ceil((item.description || "").split(" ").length / 200))} min`,
      views: item.views || 0,
      likes: item.likes || 0,
      status: item.status || "published",
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(",").map(t => t.trim()) : ["Tech"])
    };
  };

  const getNormalizedList = (response) => {
    if (!response) return [];
    let list = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (Array.isArray(response.items)) {
      list = response.items;
    } else if (response.data) {
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response.data.items)) {
        list = response.data.items;
      } else if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          list = response.data.data;
        } else if (Array.isArray(response.data.data.items)) {
          list = response.data.data.items;
        }
      }
    }
    return list.map(normalizeBlog);
  };

  const safeExtractMeta = (response) => {
    if (!response) return { hasNextPage: false };
    const rawData = response.data || response;
    const meta = rawData.meta || rawData.data?.meta;
    if (meta) return meta;

    const items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data?.items || []);
    return { hasNextPage: items.length >= 6 };
  };

  // --- ACTIONS ---

  // 1. Fetch public articles / blogs
  const fetchBlogs = async (isLoadMore = false) => {
    if (isLoading.value && !isLoadMore) return;
    isLoading.value = true;
    try {
      const res = await api.get("/api/blog/getAllBlogsPublished", {
        params: {
          sortBy: "created_at",
          sortDir: "desc",
          _per_page: 6,
          _page: page.value,
        }
      });
      
      const normalized = getNormalizedList(res.data);
      const meta = safeExtractMeta(res);

      if (isLoadMore) {
        blogs.value.push(...normalized);
      } else {
        page.value = 1;
        blogs.value = normalized;
      }

      hasMore.value = meta.hasNextPage || meta.hasNext || (normalized.length === 6);
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

  // 2. Load more articles / blogs
  const loadMore = async () => {
    if (!hasMore.value) return;
    page.value++;
    await fetchBlogs(true);
  };

  // 3. Single article preview / detail
  const fetchBlogPreview = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/blog/getBlogbyIDPublished/${id}`);
      const raw = res.data?.data || res.data;
      blog.value = normalizeBlog(raw);
      return blog.value;
    } catch (err) {
      console.error(`[BlogStore] Fetch Blog Preview ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 4. Own articles / blogs
  const fetchOwnBlogs = async (params = {}) => {
    isLoading.value = true;
    try {
      const userId = params.userId || params.id || "";
      const res = await api.get(`/api/blog/getBlogbyIDUserPublished/${userId}`, {
        params
      });

      const normalized = getNormalizedList(res.data);
      ownBlogs.value = normalized;
      return res.data?.data || res.data;
    } catch (err) {
      console.error("Error fetching own articles:", err);
      ownBlogs.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 5. Delete own article / blog
  const deleteOwnBlog = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.delete(`/api/blog/deletedBlog/${id}`);
      blogs.value = blogs.value.filter(b => b.id != id);
      ownBlogs.value = ownBlogs.value.filter(b => b.id != id);
      drafts.value = drafts.value.filter(b => b.id != id);
      return res.data;
    } catch (err) {
      console.error(`[BlogStore] Delete Blog ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // --- ADMIN SPECIFIC METHODS ---

  const createBlog = async (payload) => {
    isLoading.value = true;
    try {
      let body = payload;
      if (!(payload instanceof FormData)) {
        body = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            body.append(key, payload[key]);
          }
        });
      }

      const res = await api.post("/api/blog/createBlog", body);
      return res.data;
    } catch (err) {
      console.error("[BlogStore] Create Blog failed:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllBlogs = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/blog/getAllBlogs");
      const normalized = getNormalizedList(res.data);
      blogs.value = normalized.filter(b => b.status === "published");
      drafts.value = normalized.filter(b => b.status === "draft");
      ownBlogs.value = normalized;
    } catch (err) {
      console.error("[BlogStore] Fetch All Blogs failed:", err);
      blogs.value = [];
      drafts.value = [];
      ownBlogs.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDraftBlogs = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/blog/getAllBlogsDraft");
      drafts.value = getNormalizedList(res.data);
    } catch (err) {
      console.error("[BlogStore] Fetch Draft Blogs failed:", err);
      drafts.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBlogById = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/blog/getBlogbyID/${id}`);
      const raw = res.data?.data || res.data;
      blog.value = normalizeBlog(raw);
      return blog.value;
    } catch (err) {
      console.error(`[BlogStore] Fetch Blog by ID ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateBlog = async (id, payload) => {
    isLoading.value = true;
    try {
      let body = payload;
      if (!(payload instanceof FormData)) {
        body = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            body.append(key, payload[key]);
          }
        });
      }

      const res = await api.put(`/api/blog/updateBlog/${id}`, body);
      return res.data;
    } catch (err) {
      console.error(`[BlogStore] Update Blog ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBlogsByUser = async (userId) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/blog/getBlogsByUser/${userId}`);
      return getNormalizedList(res.data);
    } catch (err) {
      console.error(`[BlogStore] Fetch Blogs by User ${userId} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBlogsByCategory = async (categoryId) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/blog/getBlogsByCategory/${categoryId}`);
      return getNormalizedList(res.data);
    } catch (err) {
      console.error(`[BlogStore] Fetch Blogs by Category ${categoryId} failed:`, err);
      throw err;
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

    // actions
    fetchBlogs,
    loadMore,
    fetchBlogPreview,
    fetchOwnBlogs,
    deleteOwnBlog,
    fetchBlogsByUser,
    fetchBlogsByCategory,

    // admin specific actions
    createBlog,
    fetchAllBlogs,
    fetchDraftBlogs,
    fetchBlogById,
    updateBlog
  };
});
