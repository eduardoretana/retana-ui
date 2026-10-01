import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Botón de acción",
  description: "Ejecuta una acción y confirma en el mismo botón.",
}

export default function ActionButtonPage() {
  return (
    <ExampleFrame title="Botón de acción" description="El texto y el icono cambian mientras guarda, y el ancho acompaña.">
      <Demo />
    </ExampleFrame>
  )
}
