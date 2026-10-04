import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { RankedDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Barras ordenadas",
  description: "Participaciones ordenadas de mayor a menor.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barras ordenadas" description="Participaciones ordenadas de mayor a menor.">
      <Demo />
    </ExampleFrame>
  )
}
