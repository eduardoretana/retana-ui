"use client"

import { projectFields, projectViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewTimeline } from "@/registry/ui/view-timeline"

export default function ViewTimelineStressPage() {
  return (
    <StressShell title="Timeline view stress" kind="projects">
      {(records) => (
        <ViewTimeline records={records} fields={projectFields} config={projectViews[2]!} locale="es-MX" today="2026-04-03" />
      )}
    </StressShell>
  )
}
