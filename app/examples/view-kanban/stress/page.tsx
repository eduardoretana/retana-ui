"use client"

import { opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewKanban } from "@/registry/ui/view-kanban"

export default function ViewKanbanStressPage() {
  return (
    <StressShell title="Kanban view stress" kind="opportunities">
      {(records) => (
        <ViewKanban records={records} fields={opportunityFields} config={opportunityViews[1]!} locale="es-MX" />
      )}
    </StressShell>
  )
}
