import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Periodo de cobro",
  description: "El pulgar se desliza y el precio rueda al cambiar de periodo.",
}

export default function BillingTogglePage() {
  return (
    <ExampleFrame title="Periodo de cobro" description="Un pulgar recorre mes y año. El ahorro se reescribe y el precio gira en su sitio.">
      <Demo />
    </ExampleFrame>
  )
}
