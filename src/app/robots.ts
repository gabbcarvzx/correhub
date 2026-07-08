import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/check-in/", "/admin/"],
      },
    ],
    sitemap: "https://correhub.app/sitemap.xml",
  };
}
