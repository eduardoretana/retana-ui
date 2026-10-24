import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkTableQueue } from "@/registry/blocks/work-table-queue"

export const metadata: Metadata = {
  title: "Cola con ranking",
  description: "Cola plana cuyo rango sigue el orden manual.",
}

export default function WorkTableQueuePage() {
  return (
    <ExampleFrame
      wide
      title="Cola con ranking"
      description="Cola plana. El rango se recalcula al mover una fila. La paginación queda abajo, con filas por página."
    >
      <WorkTableQueue />
    </ExampleFrame>
  )
}
