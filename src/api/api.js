import axios from "axios";
import { useToast } from "../composables/useToast.js";
import {
  getStoredAccessToken,
  getStoredRefreshToken,
} from "../utils/authStorage.js";

let refreshAccessTokenHandler = null;
let refreshRequest = null;

export const AUTH_MODES = Object.freeze({
  ACCESS: "access",
  REFRESH: "refresh",
  RECOVERY: "recovery",
  NONE: "none",
});

export const setAuthRefreshHandler = (handler) => {
  refreshAccessTokenHandler = handler;
};

const getAuthMode = (config) => config?.authMode || AUTH_MODES.ACCESS;

const getErrorMessage = (error) =>
  (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.message ||
    ""
  )
    .toString()
    .toLowerCase();

export const isSessionInvalidError = (error) => {
  const status = error?.response?.status;
  const message = getErrorMessage(error);
  const isRefreshTokenEndpoint = error?.config?.url?.includes(
    "/auth/refresh-token",
  );

  return (
    status === 401 ||
    status === 403 ||
    (status === 400 && isRefreshTokenEndpoint) ||
    message.includes("invalid refresh token") ||
    message.includes("refresh token expired") ||
    message.includes("token is required") ||
    message.includes("invalid token or expired")
  );
};

const canRefreshRequest = (config) =>
  Boolean(
    config &&
    !config._retry &&
    getAuthMode(config) === AUTH_MODES.ACCESS &&
    getStoredRefreshToken() &&
    refreshAccessTokenHandler,
  );

const api = axios.create({
  baseURL: import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || "https://ant-forum.khei.work.gd"),
  headers: {
    Accept: "application/json",
  },
});

const hasAuthorizationHeader = (config) => {
  if (config.headers && typeof config.headers.has === "function") {
    return config.headers.has("Authorization");
  }

  return Boolean(
    config.headers?.Authorization || config.headers?.authorization,
  );
};

const setAuthorizationHeader = (config, token, overwrite = false) => {
  if (!token || (!overwrite && hasAuthorizationHeader(config))) return;

  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
};

const retryRequestWithFreshToken = async (originalRequest) => {
  originalRequest._retry = true;

  if (!refreshRequest) {
    refreshRequest = Promise.resolve(refreshAccessTokenHandler()).finally(
      () => {
        refreshRequest = null;
      },
    );
  }

  const token = await refreshRequest;
  if (!token) {
    throw new Error("Unable to refresh access token");
  }

  setAuthorizationHeader(originalRequest, token, true);
  return api(originalRequest);
};

// Request Interceptor: Attach token and handle Content-Type for FormData
api.interceptors.request.use((config) => {
  if (getAuthMode(config) === AUTH_MODES.REFRESH) {
    setAuthorizationHeader(config, getStoredRefreshToken());
  } else if (getAuthMode(config) === AUTH_MODES.ACCESS) {
    setAuthorizationHeader(config, getStoredAccessToken());
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

        if (canRefreshRequest(response.config)) {
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
      error.response?.status === 401 && canRefreshRequest(originalRequest);

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
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.data?.message
        ?.toLowerCase()
        .includes("validation error") ||
      error.response?.data?.message?.toLowerCase().includes("user not found");

    if (!skipToast) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.message ||
        "An error occurred.";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
