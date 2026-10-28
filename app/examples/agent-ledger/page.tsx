import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Libro de cambios",
  description: "Cambios que un agente ya hizo, con lo que se puede deshacer y lo que se queda.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Libro de cambios"
      description="Apunta a Deshacer para ver la cadena. El primer deshacer en Cadena se revierte."
    >
      <Demo />
    </ExampleFrame>
  )
}
