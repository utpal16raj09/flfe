import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserEdit from "./components/UserEdit";
import GoogleCallback from "./pages/GoogleCallback"; 
import AdminDashboard from "./components/AdminDashboard"; // [NEW] Import Dashboard
import "./App.css";

// 1. Component to Protect Routes (Redirects to Home if not logged in)
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

// 2. Component for Admin Only Routes
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  return user && isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/oauth/callback" element={<GoogleCallback />} />
          
          {/* Main Dashboard (Handling login state inside component) */}
          <Route path="/" element={<UserList />} />
          
          {/* Protected Routes */}
          <Route path="/users/:id" element={
            <PrivateRoute>
              <UserDetail />
            </PrivateRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/users/:id/edit" element={
            <AdminRoute>
              <UserEdit />
            </AdminRoute>
          } />

          {/* [NEW] Admin Analytics Dashboard */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;