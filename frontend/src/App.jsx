import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  // Health check — verificam daca backendul este pornit
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message || "Backend OK ✅"))
      .catch(() => setBackendMessage("Backend unreachable ❌"));
  }, []);

    // Verificare token: daca utilizatorul e deja logat
  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }

    let cancelled = false;// protectie pentru unmount (evita memory leaks)

    // auto-login check
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          if (!cancelled) {
            setToken("");
            setMe(null);
          }
          return;
        }

        // daca totul e ok, obtinem datele utilizatorului
        const data = await res.json();
        if (!cancelled) setMe(data);
      } catch {
        // daca apare o eroare de retea, resetam tot
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

    // Logout
  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  }

  // RENDER

  // Daca utilizatorul NU este logat, afisam pagina de login
  if (!token) {
    return (
      <>
        <LoginPage onLoginSuccess={(t) => setToken(t)} />
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
      </>
    );
  }

  // Daca utilizatorul este logat, afisam un mic dashboard de confirmare
  return (
    <Router>
      <Routes>
        {/* If user is logged in, redirect /login and /register to dashboard */}
        <Route
          path="/login"
          element={!token ? <LoginPage onLoginSuccess={(t) => setToken(t)} /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!token ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={
            token ? (
              <div style={{ padding: 20 }}>
                <h2>Welcome{me?.email ? `, ${me.email}` : ""} 👋</h2>
                <button onClick={handleLogout}>Logout</button>
                <pre>{me ? JSON.stringify(me, null, 2) : "Loading user..."}</pre>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
