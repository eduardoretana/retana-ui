import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto que aparece",
  description: "Cada palabra sube al montarse, o se aclara con el scroll.",
}

export default function Page() {
  return (
    <ExampleFrame title="Texto que aparece" description="Al montarse, cada palabra sube una vez. Con trigger scroll, la opacidad sigue el avance. Un salto de línea parte el texto.">
      <Demo />
    </ExampleFrame>
  )
}
