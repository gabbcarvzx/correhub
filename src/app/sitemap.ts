import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/agenda", "/grupos", "/ranking", "/parceiros", "/comunidade", "/buscar", "/login", "/cadastro"];

  return routes.map((route) => ({
    url: `https://correhub.app${route}`,
    lastModified: new Date()
  }));
}
