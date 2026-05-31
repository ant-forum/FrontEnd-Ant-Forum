import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/api.js';

const CATEGORY_COLORS = ['blue', 'green', 'purple', 'orange'];

const categoryPayload = (category) => ({
  name: category.name,
  description: category.description,
  type: category.type,
});

const ensureSuccess = (response) => {
  if (response.data.result === false) {
    throw new Error(response.data.message ?? 'Category request failed.');
  }
};

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([]);
  const category = ref(null);
  const isLoading = ref(false);

  const withCardStyle = (item, index = 0) => ({
    ...item,
    colorClass: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  });

  const fetchCategories = async () => {
    try {
      isLoading.value = true;
      const response = await api.get('/api/categories/getAllCategories');
      ensureSuccess(response);
      categories.value = response.data.data.map(withCardStyle);
      return categories.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCategoryById = async (id) => {
    const response = await api.get(`/api/categories/getCategoryById/${id}`);
    ensureSuccess(response);
    category.value = withCardStyle(response.data.data);
    return category.value;
  };

  const fetchCategoryByName = async (name) => {
    const response = await api.get(`/api/categories/getCategoryByName/${encodeURIComponent(name)}`);
    ensureSuccess(response);
    category.value = withCardStyle(response.data.data);
    return category.value;
  };

  const createCategory = async (payload) => {
    const response = await api.post('/api/categories/createCategory', categoryPayload(payload));
    ensureSuccess(response);
    await fetchCategories();
    return response.data.data;
  };

  const updateCategory = async (id, payload) => {
    const response = await api.put(`/api/categories/updateCategory/${id}`, categoryPayload(payload));
    ensureSuccess(response);
    await fetchCategories();
    return response.data.data;
  };

  const deleteCategory = async (id) => {
    const response = await api.delete(`/api/categories/deleteCategory/${id}`);
    ensureSuccess(response);
    categories.value = categories.value.filter((item) => String(item.id) !== String(id));
    return response.data;
  };

  return {
    categories,
    category,
    isLoading,
    fetchCategories,
    fetchCategoryById,
    fetchCategoryByName,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
