import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Línea de tiempo del arreglo",
  description: "Diagnóstico, archivos, edición, pruebas y empuje, contados por el anfitrión.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      title="Línea de tiempo del arreglo"
      description="La pieza no tiene agente. Solo muestra los pasos que le pasan."
    >
      <Demo />
    </ExampleFrame>
  )
}
