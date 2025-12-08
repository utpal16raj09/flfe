import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserEdit from "./components/UserEdit"; // [NEW] Import
import GoogleCallback from "./pages/GoogleCallback"; 
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        
        {/* [NEW] Edit Route */}
        <Route path="/users/:id/edit" element={<UserEdit />} />

        <Route path="/oauth/callback" element={<GoogleCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;