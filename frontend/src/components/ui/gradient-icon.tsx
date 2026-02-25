import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

/**
 * Global SVG gradient definitions — rendered once in the root layout.
 * Provides `url(#icon-grad)` for gradient-stroked icons.
 */
export function SvgGradientDefs() {
  return (
    <svg
      aria-hidden
      width={0}
      height={0}
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(276 51% 47%)" />
          <stop offset="50%" stopColor="hsl(0 98% 55%)" />
          <stop offset="100%" stopColor="hsl(35 97% 63%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

type IconProps = ComponentProps<LucideIcon>;

/**
 * Renders a Lucide icon with the brand gradient stroke.
 *
 * Usage:
 *   <GradientIcon icon={Activity} className="h-5 w-5" />
 *
 * Hover inversion (white icon on gradient bg) is handled by the parent
 * via Tailwind `group-hover` — add `group-hover:text-white` and
 * `group-hover:[&>svg]:stroke-white` classes as needed.
 */
export function GradientIcon({
  icon: Icon,
  className,
  ...props
}: { icon: LucideIcon } & Omit<IconProps, "ref">) {
  return (
    <Icon
      className={className}
      stroke="url(#icon-grad)"
      {...props}
    />
  );
}
