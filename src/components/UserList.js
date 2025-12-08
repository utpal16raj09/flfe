import { useEffect, useState } from "react";
import { getUsers, searchUsers, deleteUser } from "../services/UserService";
import { useNavigate } from "react-router-dom";

function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUsers();
    } else {
      setIsLoggedIn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setIsLoggedIn(false);
    setUsers([]);
    window.location.reload();
  };

  const fetchUsers = async (pageNumber = page) => {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers(pageNumber, 5, sortField);

      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Session expired or invalid. Please login again.");
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchUsers(0);
      return;
    }

    try {
      setLoading(true);
      const response = await searchUsers(search);
      setUsers(response.data.content);
      setPage(0);
      setTotalPages(1);
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Logic
  const handleDelete = async (e, userId) => {
    e.stopPropagation(); // Stop row click event

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      alert("User deleted successfully!");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Delete failed:", err);
      // Show specific error if it's a 403 Forbidden
      if (err.status === 403) {
        alert("⛔ Access Denied: You need ADMIN privileges to delete users.");
      } else {
        alert("Failed to delete user: " + (err.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField]);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>User Management Dashboard</h2>
        
        {isLoggedIn ? (
           <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Login Status Badge */}
              <span style={{ 
                  padding: "6px 10px", 
                  borderRadius: "20px", 
                  background: "#d4edda", 
                  color: "#155724",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  border: "1px solid #c3e6cb"
              }}>
                ✅ Logged In
              </span>
              <button 
                onClick={handleLogout}
                style={{ padding: "8px 16px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Logout
              </button>
           </div>
        ) : (
          /* DUAL LOGIN BUTTONS (For Testing Roles) */
          <div style={{ display: "flex", gap: "10px" }}>
            
            {/* 1. NORMAL USER LOGIN */}
            <button
              onClick={() => window.location.href = "http://localhost:8080/auth/login/google"}
              style={{ 
                padding: "10px 20px", 
                background: "#4285F4", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer", 
                fontWeight: "bold" 
              }}
            >
              Login as User
            </button>

            {/* 2. ADMIN LOGIN */}
            <button
              onClick={() => window.location.href = "http://localhost:8080/auth/login/google/admin"}
              style={{ 
                padding: "10px 20px", 
                background: "#2c3e50", // Darker color for Admin
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer", 
                fontWeight: "bold" 
              }}
            >
              Login as Admin
            </button>
          </div>
        )}
      </div>

      {error && <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>{error}</p>}
      {loading && <p style={{ textAlign: "center" }}>Loading users...</p>}

      {!isLoggedIn && !loading && (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
          <p>Please sign in to access the user database.</p>
        </div>
      )}

      {isLoggedIn && !loading && users.length > 0 && (
        <>
          {/* Controls */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "space-between" }}>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px", width: "200px" }}
            />
            <button onClick={handleSearch} style={{ padding: "8px 12px" }}>Search</button>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ padding: "8px" }}>
              <option value="id">Sort by ID</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="createdAt">Sort by Created Date</option>
            </select>
          </div>

          {/* Table */}
          <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th>Avatar</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/users/${user.id}`)}>
                  {/* Avatar Column */}
                  <td style={{ textAlign: "center" }}>
                      {user.picture ? (
                        <img 
                            src={user.picture} 
                            alt="avatar" 
                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                        />
                      ) : (
                        <span style={{ fontSize: "24px" }}>👤</span>
                      )}
                  </td>
                  
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.createdAt}</td>
                  
                  {/* Delete Button */}
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={(e) => handleDelete(e, user.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
            <span style={{ margin: "0 10px" }}>Page {page + 1} of {totalPages}</span>
            <button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserList;