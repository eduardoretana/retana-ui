import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de métrica con minigráfico",
  description: "Número grande, etiqueta tenue, cambio arriba o abajo y una línea que se dibuja al entrar.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de métrica con minigráfico" description="Número grande, etiqueta tenue, cambio arriba o abajo y una línea que se dibuja al entrar.">
      <Demo />
    </ExampleFrame>
  )
}
