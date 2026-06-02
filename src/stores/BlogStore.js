import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";

const ensureSuccess = (response) => {
  if (response.data && response.data.result === false) {
    throw new Error(response.data.message ?? 'Blog request failed.');
  }
};

export const useBlogStore = defineStore('blog', () => {
  const blogs = ref([]);
  const ownBlogs = ref([]);
  const blog = ref(null);

  const isLoading = ref(false);
  const page = ref(1);
  const hasMore = ref(false);

  // Fallback lists
  const drafts = ref([]); // internal helper for admin drafts
  const categories = ref([]);

  // Helper to normalize blog image paths, dates, authors, categories
  const normalizeBlog = (item) => {
    if (!item) return null;

    let image = item.thumbnail || item.image;
    if (image) {
      // 1. Remove host/protocol parts if they belong to backend to make it relative
      if (image.includes('localhost:3000')) {
        image = image.replace(/https?:\/\/localhost:3000/, '');
      }
      const base = import.meta.env.VITE_API_BASE_URL || '';
      if (base) {
        const cleanBase = base.replace(/https?:\/\//, '').replace(/\/$/, '');
        const baseRegex = new RegExp(`https?:\\/\\/${cleanBase}`, 'i');
        image = image.replace(baseRegex, '');
      }
      
      // 2. Strip any /public/ or public/ prefixes
      if (image.includes('/public/')) {
        image = image.replace('/public/', '/');
      } else if (image.startsWith('public/')) {
        image = image.replace('public/', '');
      }

      // 3. Ensure local paths start with a leading slash to be root-relative
      if (!image.startsWith('http') && !image.startsWith('data:')) {
        if (!image.startsWith('/')) {
          image = `/${image}`;
        }
      }
    }

    let categoryName = 'General';
    if (item.category) {
      categoryName = typeof item.category === 'object' ? (item.category.name || item.category.title) : item.category;
    } else if (item.category_id) {
      // Look up from dynamically fetched categories first
      const found = categories.value.find(c => c.id == item.category_id);
      if (found) {
        categoryName = found.name || found.title || 'General';
      }
    }

    let authorName = 'System Admin';
    let authorAvatar = 'https://i.pravatar.cc/150?u=admin';
    if (item.user) {
      authorName = item.user.username || item.user.name || authorName;
      authorAvatar = item.user.profile_pic || item.user.avatar || authorAvatar;
    } else if (item.author) {
      authorName = typeof item.author === 'object' ? (item.author.name || item.author.username) : item.author;
      authorAvatar = item.author_avatar || authorAvatar;
    }

    let dateStr = 'Recent';
    if (item.created_at || item.createdAt) {
      const d = new Date(item.created_at || item.createdAt);
      if (!isNaN(d.getTime())) {
        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      }
    } else if (item.date) {
      dateStr = item.date;
    }

    return {
      ...item,
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      category: categoryName,
      category_id: item.category_id,
      image: image || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800',
      date: dateStr,
      author: authorName,
      author_avatar: authorAvatar,
      readTime: item.readTime || `${Math.max(3, Math.ceil((item.description || '').split(' ').length / 200))} min`,
      views: item.views || 0,
      likes: item.likes || 0,
      status: item.status || 'published',
      tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : ['Tech'])
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
      : (Array.isArray(data?.data)
        ? data.data
        : (data?.items || []));
    return { hasNextPage: items.length >= 6 };
  };

  // --- ACTIONS ---

  // 1. Fetch public articles / blogs
  const fetchBlogs = async (isLoadMore = false) => {
    if (isLoading.value && !isLoadMore) return;
    isLoading.value = true;
    try {
      const response = await api.get('/api/blog/getAllBlogsPublished', {
        params: {
          sortBy: 'created_at',
          sortDir: 'desc',
          _per_page: 6,
          _page: page.value,
        }
      });
      ensureSuccess(response);
      
      const normalized = getNormalizedList(response.data).filter(b => b.status === 'published');
      const meta = safeExtractMeta(response);

      if (isLoadMore) {
        blogs.value.push(...normalized);
      } else {
        page.value = 1;
        blogs.value = normalized;
      }

      hasMore.value = meta.hasNextPage || meta.hasNext || (normalized.length === 6);
    } catch (err) {
      console.error('Error fetching published blogs:', err);
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
    try {
      isLoading.value = true;
      const response = await api.get(`/api/blog/getBlogbyIDPublished/${id}`);
      ensureSuccess(response);
      const raw = response.data?.data || response.data;
      blog.value = normalizeBlog(raw);
      return blog.value;
    } finally {
      isLoading.value = false;
    }
  };

  // 4. Own articles / blogs
  const fetchOwnBlogs = async (params = {}) => {
    try {
      isLoading.value = true;
      const response = await api.get('/api/blog/getBlogbyIDUserPublished', {
        params
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

      blogs.value = blogs.value.filter(b => String(b.id) !== String(id));
      ownBlogs.value = ownBlogs.value.filter(b => String(b.id) !== String(id));
      drafts.value = drafts.value.filter(b => String(b.id) !== String(id));
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

      const response = await api.post('/api/blog/createBlog', body);
      ensureSuccess(response);
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAllBlogs = async () => {
    try {
      isLoading.value = true;
      const response = await api.get('/api/blog/getAllBlogs');
      ensureSuccess(response);

      const normalized = getNormalizedList(response.data);
      blogs.value = normalized.filter(b => b.status === 'published');
      drafts.value = normalized.filter(b => b.status === 'draft');
      ownBlogs.value = normalized;
    } catch (err) {
      blogs.value = [];
      drafts.value = [];
      ownBlogs.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDraftBlogs = async () => {
    try {
      isLoading.value = true;
      const response = await api.get('/api/blog/getAllBlogsDraft');
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
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCategories = async () => {
    try {
      isLoading.value = true;
      const response = await api.get('/api/categories/getAllCategories', { skipGlobalToast: true });
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
      return list;
    } catch (err) {
      categories.value = [];
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBlogsByCategory = async (categoryId) => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/blog/getBlogsByCategory/${categoryId}`);
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
    loadMore,
    fetchBlogPreview,
    fetchOwnBlogs,
    deleteOwnBlog,
    fetchCategories,
    fetchBlogsByCategory,

    // admin specific actions
    createBlog,
    fetchAllBlogs,
    fetchDraftBlogs,
    fetchBlogById,
    updateBlog
  };
});
