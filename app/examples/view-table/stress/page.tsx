"use client"

import { opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewTable } from "@/registry/ui/view-table"

export default function ViewTableStressPage() {
  return (
    <StressShell title="Table view stress" kind="opportunities">
      {(records) => (
        <ViewTable records={records} fields={opportunityFields} config={opportunityViews[0]} locale="es-MX" />
      )}
    </StressShell>
  )
}
