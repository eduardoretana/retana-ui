import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Caja",
  description: "Resumen del pedido, envío, pago y cupón. Sin pasarela.",
}

export default function Page() {
  return (
    <ExampleFrame
      size="wide"
      title="Caja"
      description="Una página, dos columnas o acordeón. El cupón inválido no mueve el total. En 390 px las dos columnas abren el resumen abajo."
    >
      <Demo />
    </ExampleFrame>
  )
}
