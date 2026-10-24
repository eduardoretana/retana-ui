import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { AnatomyTreeDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Árbol anatómico",
  description: "Busca, selecciona y oculta estructuras en una jerarquía anatómica, con teclado completo.",
}

export default function Page() {
  return (
    <ExampleFrame title="Árbol anatómico" description="Busca, selecciona y oculta estructuras en una jerarquía anatómica, con teclado completo." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
