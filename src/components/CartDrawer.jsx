import React from "react";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function MiniBottleIcon() {
  return (
    <svg width="40" height="72" viewBox="0 0 40 72" aria-hidden="true">
      <rect x="6" y="22" width="28" height="44" rx="2" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <rect x="14" y="12" width="12" height="12" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <circle cx="20" cy="7" r="6" fill="#0A0A09" stroke="#5A5A57" strokeWidth="1" />
    </svg>
  );
}

export default function CartDrawer({ onGoToCheckout }) {
  const { items, updateQuantity, removeItem, subtotal, isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "flex-end", zIndex: 50, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div onClick={closeCart} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{ position: "relative", width: "400px", maxWidth: "100%", height: "100%", background: "#15140F", borderLeft: "1px solid #3A3A38", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 32px", borderBottom: "1px solid #3A3A38", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "22px", margin: 0 }}>
            Tu carrito
          </h2>
          <button onClick={closeCart} style={{ background: "transparent", border: "none", color: "#7C7A72", fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 32px" }}>
          {items.length === 0 ? (
            <p style={{ color: "#7C7A72", fontSize: "14px", marginTop: "40px" }}>Tu carrito está vacío.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "16px", padding: "24px 0", borderBottom: "1px solid #2A2A26" }}>
                <div style={{ width: "64px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <MiniBottleIcon />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ color: "#8E9184", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 4px" }}>{item.brand}</p>
                  <p style={{ color: "#EDEAE2", fontSize: "15px", margin: "0 0 12px" }}>{item.name}</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid #3A3A38", padding: "4px 10px" }}>
                      <button onClick={() => updateQuantity(item.id, -1)} style={{ background: "transparent", border: "none", color: "#B9B6AC", cursor: "pointer", fontSize: "14px" }}>−</button>
                      <span style={{ color: "#EDEAE2", fontSize: "13px", minWidth: "12px", textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} style={{ background: "transparent", border: "none", color: "#B9B6AC", cursor: "pointer", fontSize: "14px" }}>+</button>
                    </div>
                    <p style={{ color: "#C9CDD3", fontSize: "14px", margin: 0 }}>{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  <button onClick={() => removeItem(item.id)} style={{ background: "transparent", border: "none", color: "#7C7A72", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", padding: "10px 0 0" }}>
                    Quitar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: "24px 32px 32px", borderTop: "1px solid #3A3A38" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ color: "#B9B6AC", fontSize: "14px" }}>Subtotal</span>
              <span style={{ color: "#EDEAE2", fontSize: "18px", fontFamily: "'Georgia', 'Times New Roman', serif" }}>{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={() => { closeCart(); onGoToCheckout(); }}
              style={{ width: "100%", background: "#EDEAE2", color: "#15140F", border: "none", padding: "16px", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Ir a pagar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
