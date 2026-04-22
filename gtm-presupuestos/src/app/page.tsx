"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import type {
  LineItem,
  PresupuestoData,
  PresupuestoGuardado,
} from "@/types/presupuesto";
import {
  guardarPresupuesto,
  listarPresupuestos,
  eliminarPresupuesto,
} from "@/lib/presupuestos";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/useIsMobile";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const PresupuestoPrint = dynamic(
  () => import("@/components/PresupuestoPrint"),
  { ssr: false }
);

const BLUE = "#0ea5e9";
const BLUE_DARK = "#0369a1";
const BLUE_DEEP = "#0c1a2e";
const BLUE_MID = "#0f2744";
const ACCENT = "#38bdf8";
const NEON = "#00d4ff";

const EMPTY_ITEM: LineItem = { cantidad: "", descripcion: "", importe: "" };
const EMPTY_DATA: PresupuestoData = {
  nombre: "",
  vehiculo: "",
  items: [{ ...EMPTY_ITEM }],
  total: "",
  moneda: "ARS",
};

export default function PresupuestoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<"nuevo" | "historial">("nuevo");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [formData, setFormData] = useState<PresupuestoData>(EMPTY_DATA);
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [printHeight, setPrintHeight] = useState(1050);
  const printRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [historial, setHistorial] = useState<PresupuestoGuardado[]>([]);
  const [historialLoaded, setHistorialLoaded] = useState(false);
  const [historialLoading, setHistorialLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 768) {
        const available = w - 32;
        setPreviewScale(Math.min(1, available / 794));
      } else {
        const available = w - 340;
        setPreviewScale(Math.min(1, available / 794));
      }
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const [descargando, setDescargando] = useState(false);

  const handleCompartir = async () => {
    const original = document.getElementById("print-area");
    if (!original) return;

    setDescargando(true);

    try {
      const existing = document.getElementById("print-clone");
      if (existing) existing.remove();

      const clone = original.cloneNode(true) as HTMLElement;
      clone.id = "print-clone";
      clone.style.transform = "none";
      clone.style.width = "210mm";
      clone.style.height = "297mm";
      clone.style.minHeight = "0";
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      clone.remove();

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);

      const fileName = formData.nombre
        ? `Presupuesto_${formData.nombre.replace(/\s+/g, "_")}.pdf`
        : "Presupuesto.pdf";
      pdf.save(fileName);
    } catch {
      window.print();
    } finally {
      setDescargando(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showPreview && printRef.current) {
      const h = printRef.current.scrollHeight;
      if (h > 0) setPrintHeight(h);
    }
  }, [showPreview, formData]);

  useEffect(() => {
    setSaved(false);
    setSaveError(null);
  }, [formData]);

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
    setFormData((prev) => ({
      ...prev,
      items: items.length ? items : [{ ...EMPTY_ITEM }],
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }],
    }));
  };

  const handleGuardar = async () => {
    if (saving || saved) return;
    setSaving(true);
    setSaveError(null);
    try {
      await guardarPresupuesto(formData);
      setSaved(true);
      setHistorialLoaded(false);
    } catch (e) {
      console.error(e);
      setSaveError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: string) => {
    await eliminarPresupuesto(id);
    setHistorial((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCargar = (p: PresupuestoGuardado) => {
    setFormData({
      nombre: p.nombre,
      vehiculo: p.vehiculo,
      items: p.items,
      total: p.total,
      moneda: p.moneda || "ARS",
    });
    setSaved(false);
    setShowPreview(false);
    setMobileView("form");
    setTab("nuevo");
  };

  const formatFecha = (d: Date) => {
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTotal = (t: string, moneda: "ARS" | "USD" = "ARS") => {
    const n = parseFloat(t.replace(/\./g, "").replace(",", "."));
    if (isNaN(n)) return t;
    if (moneda === "USD") return `${n.toLocaleString("es-AR")} usd`;
    return `$${n.toLocaleString("es-AR")}`;
  };

  const handleVerPreview = () => {
    setShowPreview(true);
    if (isMobile) setMobileView("preview");
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: BLUE_DEEP,
          color: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-orbitron), sans-serif",
          letterSpacing: "3px",
          fontSize: "13px",
        }}
      >
        CARGANDO...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BLUE_DEEP,
        color: "#e2f0ff",
        fontFamily: "var(--font-rajdhani), 'Arial', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* GRID PATTERN BACKGROUND */}
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 0,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="page-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={NEON}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-grid)" />
      </svg>

      {/* TOP NEON ACCENT BAR */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, transparent 0%, ${NEON} 40%, ${BLUE} 100%)`,
          position: "relative",
          zIndex: 2,
        }}
      />

      {/* TOPBAR */}
      <div
        style={{
          borderBottom: `1px solid ${BLUE}33`,
          padding: isMobile ? "0 12px" : "0 28px",
          display: "flex",
          alignItems: isMobile ? "center" : "center",
          flexWrap: isMobile ? "wrap" : "nowrap",
          gap: isMobile ? "8px" : "24px",
          minHeight: isMobile ? "auto" : "60px",
          paddingTop: isMobile ? "10px" : "0",
          paddingBottom: isMobile ? "10px" : "0",
          position: "relative",
          zIndex: 2,
          background: `linear-gradient(180deg, ${BLUE_MID}cc 0%, ${BLUE_DEEP}aa 100%)`,
          boxShadow: `0 1px 0 ${NEON}22`,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: isMobile ? "13px" : "16px",
            letterSpacing: isMobile ? "2px" : "4px",
            color: "#ffffff",
            fontFamily: "var(--font-orbitron), sans-serif",
            textShadow: `0 0 14px ${BLUE}66`,
          }}
        >
          GTM <span style={{ color: NEON }}>·</span> PRESUPUESTOS
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "transparent",
            color: `${ACCENT}cc`,
            border: `1px solid ${BLUE}55`,
            borderRadius: "4px",
            padding: isMobile ? "5px 10px" : "7px 14px",
            fontSize: isMobile ? "10px" : "11px",
            fontWeight: 700,
            letterSpacing: "2px",
            cursor: "pointer",
            fontFamily: "var(--font-orbitron), sans-serif",
            marginLeft: "auto",
          }}
        >
          SALIR
        </button>
        <div
          style={{
            display: "flex",
            gap: "6px",
            width: isMobile ? "100%" : "auto",
            order: isMobile ? 3 : 0,
          }}
        >
          <button
            onClick={() => handleTabChange("nuevo")}
            style={{
              ...tabBtn(tab === "nuevo"),
              flex: isMobile ? 1 : undefined,
              padding: isMobile ? "8px 12px" : "8px 22px",
            }}
          >
            NUEVO
          </button>
          <button
            onClick={() => handleTabChange("historial")}
            style={{
              ...tabBtn(tab === "historial"),
              flex: isMobile ? 1 : undefined,
              padding: isMobile ? "8px 12px" : "8px 22px",
            }}
          >
            HISTORIAL
          </button>
        </div>
      </div>

      {/* TAB NUEVO */}
      {tab === "nuevo" && (
        <>
          {/* Mobile sub-tabs: EDITAR / PREVIEW */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "12px 12px 0",
                position: "relative",
                zIndex: 1,
              }}
            >
              <button
                onClick={() => setMobileView("form")}
                style={{
                  ...mobileSubTab(mobileView === "form"),
                  flex: 1,
                }}
              >
                EDITAR
              </button>
              <button
                onClick={() => {
                  setShowPreview(true);
                  setMobileView("preview");
                }}
                style={{
                  ...mobileSubTab(mobileView === "preview"),
                  flex: 1,
                }}
              >
                PREVIEW
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "24px",
              padding: isMobile ? "12px" : "24px",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* LEFT COLUMN — FORM */}
            {(!isMobile || mobileView === "form") && (
              <div
                style={{
                  flex: isMobile ? "1 1 auto" : "0 0 420px",
                  width: isMobile ? "100%" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{
                  ...cardStyle,
                  padding: isMobile ? "16px" : "22px",
                }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: isMobile ? "11px" : "13px",
                      marginBottom: isMobile ? "12px" : "16px",
                      color: NEON,
                      letterSpacing: isMobile ? "2px" : "4px",
                      fontFamily: "var(--font-orbitron), sans-serif",
                      textShadow: `0 0 8px ${NEON}55`,
                    }}
                  >
                    EDITAR MANUALMENTE
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={fieldLabelStyle}>NOMBRE</label>
                      <input
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, nombre: e.target.value }))
                        }
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = NEON)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = `${BLUE}55`)
                        }
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={fieldLabelStyle}>VEHÍCULO</label>
                      <input
                        value={formData.vehiculo}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            vehiculo: e.target.value,
                          }))
                        }
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = NEON)}
                        onBlur={(e) =>
                          (e.target.style.borderColor = `${BLUE}55`)
                        }
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    {isMobile ? (
                      /* Mobile: stacked item cards */
                      formData.items.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            border: `1px solid ${BLUE}33`,
                            borderRadius: "4px",
                            padding: "10px",
                            marginBottom: "8px",
                            background: `${BLUE_DEEP}88`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                color: `${ACCENT}88`,
                                letterSpacing: "2px",
                                fontFamily: "var(--font-orbitron), sans-serif",
                              }}
                            >
                              ÍTEM {i + 1}
                            </span>
                            <button
                              onClick={() => removeItem(i)}
                              style={{
                                backgroundColor: "transparent",
                                border: `1px solid ${BLUE}55`,
                                borderRadius: "4px",
                                color: `${BLUE}aa`,
                                cursor: "pointer",
                                fontSize: "14px",
                                width: "28px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ×
                            </button>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              marginBottom: "6px",
                            }}
                          >
                            <div style={{ width: "60px" }}>
                              <label style={fieldLabelStyle}>CANT.</label>
                              <input
                                value={item.cantidad}
                                onChange={(e) =>
                                  updateItem(i, "cantidad", e.target.value)
                                }
                                placeholder="1"
                                style={{
                                  ...inputStyle,
                                  fontFamily:
                                    "var(--font-orbitron), monospace",
                                  textAlign: "center",
                                  padding: "6px 4px",
                                  color: NEON,
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = NEON)
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor = `${BLUE}55`)
                                }
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={fieldLabelStyle}>DESCRIPCIÓN</label>
                              <input
                                value={item.descripcion}
                                onChange={(e) =>
                                  updateItem(
                                    i,
                                    "descripcion",
                                    e.target.value.toUpperCase()
                                  )
                                }
                                placeholder="DESCRIPCIÓN"
                                style={{
                                  ...inputStyle,
                                  padding: "6px 8px",
                                  textTransform: "uppercase",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderColor = NEON)
                                }
                                onBlur={(e) =>
                                  (e.target.style.borderColor = `${BLUE}55`)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Desktop: grid rows */
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "70px 1fr 28px",
                            gap: "4px",
                            marginBottom: "6px",
                          }}
                        >
                          <span style={fieldLabelStyle}>CANT.</span>
                          <span style={fieldLabelStyle}>DESCRIPCIÓN</span>
                          <span />
                        </div>
                        {formData.items.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "70px 1fr 28px",
                              gap: "4px",
                              marginBottom: "4px",
                            }}
                          >
                            <input
                              value={item.cantidad}
                              onChange={(e) =>
                                updateItem(i, "cantidad", e.target.value)
                              }
                              placeholder="1"
                              style={{
                                ...inputStyle,
                                fontFamily: "var(--font-orbitron), monospace",
                                textAlign: "center",
                                padding: "6px 4px",
                                color: NEON,
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = NEON)
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = `${BLUE}55`)
                              }
                            />
                            <input
                              value={item.descripcion}
                              onChange={(e) =>
                                updateItem(
                                  i,
                                  "descripcion",
                                  e.target.value.toUpperCase()
                                )
                              }
                              placeholder="DESCRIPCIÓN"
                              style={{
                                ...inputStyle,
                                padding: "6px 8px",
                                textTransform: "uppercase",
                              }}
                              onFocus={(e) =>
                                (e.target.style.borderColor = NEON)
                              }
                              onBlur={(e) =>
                                (e.target.style.borderColor = `${BLUE}55`)
                              }
                            />
                            <button
                              onClick={() => removeItem(i)}
                              style={{
                                backgroundColor: "transparent",
                                border: `1px solid ${BLUE}55`,
                                borderRadius: "4px",
                                color: `${BLUE}aa`,
                                cursor: "pointer",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = NEON;
                                e.currentTarget.style.borderColor = NEON;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = `${BLUE}aa`;
                                e.currentTarget.style.borderColor = `${BLUE}55`;
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <button
                    onClick={addItem}
                    style={{
                      backgroundColor: "transparent",
                      border: `1px dashed ${BLUE}66`,
                      borderRadius: "4px",
                      color: `${ACCENT}bb`,
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      padding: "8px 12px",
                      width: "100%",
                      marginBottom: "14px",
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      textTransform: "uppercase",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = NEON;
                      e.currentTarget.style.color = NEON;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${BLUE}66`;
                      e.currentTarget.style.color = `${ACCENT}bb`;
                    }}
                  >
                    + agregar fila
                  </button>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={fieldLabelStyle}>MONEDA</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      {(["ARS", "USD"] as const).map((m) => {
                        const active = formData.moneda === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({ ...p, moneda: m }))
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              fontSize: "12px",
                              fontWeight: 800,
                              letterSpacing: "2px",
                              fontFamily: "var(--font-orbitron), sans-serif",
                              cursor: "pointer",
                              borderRadius: "3px",
                              border: active
                                ? `1px solid ${NEON}`
                                : `1px solid ${BLUE}55`,
                              background: active
                                ? `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`
                                : "transparent",
                              color: active ? "#fff" : `${ACCENT}aa`,
                              boxShadow: active
                                ? `0 0 12px ${NEON}55`
                                : "none",
                              transition: "all 0.15s",
                            }}
                          >
                            {m === "ARS" ? "$ PESOS" : "USD"}
                          </button>
                        );
                      })}
                    </div>
                    <label style={fieldLabelStyle}>
                      {formData.moneda === "USD" ? "TOTAL USD" : "TOTAL $"}
                    </label>
                    <input
                      value={formData.total}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, total: e.target.value }))
                      }
                      placeholder="0"
                      style={{
                        ...inputStyle,
                        fontFamily: "var(--font-orbitron), monospace",
                        fontSize: "20px",
                        color: NEON,
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = NEON)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = `${BLUE}55`)
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={handleVerPreview}
                      style={{
                        ...btnSecondary,
                        flex: "1 1 100px",
                        padding: "10px 18px",
                      }}
                    >
                      VER PREVIEW
                    </button>
                    <button
                      onClick={handleGuardar}
                      disabled={saving || saved}
                      style={
                        saved
                          ? {
                              ...btnPrimary,
                              flex: "1 1 100px",
                              padding: "10px 18px",
                              background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE_MID})`,
                              color: NEON,
                              cursor: "default",
                            }
                          : {
                              ...btnPrimary,
                              flex: "1 1 100px",
                              padding: "10px 18px",
                              opacity: saving ? 0.6 : 1,
                              cursor: saving ? "wait" : "pointer",
                            }
                      }
                    >
                      {saved
                        ? "✓ GUARDADO"
                        : saving
                          ? "GUARDANDO..."
                          : "GUARDAR"}
                    </button>
                    <button
                      onClick={() => {
                        setFormData(EMPTY_DATA);
                        setShowPreview(false);
                        setSaved(false);
                        setSaveError(null);
                      }}
                      style={{
                        ...btnSecondary,
                        flex: isMobile ? "1 1 100%" : undefined,
                        padding: "10px 18px",
                      }}
                    >
                      LIMPIAR
                    </button>
                  </div>
                  {saveError && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        border: `1px solid #ff5577`,
                        borderLeft: `3px solid #ff5577`,
                        background: "#3a0e1a",
                        color: "#ffb3c1",
                        fontSize: "12px",
                        letterSpacing: "1px",
                        borderRadius: "3px",
                      }}
                    >
                      {saveError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT COLUMN — PREVIEW */}
            {(!isMobile || mobileView === "preview") && (
              <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
                {showPreview ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "14px",
                      }}
                    >
                      <button
                        onClick={handleGuardar}
                        disabled={saved}
                        style={
                          saved
                            ? {
                                background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE_MID})`,
                                color: NEON,
                                border: `1px solid ${NEON}`,
                                borderRadius: "4px",
                                padding: "10px 22px",
                                fontWeight: 800,
                                fontSize: isMobile ? "11px" : "13px",
                                letterSpacing: "3px",
                                fontFamily: "var(--font-orbitron), sans-serif",
                                cursor: "default",
                                boxShadow: `0 0 12px ${NEON}55`,
                                flex: isMobile ? 1 : undefined,
                              }
                            : {
                                ...btnPrimary,
                                padding: "10px 22px",
                                flex: isMobile ? 1 : undefined,
                              }
                        }
                      >
                        {saved ? "✓ GUARDADO" : "GUARDAR"}
                      </button>
                      <button
                        onClick={handleCompartir}
                        disabled={descargando}
                        style={{
                          ...btnSecondary,
                          padding: "10px 22px",
                          flex: isMobile ? 1 : undefined,
                          opacity: descargando ? 0.6 : 1,
                        }}
                      >
                        {descargando ? "DESCARGANDO..." : "DESCARGAR PDF"}
                      </button>
                    </div>
                    <div
                      id="print-preview-container"
                      style={{
                        border: `1px solid ${BLUE}55`,
                        borderRadius: "4px",
                        width: isMobile ? "100%" : `${794 * previewScale}px`,
                        height: `${printHeight * previewScale}px`,
                        overflow: "hidden",
                        boxShadow: `0 0 30px ${BLUE}33`,
                      }}
                    >
                      <div
                        id="print-scale-wrapper"
                        ref={printRef}
                        style={{
                          width: "794px",
                          transformOrigin: "top left",
                          transform: `scale(${previewScale})`,
                        }}
                      >
                        <PresupuestoPrint data={formData} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: isMobile ? "200px" : "400px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "0 16px",
                      border: `1px dashed ${BLUE}55`,
                      borderRadius: "8px",
                      color: `${ACCENT}88`,
                      fontSize: isMobile ? "12px" : "14px",
                      letterSpacing: "3px",
                      fontFamily: "var(--font-orbitron), sans-serif",
                      background: `linear-gradient(135deg, ${BLUE_MID}66, ${BLUE_DEEP}88)`,
                    }}
                  >
                    EL PRESUPUESTO APARECERÁ ACÁ
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB HISTORIAL */}
      {tab === "historial" && (
        <div
          style={{
            padding: isMobile ? "12px" : "24px",
            maxWidth: "900px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {historialLoading && (
            <div
              style={{
                color: ACCENT,
                fontSize: "13px",
                letterSpacing: "3px",
                fontFamily: "var(--font-orbitron), sans-serif",
              }}
            >
              CARGANDO...
            </div>
          )}
          {!historialLoading && historial.length === 0 && (
            <div
              style={{
                color: `${BLUE}aa`,
                fontSize: "13px",
                letterSpacing: "2px",
              }}
            >
              No hay presupuestos guardados.
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {historial.map((p) => (
              <HistorialCard
                key={p.id}
                presupuesto={p}
                formatFecha={formatFecha}
                formatTotal={formatTotal}
                onCargar={handleCargar}
                onEliminar={handleEliminar}
                isMobile={isMobile}
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
  isMobile,
}: {
  presupuesto: PresupuestoGuardado;
  formatFecha: (d: Date) => string;
  formatTotal: (t: string, moneda?: "ARS" | "USD") => string;
  onCargar: (p: PresupuestoGuardado) => void;
  onEliminar: (id: string) => void;
  isMobile: boolean;
}) {
  const [hover, setHover] = useState(false);
  const showActions = isMobile || hover;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: `linear-gradient(135deg, ${BLUE_MID}ee, ${BLUE_DEEP}cc)`,
        border: `1px solid ${hover ? NEON : `${BLUE}44`}`,
        borderLeft: `3px solid ${hover ? NEON : `${BLUE}88`}`,
        borderRadius: "4px",
        padding: isMobile ? "12px" : "14px 18px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? "10px" : "0",
        transition: "all 0.15s",
        boxShadow: hover ? `0 0 16px ${NEON}33` : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: isMobile ? "14px" : "16px",
              color: "#e2f0ff",
              letterSpacing: "1px",
            }}
          >
            {presupuesto.nombre}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: `${ACCENT}99`,
              marginTop: "3px",
              letterSpacing: "1px",
            }}
          >
            {presupuesto.vehiculo} ·{" "}
            {presupuesto.items.filter((i) => i.descripcion).length} ítems
          </div>
        </div>
        {isMobile && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                fontSize: "14px",
                color: NEON,
                fontWeight: 700,
                textShadow: `0 0 10px ${NEON}55`,
              }}
            >
              {formatTotal(presupuesto.total, presupuesto.moneda)}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: `${BLUE}aa`,
                marginTop: "2px",
                letterSpacing: "1px",
              }}
            >
              {formatFecha(presupuesto.creadoEn)}
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "8px" : "16px",
          justifyContent: "flex-end",
        }}
      >
        {!isMobile && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                fontSize: "16px",
                color: NEON,
                fontWeight: 700,
                textShadow: `0 0 10px ${NEON}55`,
              }}
            >
              {formatTotal(presupuesto.total, presupuesto.moneda)}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: `${BLUE}aa`,
                marginTop: "2px",
                letterSpacing: "1px",
              }}
            >
              {formatFecha(presupuesto.creadoEn)}
            </div>
          </div>
        )}
        {showActions && (
          <div style={{ display: "flex", gap: "6px", flex: isMobile ? 1 : undefined }}>
            <button
              onClick={() => onCargar(presupuesto)}
              style={{
                background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`,
                color: "#fff",
                border: `1px solid ${NEON}`,
                borderRadius: "4px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "2px",
                cursor: "pointer",
                fontFamily: "var(--font-orbitron), sans-serif",
                boxShadow: `0 0 10px ${NEON}55`,
                flex: isMobile ? 1 : undefined,
              }}
            >
              CARGAR
            </button>
            <button
              onClick={() => onEliminar(presupuesto.id)}
              style={{
                backgroundColor: "transparent",
                color: `${BLUE}aa`,
                border: `1px solid ${BLUE}55`,
                borderRadius: "4px",
                padding: "6px 12px",
                fontSize: "13px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = NEON;
                e.currentTarget.style.borderColor = NEON;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `${BLUE}aa`;
                e.currentTarget.style.borderColor = `${BLUE}55`;
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${BLUE_MID}ee, ${BLUE_DEEP}cc)`,
  border: `1px solid ${BLUE}44`,
  borderLeft: `3px solid ${NEON}88`,
  borderRadius: "4px",
  padding: "22px",
  boxShadow: `inset 0 1px 0 ${BLUE}22, 0 0 24px ${BLUE}22`,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: BLUE,
  display: "block",
  marginBottom: "5px",
  textTransform: "uppercase",
  fontFamily: "var(--font-rajdhani), sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: `${BLUE_DEEP}cc`,
  border: `1px solid ${BLUE}55`,
  borderRadius: "3px",
  color: "#e2f0ff",
  padding: "8px 10px",
  fontSize: "14px",
  fontFamily: "var(--font-rajdhani), sans-serif",
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const btnPrimary: React.CSSProperties = {
  background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`,
  color: "#fff",
  border: `1px solid ${NEON}`,
  borderRadius: "4px",
  padding: "10px 18px",
  fontWeight: 800,
  fontSize: "13px",
  letterSpacing: "3px",
  cursor: "pointer",
  fontFamily: "var(--font-orbitron), sans-serif",
  boxShadow: `0 0 14px ${NEON}55`,
  transition: "all 0.15s",
};

const btnSecondary: React.CSSProperties = {
  backgroundColor: "transparent",
  color: ACCENT,
  border: `1px solid ${BLUE}66`,
  borderRadius: "4px",
  padding: "10px 18px",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "3px",
  cursor: "pointer",
  fontFamily: "var(--font-orbitron), sans-serif",
  transition: "all 0.15s",
};

function tabBtn(active: boolean): React.CSSProperties {
  return {
    padding: "8px 22px",
    borderRadius: "3px",
    border: active ? `1px solid ${NEON}` : `1px solid transparent`,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "12px",
    letterSpacing: "3px",
    fontFamily: "var(--font-orbitron), sans-serif",
    background: active
      ? `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`
      : "transparent",
    color: active ? "#fff" : `${ACCENT}aa`,
    boxShadow: active ? `0 0 12px ${NEON}55` : "none",
    transition: "all 0.15s",
  };
}

function mobileSubTab(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: "3px",
    border: active ? `1px solid ${NEON}66` : `1px solid ${BLUE}33`,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "2px",
    fontFamily: "var(--font-orbitron), sans-serif",
    background: active
      ? `linear-gradient(135deg, ${BLUE_DARK}88, ${BLUE}44)`
      : "transparent",
    color: active ? NEON : `${ACCENT}66`,
    transition: "all 0.15s",
  };
}
