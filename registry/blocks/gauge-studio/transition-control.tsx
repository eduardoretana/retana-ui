"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { Row, SelectControl } from "./field-controls"
import { SliderControl } from "./slider-control"
import type { EasingConfig, TransitionConfig } from "@/registry/retana/ui/gauge-kit"
import { cn } from "@/lib/utils"

const DEFAULT_EASE: EasingConfig["ease"] = [0.25, 0.1, 0.25, 1]

const EASES: { value: string; label: string; ease: EasingConfig["ease"] }[] = [
  { value: "ease", label: "Ease", ease: DEFAULT_EASE },
  { value: "ease-out", label: "Ease out", ease: [0, 0, 0.58, 1] },
  { value: "ease-in-out", label: "Ease in-out", ease: [0.42, 0, 0.58, 1] },
  { value: "linear", label: "Linear", ease: [0, 0, 1, 1] },
]

const matchEase = (ease: EasingConfig["ease"]) =>
  EASES.find((entry) => entry.ease.every((n, i) => Math.abs(n - ease[i]) < 1e-3))?.value ?? "ease"

export const TransitionControl = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: TransitionConfig
  onChange: (value: TransitionConfig) => void
}) => {
  const setMode = (mode: "spring" | "easing") => {
    if (mode === value.type) return
    if (mode === "spring") {
      const duration = value.type === "easing" ? value.duration : 0.5
      onChange({ type: "spring", visualDuration: duration, bounce: 0.1 })
    } else {
      const duration = value.type === "spring" ? (value.visualDuration ?? 0.5) : 0.5
      onChange({ type: "easing", duration, ease: DEFAULT_EASE })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Row label={label}>
        <div className="flex rounded-full bg-muted p-0.5" role="group" aria-label={`${label} type`}>
          {(["spring", "easing"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={value.type === mode}
              onClick={() => setMode(mode)}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                value.type === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {mode === "spring" ? "Spring" : "Ease"}
            </button>
          ))}
        </div>
      </Row>
      {value.type === "spring" ? (
        <>
          <SliderControl
            label="Duration"
            value={value.visualDuration ?? 0.5}
            min={0.1}
            max={2}
            step={0.05}
            onChange={(visualDuration) => onChange({ ...value, visualDuration })}
          />
          <SliderControl
            label="Bounce"
            value={value.bounce ?? 0}
            min={0}
            max={1}
            step={0.01}
            onChange={(bounce) => onChange({ ...value, bounce })}
          />
        </>
      ) : (
        <>
          <SliderControl
            label="Duration"
            value={value.duration}
            min={0.1}
            max={3}
            step={0.05}
            onChange={(duration) => onChange({ ...value, duration })}
          />
          <SelectControl
            label="Curve"
            options={EASES.map(({ value: id, label: name }) => ({ value: id, label: name }))}
            value={matchEase(value.ease)}
            onChange={(name) => {
              const preset = EASES.find((entry) => entry.value === name)
              if (preset) onChange({ ...value, ease: preset.ease })
            }}
          />
        </>
      )}
    </div>
  )
}
