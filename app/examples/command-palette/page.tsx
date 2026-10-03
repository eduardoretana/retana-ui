import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Paleta de comandos",
  description: "Busca una acción y elígela con el teclado.",
}

export default function CommandPalettePage() {
  return (
    <ExampleFrame title="Paleta de comandos" description="Escribe para filtrar. Enter elige el comando resaltado.">
      <Demo />
    </ExampleFrame>
  )
}
