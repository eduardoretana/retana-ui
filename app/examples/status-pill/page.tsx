import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { StatusPillDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Pastilla de estado",
  description: "Un tono, un punto y una etiqueta que tú escribes.",
}

export default function Page() {
  return (
    <ExampleFrame title="Pastilla de estado" description="Un tono, un punto y una etiqueta que tú escribes.">
      <Demo />
    </ExampleFrame>
  )
}
