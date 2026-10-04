import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { BreakdownDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Barra de desglose",
  description: "Un total y sus partes.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barra de desglose" description="Un total y sus partes.">
      <Demo />
    </ExampleFrame>
  )
}
