import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import api from "@/api/api";

export const useArticleStore = defineStore("articles", () => {
  const articles = ref([]);
  const isLoading = ref(false);
  const page = ref(1);
  const hasMore = ref(false);

  const article = ref(null);

  const fetchArticles = async (isLoadMore = false) => {
    isLoading.value = true;
    try {
      const res = await api.get("/articles", {
        params: {
          sortBy: "createdAt",
          sortDir: "desc",
          _per_page: 6,
          _page: page.value,
        },
      });

      const items = res.data.data.items;

      if (isLoadMore) {
        articles.value.push(...items);
      } else {
        page.value = 1;
        articles.value = items;
      }

      hasMore.value = res.data.data.meta.hasNextPage === true;
    } catch (err) {
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value) return;

    page.value++;
    await fetchArticles(true);
  };

  const fetchArticleById = async (id) => {
    try {
      const res = await api.get(`/articles/${id}`);
      return res.data.data;
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  // Fetch own article
  const fetchOwnArticles = async ({ search = "", _per_page = 50 } = {}) => {
    try {
      const res = await api.get("/articles/own", {
        params: {
          search,
          _per_page,
          sortBy: "createdAt",
          sortDir: "desc",
        },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching articles:", err);
    }
  };

  // Delete own article
  const deleteOwnArticle = async (id) => {
    try {
      const res = await api.delete(`/articles/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  };

  // Create Article
  const createArticle = async (payload) => {
    try {
      const res = await api.post("/articles", payload);
      return res.data;
    } catch (err) {
      console.error("Error creating article:", err);
    }
  };

  // Create Thumbnail
  const createThumbnail = async (id, payload) => {
    try {
      const res = await api.post(`/articles/${id}/thumbnail`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      console.error("Error creating thumbnail:", err);
    }
  };

  // Update Article
  const updateArticle = async (id, payload) => {
    try {
      const res = await api.put(`/articles/${id}`, payload);
      return res.data;
    } catch (err) {
      console.error("Error creating article:", err);
    }
  };

  return {
    articles,
    isLoading,
    hasMore,
    article,
    fetchArticles,
    loadMore,
    fetchArticleById,
    fetchOwnArticles,
    deleteOwnArticle,
    createArticle,
    updateArticle,
    createThumbnail,
  };
});
