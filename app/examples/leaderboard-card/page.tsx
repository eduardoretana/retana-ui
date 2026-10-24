import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ranking de asesores",
  description: "Ranking ordenado por puntos con lugar, región y la fila propia marcada.",
}

export default function Page() {
  return (
    <ExampleFrame title="Ranking de asesores" description="Ranking ordenado por puntos con lugar, región y la fila propia marcada.">
      <Demo />
    </ExampleFrame>
  )
}
