import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";

const LOW_STOCK_THRESHOLD = 5;
const API_URL = import.meta.env.VITE_API_URL;

function formatPrice(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value);
}

function BottleIcon() {
  return (
    <svg width="40" height="72" viewBox="0 0 40 72" aria-hidden="true">
      <rect x="6" y="22" width="28" height="44" rx="2" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <rect x="14" y="12" width="12" height="12" fill="rgba(237,234,226,0.05)" stroke="#7D8085" strokeWidth="1" />
      <circle cx="20" cy="7" r="6" fill="#0A0A09" stroke="#5A5A57" strokeWidth="1" />
    </svg>
  );
}

// Sube el archivo real a Supabase Storage (bucket "product-images")
// y devuelve la URL pública que se guarda en products.image_url.
async function uploadProductImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

function ImageUploadField({ imageUrl, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setUploadError(null);
    try {
      const publicUrl = await uploadProductImage(file);
      onChange(publicUrl);
    } catch (err) {
      setUploadError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "18px" }}>
      <span style={{ display: "block", color: "#9C9F8E", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
        Foto del producto
      </span>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        style={{ border: `1px dashed ${isDragging ? "#C9CDD3" : "#3A3A38"}`, padding: "16px", display: "flex", alignItems: "center", gap: "16px", background: isDragging ? "rgba(201,205,211,0.04)" : "transparent" }}
      >
        <div style={{ width: "64px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #2A2A26", background: "#0A0A09" }}>
          {imageUrl ? (
            <img src={imageUrl} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <BottleIcon />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "inline-block", color: "#EDEAE2", fontSize: "12px", border: "1px solid #7D8085", padding: "8px 16px", cursor: "pointer" }}>
            {uploading ? "Subiendo..." : imageUrl ? "Cambiar foto" : "Subir foto"}
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} disabled={uploading} />
          </label>
          {imageUrl && !uploading && (
            <button type="button" onClick={() => onChange(null)} style={{ background: "transparent", border: "none", color: "#7C7A72", fontSize: "11px", marginLeft: "12px", cursor: "pointer", textDecoration: "underline" }}>
              Quitar
            </button>
          )}
          {uploadError && <p style={{ color: "#B57A6B", fontSize: "11px", margin: "8px 0 0" }}>{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial || { name: "", brand: "", gender: "Unisex", price: "", stock: "", volume_ml: "", image_url: null }
  );

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
      volume_ml: parseInt(form.volume_ml, 10) || 0,
    });
  };

  const inputStyle = { width: "100%", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "11px 14px", fontSize: "13px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", color: "#9C9F8E", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", zIndex: 50 }}>
      <form onSubmit={handleSubmit} style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "36px", width: "440px", fontFamily: "'Helvetica Neue', Arial, sans-serif", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "20px", margin: "0 0 28px" }}>
          {initial ? "Editar producto" : "Nuevo producto"}
        </h3>

        <ImageUploadField imageUrl={form.image_url} onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))} />

        <div style={{ marginBottom: "18px" }}>
          <span style={labelStyle}>Nombre</span>
          <input style={inputStyle} value={form.name} onChange={handleChange("name")} required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
          <div>
            <span style={labelStyle}>Marca</span>
            <input style={inputStyle} value={form.brand} onChange={handleChange("brand")} required />
          </div>
          <div>
            <span style={labelStyle}>Género</span>
            <select style={inputStyle} value={form.gender} onChange={handleChange("gender")}>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px" }}>
          <div>
            <span style={labelStyle}>Precio</span>
            <input style={inputStyle} type="number" step="0.01" value={form.price} onChange={handleChange("price")} required />
          </div>
          <div>
            <span style={labelStyle}>Stock</span>
            <input style={inputStyle} type="number" value={form.stock} onChange={handleChange("stock")} required />
          </div>
          <div>
            <span style={labelStyle}>Vol. (ml)</span>
            <input style={inputStyle} type="number" value={form.volume_ml} onChange={handleChange("volume_ml")} required />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, background: "transparent", border: "1px solid #3A3A38", color: "#B9B6AC", padding: "13px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={{ flex: 1, background: "#EDEAE2", border: "none", color: "#15140F", padding: "13px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function InventoryManager() {
  const { accessToken, signOut } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).error || "Error al cargar productos");
      setProducts(await res.json());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const url = editingProduct ? `${API_URL}/api/admin/products/${editingProduct.id}` : `${API_URL}/api/admin/products`;
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(data) });
      if (!res.ok) throw new Error((await res.json()).error || "Error al guardar");
      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Desactivar este producto? Ya no se mostrará en el catálogo.")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).error || "Error al eliminar");
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight: "700px", background: "#0A0A09", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <main style={{ padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div>
            <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 8px" }}>
              Panel de administración
            </p>
            <h1 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: 0 }}>
              Inventario
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => { setEditingProduct(null); setShowForm(true); }} style={{ background: "#EDEAE2", border: "none", color: "#15140F", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              + Nuevo producto
            </button>
            <button onClick={signOut} style={{ background: "transparent", border: "1px solid #3A3A38", color: "#7C7A72", padding: "12px 20px", fontSize: "12px", cursor: "pointer" }}>
              Salir
            </button>
          </div>
        </div>

        {loadError && (
          <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
            <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>Error: {loadError}</p>
          </div>
        )}

        {lowStockCount > 0 && (
          <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
            <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>
              {lowStockCount} producto{lowStockCount > 1 ? "s" : ""} con stock bajo (5 unidades o menos).
            </p>
          </div>
        )}

        {loading ? (
          <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando inventario...</p>
        ) : (
          <div style={{ border: "1px solid #3A3A38" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1fr 1fr 100px", background: "#15140F", padding: "16px 24px", borderBottom: "1px solid #3A3A38" }}>
              {["", "Producto", "Marca", "Género", "Precio", "Stock", ""].map((h, i) => (
                <span key={i} style={{ color: "#9C9F8E", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>

            {products.map((product) => (
              <div key={product.id} style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1fr 1fr 100px", padding: "14px 24px", borderBottom: "1px solid #2A2A26", alignItems: "center" }}>
                <div style={{ width: "40px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2A2A26", background: "#0A0A09" }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <BottleIcon />
                  )}
                </div>
                <span style={{ color: "#EDEAE2", fontSize: "14px" }}>{product.name} <span style={{ color: "#7C7A72", fontSize: "12px" }}>({product.volume_ml}ml)</span></span>
                <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{product.brand}</span>
                <span style={{ color: "#B9B6AC", fontSize: "13px" }}>{product.gender}</span>
                <span style={{ color: "#C9CDD3", fontSize: "13px" }}>{formatPrice(product.price)}</span>
                <span style={{ fontSize: "13px", color: product.stock === 0 ? "#B57A6B" : product.stock <= LOW_STOCK_THRESHOLD ? "#D9A08F" : "#8E9184" }}>
                  {product.stock === 0 ? "Agotado" : `${product.stock} u.`}
                </span>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => { setEditingProduct(product); setShowForm(true); }} style={{ background: "transparent", border: "none", color: "#B9B6AC", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ background: "transparent", border: "none", color: "#7C7A72", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ProductForm
          initial={editingProduct}
          saving={saving}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}
