import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Búsqueda expansible",
  description: "Un botón que se abre en un campo con resultados.",
}

export default function ExpandingSearchPage() {
  return (
    <ExampleFrame title="Búsqueda expansible" description="El botón crece hasta el campo. Las flechas recorren los resultados y Escape lo pliega.">
      <Demo />
    </ExampleFrame>
  )
}
