import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000,
});

// ADD THIS INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // 1. Check if token exists in LocalStorage
    const token = localStorage.getItem("jwt_token");

    // 2. If it exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;