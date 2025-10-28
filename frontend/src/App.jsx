import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [backendMessage, setBackendMessage] = useState("Checking backend...");

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL; // 🔹 citim din .env
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message || "No message"))
      .catch((err) => setBackendMessage("Backend unreachable ❌"));
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* 🔹 Adăugăm secțiunea de test pentru backend */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Backend status:</h3>
        <p>{backendMessage}</p>
      </div>
    </>
  );
}

export default App;
