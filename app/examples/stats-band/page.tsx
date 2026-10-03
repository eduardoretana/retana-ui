import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Banda de cifras",
  description: "Los números cuentan al entrar en pantalla.",
}

export default function StatsBandPage() {
  return (
    <ExampleFrame title="Banda de cifras" description="Al entrar, cada cifra cuenta hasta su valor. El foco o el cursor cambia la línea de contexto.">
      <Demo />
    </ExampleFrame>
  )
}
