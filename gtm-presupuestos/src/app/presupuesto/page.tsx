"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { LineItem, PresupuestoData, PresupuestoGuardado } from "@/types/presupuesto";
import { guardarPresupuesto, listarPresupuestos, eliminarPresupuesto } from "@/lib/presupuestos";

const PresupuestoPrint = dynamic(() => import("@/components/PresupuestoPrint"), { ssr: false });

const EMPTY_ITEM: LineItem = { cantidad: "", descripcion: "", importe: "" };
const EMPTY_DATA: PresupuestoData = {
  nombre: "",
  vehiculo: "",
  items: [{ ...EMPTY_ITEM }],
  total: "",
};

export default function PresupuestoPage() {
  const [tab, setTab] = useState<"nuevo" | "historial">("nuevo");
  const [formData, setFormData] = useState<PresupuestoData>(EMPTY_DATA);
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [printHeight, setPrintHeight] = useState(1050);
  const printRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const [historial, setHistorial] = useState<PresupuestoGuardado[]>([]);
  const [historialLoaded, setHistorialLoaded] = useState(false);
  const [historialLoading, setHistorialLoading] = useState(false);

  useEffect(() => {
    const calc = () => setPreviewScale(Math.min(1, (window.innerWidth - 340) / 794));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    if (showPreview && printRef.current) {
      const h = printRef.current.scrollHeight;
      if (h > 0) setPrintHeight(h);
    }
  }, [showPreview, formData]);

  const loadHistorial = useCallback(async () => {
    if (historialLoaded) return;
    setHistorialLoading(true);
    try {
      const list = await listarPresupuestos();
      setHistorial(list);
      setHistorialLoaded(true);
    } finally {
      setHistorialLoading(false);
    }
  }, [historialLoaded]);

  const handleTabChange = (t: "nuevo" | "historial") => {
    setTab(t);
    if (t === "historial") loadHistorial();
  };

  const updateItem = (i: number, field: keyof LineItem, value: string) => {
    const items = [...formData.items];
    items[i] = { ...items[i], [field]: value };
    setFormData((prev) => ({ ...prev, items }));
  };

  const removeItem = (i: number) => {
    const items = formData.items.filter((_, idx) => idx !== i);
    setFormData((prev) => ({ ...prev, items: items.length ? items : [{ ...EMPTY_ITEM }] }));
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  };

  const handleGuardar = async () => {
    try {
      await guardarPresupuesto(formData);
      setSaved(true);
      setHistorialLoaded(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminar = async (id: string) => {
    await eliminarPresupuesto(id);
    setHistorial((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCargar = (p: PresupuestoGuardado) => {
    setFormData({ nombre: p.nombre, vehiculo: p.vehiculo, items: p.items, total: p.total });
    setSaved(false);
    setShowPreview(false);
    setTab("nuevo");
  };

  const formatFecha = (d: Date) => {
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  const formatTotal = (t: string) => {
    const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
    if (isNaN(n)) return t;
    return `$${n.toLocaleString("es-AR")}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0e0e0e", color: "#f0f0f0", fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>
      {/* TOPBAR */}
      <div style={{ borderBottom: "1px solid #2a2a2a", padding: "0 24px", display: "flex", alignItems: "center", gap: "24px", height: "52px" }}>
        <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "1px", color: "#fff" }}>
          GTM · Presupuestos
        </span>
        <div style={{ display: "flex", gap: "4px", marginLeft: "16px" }}>
          <button
            onClick={() => handleTabChange("nuevo")}
            style={{
              padding: "6px 18px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              backgroundColor: tab === "nuevo" ? "#C0392B" : "transparent",
              color: tab === "nuevo" ? "#fff" : "#999",
              transition: "all 0.15s",
            }}
          >
            Nuevo
          </button>
          <button
            onClick={() => handleTabChange("historial")}
            style={{
              padding: "6px 18px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              backgroundColor: tab === "historial" ? "#C0392B" : "transparent",
              color: tab === "historial" ? "#fff" : "#999",
              transition: "all 0.15s",
            }}
          >
            Historial
          </button>
        </div>
      </div>

      {/* TAB NUEVO */}
      {tab === "nuevo" && (
        <div style={{ display: "flex", gap: "24px", padding: "24px", alignItems: "flex-start" }}>
          {/* LEFT COLUMN */}
          <div style={{ flex: "0 0 420px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* MANUAL EDIT Card */}
            <div style={{ backgroundColor: "#161616", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "12px", color: "#ccc", letterSpacing: "0.5px" }}>
                EDITAR MANUALMENTE
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "4px" }}>NOMBRE</label>
                  <input
                    value={formData.nombre}
                    onChange={(e) => setFormData((p) => ({ ...p, nombre: e.target.value }))}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                    onBlur={(e) => (e.target.style.borderColor = "#333")}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "4px" }}>VEHÍCULO</label>
                  <input
                    value={formData.vehiculo}
                    onChange={(e) => setFormData((p) => ({ ...p, vehiculo: e.target.value }))}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                    onBlur={(e) => (e.target.style.borderColor = "#333")}
                  />
                </div>
              </div>

              {/* Items grid */}
              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 28px", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Cant.</span>
                  <span style={{ fontSize: "10px", color: "#555", textTransform: "uppercase" }}>Descripción</span>
                  <span />
                </div>
                {formData.items.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 28px", gap: "4px", marginBottom: "4px" }}>
                    <input
                      value={item.cantidad}
                      onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                      placeholder="1"
                      style={{ ...inputStyle, fontFamily: "Courier New, monospace", textAlign: "center", padding: "6px 4px" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                      onBlur={(e) => (e.target.style.borderColor = "#333")}
                    />
                    <input
                      value={item.descripcion}
                      onChange={(e) => updateItem(i, "descripcion", e.target.value.toUpperCase())}
                      placeholder="DESCRIPCIÓN"
                      style={{ ...inputStyle, padding: "6px 8px", textTransform: "uppercase" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                      onBlur={(e) => (e.target.style.borderColor = "#333")}
                    />
                    <button
                      onClick={() => removeItem(i)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #333",
                        borderRadius: "4px",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#e05555"; e.currentTarget.style.borderColor = "#e05555"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#333"; }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                style={{
                  backgroundColor: "transparent",
                  border: "1px dashed #333",
                  borderRadius: "4px",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "12px",
                  padding: "6px 12px",
                  width: "100%",
                  marginBottom: "12px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C0392B"; e.currentTarget.style.color = "#C0392B"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#666"; }}
              >
                + agregar fila
              </button>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "4px" }}>TOTAL $</label>
                <input
                  value={formData.total}
                  onChange={(e) => setFormData((p) => ({ ...p, total: e.target.value }))}
                  placeholder="0"
                  style={{
                    ...inputStyle,
                    fontFamily: "Courier New, monospace",
                    fontSize: "18px",
                    color: "#C0392B",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                  onBlur={(e) => (e.target.style.borderColor = "#333")}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => { setShowPreview(true); setSaved(false); }}
                  style={{ ...btnPrimary, flex: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e04030")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C0392B")}
                >
                  Ver preview
                </button>
                <button
                  onClick={() => { setFormData(EMPTY_DATA); setShowPreview(false); setSaved(false); }}
                  style={{ ...btnSecondary }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#222"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — PREVIEW */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {showPreview ? (
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <button
                    onClick={handleGuardar}
                    disabled={saved}
                    style={{
                      backgroundColor: saved ? "#1a4a1a" : "#C0392B",
                      color: saved ? "#4caf50" : "#fff",
                      border: saved ? "1px solid #4caf50" : "none",
                      borderRadius: "4px",
                      padding: "8px 20px",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: saved ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!saved) e.currentTarget.style.backgroundColor = "#e04030"; }}
                    onMouseLeave={(e) => { if (!saved) e.currentTarget.style.backgroundColor = "#C0392B"; }}
                  >
                    {saved ? "✓ Guardado" : "Guardar"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    style={{ ...btnSecondary, padding: "8px 20px" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#222"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    🖨 Imprimir / PDF
                  </button>
                </div>
                <div id="print-preview-container" style={{ border: "1px solid #2a2a2a", borderRadius: "4px", width: `${794 * previewScale}px`, height: `${printHeight * previewScale}px`, overflow: "hidden" }}>
                  <div id="print-scale-wrapper" ref={printRef} style={{ width: "794px", transformOrigin: "top left", transform: `scale(${previewScale})` }}>
                    <PresupuestoPrint data={formData} />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px dashed #2a2a2a",
                  borderRadius: "8px",
                  color: "#444",
                  fontSize: "14px",
                }}
              >
                El presupuesto aparecerá acá
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB HISTORIAL */}
      {tab === "historial" && (
        <div style={{ padding: "24px", maxWidth: "900px" }}>
          {historialLoading && (
            <div style={{ color: "#666", fontSize: "13px" }}>Cargando...</div>
          )}
          {!historialLoading && historial.length === 0 && (
            <div style={{ color: "#444", fontSize: "13px" }}>No hay presupuestos guardados.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {historial.map((p) => (
              <HistorialCard
                key={p.id}
                presupuesto={p}
                formatFecha={formatFecha}
                formatTotal={formatTotal}
                onCargar={handleCargar}
                onEliminar={handleEliminar}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HistorialCard({
  presupuesto,
  formatFecha,
  formatTotal,
  onCargar,
  onEliminar,
}: {
  presupuesto: PresupuestoGuardado;
  formatFecha: (d: Date) => string;
  formatTotal: (t: string) => string;
  onCargar: (p: PresupuestoGuardado) => void;
  onEliminar: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: "#161616",
        border: `1px solid ${hover ? "#333" : "#2a2a2a"}`,
        borderRadius: "6px",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "border-color 0.15s",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: "14px", color: "#f0f0f0" }}>{presupuesto.nombre}</div>
        <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
          {presupuesto.vehiculo} · {presupuesto.items.filter((i) => i.descripcion).length} ítems
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Courier New, monospace", fontSize: "15px", color: "#C0392B", fontWeight: 700 }}>
            {formatTotal(presupuesto.total)}
          </div>
          <div style={{ fontSize: "11px", color: "#555" }}>{formatFecha(presupuesto.creadoEn)}</div>
        </div>
        {hover && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => onCargar(presupuesto)}
              style={{
                backgroundColor: "#C0392B",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cargar
            </button>
            <button
              onClick={() => onEliminar(presupuesto.id)}
              style={{
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #333",
                borderRadius: "4px",
                padding: "5px 10px",
                fontSize: "13px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#e05555"; e.currentTarget.style.borderColor = "#e05555"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = "#333"; }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#0e0e0e",
  border: "1px solid #333",
  borderRadius: "4px",
  color: "#f0f0f0",
  padding: "7px 10px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  backgroundColor: "#C0392B",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: "13px",
  cursor: "pointer",
  transition: "background 0.15s",
};

const btnSecondary: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#999",
  border: "1px solid #333",
  borderRadius: "4px",
  padding: "9px 16px",
  fontWeight: 600,
  fontSize: "13px",
  cursor: "pointer",
  transition: "background 0.15s",
};
