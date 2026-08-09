import React from "react";
import { useCart } from "../context/CartContext";

export default function SiteHeader() {
  const { itemCount, openCart } = useCart();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#0A0A09",
        borderBottom: "1px solid #3A3A38",
        padding: "20px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "20px", margin: 0 }}>
        A&amp;A
      </p>
      <nav style={{ display: "flex", gap: "32px" }}>
        {[
          { label: "Inicio", href: "#inicio" },
          { label: "Catálogo", href: "#catalogo" },
          { label: "Sobre nosotros", href: "#sobre-nosotros" },
          { label: "Contacto", href: "#contacto" },
        ].map((item) => (
          <a key={item.label} href={item.href} style={{ color: "#B9B6AC", fontSize: "13px", letterSpacing: "0.06em", textDecoration: "none" }}>
            {item.label}
          </a>
        ))}
      </nav>
      <button onClick={openCart} style={{ background: "transparent", border: "none", color: "#EDEAE2", fontSize: "13px", cursor: "pointer" }}>
        Carrito ({itemCount})
      </button>
    </header>
  );
}
