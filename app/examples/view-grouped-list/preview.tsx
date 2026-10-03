"use client"

import { projectFields, projectViews, projects } from "@/app/examples/multi-view/data"
import { ViewGroupedList } from "@/registry/ui/view-grouped-list"

export default function ViewGroupedListPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewGroupedList records={projects} fields={projectFields} config={projectViews[0]!} locale="es-MX" />
    </div>
  )
}
