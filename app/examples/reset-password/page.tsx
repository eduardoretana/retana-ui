import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Contraseña nueva, confirmación y enlace vencido.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Restablecer contraseña"
      description="La fortaleza y la confirmación viven en la misma tarjeta. Un enlace inválido o vencido pide otro, sin hablar de la cuenta."
    >
      <Demo />
    </ExampleFrame>
  )
}
