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

import { type ButtonHTMLAttributes, type CSSProperties } from "react";

export interface InnerMoonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
  /** Whether the toggle should render in its dark-theme state. */
  toggled?: boolean;
  [key: `data-${string}`]: string | number | boolean | null | undefined;
}

export function InnerMoon({
  duration = 500,
  toggled,
  className,
  children,
  type = "button",
  title = "Toggle theme",
  "aria-label": ariaLabel = "Toggle theme",
  "aria-pressed": ariaPressed,
  ...props
}: InnerMoonProps) {
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
          { "--toggles-inner-moon--duration": `${duration}ms` } as CSSProperties
        }
      >
        <path
          d={
            "M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z"
          }
          className="origin-center motion-safe:transition-transform motion-safe:duration-(--toggles-inner-moon--duration) motion-safe:[transition-timing-function:cubic-bezier(0,0,0.15,1.25)] group-data-[toggled=true]/tt:rotate-180"
        />
        <circle
          cx={16}
          cy={16}
          r={7.6}
          className="origin-center motion-safe:transition-transform motion-safe:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-safe:[transition-duration:calc(var(--toggles-inner-moon--duration)/1.5)] group-data-[toggled=true]/tt:translate-x-[15%]"
        />
      </svg>
    {children}
    </button>
  );
}
