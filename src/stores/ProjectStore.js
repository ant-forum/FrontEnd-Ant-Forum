import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import { useAuthStore } from "./AuthStore";
import { useForumStore } from "./ForumStore";
import { useUsersStore } from "./UsersStore";

export const useProjectStore = defineStore("project", () => {
  const projects = ref([]);
  const project = ref(null);
  const myProjects = ref([]);
  const ratedProjects = ref([]);
  const isLoading = ref(false);
  const allProjects = computed(() => projects.value);

  const createForm = ref({
    projectName: "",
    tagline: "",
    description: "",
    liveDemoUrl: "",
    tag_ids: [],
    tagsList: [],
    thumbnail: null,
    thumbnailUrl: ""
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
      thumbnailUrl: ""
    };
  };

  const resolveAuthor = (userId, defaultAuthor) => {
    if (!userId) {
      if (defaultAuthor) {
        return {
          name: defaultAuthor.name || defaultAuthor.username || "Unknown",
          avatar: resolveMediaUrl(
            defaultAuthor.profile_pic || defaultAuthor.avatar,
            "https://i.pravatar.cc/150?u=default"
          ),
          username: defaultAuthor.username ? `@${defaultAuthor.username}` : "@unknown",
        };
      }
      return {
        name: "Unknown",
        avatar: "https://i.pravatar.cc/150?u=default",
        username: "@unknown",
      };
    }

    // 1. Check AuthStore (current user)
    const authStore = useAuthStore();
    if (authStore.user && (Number(authStore.user.id) === Number(userId) || Number(authStore.user.user_id) === Number(userId))) {
      return {
        name: authStore.user.name || authStore.user.username || "Unknown",
        avatar: resolveMediaUrl(
          authStore.user.profile_pic || authStore.user.avatar,
          "https://i.pravatar.cc/150?u=default"
        ),
        username: authStore.user.username ? `@${authStore.user.username}` : "@unknown",
      };
    }

    // 2. Check UsersStore (admin users list)
    const usersStore = useUsersStore();
    if (usersStore.users && usersStore.users.length > 0) {
      const u = usersStore.users.find(u => Number(u.id) === Number(userId) || Number(u.user_id) === Number(userId));
      if (u) {
        return {
          name: u.name || u.username || "Unknown",
          avatar: resolveMediaUrl(
            u.profile_pic || u.avatar,
            "https://i.pravatar.cc/150?u=default"
          ),
          username: u.username ? `@${u.username}` : "@unknown",
        };
      }
    }

    // 3. Check ForumStore discussions
    const forumStore = useForumStore();
    if (forumStore.discussions && forumStore.discussions.length > 0) {
      const d = forumStore.discussions.find(d => {
        const dUserId = d.user_id || d.userId;
        return dUserId && Number(dUserId) === Number(userId);
      });
      if (d) {
        const u = d.user || d.author;
        if (u && typeof u === 'object') {
          return {
            name: u.name || u.username || "Unknown",
            avatar: resolveMediaUrl(
              u.profile_pic || u.avatar || d.author_avatar,
              "https://i.pravatar.cc/150?u=default"
            ),
            username: u.username ? `@${u.username}` : "@unknown",
          };
        }
      }
    }

    // 4. Check ForumStore comments
    if (forumStore.comments && forumStore.comments.length > 0) {
      const c = forumStore.comments.find(c => {
        const cUserId = c.user_id || c.userId;
        return cUserId && Number(cUserId) === Number(userId);
      });
      if (c) {
        const u = c.author || c.user;
        if (u && typeof u === 'object') {
          return {
            name: u.name || u.username || "Unknown",
            avatar: resolveMediaUrl(
              u.profile_pic || u.avatar,
              "https://i.pravatar.cc/150?u=default"
            ),
            username: u.username ? `@${u.username}` : "@unknown",
          };
        }
      }
    }

    // Fallback to defaultAuthor or Unknown
    if (defaultAuthor) {
      return {
        name: defaultAuthor.name || defaultAuthor.username || "Unknown",
        avatar: resolveMediaUrl(
          defaultAuthor.profile_pic || defaultAuthor.avatar,
          "https://i.pravatar.cc/150?u=default"
        ),
        username: defaultAuthor.username ? `@${defaultAuthor.username}` : "@unknown",
      };
    }

    return {
      name: "Unknown",
      avatar: "https://i.pravatar.cc/150?u=default",
      username: "@unknown",
    };
  };

  const normalizeProject = (item) => {
    if (!item) return null;

    const defaultAuthor = item.author || item.user;

    let tags = [];
    if (Array.isArray(item.tag)) {
      tags = item.tag.map(t => t.name || t.tag_name || `Tag ${t.tag_id}`).filter(Boolean);
    } else if (Array.isArray(item.tags)) {
      tags = item.tags.map(t => typeof t === 'string' ? t : (t.name || t.tag_name)).filter(Boolean);
    }

    const image = resolveMediaUrl(
      item.thumbnail || item.image,
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600",
    );
    const averageRating = Number(item.average_rating) || 0;
    const views = Number(item.views) || 0;
    const myRating = item.my_rating ? Number(item.my_rating) : null;

    const normalized = {
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
      average_rating: averageRating,
      my_rating: myRating,
      get author() {
        return resolveAuthor(item.user_id || item.userId, defaultAuthor);
      },
      get authors() {
        return [this.author];
      }
    };

    return normalized;
  };

  const extractList = (responseData) => {
    if (!responseData) return [];
    const d = responseData.data !== undefined ? responseData.data : responseData;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    if (d && Array.isArray(d.items)) return d.items;
    if (d && Array.isArray(d.rows)) return d.rows;
    if (d && Array.isArray(d.results)) return d.results;
    return [];
  };

  const ensureSuccess = (res) => {
    if (res.data && (res.data.result === false || res.data.success === false)) {
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

      const res = await api.get("/api/projects");
      ensureSuccess(res);
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
      try {
        const forumStore = useForumStore();
        if (forumStore.discussions.length === 0) {
          forumStore.fetchDiscussions().catch(() => {});
        }
      } catch (err) {
        // Ignore background fetch issues
      }

      const res = await api.get(`/api/projects/${id}`);
      ensureSuccess(res);
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

  const fetchMyProjects = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/projects/my");
      ensureSuccess(res);
      const list = extractList(res.data);
      myProjects.value = list.map(normalizeProject);
    } catch (err) {
      console.error("[ProjectStore] fetchMyProjects failed:", err);
      myProjects.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRatedProjects = async () => {
    isLoading.value = true;
    try {
      const res = await api.get("/api/projects/rated");
      ensureSuccess(res);
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
      const rawData = data && data.value !== undefined ? data.value : data;
      const formData = new FormData();
      formData.append("title", rawData.projectName || rawData.title);
      formData.append("description", rawData.description);
      if (rawData.liveDemoUrl || rawData.link) {
        formData.append("link", rawData.liveDemoUrl || rawData.link);
      }
      if (rawData.thumbnail) {
        formData.append("thumbnail", rawData.thumbnail);
      }
      if (rawData.tag_ids && rawData.tag_ids.length > 0) {
        formData.append("tag_ids", JSON.stringify(rawData.tag_ids));
      }

      const res = await api.post("/api/projects", formData);
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
      if (rawData.description) formData.append("description", rawData.description);
      if (rawData.liveDemoUrl !== undefined || rawData.link !== undefined) {
        formData.append("link", rawData.liveDemoUrl !== undefined ? rawData.liveDemoUrl : rawData.link);
      }
      if (rawData.thumbnail) formData.append("thumbnail", rawData.thumbnail);
      if (rawData.tag_ids) {
        formData.append("tag_ids", JSON.stringify(rawData.tag_ids));
      }

      const res = await api.put(`/api/projects/${id}`, formData);
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
      const res = await api.delete(`/api/projects/${id}`);
      ensureSuccess(res);
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
      const res = await api.post(`/api/projects/${id}/rate`, { rate_star: rateStar });
      ensureSuccess(res);
      await fetchProject(id);
      await fetchRatedProjects(); // ✅ removed argument
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
      const res = await api.put(`/api/projects/${id}/rate`, { rate_star: rateStar });
      ensureSuccess(res);
      await fetchProject(id);
      await fetchRatedProjects(); // ✅ removed argument
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
    createForm,
    resetCreateForm,
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