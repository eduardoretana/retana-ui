import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto que aparece",
  description: "Cada palabra sube una vez al montarse. Un salto de línea parte el texto.",
}

export default function Page() {
  return (
    <ExampleFrame title="Texto que aparece" description="Cada palabra sube una vez al montarse. Un salto de línea parte el texto.">
      <Demo />
    </ExampleFrame>
  )
}
