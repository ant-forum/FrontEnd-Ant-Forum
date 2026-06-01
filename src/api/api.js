import axios from "axios";
import { useToast } from "../composables/useToast.js";

let refreshAccessTokenHandler = null;
let refreshRequest = null;

export const setAuthRefreshHandler = (handler) => {
  refreshAccessTokenHandler = handler;
};

const getStoredRefreshToken = () =>
  localStorage.getItem("ANT_RefreshToken") ||
  sessionStorage.getItem("ANT_RefreshToken");

const isRefreshRequest = (config) =>
  config?.url?.includes("/auth/refresh");

const isLoginRequest = (config) =>
  config?.url?.includes("/auth/login");

const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

const retryRequestWithFreshToken = async (originalRequest) => {
  originalRequest._retry = true;

  if (!refreshRequest) {
    refreshRequest = Promise.resolve(refreshAccessTokenHandler()).finally(() => {
      refreshRequest = null;
    });
  }

  const token = await refreshRequest;
  if (!token) {
    throw new Error("Unable to refresh access token");
  }

  if (originalRequest.headers && typeof originalRequest.headers.set === "function") {
    originalRequest.headers.set("Authorization", `Bearer ${token}`);
  } else {
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers["Authorization"] = `Bearer ${token}`;
  }

  return api(originalRequest);
};

// Request Interceptor: Attach token and handle Content-Type for FormData
api.interceptors.request.use((config) => {
  const token = isRefreshRequest(config)
    ? getStoredRefreshToken()
    : localStorage.getItem("ANT_Token") || sessionStorage.getItem("ANT_Token");
  
  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // When sending FormData, let the browser/axios auto-set Content-Type
  // with the correct multipart boundary. Otherwise default to JSON.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response Interceptor: Manage errors and show toasts when needed
api.interceptors.response.use(
  (response) => {
    // Treat explicit 200 OK authentication failures as errors
    const data = response.data;
    if (data && data.result === false) {
      const msgStr = (data.message || data.msg || "").toString().toLowerCase();
      const isAuthError = 
        msgStr.includes("login") || 
        msgStr.includes("token") || 
        msgStr.includes("jwt") || 
        msgStr.includes("unauthorized") || 
        msgStr.includes("expired");

      if (isAuthError) {
        const error = new Error(data.message || data.msg || "Unauthorized");
        error.response = response;
        error.config = response.config;

        if (
          !response.config._retry &&
          !isRefreshRequest(response.config) &&
          !isLoginRequest(response.config) &&
          getStoredRefreshToken() &&
          refreshAccessTokenHandler
        ) {
          return retryRequestWithFreshToken(response.config);
        }

        return Promise.reject(error);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const toast = useToast();
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest) &&
      !isLoginRequest(originalRequest) &&
      getStoredRefreshToken() &&
      refreshAccessTokenHandler;

    if (shouldRefresh) {
      try {
        return await retryRequestWithFreshToken(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Skip showing generic toasts for internal auth requests or explicit skips
    const isProfileRequest = originalRequest?.url?.includes("/api/get/profile");
    const skipToast = 
      originalRequest?.skipGlobalToast || 
      isProfileRequest ||
      error.response?.data?.message?.toLowerCase().includes("validation error") ||
      error.response?.data?.message?.toLowerCase().includes("user not found");

    if (!skipToast) {
      const message = error.response?.data?.message || error.response?.data?.msg || error.message || "An error occurred.";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
