import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crisma — Chamada",
  description: "Sistema de presença para formação de Crisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-stone-100 text-stone-900">
        {/* Faixa litúrgica discreta no topo (violeta + dourado) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-800 via-amber-500 to-violet-800" />
        {children}
      </body>
    </html>
  );
}
