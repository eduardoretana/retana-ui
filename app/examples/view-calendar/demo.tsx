"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { ViewCalendar } from "@/registry/ui/view-calendar"

export function ViewCalendarDemo() {
  const [records, setRecords] = React.useState<MultiRecord[]>(opportunities)
  return (
    <ExampleFrame wide title="Calendar view" description="Mes con lunes primero. Arrastra una ficha o usa Alt y las flechas.">
      <ViewCalendar
        records={records}
        fields={opportunityFields}
        config={opportunityViews[2]!}
        locale="es-MX"
        today="2026-04-03"
        onMove={async (id, patch) => {
          setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)))
        }}
      />
    </ExampleFrame>
  )
}
