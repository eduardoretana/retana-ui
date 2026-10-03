import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Indicador de escritura",
  description: "Aviso en vivo de quién está escribiendo.",
}

export default function TypingIndicatorPage() {
  return (
    <ExampleFrame title="Indicador de escritura" description="Priya ya escribe. El campo propio se apaga un segundo después de la última tecla.">
      <Demo />
    </ExampleFrame>
  )
}
