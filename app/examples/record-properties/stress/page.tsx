"use client"

import { opportunityFields } from "@/app/examples/multi-view/data"
import { StressShell } from "@/app/examples/multi-view/stress-shell"
import { RecordProperties } from "@/registry/ui/record-properties"

export default function RecordPropertiesStressPage() {
  return (
    <StressShell title="Record properties stress" kind="opportunities">
      {(records) => (
        <RecordProperties record={records[0] ?? { id: "empty", name: "" }} fields={opportunityFields} locale="es-MX" />
      )}
    </StressShell>
  )
}
