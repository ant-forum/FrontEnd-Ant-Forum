import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import api, { setAuthRefreshHandler } from "@/api/api";
import { useNotificationStore } from "./NotificationStore";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isRemembered = ref(localStorage.getItem("ANT_Remember") === "true");

  const token = ref(
    localStorage.getItem("ANT_Token") || 
    sessionStorage.getItem("ANT_Token") || 
    null
  );
  const refreshToken = ref(
    localStorage.getItem("ANT_RefreshToken") || 
    sessionStorage.getItem("ANT_RefreshToken") || 
    null
  );

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Watch for auth changes reactively to log state changes clearly
  watch(
    [token, refreshToken, user, isAuthenticated],
    ([newToken, newRefreshToken, newUser, newAuth]) => {
      console.log("[AuthStore] State Changed:", {
        hasToken: !!newToken,
        hasRefreshToken: !!newRefreshToken,
        hasUser: !!newUser,
        isAuthenticated: newAuth,
      });
    },
    { immediate: true }
  );

  const setToken = (newToken, newRefreshToken = null, remember = isRemembered.value) => {
    // Clear both storage containers to prevent duplicate tokens existing in both
    localStorage.removeItem("ANT_Token");
    localStorage.removeItem("ANT_RefreshToken");
    sessionStorage.removeItem("ANT_Token");
    sessionStorage.removeItem("ANT_RefreshToken");

    const storage = remember ? localStorage : sessionStorage;

    if (newToken) {
      token.value = newToken;
      storage.setItem("ANT_Token", newToken);
    } else {
      token.value = null;
    }

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
      storage.setItem("ANT_RefreshToken", newRefreshToken);
    } else if (newRefreshToken === null && !newToken) {
      refreshToken.value = null;
    }
  };

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

  const login = async (payloads) => {
    try {
      const { email, password, remember = false } = payloads;
      const res = await api.post("/auth/login", { email, password }, { skipGlobalToast: true });
      if (res.data && res.data.data && res.data.data.token) {
        const data = res.data.data;
        const accToken = data.token;
        const refToken = data.refresh_token || data.refreshToken;
        // Strip out tokens from user profile object to avoid cluttering
        const userObj = { ...data };
        delete userObj.token;
        delete userObj.refresh_token;
        delete userObj.refreshToken;

        // Persist the remember preference
        isRemembered.value = remember;
        if (remember) {
          localStorage.setItem("ANT_Remember", "true");
        } else {
          localStorage.removeItem("ANT_Remember");
        }

        setToken(accToken, refToken, remember);
        setUser(userObj);
        return res.data;
      } else {
        throw res.data;
      }
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const requestNewAccessToken = async (url) => {
    const res = await api.post(
      url,
      {
        refresh_token: refreshToken.value,
        refreshToken: refreshToken.value,
      },
      { skipGlobalToast: true }
    );
    const data = res.data?.data;

    if (!data?.token) {
      throw new Error(`Invalid token refresh response from ${url}`);
    }

    setToken(
      data.token,
      data.refresh_token || data.refreshToken || refreshToken.value
    );
    return data.token;
  };

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error("No refresh token available");
      }

      console.log("[AuthStore] Attempting token refresh via /auth/refresh-token...");
      const accToken = await requestNewAccessToken("/auth/refresh-token");
      console.log("[AuthStore] Token refreshed successfully via /auth/refresh-token");
      return accToken;
    } catch (err) {
      console.error("[AuthStore] Token refresh failed. Logging out...", err.message);
      logout();
      throw err;
    }
  };

  setAuthRefreshHandler(refreshAccessToken);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/get/profile");
      console.log("res", res.data);
      if (res.data && res.data.result !== false) {
        setUser(res.data.data || res.data);
        return res.data;
      }

      console.warn("No user data found in profile response:", res.data);
      logout();
    } catch (err) {
      console.warn("[AuthStore] Profile fetch failed, clearing local session...", err.message);
      logout();
      throw err.response?.data || err.message || err;
    }
  };

  const logout = async () => {
    try {
      isRemembered.value = false;
      localStorage.removeItem("ANT_Remember");
      setToken(null);
      setUser(null);
      const notificationStore = useNotificationStore();
      notificationStore.clearNotifications();
    } catch (err) {
      isRemembered.value = false;
      localStorage.removeItem("ANT_Remember");
      setToken(null);
      setUser(null);
      try {
        const notificationStore = useNotificationStore();
        notificationStore.clearNotifications();
      } catch (e) {
        console.error("Failed to clear notification store:", e);
      }
      throw err.response?.data || err.message;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/api/forgot-password", { email }, { skipGlobalToast: true });
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
          Authorization: `Bearer ${resetToken}`
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
      const token = verifiedToken || sessionStorage.getItem("ANT_VerifiedToken");
      const config = { skipGlobalToast: true };
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`
        };
      }
      const res = await api.post("/api/reset-password", {
        newPassword,
        confirmPassword
      }, config);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  return { user, token, refreshToken, isAuthenticated, login, fetchProfile, refreshAccessToken, logout, forgotPassword, verifyAccount, resetPassword };
});
