"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useRef } from "react"

import { Row } from "./field-controls"
import {
  snapToStep,
  stepDecimals,
  type PadAxis,
  type PadConfig,
  type PadValue,
} from "@/registry/retana/ui/gauge-kit"

const DEFAULT_AXIS: PadAxis = [0, -1, 1, 0.01]

export const PadControl = ({
  label,
  pad,
  value,
  onChange,
}: {
  label: string
  pad?: PadConfig
  value: PadValue
  onChange: (value: PadValue) => void
}) => {
  const [, minX, maxX, stepX = 0.01] = pad?.x ?? DEFAULT_AXIS
  const [, minY, maxY, stepY = 0.01] = pad?.y ?? DEFAULT_AXIS
  const area = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const apply = (clientX: number, clientY: number) => {
    const rect = area.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    const tx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const ty = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    onChange({
      x: snapToStep(minX + tx * (maxX - minX), stepX, minX, maxX),
      y: snapToStep(minY + (1 - ty) * (maxY - minY), stepY, minY, maxY),
    })
  }

  const nudge = (dx: number, dy: number) =>
    onChange({
      x: snapToStep(value.x + dx * stepX, stepX, minX, maxX),
      y: snapToStep(value.y + dy * stepY, stepY, minY, maxY),
    })

  const fmt = (n: number, step: number) => n.toFixed(stepDecimals(step))
  const px = (value.x - minX) / (maxX - minX || 1)
  const py = (value.y - minY) / (maxY - minY || 1)

  return (
    <div className="flex flex-col gap-1">
      <Row label={label}>
        <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
          {fmt(value.x, stepX)}, {fmt(value.y, stepY)}
        </span>
      </Row>
      <div
        ref={area}
        tabIndex={0}
        role="application"
        aria-label={label}
        onPointerDown={(event) => {
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          event.currentTarget.focus()
          apply(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (dragging.current) apply(event.clientX, event.clientY)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onKeyDown={(event) => {
          const dx = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
          const dy = event.key === "ArrowDown" ? -1 : event.key === "ArrowUp" ? 1 : 0
          if (!dx && !dy) return
          event.preventDefault()
          nudge(dx, dy)
        }}
        className="relative h-28 w-full cursor-crosshair touch-none overflow-hidden rounded-md bg-input/50 select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklch, var(--foreground) 22%, var(--background)) 1px, var(--background) 1.5px)",
            backgroundSize: "calc(100% / 21) calc(100% / 7)",
            backgroundPosition: "center",
          }}
        />
        <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-foreground/10" />
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-foreground/10" />
        <div
          aria-hidden
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-sm"
          style={{ left: `${px * 100}%`, top: `${(1 - py) * 100}%` }}
        />
      </div>
    </div>
  )
}
