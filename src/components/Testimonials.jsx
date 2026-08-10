import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useIsMobile } from "../hooks/useIsMobile";

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? "#C9CDD3" : "#3A3A38", fontSize: "14px" }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchTestimonials() {
      // RLS ya filtra por active = true en las políticas públicas.
      const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (data) setTestimonials(data);
    }
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section style={{ background: "#15140F", padding: isMobile ? "64px 20px" : "112px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "64px" }}>
          <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 20px" }}>Lo que dicen</p>
          <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: isMobile ? "24px" : "34px", margin: 0 }}>
            Clientes que ya encontraron su fragancia
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(testimonials.length, 3)}, 1fr)`, gap: "1px", background: "#3A3A38" }}>
          {testimonials.slice(0, 3).map((t) => (
            <div key={t.id} style={{ background: "#15140F", padding: "40px 36px", display: "flex", flexDirection: "column" }}>
              <Stars rating={t.rating} />
              <p style={{ color: "#B9B6AC", fontSize: "15px", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 28px", flexGrow: 1 }}>
                "{t.comment}"
              </p>
              <p style={{ color: "#8E9184", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, borderTop: "1px solid #3A3A38", paddingTop: "20px" }}>
                {t.customer_name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
