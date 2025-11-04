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
