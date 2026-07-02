import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/api/api.js";

const ensureSuccess = (response) => {
  if (response.data && response.data.result === false) {
    throw new Error(response.data.message ?? "User request failed.");
  }
};

const getResponseData = (response) => response.data?.data ?? response.data;

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const user = ref(null);
  const isLoading = ref(false);
  const isListLoading = ref(false);

  const updateUserInState = (id, changes) => {
    const index = users.value.findIndex(
      (existingUser) =>
        String(existingUser.id ?? existingUser._id) === String(id),
    );

    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...changes,
      };
    }

    if (String(user.value?.id ?? user.value?._id) === String(id)) {
      user.value = {
        ...user.value,
        ...changes,
      };
    }
  };

  const createUser = async (payload) => {
    try {
      isLoading.value = true;
      const response = await api.post("/auth/createUsers", {
        username: payload.username,
        fullname: payload.fullname,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        gender: payload.gender,
      });
      ensureSuccess(response);

      const createdUser = getResponseData(response) || {};
      users.value.push({
        ...createdUser,
        username: payload.username,
        fullname: payload.fullname,
        email: payload.email,
        role: payload.role,
        gender: payload.gender,
        status: createdUser.status || "pending",
        created_at:
          createdUser.created_at ||
          createdUser.createdAt ||
          new Date().toISOString(),
      });

      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  // Admin Get All Users (Real API Endpoint)
  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) isListLoading.value = true;
      const response = await api.get("/api/admin/users", {
        skipGlobalToast: true,
      });
      ensureSuccess(response);
      users.value = getResponseData(response) || [];
      return users.value;
    } finally {
      if (!silent) isListLoading.value = false;
    }
  };

  const fetchUserById = async (id) => {
    try {
      isLoading.value = true;
      const response = await api.get(`/api/admin/users/${id}`);
      ensureSuccess(response);
      user.value = getResponseData(response);
      return user.value;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUser = async (id, payload) => {
    try {
      isLoading.value = true;
      const response = await api.patch(`/api/admin/users/${id}`, payload);
      ensureSuccess(response);
      updateUserInState(id, payload);
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const setUserStatus = async (id, status) => {
    try {
      isLoading.value = true;
      const response = await api.patch(`/api/admin/users/${id}/status`, {
        status,
      });
      ensureSuccess(response);
      const responseData = getResponseData(response);
      updateUserInState(id, {
        status: responseData?.status || status,
      });
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
    setUserStatus,
  };
});
