import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ----- FRONTEND VALIDATION -----

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter (A–Z).");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number (0–9).");
      return;
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      setError("Password must contain at least one special symbol.");
      return;
    }

    // ----- BACKEND REQUEST -----

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Registration failed");
      }

      setSuccess("🎉 Account created successfully! Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="title">Create your account</h2>
        <p className="subtitle">
          Join our Smart Project Management Platform 🚀 <br />
          Start organizing your projects efficiently.
        </p>

        <form onSubmit={handleRegister} className="register-form">
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

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
