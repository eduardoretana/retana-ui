import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { CaseDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Revisión de caso",
  description: "Expediente, sugerencia y desglose.",
}

export default function Page() {
  return (
    <ExampleFrame title="Revisión de caso" description="Expediente, sugerencia y desglose." wide>
      <Demo />
    </ExampleFrame>
  )
}
