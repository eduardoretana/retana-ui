import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Comando de instalación",
  description: "Pestañas de gestor que reescriben un comando y lo copian.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Comando de instalación" description="Pestañas de gestor que reescriben un comando y lo copian.">
      <Demo />
    </ExampleFrame>
  )
}
