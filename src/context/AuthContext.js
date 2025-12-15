import { createContext, useContext, useState, useEffect } from "react";

// Create the Context
const AuthContext = createContext(null);

// Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for existing token on app load
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        // Decode the JWT Payload (Base64 decode the middle part)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Set User State
        setUser({ 
            email: payload.sub, 
            role: payload.role, 
            picture: payload.picture, // If you added this to JWT claims
            token: token 
        });
      } catch (e) {
        console.error("Invalid token found, clearing...");
        localStorage.removeItem("jwt_token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // 2. Global Login Function
  const login = (token) => {
    localStorage.setItem("jwt_token", token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({ 
        email: payload.sub, 
        role: payload.role, 
        token: token 
    });
  };

  // 3. Global Logout Function
  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUser(null);
    // Optional: Redirect to home or refresh
    window.location.href = "/"; 
  };

  // 4. Helper: Check if Admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => useContext(AuthContext);