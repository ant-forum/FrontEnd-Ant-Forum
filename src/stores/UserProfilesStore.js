import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";
import { useAuthStore } from "./AuthStore";

export const useUserProfilesStore = defineStore("userProfiles", () => {
  const profile = ref(null);
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
      profile.value = res.data.user || res.data.data || res.data;
      
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
   * Update User Profile (username and gender only)
   */
  const updateProfile = async ({ username, gender }) => {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await api.put("/api/update/profile", { username, gender });
      if (res.data && res.data.result === false) {
        throw new Error(res.data.message || "Failed to update profile");
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
   * Delete User Profile
   */
  const deleteProfile = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const res = await api.delete("/api/delete/profile");
      if (res.data && res.data.result === false) {
        throw new Error(res.data.message || "Failed to delete profile");
      }
      
      // Reset store state and logout user
      profile.value = null;
      await authStore.logout();
      
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || "An error occurred";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteProfile,
  };
});
