"use client";

import type { PresupuestoData } from "@/types/presupuesto";

interface Props {
  data: PresupuestoData;
}

const BLUE = "#0ea5e9";
const BLUE_DARK = "#0369a1";
const BLUE_DEEP = "#0c1a2e";
const BLUE_MID = "#0f2744";
const ACCENT = "#38bdf8";
const NEON = "#00d4ff";

function formatImporte(val: string): string {
  const n = parseFloat(val.replace(/\./g, "").replace(",", "."));
  if (isNaN(n)) return val;
  return n.toLocaleString("es-AR");
}

function getTodayStr(): string {
  const d = new Date();
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const MAX_ROWS = 10;
const MIN_ROWS = 7;

// ── SVG data-URI backgrounds ──

const gridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${NEON}" stroke-width="0.5"/></svg>`
)}`;

const triangleTopRight = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340"><polygon points="340,0 340,340 0,0" fill="${BLUE}"/></svg>`
)}`;

const triangleBottomLeft = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><polygon points="0,240 240,240 0,0" fill="${ACCENT}"/></svg>`
)}`;

const circlesSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 794 1123"><circle cx="680" cy="160" r="180" fill="none" stroke="${NEON}" stroke-width="1"/><circle cx="680" cy="160" r="130" fill="none" stroke="${NEON}" stroke-width="0.5"/><circle cx="100" cy="900" r="120" fill="none" stroke="${BLUE}" stroke-width="1"/></svg>`
)}`;

export default function PresupuestoPrint({ data }: Props) {
  const today = getTodayStr();
  const isDetallado = data.tipo === "detallado";
  const hasCondiciones =
    data.condicion === "anticipo" || data.condicion === "anticipo-modificable";

  const realItems = data.items.slice(0, MAX_ROWS);
  const rows = [...realItems];
  while (rows.length < MIN_ROWS) {
    rows.push({ cantidad: "", descripcion: "", importe: "" });
  }

  const compact = rows.length > MIN_ROWS;

  const s = {
    contentPad: compact ? "22px 44px 20px" : "32px 44px 36px",
    headerMb: compact ? "18px" : "28px",
    logoH: compact ? "110px" : "140px",
    titleSize: compact ? "34px" : "40px",
    dividerMb: compact ? "16px" : "24px",
    clientMb: compact ? "16px" : "26px",
    clientPad: compact ? "10px 18px" : "14px 18px",
    clientValueSize: compact ? "18px" : "22px",
    thPad: compact ? "9px 16px" : "13px 16px",
    tdPad: compact ? "6px 14px" : "11px 16px",
    tdSize: compact ? "16px" : "20px",
    tdHeight: compact ? "32px" : "44px",
    tdLine: compact ? "18px" : "22px",
    totalPad: compact ? "14px 24px" : "20px 32px",
    totalValPad: compact ? "14px 20px" : "20px 24px",
    totalSize: compact ? "26px" : "32px",
    condMt: compact ? "14px" : "24px",
    condPad: compact ? "10px 18px" : "14px 22px",
    condTitleSize: compact ? "14px" : "16px",
    condTextSize: compact ? "12px" : "14px",
    condIconSize: compact ? "26px" : "32px",
    condIconWrap: compact ? "36px" : "46px",
    warMt: compact
      ? "8px"
      : hasCondiciones
        ? "12px"
        : "24px",
    footerMt: compact ? "16px" : "32px",
    footerPt: compact ? "10px" : "16px",
    footerValSize: compact ? "15px" : "17px",
  };

  return (
    <div
      id="print-area"
      style={{
        width: "794px",
        height: "1123px",
        backgroundColor: BLUE_DEEP,
        color: "#e2f0ff",
        fontFamily: "var(--font-rajdhani), 'Arial', sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        WebkitPrintColorAdjust: "exact",
      }}
    >
      {/* GRID PATTERN */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("${gridSvg}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "40px 40px",
        }}
      />

      {/* DIAGONAL ACCENT — top right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "340px",
          height: "340px",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("${triangleTopRight}")`,
          backgroundSize: "cover",
        }}
      />

      {/* DIAGONAL ACCENT — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "240px",
          height: "240px",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("${triangleBottomLeft}")`,
          backgroundSize: "cover",
        }}
      />

      {/* NEON GLOW CIRCLES */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `url("${circlesSvg}")`,
          backgroundSize: "cover",
        }}
      />

      {/* TOP ACCENT BAR */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, transparent 0%, ${NEON} 40%, ${BLUE} 100%)`,
          position: "relative",
          zIndex: 2,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: s.contentPad }}>
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: s.headerMb,
          }}
        >
          {/* Logo */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: "-10px",
                background: `radial-gradient(circle, ${BLUE}22 0%, transparent 70%)`,
                borderRadius: "50%",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/presupuestos/LOGO NEGRO.png"
              alt="GTM"
              style={{
                height: s.logoH,
                width: "auto",
                display: "block",
                position: "relative",
                filter:
                  "brightness(1.1) drop-shadow(0 0 12px rgba(14,165,233,0.4))",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (
                  e.currentTarget.nextElementSibling as HTMLElement
                ).style.display = "block";
              }}
            />
            <div style={{ display: "none" }}>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 900,
                  letterSpacing: "6px",
                  color: NEON,
                  lineHeight: 1,
                  textShadow: `0 0 20px ${NEON}66`,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                GTM
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "4px",
                  color: BLUE,
                  marginTop: "4px",
                }}
              >
                GRANDOLI TALLER MECÁNICO
              </div>
            </div>
          </div>

          {/* Título */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "6px",
                color: BLUE,
                textTransform: "uppercase",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              GRANDOLI TALLER MECÁNICO
            </div>
            <div
              style={{
                fontSize: s.titleSize,
                fontWeight: 900,
                letterSpacing: "4px",
                color: "#ffffff",
                lineHeight: 1,
                textShadow: `0 0 30px ${BLUE}66`,
                fontFamily: "var(--font-orbitron), sans-serif",
              }}
            >
              PRESUPUESTO
            </div>
            {/* Date badge */}
            <div
              style={{
                display: "inline-block",
                marginTop: "12px",
                background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`,
                boxShadow: `0 0 16px ${BLUE}55`,
                transform: "skewX(-8deg)",
                padding: "6px 18px",
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  lineHeight: "20px",
                  transform: "skewX(8deg)",
                }}
              >
                {today}
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, ${NEON} 0%, ${BLUE} 40%, transparent 100%)`,
            marginBottom: s.dividerMb,
            boxShadow: `0 0 8px ${NEON}44`,
          }}
        />

        {/* ── DATOS CLIENTE ── */}
        <div
          style={{
            display: "table",
            width: "100%",
            borderSpacing: "14px 0",
            marginLeft: "-14px",
            marginBottom: s.clientMb,
          }}
        >
          <div style={{ display: "table-cell", width: "50%" }}>
            <div
              style={{
                ...fieldBox,
                padding: s.clientPad,
              }}
            >
              <div style={fieldLabel}>NOMBRE DEL CLIENTE</div>
              <div style={{ ...fieldValue, fontSize: s.clientValueSize }}>
                {data.nombre || "—"}
              </div>
            </div>
          </div>
          <div style={{ display: "table-cell", width: "50%" }}>
            <div
              style={{
                ...fieldBox,
                padding: s.clientPad,
              }}
            >
              <div style={fieldLabel}>VEHÍCULO</div>
              <div style={{ ...fieldValue, fontSize: s.clientValueSize }}>
                {data.vehiculo || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABLA ITEMS ── */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  ...thStyle,
                  padding: s.thPad,
                  width: "90px",
                  textAlign: "center",
                }}
              >
                CANT.
              </th>
              <th style={{ ...thStyle, padding: s.thPad, textAlign: "center" }}>
                DESCRIPCIÓN
              </th>
              {isDetallado && (
                <th
                  style={{
                    ...thStyle,
                    padding: s.thPad,
                    width: "140px",
                    textAlign: "right",
                  }}
                >
                  IMPORTE
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    i % 2 === 0 ? `${BLUE_MID}cc` : `${BLUE_DEEP}dd`,
                  borderLeft: item.descripcion
                    ? `2px solid ${NEON}66`
                    : `2px solid transparent`,
                }}
              >
                <td
                  style={{
                    padding: s.tdPad,
                    fontSize: s.tdSize,
                    borderBottom: `1px solid ${BLUE}22`,
                    height: s.tdHeight,
                    lineHeight: s.tdLine,
                    verticalAlign: "middle",
                    textAlign: "center",
                    fontFamily: "var(--font-orbitron), sans-serif",
                    fontWeight: item.cantidad ? 700 : 400,
                    color: item.cantidad ? NEON : "#2a4a6a",
                  }}
                >
                  {item.cantidad}
                </td>
                <td
                  style={{
                    padding: s.tdPad,
                    fontSize: s.tdSize,
                    borderBottom: `1px solid ${BLUE}22`,
                    height: s.tdHeight,
                    lineHeight: s.tdLine,
                    verticalAlign: "middle",
                    textAlign: "center",
                    fontWeight: item.descripcion ? 600 : 400,
                    color: item.descripcion ? "#e2f0ff" : "#1a3050",
                  }}
                >
                  {item.descripcion}
                </td>
                {isDetallado && (
                  <td
                    style={{
                      padding: s.tdPad,
                      fontSize: s.tdSize,
                      borderBottom: `1px solid ${BLUE}22`,
                      height: s.tdHeight,
                      lineHeight: s.tdLine,
                      verticalAlign: "middle",
                      textAlign: "right",
                      fontFamily: "var(--font-orbitron), sans-serif",
                      fontWeight: item.importe ? 700 : 400,
                      color: item.importe ? NEON : "#2a4a6a",
                      paddingRight: "20px",
                    }}
                  >
                    {item.importe
                      ? data.moneda === "USD"
                        ? `${formatImporte(item.importe)} usd`
                        : `$ ${formatImporte(item.importe)}`
                      : ""}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTAL ── */}
        <div
          style={{
            textAlign: "right",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              display: "inline-table",
              minWidth: compact ? "300px" : "360px",
              border: `2px solid ${BLUE}`,
              borderSpacing: 0,
            }}
          >
            <div style={{ display: "table-row" }}>
              <div
                style={{
                  display: "table-cell",
                  fontSize: compact ? "12px" : "14px",
                  fontWeight: 700,
                  letterSpacing: "5px",
                  color: ACCENT,
                  fontFamily: "var(--font-orbitron), sans-serif",
                  backgroundColor: BLUE_MID,
                  padding: s.totalPad,
                  verticalAlign: "middle",
                }}
              >
                TOTAL
              </div>
              <div
                style={{
                  display: "table-cell",
                  fontSize: s.totalSize,
                  fontWeight: 700,
                  fontFamily: "var(--font-orbitron), sans-serif",
                  color: "#ffffff",
                  backgroundColor: BLUE_DARK,
                  padding: s.totalValPad,
                  verticalAlign: "middle",
                  borderLeft: `2px solid ${BLUE}`,
                }}
              >
                {data.moneda === "USD"
                  ? `${formatImporte(data.total)} usd`
                  : `$ ${formatImporte(data.total)}`}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONDICIONES ── */}
        {hasCondiciones && (
          <div
            style={{
              marginTop: s.condMt,
              border: `1px solid ${BLUE}`,
              borderLeft: `4px solid ${ACCENT}`,
              padding: s.condPad,
              display: "table",
              width: "calc(100% - 48px)",
              backgroundColor: BLUE_MID,
              borderRadius: "0 4px 4px 0",
            }}
          >
            <div
              style={{
                display: "table-cell",
                verticalAlign: "middle",
                width: s.condIconWrap,
                paddingRight: compact ? "10px" : "14px",
              }}
            >
              <div
                style={{
                  width: s.condIconSize,
                  height: s.condIconSize,
                  borderRadius: "50%",
                  backgroundColor: BLUE_DARK,
                  border: `2px solid ${ACCENT}`,
                  textAlign: "center",
                  lineHeight: compact ? "22px" : "28px",
                  color: ACCENT,
                  fontSize: compact ? "14px" : "16px",
                  fontWeight: 900,
                }}
              >
                $
              </div>
            </div>
            <div style={{ display: "table-cell", verticalAlign: "middle" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: s.condTitleSize,
                  letterSpacing: "3px",
                  color: ACCENT,
                  marginBottom: "3px",
                }}
              >
                CONDICIONES DE PAGO
              </div>
              <div style={{ fontSize: s.condTextSize, color: "#6a9bbf" }}>
                Para iniciar el trabajo se requiere el 50%. El saldo restante se
                abona al finalizar el trabajo.
              </div>
              {data.condicion === "anticipo-modificable" && (
                <div
                  style={{
                    fontSize: s.condTextSize,
                    color: "#6a9bbf",
                    marginTop: "4px",
                  }}
                >
                  El presupuesto puede modificarse al abrir la caja en caso de
                  encontrar daños adicionales.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GARANTÍA ── */}
        <div
          style={{
            marginTop: s.warMt,
            border: `1px solid ${BLUE}`,
            borderLeft: `4px solid ${NEON}`,
            padding: s.condPad,
            display: "table",
            width: "calc(100% - 48px)",
            backgroundColor: BLUE_MID,
            borderRadius: "0 4px 4px 0",
          }}
        >
          <div
            style={{
              display: "table-cell",
              verticalAlign: "middle",
              width: s.condIconWrap,
              paddingRight: compact ? "10px" : "14px",
            }}
          >
            <div
              style={{
                width: s.condIconSize,
                height: s.condIconSize,
                borderRadius: "50%",
                backgroundColor: BLUE_DARK,
                border: `2px solid ${NEON}`,
                textAlign: "center",
                lineHeight: compact ? "22px" : "28px",
                color: NEON,
                fontSize: compact ? "16px" : "18px",
                fontWeight: 900,
              }}
            >
              ✓
            </div>
          </div>
          <div style={{ display: "table-cell", verticalAlign: "middle" }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: s.condTitleSize,
                letterSpacing: "3px",
                color: NEON,
                marginBottom: "3px",
              }}
            >
              GARANTÍA INCLUIDA
            </div>
            <div style={{ fontSize: s.condTextSize, color: "#6a9bbf" }}>
              Este presupuesto incluye garantía de 6 meses.
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            marginTop: s.footerMt,
            paddingTop: s.footerPt,
            borderTop: `1px solid ${BLUE}33`,
            display: "table",
            width: "100%",
          }}
        >
          <div style={{ display: "table-cell", textAlign: "center" }}>
            <div style={footerLabel}>DIRECCIÓN</div>
            <div style={{ ...footerValue, fontSize: s.footerValSize }}>
              Viale 291, San Nicolás
            </div>
          </div>
          <div style={{ display: "table-cell", textAlign: "center" }}>
            <div style={footerLabel}>TELÉFONO</div>
            <div style={{ ...footerValue, fontSize: s.footerValSize }}>
              3364 694921
            </div>
          </div>
          <div style={{ display: "table-cell", textAlign: "center" }}>
            <div style={footerLabel}>WEB</div>
            <div style={{ ...footerValue, fontSize: s.footerValSize }}>
              mecanicagrandoli.com.ar
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACCENT BAR */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${NEON} 0%, ${BLUE} 60%, transparent 100%)`,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow: `0 0 8px ${NEON}66`,
        }}
      />
    </div>
  );
}

// ── STYLES ──

const fieldBox: React.CSSProperties = {
  border: `1px solid ${BLUE}44`,
  borderRadius: "4px",
  padding: "14px 18px",
  background: `linear-gradient(135deg, ${BLUE_MID}ee, ${BLUE_DEEP}cc)`,
  boxShadow: `inset 0 1px 0 ${BLUE}22`,
};

const fieldLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: BLUE,
  marginBottom: "6px",
  textTransform: "uppercase",
};

const fieldValue: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#e2f0ff",
  lineHeight: 1.3,
};

const thStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${BLUE_DARK} 0%, #0a2540 100%)`,
  color: "#fff",
  padding: "13px 16px",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "4px",
  borderBottom: `2px solid ${NEON}`,
  textTransform: "uppercase",
  lineHeight: 1.3,
};

const footerLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: BLUE,
  marginBottom: "4px",
  textTransform: "uppercase",
};

const footerValue: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 600,
  color: "#7aabcc",
  lineHeight: 1.3,
};
