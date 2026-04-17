"use client";

import { useState, useEffect } from "react";

const BLUE_DEEP = "#0c1a2e";
const BLUE = "#0ea5e9";
const NEON = "#00d4ff";
const ACCENT = "#38bdf8";

export default function DesktopOnly({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: BLUE_DEEP,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <svg
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.06,
            pointerEvents: "none",
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="block-grid"
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
          <rect width="100%" height="100%" fill="url(#block-grid)" />
        </svg>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "360px" }}>
          {/* Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              borderRadius: "50%",
              border: `2px solid ${NEON}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${NEON}44`,
              background: `linear-gradient(135deg, ${BLUE_DEEP}, #0f2744)`,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NEON}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          <div
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "3px",
              color: "#ffffff",
              marginBottom: "16px",
              textShadow: `0 0 20px ${BLUE}66`,
            }}
          >
            SOLO PC
          </div>

          <div
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: ACCENT,
              lineHeight: 1.5,
              marginBottom: "24px",
            }}
          >
            Esta aplicación está disponible únicamente desde una computadora.
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "10px 24px",
              border: `1px solid ${BLUE}55`,
              borderRadius: "4px",
              background: `linear-gradient(135deg, #0f274466, ${BLUE_DEEP}88)`,
              fontFamily: "var(--font-orbitron), sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              color: `${NEON}aa`,
            }}
          >
            GTM · PRESUPUESTOS
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
