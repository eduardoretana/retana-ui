import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ventana de contexto",
  description: "Archivos y charla dentro de la ventana de 24 000 tokens.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Ventana de contexto"
      description="Quita un archivo o compacta la charla. En Error, el primer quitar se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
