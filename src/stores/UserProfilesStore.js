import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useAuthStore } from "./AuthStore";
import { extractProfilePayload, normalizeProfileRecord, normalizeSkills, skillsToText } from "@/utils/profileFields";

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
        const socialRes = await api.get("/api/sociallink/get-all/social-link");
        const links = socialRes.data?.data || socialRes.data || [];
        socialLinks.value = links.filter(l => Number(l.user_id) === Number(profile.value?.id) || !l.user_id) || [];
      } catch (e) {
        console.warn("Failed to fetch social links", e);
      }
      
      // Keep authStore in sync
      if (profile.value) {
        authStore.setUser(profile.value);
      }
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "An error occurred";
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
      const profilePayload = {
        username,
        gender,
      };
      const bioPayload = { bio: bio ?? null };
      const skillsPayload = {
        skills: skillsToText(normalizeSkills(skills)) || null,
      };

      const res = await api.put("/api/update/profile", profilePayload);
      ensureSuccess(res, "Failed to update profile");

      if (fullname !== undefined) {
        const nameRes = await api.post("/api/fullname", { fullname });
        ensureSuccess(nameRes, "Failed to update fullname");
      }

      const bioRes = await api.put("/api/update/bio", bioPayload);
      ensureSuccess(bioRes, "Failed to update bio");

      const skillsRes = await api.put("/api/update/skills", skillsPayload);
      ensureSuccess(skillsRes, "Failed to update skills");

      const savedProfilePatch = {
        ...(profile.value || authStore.user || {}),
        ...normalizeProfileRecord(extractProfilePayload(res.data)),
        username,
        gender,
        name: fullname,
        fullname,
      };

      savedProfilePatch.bio = bioPayload.bio;
      savedProfilePatch.skills = skillsPayload.skills;

      const savedProfile = normalizeProfileRecord(savedProfilePatch);

      if (savedProfile) {
        profile.value = savedProfile;
        authStore.setUser(savedProfile);
      }
      
      try {
        await fetchProfile();
      } catch (refreshError) {
        console.warn("Profile updated, but refreshing profile failed:", refreshError);
      }

      if (profile.value) {
        authStore.setUser(profile.value);
      }
      return profile.value;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "An error occurred";
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
      error.value = err.response?.data?.message || err.message || "An error occurred";
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
      const res = await api.post('/api/sociallink/createSocialLink', { platform, url });
      if (res.data && res.data.result === false) throw new Error(res.data.message);
      
      // Refetch
      const socialRes = await api.get("/api/sociallink/get-all/social-link");
      const links = socialRes.data?.data || socialRes.data || [];
      socialLinks.value = links.filter(l => Number(l.user_id) === Number(profile.value?.id) || !l.user_id) || [];
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to add link";
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
      await api.delete(`/api/sociallink/delete/social-link/${id}`);
      
      // Refetch
      const socialRes = await api.get("/api/sociallink/get-all/social-link");
      const links = socialRes.data?.data || socialRes.data || [];
      socialLinks.value = links.filter(l => Number(l.user_id) === Number(profile.value?.id) || !l.user_id) || [];
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "Failed to delete link";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    profile,
    socialLinks,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    addSocialLink,
    deleteSocialLink
  };
});
