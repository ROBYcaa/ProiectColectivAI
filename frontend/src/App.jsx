import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  // auth state
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  // backend health (optional – small footer text)
  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  // Health check once
  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message || "Backend OK ✅"))
      .catch(() => setBackendMessage("Backend unreachable ❌"));
  }, []);

  // When we have a token, try to load /auth/me
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
          // token invalid/expired – clear it gracefully
          localStorage.removeItem("token");
          if (!cancelled) {
            setToken("");
            setMe(null);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setMe(data); // { id, email }
          setError("");
        }
      } catch {
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

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setMe(null);
  }

  // ============= RENDER =============

  // Not logged in -> show the Figma-like login page
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

  // Logged in -> simple welcome card (you can route to Dashboard later)
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg,#fff7e6,#ffe8cc,#ffd7b5,#f7c9a3,#ffefdb)",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 520,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          padding: "28px 32px",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 8 }}>
          Welcome{me?.email ? `, ${me.email}` : ""} 👋
        </h2>

        <p style={{ color: "#555", marginTop: 0 }}>
          Token salvat în <code>localStorage</code>. Rutele protejate pot folosi
          headerul <code>Authorization: Bearer &lt;token&gt;</code>.
        </p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 8,
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background:
              "linear-gradient(90deg, rgba(48,167,215,1) 0%, rgba(194,116,12,1) 100%)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>

        <pre
          style={{
            background: "#fafafa",
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
            marginTop: 16,
            textAlign: "left",
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {me ? JSON.stringify(me, null, 2) : "Loading user..."}
        </pre>

        {error && (
          <div style={{ color: "tomato", marginTop: 12 }}>{error}</div>
        )}
      </div>

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
    </div>
  );
}
