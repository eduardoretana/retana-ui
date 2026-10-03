"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { ViewKanban } from "@/registry/ui/view-kanban"

export function ViewKanbanDemo() {
  const [records, setRecords] = React.useState<MultiRecord[]>(opportunities)
  return (
    <ExampleFrame wide title="Kanban view" description="Columnas desde el campo de etapa. Arrastra o usa Mover a.">
      <ViewKanban
        records={records}
        fields={opportunityFields}
        config={opportunityViews[1]!}
        locale="es-MX"
        onMove={async (id, patch) => {
          setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
      />
    </ExampleFrame>
  )
}
