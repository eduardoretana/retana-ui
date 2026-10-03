"use client"

import { ExampleFrame } from "@/app/examples/example-frame"
import { opportunities, opportunityFields } from "@/app/examples/multi-view/data"
import {
  filterRecords,
  formatCurrency,
  formatDateLabel,
  monthGrid,
  searchRecords,
} from "@/registry/lib/multi-view"

export function MultiViewCoreDemo() {
  const found = searchRecords(opportunities, opportunityFields, "bruma", "es-MX")
  const open = filterRecords(found, opportunityFields, [
    { id: "stage", field: "stage", op: "is", value: "proposal" },
  ])
  const days = monthGrid(2026, 3, 1).filter((day) => day.inMonth).length
  return (
    <ExampleFrame title="Multi-view core" description="Formato, búsqueda y la cuadrícula del mes, sin interfaz.">
      <ul className="grid gap-2 text-sm">
        <li>en-US {formatCurrency(42000, "en-US")}</li>
        <li>es-MX {formatCurrency(42000, "es-MX")}</li>
        <li>{formatDateLabel("2026-04-16", "es-MX")}</li>
        <li>{open.length} match · {days} days in April</li>
      </ul>
    </ExampleFrame>
  )
}
