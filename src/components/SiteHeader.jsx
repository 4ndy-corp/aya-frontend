import React from "react";
import { useCart } from "../context/CartContext";
import { useIsMobile } from "../hooks/useIsMobile";

export default function SiteHeader() {
  const { itemCount, openCart } = useCart();
  const isMobile = useIsMobile();

  const navItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Catálogo", href: "#catalogo" },
    { label: "Sobre nosotros", href: "#sobre-nosotros" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#0A0A09",
        borderBottom: "1px solid #3A3A38",
        padding: isMobile ? "16px 20px" : "20px 48px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        gap: isMobile ? "12px" : 0,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
        <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "20px", margin: 0 }}>
          A&amp;A
        </p>
        {isMobile && (
          <button onClick={openCart} style={{ background: "transparent", border: "none", color: "#EDEAE2", fontSize: "13px", cursor: "pointer" }}>
            Carrito ({itemCount})
          </button>
        )}
      </div>

      <nav style={{ display: "flex", gap: isMobile ? "16px" : "32px", flexWrap: "wrap" }}>
        {navItems.map((item) => (
          <a key={item.label} href={item.href} style={{ color: "#B9B6AC", fontSize: "13px", letterSpacing: "0.06em", textDecoration: "none" }}>
            {item.label}
          </a>
        ))}
      </nav>

      {!isMobile && (
        <button onClick={openCart} style={{ background: "transparent", border: "none", color: "#EDEAE2", fontSize: "13px", cursor: "pointer" }}>
          Carrito ({itemCount})
        </button>
      )}
    </header>
  );
}
