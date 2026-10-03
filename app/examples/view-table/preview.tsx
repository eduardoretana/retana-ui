"use client"

import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { ViewTable } from "@/registry/ui/view-table"

export default function ViewTablePreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewTable records={opportunities.slice(0, 3)} fields={opportunityFields} config={opportunityViews[0]} locale="en-US" />
    </div>
  )
}
