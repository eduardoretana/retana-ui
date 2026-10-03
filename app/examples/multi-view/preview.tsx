"use client"

import { MultiView } from "@/registry/blocks/multi-view"
import { opportunities, opportunityFields, opportunityViews } from "./data"

export default function MultiViewPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <MultiView
        title="Opportunities"
        records={opportunities.slice(0, 4)}
        fields={opportunityFields}
        views={opportunityViews}
        locale="es-MX"
        today="2026-04-03"
      />
    </div>
  )
}
