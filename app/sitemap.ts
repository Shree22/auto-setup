import type { MetadataRoute } from "next";
import { examples } from "@/lib/content/examples";
import { guides } from "@/lib/content/guides";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: siteUrl, changeFrequency: "monthly", priority: 1 },
      { url: `${siteUrl}/setup`, changeFrequency: "monthly", priority: 0.9 },
      { url: `${siteUrl}/docs`, changeFrequency: "monthly", priority: 0.8 },
      { url: `${siteUrl}/guides`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${siteUrl}/examples`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.7 },
    ] satisfies MetadataRoute.Sitemap
  ).map((page) => ({ ...page, lastModified }));

  return [
    ...staticPages,
    ...guides.map((guide) => ({
      url: `${siteUrl}/guides/${guide.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...examples.map((example) => ({
      url: `${siteUrl}/examples/${example.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
