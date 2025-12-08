import { useEffect, useState } from "react";
import { getUserById, updateUser } from "../services/UserService";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2"; // [NEW] Import SweetAlert

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State to track if user has permission
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper to check Role from Token
  const checkAdminRole = () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === "ADMIN";
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    // 1. Security Check
    if (!checkAdminRole()) {
      setError("⛔ Access Denied: You must be an ADMIN to view this page.");
      setIsAdmin(false);
      return; 
    }

    setIsAdmin(true);

    // 2. Fetch Data if Admin
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(id);
        const user = response.data;
        setName(user.name);
        setEmail(user.email);
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = { name, email };
      if (password.trim()) {
        userData.password = password;
      }
      await updateUser(id, userData);
      
      // [UPDATED] Pretty Success Alert
      await Swal.fire({
        title: 'Success!',
        text: 'User updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate("/"); 
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setError("⛔ Access Denied: Only Admins can edit users.");
        Swal.fire('Error', 'Access Denied: Only Admins can edit users.', 'error');
      } else {
        const msg = err.message || "Failed to update user";
        setError(msg);
        Swal.fire('Error', msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // If not admin, show error screen
  if (error && !isAdmin) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="card" style={{ borderColor: "var(--danger)" }}>
            <h2 style={{ color: "var(--danger)" }}>Access Denied</h2>
            <p>{error}</p>
            <button 
                className="btn"
                onClick={() => navigate("/")}
                style={{ marginTop: "20px", background: "#6b7280", color: "white" }}
            >
            Go Back
            </button>
        </div>
      </div>
    );
  }

  if (loading && !name) return <p style={{textAlign: "center", marginTop: "50px", color: "white"}}>Loading user data...</p>;

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>✏️ Edit User</h2>

        {error && <p style={{ color: "var(--danger)", textAlign: "center", fontWeight: "bold" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Name</label>
            <input
                className="search-box" // Reusing the modern input style
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box" }}
            />
            </div>

            <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Email</label>
            <input
                className="search-box"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box" }}
            />
            </div>

            <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>New Password <span style={{fontWeight:400, color:"#666"}}>(Optional)</span></label>
            <input
                className="search-box"
                type="password"
                value={password}
                placeholder="Leave blank to keep current password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box" }}
            />
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <button 
                type="submit" 
                className="btn"
                disabled={loading}
                style={{ flex: 1, justifyContent: "center", background: "var(--success)", color: "white" }}
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
            
            <button 
                type="button" 
                className="btn"
                onClick={() => navigate("/")}
                style={{ flex: 1, justifyContent: "center", background: "#6b7280", color: "white" }}
            >
                Cancel
            </button>
            </div>

        </form>
      </div>
    </div>
  );
}

export default UserEdit;