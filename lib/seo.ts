import type { Metadata } from "next";

/**
 * One place for the site's identity and per-page metadata.
 *
 * Set NEXT_PUBLIC_SITE_URL once you own a domain — it is what makes social
 * preview images and canonical URLs absolute.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autosetup.dev";
export const siteName = "AutoSetup";
export const siteTagline = "From Manual to Automation";
export const siteDescription =
  "Set up your test automation framework in minutes. Pick your tool, language and framework, and download a ready-to-run project with sample tests.";

type PageMetaInput = {
  title: string;
  description: string;
  /** Path from the site root, e.g. "/guides". Used for the canonical URL. */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
};

/** Builds title, description, canonical, Open Graph and Twitter tags together. */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
}: PageMetaInput): Metadata {
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} — ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      type,
      locale: "en_GB",
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** Trims a description to the length search engines actually show. */
export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
