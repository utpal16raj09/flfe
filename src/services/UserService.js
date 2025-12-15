import api from "./api";
import axios from "axios"; // [NEW] Needed for file upload handling

// Fetch paginated users
export const getUsers = async (page = 0, size = 10, sort = "id") => {
  try {
    const response = await api.get(
      `/users?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data; // ApiResponse<T>
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

// Fetch a single user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data; // ApiResponse<UserResponseDTO>
  } catch (error) {
    throw error.response?.data || { message: "User not found" };
  }
};

// Search users (no pagination)
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data; // ApiResponse<Page<User>>
  } catch (error) {
    throw error.response?.data || { message: "Search failed" };
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post(`/users`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create user" };
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update user" };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user" };
  }
};

// ... existing imports

// [NEW] Admin Stats
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data; // ApiResponse<DashboardStatsDTO>
};

// [NEW] File Upload Function
export const uploadFile = async (file) => {
  // We use direct axios call here to manually ensure Multipart headers are set correctly
  // and to avoid any JSON-enforcing interceptors in the main 'api' instance
  const token = localStorage.getItem("jwt_token");
  const FILE_API_URL = "http://localhost:8080/api/files"; 
  
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${FILE_API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}`
      },
    });
    return response.data; // Returns { success: true, data: { url: "..." } }
  } catch (error) {
    throw error.response?.data || { message: "File upload failed" };
  }
};