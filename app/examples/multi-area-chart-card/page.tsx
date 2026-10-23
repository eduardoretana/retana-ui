import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Áreas con degradado",
  description: "Varias series como áreas con degradado y leyenda que las oculta o muestra.",
}

export default function Page() {
  return (
    <ExampleFrame title="Áreas con degradado" description="Varias series como áreas con degradado y leyenda que las oculta o muestra.">
      <Demo />
    </ExampleFrame>
  )
}
