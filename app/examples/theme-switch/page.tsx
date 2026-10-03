import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Interruptor de tema",
  description: "Cuatro transiciones entre claro y oscuro, con View Transitions y un respaldo inmediato.",
}

export default function ThemeSwitchPage() {
  return (
    <ExampleFrame
      title="Interruptor de tema"
      description="Elige fade, eclipse, split o rise. Si el navegador no anima, el tema cambia igual."
    >
      <Demo />
    </ExampleFrame>
  )
}
