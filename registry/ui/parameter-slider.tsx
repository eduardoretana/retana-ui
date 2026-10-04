"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/input-controls/parameter-slider/parameter-slider.tsx

import * as React from "react"
import { Info, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ParameterMark = { value: number; label: string }

export type ParameterSliderProps = {
  label: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  format?: (value: number) => string
  info?: string
  marks?: ParameterMark[]
  resetLabel?: string
  className?: string
  classNames?: { root?: string; label?: string; value?: string; slider?: string }
}

function decimalsOf(step: number) {
  const text = String(step)
  const index = text.indexOf(".")
  return index === -1 ? 0 : text.length - index - 1
}

export function ParameterSlider({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 1,
  step = 0.1,
  format,
  info,
  marks,
  resetLabel = "Reset",
  className,
  classNames,
}: ParameterSliderProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [editing, setEditing] = React.useState(false)
  const current = value ?? internal
  const digits = decimalsOf(step)
  const text = format ? format(current) : current.toFixed(digits)

  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    const stepped = Number(clamped.toFixed(digits))
    if (value === undefined) setInternal(stepped)
    onValueChange?.(stepped)
  }

  return (
    <div className={cn("flex flex-col gap-2", className, classNames?.root)}>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm text-foreground", classNames?.label)}>{label}</span>
        {info ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label={`About ${label}`} className="text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{info}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
        <span className="ml-auto">
          {editing ? (
            <input
              aria-label={label}
              className="w-16 rounded-md border border-border bg-background px-1 text-right font-mono text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              defaultValue={current}
              inputMode="decimal"
              onBlur={(event) => {
                const parsed = Number(event.target.value)
                if (Number.isFinite(parsed)) commit(parsed)
                setEditing(false)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur()
                if (event.key === "Escape") setEditing(false)
              }}
            />
          ) : (
            <button
              type="button"
              className={cn("font-mono text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", classNames?.value)}
              onClick={() => setEditing(true)}
            >
              {text}
            </button>
          )}
        </span>
        {current !== defaultValue ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={resetLabel} onClick={() => commit(defaultValue)}>
            <RotateCcw data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
      <Slider
        aria-label={label}
        aria-valuetext={text}
        min={min}
        max={max}
        step={step}
        value={[current]}
        onValueChange={(next) => commit(next[0] ?? current)}
        className={classNames?.slider}
      />
      {marks && marks.length > 0 ? (
        <div className="flex justify-between text-xs text-muted-foreground">
          {marks.map((mark) => (
            <span key={mark.label}>{mark.label}</span>
          ))}
        </div>
      ) : (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  )
}
