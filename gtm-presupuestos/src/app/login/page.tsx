"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const BLUE = "#0ea5e9";
const BLUE_DARK = "#0369a1";
const BLUE_DEEP = "#0c1a2e";
const BLUE_MID = "#0f2744";
const ACCENT = "#38bdf8";
const NEON = "#00d4ff";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/presupuesto");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/presupuesto");
    } catch (err) {
      const code = (err as { code?: string }).code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("Email o contraseña incorrectos");
      } else if (code.includes("too-many-requests")) {
        setError("Demasiados intentos. Esperá un momento.");
      } else {
        setError("Error al iniciar sesión");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BLUE_DEEP,
        color: "#e2f0ff",
        fontFamily: "var(--font-rajdhani), 'Arial', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
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
          <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={NEON} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          background: `linear-gradient(135deg, ${BLUE_MID}ee, ${BLUE_DEEP}cc)`,
          border: `1px solid ${BLUE}44`,
          borderLeft: `3px solid ${NEON}88`,
          borderRadius: "4px",
          padding: "32px 26px",
          boxShadow: `inset 0 1px 0 ${BLUE}22, 0 0 30px ${BLUE}33`,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: "18px",
            letterSpacing: "4px",
            color: "#ffffff",
            fontFamily: "var(--font-orbitron), sans-serif",
            textShadow: `0 0 14px ${BLUE}66`,
            textAlign: "center",
            marginBottom: "6px",
          }}
        >
          GTM <span style={{ color: NEON }}>·</span> PRESUPUESTOS
        </div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: `${ACCENT}aa`,
            textAlign: "center",
            marginBottom: "26px",
            fontFamily: "var(--font-orbitron), sans-serif",
          }}
        >
          ACCESO RESTRINGIDO
        </div>

        <label style={labelStyle}>EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = NEON)}
          onBlur={(e) => (e.target.style.borderColor = `${BLUE}55`)}
        />

        <div style={{ height: "14px" }} />

        <label style={labelStyle}>CONTRASEÑA</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = NEON)}
          onBlur={(e) => (e.target.style.borderColor = `${BLUE}55`)}
        />

        {error && (
          <div
            style={{
              marginTop: "16px",
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
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "22px",
            width: "100%",
            background: `linear-gradient(135deg, ${BLUE_DARK}, ${BLUE})`,
            color: "#fff",
            border: `1px solid ${NEON}`,
            borderRadius: "4px",
            padding: "12px 18px",
            fontWeight: 800,
            fontSize: "13px",
            letterSpacing: "3px",
            cursor: submitting ? "wait" : "pointer",
            fontFamily: "var(--font-orbitron), sans-serif",
            boxShadow: `0 0 14px ${NEON}55`,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "INGRESANDO..." : "INGRESAR"}
        </button>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "3px",
  color: BLUE,
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase",
  fontFamily: "var(--font-rajdhani), sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: `${BLUE_DEEP}cc`,
  border: `1px solid ${BLUE}55`,
  borderRadius: "3px",
  color: "#e2f0ff",
  padding: "12px 12px",
  fontSize: "16px",
  fontFamily: "var(--font-rajdhani), sans-serif",
  fontWeight: 600,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};
