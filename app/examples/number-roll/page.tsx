import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rodillo numérico",
  description: "El entero y los decimales ruedan por separado, solo con transform y opacidad.",
}

export default function NumberRollPage() {
  return (
    <ExampleFrame title="Rodillo numérico" description="La fracción es más chica. El lector de pantalla oye la cifra completa.">
      <Demo />
    </ExampleFrame>
  )
}
