"use client";

import type { PresupuestoData } from "@/types/presupuesto";

interface Props {
  data: PresupuestoData;
}

const RED = "#C0392B";
const DARK = "#1a1a1a";

function formatImporte(val: string): string {
  const n = parseFloat(val.replace(/\./g, "").replace(",", "."));
  if (isNaN(n)) return val;
  return n.toLocaleString("es-AR");
}

function getTodayStr(): string {
  const d = new Date();
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const MIN_ROWS = 7;

export default function PresupuestoPrint({ data }: Props) {
  const today = getTodayStr();
  const rows = [...data.items];
  while (rows.length < MIN_ROWS) {
    rows.push({ cantidad: "", descripcion: "", importe: "" });
  }

  return (
    <div
      id="print-area"
      style={{
        width: "794px",
        minHeight: "1050px",
        backgroundColor: "#ffffff",
        color: DARK,
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* TOP ACCENT BAR */}
      <div style={{ height: "10px", background: `linear-gradient(90deg, ${RED} 0%, #e8472a 60%, #c0392b 100%)` }} />

      {/* WATERMARK GEARS */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, pointerEvents: "none", zIndex: 0 }}
        viewBox="0 0 794 1050"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill={RED}>
          <GearShape cx={660} cy={200} r={110} teeth={12} />
          <GearShape cx={100} cy={800} r={80} teeth={10} />
          <GearShape cx={720} cy={780} r={55} teeth={8} />
        </g>
      </svg>

      <div style={{ position: "relative", zIndex: 1, padding: "32px 44px 36px" }}>

        {/* ── HEADER ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>

          {/* Logo */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/LOGO GTM.png"
              alt="GTM"
              style={{ height: "130px", width: "auto", display: "block" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block";
              }}
            />
            <div style={{ display: "none" }}>
              <div style={{ fontSize: "60px", fontWeight: 900, letterSpacing: "6px", color: RED, lineHeight: 1 }}>GTM</div>
              <div style={{ fontSize: "14px", letterSpacing: "4px", color: "#888", marginTop: "4px" }}>MECÁNICA GRANDOLI</div>
            </div>
          </div>

          {/* Título */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", letterSpacing: "5px", color: "#aaa", textTransform: "uppercase", marginBottom: "6px" }}>
              Mecánica Grandoli
            </div>
            <div style={{ fontSize: "44px", fontWeight: 900, letterSpacing: "7px", color: DARK, lineHeight: 1 }}>
              PRESUPUESTO
            </div>
            <div style={{
              display: "inline-block",
              marginTop: "10px",
              backgroundColor: RED,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "2px",
              padding: "5px 16px",
              borderRadius: "3px",
            }}>
              {today}
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: "3px", background: `linear-gradient(90deg, ${RED} 30%, transparent)`, marginBottom: "26px" }} />

        {/* ── DATOS CLIENTE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "28px" }}>
          <div style={fieldBox}>
            <div style={fieldLabel}>NOMBRE DEL CLIENTE</div>
            <div style={fieldValue}>{data.nombre || "—"}</div>
          </div>
          <div style={fieldBox}>
            <div style={fieldLabel}>VEHÍCULO</div>
            <div style={fieldValue}>{data.vehiculo || "—"}</div>
          </div>
        </div>

        {/* ── TABLA ITEMS ── */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "90px", textAlign: "center" }}>CANT.</th>
              <th style={{ ...thStyle, textAlign: "center" }}>DESCRIPCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                <td style={{ ...tdStyle, textAlign: "center", fontFamily: "Courier New, monospace" }}>
                  {item.cantidad}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: item.descripcion ? 600 : 400 }}>
                  {item.descripcion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTAL ── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{
            backgroundColor: DARK,
            color: "#fff",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            minWidth: "360px",
          }}>
            <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "4px", flex: 1 }}>TOTAL</div>
            <div style={{ fontSize: "32px", fontWeight: 900, fontFamily: "Courier New, monospace", color: "#f8a020" }}>
              $ {formatImporte(data.total)}
            </div>
          </div>
        </div>

        {/* ── GARANTÍA ── */}
        <div style={{
          marginTop: "26px",
          border: `1px solid ${RED}`,
          borderLeft: `6px solid ${RED}`,
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          backgroundColor: "#fff8f7",
          borderRadius: "0 4px 4px 0",
        }}>
          <div style={{ color: RED, fontSize: "26px", lineHeight: 1, fontWeight: 900 }}>✓</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "15px", letterSpacing: "2px", color: RED }}>GARANTÍA INCLUIDA</div>
            <div style={{ fontSize: "13px", color: "#777", marginTop: "4px" }}>
              Este presupuesto incluye garantía de 6 meses sobre mano de obra.
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: "36px",
          paddingTop: "16px",
          borderTop: `2px solid ${DARK}`,
          display: "flex",
          justifyContent: "center",
          gap: "48px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={footerLabel}>DIRECCIÓN</div>
            <div style={footerValue}>Viale 291, San Nicolás</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={footerLabel}>TELÉFONO</div>
            <div style={footerValue}>3364 694921</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={footerLabel}>WEB</div>
            <div style={footerValue}>mecanicagrandoli.com.ar</div>
          </div>
        </div>

      </div>

      {/* BOTTOM ACCENT BAR */}
      <div style={{ height: "6px", background: `linear-gradient(90deg, ${RED}, transparent)`, position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </div>
  );
}

const fieldBox: React.CSSProperties = {
  border: "1px solid #e8e8e8",
  borderRadius: "5px",
  padding: "14px 18px",
  backgroundColor: "#fafafa",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#aaa",
  marginBottom: "6px",
  textTransform: "uppercase",
};

const fieldValue: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#1a1a1a",
};

const thStyle: React.CSSProperties = {
  backgroundColor: DARK,
  color: "#fff",
  padding: "13px 16px",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "2px",
  borderBottom: `3px solid ${RED}`,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "16px",
  borderBottom: "1px solid #efefef",
  height: "44px",
  color: "#1a1a1a",
};

const footerLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#bbb",
  marginBottom: "4px",
  textTransform: "uppercase",
};

const footerValue: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#555",
};

function GearShape({ cx, cy, r, teeth }: { cx: number; cy: number; r: number; teeth: number }) {
  const innerR = r * 0.7;
  const toothH = r * 0.25;
  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * 2 * Math.PI;
    const nextAngle = ((i + 0.5) / teeth) * 2 * Math.PI;
    const midAngle = ((i + 0.25) / teeth) * 2 * Math.PI;

    points.push(`${cx + innerR * Math.cos(angle)},${cy + innerR * Math.sin(angle)}`);
    points.push(`${cx + (r + toothH) * Math.cos(midAngle - 0.05)},${cy + (r + toothH) * Math.sin(midAngle - 0.05)}`);
    points.push(`${cx + (r + toothH) * Math.cos(midAngle + 0.05)},${cy + (r + toothH) * Math.sin(midAngle + 0.05)}`);
    points.push(`${cx + innerR * Math.cos(nextAngle)},${cy + innerR * Math.sin(nextAngle)}`);
  }

  return (
    <>
      <polygon points={points.join(" ")} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#fff" />
    </>
  );
}
