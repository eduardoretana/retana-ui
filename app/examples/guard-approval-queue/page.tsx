import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cola de aprobaciones",
  description: "Pendiente, aprobada, rechazada o vencida. Un lector no decide.",
}

export default function Page() {
  return (
    <ExampleFrame title="Cola de aprobaciones" description="Datos ficticios. Una aprobación vencida no se puede aprobar.">
      <Demo />
    </ExampleFrame>
  )
}
