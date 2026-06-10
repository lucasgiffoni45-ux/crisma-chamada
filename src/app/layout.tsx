import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crisma — Chamada",
  description: "Sistema de presença para formação de Crisma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
