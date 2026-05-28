import axios from "axios";
import { useToast } from "../composables/useToast.js";
import { useAuthStore } from "../stores/AuthStore.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  // Do not attach expired token on refresh requests
  const isRefreshRequest = config.url?.includes("/auth/refresh") || config.url?.includes("/auth/refresh-token");
  if (authStore.token && !isRefreshRequest) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Setup global response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle 200 OK responses that actually represent token expiration or invalidity
    const data = response.data;
    if (
      data &&
      data.result === false &&
      data.message === "Invalid token or expired"
    ) {
      console.warn("[API Interceptor] Detected token error body in 200 OK response. Routing to refresh logic...");
      const tokenError = new Error(data.message || "Invalid token or expired");
      tokenError.response = response;
      tokenError.config = response.config;
      return Promise.reject(tokenError);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();
    const toast = useToast(); // called at runtime — safe after app is mounted

    // Handle token refresh on 401 Unauthorized or explicit token expiration errors
    const errorMessage = (error.response?.data?.message || error.response?.data?.error || "").toString().toLowerCase();
    const isTokenError = 
      error.response?.status === 401 || 
      errorMessage.includes("invalid token") || 
      errorMessage.includes("token expired") || 
      errorMessage.includes("jwt expired") || 
      errorMessage.includes("jwt malformed") ||
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("expired token");

    // Do not attempt refresh if the failed request was a refresh request itself
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/refresh-token");

    // Ensure we don't end up in an infinite loop of refreshes
    if (isTokenError && !originalRequest._retry && authStore.refreshToken && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API Interceptor] Token expired or invalid. Attempting silent refresh...");
        const newToken = await authStore.refreshAccessToken();
        isRefreshing = false;
        processQueue(null, newToken);

        // Retry original request with the fresh token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        toast.error("Session expired. Please log in again.");
        return Promise.reject(error);
      }
    }

    if (error.response) {
      const { data } = error.response;
      const message = data?.message || "An error occurred with the response.";
      if (
        !isTokenError &&
        message !== "Validation error" &&
        message !== "Email not found" &&
        message !== "Invalid password"
      ) {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network Error. Please check your connection.");
    } else {
      toast.error(error.message || "An error occurred.");
    }
    return Promise.reject(error);
  },
);

export default api;
