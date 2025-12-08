import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import GoogleCallback from "./pages/GoogleCallback"; // ensure file is in src/pages
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<UserList />} />
        
        {/* Detail Page */}
        <Route path="/users/:id" element={<UserDetail />} />

        {/* CRITICAL CHANGE: 
           This path MUST match what we put in OAuthController.java 
           (response.sendRedirect(frontendUrl + "/oauth/callback?token=..."))
        */}
        <Route path="/oauth/callback" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;