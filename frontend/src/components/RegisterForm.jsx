import React, { useState } from "react";
import { registerUser } from "../api/authService";

export default function RegisterForm({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email, password, confirmPassword);
      setSuccess(data.message || "Registered successfully. Redirecting to login...");
      // optional callback
      if (onRegisterSuccess) onRegisterSuccess(data);
      // redirect to login page
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 360,
        margin: "3rem auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
      }}
    >
      <h2>Create account</h2>

      <label style={{ fontSize: "0.9rem" }}>Email</label>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label style={{ fontSize: "0.9rem" }}>Password</label>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label style={{ fontSize: "0.9rem" }}>Confirm Password</label>
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {error && <p style={{ color: "tomato", marginTop: "0.5rem" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "0.5rem" }}>{success}</p>}
    </form>
  );
}
