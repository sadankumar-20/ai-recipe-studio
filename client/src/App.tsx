import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { fetchCurrentUser } from "./services/auth.service";

// Route-level code splitting: each page becomes its own chunk, so the login
// screen doesn't pay for the whole workspace bundle on first paint.
const Landing = lazy(() => import("./pages/Landing"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Login = lazy(() => import("./pages/Login"));

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
    </div>
  );
}

export default function App() {
  const { token, logout } = useAuthStore();

  // Session tokens are signed and stateless, but they still expire — validate
  // once on load so a stale token sends the user back to login cleanly.
  useEffect(() => {
    if (!token) return;
    fetchCurrentUser(token).then((user) => {
      if (!user) logout();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
