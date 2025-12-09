import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth(); // [IMPORTANT] Grab 'user' state too
  const processedRef = useRef(false);

  // 1. First Effect: Capture Token & Login
  useEffect(() => {
    if (processedRef.current) return; // Prevent double-run
    processedRef.current = true;

    const token = searchParams.get("token");
    if (token) {
      console.log("Token found, logging in...");
      login(token); // This updates the Context State
    } else {
      navigate("/"); // No token? Go home.
    }
  }, [searchParams, login, navigate]);

  // 2. Second Effect: Watch for 'user' state, THEN Redirect
  // This waits until the login is actually finished before moving you.
  useEffect(() => {
    if (user) {
      console.log("User logged in successfully! Redirecting...");
      // Small timeout to ensure browser storage is ready
      setTimeout(() => {
        navigate("/");
      }, 100);
    }
  }, [user, navigate]);

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
       <div className="card">
         <h2>🔄 Finalizing Login...</h2>
         <p>You are logged in! Redirecting you to the dashboard...</p>
       </div>
    </div>
  );
}

export default GoogleCallback;