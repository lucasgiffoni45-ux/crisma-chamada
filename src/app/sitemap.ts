import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crisma-chamada.vercel.app";
  const agora = new Date();
  return [
    { url: `${base}/`, lastModified: agora, priority: 1 },
    { url: `${base}/vendas`, lastModified: agora, priority: 0.9 },
    { url: `${base}/privacidade`, lastModified: agora, priority: 0.3 },
    { url: `${base}/termos`, lastModified: agora, priority: 0.3 },
  ];
}
