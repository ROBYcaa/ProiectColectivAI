import { useState } from "react";
import "./LoginPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

   // Functia de login
  async function handleLogin(e) {
    e.preventDefault(); // opreste reincarcarea paginii la submit
    setError(""); // curata erorile anterioare
    setLoading(true); // seteaza starea de loading
    try {
      // Trimitem cererea POST catre backend (endpointul /auth/login)
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      // Salvam tokenul local pentru sesiune
      localStorage.setItem("token", data.access_token);
      // Apelam functia primita prin props
      onLoginSuccess(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Smart Project Management Platform</h2>
        <p className="subtitle">
          Welcome back 👋 <br /> Login to manage your projects efficiently
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="links">
          <a href="#">Forgot password?</a>
          <a href="#">Don’t have an account? Register</a>
        </div>
      </div>
    </div>
  );
}
