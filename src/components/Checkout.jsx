import React, { useState } from "react";
import { useCart } from "../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL;
const SHIPPING_COST = 5.0;

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function Field({ label, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: "20px" }}>
      <span style={{ display: "block", color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
        {label}
      </span>
      <input {...props} style={{ width: "100%", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "13px 16px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
    </label>
  );
}

export default function Checkout({ onOrderComplete }) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const total = subtotal + SHIPPING_COST;

  const isFormValid =
    form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.phone.trim() && form.address.trim() && form.city.trim();

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || items.length === 0) {
      setStatus("error");
      setErrorMsg("Revisa que todos los campos estén completos.");
      return;
    }

    setStatus("processing");
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo procesar el pedido.");

      setOrderId(data.orderId);
      setStatus("success");
      clearCart();
      if (onOrderComplete) onOrderComplete();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  if (status === "success") {
    return (
      <section style={{ background: "#15140F", minHeight: "500px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: "440px" }}>
          <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 20px" }}>
            Pedido confirmado
          </p>
          <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: "0 0 16px" }}>
            Gracias, {form.name.split(" ")[0]}
          </h2>
          <p style={{ color: "#B9B6AC", fontSize: "14px", lineHeight: 1.7, margin: "0 0 8px" }}>
            Tu pedido #{orderId} fue registrado. Te enviamos la confirmación a {form.email}.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "#15140F", padding: "80px 48px 112px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 12px" }}>
          Un paso más
        </p>
        <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "32px", margin: "0 0 48px" }}>
          Finalizar compra
        </h2>

        {items.length === 0 ? (
          <p style={{ color: "#7C7A72", fontSize: "14px" }}>Tu carrito está vacío. Agrega productos desde el catálogo primero.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "64px" }}>
            <div>
              <p style={{ color: "#EDEAE2", fontSize: "15px", margin: "0 0 24px", borderBottom: "1px solid #3A3A38", paddingBottom: "16px" }}>
                Datos de envío
              </p>
              <Field label="Nombre completo" type="text" value={form.name} onChange={handleChange("name")} placeholder="Nombre y apellido" />
              <Field label="Correo electrónico" type="email" value={form.email} onChange={handleChange("email")} placeholder="tu@email.com" />
              <Field label="Teléfono" type="tel" value={form.phone} onChange={handleChange("phone")} placeholder="099 000 0000" />
              <Field label="Dirección" type="text" value={form.address} onChange={handleChange("address")} placeholder="Calle, número, referencia" />
              <Field label="Ciudad" type="text" value={form.city} onChange={handleChange("city")} placeholder="Ciudad" />

              <p style={{ color: "#EDEAE2", fontSize: "15px", margin: "40px 0 20px", borderBottom: "1px solid #3A3A38", paddingBottom: "16px" }}>
                Método de pago
              </p>
              {[
                { value: "card", label: "Tarjeta de crédito/débito" },
                { value: "paypal", label: "PayPal" },
                { value: "transfer", label: "Transferencia bancaria" },
              ].map((option) => (
                <label key={option.value} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", border: `1px solid ${paymentMethod === option.value ? "#7D8085" : "#3A3A38"}`, marginBottom: "10px", cursor: "pointer" }}>
                  <input type="radio" name="paymentMethod" checked={paymentMethod === option.value} onChange={() => setPaymentMethod(option.value)} />
                  <span style={{ color: "#EDEAE2", fontSize: "14px" }}>{option.label}</span>
                </label>
              ))}

              {status === "error" && <p style={{ color: "#B57A6B", fontSize: "13px", marginTop: "16px" }}>{errorMsg}</p>}
            </div>

            <div>
              <p style={{ color: "#EDEAE2", fontSize: "15px", margin: "0 0 24px", borderBottom: "1px solid #3A3A38", paddingBottom: "16px" }}>
                Resumen del pedido
              </p>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ color: "#B9B6AC", fontSize: "14px" }}>{item.name} × {item.quantity}</span>
                  <span style={{ color: "#EDEAE2", fontSize: "14px" }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #3A3A38", marginTop: "20px", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ color: "#7C7A72", fontSize: "13px" }}>Subtotal</span>
                  <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ color: "#7C7A72", fontSize: "13px" }}>Envío</span>
                  <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{formatPrice(SHIPPING_COST)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #3A3A38", paddingTop: "16px" }}>
                  <span style={{ color: "#EDEAE2", fontSize: "15px" }}>Total</span>
                  <span style={{ color: "#EDEAE2", fontSize: "20px", fontFamily: "'Georgia', 'Times New Roman', serif" }}>{formatPrice(total)}</span>
                </div>
              </div>

              <button type="submit" disabled={status === "processing"} style={{ width: "100%", background: "#EDEAE2", color: "#15140F", border: "none", padding: "16px", fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", cursor: status === "processing" ? "default" : "pointer", opacity: status === "processing" ? 0.6 : 1, marginTop: "32px" }}>
                {status === "processing" ? "Procesando..." : "Confirmar pedido"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
