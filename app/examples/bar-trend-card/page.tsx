import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barras por mes",
  description: "Barras que crecen desde abajo, selector de periodo y la última barra con el acento.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barras por mes" description="Barras que crecen desde abajo, selector de periodo y la última barra con el acento.">
      <Demo />
    </ExampleFrame>
  )
}
