"use client"

/**
 * Squircle surface. Uses CSS `corner-shape: squircle` where the browser
 * supports it (Chromium 139+, including Edge). Safari and Firefox use a
 * clip-path from the Monoco squircle path (MIT, see squircle-path.ts).
 * The fallback draws the border as an SVG stroke and the shadow as a
 * drop-shadow, because clip-path removes box-shadow and border.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { squirclePathString } from "@/registry/retana/lib/squircle-path"

export { squirclePathString }

const subscribe = () => () => {}

/** True after hydration when `corner-shape: squircle` is supported. */
export function useCornerShapeSupport() {
  return React.useSyncExternalStore(
    subscribe,
    () => typeof CSS !== "undefined" && CSS.supports("corner-shape", "squircle"),
    () => false,
  )
}

export type SquircleProps = React.ComponentProps<"div"> & {
  /** Corner radius in pixels. One number, or top-left, top-right, bottom-right, bottom-left. */
  radius?: number | number[]
  /** Monoco / Figma smoothing, 0–1. Used by the clip-path fallback. Default 1. */
  smoothing?: number
  /** Border thickness in pixels, painted with the host border token. Default 1. */
  borderWidth?: number
  /** Drop shadow that follows the shape. */
  shadow?: boolean
}

export function Squircle({
  radius = 28,
  smoothing = 1,
  borderWidth = 1,
  shadow = false,
  className,
  children,
  style,
  ...props
}: SquircleProps) {
  const supported = useCornerShapeSupport()
  const ref = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ width: 0, height: 0 })

  React.useLayoutEffect(() => {
    if (supported) return
    const node = ref.current
    if (!node) return
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight }
      setBox((current) => (current.width === next.width && current.height === next.height ? current : next))
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [supported])

  const radiusPx = typeof radius === "number" ? `${radius}px` : radius.map((value) => `${value}px`).join(" ")
  const path = !supported && box.width > 0 && box.height > 0
    ? squirclePathString(box.width, box.height, radius, smoothing)
    : ""

  return (
    <div
      ref={ref}
      data-slot="squircle"
      data-corner={supported ? "native" : "clip"}
      className={cn("relative", shadow && (supported ? "shadow-md" : "drop-shadow-md"), className)}
      style={{
        borderRadius: radiusPx,
        ...(supported
          ? {
              cornerShape: "squircle",
              borderStyle: borderWidth > 0 ? "solid" : undefined,
              borderWidth: borderWidth > 0 ? borderWidth : undefined,
              borderColor: borderWidth > 0 ? "var(--border)" : undefined,
            }
          : path
            ? { clipPath: `path('${path}')` }
            : null),
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {children}
      {!supported && path && borderWidth > 0 ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
          viewBox={`0 0 ${box.width} ${box.height}`}
        >
          <path d={path} fill="none" stroke="var(--border)" strokeWidth={borderWidth * 2} />
        </svg>
      ) : null}
    </div>
  )
}
