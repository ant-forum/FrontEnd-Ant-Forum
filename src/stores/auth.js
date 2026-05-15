import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user")) || null,
    token: localStorage.getItem("auth_token") || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    login(userData, token = null) {
      this.user = userData;
      this.token = token;
      localStorage.setItem("auth_user", JSON.stringify(userData));
      if (token) localStorage.setItem("auth_token", token);
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    },
  },
});
