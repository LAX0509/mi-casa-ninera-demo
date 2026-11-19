import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Nunito } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Nunito({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Mi Casa Niñera · Cuidado y Tutoría Infantil en Medellín",
  description:
    "Niñeras y tutores verificados con rastreo GPS en vivo, check-in OTP/QR, protocolo SOS y agente IA en WhatsApp. Demo de la plataforma de confianza e inteligencia operativa.",
};

export const viewport: Viewport = {
  themeColor: "#1e6fd9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${display.variable} font-sans`}>{children}</body>
    </html>
  );
}
