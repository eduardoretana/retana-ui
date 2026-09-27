"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

export type GooeySliderProps = {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  label?: string
  className?: string
  disabled?: boolean
}

export function GooeySlider({
  value,
  defaultValue = 40,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label = "Value",
  className,
  disabled = false,
}: GooeySliderProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value ?? uncontrolled
  const filterId = React.useId().replace(/:/g, "")
  const leadRef = React.useRef<SVGCircleElement>(null)
  const trailRef = React.useRef<SVGCircleElement>(null)
  const valueRef = React.useRef(current)
  const trailRefValue = React.useRef(current)
  const dragging = React.useRef(false)

  React.useEffect(() => {
    valueRef.current = current
    let frame = 0
    const tick = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const target = valueRef.current
      const previous = trailRefValue.current
      const trail = reduced ? target : previous + (target - previous) * (dragging.current ? 0.16 : 0.28)
      const settled = reduced || (!dragging.current && Math.abs(trail - target) < 0.2)
      trailRefValue.current = settled ? target : trail
      const span = max - min || 1
      leadRef.current?.setAttribute("cx", `${((target - min) / span) * 100}%`)
      trailRef.current?.setAttribute("cx", `${((trailRefValue.current - min) / span) * 100}%`)
      if (!settled) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [current, max, min])

  function commit(next: number) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="gooey-slider"
      className={cn("relative h-12", className)}
      onPointerDown={() => {
        dragging.current = true
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-12 w-full -translate-y-1/2 overflow-visible text-primary">
        <defs>
          <filter id={filterId} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          <rect x="0" y="22" width="100%" height="6" rx="3" fill="currentColor" opacity="0.28" />
          <circle ref={trailRef} cy="25" r="10" fill="currentColor" />
          <circle ref={leadRef} cy="25" r="13" fill="currentColor" />
        </g>
      </svg>
      <span id={`${filterId}-label`} className="sr-only">
        {label}
      </span>
      <Slider
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 **:data-[slot=slider-range]:bg-transparent **:data-[slot=slider-thumb]:size-8 **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:bg-transparent **:data-[slot=slider-thumb]:shadow-none **:data-[slot=slider-track]:bg-transparent focus-visible:outline-none"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={[current]}
        aria-labelledby={`${filterId}-label`}
        aria-label={label}
        onValueChange={(next) => commit(next[0] ?? min)}
      />
    </div>
  )
}
