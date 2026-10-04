import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { AttentionDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Lista de atención",
  description: "Lo que pide una decisión, con fichas.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lista de atención" description="Lo que pide una decisión, con fichas.">
      <Demo />
    </ExampleFrame>
  )
}
