import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Entrada de etiquetas",
  description: "Palabras que entran en el campo y se quitan con retroceso.",
}

export default function TagInputPage() {
  return (
    <ExampleFrame title="Entrada de etiquetas" description="Una etiqueta nueva aparece donde se escribió. Retroceso la elige y el siguiente la quita.">
      <Demo />
    </ExampleFrame>
  )
}
