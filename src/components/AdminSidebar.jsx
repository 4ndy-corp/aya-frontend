import React from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Inventario" },
  { id: "orders", label: "Pedidos" },
  { id: "customers", label: "Clientes" },
  { id: "content", label: "Contenido de la web" },
];

export default function AdminSidebar({ active, onNavigate, onSignOut }) {
  return (
    <aside style={{ width: "220px", background: "#0A0A09", borderRight: "1px solid #3A3A38", padding: "32px 0", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <p style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "20px", margin: "0 0 40px", padding: "0 28px" }}>
          A&amp;A <span style={{ color: "#7C7A72", fontSize: "12px" }}>· admin</span>
        </p>
        <nav>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                padding: "12px 28px",
                color: active === item.id ? "#EDEAE2" : "#7C7A72",
                borderLeft: `2px solid ${active === item.id ? "#C9CDD3" : "transparent"}`,
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>

      <button
        onClick={onSignOut}
        style={{ margin: "0 28px", background: "transparent", border: "1px solid #3A3A38", color: "#7C7A72", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        Salir
      </button>
    </aside>
  );
}
