"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type LogoMarqueeProps = {
  children: React.ReactNode
  /** Seconds for one full loop. */
  duration?: number
  pauseOnHover?: boolean
  fade?: boolean
  label?: string
  className?: string
}

export function LogoMarquee({
  children,
  duration = 28,
  pauseOnHover = true,
  fade = true,
  label = "Logo carousel",
  className,
}: LogoMarqueeProps) {
  const trackId = React.useId().replace(/:/g, "")
  const mask = fade
    ? "linear-gradient(to right, transparent, var(--foreground) 12%, var(--foreground) 88%, transparent)"
    : undefined

  return (
    <div
      data-slot="logo-marquee"
      role="region"
      aria-label={label}
      className={cn("group relative overflow-hidden", className)}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      <style>
        {`@keyframes retana-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.m${trackId}{animation:retana-marquee ${duration}s linear infinite}
${pauseOnHover ? `.group:hover .m${trackId}{animation-play-state:paused}` : ""}
@media (prefers-reduced-motion: reduce){.m${trackId}{animation:none}}`}
      </style>
      <div className={cn(`m${trackId}`, "flex w-max")}>
        <div className="flex items-center gap-10 px-5">{children}</div>
        <div className="flex items-center gap-10 px-5" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
