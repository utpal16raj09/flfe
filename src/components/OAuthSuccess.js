import { useEffect, useState } from "react";

function OAuthSuccess() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/auth/google/profile", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => setError("Failed to load profile"));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Google Login Successful 🎉</h2>
      <img
        src={profile.picture}
        alt="profile"
        style={{ width: "80px", borderRadius: "50%" }}
      />
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Google ID:</strong> {profile.googleId}</p>
    </div>
  );
}

export default OAuthSuccess;
