import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Núcleo de costo",
  description: "Precios, agregados y ahorro de caché de una corrida de ejemplo, sin la cascada.",
}

export default function Page() {
  return (
    <ExampleFrame title="Núcleo de costo" description="El mismo cálculo que usa la cascada. Los precios son de ejemplo.">
      <Demo />
    </ExampleFrame>
  )
}
