import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = import.meta.env.VITE_API_URL;
const STATUSES = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];
const STATUS_COLORS = {
  pendiente: "#D9A08F",
  confirmado: "#C9CDD3",
  enviado: "#9FB3C8",
  entregado: "#8EAE8E",
  cancelado: "#7C7A72",
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function StatusBadge({ status }) {
  return (
    <span style={{ color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}`, padding: "4px 10px", fontSize: "11px", letterSpacing: "0.06em", textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function OrderDetail({ orderId, onClose, onStatusChanged, authHeaders }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, { headers: authHeaders });
      if (res.ok) setOrder(await res.json());
      setLoading(false);
    }
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al actualizar");
      setOrder((prev) => ({ ...prev, status: newStatus }));
      onStatusChanged();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "flex-end", zIndex: 50, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{ position: "relative", width: "420px", maxWidth: "100%", height: "100%", background: "#15140F", borderLeft: "1px solid #3A3A38", padding: "32px", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "24px", right: "24px", background: "transparent", border: "none", color: "#7C7A72", fontSize: "20px", cursor: "pointer" }}>×</button>

        {loading || !order ? (
          <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando pedido...</p>
        ) : (
          <>
            <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>Pedido</p>
            <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "24px", margin: "0 0 28px" }}>#{order.id}</h2>

            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "#EDEAE2", fontSize: "14px", margin: "0 0 4px" }}>{order.customers?.name}</p>
              <p style={{ color: "#7C7A72", fontSize: "13px", margin: 0 }}>{order.customers?.email}</p>
              <p style={{ color: "#7C7A72", fontSize: "13px", margin: "4px 0 0" }}>{new Date(order.created_at).toLocaleDateString("es-EC")}</p>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>Cambiar estado</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={updating} style={{ background: order.status === s ? STATUS_COLORS[s] : "transparent", color: order.status === s ? "#0A0A09" : STATUS_COLORS[s], border: `1px solid ${STATUS_COLORS[s]}`, padding: "6px 12px", fontSize: "11px", textTransform: "capitalize", cursor: updating ? "default" : "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #3A3A38", paddingTop: "20px" }}>
              <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>Productos</p>
              {(order.items || []).map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{item.products?.name} × {item.quantity}</span>
                  <span style={{ color: "#EDEAE2", fontSize: "13px" }}>{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #3A3A38", paddingTop: "16px", marginTop: "8px" }}>
                <span style={{ color: "#EDEAE2", fontSize: "14px" }}>Total</span>
                <span style={{ color: "#EDEAE2", fontSize: "18px", fontFamily: "'Georgia', 'Times New Roman', serif" }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersManager() {
  const { accessToken } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` };

  const fetchOrders = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const query = statusFilter !== "todos" ? `?status=${statusFilter}` : "";
      const res = await fetch(`${API_URL}/api/admin/orders${query}`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).error || "Error al cargar pedidos");
      setOrders(await res.json());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, statusFilter]);

  return (
    <main style={{ flex: 1, padding: "40px 48px" }}>
      <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 8px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
        Panel de administración
      </p>
      <h1 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: "0 0 32px" }}>
        Pedidos
      </h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["todos", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? "#EDEAE2" : "transparent", color: statusFilter === s ? "#15140F" : "#B9B6AC", border: "1px solid #3A3A38", padding: "8px 16px", fontSize: "12px", textTransform: "capitalize", cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
            {s}
          </button>
        ))}
      </div>

      {loadError && (
        <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
          <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>Error: {loadError}</p>
        </div>
      )}

      {loading ? (
        <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando pedidos...</p>
      ) : (
        <div style={{ border: "1px solid #3A3A38", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 1fr 1fr", background: "#15140F", padding: "16px 24px", borderBottom: "1px solid #3A3A38" }}>
            {["#", "Cliente", "Fecha", "Total", "Estado"].map((h) => (
              <span key={h} style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {orders.length === 0 ? (
            <p style={{ color: "#7C7A72", fontSize: "14px", padding: "24px" }}>No hay pedidos con ese estado.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} onClick={() => setSelectedOrderId(order.id)} style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 1fr 1fr", padding: "18px 24px", borderBottom: "1px solid #2A2A26", alignItems: "center", cursor: "pointer" }}>
                <span style={{ color: "#EDEAE2", fontSize: "13px" }}>{order.id}</span>
                <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{order.customers?.name}</span>
                <span style={{ color: "#7C7A72", fontSize: "13px" }}>{new Date(order.created_at).toLocaleDateString("es-EC")}</span>
                <span style={{ color: "#C9CDD3", fontSize: "13px" }}>{formatPrice(order.total)}</span>
                <StatusBadge status={order.status} />
              </div>
            ))
          )}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          authHeaders={authHeaders}
          onClose={() => setSelectedOrderId(null)}
          onStatusChanged={fetchOrders}
        />
      )}
    </main>
  );
}
