import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the token from the URL (e.g., ?token=eyJ...)
    const token = searchParams.get("token");

    if (token) {
      console.log("✅ OAuth Success! Token received:", token);

      // 2. Save token to LocalStorage
      localStorage.setItem("jwt_token", token);

      // 3. Redirect user to the Home Page (or Dashboard)
      navigate("/");
    } else {
      console.error("❌ No token found in URL");
      navigate("/");
    }
  }, [navigate, searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🔄 Logging you in...</h2>
      <p>Please wait while we verify your Google account.</p>
    </div>
  );
}

export default GoogleCallback;