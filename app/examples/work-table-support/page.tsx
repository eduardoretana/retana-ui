import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkTableSupport } from "@/registry/blocks/work-table-support"

export const metadata: Metadata = {
  title: "Cola de soporte",
  description: "Cola de soporte con SLA y movimiento en bloque.",
}

export default function WorkTableSupportPage() {
  return (
    <ExampleFrame
      wide
      title="Cola de soporte"
      description="Cola de encargos con SLA vencido o horas restantes. La selección mueve varias filas a la vez."
    >
      <WorkTableSupport />
    </ExampleFrame>
  )
}
