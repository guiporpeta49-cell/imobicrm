import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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



export default api;
