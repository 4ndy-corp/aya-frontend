import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState(null);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMsg("Revisa el correo, algo no cuadra.");
      return;
    }
    setStatus("loading");

    // La política RLS solo permite INSERT en subscribers (no SELECT),
    // así que esto se puede hacer directo con la anon key, sin backend.
    const { error } = await supabase.from("subscribers").insert([{ email }]);

    if (error) {
      setStatus("error");
      setErrorMsg(error.code === "23505" ? "Ese correo ya está suscrito." : "No se pudo suscribir, intenta de nuevo.");
    } else {
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <section style={{ background: "#0A0A09", padding: "96px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif", borderTop: "1px solid #3A3A38", borderBottom: "1px solid #3A3A38" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 20px" }}>No te pierdas nada</p>
        <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "30px", margin: "0 0 16px" }}>
          Lanzamientos y ofertas, directo a tu correo
        </h2>
        <p style={{ color: "#7C7A72", fontSize: "14px", margin: "0 0 40px" }}>Sin spam. Solo aviso cuando llega algo que vale la pena oler.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status !== "idle") setStatus("idle"); }}
            placeholder="tu@email.com"
            style={{ flex: 1, maxWidth: "340px", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "16px 20px", fontSize: "14px", outline: "none" }}
          />
          <button type="submit" disabled={status === "loading"} style={{ background: "#EDEAE2", color: "#15140F", border: "none", padding: "16px 32px", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: status === "loading" ? "default" : "pointer", opacity: status === "loading" ? 0.6 : 1, whiteSpace: "nowrap" }}>
            {status === "loading" ? "Enviando..." : "Suscribirme"}
          </button>
        </form>

        <p style={{ minHeight: "20px", marginTop: "16px", fontSize: "13px", color: status === "success" ? "#8E9184" : status === "error" ? "#B57A6B" : "transparent" }}>
          {status === "success" && "Listo, ya estás dentro."}
          {status === "error" && errorMsg}
        </p>
      </div>
    </section>
  );
}
