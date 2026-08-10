import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useIsMobile } from "../hooks/useIsMobile";

const FALLBACK = {
  eyebrow: "Nuestra historia",
  title: "No vendemos frascos. Vendemos el momento antes de entrar.",
  body: "A&A nació de una idea simple: un perfume no es un accesorio, es la última decisión que tomas antes de salir de casa.",
};

export default function AboutBrand() {
  const [content, setContent] = useState(FALLBACK);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchAbout() {
      const { data } = await supabase.from("site_content").select("*").eq("section", "about").maybeSingle();
      if (data) {
        setContent({
          eyebrow: FALLBACK.eyebrow,
          title: data.title || FALLBACK.title,
          body: data.body_text || FALLBACK.body,
        });
      }
    }
    fetchAbout();
  }, []);

  const titleLines = content.title.split("\n");

  return (
    <section id="sobre-nosotros" style={{ background: "#0A0A09", padding: isMobile ? "64px 20px" : "112px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr", gap: isMobile ? "40px" : "80px", alignItems: "center" }}>
        <div style={{ position: "relative", height: isMobile ? "260px" : "420px", border: "1px solid #3A3A38" }}>
          <svg aria-hidden="true" viewBox="0 0 400 420" style={{ width: "100%", height: "100%", opacity: 0.5 }} preserveAspectRatio="xMidYMid slice">
            <path d="M -20 60 C 100 20, 180 140, 320 90 S 420 30, 460 100" stroke="#5A5A57" strokeWidth="1" fill="none" />
            <path d="M -20 200 C 120 260, 240 160, 340 220 S 420 300, 460 240" stroke="#5A5A57" strokeWidth="1" fill="none" />
            <path d="M -20 340 C 140 300, 260 380, 380 320 S 440 280, 460 340" stroke="#5A5A57" strokeWidth="1" fill="none" />
          </svg>
          <p style={{ position: "absolute", bottom: "24px", left: "24px", color: "#5A5A57", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>A&amp;A · Est.</p>
        </div>

        <div>
          <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 24px" }}>{content.eyebrow}</p>
          <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: isMobile ? "26px" : "36px", lineHeight: 1.25, margin: "0 0 28px", maxWidth: isMobile ? "100%" : "520px" }}>
            {titleLines.map((line, i) => <span key={i} style={{ display: "block" }}>{line}</span>)}
          </h2>
          <p style={{ color: "#B9B6AC", fontSize: "16px", lineHeight: 1.8, maxWidth: "480px", margin: 0 }}>{content.body}</p>
        </div>
      </div>
    </section>
  );
}
