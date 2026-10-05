"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useState } from "react"
import { ChevronDown, Repeat, Shuffle, SlidersHorizontal, Waves, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { playModes, type PlayMode } from "@/registry/retana/ui/gauge-kit"
import { cn } from "@/lib/utils"
import { SliderControl } from "./slider-control"

const modes: Record<PlayMode, { label: string; icon: LucideIcon }> = {
  manual: { label: "Manual", icon: SlidersHorizontal },
  sweep: { label: "Sweep", icon: Repeat },
  wander: { label: "Wander", icon: Waves },
  jump: { label: "Jump", icon: Shuffle },
}

export const PlayModePicker = ({
  mode,
  period,
  amplitude,
  onModeChange,
  onPeriodChange,
  onAmplitudeChange,
  className,
}: {
  mode: PlayMode
  period: number
  amplitude: number
  onModeChange: (mode: PlayMode) => void
  onPeriodChange: (period: number) => void
  onAmplitudeChange: (amplitude: number) => void
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  const current = modes[mode]
  const Icon = current.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className={cn("min-w-0", className)} aria-label={`Play mode: ${current.label}`}>
          <Icon data-icon="inline-start" />
          <span className="truncate">{current.label}</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-[min(16rem,calc(100vw-1.5rem))] gap-2 bg-card p-2">
        <PopoverHeader className="px-1 pt-1">
          <PopoverTitle className="text-xs font-medium text-muted-foreground">Play mode</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-0.5">
          {playModes.map((value) => {
            const item = modes[value]
            const ItemIcon = item.icon
            const selected = value === mode
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onModeChange(value)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  selected ? "bg-accent ring-1 ring-foreground/10" : "hover:bg-muted"
                )}
              >
                <ItemIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
        {mode !== "manual" ? (
          <div className="flex flex-col gap-1 border-t border-border pt-2">
            <SliderControl label="Period" value={period} min={0.2} max={20} step={0.1} onChange={onPeriodChange} />
            {mode === "wander" ? (
              <SliderControl label="Amplitude" value={amplitude} min={0} max={1} step={0.01} onChange={onAmplitudeChange} />
            ) : null}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
