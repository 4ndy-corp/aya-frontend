import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const staticContent = {
  brand: "A&A",
  tagline: "Fragancias de autor.",
  links: [
    { label: "Catálogo", href: "#catalogo" },
    { label: "Sobre nosotros", href: "#sobre-nosotros" },
    { label: "Política de envíos", href: "#envios" },
    { label: "Cambios y devoluciones", href: "#devoluciones" },
  ],
};

const FALLBACK_CONTACT = {
  email: "hola@aya-perfumes.com",
  phone: "+593 99 000 0000",
  socials: [
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [contact, setContact] = useState(FALLBACK_CONTACT);

  useEffect(() => {
    async function fetchContact() {
      const { data } = await supabase.from("site_content").select("*").eq("section", "contact").maybeSingle();
      if (data) {
        setContact({
          email: data.title || FALLBACK_CONTACT.email,
          phone: data.subtitle || FALLBACK_CONTACT.phone,
          socials: [
            { label: "Instagram", href: data.extra?.instagram || "#" },
            { label: "TikTok", href: data.extra?.tiktok || "#" },
            { label: "WhatsApp", href: data.extra?.whatsapp || "#" },
          ],
        });
      }
    }
    fetchContact();
  }, []);

  const content = { ...staticContent, ...contact };
  return (
    <footer id="contacto" style={{ background: "#0A0A09", padding: "72px 48px 32px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "48px", paddingBottom: "48px", borderBottom: "1px solid #3A3A38" }}>
          <div>
            <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "24px", margin: "0 0 12px" }}>{content.brand}</p>
            <p style={{ color: "#7C7A72", fontSize: "14px", margin: 0, maxWidth: "280px" }}>{content.tagline}</p>
          </div>
          <div>
            <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "11px", margin: "0 0 20px" }}>Navegación</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {content.links.map((link) => (
                <li key={link.label} style={{ marginBottom: "12px" }}>
                  <a href={link.href} style={{ color: "#B9B6AC", fontSize: "14px", textDecoration: "none" }}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "11px", margin: "0 0 20px" }}>Contacto</p>
            <p style={{ color: "#B9B6AC", fontSize: "14px", margin: "0 0 10px" }}>{content.email}</p>
            <p style={{ color: "#B9B6AC", fontSize: "14px", margin: "0 0 20px" }}>{content.phone}</p>
            <div style={{ display: "flex", gap: "16px" }}>
              {content.socials.map((s) => (
                <a key={s.label} href={s.href} style={{ color: "#8E9184", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid #3A3A38", paddingBottom: "2px" }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "24px" }}>
          <p style={{ color: "#5A5A57", fontSize: "12px", margin: 0 }}>© {year} {content.brand}. Todos los derechos reservados.</p>
          <p style={{ color: "#5A5A57", fontSize: "12px", margin: 0 }}>Pagos procesados de forma segura</p>
        </div>
      </div>
    </footer>
  );
}
