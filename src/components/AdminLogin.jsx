import React, { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A09",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ width: "360px", background: "#15140F", border: "1px solid #3A3A38", padding: "40px" }}
      >
        <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "22px", margin: "0 0 4px" }}>
          A&amp;A
        </p>
        <p style={{ color: "#7C7A72", fontSize: "13px", margin: "0 0 32px" }}>
          Panel de administración
        </p>

        <div style={{ marginBottom: "18px" }}>
          <span style={{ display: "block", color: "#9C9F8E", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Correo
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "12px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <span style={{ display: "block", color: "#9C9F8E", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Contraseña
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "12px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {error && (
          <p style={{ color: "#B57A6B", fontSize: "13px", margin: "0 0 18px" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", background: "#EDEAE2", border: "none", color: "#15140F", padding: "14px", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
