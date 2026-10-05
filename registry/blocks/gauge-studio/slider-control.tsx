"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useState } from "react"

import { Slider } from "@/components/ui/slider"
import { stepDecimals } from "@/registry/retana/ui/gauge-kit"

export type SliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

/** A full-width slider with the label inside the row and a typeable readout. */
export const SliderControl = ({ label, value, min, max, step, onChange }: SliderControlProps) => {
  const [draft, setDraft] = useState<string | null>(null)
  const decimals = stepDecimals(step)
  const safe = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
  const shown = safe.toFixed(decimals)

  const commit = () => {
    if (draft !== null) {
      const parsed = Number.parseFloat(draft)
      if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)))
    }
    setDraft(null)
  }

  return (
    <div className="relative">
      <Slider
        min={min}
        max={max}
        step={step}
        value={[safe]}
        onValueChange={(next) => onChange(next[0] ?? min)}
        aria-label={label}
        className="h-8 [&_[data-slot=slider-range]]:rounded-md [&_[data-slot=slider-track]]:h-8 [&_[data-slot=slider-track]]:rounded-md"
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between gap-2 px-2.5">
        <span className="truncate text-[13px] font-medium text-foreground/80">{label}</span>
        {draft === null ? (
          <button
            type="button"
            aria-label={`Edit ${label}`}
            className="pointer-events-auto shrink-0 border-b border-transparent font-mono text-xs text-muted-foreground tabular-nums hover:text-foreground"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setDraft(shown)}
          >
            {shown}
          </button>
        ) : (
          <input
            autoFocus
            value={draft}
            inputMode="decimal"
            aria-label={label}
            onFocus={(event) => event.target.select()}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit()
              if (event.key === "Escape") setDraft(null)
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="pointer-events-auto w-14 shrink-0 border-b border-muted-foreground bg-transparent text-right font-mono text-xs tabular-nums outline-none"
          />
        )}
      </div>
    </div>
  )
}
