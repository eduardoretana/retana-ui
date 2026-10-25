import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { TooltipCardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta flotante",
  description: "Tarjeta con personas, métricas y acciones. Datos inventados.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta flotante" description="No es un tooltip de una línea. Pasa el puntero o enfoca el botón, y Tab entra a la acción.">
      <TooltipCardDemo />
    </ExampleFrame>
  )
}
