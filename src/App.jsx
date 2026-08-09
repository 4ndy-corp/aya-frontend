import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import AdminLogin from "./components/AdminLogin";
import AdminSidebar from "./components/AdminSidebar";
import InventoryManager from "./components/InventoryManager";
import OrdersManager from "./components/OrdersManager";
import CustomersManager from "./components/CustomersManager";
import Dashboard from "./components/Dashboard";
import ContentManager from "./components/ContentManager";
import PublicSite from "./components/PublicSite";

function AdminApp() {
  const { isLoggedIn, loading, signOut } = useAdminAuth();
  const [page, setPage] = useState("dashboard");

  if (loading) return null;
  if (!isLoggedIn) return <AdminLogin />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A09" }}>
      <AdminSidebar active={page} onNavigate={setPage} onSignOut={signOut} />
      {page === "dashboard" && <Dashboard />}
      {page === "inventory" && <InventoryManager />}
      {page === "orders" && <OrdersManager />}
      {page === "customers" && <CustomersManager />}
      {page === "content" && <ContentManager />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <AdminApp />
            </AdminAuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
