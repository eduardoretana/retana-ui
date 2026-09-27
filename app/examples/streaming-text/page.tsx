import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Texto en streaming",
  description: "Texto que llega por partes, con cursor y markdown básico.",
}

export default function StreamingTextPage() {
  return (
    <ExampleFrame title="Texto en streaming" description="El cursor acompaña al texto mientras llega. El markdown básico se pinta al vuelo.">
      <Demo />
    </ExampleFrame>
  )
}
