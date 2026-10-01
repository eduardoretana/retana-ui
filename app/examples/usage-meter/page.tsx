import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Medidor de uso",
  description: "El cupo, lo que lo ocupa y lo que queda libre.",
}

export default function UsageMeterPage() {
  return (
    <ExampleFrame title="Medidor de uso" description="Cada categoría se puede fijar con el teclado y el aviso aparece al acercarse al límite.">
      <Demo />
    </ExampleFrame>
  )
}
