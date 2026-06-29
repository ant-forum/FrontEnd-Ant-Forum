const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const BACKEND_MEDIA_PREFIXES = ["/uploads/"];

const apiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "https://ant-forum.khei.work.gd").replace(/\/+$/, "");

const isBackendMediaPath = (path) =>
  BACKEND_MEDIA_PREFIXES.some(
    (prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix),
  );

const stripPublicPrefix = (path) => {
  if (path.includes("/public/")) return path.replace("/public/", "/");
  if (path.startsWith("public/")) return path.replace("public/", "");
  return path;
};

const withApiBase = (path) => {
  const base = apiBaseUrl();
  if (!base || import.meta.env.DEV) return path;
  return `${base}${path}`;
};

export const resolveMediaUrl = (value, fallback = null) => {
  if (!value || typeof value !== "string") return fallback;

  let path = value.trim();
  if (!path) return fallback;

  if (path.startsWith("data:") || path.startsWith("blob:")) return path;

  try {
    const parsed = new window.URL(path);
    const isLocalUpload =
      LOCAL_HOSTS.has(parsed.hostname) && isBackendMediaPath(parsed.pathname);

    if (!isLocalUpload) {
      return path;
    }

    path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Not an absolute URL; normalize below.
  }

  path = stripPublicPrefix(path);

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (isBackendMediaPath(path)) {
    return withApiBase(path);
  }

  return path;
};
