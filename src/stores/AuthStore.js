import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api, { setAuthRefreshHandler } from "@/api/api";
import { useNotificationStore } from "./NotificationStore";
import {
  clearStoredTokens,
  getRememberPreference,
  getStoredAccessToken,
  getStoredRefreshSession,
  saveStoredTokens,
  setRememberPreference,
} from "@/utils/authStorage";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isRemembered = ref(getRememberPreference());
  const token = ref(getStoredAccessToken());
  const refreshToken = ref(getStoredRefreshSession().refreshToken);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const normalizeAvatar = (avatarPath) => {
    if (!avatarPath) return null;
    let path = avatarPath;
    if (path.includes("localhost:3000")) {
      path = path.replace(/https?:\/\/localhost:3000/, "");
    }
    const base = import.meta.env.VITE_API_BASE_URL || "";
    if (base) {
      const cleanBase = base.replace(/https?:\/\//, "").replace(/\/$/, "");
      const baseRegex = new RegExp(`https?:\\/\\/${cleanBase}`, "i");
      path = path.replace(baseRegex, "");
    }

    // Strip any /public/ or public/ prefixes
    if (path.includes("/public/")) {
      path = path.replace("/public/", "/");
    } else if (path.startsWith("public/")) {
      path = path.replace("public/", "");
    }

    if (!path.startsWith("http") && !path.startsWith("data:")) {
      if (!path.startsWith("/")) {
        path = `/${path}`;
      }
    }
    return path;
  };

  const setUser = (newUser) => {
    if (newUser) {
      if (newUser.profile_pic) {
        newUser.profile_pic = normalizeAvatar(newUser.profile_pic);
      }
      if (newUser.avatar) {
        newUser.avatar = normalizeAvatar(newUser.avatar);
      }
      if (newUser.avatarUrl) {
        newUser.avatarUrl = normalizeAvatar(newUser.avatarUrl);
      }
    }
    user.value = newUser;
  };

  const setTokens = (
    newAccessToken,
    newRefreshToken,
    remember = isRemembered.value,
  ) => {
    token.value = newAccessToken || null;
    refreshToken.value = newRefreshToken || null;

    if (newAccessToken && newRefreshToken) {
      saveStoredTokens(newAccessToken, newRefreshToken, remember);
    } else {
      clearStoredTokens();
    }
  };

  const clearSession = () => {
    isRemembered.value = false;
    setRememberPreference(false);
    setTokens(null, null);
    setUser(null);

    try {
      const notificationStore = useNotificationStore();
      notificationStore.clearNotifications();
    } catch (err) {
      console.error("Failed to clear notification store:", err);
    }
  };

  const getUserProfile = (data) => {
    const userProfile = { ...data };
    delete userProfile.token;
    delete userProfile.refresh_token;
    delete userProfile.refreshToken;
    return userProfile;
  };

  const login = async (payloads) => {
    try {
      const { email, password, remember = false } = payloads;
      const res = await api.post(
        "/auth/login",
        { email, password },
        { skipGlobalToast: true },
      );
      const data = res.data?.data;

      if (!data?.token || !data?.refresh_token) {
        throw res.data;
      }

      isRemembered.value = remember;
      setRememberPreference(remember);
      setTokens(data.token, data.refresh_token, remember);
      setUser(getUserProfile(data));
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const requestNewAccessToken = async () => {
    const persistedSession = getStoredRefreshSession();
    if (!persistedSession.refreshToken) {
      throw new Error("No refresh token available");
    }

    refreshToken.value = persistedSession.refreshToken;
    const res = await api.post(
      "/auth/refresh-token",
      {},
      { skipGlobalToast: true },
    );
    const data = res.data?.data;
    const newRefreshToken = data?.refresh_token;

    if (!data?.token || !newRefreshToken) {
      throw new Error(
        "Invalid token refresh response from /auth/refresh-token",
      );
    }

    setTokens(data.token, newRefreshToken, persistedSession.remember);
    return data.token;
  };

  const refreshAccessToken = async () => {
    try {
      const accToken = await requestNewAccessToken();
      return accToken;
    } catch (err) {
      clearSession();
      throw err;
    }
  };

  setAuthRefreshHandler(refreshAccessToken);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/get/profile");
      if (res.data && res.data.result !== false) {
        setUser(res.data.data || res.data);
        return res.data;
      }
      clearSession();
    } catch (err) {
      clearSession();
      throw err.response?.data || err.message || err;
    }
  };

  const logout = async () => {
    try {
      const res = await api.delete("/api/logout", { skipGlobalToast: true });
      return res.data;
    } catch (err) {
      console.warn(
        "[AuthStore] Server logout failed. Clearing local session...",
        err.message,
      );
      return err.response?.data || { result: false, message: err.message };
    } finally {
      clearSession();
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post(
        "/api/forgot-password",
        { email },
        { skipGlobalToast: true },
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const verifyAccount = async (otpCode) => {
    try {
      const resetToken = sessionStorage.getItem("ANT_ResetToken");
      const payload = { otp: otpCode };
      const config = { skipGlobalToast: true };
      if (resetToken) {
        payload.resetToken = resetToken;
        config.headers = {
          Authorization: `Bearer ${resetToken}`,
        };
      }
      const res = await api.post("/api/verify-otp", payload, config);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const resetPassword = async (newPassword, confirmPassword, verifiedToken) => {
    try {
      const token =
        verifiedToken || sessionStorage.getItem("ANT_VerifiedToken");
      const config = { skipGlobalToast: true };
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const res = await api.post(
        "/api/reset-password",
        {
          newPassword,
          confirmPassword,
        },
        config,
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    fetchProfile,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyAccount,
    resetPassword,
  };
});
