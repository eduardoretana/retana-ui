import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mosaico de controles",
  description: "La ficha destacada usa el acento del anfitrión.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mosaico de controles" description="La ficha destacada usa el acento del anfitrión.">
      <Demo />
    </ExampleFrame>
  )
}
