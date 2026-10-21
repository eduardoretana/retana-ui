import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { VitalSignsDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Signos vitales",
  description: "FC, presión, SpO₂ y temperatura, cada uno marcado contra rangos que puedes ajustar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Signos vitales" description="FC, presión, SpO₂ y temperatura, cada uno marcado contra rangos que puedes ajustar." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
