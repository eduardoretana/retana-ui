import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { StressDemo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa de cupos · estrés",
  description: "Quinientos cupos y nombres largos.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mapa de cupos · estrés" description="Quinientos cupos en diez zonas, con el primer grupo abierto." size="desk">
      <StressDemo />
    </ExampleFrame>
  )
}
