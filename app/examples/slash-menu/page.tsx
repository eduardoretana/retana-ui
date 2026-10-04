import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Menú de barras",
  description: "Un menú de comandos con barra, anclado a un área de texto.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Menú de barras" description="Un menú de comandos con barra, anclado a un área de texto.">
      <Demo />
    </ExampleFrame>
  )
}
