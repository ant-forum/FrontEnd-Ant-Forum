import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("auth_user")) || null);
  const token = ref(localStorage.getItem("auth_token") || null);
  const loading = ref(false);
  const error = ref(null);

  const isLoggedIn = computed(() => !!user.value && !!token.value);
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const setAuth = (userData, newToken) => {
    user.value = userData;
    token.value = newToken;
    localStorage.setItem("auth_user", JSON.stringify(userData));
    if (newToken) {
      localStorage.setItem("auth_token", newToken);
    }
  };

  const clearAuth = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/login", credentials);
      setAuth(res.data.user, res.data.token);
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/register", userData);
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuth();
      loading.value = false;
    }
  };

  const verifyAccount = async (code) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/verify", { code });
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Verification failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (email) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to send reset email";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isAuthenticated,
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    verifyAccount,
    forgotPassword,
  };
});
