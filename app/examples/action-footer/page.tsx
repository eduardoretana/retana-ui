import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ActionFooterDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Pie de acción",
  description: "Una pista y dos acciones que cambian con el estado.",
}

export default function Page() {
  return (
    <ExampleFrame title="Pie de acción" description="Una pista y dos acciones que cambian con el estado.">
      <Demo />
    </ExampleFrame>
  )
}
