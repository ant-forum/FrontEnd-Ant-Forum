import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api.js";

const ensureSuccess = (response) => {
  if (response.data && response.data.result === false) {
    throw new Error(response.data.message ?? "User request failed.");
  }
};

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const user = ref(null);
  const isLoading = ref(false);
  const isListLoading = ref(false);

  // Real backend endpoint for creating users
  const createUser = async (payload) => {
    try {
      isLoading.value = true;
      const response = await api.post("/auth/createUsers", {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        gender: payload.gender,
      });
      ensureSuccess(response);
      console.log("response", response);

      // Save created user in-memory so they show up in the table instantly!
      const newUserObj = {
        id:
          response.data.data?.id ||
          response.data.data?._id ||
          String(Date.now()),
        username: payload.username,
        email: payload.email,
        role: payload.role,
        gender: payload.gender,
        createdAt: new Date().toISOString(),
      };
      users.value.push(newUserObj);

      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  // Admin Get All Users (Real API Endpoint)
  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) isListLoading.value = true;
      const response = await api.get("/api/admin/gell-all-users");
      ensureSuccess(response);
      users.value = response.data.data || response.data;
      return users.value;
    } finally {
      isListLoading.value = false;
    }
  };

  const fetchUserById = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/admin/get-user/${id}`);
      ensureSuccess(response);
      user.value = response.data.data || response.data;
      return user.value;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUser = async (id, payload) => {
    try {
      isLoading.value = true;
      const response = await api.put(`/api/admin/update-user/${id}`, payload);
      ensureSuccess(response);
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteUser = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.delete(`/api/admin/delete-user/${id}`);
      ensureSuccess(response);
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    users,
    user,
    isLoading,
    isListLoading,
    createUser,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
  };
});
