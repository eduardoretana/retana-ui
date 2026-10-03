"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { projectFields, projectViews, projects } from "@/app/examples/multi-view/data"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { ViewTimeline } from "@/registry/ui/view-timeline"

export function ViewTimelineDemo() {
  const [records, setRecords] = React.useState<MultiRecord[]>(projects)
  return (
    <ExampleFrame wide title="Timeline view" description="Barras con inicio y fin. Las flechas mueven; Shift y flechas cambian el fin.">
      <ViewTimeline
        records={records}
        fields={projectFields}
        config={projectViews[2]!}
        locale="es-MX"
        today="2026-04-03"
        onMove={async (id, patch) => {
          setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
      />
    </ExampleFrame>
  )
}
