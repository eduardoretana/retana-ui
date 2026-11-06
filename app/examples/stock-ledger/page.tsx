import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Libro de inventario",
  description: "Saldo corriente por SKU y almacén, con ajuste y transferencia.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Libro de inventario"
      description="El saldo se calcula por SKU y almacén. El signo se lee en palabras."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
