import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The API returns files, not pages, and /stats is internal.
        disallow: ["/api/", "/stats"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
