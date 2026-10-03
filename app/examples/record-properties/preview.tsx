"use client"

import { opportunities, opportunityFields } from "@/app/examples/multi-view/data"
import { RecordProperties } from "@/registry/ui/record-properties"

export default function RecordPropertiesPreview() {
  return (
    <div className="h-full overflow-auto bg-background p-3">
      <RecordProperties record={opportunities[0]!} fields={opportunityFields} locale="es-MX" />
    </div>
  )
}
