import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Menú de comandos",
  description: "Paleta que busca empresas y las lista en una tabla compacta.",
}

export default function CrmCommandMenuPage() {
  return (
    <ExampleFrame
      title="Menú de comandos"
      description="⌘K busca en la cartera y muestra nombre, estado, responsable y valor. command-palette sigue siendo la lista de comandos sueltos."
    >
      <Demo />
    </ExampleFrame>
  )
}
