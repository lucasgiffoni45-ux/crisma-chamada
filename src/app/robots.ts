import type { MetadataRoute } from "next";

// Permite indexar só as páginas públicas (vendas/legais) e bloqueia os painéis
// privados e as rotas de API/presença dos buscadores.
export default function robots(): MetadataRoute.Robots {
  const base = "https://crisma-chamada.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vendas", "/privacidade", "/termos"],
        disallow: ["/dono", "/coordenadora", "/formador", "/assinatura", "/presenca", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
