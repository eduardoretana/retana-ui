"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useMemo, useState } from "react"
import { ChevronDown, Layers, Plus, Trash2 } from "lucide-react"

import { GaugeComposition, buildSpec, type GaugeLayer } from "@/registry/retana/ui/gauge-kit"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const LayerPicker = ({
  layers,
  selected,
  onSelect,
  onAdd,
  onRemove,
  className,
}: {
  layers: GaugeLayer[]
  selected: number
  onSelect: (index: number) => void
  onAdd: () => void
  onRemove: (index: number) => void
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  const current = layers[selected] ?? layers[0]
  const stack = layers.map((layer, index) => ({ layer, index })).reverse()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className={cn("min-w-0", className)} aria-label={`Gauges: ${current?.name ?? "Main"} selected`}>
          <Layers data-icon="inline-start" />
          <span className="truncate">{current?.name ?? "Main"}</span>
          {layers.length > 1 ? <span className="rounded-full bg-foreground/10 px-1.5 text-[11px] tabular-nums">{layers.length}</span> : null}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="max-h-96 w-[min(17rem,calc(100vw-1.5rem))] gap-2 overflow-y-auto bg-card p-2">
        <PopoverHeader className="px-1 pt-1">
          <PopoverTitle className="text-xs font-medium text-muted-foreground">Gauges</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-0.5">
          {stack.map(({ layer, index }) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              selected={index === selected}
              removable={index !== 0}
              onSelect={() => onSelect(index)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={onAdd} className="w-full justify-start">
          <Plus data-icon="inline-start" />
          Add a gauge
        </Button>
      </PopoverContent>
    </Popover>
  )
}

const LayerRow = ({
  layer,
  selected,
  removable,
  onSelect,
  onRemove,
}: {
  layer: GaugeLayer
  selected: boolean
  removable: boolean
  onSelect: () => void
  onRemove: () => void
}) => {
  const spec = useMemo(() => buildSpec(layer.values), [layer.values])
  return (
    <div className={cn("flex items-center gap-2 rounded-xl p-1", selected ? "bg-accent ring-1 ring-foreground/10" : "hover:bg-muted")}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background p-1">
          <GaugeComposition spec={spec} value={layer.values.value.value} label={layer.name} transition={false} />
        </span>
        <span className="truncate text-sm font-medium">{layer.name}</span>
      </button>
      {removable ? (
        <Button size="icon-sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${layer.name}`} className="shrink-0 text-muted-foreground hover:text-destructive">
          <Trash2 />
        </Button>
      ) : (
        <span className="shrink-0 pr-1.5 text-[11px] text-muted-foreground">Base</span>
      )}
    </div>
  )
}
