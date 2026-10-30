import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Área polar",
  description: "La leyenda cambia la serie y el valor del centro.",
}

export default function Page() {
  return (
    <ExampleFrame title="Área polar" description="La leyenda cambia la serie y el valor del centro.">
      <Demo />
    </ExampleFrame>
  )
}
