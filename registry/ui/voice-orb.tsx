"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/voice-orb/voice-orb.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export type VoiceOrbState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "muted"

const STATE_CONFIG: Record<VoiceOrbState, { speed: number; amplitude: number; reactsTo: "input" | "output" | "none" }> = {
  idle: { speed: 0.4, amplitude: 0.5, reactsTo: "none" },
  connecting: { speed: 1.6, amplitude: 0.52, reactsTo: "none" },
  listening: { speed: 0.8, amplitude: 0.55, reactsTo: "input" },
  thinking: { speed: 1.2, amplitude: 0.5, reactsTo: "none" },
  speaking: { speed: 1.0, amplitude: 0.6, reactsTo: "output" },
  muted: { speed: 0.3, amplitude: 0.45, reactsTo: "none" },
}

const STATE_LABEL: Record<VoiceOrbState, string> = {
  idle: "Assistant is idle",
  connecting: "Assistant is connecting",
  listening: "Assistant is listening",
  thinking: "Assistant is thinking",
  speaking: "Assistant is speaking",
  muted: "Assistant is muted",
}

export type VoiceOrbProps = {
  state?: VoiceOrbState
  getInputVolume?: () => number
  getOutputVolume?: () => number
  size?: number
  color?: string
  className?: string
}

function readCssColor(element: HTMLElement, name: string) {
  const probe = element.style.color
  element.style.color = name.startsWith("var(") ? name : `var(${name})`
  const resolved = getComputedStyle(element).color
  element.style.color = probe
  return resolved
}

export function VoiceOrb({
  state = "idle",
  getInputVolume,
  getOutputVolume,
  size = 160,
  color = "--primary",
  className,
}: VoiceOrbProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const stateRef = React.useRef(state)
  const inputRef = React.useRef(getInputVolume)
  const outputRef = React.useRef(getOutputVolume)
  const colorRef = React.useRef(color)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    stateRef.current = state
    inputRef.current = getInputVolume
    outputRef.current = getOutputVolume
    colorRef.current = color
  })

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let frame = 0
    let stopped = false
    const visible = { current: true }
    const start = performance.now()
    let smoothed = 0
    let paint = readCssColor(canvas, colorRef.current)

    const observer = new MutationObserver(() => {
      paint = readCssColor(canvas, colorRef.current)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] })

    const intersection = new IntersectionObserver((entries) => {
      visible.current = entries.some((entry) => entry.isIntersecting)
    })
    intersection.observe(canvas)

    const draw = (now: number) => {
      if (stopped) return
      const cfg = STATE_CONFIG[stateRef.current]
      let volume = 0
      if (cfg.reactsTo === "input") volume = inputRef.current?.() ?? 0
      else if (cfg.reactsTo === "output") volume = outputRef.current?.() ?? 0
      volume = Math.max(0, Math.min(1, volume))
      smoothed += (volume - smoothed) * 0.2
      const pulse = reduced ? 0 : Math.sin(((now - start) / 1000) * cfg.speed * Math.PI * 2) * 0.05
      const radius = (size / 2) * (cfg.amplitude + pulse + smoothed * 0.25)
      ctx.clearRect(0, 0, size, size)
      ctx.globalAlpha = stateRef.current === "muted" ? 0.35 : 0.9
      ctx.fillStyle = paint || "currentColor"
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, Math.max(4, radius), 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      if (reduced || document.hidden || !visible.current) return
      frame = requestAnimationFrame(draw)
    }

    const onVisibility = () => {
      if (!document.hidden && !reduced) frame = requestAnimationFrame(draw)
    }
    document.addEventListener("visibilitychange", onVisibility)
    frame = requestAnimationFrame(draw)
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reduced, size])

  return (
    <span className={cn("inline-flex max-w-full", className)} style={{ width: "100%", maxWidth: size }}>
      <canvas ref={canvasRef} role="img" aria-label={STATE_LABEL[state]} data-state={state} className="block h-auto w-full" />
      <span className="sr-only" aria-live="polite">
        {STATE_LABEL[state]}
      </span>
    </span>
  )
}
