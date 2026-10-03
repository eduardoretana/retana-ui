"use client"

import * as React from "react"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunities, opportunityFields } from "@/app/examples/multi-view/data"
import type { MultiRecord } from "@/registry/lib/multi-view"
import { RecordProperties } from "@/registry/ui/record-properties"

export function RecordPropertiesDemo() {
  const [record, setRecord] = React.useState<MultiRecord>(opportunities[0]!)
  return (
    <ExampleFrame title="Record properties" description="Filas editables a partir del esquema. Enter guarda, Escape cancela.">
      <RecordProperties
        record={record}
        fields={opportunityFields}
        locale="es-MX"
        onChange={async (_id, patch) => {
          setRecord((current) => ({ ...current, ...patch }))
        }}
      />
    </ExampleFrame>
  )
}
