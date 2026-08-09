import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FALLBACK = {
  eyebrow: "A&A · Eau de Parfum",
  title: "El silencio antes de entrar en escena",
  subtitle: "Fragancias de autor, embotelladas para el instante justo antes de que todos volteen a verte.",
};

export default function Hero() {
  const [content, setContent] = useState(FALLBACK);

  useEffect(() => {
    async function fetchHero() {
      const { data } = await supabase.from("site_content").select("*").eq("section", "hero").maybeSingle();
      if (data) {
        setContent({
          eyebrow: FALLBACK.eyebrow,
          title: data.title || FALLBACK.title,
          subtitle: data.subtitle || FALLBACK.subtitle,
        });
      }
    }
    fetchHero();
  }, []);

  const titleLines = content.title.split("\n");

  return (
    <section
      id="inicio"
      style={{
        position: "relative",
        minHeight: "640px",
        background: "radial-gradient(120% 90% at 78% 45%, #232019 0%, #15140F 55%, #0A0A09 100%)",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 1200 640" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }} preserveAspectRatio="xMidYMid slice">
        <path d="M -50 120 C 250 60, 400 260, 700 180 S 1100 40, 1260 160" stroke="#C9CDD3" strokeWidth="1.5" fill="none" />
        <path d="M -50 340 C 300 420, 500 260, 780 380 S 1050 520, 1260 420" stroke="#C9CDD3" strokeWidth="1" fill="none" />
        <path d="M -50 560 C 280 500, 620 620, 900 540 S 1150 460, 1260 560" stroke="#C9CDD3" strokeWidth="1" fill="none" />
      </svg>

      <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "0 48px", minHeight: "640px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", alignItems: "center", gap: "24px" }}>
        <div>
          <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", fontFamily: "'Helvetica Neue', Arial, sans-serif", marginBottom: "28px" }}>
            {content.eyebrow}
          </p>
          <h1 style={{ color: "#EDEAE2", fontSize: "56px", lineHeight: 1.08, fontWeight: 400, margin: 0, maxWidth: "560px" }}>
            {titleLines.map((line, i) => <span key={i} style={{ display: "block" }}>{line}</span>)}
          </h1>
          <p style={{ color: "#B9B6AC", fontSize: "16px", lineHeight: 1.7, fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: "420px", margin: "28px 0 40px" }}>
            {content.subtitle}
          </p>
          <a
            href="#catalogo"
            style={{ display: "inline-block", background: "transparent", color: "#EDEAE2", border: "1px solid #7D8085", padding: "16px 36px", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Helvetica Neue', Arial, sans-serif", textDecoration: "none" }}
          >
            Ver catálogo
          </a>
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "560px" }}>
          <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,205,211,0.16) 0%, rgba(201,205,211,0.03) 60%, transparent 75%)", top: "30px" }} />
          <svg width="220" height="480" viewBox="0 0 220 480" aria-hidden="true">
            <rect x="30" y="140" width="160" height="300" rx="6" fill="rgba(237,234,226,0.06)" stroke="#7D8085" strokeWidth="1.5" />
            <rect x="48" y="200" width="124" height="170" rx="2" fill="#0A0A09" stroke="#3A3A38" strokeWidth="1" />
            <rect x="90" y="90" width="40" height="55" fill="rgba(237,234,226,0.06)" stroke="#7D8085" strokeWidth="1.5" />
            <circle cx="110" cy="60" r="34" fill="#0A0A09" stroke="#5A5A57" strokeWidth="1.5" />
            <circle cx="98" cy="48" r="7" fill="rgba(237,234,226,0.35)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
