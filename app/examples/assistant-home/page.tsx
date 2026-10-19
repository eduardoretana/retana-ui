import type { Metadata } from "next"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Inicio del asistente",
  description: "Saludo, prompt con complementos y modelo, aplicaciones y acciones.",
}

export default function ExamplePage() {
  return <Demo />
}
