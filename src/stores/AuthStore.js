import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import api from "@/api/api";
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

  const setUser = (newUser) => {
    user.value = newUser;
  };

  const login = async (payloads) => {
    try {
      const { email, password, remember = false } = payloads;
      const res = await api.post("/auth/login", { email, password }, { skipGlobalToast: true });
      console.log(res.data);
      if (res.data && res.data.data && res.data.data.token) {
        const data = res.data.data;
        const accToken = data.token;
        const refToken = data.refresh_token || data.refreshToken;
        // Strip out tokens from user profile object to avoid cluttering
        const { token, refresh_token, refreshToken, ...userObj } = data;

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

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error("No refresh token available");
      }

      console.log("[AuthStore] Attempting token refresh via /auth/refresh...");
      const res = await api.post("/auth/refresh", {
        refresh_token: refreshToken.value,
        refreshToken: refreshToken.value,
      });

      if (res.data && res.data.data && res.data.data.token) {
        const { token: accToken, refresh_token: refToken, refreshToken: refTokenCamel } = res.data.data;
        setToken(accToken, refToken || refTokenCamel || refreshToken.value);
        console.log("[AuthStore] Token refreshed successfully via /auth/refresh");
        return accToken;
      }
    } catch (err) {
      console.warn("[AuthStore] Token refresh via /auth/refresh failed, trying /auth/refresh-token...", err.message);
      try {
        const res = await api.post("/auth/refresh-token", {
          refresh_token: refreshToken.value,
          refreshToken: refreshToken.value,
        });

        if (res.data && res.data.data && res.data.data.token) {
          const { token: accToken, refresh_token: refToken, refreshToken: refTokenCamel } = res.data.data;
          setToken(accToken, refToken || refTokenCamel || refreshToken.value);
          console.log("[AuthStore] Token refreshed successfully via /auth/refresh-token");
          return accToken;
        }
      } catch (err2) {
        console.error("[AuthStore] Token refresh failed completely. Logging out...", err2.message);
        logout();
        throw err2;
      }
    }
  };

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
