import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barras y línea",
  description: "El aviso trae un mini gráfico. La unidad reanima las barras.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barras y línea" description="El aviso trae un mini gráfico. La unidad reanima las barras.">
      <Demo />
    </ExampleFrame>
  )
}
