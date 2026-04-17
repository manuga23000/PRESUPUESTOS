import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import DesktopOnly from "@/components/DesktopOnly";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "GTM · Presupuestos",
  description: "Sistema de presupuestos GTM Mecánica Grandoli",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${ibmPlexSans.variable} ${orbitron.variable} ${rajdhani.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <DesktopOnly>{children}</DesktopOnly>
        </AuthProvider>
      </body>
    </html>
  );
}
