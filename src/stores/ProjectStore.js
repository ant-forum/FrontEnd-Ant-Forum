import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { resolveAuthor } from "@/utils/author";
import { useAuthStore } from "./AuthStore.js";
import { useForumStore } from "./ForumStore.js";

export const useProjectStore = defineStore("project", () => {
  const projects = ref([]);
  const project = ref(null);
  const myProjects = ref([]);
  const ratedProjects = ref([]);
  const isLoading = ref(false);
  const userCache = ref({}); // Cache to store users by id
  const allProjects = computed(() => projects.value);

  const createForm = ref({
    projectName: "",
    tagline: "",
    description: "",
    liveDemoUrl: "",
    tag_ids: [],
    tagsList: [],
    thumbnail: null,
    thumbnailUrl: "",
  });

  const resetCreateForm = () => {
    createForm.value = {
      projectName: "",
      tagline: "",
      description: "",
      liveDemoUrl: "",
      tag_ids: [],
      tagsList: [],
      thumbnail: null,
      thumbnailUrl: "",
    };
  };

  const fetchAndCacheUser = async (userId) => {
    if (!userId || userCache.value[userId]) return;
    const authStore = useAuthStore();
    if (!authStore.token || String(authStore.user?.role).toLowerCase() !== "admin") return;

    try {
      const res = await api.get(`/api/admin/get-user/${userId}`);
      const userData = res.data?.data || res.data;
      if (userData) {
        userCache.value[userId] = userData;
      }
    } catch (err) {
      console.warn(`[ProjectStore] Failed to fetch user ${userId}:`, err);
    }
  };

  const normalizeProject = (item) => {
    if (!item) return null;

    const defaultAuthor = item.author || item.user;

    let tags = [];
    if (Array.isArray(item.tag)) {
      tags = item.tag
        .map((t) => t.name || t.tag_name || `Tag ${t.tag_id}`)
        .filter(Boolean);
    } else if (Array.isArray(item.tags)) {
      tags = item.tags
        .map((t) => (typeof t === "string" ? t : t.name || t.tag_name))
        .filter(Boolean);
    }

    const image = resolveMediaUrl(
      item.thumbnail || item.image,
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    );
    const averageRating = Number(item.average_rating) || 0;
    const views = Number(item.views) || Number(item.view_count) || 0;
    let myRating = null;
    if (item.my_rating !== undefined && item.my_rating !== null) {
      myRating = Number(item.my_rating);
    }

    const normalized = {
      ...item,
      id: item.id,
      view_count: views,
      views,
      title: item.title || "",
      description: item.description || "",
      image,
      thumbnail: image,
      link: item.link || "",
      tags,
      stars: Math.round(averageRating * 200),
      views,
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
      average_rating: averageRating,
      my_rating: myRating,
      get author() {
        const cachedUser = userCache.value[item.user_id || item.userId];
        return resolveAuthor(
          item.user_id || item.userId,
          defaultAuthor,
          item,
          cachedUser,
        );
      },
      get authors() {
        return [this.author];
      },
    };

    return normalized;
  };

  const extractList = (responseData) => {
    if (!responseData) return [];
    const d =
      responseData.data !== undefined ? responseData.data : responseData;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && Array.isArray(d.items)) return d.items;
    if (d && Array.isArray(d.rows)) return d.rows;
    if (d && Array.isArray(d.results)) return d.results;
    return [];
  };

  const ensureSuccess = (res) => {
    if (res.data && (res.data.result === false || res.data.success === false)) {
      const msg = String(res.data.message || res.data.msg || "").toLowerCase();
      if (
        msg.includes("no project") ||
        msg.includes("no rating") ||
        msg.includes("not found")
      ) {
        return; // Treat empty states as successful empty collections
      }
      throw new Error(res.data.message || res.data.msg || "API request failed");
    }
  };

  const fetchProjects = async () => {
    isLoading.value = true;
    try {
      try {
        const forumStore = useForumStore();
        if (forumStore.discussions.length === 0) {
          forumStore.fetchDiscussions().catch(() => {});
        }
      } catch (err) {
        // Ignore background fetch issues
      }

      const res = await api.get("/api/projects/getAllProjects");
      ensureSuccess(res);
      const list = extractList(res.data);
      // Fetch all unique user_ids in the list
      const uniqueUserIds = [
        ...new Set(
          list.map((item) => item.user_id || item.userId).filter(Boolean),
        ),
      ];
      await Promise.all(uniqueUserIds.map((id) => fetchAndCacheUser(id)));
      projects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchProjects failed:", err);
      projects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const pollLatestProjects = async () => {
    if (isLoading.value) return;
    try {
      const res = await api.get("/api/projects/getAllProjects");
      const list = extractList(res.data);
      const uniqueUserIds = [...new Set(list.map(item => item.user_id || item.userId).filter(Boolean))];
      await Promise.all(uniqueUserIds.map(id => fetchAndCacheUser(id)));
      
      const normalized = list.map(normalizeProject);
      const currentList = [...projects.value];
      for (const item of normalized) {
        const existingIndex = currentList.findIndex(p => String(p.id) === String(item.id));
        if (existingIndex !== -1) {
          currentList[existingIndex] = { ...currentList[existingIndex], ...item };
        } else {
          currentList.unshift(item);
        }
      }
      currentList.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
      projects.value = currentList;
    } catch (err) {
      console.error("[ProjectStore] pollLatestProjects failed:", err);
    }
  };

  const fetchProject = async (id) => {
    isLoading.value = true;
    try {
      try {
        const forumStore = useForumStore();
        if (forumStore.discussions.length === 0) {
          forumStore.fetchDiscussions().catch(() => {});
        }
      } catch (err) {
        // Ignore background fetch issues
      }

      const res = await api.get(`/api/projects/getProjectById/${id}`);
      ensureSuccess(res);
      const raw =
        res.data?.data?.row || res.data?.row || res.data?.data || res.data;
      const rawTags = res.data?.data?.tag || res.data?.tag || [];
      // Fetch the user if we have user_id
      if (raw.user_id || raw.userId) {
        await fetchAndCacheUser(raw.user_id || raw.userId);
      }

      // Preserve existing my_rating if the new data doesn't have it
      const existingRating =
        project.value && project.value.id == id
          ? project.value.my_rating
          : null;
      const normalized = normalizeProject({ ...raw, tag: rawTags });
      if (existingRating && !normalized.my_rating) {
        normalized.my_rating = existingRating;
      }

      project.value = normalized;
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

  const incrementProjectView = async (id) => {
    try {
      const response = await api.post(`/api/projects/counter-view-project/${id}`, {}, { skipGlobalToast: true });
      ensureSuccess(response);
      const resData = response.data?.data || response.data;
      if (project.value && String(project.value.id) === String(id)) {
        if (resData && resData.view_count !== undefined) {
          project.value.views = Number(resData.view_count);
          project.value.view_count = Number(resData.view_count);
        } else {
          project.value.views = (project.value.views || 0) + 1;
          project.value.view_count = (project.value.view_count || 0) + 1;
        }
      }
      return response.data;
    } catch (err) {
      console.warn(`[ProjectStore] incrementProjectView ${id} failed (silent):`, err);
    }
  };


  const fetchMyProjects = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/projects/getMyProjects");
      ensureSuccess(res);
      const list = extractList(res.data);
      // Fetch all unique user_ids in the list
      const uniqueUserIds = [
        ...new Set(
          list.map((item) => item.user_id || item.userId).filter(Boolean),
        ),
      ];
      await Promise.all(uniqueUserIds.map((id) => fetchAndCacheUser(id)));
      myProjects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchMyProjects failed:", err);
      myProjects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRatedProjects = async () => {
    try {
      const res = await api.get("/api/projects/getRatedProjects");
      ensureSuccess(res);
      const list = extractList(res.data);
      // Fetch all unique user_ids in the list
      const uniqueUserIds = [
        ...new Set(
          list.map((item) => item.user_id || item.userId).filter(Boolean),
        ),
      ];
      await Promise.all(uniqueUserIds.map((id) => fetchAndCacheUser(id)));
      ratedProjects.value = list.map(normalizeProject);
    } catch (err) {
      console.warn("[ProjectStore] fetchRatedProjects failed:", err);
      // Don't overwrite ratedProjects if it fails
    }
  };

  const createProject = async (data) => {
    isLoading.value = true;
    try {
      const rawData = data && data.value !== undefined ? data.value : data;
      const formData = new FormData();
      formData.append("title", rawData.projectName || rawData.title);
      formData.append("description", rawData.description);
      if (rawData.liveDemoUrl || rawData.link) {
        let linkVal = rawData.liveDemoUrl || rawData.link;
        if (linkVal && !/^https?:\/\//i.test(linkVal)) {
          linkVal = "https://" + linkVal;
        }
        formData.append("link", linkVal);
      }
      if (rawData.thumbnail) {
        formData.append("thumbnail", rawData.thumbnail);
      }
      if (rawData.tag_ids && rawData.tag_ids.length > 0) {
        formData.append("tag_ids", JSON.stringify(rawData.tag_ids));
      }
      if (rawData.status !== undefined) {
        formData.append("status", rawData.status);
      }

      const res = await api.post("/api/projects/createproject", formData);
      ensureSuccess(res);
      const created = res.data?.data || res.data;

      // Ensure user_id is set to currently logged-in user if missing from response
      if (created && !created.user_id && !created.userId) {
        const authStore = useAuthStore();
        if (authStore.user) {
          created.user_id = authStore.user.id || authStore.user.user_id;
        }
      }

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
      const rawData = data && data.value !== undefined ? data.value : data;
      const formData = new FormData();
      if (rawData.projectName || rawData.title) {
        formData.append("title", rawData.projectName || rawData.title);
      }
      if (rawData.description)
        formData.append("description", rawData.description);
      if (rawData.liveDemoUrl !== undefined || rawData.link !== undefined) {
        let linkVal =
          rawData.liveDemoUrl !== undefined
            ? rawData.liveDemoUrl
            : rawData.link;
        if (linkVal && !/^https?:\/\//i.test(linkVal)) {
          linkVal = "https://" + linkVal;
        }
        formData.append("link", linkVal);
      }
      if (rawData.thumbnail) formData.append("thumbnail", rawData.thumbnail);
      if (rawData.tag_ids) {
        formData.append("tag_ids", JSON.stringify(rawData.tag_ids));
      }
      if (rawData.status !== undefined) {
        formData.append("status", rawData.status);
      }

      const res = await api.put(`/api/projects/updateProject/${id}`, formData);
      ensureSuccess(res);
      const updated = res.data?.data || res.data;

      // Ensure user_id is set to currently logged-in user if missing from response
      if (updated && !updated.user_id && !updated.userId) {
        const authStore = useAuthStore();
        if (authStore.user) {
          updated.user_id = authStore.user.id || authStore.user.user_id;
        }
      }

      const normalized = normalizeProject(updated);

      const projectIndex = projects.value.findIndex((p) => p.id == id);
      if (projectIndex !== -1) projects.value[projectIndex] = normalized;

      const myProjectIndex = myProjects.value.findIndex((p) => p.id == id);
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
      const res = await api.delete(`/api/projects/deleteProject/${id}`);
      ensureSuccess(res);
      projects.value = projects.value.filter((p) => p.id != id);
      myProjects.value = myProjects.value.filter((p) => p.id != id);
      if (project.value && project.value.id == id) project.value = null;
    } catch (err) {
      console.error(`[ProjectStore] deleteProject ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProjectRatingLocally = (id, newRating) => {
    // Update current project
    if (project.value && project.value.id == id) {
      project.value.my_rating = newRating;
    }
    // Update projects list
    const projectIndex = projects.value.findIndex((p) => p.id == id);
    if (projectIndex !== -1) {
      projects.value[projectIndex].my_rating = newRating;
    }
    // Update my projects
    const myProjectIndex = myProjects.value.findIndex((p) => p.id == id);
    if (myProjectIndex !== -1) {
      myProjects.value[myProjectIndex].my_rating = newRating;
    }
    // Update rated projects
    const ratedProjectIndex = ratedProjects.value.findIndex((p) => p.id == id);
    if (ratedProjectIndex !== -1) {
      ratedProjects.value[ratedProjectIndex].my_rating = newRating;
    }
  };

  const submitRating = async (id, rateStar) => {
    // Optimistic update
    updateProjectRatingLocally(id, rateStar);
    isLoading.value = true;
    try {
      // First try to rate
      try {
        const res = await api.post(`/api/projects/rateProject/${id}`, {
          rate_star: rateStar,
        });
        ensureSuccess(res);
      } catch (rateErr) {
        // If rate fails (already rated), try to update
        const res = await api.put(`/api/projects/updateRateProject/${id}`, {
          rate_star: rateStar,
        });
        ensureSuccess(res);
      }
      // Refresh project data
      await fetchProject(id);
    } catch (err) {
      console.error(`[ProjectStore] submitRating ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteRating = async (id) => {
    // Optimistic update - remove the rating locally
    updateProjectRatingLocally(id, 0);
    isLoading.value = true;
    try {
      // Call the API to delete the rating
      const res = await api.delete(`/api/projects/rateProject/${id}`);
      ensureSuccess(res);
      // Refresh project data
      await fetchProject(id);
    } catch (err) {
      console.error(`[ProjectStore] deleteRating ${id} failed:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Aliases for backward compatibility
  const rateProject = submitRating;
  const updateRateProject = submitRating;

  return {
    projects,
    project,
    myProjects,
    ratedProjects,
    isLoading,
    userCache,
    allProjects,
    createForm,
    resetCreateForm,
    fetchProjects,
    pollLatestProjects,
    fetchProject,
    incrementProjectView,
    fetchMyProjects,
    fetchRatedProjects,
    createProject,
    updateProject,
    deleteProject,
    rateProject,
    updateRateProject,
    fetchAndCacheUser,
    updateProjectRatingLocally,
    submitRating,
    deleteRating,
  };
});
