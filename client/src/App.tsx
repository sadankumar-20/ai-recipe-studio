import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Workspace from "./pages/Workspace";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { fetchCurrentUser } from "./services/auth.service";

export default function App() {
  const { token, logout } = useAuthStore();

  // The backend keeps sessions in memory (no database), so a token that
  // survived a server restart needs to be checked, not just trusted.
  useEffect(() => {
    if (!token) return;
    fetchCurrentUser(token).then((user) => {
      if (!user) logout();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
