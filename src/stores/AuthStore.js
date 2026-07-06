import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api, {
  AUTH_MODES,
  isSessionInvalidError,
  setAuthRefreshHandler,
} from "@/api/api";
import { useNotificationStore } from "./NotificationStore";
import {
  getRememberPreference,
  getStoredAccessToken,
  getStoredRefreshSession,
  saveStoredTokens,
  setRememberPreference,
} from "@/utils/authStorage";
import { resolveMediaUrl } from "@/utils/mediaUrl";
import {
  extractProfilePayload,
  normalizeProfileRecord,
  normalizeSkills,
} from "@/utils/profileFields";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isRemembered = ref(getRememberPreference());
  const token = ref(getStoredAccessToken());
  const refreshToken = ref(getStoredRefreshSession().refreshToken);
  let refreshTimerId = null;
  const socket = ref(null);

  const connectSocket = () => {
    if (socket.value) return;
    if (!token.value) return;

    const socketUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5001" : "https://ant-forum.khei.work.gd");
    
    import("socket.io-client").then(({ io }) => {
      if (socket.value) return;
      socket.value = io(socketUrl, {
        auth: {
          token: token.value,
        },
      });

      socket.value.on("connect", () => {
        console.log("WebSocket connected successfully to", socketUrl);
      });

      const handleNotification = (notification) => {
        try {
          const notificationStore = useNotificationStore();
          const mapped = notificationStore.mapNotification(notification);
          notificationStore.addNotification(mapped);
        } catch (err) {
          console.error("Failed to process real-time notification:", err);
        }
      };

      socket.value.on("notification", handleNotification);
      socket.value.on("new_notification", handleNotification);
      socket.value.on("newNotification", handleNotification);

      socket.value.on("connect_error", (err) => {
        console.error("WebSocket connection error:", err);
      });
    }).catch(err => {
      console.error("Failed to load socket.io-client library:", err);
    });
  };

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      console.log("WebSocket disconnected.");
    }
  };

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const clearRefreshTimer = () => {
    if (refreshTimerId !== null) {
      window.clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }
  };

  const getTokenExpiry = (accessToken) => {
    try {
      const payload = accessToken.split(".")[1];
      if (!payload) return null;

      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const decoded = JSON.parse(window.atob(paddedBase64));
      return Number.isFinite(decoded.exp) ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  const scheduleAccessTokenRefresh = (accessToken) => {
    clearRefreshTimer();

    const expiresAt = getTokenExpiry(accessToken);
    if (!expiresAt || !refreshToken.value) return;

    const refreshEarlyMs = 60 * 1000;
    const delay = Math.max(expiresAt - Date.now() - refreshEarlyMs, 0);

    refreshTimerId = setTimeout(async () => {
      refreshTimerId = null;
      try {
        await refreshAccessToken();
      } catch (err) {
        if (!isSessionInvalidError(err)) {
          refreshTimerId = setTimeout(
            () => scheduleAccessTokenRefresh(token.value),
            30 * 1000,
          );
        }
      }
    }, delay);
  };

  const setUser = (newUser) => {
    if (!newUser) {
      user.value = null;
      return;
    }

    user.value = {
      ...newUser,
      profile_pic: resolveMediaUrl(newUser.profile_pic),
      skills: normalizeSkills(newUser.skills),
    };
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
      scheduleAccessTokenRefresh(newAccessToken);
      connectSocket();
    } else {
      saveStoredTokens(null, null, remember);
      clearRefreshTimer();
      disconnectSocket();
    }
  };

  const clearSession = () => {
    isRemembered.value = false;
    setRememberPreference(false);
    setTokens(null, null);
    setUser(null);
    disconnectSocket();

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
    delete userProfile.accessToken;
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
        { skipGlobalToast: true, authMode: AUTH_MODES.NONE },
      );
      const data = res.data?.data || res.data;
      const accessToken = data?.accessToken || data?.token;
      const newRefreshToken = data?.refreshToken || data?.refresh_token;

      if (!accessToken || !newRefreshToken) {
        throw res.data;
      }

      isRemembered.value = remember;
      setRememberPreference(remember);
      setTokens(accessToken, newRefreshToken, remember);
      setUser(data.user || getUserProfile(data));

      try {
        await fetchProfile();
      } catch (profileError) {
        if (!token.value || !user.value) {
          throw profileError;
        }
      }

      return res.data;
    } catch (err) {
      if (err.response?.data && typeof err.response.data === "object") {
        throw { ...err.response.data, status: err.response.status };
      }
      if (err.response?.data) {
        throw { message: err.response.data, status: err.response.status };
      }
      throw err;
    }
  };

  const requestNewAccessToken = async () => {
    const res = await api.post(
      "/auth/refresh-token",
      {},
      { skipGlobalToast: true, authMode: AUTH_MODES.REFRESH },
    );
    const data = res.data?.data || res.data;
    const accessToken = data?.accessToken || data?.token;
    const newRefreshToken =
      data?.refreshToken || data?.refresh_token || refreshToken.value;

    if (!accessToken || !newRefreshToken) {
      throw new Error(
        "Invalid token refresh response from /auth/refresh-token",
      );
    }

    setTokens(accessToken, newRefreshToken);
    console.log("Access token refreshed at:", new Date().toISOString());
    return accessToken;
  };

  const refreshAccessToken = async () => {
    try {
      const accToken = await requestNewAccessToken();
      return accToken;
    } catch (err) {
      if (isSessionInvalidError(err)) {
        clearSession();
      }
      throw err;
    }
  };

  setAuthRefreshHandler(refreshAccessToken);
  scheduleAccessTokenRefresh(token.value);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/get/profile");
      if (res.data && res.data.result !== false) {
        const fetchedProfile = normalizeProfileRecord(
          extractProfilePayload(res.data),
        );
        if (fetchedProfile) {
          setUser(fetchedProfile);
        }
        return res.data;
      }
      throw new Error(res.data?.message || "Failed to fetch profile");
    } catch (err) {
      if (isSessionInvalidError(err)) {
        clearSession();
      }
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
        { skipGlobalToast: true, authMode: AUTH_MODES.NONE },
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
      const config = {
        skipGlobalToast: true,
        authMode: resetToken ? AUTH_MODES.RECOVERY : AUTH_MODES.NONE,
      };
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
      const config = {
        skipGlobalToast: true,
        authMode: token ? AUTH_MODES.RECOVERY : AUTH_MODES.NONE,
      };
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

  if (token.value) {
    connectSocket();
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    socket,
    connectSocket,
    disconnectSocket,
    setUser,
    login,
    fetchProfile,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyAccount,
    resetPassword,
  };
});
