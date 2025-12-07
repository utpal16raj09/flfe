import { useEffect, useState } from "react";
import { getUsers, searchUsers } from "../services/UserService";
import { useNavigate } from "react-router-dom";

function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");

  const navigate = useNavigate();

  const fetchUsers = async (pageNumber = page) => {
    try {
      setLoading(true);
      const response = await getUsers(pageNumber, 5, sortField);

      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setPage(response.data.number);
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
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

  useEffect(() => {
    fetchUsers();
  }, [page, sortField]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button
  onClick={() => {
    window.location.href = "http://localhost:8080/auth/login/google";
  }}
  style={{
    padding: "10px 20px",
    backgroundColor: "#4285F4",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  Sign in with Google
</button>

      <h2>User List</h2>

      {/* ================= GOOGLE LOGIN BUTTON ================= */}
      <button
        onClick={() => {
          window.location.href = "http://localhost:8080/auth/login/google";
        }}
        style={{
          padding: "10px 20px",
          background: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        Sign in with Google
      </button>
      {/* ======================================================== */}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
        />

        <button onClick={handleSearch} style={{ padding: "8px 12px" }}>
          Search
        </button>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="id">Sort by ID</option>
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="createdAt">Sort by Created Date</option>
        </select>
      </div>

      {/* Table */}
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", marginTop: "10px" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "20px" }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UserList;
