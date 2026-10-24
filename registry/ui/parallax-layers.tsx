"use client"

/**
 * Layers that travel at different speeds while their parent crosses the viewport.
 * Clean-room. Transform only, so the layout box does not move.
 * Reduced motion holds every layer still. The first paint matches the server.
 */

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react"
import { motion, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { useScrollProgress } from "@/registry/retana/hooks/use-scroll-progress"
import { useAnimationTimeline } from "@/registry/retana/lib/scroll-timeline"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

/** Pixels a layer travels, from entry to exit, when speed is 1. */
export const PARALLAX_DISTANCE = 64

const subscribe = () => () => {}

export function parallaxOffset(speed: number, distance = PARALLAX_DISTANCE) {
  if (!Number.isFinite(speed) || !Number.isFinite(distance)) return 0
  return speed * distance
}

export type ParallaxDriver = "static" | "css" | "hook"

/** view() matches the element crossing the viewport. The hook is the fallback. */
export function parallaxDriver(reduced: boolean, supported: boolean): ParallaxDriver {
  if (reduced) return "static"
  if (supported) return "css"
  return "hook"
}

export const PARALLAX_CSS = `
@keyframes retana-parallax-layer {
  from { transform: translateY(var(--parallax-from, 0px)); }
  to { transform: translateY(var(--parallax-to, 0px)); }
}
@supports (animation-timeline: view()) {
  [data-slot="parallax-layer"][data-driver="css"] {
    animation-name: retana-parallax-layer;
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: view();
    animation-range: cover 0% cover 100%;
  }
}
`

export type ParallaxLayer = {
  id: string
  /** Travel factor. 0 stays put. Larger values move farther. */
  speed?: number
  /** Alias of speed. */
  depth?: number
  className?: string
  /** Hide the layer from the accessibility tree when it is only a shape. */
  decorative?: boolean
  children: ReactNode
}

export type ParallaxLayersProps = {
  layers: ParallaxLayer[]
  className?: string
  label?: string
  /** Pixels of travel at speed 1. Default 64. */
  distance?: number
  /** Scrollport. Omit to use the window. */
  container?: RefObject<HTMLElement | null>
}

export function ParallaxLayers({
  layers,
  className,
  label = "Parallax",
  distance = PARALLAX_DISTANCE,
  container,
}: ParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const viewTimeline = useAnimationTimeline("view()")
  const driver = parallaxDriver(reduced, viewTimeline)
  const { progress } = useScrollProgress({
    container,
    target: ref,
    offset: ["start end", "end start"],
  })

  return (
    <div
      ref={ref}
      data-slot="parallax-layers"
      data-motion={reduced ? "static" : "parallax"}
      role="group"
      aria-label={label}
      className={cn("relative h-64 overflow-hidden", className)}
    >
      <style>{PARALLAX_CSS}</style>
      {layers.map((layer) => (
        <ParallaxLayerView
          key={layer.id}
          progress={progress}
          speed={layer.speed ?? layer.depth ?? 0}
          distance={distance}
          driver={driver}
          className={layer.className}
          decorative={layer.decorative}
        >
          {layer.children}
        </ParallaxLayerView>
      ))}
    </div>
  )
}

function ParallaxLayerView({
  progress,
  speed,
  distance,
  driver,
  className,
  decorative,
  children,
}: {
  progress: MotionValue<number>
  speed: number
  distance: number
  driver: ParallaxDriver
  className?: string
  decorative?: boolean
  children: ReactNode
}) {
  const offset = parallaxOffset(speed, distance)
  const y = useTransform(progress, [0, 1], [offset, -offset])
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const cssStyle = {
    "--parallax-from": `${offset}px`,
    "--parallax-to": `${-offset}px`,
  } as CSSProperties

  return (
    <motion.div
      data-slot="parallax-layer"
      data-speed={speed}
      data-driver={driver}
      aria-hidden={decorative ? true : undefined}
      className={cn("absolute inset-0", className)}
      style={driver === "css" ? cssStyle : { y: mounted && driver === "hook" ? y : 0 }}
    >
      {children}
    </motion.div>
  )
}
