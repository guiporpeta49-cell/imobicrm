import axios from "axios";

function removeTrailingSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getRuntimeApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return removeTrailingSlash(envUrl);

  const { protocol, hostname, origin, port } = window.location;

  if (isLocalHost(hostname) && port === "5173") {
    return "http://127.0.0.1:8000";
  }

  return removeTrailingSlash(origin);
}

export const API_BASE_URL = getRuntimeApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const isSuperAdminRoute = window.location.pathname.startsWith("/super-admin");
  const token = isSuperAdminRoute
    ? localStorage.getItem("super_admin_token")
    : localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function buildFileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export default api;
