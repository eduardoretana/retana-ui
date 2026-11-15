import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Hero con view-timeline",
  description: "El titular se separa mientras el hero sale. Timeline con nombre y rango exit. CSS puro.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Hero con view-timeline"
      description="El hero nombra su timeline y el titular se abre hacia los lados al salir. Nunca entra animado: el titular pinta completo al cargar."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
