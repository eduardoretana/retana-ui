"use client"

import { projectFields, projectViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewGroupedList } from "@/registry/ui/view-grouped-list"

export default function ViewGroupedListStressPage() {
  return (
    <StressShell title="Grouped list stress" kind="projects">
      {(records) => (
        <ViewGroupedList records={records} fields={projectFields} config={projectViews[0]!} locale="es-MX" />
      )}
    </StressShell>
  )
}
