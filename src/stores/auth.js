import { defineStore } from "pinia";
import api from "../api/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user")) || null,
    token: localStorage.getItem("auth_token") || null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token,
  },

  actions: {
    setAuth(userData, token) {
      this.user = userData;
      this.token = token;
      localStorage.setItem("auth_user", JSON.stringify(userData));
      if (token) localStorage.setItem("auth_token", token);
      
      // Optionally configure axios headers here if not handled in api.js
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", credentials);
        this.setAuth(res.data.user, res.data.token);
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Login failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/register", userData);
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Registration failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error", error);
      } finally {
        this.clearAuth();
        this.loading = false;
      }
    },

    async verifyAccount(code) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/verify", { code });
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Verification failed";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async forgotPassword(email) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/forgot-password", { email });
        return res.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Failed to send reset email";
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
});
