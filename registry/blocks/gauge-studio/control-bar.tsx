"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useState } from "react"

import { Slider } from "@/components/ui/slider"
import { stepDecimals, type GaugeLayer, type PlayMode } from "@/registry/retana/ui/gauge-kit"
import { LayerPicker } from "./layer-picker"
import { PlayModePicker } from "./play-mode-picker"

export const ControlBar = ({
  layers,
  selected,
  onSelect,
  onAdd,
  onRemove,
  value,
  min,
  max,
  step,
  mode,
  period,
  amplitude,
  onValueChange,
  onModeChange,
  onPeriodChange,
  onAmplitudeChange,
}: {
  layers: GaugeLayer[]
  selected: number
  onSelect: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  value: number
  min: number
  max: number
  step: number
  mode: PlayMode
  period: number
  amplitude: number
  onValueChange: (value: number) => void
  onModeChange: (mode: PlayMode) => void
  onPeriodChange: (period: number) => void
  onAmplitudeChange: (amplitude: number) => void
}) => {
  const [draft, setDraft] = useState<string | null>(null)
  const decimals = stepDecimals(step)
  const shown = (Number.isFinite(value) ? value : 0).toFixed(decimals)
  const safe = Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

  const commit = () => {
    if (draft !== null) {
      const parsed = Number.parseFloat(draft)
      if (Number.isFinite(parsed)) onValueChange(Math.min(max, Math.max(min, parsed)))
    }
    setDraft(null)
  }

  return (
    <div className="flex w-full max-w-xl flex-wrap items-center gap-1 rounded-2xl bg-secondary/80 p-1 text-card-foreground ring-1 ring-foreground/10">
      <LayerPicker layers={layers} selected={selected} onSelect={onSelect} onAdd={onAdd} onRemove={onRemove} className="min-w-0 shrink justify-start" />
      <PlayModePicker
        mode={mode}
        period={period}
        amplitude={amplitude}
        onModeChange={onModeChange}
        onPeriodChange={onPeriodChange}
        onAmplitudeChange={onAmplitudeChange}
        className="shrink"
      />
      <div className="relative h-8 min-w-36 flex-1 basis-full sm:basis-auto">
        <Slider
          min={min}
          max={max}
          step={step}
          value={[safe]}
          onValueChange={(next) => onValueChange(next[0] ?? min)}
          aria-label="Gauge value"
          className="h-8 [&_[data-slot=slider-track]]:h-8 [&_[data-slot=slider-track]]:rounded-full"
        />
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-end px-2.5">
          {draft === null ? (
            <button
              type="button"
              aria-label="Edit gauge value"
              className="pointer-events-auto border-b border-transparent font-mono text-xs text-muted-foreground tabular-nums"
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
              aria-label="Gauge value"
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") commit()
                if (event.key === "Escape") setDraft(null)
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="pointer-events-auto w-14 border-b border-muted-foreground bg-transparent text-right font-mono text-xs tabular-nums outline-none"
            />
          )}
        </div>
      </div>
    </div>
  )
}
