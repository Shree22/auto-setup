/**
 * 404 illustration: a browser window with nothing in it, a magnifying glass
 * that found no match, and one bug wandering off. Drawn inline so it inherits
 * the theme colours and stays sharp at any size.
 */
export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 300"
      fill="none"
      role="img"
      aria-label="An empty browser window with a magnifying glass, and a bug walking away"
      className={className}
    >
      {/* Ground shadow, so nothing floats */}
      <ellipse cx="220" cy="272" rx="150" ry="12" className="fill-muted" />

      {/* Browser window */}
      <rect
        x="60"
        y="40"
        width="320"
        height="214"
        rx="16"
        className="fill-card stroke-border"
        strokeWidth="2"
      />
      <path d="M60 78 H380" className="stroke-border" strokeWidth="2" />
      <circle cx="84" cy="59" r="5" className="fill-destructive/60" />
      <circle cx="102" cy="59" r="5" className="fill-border" />
      <circle cx="120" cy="59" r="5" className="fill-border" />
      <rect x="140" y="52" width="140" height="14" rx="7" className="fill-muted" />

      {/* The page that is not there */}
      <text
        x="220"
        y="165"
        textAnchor="middle"
        className="fill-primary"
        style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "-2px" }}
      >
        404
      </text>
      <rect x="140" y="188" width="160" height="10" rx="5" className="fill-muted" />
      <rect x="165" y="208" width="110" height="10" rx="5" className="fill-muted" />

      {/* Magnifying glass: searched, found nothing */}
      <circle cx="330" cy="206" r="36" className="fill-background" />
      <g className="stroke-primary" strokeWidth="9" strokeLinecap="round">
        <circle cx="330" cy="206" r="36" />
        <path d="M357 233 L386 262" />
      </g>
      <path
        d="M316 206 h28"
        className="stroke-primary/40"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* A bug, walking away from the scene */}
      <g transform="translate(96, 254)">
        <g className="stroke-brand-purple" strokeWidth="3.5" strokeLinecap="round">
          <path d="M-20 -4 h-9 M-20 6 h-9 M20 -4 h9 M20 6 h9" />
          <path d="M-9 -12 l-5 -9 M9 -12 l5 -9" />
          <ellipse cx="0" cy="1" rx="20" ry="14" className="fill-brand-purple/15" />
          <path d="M0 -13 V15" strokeWidth="2.5" className="stroke-brand-purple/50" />
        </g>
        <circle cx="-7" cy="-2" r="2.5" className="fill-brand-purple" />
        <circle cx="7" cy="-2" r="2.5" className="fill-brand-purple" />
      </g>
    </svg>
  );
}
