const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Invalid credentials");
  }

  return await response.json(); // { access_token, token_type }
}

export async function fetchMe() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authorized");
  return await res.json();
}

/**
 * Register a new user.
 * Expects: { email, password, confirm_password }
 * Returns backend JSON on success, throws Error(detail) on failure.
 */
export async function registerUser(email, password, confirm_password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirm_password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    // backend might return { detail: "..." } or other shape
    throw new Error(data.detail || data.message || "Registration failed");
  }

  return await response.json(); // e.g. { message: "User registered successfully", email: ... }
}
