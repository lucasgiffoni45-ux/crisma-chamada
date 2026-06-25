import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as páginas.
const securityHeaders = [
  // Força HTTPS por 1 ano (a Vercel já serve só HTTPS).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Impede que o site seja embutido em <iframe> de outro domínio (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Impede o navegador de "adivinhar" tipos de arquivo (anti-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Não vaza a URL completa ao sair do site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Bloqueia recursos sensíveis que o app não usa.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
