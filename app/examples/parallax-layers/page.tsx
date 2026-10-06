import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Capas en paralaje",
  description: "Cada capa se mueve a una velocidad distinta.",
}

export default function Page() {
  return (
    <ExampleFrame title="Capas en paralaje" description="Solo transform. Si el movimiento está reducido, las capas se quedan quietas.">
      <Demo />
    </ExampleFrame>
  )
}
