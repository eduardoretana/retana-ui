import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { InlineApproveButtonDemo } from "./demo"

export const metadata: Metadata = {
  title: "Aprobar en el sitio",
  description: "El botón pasa de primario a aprobado sin recargar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Aprobar en el sitio" description="El primero confirma y queda en éxito. El segundo falla una vez y el reintento cierra.">
      <InlineApproveButtonDemo />
    </ExampleFrame>
  )
}
