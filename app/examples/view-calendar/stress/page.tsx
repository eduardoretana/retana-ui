"use client"

import { opportunityFields, opportunityViews } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { ViewCalendar } from "@/registry/ui/view-calendar"

export default function ViewCalendarStressPage() {
  return (
    <StressShell title="Calendar view stress" kind="opportunities">
      {(records) => (
        <ViewCalendar records={records} fields={opportunityFields} config={opportunityViews[2]!} locale="es-MX" today="2026-04-03" />
      )}
    </StressShell>
  )
}
