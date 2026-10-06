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

export interface AroundProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number;
  /** Whether the toggle should render in its dark-theme state. */
  toggled?: boolean;
  [key: `data-${string}`]: string | number | boolean | null | undefined;
}

export function Around({
  duration = 500,
  toggled,
  className,
  children,
  type = "button",
  title = "Toggle theme",
  "aria-label": ariaLabel = "Toggle theme",
  "aria-pressed": ariaPressed,
  ...props
}: AroundProps) {
  const toggleId = useId();

  const clipMainId = `toggles.dev-around-main-${toggleId}`;

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
          { "--toggles-around--duration": `${duration}ms` } as CSSProperties
        }
      >
        <defs>
          <clipPath
            id={clipMainId}
            className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] group-data-[toggled=true]/tt:[transform:rotate(-90deg)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_var(--toggles-around--duration)_ease]"
          >
            <path
              d={"M0 0h42v30a1 1 0 00-16 13H0Z"}
              className="motion-safe:transition-[d,translate] motion-safe:[transition-duration:calc(var(--toggles-around--duration)_*_0.6)] motion-safe:[transition-timing-function:ease] group-data-[toggled=true]/tt:[d:path('M-12_-14h42v30a1_1_0_00-16_13H0Z')] group-data-[toggled=true]/tt:not-supports-[d:path('M0_0')]:-translate-x-[12px] group-data-[toggled=true]/tt:not-supports-[d:path('M0_0')]:-translate-y-[14px] motion-safe:group-data-[toggled=true]/tt:[transition-duration:var(--toggles-around--duration)]"
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipMainId})`}>
          <circle
            cx={16}
            cy={16}
            r={8.4}
            className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.6)_ease] group-data-[toggled=true]/tt:[transform:scale(1.4)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_var(--toggles-around--duration)_ease]"
          />
          <g>
            <circle
              cx={16}
              cy={3.3}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.253)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
            <circle
              cx={27}
              cy={9.7}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.348)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
            <circle
              cx={27}
              cy={22.3}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.443)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
            <circle
              cx={16}
              cy={28.7}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.538)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
            <circle
              cx={5}
              cy={22.3}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.633)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
            <circle
              cx={5}
              cy={9.7}
              r={2.3}
              className="[transform-origin:center] motion-safe:[transition:transform_calc(var(--toggles-around--duration)_*_0.2)_ease_calc(var(--toggles-around--duration)_*_0.728)] group-data-[toggled=true]/tt:[transform:scale(0)] motion-safe:group-data-[toggled=true]/tt:[transition:transform_calc(var(--toggles-around--duration)_*_0.4)_ease]"
            />
          </g>
        </g>
      </svg>
    {children}
    </button>
  );
}
