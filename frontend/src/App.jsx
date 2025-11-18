import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  // Health check backend
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message || "Backend OK"))
      .catch(() => setBackendMessage("Backend unreachable ❌"));
  }, []);

  // Autologin check
  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    const fetchMe = async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        setToken("");
        setMe(null);
      } else {
        const data = await res.json();
        setMe(data);
      }
    };

    fetchMe();
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  }

  return (
    <Router>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage
                onLoginSuccess={(tok) => {
                  localStorage.setItem("token", tok.access_token);
                  setToken(tok.access_token);
                }}
              />
            )
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            token ? <Navigate to="/" replace /> : <RegisterPage />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            token ? (
              <div style={{ padding: 20 }}>
                <h2>Welcome{me?.email ? `, ${me.email}` : ""} 👋</h2>
                <button onClick={handleLogout}>Logout</button>
                <pre>{JSON.stringify(me, null, 2)}</pre>

                <p style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
                  {backendMessage}
                </p>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </Router>
  );
}
