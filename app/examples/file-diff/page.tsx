import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Vista de diff",
  description: "Diff unificado con altas, bajas y bloques sin cambios colapsados.",
}

export default function FileDiffPage() {
  return (
    <ExampleFrame title="Vista de diff" description="Las líneas agregadas y eliminadas quedan marcadas. Un bloque largo sin cambios se puede abrir.">
      <Demo />
    </ExampleFrame>
  )
}
