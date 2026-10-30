import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Matriz de puntos",
  description: "Cada punto es una parte. El aviso muestra el acumulado.",
}

export default function Page() {
  return (
    <ExampleFrame title="Matriz de puntos" description="Cada punto es una parte. El aviso muestra el acumulado.">
      <Demo />
    </ExampleFrame>
  )
}
