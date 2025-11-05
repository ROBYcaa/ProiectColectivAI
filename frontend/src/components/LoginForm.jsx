import React, { useState } from "react";
import { loginUser } from "../api/authService";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Functia care se executa la apasarea butonului Login
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      window.location.href = "/projects"; // redirect dupa login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

   // Interfata vizuala
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 360,
        margin: "4rem auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && <p style={{ color: "tomato" }}>{error}</p>}
    </form>
  );
}
