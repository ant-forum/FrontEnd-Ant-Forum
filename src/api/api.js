import axios from "axios";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Setup global response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const toast = useToast(); // called at runtime — safe after app is mounted
    if (error.response) {
      const { data } = error.response;
      const message = data?.message || "An error occurred with the response.";
      toast.error(message);
    } else if (error.request) {
      toast.error("Network Error. Please check your connection.");
    } else {
      toast.error(error.message || "An error occurred.");
    }
    return Promise.reject(error);
  },
);

export default api;
