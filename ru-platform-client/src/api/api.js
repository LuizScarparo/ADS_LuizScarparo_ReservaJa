import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(config => {
  let token = localStorage.getItem("token");
  if (!token) {
    try {
      const saved = localStorage.getItem("user");
      token = saved ? JSON.parse(saved).token : undefined;
    } catch { }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;