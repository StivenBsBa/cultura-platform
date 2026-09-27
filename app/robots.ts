import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.AUTH_URL ?? "http://localhost:7120";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
