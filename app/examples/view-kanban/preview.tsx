"use client"

import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { ViewKanban } from "@/registry/ui/view-kanban"

export default function ViewKanbanPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewKanban records={opportunities.slice(0, 4)} fields={opportunityFields} config={opportunityViews[1]!} locale="es-MX" />
    </div>
  )
}
