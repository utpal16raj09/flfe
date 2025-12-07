import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // correct base for YOUR backend
  timeout: 5000,
});

export default api;
