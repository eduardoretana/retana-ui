"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export type DissolveInputProps = Omit<React.ComponentProps<typeof Input>, "onSubmit"> & {
  onDissolve?: (value: string) => void
  clearLabel?: string
}

function spawn(canvas: HTMLCanvasElement, text: string, input: HTMLInputElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) return []
  const rect = input.getBoundingClientRect()
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.floor(rect.width * ratio))
  canvas.height = Math.max(1, Math.floor(rect.height * ratio))
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  context.scale(ratio, ratio)
  const style = getComputedStyle(input)
  context.clearRect(0, 0, rect.width, rect.height)
  context.font = style.font
  context.fillStyle = style.color
  const padding = Number.parseFloat(style.paddingLeft) || 10
  context.textBaseline = "middle"
  context.fillText(text, padding, rect.height / 2)
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const particles: Particle[] = []
  const step = Math.max(2, Math.floor(3 * ratio))
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = image.data[(y * canvas.width + x) * 4 + 3]
      if (alpha < 40) continue
      particles.push({
        x: x / ratio,
        y: y / ratio,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 1.2,
        life: 1,
      })
    }
  }
  context.setTransform(1, 0, 0, 1, 0, 0)
  return particles
}

export function DissolveInput({
  onDissolve,
  clearLabel = "Clear",
  className,
  onKeyDown,
  ...props
}: DissolveInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = React.useState(false)

  function dissolve() {
    const input = inputRef.current
    const canvas = canvasRef.current
    if (!input || !canvas || busy) return
    const value = input.value
    if (!value) return
    onDissolve?.(value)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      input.value = ""
      input.dispatchEvent(new Event("input", { bubbles: true }))
      return
    }
    const particles = spawn(canvas, value, input)
    input.value = ""
    input.dispatchEvent(new Event("input", { bubbles: true }))
    setBusy(true)
    const context = canvas.getContext("2d")
    if (!context) {
      setBusy(false)
      return
    }
    const color = getComputedStyle(input).color
    let frame = 0
    const tick = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      let alive = false
      context.fillStyle = color
      for (const particle of particles) {
        particle.life -= 0.02
        if (particle.life <= 0) continue
        alive = true
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy -= 0.02
        context.globalAlpha = Math.max(0, particle.life)
        context.fillRect(particle.x, particle.y, 1.6, 1.6)
      }
      context.globalAlpha = 1
      if (alive) frame = window.requestAnimationFrame(tick)
      else setBusy(false)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }

  return (
    <div data-slot="dissolve-input" className={cn("relative", className)}>
      <Input
        ref={inputRef}
        aria-keyshortcuts="Enter"
        className="pr-16"
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented) return
          if (event.key === "Enter") {
            event.preventDefault()
            dissolve()
          }
        }}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        onClick={dissolve}
      >
        {clearLabel}
      </button>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", busy ? "opacity-100" : "opacity-0")}
      />
    </div>
  )
}
