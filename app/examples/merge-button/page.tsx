import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Botón de fusión",
  description: "Se habilita cuando pasan las comprobaciones y pide confirmación antes de fusionar.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      title="Botón de fusión"
      description="El primer clic pide confirmación. Sin esa confirmación no hay fusión. El rechazo de la rama se lee en texto."
    >
      <Demo />
    </ExampleFrame>
  )
}
