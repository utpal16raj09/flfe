import { useEffect, useState } from "react";
import { getUsers, searchUsers, deleteUser } from "../services/UserService";
import { useNavigate } from "react-router-dom";

// [NEW] Import SweetAlert2
import Swal from "sweetalert2";
// [NEW] Import Icons
import { FaEdit, FaTrash, FaGoogle, FaUserShield, FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";

function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
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
    Swal.fire({
      title: 'Logging out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("jwt_token");
        setIsLoggedIn(false);
        setUsers([]);
        window.location.reload();
      }
    });
  };

  // ... (Keep fetchUsers, loadData, and handleSearch logic exactly the same as before) ...
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
       // Silent error or small toast
       console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = () => loadData("", page, sortField);

  useEffect(() => {
    if (!isLoggedIn) return;
    const delayDebounceFn = setTimeout(() => {
      setPage(0);
      loadData(search, 0, sortField);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (isLoggedIn) loadData(search, page, sortField);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortField]);


  // [NEW] Modern Delete with SweetAlert
  const handleDelete = async (e, userId) => {
    e.stopPropagation();

    // Pretty Confirmation Modal
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
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        loadData(search, page, sortField);
      } catch (err) {
        if (err.status === 403) {
           Swal.fire('Access Denied', 'You need ADMIN privileges to delete.', 'error');
        } else {
           Swal.fire('Error', 'Failed to delete user.', 'error');
        }
      }
    }
  };

  return (
    <div className="container">
      
      {/* 1. LOGIN SCREEN (If not logged in) */}
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

      {/* 2. DASHBOARD (If logged in) */}
      {isLoggedIn && (
        <div className="card">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h2>Dashboard</h2>
                    <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>Manage your users efficiently</span>
                </div>
                
                <div style={{ display: "flex", gap: "10px" }}>
                     <button className="btn btn-danger" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Controls */}
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

            {/* Modern Table */}
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
                    {users.map((user) => (
                        <tr key={user.id} onClick={() => navigate(`/users/${user.id}`)} style={{ cursor: "pointer" }}>
                        <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {user.picture ? (
                                    <img src={user.picture} alt="avatar" className="avatar-img" />
                                ) : (
                                    <div className="avatar-img" style={{ background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <FaUser color="#666" />
                                    </div>
                                )}
                                <span style={{ fontWeight: "600" }}>{user.name}</span>
                            </div>
                        </td>
                        <td>
                            {/* Dummy Badge logic based on ID for now, or map real role if available */}
                            <span style={{ 
                                background: "#e0e7ff", color: "#4338ca", 
                                padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold" 
                            }}>
                                USER
                            </span>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.createdAt}</td>
                        <td style={{ textAlign: "center" }}>
                            <button
                                className="btn btn-warning"
                                onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}/edit`); }}
                                style={{ padding: "8px", marginRight: "8px" }}
                            >
                                <FaEdit />
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={(e) => handleDelete(e, user.id)}
                                style={{ padding: "8px" }}
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

            {/* Pagination (Simple styling) */}
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