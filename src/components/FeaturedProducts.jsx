import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function BottleIcon() {
  return (
    <svg width="90" height="160" viewBox="0 0 90 160" aria-hidden="true">
      <rect x="14" y="48" width="62" height="100" rx="3" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <rect x="34" y="28" width="22" height="24" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <circle cx="45" cy="18" r="13" fill="#0A0A09" stroke="#5A5A57" strokeWidth="1" />
    </svg>
  );
}

export default function FeaturedProducts() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, fragrance_notes, price, stock, image_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setProducts(data);
    }
    fetchFeatured();
  }, []);

  if (products.length === 0) return null;

  return (
    <section style={{ background: "#15140F", padding: "96px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px", borderBottom: "1px solid #3A3A38", paddingBottom: "24px" }}>
          <div>
            <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 12px" }}>Selección</p>
            <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "34px", margin: 0 }}>Los más buscados</h2>
          </div>
          <a href="#catalogo" style={{ color: "#B9B6AC", fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid #7D8085", paddingBottom: "4px" }}>
            Ver todo el catálogo
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#3A3A38" }}>
          {products.map((product) => (
            <div key={product.id} style={{ background: "#15140F", padding: "40px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                ) : (
                  <BottleIcon />
                )}
              </div>
              <div>
                <p style={{ color: "#8E9184", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 6px" }}>{product.brand}</p>
                <h3 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "22px", margin: "0 0 10px" }}>{product.name}</h3>
                <p style={{ color: "#7C7A72", fontSize: "13px", margin: "0 0 18px" }}>{product.fragrance_notes}</p>
                <p style={{ color: "#C9CDD3", fontSize: "16px", margin: "0 0 16px" }}>{formatPrice(product.price)}</p>
                <button
                  onClick={() => addItem(product)}
                  disabled={product.stock === 0}
                  style={{ width: "100%", background: "transparent", border: "1px solid #7D8085", color: "#EDEAE2", padding: "10px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: product.stock === 0 ? "default" : "pointer" }}
                >
                  {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
