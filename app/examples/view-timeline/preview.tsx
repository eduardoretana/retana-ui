"use client"

import { projectFields, projectViews, projects } from "@/app/examples/multi-view/data"
import { ViewTimeline } from "@/registry/ui/view-timeline"

export default function ViewTimelinePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewTimeline records={projects} fields={projectFields} config={projectViews[2]!} locale="es-MX" today="2026-04-03" zoom="month" />
    </div>
  )
}
