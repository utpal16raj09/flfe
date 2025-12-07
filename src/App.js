import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import GoogleCallback from "./pages/GoogleCallback";
import "./App.css";
import OAuthSuccess from "./components/OAuthSuccess";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />

        {/* This route handles Google OAuth redirect */}
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/oauth/success" element={<OAuthSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
