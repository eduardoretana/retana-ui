import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Corrida de agente",
  description: "Plan, actividad, pregunta pendiente, diff y costo.",
}

export default function ExamplePage() {
  return <Demo />
}
