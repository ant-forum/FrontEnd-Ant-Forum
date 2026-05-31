import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api";

export const useUsersStore = defineStore("users", () => {
  const isLoading = ref(false);

  const users = ref([]);
  const user = ref(null);

  /**
   * Admin Create User
   * @param {Object} payload 
   * @param {string} payload.username
   * @param {string} payload.email
   * @param {string} payload.password
   * @param {string} payload.role - 'user' or 'mentor'
   * @param {string} payload.gender - 'male' or 'female'
   */
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

      if (response.data && response.data.result === false) {
        throw new Error(response.data.message || "Failed to create user");
      }

      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Admin Get All Users
   */
  const fetchUsers = async () => {
    try {
      isLoading.value = true;
      const response = await api.get("/api/admin/gell-all-users");
      if (response.data && response.data.result === false) {
        throw new Error(response.data.message || "Failed to fetch users");
      }
      users.value = response.data.data || response.data;
      return users.value;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Admin Get User by ID
   */
  const fetchUserById = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/admin/get-user/${id}`);
      if (response.data && response.data.result === false) {
        throw new Error(response.data.message || "Failed to fetch user");
      }
      user.value = response.data.data || response.data;
      return user.value;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Admin Update User
   */
  const updateUser = async (id, payload) => {
    try {
      isLoading.value = true;
      const response = await api.put(`/api/admin/update-user/${id}`, payload);
      if (response.data && response.data.result === false) {
        throw new Error(response.data.message || "Failed to update user");
      }
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Admin Delete User
   */
  const deleteUser = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.delete(`/api/admin/delete-user/${id}`);
      if (response.data && response.data.result === false) {
        throw new Error(response.data.message || "Failed to delete user");
      }
      return response.data;
    } catch (err) {
      throw err.response?.data || err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    users,
    user,
    createUser,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
  };
});
