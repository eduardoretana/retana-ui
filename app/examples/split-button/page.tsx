import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Botón dividido",
  description: "Acción principal y menú de más acciones.",
}

export default function SplitButtonPage() {
  return (
    <ExampleFrame title="Botón dividido" description="La mitad principal actúa. La otra abre el menú sin mover el ancla.">
      <Demo />
    </ExampleFrame>
  )
}
