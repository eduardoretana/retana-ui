import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Deslizador",
  description: "Un deslizador con etiqueta, valor en vivo y reinicio.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Deslizador" description="Un deslizador con etiqueta, valor en vivo y reinicio.">
      <Demo />
    </ExampleFrame>
  )
}
