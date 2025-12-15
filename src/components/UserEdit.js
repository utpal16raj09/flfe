import { useEffect, useState } from "react";
import { getUserById, updateUser, uploadFile } from "../services/UserService"; 
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2"; 
import { FaCamera } from "react-icons/fa"; 

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  
  // Picture State
  const [picture, setPicture] = useState(""); 
  const [uploading, setUploading] = useState(false);

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
      const msg = "⛔ Access Denied: You must be an ADMIN to view this page.";
      setError(msg);
      setIsAdmin(false);
      
      // [NEW] Immediate Alert for Access Denied
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You do not have permission to edit users.',
        confirmButtonColor: '#d33'
      });
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
        setPicture(user.picture); // Load existing picture
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // Handle File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
        // Upload immediately to get the URL
        const response = await uploadFile(file);
        const fileUrl = response.data.url;
        setPicture(fileUrl); // Update Preview immediately
    } catch (error) {
        Swal.fire("Upload Failed", "Could not upload image", "error");
    } finally {
        setUploading(false);
    }
  };

  // [UPDATED] Submit Handler with Confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Ask for confirmation first
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: "Are you sure you want to update this user?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', // Blue confirm button
      cancelButtonColor: '#d33',     // Red cancel button
      confirmButtonText: 'Yes, update it!'
    });

    // 2. If user cancels, stop here
    if (!result.isConfirmed) return;

    // 3. Proceed with Update
    setError("");
    setLoading(true);

    try {
      const userData = { name, email, picture }; // Include picture in update
      if (password.trim()) {
        userData.password = password;
      }
      await updateUser(id, userData);
      
      // 4. Success Alert
      await Swal.fire({
        title: 'Updated!',
        text: 'User details have been saved successfully.',
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

        {/* Profile Picture Section */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
                <img 
                    src={picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="Profile" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #e2e8f0" }}
                />
                <label htmlFor="fileInput" style={{ 
                    position: "absolute", bottom: "0", right: "0", 
                    background: "var(--primary)", color: "white", 
                    borderRadius: "50%", width: "32px", height: "32px", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                    <FaCamera size={14} />
                </label>
                <input 
                    id="fileInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ display: "none" }} 
                />
            </div>
        </div>
        {uploading && <p style={{textAlign:"center", fontSize:"0.8rem", color:"#666", marginBottom:"15px"}}>Uploading...</p>}

        {error && <p style={{ color: "var(--danger)", textAlign: "center", fontWeight: "bold" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div>
            <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>Name</label>
            <input
                className="search-box"
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
                disabled={loading || uploading}
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