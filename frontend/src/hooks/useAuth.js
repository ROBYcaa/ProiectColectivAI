export function useAuth() {
  const token = localStorage.getItem("token");
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return { isAuthenticated: !!token, token, logout };
}
