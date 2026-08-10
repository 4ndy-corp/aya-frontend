import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { useIsMobile } from "../hooks/useIsMobile";

const GENDERS = ["Todos", "Hombre", "Mujer", "Unisex"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a mayor" },
];

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

export default function Catalog() {
  const { addItem } = useCart();
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [brand, setBrand] = useState("Todas");
  const [gender, setGender] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(50);
  const [sort, setSort] = useState("relevance");

  // Trae los productos reales de Supabase al montar el componente.
  // Como la tabla `products` tiene la política RLS de "solo activos
  // son públicos", esta consulta ya viene filtrada del lado del
  // servidor - no necesitamos agregar WHERE active = true aquí.
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, gender, notes:fragrance_notes, price, stock, image_url")
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
    return ["Todas", ...uniqueBrands];
  }, [products]);

  const visibleBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter((b) => b === "Todas" || b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchesBrand = brand === "Todas" || p.brand === brand;
      const matchesGender = gender === "Todos" || p.gender === gender;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesBrand && matchesGender && matchesPrice;
    });

    if (sort === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [products, search, brand, gender, maxPrice, sort]);

  return (
    <section
      id="catalogo"
      style={{ background: "#15140F", padding: isMobile ? "56px 20px 72px" : "80px 48px 112px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ color: "#9C9F8E", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 12px" }}>
            Catálogo
          </p>
          <h2 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "34px", margin: 0 }}>
            Todas las fragancias
          </h2>
        </div>

        {loadError && (
          <div style={{ background: "rgba(181,122,107,0.12)", border: "1px solid #B57A6B", padding: "14px 20px", marginBottom: "24px" }}>
            <p style={{ color: "#D9A08F", fontSize: "13px", margin: 0 }}>
              No se pudieron cargar los productos: {loadError}
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "16px", marginBottom: isMobile ? "24px" : "40px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o nota olfativa..."
            style={{ flex: 1, minWidth: "240px", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "14px 18px", fontSize: "14px", outline: "none" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ background: "#15140F", border: "1px solid #3A3A38", color: "#B9B6AC", padding: "14px 18px", fontSize: "13px", outline: "none", cursor: "pointer" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: isMobile ? undefined : "220px 1fr", gap: isMobile ? 0 : "48px" }}>
          <aside style={isMobile ? { display: "flex", gap: "24px", overflowX: "auto", marginBottom: "24px", paddingBottom: "8px" } : undefined}>
            <div style={{ marginBottom: isMobile ? 0 : "40px", flexShrink: 0, maxHeight: isMobile ? "none" : "260px", overflowY: isMobile ? "visible" : "auto" }}>
              <p style={{ color: "#9C9F8E", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "11px", margin: "0 0 16px" }}>Marca</p>
              {!isMobile && brands.length > 8 && (
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Buscar marca..."
                  style={{ width: "100%", background: "transparent", border: "1px solid #3A3A38", color: "#EDEAE2", padding: "8px 10px", fontSize: "12px", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
                />
              )}
              {visibleBrands.map((b) => (
                <button key={b} onClick={() => setBrand(b)} style={{ display: isMobile ? "inline-block" : "block", width: isMobile ? "auto" : "100%", marginRight: isMobile ? "12px" : 0, textAlign: "left", background: "transparent", border: "none", color: brand === b ? "#EDEAE2" : "#7C7A72", fontSize: "13px", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {b}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: isMobile ? 0 : "40px", flexShrink: 0 }}>
              <p style={{ color: "#9C9F8E", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "11px", margin: "0 0 16px" }}>Género</p>
              {GENDERS.map((g) => (
                <button key={g} onClick={() => setGender(g)} style={{ display: isMobile ? "inline-block" : "block", width: isMobile ? "auto" : "100%", marginRight: isMobile ? "12px" : 0, textAlign: "left", background: "transparent", border: "none", color: gender === g ? "#EDEAE2" : "#7C7A72", fontSize: "13px", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {g}
                </button>
              ))}
            </div>

            <div style={{ flexShrink: 0, minWidth: isMobile ? "160px" : "auto" }}>
              <p style={{ color: "#9C9F8E", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "11px", margin: "0 0 16px" }}>Precio máximo</p>
              <input type="range" min="20" max="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: "100%" }} />
              <p style={{ color: "#B9B6AC", fontSize: "13px", marginTop: "8px" }}>Hasta {formatPrice(maxPrice)}</p>
            </div>
          </aside>

          <div>
            {loading ? (
              <p style={{ color: "#7C7A72", fontSize: "14px" }}>Cargando fragancias...</p>
            ) : filtered.length === 0 ? (
              <p style={{ color: "#7C7A72", fontSize: "14px" }}>No hay fragancias que coincidan con esos filtros.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "1px", background: "#3A3A38" }}>
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    style={{ background: "#15140F", padding: isMobile ? "20px 16px" : "36px 28px", display: "flex", flexDirection: "column", gap: "12px", opacity: product.stock === 0 ? 0.45 : 1 }}
                  >
                    <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                      ) : (
                        <BottleIcon />
                      )}
                      {product.stock === 0 && (
                        <span style={{ position: "absolute", top: 0, right: 0, color: "#B57A6B", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Agotado
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ color: "#8E9184", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 6px" }}>
                        {product.brand} · {product.gender}
                      </p>
                      <h3 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "20px", margin: "0 0 8px" }}>
                        {product.name}
                      </h3>
                      <p style={{ color: "#7C7A72", fontSize: "12px", margin: "0 0 14px" }}>{product.notes}</p>
                      <p style={{ color: "#C9CDD3", fontSize: "15px", margin: "0 0 16px" }}>{formatPrice(product.price)}</p>
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
