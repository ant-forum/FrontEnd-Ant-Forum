import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";

export const useProjectStore = defineStore("project", () => {
  const projects = ref([]);
  const project = ref(null);
  const myProjects = ref([]);
  const ratedProjects = ref([]);
  const isLoading = ref(false);
  const allProjects = computed(() => projects.value);

  const normalizeProject = (item) => {
    if (!item) return null;

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

    let tags = [];
    if (Array.isArray(item.tag)) {
      tags = item.tag.map(t => t.name || t.tag_name || `Tag ${t.tag_id}`).filter(Boolean);
    } else if (Array.isArray(item.tags)) {
      tags = item.tags;
    }

    // Thumbnail (single image) - handle relative /uploads/ paths
    let image = item.thumbnail || item.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600";
    if (image && image.startsWith('/')) {
      // If it's a relative path, prepend the backend base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      image = apiBaseUrl + image;
    }
    const averageRating = Number(item.average_rating) || 0;
    const views = Number(item.views) || 0;
    const myRating = item.my_rating ? Number(item.my_rating) : null;

    return {
      ...item,
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      image,
      thumbnail: image,
      link: item.link || "",
      tags,
      stars: Math.round(averageRating * 200),
      views,
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      authors: [author],
      average_rating: averageRating,
      my_rating: myRating,
      author,
    };
  };

  const extractList = (responseData) => {
    if (!responseData) return [];
    const d = responseData.data !== undefined ? responseData.data : responseData;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && Array.isArray(d.items)) return d.items;
    return [];
  };

  const fetchProjects = async (force = false) => {
    if (!force && projects.value.length > 0) return;

    isLoading.value = true;
    try {
      const res = await api.get("/api/projects");
      const list = extractList(res.data);
      projects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchProjects failed:", err);
      projects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchProject = async (id) => {
    isLoading.value = true;
    try {
      const res = await api.get(`/api/projects/${id}`);
      const raw = res.data?.data?.row || res.data?.row || res.data?.data || res.data;
      const rawTags = res.data?.data?.tag || res.data?.tag || [];
      project.value = normalizeProject({ ...raw, tag: rawTags });
      return project.value;
    } catch (err) {
      console.error(`[ProjectStore] fetchProject ${id} failed:`, err);
      if (projects.value.length === 0) await fetchProjects();
      project.value = projects.value.find((p) => p.id == id) || null;
      return project.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMyProjects = async (force = false) => {
    if (!force && myProjects.value.length > 0) return;

    isLoading.value = true;
    try {
      const res = await api.get("/api/projects/my");
      const list = extractList(res.data);
      myProjects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchMyProjects failed:", err);
      myProjects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRatedProjects = async (force = false) => {
    if (!force && ratedProjects.value.length > 0) return;

    isLoading.value = true;
    try {
      const res = await api.get("/api/projects/rated");
      const list = extractList(res.data);
      ratedProjects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchRatedProjects failed:", err);
      ratedProjects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const createProject = async (data) => {
    isLoading.value = true;
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.link) formData.append("link", data.link);
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
      if (data.tag_ids && data.tag_ids.length > 0) {
        data.tag_ids.forEach(tagId => formData.append("tag_ids", tagId));
      }

      const res = await api.post("/api/projects", formData);
      const created = res.data?.data || res.data;
      const normalized = normalizeProject(created);
      projects.value.unshift(normalized);
      myProjects.value.unshift(normalized);
      return normalized;
    } catch (err) {
      console.error("[ProjectStore] createProject failed:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProject = async (id, data) => {
    isLoading.value = true;
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.link !== undefined) formData.append("link", data.link);
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail);
      if (data.tag_ids) {
        data.tag_ids.forEach(tagId => formData.append("tag_ids", tagId));
      }

      const res = await api.put(`/api/projects/${id}`, formData);
      const updated = res.data?.data || res.data;
      const normalized = normalizeProject(updated);

      const projectIndex = projects.value.findIndex(p => p.id == id);
      if (projectIndex !== -1) projects.value[projectIndex] = normalized;
      
      const myProjectIndex = myProjects.value.findIndex(p => p.id == id);
      if (myProjectIndex !== -1) myProjects.value[myProjectIndex] = normalized;
      
      if (project.value && project.value.id == id) project.value = normalized;

      return normalized;
    } catch (err) {
      console.error(`[ProjectStore] updateProject ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteProject = async (id) => {
    isLoading.value = true;
    try {
      await api.delete(`/api/projects/${id}`);
      projects.value = projects.value.filter(p => p.id != id);
      myProjects.value = myProjects.value.filter(p => p.id != id);
      if (project.value && project.value.id == id) project.value = null;
    } catch (err) {
      console.error(`[ProjectStore] deleteProject ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const rateProject = async (id, rateStar) => {
    isLoading.value = true;
    try {
      await api.post(`/api/projects/${id}/rate`, { rate_star: rateStar });
      await fetchProject(id);
      await fetchRatedProjects(true);
    } catch (err) {
      console.error(`[ProjectStore] rateProject ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateRateProject = async (id, rateStar) => {
    isLoading.value = true;
    try {
      await api.put(`/api/projects/${id}/rate`, { rate_star: rateStar });
      await fetchProject(id);
      await fetchRatedProjects(true);
    } catch (err) {
      console.error(`[ProjectStore] updateRateProject ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    projects,
    project,
    myProjects,
    ratedProjects,
    isLoading,
    allProjects,
    fetchProjects,
    fetchProject,
    fetchMyProjects,
    fetchRatedProjects,
    createProject,
    updateProject,
    deleteProject,
    rateProject,
    updateRateProject,
  };
});