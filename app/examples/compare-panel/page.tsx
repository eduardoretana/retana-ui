import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Panel de comparación",
  description: "Dos columnas. Una fila puede marcarse como nueva.",
}

export default function Page() {
  return (
    <ExampleFrame title="Panel de comparación" description="Dos columnas. Una fila puede marcarse como nueva.">
      <Demo />
    </ExampleFrame>
  )
}
