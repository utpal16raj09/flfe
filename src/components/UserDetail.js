import { useEffect, useState } from "react";
import { getUserById } from "../services/UserService";
import { useParams, useNavigate } from "react-router-dom";

function UserDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUser(response.data); 
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p style={{textAlign: "center"}}>Loading user details...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", background: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "20px", padding: "8px 12px", cursor: "pointer" }}>
        ← Back to List
      </button>

      <h2>User Details</h2>

      {user && (
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
          
          {/* [NEW] Large Profile Picture */}
          {user.picture ? (
             <img 
                src={user.picture} 
                alt="Profile" 
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid #eef1f6" }} 
             />
          ) : (
             <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "50px" }}>
                 👤
             </div>
          )}

          <div style={{ width: "100%", textAlign: "left" }}>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created At:</strong> {user.createdAt}</p>
            <p><strong>Updated At:</strong> {user.updatedAt}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetail;