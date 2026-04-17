"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PresupuestoData } from "@/types/presupuesto";

const PresupuestoPrint = dynamic(
  () => import("@/components/PresupuestoPrint"),
  { ssr: false }
);

const BLUE_DEEP = "#0c1a2e";
const NEON = "#00d4ff";

export default function PrintPage() {
  const [data, setData] = useState<PresupuestoData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("print-data");
      if (raw) {
        setData(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!data || ready) return;
    // Wait for fonts + a small delay for rendering
    const timer = setTimeout(async () => {
      await document.fonts.ready;
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [data, ready]);

  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: BLUE_DEEP,
          color: NEON,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-orbitron), sans-serif",
          letterSpacing: "3px",
          fontSize: "13px",
        }}
      >
        NO HAY DATOS
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: ${BLUE_DEEP} !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-toolbar {
            display: none !important;
          }
          #print-area {
            width: 210mm !important;
            min-height: 297mm !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Toolbar for mobile - hidden when printing */}
      <div
        className="print-toolbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: BLUE_DEEP,
          borderBottom: `1px solid ${NEON}33`,
          padding: "12px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{
            backgroundColor: "transparent",
            color: NEON,
            border: `1px solid ${NEON}55`,
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "2px",
            cursor: "pointer",
            fontFamily: "var(--font-orbitron), sans-serif",
          }}
        >
          VOLVER
        </button>
        <button
          onClick={() => window.print()}
          disabled={!ready}
          style={{
            background: ready
              ? `linear-gradient(135deg, #0369a1, #0ea5e9)`
              : "#333",
            color: "#fff",
            border: `1px solid ${NEON}`,
            borderRadius: "4px",
            padding: "8px 20px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "2px",
            cursor: ready ? "pointer" : "wait",
            fontFamily: "var(--font-orbitron), sans-serif",
            boxShadow: ready ? `0 0 14px ${NEON}55` : "none",
            opacity: ready ? 1 : 0.5,
          }}
        >
          {ready ? "GUARDAR PDF / COMPARTIR" : "CARGANDO..."}
        </button>
      </div>

      {/* The actual print content */}
      <div
        style={{
          backgroundColor: BLUE_DEEP,
          display: "flex",
          justifyContent: "center",
          padding: "16px 0",
        }}
      >
        <PresupuestoPrint data={data} />
      </div>
    </>
  );
}
