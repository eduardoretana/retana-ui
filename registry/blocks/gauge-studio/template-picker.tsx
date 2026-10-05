"use client"

/** Adapted from Gauge UI (MIT). https://github.com/thordursk/gauge-ui */

import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { GaugeComposition, gaugeTemplates, templatePreview, type GaugeTemplate } from "@/registry/retana/ui/gauge-kit"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const templateFrom = (selected: GaugeTemplate | null, step: 1 | -1) => {
  const count = gaugeTemplates.length
  const index = selected ? gaugeTemplates.findIndex((item) => item.id === selected.id) : -1
  if (index === -1) return gaugeTemplates[step === 1 ? 0 : count - 1]
  return gaugeTemplates[(index + step + count) % count]
}

export const TemplatePicker = ({
  selected,
  onSelect,
  className,
}: {
  selected: GaugeTemplate | null
  onSelect: (template: GaugeTemplate) => void
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement) {
        const typing = target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT"
        if (typing) return
      }
      const step = event.key === "]" || event.key === "ArrowRight" ? 1 : event.key === "[" || event.key === "ArrowLeft" ? -1 : 0
      if (!step) return
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && document.activeElement !== document.body) return
      event.preventDefault()
      onSelect(templateFrom(selected, step))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onSelect, selected])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" className={cn("min-w-0 max-w-full", className)} data-template-nav>
          <span className="truncate">{selected ? selected.name : "Templates"}</span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-[min(32rem,70vh)] w-[min(40rem,calc(100vw-1.5rem))] gap-3 overflow-y-auto bg-card p-3">
        <PopoverHeader>
          <PopoverTitle className="text-sm">Start from a template</PopoverTitle>
        </PopoverHeader>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {gaugeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={template.id === selected?.id}
              onSelect={() => {
                onSelect(template)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const TemplateCard = ({
  template,
  selected,
  onSelect,
}: {
  template: GaugeTemplate
  selected: boolean
  onSelect: () => void
}) => {
  const { spec, value } = useMemo(() => templatePreview(template), [template])
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-1.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40",
        selected && "bg-accent ring-1 ring-foreground/10"
      )}
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-background p-2">
        <GaugeComposition spec={spec} value={value} label={template.name} />
      </div>
      <div className="px-1 pb-0.5 text-center text-xs font-medium">{template.name}</div>
    </button>
  )
}
