import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Acciones al deslizar",
  description: "Filas que revelan acciones al deslizar, con el mismo menú para el teclado.",
}

export default function SwipeActionsPage() {
  return (
    <ExampleFrame title="Acciones al deslizar" description="Desliza la fila o abre Más acciones. Archivar deja la nota; borrar la quita.">
      <Demo />
    </ExampleFrame>
  )
}
