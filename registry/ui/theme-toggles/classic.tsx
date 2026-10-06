"use client"

/**
 * Ported from theme-toggles by Alfie Jones (MIT).
 * https://github.com/AlfieJones/theme-toggles
 * Pinned from the toggles.dev registry at upstream commit b6f8b5f8217b
 * (@theme-toggles/react@5.0.5). The repository publishes no LICENSE file.
 * MIT is declared in the README ("## License MIT") and in the package.json
 * `license` field. Copyright (c) Alfie Jones.
 *
 * Modifications (Retana UI, 2026):
 * - `dark:` utilities are rewritten to `group-data-[toggled=true]/tt:` so the
 *   icon follows the `toggled` prop and not the host page's `.dark` class.
 * - Children render after the icon so theme-switch can add a label.
 * - The button is marked `data-toggled` and `group/tt`.
 */

import { type ButtonHTMLAttributes, type CSSProperties, useId } from "react";

export interface ClassicProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
  /** Whether the toggle should render in its dark-theme state. */
  toggled?: boolean;
  [key: `data-${string}`]: string | number | boolean | null | undefined;
}

export function Classic({
  duration = 400,
  toggled,
  className,
  children,
  type = "button",
  title = "Toggle theme",
  "aria-label": ariaLabel = "Toggle theme",
  "aria-pressed": ariaPressed,
  ...props
}: ClassicProps) {
  const toggleId = useId();

  const clipMainId = `toggles.dev-classic-main-${toggleId}`;

  return (
    <button
      {...props}
      type={type}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={toggled ?? ariaPressed}
      data-toggled={toggled ? "true" : "false"}
      className={["group/tt", className].filter(Boolean).join(" ")}
    >
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={
          { "--toggles-dot-dev--duration": `${duration}ms` } as CSSProperties
        }
      >
        <defs>
          <clipPath id={clipMainId}>
            <path
              d={"M0 0h25a1 1 0 0010 10v14H0Z"}
              className="motion-safe:transition-[d,translate] motion-safe:duration-(--toggles-dot-dev--duration) motion-safe:group-data-[toggled=true]/tt:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] group-data-[toggled=true]/tt:[d:path('M0_2h13a1_1_0_0010_10v14H0Z')] group-data-[toggled=true]/tt:not-supports-[d:path('M0_0')]:-translate-x-3.25 group-data-[toggled=true]/tt:not-supports-[d:path('M0_0')]:translate-y-0.5"
            />
          </clipPath>
        </defs>
        <g stroke={"currentColor"} strokeLinecap={"round"}>
          <circle
            cx={12}
            cy={12}
            r={5}
            fill={"currentColor"}
            clipPath={`url(#${clipMainId})`}
            className="origin-center motion-safe:transition-transform motion-safe:duration-(--toggles-dot-dev--duration) group-data-[toggled=true]/tt:scale-170"
          />
          <path
            d={"M12 1.4v2.4"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"m20.3 3.7-2.5 2.5"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"M22.6 12h-2.4"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"M12 22.6v-2.4"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"M1.4 12h2.4"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"m20.3 20.3-2.5-2.5"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"m3.7 20.3 2.5-2.5"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
          <path
            d={"m3.7 3.7 2.5 2.5"}
            fill={"none"}
            strokeWidth={2}
            strokeLinejoin={"round"}
            strokeMiterlimit={0}
            paintOrder={"stroke markers fill"}
            className="[transform-box:view-box] [transform-origin:center] motion-safe:[transition:transform_var(--toggles-dot-dev--duration),opacity_var(--toggles-dot-dev--duration)] motion-safe:delay-[calc(var(--toggles-dot-dev--duration)*0.15)] motion-safe:group-data-[toggled=true]/tt:delay-0 group-data-[toggled=true]/tt:[transform:scale(0)] group-data-[toggled=true]/tt:opacity-0"
          />
        </g>
      </svg>
    {children}
    </button>
  );
}
