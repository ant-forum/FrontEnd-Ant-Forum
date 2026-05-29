import axios from "axios";
import { useToast } from "../composables/useToast.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Synchronously attach token from storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ANT_Token") || sessionStorage.getItem("ANT_Token");
  
  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
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
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    const toast = useToast();

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
