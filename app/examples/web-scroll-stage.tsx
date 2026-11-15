"use client"

import type { ReactNode } from "react"
import { useReducedMotionConfig } from "motion/react"

import { useSceneMode } from "@/app/catalog/scene-mode"
import { sceneText, type SceneLocale } from "@/app/catalog/scene-types"
import { cn } from "@/lib/utils"

/**
 * Demo-only scroller for the web scroll pieces. Each scene scrolls inside its own box,
 * so view() and scroll() timelines have room to run inside the scene frame.
 * The catalog thumbnail renders the piece without the scroller and without motion.
 */
export function useWebSceneMotion(): "auto" | "off" {
  const reduced = useReducedMotionConfig()
  const { interactive } = useSceneMode()
  return reduced || !interactive ? "off" : "auto"
}

export function WebScrollStage({
  locale,
  children,
  className,
  lead = true,
}: {
  locale: SceneLocale
  children: ReactNode
  className?: string
  /** Space before and after the piece so it can enter and leave the box. */
  lead?: boolean
}) {
  const { interactive } = useSceneMode()
  if (!interactive) return <div className={className}>{children}</div>
  const hint = sceneText(locale, "Desplázate dentro del recuadro", "Scroll inside the box")
  return (
    <div
      role="region"
      aria-label={sceneText(locale, "Demo con desplazamiento", "Scrolling demo")}
      tabIndex={0}
      className={cn(
        "h-[28rem] overflow-y-auto overscroll-contain rounded-lg border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {lead ? <p className="flex h-48 items-end justify-center pb-6 text-xs text-muted-foreground">{hint} ↓</p> : null}
      <div className="px-4">{children}</div>
      {lead ? <div aria-hidden="true" className="h-64" /> : null}
    </div>
  )
}
