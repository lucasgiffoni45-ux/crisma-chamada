import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Crisma — Chamada",
  description: "Sistema de presença para formação de Crisma",
  appleWebApp: { capable: true, title: "Crisma", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2e1065",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 text-stone-900 antialiased">
        {/* Faixa litúrgica discreta no topo (violeta + dourado) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-800 via-amber-500 to-violet-800" />
        {children}
      </body>
    </html>
  );
}
