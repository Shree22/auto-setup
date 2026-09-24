import { ImageResponse } from "next/og";
import { siteName, siteTagline } from "@/lib/seo";

/**
 * The image shown when a link is shared on LinkedIn, Slack, WhatsApp or X.
 * Applies to every page that does not define its own.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteName} — ${siteTagline}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "40px",
              fontWeight: 700,
            }}
          >
            {/* A letter renders reliably; an emoji glyph falls back to a
                different font and loses the white colour. */}
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "40px", fontWeight: 700, color: "#111827" }}>
              {siteName}
            </span>
            <span style={{ fontSize: "22px", color: "#6b7280" }}>{siteTagline}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "56px",
            fontSize: "62px",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#111827",
          }}
        >
          <span>Manual Tester →</span>
          <span style={{ color: "#2563eb" }}>Automation Framework</span>
          <span style={{ color: "#2563eb" }}>in 2 Minutes</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "56px",
            fontSize: "24px",
            color: "#4b5563",
          }}
        >
          <span>Selenium</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>Playwright</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>Cypress</span>
          <span style={{ color: "#d1d5db" }}>·</span>
          <span>Robot Framework</span>
        </div>
      </div>
    ),
    size
  );
}
