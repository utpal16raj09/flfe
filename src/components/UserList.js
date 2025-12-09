import { useEffect, useState } from "react";
import { getUsers, searchUsers, deleteUser } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaGoogle, FaUserShield, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { toast } from 'react-toastify'; // [NEW] Import Toast

// Import the Hook
import { useAuth } from "../context/AuthContext";

function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");

  const navigate = useNavigate();

  // Get Global State
  const { user, logout, isAdmin } = useAuth();
  const isLoggedIn = !!user;

  const loadData = async (query, pageNum, sort) => {
    setLoading(true);
    try {
      let response;
      if (query.trim()) response = await searchUsers(query, pageNum, 5);
      else response = await getUsers(pageNum, 5, sort);

      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users"); // [NEW] Toast on load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      loadData(search, 0, sortField);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) loadData(search, page, sortField);
  }, [page, sortField, isLoggedIn]);


  const handleLogout = () => {
    Swal.fire({
      title: 'Logging out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const handleDelete = async (e, userId) => {
    e.stopPropagation();

    if (!isAdmin) {
      Swal.fire('Access Denied', 'You need ADMIN privileges to delete.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        // [UPDATED] Use Toast for success (Faster UX)
        toast.success("User deleted successfully");
        loadData(search, page, sortField);
      } catch (err) {
        // [UPDATED] Use Toast for error
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="container">
      {/* 1. LOGIN SCREEN */}
      {!isLoggedIn && (
        <div className="card login-screen">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚀 Flagship App</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Secure User Management Dashboard</p>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              className="btn btn-google"
              onClick={() => window.location.href = "http://localhost:8080/auth/login/google"}
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              <FaGoogle color="#DB4437" /> Login as User
            </button>

            <button
              className="btn"
              onClick={() => window.location.href = "http://localhost:8080/auth/login/google/admin"}
              style={{ background: "#2c3e50", color: "white", padding: "12px 24px", fontSize: "1rem" }}
            >
              <FaUserShield /> Login as Admin
            </button>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD */}
      {isLoggedIn && (
        <div className="card">
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <div>
              <h2>Dashboard</h2>
              <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Welcome, <strong>{user.email}</strong>
                {isAdmin && <span style={{ marginLeft: "8px", color: "var(--primary)", fontWeight: "bold" }}>(ADMIN)</span>}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* Admin Stats Button */}
              {isAdmin && (
                <button
                  className="btn"
                  onClick={() => navigate("/admin/dashboard")}
                  style={{ background: "var(--primary)", color: "white", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  📊 Stats
                </button>
              )}

              <button className="btn btn-danger" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "14px", color: "#9ca3af" }} />
              <input
                className="search-box"
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
            </div>

            <select
              className="search-box"
              style={{ width: "auto" }}
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="id">Sort by ID</option>
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Date</option>
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "20px" }}>Loading data...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Date Joined</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} onClick={() => navigate(`/users/${u.id}`)} style={{ cursor: "pointer" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {u.picture ? (
                            <img src={u.picture} alt="avatar" className="avatar-img" />
                          ) : (
                            <div className="avatar-img" style={{ background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FaUser color="#666" />
                            </div>
                          )}
                          <span style={{ fontWeight: "600" }}>{u.name}</span>
                        </div>
                      </td>
                      <td>
                        {/* Logic to determine role badge */}
                        <span style={{
                          background: "#e0e7ff", color: "#4338ca",
                          padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold"
                        }}>
                          USER
                        </span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.createdAt}</td>
                      <td style={{ textAlign: "center" }}>
                        {/* Edit Button */}
                        <button
                          className="btn btn-warning"
                          onClick={(e) => { e.stopPropagation(); navigate(`/users/${u.id}/edit`); }}
                          style={{ padding: "8px", marginRight: "8px" }}
                        >
                          <FaEdit />
                        </button>

                        {/* Delete Button */}
                        <button
                          className={`btn ${isAdmin ? 'btn-danger' : 'btn-google'}`}
                          onClick={(e) => handleDelete(e, u.id)}
                          style={{ padding: "8px", cursor: isAdmin ? "pointer" : "not-allowed", opacity: isAdmin ? 1 : 0.5 }}
                          title={isAdmin ? "Delete User" : "Admin Only"}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)} style={{ background: "#e5e7eb" }}>Previous</button>
            <span style={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>Page {page + 1} of {totalPages}</span>
            <button className="btn" disabled={page === totalPages - 1} onClick={() => setPage(page + 1)} style={{ background: "#e5e7eb" }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;