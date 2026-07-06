import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useAuthStore } from "./AuthStore";
import {
  extractProfilePayload,
  normalizeProfileRecord,
  normalizeSkills,
  skillsToText,
} from "@/utils/profileFields";
import { resolveMediaUrl } from "@/utils/mediaUrl";

const ensureSuccess = (response, fallbackMessage) => {
  if (response.data && response.data.result === false) {
    throw new Error(response.data.message || fallbackMessage);
  }
};

export const useUserProfilesStore = defineStore("userProfiles", () => {
  const profile = ref(null);
  const socialLinks = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const viewedProfile = ref(null);
  const viewedProjects = ref([]);
  const viewedSocialLinks = ref([]);

  const authStore = useAuthStore();

  /**
   * Get Owner Profile
   */
  const fetchProfile = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await api.get("/api/get/profile");
      if (res.data && res.data.result === false) {
        throw new Error(res.data.message || "Failed to fetch profile");
      }
      profile.value = normalizeProfileRecord(extractProfilePayload(res.data));

      // Fetch social links at the same time
      try {
        const socialRes = await api.get("/api/get-owner/social-link");
        socialLinks.value = socialRes.data?.data || socialRes.data || [];
      } catch (e) {
        console.warn("Failed to fetch social links", e);
      }

      // Keep authStore in sync
      if (profile.value) {
        authStore.setUser(profile.value);
      }
      return profile.value;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "An error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update User Profile
   */
  const updateProfile = async ({ username, fullname, gender, bio, skills }) => {
    try {
      isLoading.value = true;
      error.value = null;
      const profilePayload = {};
      if (username !== undefined) profilePayload.username = username;
      if (gender !== undefined) profilePayload.gender = gender;

      let profileResponse = null;
      if (Object.keys(profilePayload).length > 0) {
        profileResponse = await api.put("/api/update/profile", profilePayload);
        ensureSuccess(profileResponse, "Failed to update profile");
      }

      if (fullname !== undefined) {
        const nameRes = await api.post("/api/fullname", { fullname });
        ensureSuccess(nameRes, "Failed to update fullname");
      }

      const savedBio = bio === undefined ? undefined : bio || null;
      if (savedBio !== undefined) {
        const bioRes = await api.put("/api/update/bio", { bio: savedBio });
        ensureSuccess(bioRes, "Failed to update bio");
      }

      const savedSkills =
        skills === undefined
          ? undefined
          : skillsToText(normalizeSkills(skills)) || null;
      if (savedSkills !== undefined) {
        const skillsRes = await api.put("/api/update/skills", {
          skills: savedSkills,
        });
        ensureSuccess(skillsRes, "Failed to update skills");
      }

      const savedProfilePatch = {
        ...(profile.value || authStore.user || {}),
        ...normalizeProfileRecord(extractProfilePayload(profileResponse?.data)),
      };

      if (username !== undefined) savedProfilePatch.username = username;
      if (gender !== undefined) savedProfilePatch.gender = gender;
      if (fullname !== undefined) {
        savedProfilePatch.name = fullname;
        savedProfilePatch.fullname = fullname;
      }
      if (savedBio !== undefined) savedProfilePatch.bio = savedBio;
      if (savedSkills !== undefined) savedProfilePatch.skills = savedSkills;

      const savedProfile = normalizeProfileRecord(savedProfilePatch);

      if (savedProfile) {
        profile.value = savedProfile;
        authStore.setUser(savedProfile);
      }

      try {
        await fetchProfile();
      } catch (refreshError) {
        console.warn(
          "Profile updated, but refreshing profile failed:",
          refreshError,
        );
      }

      if (profile.value) {
        authStore.setUser(profile.value);
      }
      return profile.value;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "An error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Upload Avatar
   */
  const uploadAvatar = async (file) => {
    try {
      isLoading.value = true;
      error.value = null;

      const formData = new FormData();
      formData.append("profile_pic", file);

      const res = await api.post("/api/profile/avatar", formData);
      if (res.data && res.data.result === false) {
        throw new Error(res.data.message || "Failed to upload avatar");
      }

      // Fetch latest profile from server to guarantee sync and normalization
      await fetchProfile();
      return profile.value;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "An error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Add Social Link
   */
  const addSocialLink = async (platform, url) => {
    try {
      isLoading.value = true;
      const res = await api.post("/api/createSocialLink", {
        platform,
        url,
      });
      if (res.data && res.data.result === false)
        throw new Error(res.data.message);

      // Refetch
      const socialRes = await api.get("/api/get-owner/social-link");
      socialLinks.value = socialRes.data?.data || socialRes.data || [];
      return res.data;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "Failed to add link";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update Social Link
   */
  const updateSocialLink = async (id, platform, url) => {
    try {
      isLoading.value = true;
      const res = await api.put(`/api/update/social-link/${id}`, {
        platform,
        url,
      });
      if (res.data && res.data.result === false)
        throw new Error(res.data.message);

      // Refetch
      const socialRes = await api.get("/api/get-owner/social-link");
      socialLinks.value = socialRes.data?.data || socialRes.data || [];
      return res.data;
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "Failed to update link";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete Social Link
   */
  const deleteSocialLink = async (id) => {
    try {
      isLoading.value = true;
      await api.delete(`/api/delete/social-link/${id}`);

      // Refetch
      const socialRes = await api.get("/api/get-owner/social-link");
      socialLinks.value = socialRes.data?.data || socialRes.data || [];
    } catch (err) {
      error.value =
        err.response?.data?.message || err.message || "Failed to delete link";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch Viewed User Profile
   */
  const fetchViewedProfile = async (id) => {
    const res = await api.get(`/api/admin/get-user/${id}`);
    const data = res.data?.data || res.data;
    if (data && (data.name || data.username || data.id)) {
      viewedProfile.value = data;
      return data;
    }
    throw new Error("Failed to fetch user profile data");
  };

  /**
   * Fetch Viewed User Projects
   */
  const fetchViewedProjects = async (userId) => {
    const authStore = useAuthStore();
    const isOwn =
      authStore.user && Number(authStore.user.id) === Number(userId);

    const endpoint = isOwn
      ? "/api/projects/getMyProjects"
      : "/api/projects/getAllProjects";
    const res = await api.get(endpoint);
    const rawData = res.data?.data || res.data;
    const allProjects = Array.isArray(rawData) ? rawData : [];
    const userProjects = allProjects.filter(
      (p) =>
        Number(p.user_id) === Number(userId) ||
        Number(p.created_by) === Number(userId),
    );

    viewedProjects.value = userProjects.map((p) => {
      const avgRating = Number(p.average_rating) || 0;
      const stars =
        avgRating > 0 ? `${avgRating.toFixed(1)}/5` : p.stars || "0.0";

      return {
        id: p.id,
        title: p.title || p.name,
        desc: p.description || p.desc || "No description available.",
        tags: p.tags
          ? typeof p.tags === "string"
            ? p.tags.split(",").map((t) => t.trim().toUpperCase())
            : p.tags
          : ["GENERAL"],
        stars: stars,
        image: resolveMediaUrl(p.thumbnail || p.image_url || p.screenshot),
      };
    });
    return viewedProjects.value;
  };

  /**
   * Fetch Viewed User Social Links
   */
  const fetchViewedSocialLinks = async (userId) => {
    try {
      const res = await api.get(`/api/get-social-links/${userId}`);
      viewedSocialLinks.value = res.data?.data || res.data || [];
    } catch (err) {
      console.error("[UserProfilesStore] fetchViewedSocialLinks failed:", err);
      viewedSocialLinks.value = [];
    }
    return viewedSocialLinks.value;
  };

  return {
    profile,
    socialLinks,
    isLoading,
    error,
    viewedProfile,
    viewedProjects,
    viewedSocialLinks,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    fetchViewedProfile,
    fetchViewedProjects,
    fetchViewedSocialLinks,
  };
});
