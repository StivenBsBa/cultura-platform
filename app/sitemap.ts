import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.AUTH_URL ?? "http://localhost:7120";
  return ["", "/eventos", "/lugares"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
