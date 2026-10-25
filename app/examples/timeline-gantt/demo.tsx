"use client"

import { useState } from "react"
import { toast } from "sonner"

import { TimelineGantt } from "@/registry/ui/timeline-gantt"
import { timelineGanttLabelsEn, type GanttScale } from "@/registry/lib/timeline-gantt"

import { demoItems, demoNow, demoWorkstreams } from "../portfolio-desk/data"

export function TimelineGanttDemo({ chrome = true }: { chrome?: boolean }) {
  const [scale, setScale] = useState<GanttScale>("week")
  const [english, setEnglish] = useState(false)
  const [selected, setSelected] = useState("catalogo")

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {chrome ? (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="rounded-md border border-border px-2 py-1 text-xs" aria-pressed={english} onClick={() => setEnglish((value) => !value)}>
            {english ? "ES" : "EN"}
          </button>
          <p className="text-xs text-muted-foreground">Seleccionado: {selected}</p>
        </div>
      ) : null}
      <TimelineGantt
        className="min-h-0 flex-1"
        items={demoItems}
        workstreams={demoWorkstreams}
        scale={scale}
        onScaleChange={setScale}
        now={demoNow}
        selectedId={selected}
        labels={english ? timelineGanttLabelsEn : undefined}
        onSelect={(item) => {
          setSelected(item.id)
          toast(`El anfitrión abriría ${item.label}`)
        }}
        onHover={(item) => {
          if (item) setSelected(item.id)
        }}
      />
    </div>
  )
}
