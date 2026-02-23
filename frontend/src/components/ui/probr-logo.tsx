/**
 * Probr logo mark — SVG component.
 *
 * Stylised abstract mark inspired by the brand image:
 * two converging strokes forming a signal / monitoring needle,
 * with scattered data-point dots below.
 *
 * Uses `currentColor` so it inherits text colour from parent.
 */

export default function ProbrLogo({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 36"
      fill="none"
      className={className}
      aria-label="Probr logo"
    >
      {/* Main strokes — signal needle */}
      <path
        d="M16 3L9 31"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 3L22 24"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Data-point dots */}
      <circle cx="19" cy="28" r="1.1" fill="currentColor" opacity="0.55" />
      <circle cx="22" cy="31" r="0.85" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="33" r="0.7" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
