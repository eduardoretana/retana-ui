import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de plan",
  description: "Plan propuesto con aprobar, editar y rechazar.",
}

export default function PlanCardPage() {
  return (
    <ExampleFrame title="Tarjeta de plan" description="El agente propone pasos. Se pueden editar, aprobar o rechazar.">
      <Demo />
    </ExampleFrame>
  )
}
