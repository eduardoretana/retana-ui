import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Llamada a la acción",
  description: "Tres formas de invitar, y un aviso que se puede cerrar.",
}

export default function CtaSectionPage() {
  return (
    <ExampleFrame title="Llamada a la acción" description="Una sección centrada, un lado con el alta del taller, y un aviso que se cierra.">
      <Demo />
    </ExampleFrame>
  )
}
