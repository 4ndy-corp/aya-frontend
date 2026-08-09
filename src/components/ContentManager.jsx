import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "1px solid #3A3A38",
  color: "#EDEAE2",
  padding: "12px 14px",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};
const labelStyle = {
  display: "block",
  color: "#9C9F8E",
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

function Field({ label, textarea, ...props }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <span style={labelStyle}>{label}</span>
      {textarea ? (
        <textarea {...props} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
      ) : (
        <input {...props} style={inputStyle} />
      )}
    </div>
  );
}

function SaveButton({ saved, saving, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        background: saved ? "#8EAE8E" : "#EDEAE2",
        border: "none",
        color: "#15140F",
        padding: "12px 28px",
        fontSize: "12px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: saving ? "default" : "pointer",
        opacity: saving ? 0.6 : 1,
      }}
    >
      {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar cambios"}
    </button>
  );
}

function SectionEditor({ section, title, fields, authHeaders }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      // La lectura de site_content es pública (RLS), se puede leer
      // directo con la anon key, igual que hace la landing.
      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select("*")
        .eq("section", section)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setContent(data || {});
      }
      setLoading(false);
    }
    fetchContent();
  }, [section]);

  const getValue = (key) => {
    if (key.startsWith("extra.")) {
      const subKey = key.split(".")[1];
      return (content.extra && content.extra[subKey]) || "";
    }
    return content[key] || "";
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field.startsWith("extra.")) {
      const subKey = field.split(".")[1];
      setContent((prev) => ({ ...prev, extra: { ...(prev.extra || {}), [subKey]: value } }));
    } else {
      setContent((prev) => ({ ...prev, [field]: value }));
    }
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/content/section/${section}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error al guardar");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "32px", marginBottom: "24px" }}>
        <p style={{ color: "#7C7A72", fontSize: "13px", margin: 0 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "32px", marginBottom: "24px" }}>
      <p style={{ color: "#EDEAE2", fontSize: "15px", margin: "0 0 24px" }}>{title}</p>
      {fields.map((f) => (
        <Field key={f.key} label={f.label} textarea={f.textarea} value={getValue(f.key)} onChange={handleChange(f.key)} />
      ))}
      {error && <p style={{ color: "#B57A6B", fontSize: "12px", margin: "0 0 16px" }}>{error}</p>}
      <SaveButton saved={saved} saving={saving} onClick={handleSave} />
    </div>
  );
}

function TestimonialsEditor({ authHeaders }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/content/testimonials`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).error || "Error al cargar testimonios");
      setTestimonials(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (t) => {
    const res = await fetch(`${API_URL}/api/admin/content/testimonials/${t.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ...t, active: !t.active }),
    });
    if (res.ok) fetchTestimonials();
  };

  const removeTestimonial = async (id) => {
    if (!confirm("¿Eliminar este testimonio?")) return;
    const res = await fetch(`${API_URL}/api/admin/content/testimonials/${id}`, { method: "DELETE", headers: authHeaders });
    if (res.ok) fetchTestimonials();
  };

  const addTestimonial = async () => {
    const res = await fetch(`${API_URL}/api/admin/content/testimonials`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ customer_name: "Nuevo cliente", comment: "Escribe aquí el comentario...", rating: 5 }),
    });
    if (res.ok) fetchTestimonials();
  };

  const updateField = async (t, field, value) => {
    setTestimonials((prev) => prev.map((item) => (item.id === t.id ? { ...item, [field]: value } : item)));
  };

  const saveTestimonial = async (t) => {
    await fetch(`${API_URL}/api/admin/content/testimonials/${t.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(t),
    });
  };

  if (loading) {
    return (
      <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "32px" }}>
        <p style={{ color: "#7C7A72", fontSize: "13px", margin: 0 }}>Cargando testimonios...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#15140F", border: "1px solid #3A3A38", padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <p style={{ color: "#EDEAE2", fontSize: "15px", margin: 0 }}>Testimonios</p>
        <button onClick={addTestimonial} style={{ background: "transparent", border: "1px solid #7D8085", color: "#EDEAE2", padding: "8px 16px", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
          + Agregar
        </button>
      </div>

      {error && <p style={{ color: "#B57A6B", fontSize: "12px", margin: "0 0 16px" }}>{error}</p>}

      {testimonials.map((t) => (
        <div key={t.id} style={{ border: "1px solid #2A2A26", padding: "20px", marginBottom: "16px", opacity: t.active ? 1 : 0.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <input
              value={t.customer_name || ""}
              onChange={(e) => updateField(t, "customer_name", e.target.value)}
              onBlur={() => saveTestimonial(t)}
              style={{ ...inputStyle, width: "auto", flex: 1, marginRight: "12px" }}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9C9F8E", fontSize: "11px", cursor: "pointer" }}>
                <input type="checkbox" checked={t.active} onChange={() => toggleActive(t)} />
                Visible
              </label>
              <button onClick={() => removeTestimonial(t.id)} style={{ background: "transparent", border: "none", color: "#7C7A72", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>
                Eliminar
              </button>
            </div>
          </div>
          <textarea
            value={t.comment || ""}
            onChange={(e) => updateField(t, "comment", e.target.value)}
            onBlur={() => saveTestimonial(t)}
            style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
          />
        </div>
      ))}
    </div>
  );
}

export default function ContentManager() {
  const { accessToken } = useAdminAuth();
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` };

  return (
    <main style={{ flex: 1, padding: "40px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <p style={{ color: "#9C9F8E", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "12px", margin: "0 0 8px" }}>
        Panel de administración
      </p>
      <h1 style={{ color: "#EDEAE2", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: "28px", margin: "0 0 32px" }}>
        Contenido de la web
      </h1>

      <SectionEditor
        section="hero"
        title="Sección Hero (portada)"
        authHeaders={authHeaders}
        fields={[
          { key: "title", label: "Título principal" },
          { key: "subtitle", label: "Subtítulo", textarea: true },
        ]}
      />

      <SectionEditor
        section="about"
        title='Sección "Sobre la marca"'
        authHeaders={authHeaders}
        fields={[
          { key: "title", label: "Título" },
          { key: "body_text", label: "Texto", textarea: true },
        ]}
      />

      <SectionEditor
        section="contact"
        title="Contacto (footer)"
        authHeaders={authHeaders}
        fields={[
          { key: "title", label: "Correo de contacto" },
          { key: "subtitle", label: "Teléfono" },
          { key: "extra.instagram", label: "Link de Instagram" },
          { key: "extra.tiktok", label: "Link de TikTok" },
          { key: "extra.whatsapp", label: "Link de WhatsApp" },
        ]}
      />

      <TestimonialsEditor authHeaders={authHeaders} />
    </main>
  );
}
