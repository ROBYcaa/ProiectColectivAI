import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  // auth state
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);

  // backend health
  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  // ---------------- HEALTH CHECK (GET /) ----------------
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message || "Backend OK ✅"))
      .catch(() => setBackendMessage("Backend unreachable ❌"));
  }, []);

  // ---------------- AUTO-LOGIN (GET /auth/me) ----------------
  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // token invalid / expirat -> curățăm
          localStorage.removeItem("token");
          if (!cancelled) {
            setToken("");
            setMe(null);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) setMe(data); // { id, email }
      } catch {
        // eroare de rețea -> tratăm ca logout
        localStorage.removeItem("token");
        if (!cancelled) {
          setToken("");
          setMe(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ---------------- LOGOUT ----------------
  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  }

  // ---------------- GUARD COMPONENT ----------------
  function RequireAuth({ children }) {
    if (!token) return <Navigate to="/login" replace />;
    return children;
  }

  // ---------------- RENDER + ROUTES ----------------
  return (
    <Router>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !token ? (
              <LoginPage onLoginSuccess={(t) => setToken(t)} />
            ) : (
              <Navigate to="/projects" replace />
            )
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            !token ? <RegisterPage /> : <Navigate to="/projects" replace />
          }
        />

        {/* LISTĂ PROIECTE (Project Screen) */}
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage me={me} onLogout={handleLogout} />
            </RequireAuth>
          }
        />

        {/* PROJECT DETAIL (Project Cards Screen / AI-Assistant etc.) */}
        <Route
          path="/projects/:projectId"
          element={
            <RequireAuth>
              <ProjectDetailPage me={me} onLogout={handleLogout} />
            </RequireAuth>
          }
        />

        {/* ROOT -> redirect spre projects sau login */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/projects" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* orice altă rută -> redirect la root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* mic footer cu statusul backend-ului */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "#666",
          pointerEvents: "none",
        }}
      >
        {backendMessage}
      </div>
    </Router>
  );
}
