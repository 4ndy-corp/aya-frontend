import React, { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = import.meta.env.VITE_API_URL;
const ORDER_STATUS_COLORS = {
  pendiente: "#D9A08F",
  confirmado: "#C9CDD3",
  enviado: "#9FB3C8",
  entregado: "#8EAE8E",
  cancelado: "#7C7A72",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function CustomerDetail({ customerId, onClose, authHeaders }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/customers/${customerId}`, { headers: authHeaders });
      if (res.ok) setCustomer(await res.json());
      setLoading(false);
    }
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "flex-end", zIndex: 50, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{ position: "relative", width: "420px", maxWidth: "100%", height: "100%", background: "#15140F", borderLeft: "1px solid #3A3A38", padding: "32px", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "24px", right: "24px", background: "transparent", border: "none", color: "#7C7A72", fontSize: "20px", cursor: "pointer" }}>×</button>

        {loading || !customer ? (
          <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando cliente...</p>
        ) : (
          <>
            <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>Cliente</p>
            <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "22px", margin: "0 0 28px" }}>{customer.name}</h2>

            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "#B9B6AC", fontSize: "13px", margin: "0 0 6px" }}>{customer.email}</p>
              <p style={{ color: "#B9B6AC", fontSize: "13px", margin: 0 }}>{customer.phone}</p>
            </div>

            <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Historial de pedidos</p>
            {(customer.orders || []).length === 0 ? (
              <p style={{ color: "#7C7A72", fontSize: "13px" }}>Sin pedidos todavía.</p>
            ) : (
              customer.orders.map((order) => (
                <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #2A2A26" }}>
                  <div>
                    <p style={{ color: "#EDEAE2", fontSize: "13px", margin: "0 0 4px" }}>#{order.id}</p>
                    <p style={{ color: "#7C7A72", fontSize: "12px", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-EC")}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#C9CDD3", fontSize: "13px", margin: "0 0 6px" }}>{formatPrice(order.total)}</p>
                    <span style={{ color: ORDER_STATUS_COLORS[order.status], fontSize: "10px", textTransform: "capitalize" }}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CustomersManager() {
  const { accessToken } = useAdminAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` };

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/api/admin/customers`, { headers: authHeaders });
        if (!res.ok) throw new Error((await res.json()).error || "Error al cargar clientes");
        setCustomers(await res.json());
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const filtered = useMemo(() => {
    return customers.filter(
      (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  return (
    <main style={{ flex: 1, padding: "40px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 8px" }}>
        Panel de administración
      </p>
      <h1 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: "0 0 28px" }}>
        Clientes
      </h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre o correo..."
        style={{ width: "100%", maxWidth: "360px", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "13px 16px", fontSize: "14px", outline: "none", marginBottom: "24px", boxSizing: "border-box" }}
      />

      {loadError && (
        <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
          <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>Error: {loadError}</p>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando clientes...</p>
      ) : (
        <div style={{ border: "1px solid #3A3A38" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", background: "#15140F", padding: "16px 24px", borderBottom: "1px solid #3A3A38" }}>
            {["Cliente", "Correo", "Pedidos", "Total gastado", "Último pedido"].map((h) => (
              <span key={h} style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: "#7C7A72", fontSize: "14px", padding: "24px" }}>No se encontraron clientes.</p>
          ) : (
            filtered.map((customer) => (
              <div key={customer.id} onClick={() => setSelectedCustomerId(customer.id)} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr", padding: "18px 24px", borderBottom: "1px solid #2A2A26", alignItems: "center", cursor: "pointer" }}>
                <span style={{ color: "#EDEAE2", fontSize: "13px" }}>{customer.name}</span>
                <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{customer.email}</span>
                <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{customer.orderCount}</span>
                <span style={{ color: "#C9CDD3", fontSize: "13px" }}>{formatPrice(customer.totalSpent)}</span>
                <span style={{ color: "#7C7A72", fontSize: "13px" }}>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString("es-EC") : "—"}</span>
              </div>
            ))
          )}
        </div>
      )}

      {selectedCustomerId && (
        <CustomerDetail customerId={selectedCustomerId} authHeaders={authHeaders} onClose={() => setSelectedCustomerId(null)} />
      )}
    </main>
  );
}
