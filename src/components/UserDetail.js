import { useEffect, useState } from "react";
import { getUserById } from "../services/UserService";
import { useParams } from "react-router-dom";

function UserDetail() {
  const { id } = useParams(); // get user id from route
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);

      setUser(response.data); // ApiResponse.data
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Details</h2>

      {user && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Created At:</strong> {user.createdAt}</p>
          <p><strong>Updated At:</strong> {user.updatedAt}</p>
        </div>
      )}
    </div>
  );
}

export default UserDetail;
