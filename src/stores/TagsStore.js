import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api.js";

const TAG_COLORS = ["green", "blue", "orange", "blue"];

const tagPayload = (tag) => {
  const payload = {
    description: tag.description,
  };

  if (tag.name !== undefined) {
    payload.name = tag.name;
  }

  return payload;
};

const ensureSuccess = (response) => {
  if (response.data.result === false) {
    throw new Error(response.data.message ?? "Tag request failed.");
  }
};

export const useTagsStore = defineStore("tags", () => {
  const tags = ref([]);
  const tag = ref(null);
  const isLoading = ref(false);

  const withCardStyle = (item, index = 0) => ({
    ...item,
    colorClass: TAG_COLORS[index % TAG_COLORS.length],
  });

  const fetchTags = async () => {
    try {
      isLoading.value = true;
      const response = await api.get("/api/tags/getAllTags");
      ensureSuccess(response);
      tags.value = response.data.data.map(withCardStyle);
      return tags.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchTagById = async (id) => {
    const response = await api.get(`/api/tags/getTagById/${id}`);
    ensureSuccess(response);
    tag.value = withCardStyle(response.data.data);
    return tag.value;
  };

  const fetchTagByName = async (name) => {
    const response = await api.get(
      `/api/tags/getTagByName/${encodeURIComponent(name)}`,
    );
    ensureSuccess(response);
    tag.value = withCardStyle(response.data.data);
    return tag.value;
  };

  const createTag = async (payload) => {
    const response = await api.post("/api/tags/createTag", tagPayload(payload));
    ensureSuccess(response);
    return response.data.data;
  };

  const updateTag = async (id, payload) => {
    const response = await api.put(
      `/api/tags/updateTag/${id}`,
      tagPayload(payload),
    );
    ensureSuccess(response);
    return response.data.data;
  };

  const deleteTag = async (id) => {
    const response = await api.delete(`/api/tags/deleteTag/${id}`);
    ensureSuccess(response);
    return response.data;
  };

  return {
    tags,
    tag,
    isLoading,
    fetchTags,
    fetchTagById,
    fetchTagByName,
    createTag,
    updateTag,
    deleteTag,
  };
});
