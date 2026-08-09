import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function StatCard({ label, value, sublabel }) {
  return (
    <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "28px 28px 24px" }}>
      <p style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 16px" }}>
        {label}
      </p>
      <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "28px", margin: "0 0 6px" }}>
        {value}
      </p>
      {sublabel && <p style={{ color: "#7C7A72", fontSize: "12px", margin: 0 }}>{sublabel}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { accessToken } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error((await res.json()).error || "Error al cargar estadísticas");
        setData(await res.json());
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) fetchDashboard();
  }, [accessToken]);

  return (
    <main style={{ flex: 1, padding: "40px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 8px" }}>
        Panel de administración
      </p>
      <h1 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: "0 0 40px" }}>
        Resumen de ventas
      </h1>

      {loadError && (
        <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
          <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>Error: {loadError}</p>
        </div>
      )}

      {loading || !data ? (
        <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando estadísticas...</p>
      ) : (
        <>
          <p style={{ color: "#5A5A57", fontSize: "12px", margin: "0 0 24px" }}>
            Últimos 30 días
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
            <StatCard label="Ventas totales" value={formatPrice(data.stats.totalSales)} />
            <StatCard label="Pedidos" value={data.stats.totalOrders} />
            <StatCard label="Ticket promedio" value={formatPrice(data.stats.avgTicket)} />
            <StatCard label="Producto más vendido" value={data.stats.topProduct} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px" }}>
            <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "28px" }}>
              <p style={{ color: "#EDEAE2", fontSize: "14px", margin: "0 0 24px" }}>Ventas de la última semana</p>
              {data.salesTrend.every((d) => d.ventas === 0) ? (
                <p style={{ color: "#7C7A72", fontSize: "13px" }}>Todavía no hay ventas esta semana.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.salesTrend}>
                    <CartesianGrid stroke="#2A2A26" vertical={false} />
                    <XAxis dataKey="day" stroke="#7C7A72" fontSize={12} tickLine={false} axisLine={{ stroke: "#3A3A38" }} />
                    <YAxis stroke="#7C7A72" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#0A0A09", border: "1px solid #3A3A38", color: "#EDEAE2" }} labelStyle={{ color: "#9C9F8E" }} />
                    <Line type="monotone" dataKey="ventas" stroke="#C9CDD3" strokeWidth={2} dot={{ r: 3, fill: "#C9CDD3" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "28px" }}>
              <p style={{ color: "#EDEAE2", fontSize: "14px", margin: "0 0 24px" }}>Más vendidos</p>
              {data.topProducts.length === 0 ? (
                <p style={{ color: "#7C7A72", fontSize: "13px" }}>Todavía no hay ventas registradas.</p>
              ) : (
                data.topProducts.map((product, i) => (
                  <div key={product.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < data.topProducts.length - 1 ? "1px solid #2A2A26" : "none" }}>
                    <div>
                      <p style={{ color: "#EDEAE2", fontSize: "13px", margin: "0 0 4px" }}>{product.name}</p>
                      <p style={{ color: "#7C7A72", fontSize: "11px", margin: 0 }}>{product.brand}</p>
                    </div>
                    <p style={{ color: "#C9CDD3", fontSize: "13px", margin: 0 }}>{product.unitsSold} u.</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
