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

export interface EclipseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
  /** Whether the toggle should render in its dark-theme state. */
  toggled?: boolean;
  [key: `data-${string}`]: string | number | boolean | null | undefined;
}

export function Eclipse({
  duration = 500,
  toggled,
  className,
  children,
  type = "button",
  title = "Toggle theme",
  "aria-label": ariaLabel = "Toggle theme",
  "aria-pressed": ariaPressed,
  ...props
}: EclipseProps) {
  const toggleId = useId();

  const clipMainId = `toggles.dev-eclipse-main-${toggleId}`;

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
        viewBox="0 0 32 32"
        aria-hidden="true"
        fill={"currentColor"}
        style={
          { "--toggles-eclipse--duration": `${duration}ms` } as CSSProperties
        }
      >
        <defs>
          <clipPath id={clipMainId}>
            <path
              d={"M0 0h64v32h-64zm38 16a1 1 0 0020 0 1 1 0 00-20 0"}
              className="origin-center motion-safe:transition-[d,translate] motion-safe:[transition-duration:var(--toggles-eclipse--duration)] motion-safe:[transition-timing-function:cubic-bezier(0,0,0.05,1.15)] motion-safe:[transition-delay:0s] group-data-[toggled=true]/tt:[d:path('M-16_-16h64v64h-64zm22_32a1_1_0_0020_0_1_1_0_00-20_0')] group-data-[toggled=true]/tt:not-supports-[d:path('M0_0')]:-translate-x-[32px] motion-safe:group-data-[toggled=true]/tt:[transition-duration:calc(var(--toggles-eclipse--duration)_*_0.8)] motion-safe:group-data-[toggled=true]/tt:[transition-delay:calc(var(--toggles-eclipse--duration)_*_0.2)]"
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipMainId})`}>
          <circle
            cx={16}
            cy={16}
            r={16}
            className="[transform-origin:center] motion-safe:[transition-property:transform] motion-safe:[transition-duration:var(--toggles-eclipse--duration)] motion-safe:[transition-timing-function:cubic-bezier(0,0,0.05,1.15)]"
          />
        </g>
      </svg>
    {children}
    </button>
  );
}
