import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Firma",
  description: "Tinta con deshacer, reproducción y exportación.",
}

export default function SignaturePadPage() {
  return (
    <ExampleFrame title="Firma" description="La tinta sigue el puntero. Se puede deshacer, rehacer, reproducir y guardar como PNG o SVG.">
      <Demo />
    </ExampleFrame>
  )
}
