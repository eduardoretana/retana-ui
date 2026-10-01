"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type LogoMarqueeProps = {
  children: React.ReactNode
  /** Seconds for one full loop. */
  duration?: number
  pauseOnHover?: boolean
  fade?: boolean
  /** Shows a pause and play control. The loop still pauses on hover when that option is on. */
  controls?: boolean
  pauseLabel?: string
  playLabel?: string
  label?: string
  className?: string
}

export function LogoMarquee({
  children,
  duration = 28,
  pauseOnHover = true,
  fade = true,
  controls = false,
  pauseLabel = "Pause logos",
  playLabel = "Play logos",
  label = "Logo carousel",
  className,
}: LogoMarqueeProps) {
  const [paused, setPaused] = React.useState(false)
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
${paused ? `.m${trackId}{animation-play-state:paused}` : ""}
@media (prefers-reduced-motion: reduce){.m${trackId}{animation:none}}`}
      </style>
      <div className={cn(`m${trackId}`, "flex w-max")}>
        <div className="flex items-center gap-10 px-5">{children}</div>
        <div className="flex items-center gap-10 px-5" aria-hidden>
          {children}
        </div>
      </div>
      {controls ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="absolute right-2 bottom-2"
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? <Play /> : <Pause />}
          <span className="sr-only">{paused ? playLabel : pauseLabel}</span>
        </Button>
      ) : null}
    </div>
  )
}
