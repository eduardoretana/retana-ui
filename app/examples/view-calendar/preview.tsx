"use client"

import { opportunities, opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { ViewCalendar } from "@/registry/ui/view-calendar"

export default function ViewCalendarPreview() {
  return (
    <div className="h-full overflow-hidden bg-background p-2">
      <ViewCalendar records={opportunities} fields={opportunityFields} config={opportunityViews[2]!} locale="es-MX" today="2026-04-03" />
    </div>
  )
}
